from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.snapshot import BikeSnapshot

router = APIRouter()

@router.get("/bikes")
async def get_bikes(db: Session = Depends(get_db)):
    # Get latest timestamp
    latest_time = db.query(func.max(BikeSnapshot.timestamp)).scalar()
    
    if not latest_time:
        raise HTTPException(status_code=503, detail="No bike data available yet")
    
    # Get all bikes from latest snapshot
    bikes = db.query(BikeSnapshot).filter(
        BikeSnapshot.timestamp == latest_time
    ).all()
    
    print(f"Total bikes: {len(bikes)}")
    
    return {
        "last_updated": latest_time.isoformat(),
        "data": [
            {
                "bike_id": b.bike_id,
                "lat": b.lat,
                "lon": b.lon,
                "is_reserved": b.is_reserved,
                "is_disabled": b.is_disabled,
                "vehicle_type_id": b.vehicle_type_id
            }
            for b in bikes
        ]
    }

@router.get("/bikes/available")
async def get_available_bikes(db: Session = Depends(get_db)):
    latest_time = db.query(func.max(BikeSnapshot.timestamp)).scalar()
    
    if not latest_time:
        raise HTTPException(status_code=503, detail="No bike data available yet")
    
    # Get available bikes only
    bikes = db.query(BikeSnapshot).filter(
        BikeSnapshot.timestamp == latest_time,
        BikeSnapshot.is_reserved == False,
        BikeSnapshot.is_disabled == False
    ).all()
    
    print(f"Available bikes: {len(bikes)}")
    
    return {
        "last_updated": latest_time.isoformat(),
        "available_bikes": [
            {
                "bike_id": b.bike_id,
                "lat": b.lat,
                "lon": b.lon,
                "vehicle_type_id": b.vehicle_type_id
            }
            for b in bikes
        ]
    }

@router.get("/ebikes")
async def get_ebikes(db: Session = Depends(get_db)):
    latest_time = db.query(func.max(BikeSnapshot.timestamp)).scalar()
    
    if not latest_time:
        raise HTTPException(status_code=503, detail="No bike data available yet")
    
    # Get ebikes only
    ebikes = db.query(BikeSnapshot).filter(
        BikeSnapshot.timestamp == latest_time,
        BikeSnapshot.vehicle_type_id == "bbe"
    ).all()
    
    return {
        "last_updated": latest_time.isoformat(),
        "ebikes": [
            {
                "bike_id": b.bike_id,
                "lat": b.lat,
                "lon": b.lon,
                "is_reserved": b.is_reserved,
                "is_disabled": b.is_disabled
            }
            for b in ebikes
        ]
    }