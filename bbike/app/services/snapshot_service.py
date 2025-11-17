from sqlalchemy.orm import Session
from app.models.snapshot import BikeSnapshot, StationSnapshot
from app.services.gbfs_service import gbfs_service
from app.core.constants import GBFS_URLS
from datetime import datetime, timezone

class SnapshotService:
    
    async def save_bike_snapshot(self, db: Session):
        """Save current bike data to database"""
        try:
            bike_data = await gbfs_service.fetch_gbfs_data(
                GBFS_URLS["bikes"], 
                "bikes"
            )
            
            timestamp = datetime.now(timezone.utc)
            
            for bike in bike_data["data"]["bikes"]:
                snapshot = BikeSnapshot(
                    timestamp=timestamp,
                    bike_id=bike["bike_id"],
                    lat=bike["lat"],
                    lon=bike["lon"],
                    is_reserved=bike["is_reserved"],
                    is_disabled=bike["is_disabled"],
                    vehicle_type_id=bike.get("vehicle_type_id", "unknown")
                )
                db.add(snapshot)
            
            db.commit()
            print(f"Saved {len(bike_data['data']['bikes'])} bike snapshots at {timestamp}")
            
        except Exception as e:
            print(f"Error saving bike snapshot: {e}")
            db.rollback()
    
    async def save_station_snapshot(self, db: Session):
        """Save current station data to database"""
        try:
            station_info = await gbfs_service.fetch_gbfs_data(
                GBFS_URLS["stations"],
                "stations"
            )
            
            station_status = await gbfs_service.fetch_gbfs_data(
                GBFS_URLS["station_status"],
                "station_status"
            )
            
            # Create status lookup
            status_map = {
                s["station_id"]: s 
                for s in station_status["data"]["stations"]
            }
            
            timestamp = datetime.now(timezone.utc)
            
            for station in station_info["data"]["stations"]:
                station_id = station["station_id"]
                status = status_map.get(station_id, {})
                
                snapshot = StationSnapshot(
                    timestamp=timestamp,
                    station_id=station_id,
                    name=station["name"],
                    lat=station["lat"],
                    lon=station["lon"],
                    capacity=station.get("capacity", 0),
                    num_bikes_available=status.get("num_bikes_available", 0),
                    num_ebikes_available=status.get("vehicle_types_available", [{}])[0].get("count", 0) if status.get("vehicle_types_available") else 0,
                    num_docks_available=status.get("num_docks_available", 0),
                    is_installed=status.get("is_installed", False),
                    is_renting=status.get("is_renting", False),
                    is_returning=status.get("is_returning", False)
                )
                db.add(snapshot)
            
            db.commit()
            print(f"Saved {len(station_info['data']['stations'])} station snapshots at {timestamp}")
            
        except Exception as e:
            print(f"Error saving station snapshot: {e}")
            db.rollback()

snapshot_service = SnapshotService()