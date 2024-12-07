from fastapi import APIRouter
from app.api.v1.endpoints import bikes, station

api_router = APIRouter()

api_router.include_router(bikes.router, tags=["bikes"])
api_router.include_router(station.router, tags=["stations"])
