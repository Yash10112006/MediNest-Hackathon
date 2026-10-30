# backend/app/core/security.py
from datetime import datetime, timedelta, timezone
from typing import Optional, List, Dict, Any
from jose import JWTError, jwt, ExpiredSignatureError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from .config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security_scheme = HTTPBearer(auto_error=False)


class CurrentUser:
    """
    Verified authenticated user context with dual attribute/dictionary access.
    Guarantees both .id and .user_id compatibility.
    """
    def __init__(
        self,
        user_id: str,
        role: str,
        email: Optional[str] = None,
        name: Optional[str] = None,
        raw_payload: Optional[Dict[str, Any]] = None
    ):
        self.id = user_id
        self.user_id = user_id
        self.role = (role or "patient").lower().strip()
        self.email = email
        self.name = name
        self.raw_payload = raw_payload or {}

    def __getitem__(self, item: str) -> Any:
        return getattr(self, item, self.raw_payload.get(item))

    def get(self, item: str, default: Any = None) -> Any:
        return getattr(self, item, self.raw_payload.get(item, default))

    def __repr__(self) -> str:
        return f"<CurrentUser id={self.id} role={self.role}>"


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> Optional[dict]:
    """Legacy helper: decodes and returns raw payload or None."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)
) -> CurrentUser:
    """
    FastAPI dependency that extracts and validates Bearer token.
    Raises HTTP 401 on missing, expired, tampered, or invalid tokens.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub") or payload.get("user_id")
    role = payload.get("role")

    if not user_id or not role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token claims: missing subject or role",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return CurrentUser(
        user_id=str(user_id),
        role=str(role),
        email=payload.get("email"),
        name=payload.get("name"),
        raw_payload=payload
    )


def require_roles(*allowed_roles: str):
    """
    Dependency factory to enforce role-based access control.
    Example: Depends(require_roles("doctor", "hospital_admin"))
    """
    normalized_allowed = [r.lower().strip() for r in allowed_roles]

    async def role_checker(
        current_user: CurrentUser = Depends(get_current_user)
    ) -> CurrentUser:
        if current_user.role not in normalized_allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted for role '{current_user.role}'. Required: {list(allowed_roles)}"
            )
        return current_user

    return role_checker


# Role-specific dependency shortcuts
require_patient = require_roles("patient")
require_doctor = require_roles("doctor")
require_hospital_admin = require_roles("hospital_admin")
require_asha = require_roles("asha")
require_clinical_staff = require_roles("doctor", "asha")
require_staff = require_roles("doctor", "asha", "hospital_admin")


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
