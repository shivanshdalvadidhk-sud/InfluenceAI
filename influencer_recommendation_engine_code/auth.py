import os
from typing import Optional, Dict, Any
import requests
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer(auto_error=False)

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")


def verify_supabase_jwt(token: str) -> Dict[str, Any]:
    """Verify Supabase JWT via local secret or Supabase auth.get_user endpoint."""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 0. Service role key support for backend proxy
    if SUPABASE_SERVICE_ROLE_KEY and token == SUPABASE_SERVICE_ROLE_KEY:
        return {
            "id": "6c56b322-95e3-46d1-8efe-d6d597dafe2f",
            "email": "admin@influenceai.internal",
            "role": "admin",
            "user_metadata": {"role": "admin"},
        }

    if SUPABASE_JWT_SECRET:
        try:
            payload = jwt.decode(
                token,
                SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False},
            )
            return {
                "id": payload.get("sub"),
                "email": payload.get("email"),
                "role": payload.get("user_metadata", {}).get("role", "brand"),
                "user_metadata": payload.get("user_metadata", {}),
                "payload": payload,
            }
        except jwt.PyJWTError as jwt_err:
            pass  # Fallback to Supabase API call

    # 2. Verify with Supabase Auth API (auth.get_user)
    if SUPABASE_URL:
        api_key = SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY
        try:
            resp = requests.get(
                f"{SUPABASE_URL}/auth/v1/user",
                headers={
                    "Authorization": f"Bearer {token}",
                    "apikey": api_key,
                },
                timeout=10,
            )
            if resp.status_code == 200:
                user_data = resp.json()
                metadata = user_data.get("user_metadata", {})
                return {
                    "id": user_data.get("id"),
                    "email": user_data.get("email"),
                    "role": metadata.get("role", "brand"),
                    "user_metadata": metadata,
                    "raw": user_data,
                }
            elif resp.status_code == 401:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired Supabase authentication token",
                    headers={"WWW-Authenticate": "Bearer"},
                )
        except requests.RequestException as req_err:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Auth verification service unavailable: {req_err}",
            )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Unable to verify authentication token",
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Dict[str, Any]:
    """FastAPI dependency to extract and verify the current authenticated Supabase user."""
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header with Bearer token is required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return verify_supabase_jwt(credentials.credentials)


def require_role(required_role: str):
    """Dependency factory to enforce specific roles (e.g. 'brand' or 'influencer')."""
    def role_checker(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        user_role = str(user.get("role", "")).lower()
        req_role = str(required_role).lower()
        
        # Normalize aliases: company == brand, creator == influencer
        role_map = {"company": "brand", "creator": "influencer"}
        user_role = role_map.get(user_role, user_role)
        req_role = role_map.get(req_role, req_role)

        if user_role != req_role and user_role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: this endpoint requires '{required_role}' role (user role: '{user.get('role')}').",
            )
        return user

    return role_checker
