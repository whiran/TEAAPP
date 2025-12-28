"""
Configuration module for Ceylon Tea Intelligence Platform.
Loads environment variables using python-dotenv.
"""

import os
from functools import lru_cache
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Settings:
    """Application settings loaded from environment variables."""
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/ceylon_tea")
    
    # Windy API Keys
    PF_WINDY_API_KEY: str = os.getenv("PF_WINDY_API_KEY", "")  # Point Forecast API
    MP_WINDY_API_KEY: str = os.getenv("MP_WINDY_API_KEY", "")  # Map Forecast API
    
    # Meteosource API (Legacy - being replaced)
    METEOSOURCE_API_KEY: str = os.getenv("METEOSOURCE_API_KEY", "")
    
    # Tomorrow.io API (New primary weather provider)
    TOMORROWIO_API_KEY: str = os.getenv("TOMORROWIO_API_KEY", "")
    TOMORROWIO_BASE_URL: str = os.getenv("TOMORROWIO_BASE_URL", "https://api.tomorrow.io/v4")
    
    # Cache Settings
    WEATHER_CACHE_TTL: int = int(os.getenv("WEATHER_CACHE_TTL", "300"))  # 5 minutes


@lru_cache()
def get_settings() -> Settings:
    """
    Returns cached settings instance.
    Using lru_cache ensures settings are only loaded once.
    """
    return Settings()


# Export settings instance for easy import
settings = get_settings()
