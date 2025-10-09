from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    
    PROJECT_NAME: str = "Personal Finance Report Generator"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Gemini API Configuration
    GEMINI_API_KEY: str
    GEMINI_MODEL: str = "gemini-1.5-flash"
    
    # JWT Configuration
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    
    # Database Configuration
    DATABASE_PATH: str = "../data/app.db"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()