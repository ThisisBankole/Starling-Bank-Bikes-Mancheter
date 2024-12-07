from fastapi import APIRouter, HTTPException # type: ignore
from datetime import datetime
from app.services.gbfs_service import gbfs_service
from app.core.constants import GBFS_URLS

router = APIRouter()

@router.get("/bikes")
async def get_bikes():
    data = await gbfs_service.fetch_gbfs_data(GBFS_URLS["bikes"], "bikes")
    #print to count total bikes
    print(f"Total bikes: {len(data['data']['bikes'])}")
    return {
        "last_updated": datetime.fromtimestamp(data["last_updated"]).isoformat(),
        "data": data["data"]["bikes"]
    }
    
#Get available bikes and ebikes
@router.get("/bikes/available")
async def get_available_bikes():
    data = await gbfs_service.fetch_gbfs_data(GBFS_URLS["bikes"], "bikes")
    available_bikes = [
        bike for bike in data["data"]["bikes"]
        if bike.get("is_reserved") == 0
    ]
    #print to count available bikes
    print(f"Total bikes: {len(data['data']['bikes'])}")

    
    return {
        "last_updated": datetime.fromtimestamp(data["last_updated"]).isoformat(),
        "available_bikes": available_bikes
    }
    
    
@router.get("/ebikes")
async def get_ebikes():
    data = await gbfs_service.fetch_gbfs_data(GBFS_URLS["bikes"], "bikes")
    ebikes = [
        bike for bike in data["data"]["bikes"]
        if bike.get("vehicle_type_id") == "bbe"
    ]
    
    return {
        "last_updated": datetime.fromtimestamp(data["last_updated"]).isoformat(),
        "ebikes": ebikes
    }