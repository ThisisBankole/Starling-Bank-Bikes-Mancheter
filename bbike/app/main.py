from fastapi import FastAPI, HTTPException # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from app.core.config import settings
from app.api.v1.router import api_router

from contextlib import asynccontextmanager




app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    root_path="/api/v1",
    docs_url="/docs"
)

@app.get("/test")
async def test_endpoint():
    return {"status": "ok", "felt_python": "imported successfully"}


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

if __name__ == "__main__":
    import uvicorn # type: ignore
    uvicorn.run(app, host="0.0.0.0", port=8000)





