from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.snapshot import StationSnapshot

router = APIRouter()

@router.get("/stations/all")
async def get_all_stations(db: Session = Depends(get_db)):
    latest_time = db.query(func.max(StationSnapshot.timestamp)).scalar()
    
    if not latest_time:
        raise HTTPException(status_code=503, detail="No station data available yet")
    
    stations = db.query(StationSnapshot).filter(
        StationSnapshot.timestamp == latest_time
    ).all()
    
    return {
        "last_updated": latest_time.isoformat(),
        "stations": [
            {
                "station_id": s.station_id,
                "name": s.name,
                "lat": s.lat,
                "lon": s.lon,
                "capacity": s.capacity,
                "status": {
                    "num_bikes_available": s.num_bikes_available,
                    "num_ebikes_available": s.num_ebikes_available,
                    "num_docks_available": s.num_docks_available,
                    "is_installed": s.is_installed,
                    "is_renting": s.is_renting,
                    "is_returning": s.is_returning
                }
            }
            for s in stations
        ]
    }

@router.get("/stations")
async def get_stations(db: Session = Depends(get_db)):
    latest_time = db.query(func.max(StationSnapshot.timestamp)).scalar()
    
    if not latest_time:
        raise HTTPException(status_code=503, detail="No station data available yet")
    
    stations = db.query(StationSnapshot).filter(
        StationSnapshot.timestamp == latest_time
    ).all()
    
    return {
        "last_updated": latest_time.isoformat(),
        "stations": [
            {
                "station_id": s.station_id,
                "name": s.name,
                "lat": s.lat,
                "lon": s.lon,
                "capacity": s.capacity
            }
            for s in stations
        ]
    }

@router.get("/stations/status")
async def get_station_status(db: Session = Depends(get_db)):
    latest_time = db.query(func.max(StationSnapshot.timestamp)).scalar()
    
    if not latest_time:
        raise HTTPException(status_code=503, detail="No station data available yet")
    
    stations = db.query(StationSnapshot).filter(
        StationSnapshot.timestamp == latest_time
    ).all()
    
    return {
        "last_updated": latest_time.isoformat(),
        "statuses": [
            {
                "station_id": s.station_id,
                "num_bikes_available": s.num_bikes_available,
                "num_ebikes_available": s.num_ebikes_available,
                "num_docks_available": s.num_docks_available,
                "is_installed": s.is_installed,
                "is_renting": s.is_renting,
                "is_returning": s.is_returning
            }
            for s in stations
        ]
    }

@router.get("/stations/active")
async def get_active_stations(db: Session = Depends(get_db)):
    latest_time = db.query(func.max(StationSnapshot.timestamp)).scalar()
    
    if not latest_time:
        raise HTTPException(status_code=503, detail="No station data available yet")
    
    # Only get stations that are renting
    stations = db.query(StationSnapshot).filter(
        StationSnapshot.timestamp == latest_time,
        StationSnapshot.is_renting == True
    ).all()
    
    return {
        "last_updated": latest_time.isoformat(),
        "stations": [
            {
                "station_id": s.station_id,
                "name": s.name,
                "lat": s.lat,
                "lon": s.lon,
                "capacity": s.capacity,
                "status": {
                    "num_bikes_available": s.num_bikes_available,
                    "num_ebikes_available": s.num_ebikes_available,
                    "num_docks_available": s.num_docks_available,
                    "is_installed": s.is_installed,
                    "is_renting": s.is_renting,
                    "is_returning": s.is_returning
                }
            }
            for s in stations
        ]
    }

@router.get("/stations/inactive")
async def get_inactive_stations(db: Session = Depends(get_db)):
    latest_time = db.query(func.max(StationSnapshot.timestamp)).scalar()
    
    if not latest_time:
        raise HTTPException(status_code=503, detail="No station data available yet")
    
    # Only get stations that are NOT renting
    stations = db.query(StationSnapshot).filter(
        StationSnapshot.timestamp == latest_time,
        StationSnapshot.is_renting == False
    ).all()
    
    return {
        "last_updated": latest_time.isoformat(),
        "stations": [
            {
                "station_id": s.station_id,
                "name": s.name,
                "lat": s.lat,
                "lon": s.lon,
                "capacity": s.capacity,
                "status": {
                    "num_bikes_available": s.num_bikes_available,
                    "num_ebikes_available": s.num_ebikes_available,
                    "num_docks_available": s.num_docks_available,
                    "is_installed": s.is_installed,
                    "is_renting": s.is_renting,
                    "is_returning": s.is_returning
                }
            }
            for s in stations
        ]
    }

@router.get("/stations/{station_id}")
async def get_station_detail(station_id: str, db: Session = Depends(get_db)):
    latest_time = db.query(func.max(StationSnapshot.timestamp)).scalar()
    
    if not latest_time:
        raise HTTPException(status_code=503, detail="No station data available yet")
    
    # Find specific station
    station = db.query(StationSnapshot).filter(
        StationSnapshot.timestamp == latest_time,
        StationSnapshot.station_id == station_id
    ).first()
    
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    
    return {
        "last_updated": latest_time.isoformat(),
        "station": {
            "station_id": station.station_id,
            "name": station.name,
            "lat": station.lat,
            "lon": station.lon,
            "capacity": station.capacity,
            "status": {
                "num_bikes_available": station.num_bikes_available,
                "num_ebikes_available": station.num_ebikes_available,
                "num_docks_available": station.num_docks_available,
                "is_installed": station.is_installed,
                "is_renting": station.is_renting,
                "is_returning": station.is_returning
            }
        }
    }