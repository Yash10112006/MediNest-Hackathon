# backend/app/api/auth.py

from fastapi import APIRouter, HTTPException
from ..models.schemas import UserLogin, UserRegister, TokenResponse
from ..core.security import create_access_token
from ..core.database import supabase, supabase_admin

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse)
async def register(user: UserRegister):
    """
    Register a new MediNest user.

    Flow:
    1. Create user in Supabase Authentication
    2. Create profile in public.users
    3. Return our application JWT
    """

    if not supabase_admin:
        raise HTTPException(
            status_code=500,
            detail="Supabase admin client is not configured."
        )

    try:
        # ---------------------------------------------------------
        # STEP 1: Create user in Supabase Authentication
        # ---------------------------------------------------------

        auth_response = supabase_admin.auth.admin.create_user({
            "email": user.email,
            "password": user.password,
            "email_confirm": True,
            "user_metadata": {
                "name": user.name,
                "role": user.role
            }
        })

        if not auth_response.user:
            raise HTTPException(
                status_code=400,
                detail="Supabase did not create the user."
            )

        user_id = str(auth_response.user.id)

        print("==========================================")
        print("SUPABASE USER CREATED")
        print("==========================================")
        print("User ID:", user_id)
        print("Email:", user.email)
        print("Name:", user.name)
        print("Role:", user.role)
        print("==========================================")

        # ---------------------------------------------------------
        # STEP 2: Create profile in public.users
        # ---------------------------------------------------------

        profile_data = {
            "id": user_id,
            "email": user.email,
            "name": user.name,
            "role": user.role
        }

        profile_response = (
            supabase_admin
            .table("users")
            .insert(profile_data)
            .execute()
        )

        if not profile_response.data:
            # If profile creation fails, remove the Auth user
            # so we don't leave an incomplete account behind.
            try:
                supabase_admin.auth.admin.delete_user(user_id)
            except Exception:
                pass

            raise HTTPException(
                status_code=500,
                detail="Supabase Auth user was created, but profile creation failed."
            )

        print("SUPABASE PROFILE CREATED")
        print(profile_response.data)

        # ---------------------------------------------------------
        # STEP 3: Create MediNest application JWT
        # ---------------------------------------------------------

        access_token = create_access_token(
            data={
                "sub": user_id,
                "role": user.role
            }
        )

        return TokenResponse(
            access_token=access_token,
            user_id=user_id,
            role=user.role,
            name=user.name
        )

    except HTTPException:
        raise

    except Exception as e:
        print("==========================================")
        print("REGISTRATION ERROR")
        print("==========================================")
        print("Error type:", type(e).__name__)
        print("Error:", str(e))
        print("==========================================")

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@router.post("/login", response_model=TokenResponse)
async def login(user: UserLogin):
    """
    Login an existing Supabase Auth user.
    """

    if not supabase:
        raise HTTPException(
            status_code=500,
            detail="Supabase client is not configured."
        )

    try:
        # ---------------------------------------------------------
        # STEP 1: Authenticate with Supabase
        # ---------------------------------------------------------

        auth_response = supabase.auth.sign_in_with_password({
            "email": user.email,
            "password": user.password
        })

        if not auth_response.user:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password."
            )

        user_id = str(auth_response.user.id)

        # ---------------------------------------------------------
        # STEP 2: Get MediNest profile
        # ---------------------------------------------------------

        user_data = (
            supabase_admin
            .table("users")
            .select("*")
            .eq("id", user_id)
            .execute()
        )

        role = "patient"
        name = None

        if user_data.data:
            profile = user_data.data[0]

            role = profile.get("role") or "patient"
            name = profile.get("name")

        # ---------------------------------------------------------
        # STEP 3: Fallback to Supabase Auth metadata
        # ---------------------------------------------------------

        if not name and auth_response.user.user_metadata:
            name = auth_response.user.user_metadata.get("name")

        if not name:
            name = user.email.split("@")[0]

        # ---------------------------------------------------------
        # STEP 4: Create MediNest JWT
        # ---------------------------------------------------------

        access_token = create_access_token(
            data={
                "sub": user_id,
                "role": role
            }
        )

        print("==========================================")
        print("LOGIN SUCCESS")
        print("==========================================")
        print("User ID:", user_id)
        print("Email:", user.email)
        print("Name:", name)
        print("Role:", role)
        print("==========================================")

        return TokenResponse(
            access_token=access_token,
            user_id=user_id,
            role=role,
            name=name
        )

    except HTTPException:
        raise

    except Exception as e:
        print("==========================================")
        print("LOGIN ERROR")
        print("==========================================")
        print("Error type:", type(e).__name__)
        print("Error:", str(e))
        print("==========================================")

        raise HTTPException(
            status_code=401,
            detail=str(e)
        )


@router.post("/logout")
async def logout():
    """
    Logout endpoint.

    The frontend should also clear its local authentication state.
    """

    return {
        "message": "Logged out successfully"
    }