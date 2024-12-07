from fastapi import FastAPI # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from app.core.config import settings
from app.api.v1.router import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    root_path="/api/v1",
    docs_url="/docs"
)

allowed_origins = [
    "https://bike-monitor-dkbkh8anaweqd0e3.ukwest-01.azurewebsites.net",
    "http://localhost:3000",
    "http://localhost:5173",
    "https://bike-sharing-api-cng9c5dyfhghhya0.ukwest-01.azurewebsites.net"
]


#Set up CORS
#if settings.BACKEND_CORS_ORIGINS:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    )
    

app.include_router(api_router)