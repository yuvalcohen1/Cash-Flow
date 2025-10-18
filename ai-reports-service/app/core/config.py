from pydantic_settings import BaseSettings
from pydantic import ConfigDict
import os

class Settings(BaseSettings):
    """Application settings"""

    model_config = ConfigDict(
        extra='ignore',
        env_file='.env',
        case_sensitive=True,
        protected_namespaces=() # Allow fields starting with "model_"
    )

    PROJECT_NAME: str = "Personal Finance Report Generator"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Database settings (Supabase PostgreSQL)
    DATABASE_URL: str = ""

    # Parse database connection info from DATABASE_URL
    @property
    def DB_HOST(self) -> str:
        if self.DATABASE_URL:
            try:
                # Extract host from postgresql://user:pass@host:port/db
                parts = self.DATABASE_URL.split("@")
                if len(parts) > 1:
                    host_port = parts[1].split("/")[0].split(":")[0]
                    return host_port
            except:
                pass
        return "localhost"
    
    @property
    def DB_PORT(self) -> int:
        if self.DATABASE_URL:
            try:
                parts = self.DATABASE_URL.split("@")
                if len(parts) > 1:
                    port = parts[1].split("/")[0].split(":")[1]
                    return int(port)
            except:
                pass
        return 5432
    
    @property
    def DB_NAME(self) -> str:
        if self.DATABASE_URL:
            try:
                parts = self.DATABASE_URL.split("/")
                if len(parts) > 1:
                    return parts[-1].split("?")[0]  # Remove query params if any
            except:
                pass
        return "postgres"
    
    @property
    def DB_USER(self) -> str:
        if self.DATABASE_URL:
            try:
                parts = self.DATABASE_URL.split("//")
                if len(parts) > 1:
                    user = parts[1].split(":")[0]
                    return user
            except:
                pass
        return "postgres"
    
    @property
    def DB_PASSWORD(self) -> str:
        if self.DATABASE_URL:
            try:
                parts = self.DATABASE_URL.split("//")
                if len(parts) > 1:
                    password = parts[1].split(":")[1].split("@")[0]
                    return password
            except:
                pass
        return ""
    
    # Supabase settings
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # JWT settings
    JWT_SECRET: str = ""
    JWT_ALGORITHM: str = "HS256"

    # AI settings
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"

    # API settings
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000


settings = Settings()