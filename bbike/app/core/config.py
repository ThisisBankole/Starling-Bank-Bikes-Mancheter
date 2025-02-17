from pydantic_settings import BaseSettings  # type: ignore
from typing import List, Optional
import os
from dotenv import load_dotenv # type: ignore

load_dotenv()

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "BBike Data API"
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost", "http://localhost:8000", "http://localhost:3000", "http://localhost:8080"]
    GBFS_BASE_URL: str = "https://beryl-gbfs-production.web.app/v2_2/Greater_Manchester"
    CACHE_TTL: int = 290
  
    class Config:
        case_sensitive = True
        
settings = Settings()