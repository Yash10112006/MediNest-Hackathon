import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    # Supabase
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")

    # Gemini
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    # JWT Authentication
    SECRET_KEY: str = os.getenv("SECRET_KEY", "").strip()
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
    )

    # CORS
    ALLOWED_ORIGINS: list = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://localhost:3000"
    ).split(",")

    # Environment
    ENVIRONMENT: str = os.getenv(
        "ENVIRONMENT",
        "development"
    )

    DEBUG: bool = os.getenv(
        "DEBUG",
        "True"
    ).lower() == "true"

    def __init__(self):
        insecure_keys = {
            "",
            "dev-secret-key-change-this",
            "changeme",
            "secret",
            "your-secret-key",
            "your-dev-secret-key-change-this"
        }
        if not self.SECRET_KEY or self.SECRET_KEY in insecure_keys:
            raise RuntimeError(
                "CRITICAL SECURITY CONFIGURATION ERROR: SECRET_KEY is not configured or uses an insecure placeholder. "
                "Provide a cryptographically secure string (minimum 32 characters) via the SECRET_KEY environment variable."
            )
        if len(self.SECRET_KEY) < 32:
            raise RuntimeError(
                "CRITICAL SECURITY CONFIGURATION ERROR: SECRET_KEY must be at least 32 characters long to ensure cryptographic security."
            )


settings = Settings()
