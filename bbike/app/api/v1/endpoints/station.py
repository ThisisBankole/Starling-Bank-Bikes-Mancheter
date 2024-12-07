from fastapi import APIRouter, HTTPException
from datetime import datetime
from app.services.gbfs_service import gbfs_service
from app.core.constants import GBFS_URLS

router = APIRouter()


# Get all stations with their status
@router.get("/stations/all")
async def get_all_stations():
    station_info = await gbfs_service.fetch_gbfs_data(GBFS_URLS["stations"], "stations")
    station_status = await gbfs_service.fetch_gbfs_data(GBFS_URLS["station_status"], "station_status")
    
    stations = []
    for station in station_info["data"]["stations"]:
        status = next((s for s in station_status["data"]["stations"] if s["station_id"] == station["station_id"]), None)
        stations.append({**station, "status": status})
        
    return {
        "last_updated": datetime.fromtimestamp(station_info["last_updated"]).isoformat(),
        "stations": stations
    }

@router.get("/stations")
async def get_stations():
    data = await gbfs_service.fetch_gbfs_data(GBFS_URLS["stations"], "stations")
    return {
        "last_updated": datetime.fromtimestamp(data["last_updated"]).isoformat(),
        "stations": data["data"]["stations"]
    }
    
    
@router.get("/stations/status")
async def get_station_status():
    data = await gbfs_service.fetch_gbfs_data(GBFS_URLS["station_status"], "station_status")
    return {
        "last_updated": datetime.fromtimestamp(data["last_updated"]).isoformat(),
        "statuses": data["data"]["stations"]
    }
    

#Get all active stations
@router.get("/stations/active")
async def get_active_stations():
    station_info = await gbfs_service.fetch_gbfs_data(GBFS_URLS["stations"], "stations")
    station_status = await gbfs_service.fetch_gbfs_data(GBFS_URLS["station_status"], "station_status")
    
    active_stations = []
    for station in station_info["data"]["stations"]:
        status = next((s for s in station_status["data"]["stations"] if s["station_id"] == station["station_id"]), None)
        if status and status["is_renting"]:
            active_stations.append({**station, "status": status})
            
    return {
        "last_updated": datetime.fromtimestamp(station_info["last_updated"]).isoformat(),
        "stations": active_stations
    }
    
    
#Get all inactive stations
@router.get("/stations/inactive")
async def get_inactive_stations():
    station_info = await gbfs_service.fetch_gbfs_data(GBFS_URLS["stations"], "stations")
    station_status = await gbfs_service.fetch_gbfs_data(GBFS_URLS["station_status"], "station_status")
    
    inactive_stations = []
    for station in station_info["data"]["stations"]:
        status = next((s for s in station_status["data"]["stations"] if s["station_id"] == station["station_id"]), None)
        if status and not status["is_renting"]:
            inactive_stations.append({**station, "status": status})
            
    return {
        "last_updated": datetime.fromtimestamp(station_info["last_updated"]).isoformat(),
        "stations": inactive_stations
    }
    
    
@router.get("/stations/{station_id}")
async def get_station_detail(station_id: str):
    #fetch station data
    station_info = await gbfs_service.fetch_gbfs_data(GBFS_URLS["stations"], "stations")
    station_status = await gbfs_service.fetch_gbfs_data(GBFS_URLS["station_status"], "station_status")
    
    #find station by id
    station = next((s for s in station_info["data"]["stations"] if s["station_id"] == station_id), None)
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    
    status = next((s for s in station_status["data"]["stations"] if s["station_id"] == station_id), None)
    
    return {
        "last_updated": datetime.fromtimestamp(station_info["last_updated"]).isoformat(),
        "station": {**station, "status": status}
    }
    

