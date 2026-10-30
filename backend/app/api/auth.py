# backend/app/api/auth.py
import logging
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, status
from ..models.schemas import UserLogin, UserRegister, TokenResponse
from ..core.config import settings
from ..core.security import create_access_token, get_current_user, CurrentUser
from ..core.database import supabase, supabase_admin

logger = logging.getLogger("medinest.auth")
router = APIRouter(prefix="/api/auth", tags=["Authentication"])

ALLOWED_ROLES = {"patient", "doctor", "hospital_admin", "asha"}

# Authoritative mock profile store for isolated development/test mode.
# In production, authoritative roles are queried strictly from public.users table.
DEV_MOCK_PROFILES: Dict[str, Dict[str, Any]] = {
    "patient.ramesh@example.com": {
        "id": "pat-001",
        "role": "patient",
        "name": "Ramesh Kumar",
        "email": "patient.ramesh@example.com"
    },
    "patient.sunita@example.com": {
        "id": "pat-002",
        "role": "patient",
        "name": "Sunita Devi",
        "email": "patient.sunita@example.com"
    },
    "doctor@medinest.gov.in": {
        "id": "doc-001",
        "role": "doctor",
        "name": "Dr. Rajesh Sharma",
        "email": "doctor@medinest.gov.in"
    },
    "asha@medinest.gov.in": {
        "id": "asha-001",
        "role": "asha",
        "name": "Sangeeta Patel",
        "email": "asha@medinest.gov.in"
    },
    "admin@medinest.gov.in": {
        "id": "admin-001",
        "role": "hospital_admin",
        "name": "Hospital Admin",
        "email": "admin@medinest.gov.in"
    },
    "invalid.role@example.com": {
        "id": "usr-inv",
        "role": "superadmin",
        "name": "Invalid User",
        "email": "invalid.role@example.com"
    }
}


@router.post("/register", response_model=TokenResponse)
async def register(user: UserRegister):
    """
    Register a new MediNest user.

    Security Policy:
    Normal public self-registration defaults strictly to the 'patient' role.
    Privileged roles (doctor, asha, hospital_admin) cannot be self-granted and
    require formal administrator provisioning.
    """
    clean_email = user.email.lower().strip()
    requested_role = (user.role or "patient").lower().strip()
    assigned_role = "patient"

    if not supabase_admin:
        user_id = f"usr-{clean_email.split('@')[0]}"
        # Ensure registration creates a valid patient profile in the store before login is permitted
        DEV_MOCK_PROFILES[clean_email] = {
            "id": user_id,
            "role": assigned_role,
            "name": user.name,
            "email": user.email
        }
        access_token = create_access_token(
            data={
                "sub": user_id,
                "role": assigned_role,
                "email": user.email,
                "name": user.name
            }
        )
        return TokenResponse(
            access_token=access_token,
            user_id=user_id,
            role=assigned_role,
            name=user.name
        )

    try:
        # Record requested_role in metadata for audit/provisioning, but assign patient actively
        auth_response = supabase_admin.auth.admin.create_user({
            "email": user.email,
            "password": user.password,
            "email_confirm": True,
            "user_metadata": {
                "name": user.name,
                "role": assigned_role,
                "requested_role": requested_role
            }
        })

        if not auth_response.user:
            raise HTTPException(
                status_code=400,
                detail="Supabase user creation failed."
            )

        user_id = str(auth_response.user.id)

        # Authoritative application profile in public.users
        profile_data = {
            "id": user_id,
            "email": user.email,
            "name": user.name,
            "role": assigned_role
        }

        profile_response = (
            supabase_admin
            .table("users")
            .insert(profile_data)
            .execute()
        )

        if not profile_response.data:
            try:
                supabase_admin.auth.admin.delete_user(user_id)
            except Exception:
                pass

            raise HTTPException(
                status_code=500,
                detail="User account initialized, but profile creation failed."
            )

        access_token = create_access_token(
            data={
                "sub": user_id,
                "role": assigned_role,
                "email": user.email,
                "name": user.name
            }
        )

        return TokenResponse(
            access_token=access_token,
            user_id=user_id,
            role=assigned_role,
            name=user.name
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration failed: {type(e).__name__}")
        if settings.ENVIRONMENT.lower() == "production":
            raise HTTPException(
                status_code=400,
                detail="Registration request failed. Please check your credentials and try again."
            )
        # Development fallback
        logger.warning("Supabase unreachable; issuing development patient profile and session.")
        user_id = f"usr-{clean_email.split('@')[0]}"
        DEV_MOCK_PROFILES[clean_email] = {
            "id": user_id,
            "role": assigned_role,
            "name": user.name,
            "email": user.email
        }
        access_token = create_access_token(
            data={
                "sub": user_id,
                "role": assigned_role,
                "email": user.email,
                "name": user.name
            }
        )
        return TokenResponse(
            access_token=access_token,
            user_id=user_id,
            role=assigned_role,
            name=user.name
        )


@router.post("/login", response_model=TokenResponse)
async def login(user: UserLogin):
    """
    Login an existing MediNest user.

    Strict Fail-Closed Enforcement:
    1. Active authorization roles come exclusively from the authoritative public.users profile.
    2. Never trust user_metadata.role for authorization.
    3. Never automatically grant a patient role when the application profile is missing.
    4. If a profile does not exist, reject login without issuing an application JWT (HTTP 403).
    5. If the database lookup fails because database is unavailable, return HTTP 503 without issuing a JWT.
    6. Reject invalid or unsupported role values (HTTP 403).
    7. Preserve legitimate patient and administratively provisioned privileged accounts.
    8. Development mock accounts available only through explicit isolated dev configuration; never in production.
    """
    clean_email = user.email.lower().strip()

    # Reject demo identities in production
    if settings.ENVIRONMENT.lower() == "production" and not supabase:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service is unavailable in production."
        )

    # Isolated development/test mode without live Supabase
    if not supabase:
        profile = DEV_MOCK_PROFILES.get(clean_email)
        if not profile:
            logger.warning(f"Login rejected: No authoritative profile found for {clean_email}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Application profile not found. Please complete registration or contact an administrator."
            )
        role = profile.get("role")
        if not role or role not in ALLOWED_ROLES:
            logger.warning(f"Login rejected: Invalid role '{role}' for {clean_email}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Invalid account profile: unsupported role '{role}'."
            )
        user_id = profile.get("id") or f"usr-{clean_email.split('@')[0]}"
        name = profile.get("name") or clean_email.split("@")[0].capitalize()

        access_token = create_access_token(
            data={
                "sub": user_id,
                "role": role,
                "email": user.email,
                "name": name
            }
        )
        return TokenResponse(
            access_token=access_token,
            user_id=user_id,
            role=role,
            name=name
        )

    # Live Supabase Authentication
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": user.email,
            "password": user.password
        })
        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Authentication failure: {type(e).__name__}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    user_id = str(auth_response.user.id)
    db = supabase_admin or supabase

    # Authoritative Database Profile Lookup
    try:
        user_data = (
            db.table("users")
            .select("id, role, name, email")
            .eq("id", user_id)
            .execute()
        )
    except Exception as e:
        logger.error(f"Database error querying authoritative profile for {user_id}: {type(e).__name__}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service is temporarily unavailable. Please try again later."
        )

    if not user_data.data or len(user_data.data) == 0:
        logger.warning(f"Login rejected: No authoritative profile found in public.users for {user_id}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Application profile not found. Please complete registration or contact an administrator."
        )

    profile = user_data.data[0]
    raw_role = profile.get("role")
    if not raw_role or not isinstance(raw_role, str):
        logger.warning(f"Login rejected: Missing role attribute for {user_id}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid account profile: missing role attribute."
        )

    verified_role = raw_role.lower().strip()
    if verified_role not in ALLOWED_ROLES:
        logger.warning(f"Login rejected: Invalid role '{verified_role}' for {user_id}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Invalid account profile: unsupported role '{verified_role}'."
        )

    name = profile.get("name")
    if not name and auth_response.user.user_metadata:
        name = auth_response.user.user_metadata.get("name")
    if not name:
        name = user.email.split("@")[0]

    access_token = create_access_token(
        data={
            "sub": user_id,
            "role": verified_role,
            "email": user.email,
            "name": name
        }
    )

    return TokenResponse(
        access_token=access_token,
        user_id=user_id,
        role=verified_role,
        name=name
    )


@router.get("/me")
async def get_current_user_profile(
    current_user: CurrentUser = Depends(get_current_user)
):
    """Return verified user context from token claims"""
    return {
        "user_id": current_user.id,
        "id": current_user.id,
        "role": current_user.role,
        "email": current_user.email,
        "name": current_user.name
    }


@router.post("/logout")
async def logout():
    """Logout endpoint"""
    return {
        "message": "Logged out successfully"
    }
