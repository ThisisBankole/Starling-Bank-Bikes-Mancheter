from app.core.config import settings

GBFS_URLS = {
    "station_status": f"{settings.GBFS_BASE_URL}/station_status.json",
    "bikes": f"{settings.GBFS_BASE_URL}/free_bike_status.json",
    "stations": f"{settings.GBFS_BASE_URL}/station_information.json"
    
}