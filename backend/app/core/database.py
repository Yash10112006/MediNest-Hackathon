# backend/app/core/database.py
from supabase import create_client, Client
from typing import Optional
from .config import settings

supabase: Optional[Client] = None
supabase_admin: Optional[Client] = None

try:
    if settings.SUPABASE_URL and not settings.SUPABASE_URL.startswith("your_"):
        supabase = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_ANON_KEY
        )
        supabase_admin = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_KEY
        )
except Exception as e:
    print(f"[Warning] Supabase client initialization skipped/failed: {e}")

def get_supabase() -> Optional[Client]:
    """Dependency for Supabase client"""
    return supabase

def get_supabase_admin() -> Optional[Client]:
    """Dependency for Supabase admin client"""
    return supabase_admin