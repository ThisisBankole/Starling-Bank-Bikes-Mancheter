import httpx 
import time
from fastapi import HTTPException
from typing import Dict
from app.core.constants import GBFS_URLS
from app.core.config import settings
from datetime import datetime


class GBFSService:
    def __init__(self):
        self.cache = {
            "bikes": {"data": None, "last_fetch": 0},
            "stations": {"data": None, "last_fetch": 0},
            "station_status": {"data": None, "last_fetch": 0},
        }
        
    async def is_data_fresh(self, last_updated: int, max_age: int = 300) -> bool:
        current_time = int(time.time())
        time_diff = current_time - last_updated
        
        # Debug print
        print(f"Current time: {datetime.fromtimestamp(current_time)}")
        print(f"Last updated: {datetime.fromtimestamp(last_updated)}")
        print(f"Time difference: {time_diff} seconds")
        
        # More lenient freshness check (10 minutes instead of 5)
        return time_diff < (max_age * 2)

    async def fetch_gbfs_data(self, url: str, data_type: str) -> Dict:
        current_time = int(time.time())
        
        if self.cache[data_type]["data"] and \
            current_time - self.cache[data_type]["last_fetch"] < settings.CACHE_TTL:
                return self.cache[data_type]["data"]
            
        async with httpx.AsyncClient() as client:
            try:
                print(f"Fetching data from: {url}")  # Debug print
                response = await client.get(url)
                response.raise_for_status()
                data = response.json()
                
                print(f"Received data with timestamp: {data['last_updated']}")  # Debug print
                
                if data_type in ["bikes", "station_status"]:
                    if not await self.is_data_fresh(data["last_updated"]):
                        print("Data considered stale!")  # Debug print
                        raise HTTPException(
                            status_code=503, 
                            detail=f"Data is stale. Last update was at {datetime.fromtimestamp(data['last_updated'])}"
                        )
                    
                self.cache[data_type]["data"] = data
                self.cache[data_type]["last_fetch"] = current_time
                
                return data
            
            except httpx.HTTPStatusError as e:
                raise HTTPException(status_code=e.response.status_code, detail=e.response.text)


gbfs_service = GBFSService()