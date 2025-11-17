from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.core.database import get_db
from app.models.snapshot import BikeSnapshot, StationSnapshot
from datetime import datetime, timedelta, timezone
from typing import List

router = APIRouter()

@router.get("/snapshots/latest")
async def get_latest_snapshot(db: Session = Depends(get_db)):
    """Get the most recent snapshot data"""
    
    latest_bike_time = db.query(func.max(BikeSnapshot.timestamp)).scalar()
    latest_station_time = db.query(func.max(StationSnapshot.timestamp)).scalar()
    
    if not latest_bike_time or not latest_station_time:
        return {"error": "No snapshots available yet"}
    
    bikes = db.query(BikeSnapshot).filter(
        BikeSnapshot.timestamp == latest_bike_time
    ).all()
    
    stations = db.query(StationSnapshot).filter(
        StationSnapshot.timestamp == latest_station_time
    ).all()
    
    return {
        "timestamp": latest_bike_time,
        "bikes": {
            "total": len(bikes),
            "available": len([b for b in bikes if not b.is_reserved and not b.is_disabled]),
            "reserved": len([b for b in bikes if b.is_reserved]),
            "disabled": len([b for b in bikes if b.is_disabled])
        },
        "stations": {
            "total": len(stations),
            "active": len([s for s in stations if s.is_installed and s.is_renting]),
            "total_bikes": sum(s.num_bikes_available for s in stations),
            "total_ebikes": sum(s.num_ebikes_available for s in stations)
        }
    }

@router.get("/snapshots/history")
async def get_snapshot_history(
    hours: int = 24,
    db: Session = Depends(get_db)
):
    """Get snapshot history for the last N hours"""
    
    cutoff_time = datetime.now(timezone.utc) - timedelta(hours=hours)
    
    # Get unique timestamps
    timestamps = db.query(BikeSnapshot.timestamp).filter(
        BikeSnapshot.timestamp >= cutoff_time
    ).distinct().order_by(desc(BikeSnapshot.timestamp)).all()
    
    history = []
    for (ts,) in timestamps:
        bikes = db.query(BikeSnapshot).filter(
            BikeSnapshot.timestamp == ts,
            BikeSnapshot.is_reserved == False,
            BikeSnapshot.is_disabled == False
        ).count()
        
        stations_active = db.query(StationSnapshot).filter(
            StationSnapshot.timestamp == ts,
            StationSnapshot.is_renting == True
        ).count()
        
        total_bikes_at_stations = db.query(
            func.sum(StationSnapshot.num_bikes_available)
        ).filter(
            StationSnapshot.timestamp == ts
        ).scalar() or 0
        
        history.append({
            "timestamp": ts,
            "bikes_available": bikes,
            "stations_active": stations_active,
            "total_bikes_at_stations": total_bikes_at_stations
        })
    
    return {"hours": hours, "data_points": len(history), "history": history}

@router.get("/stations/popular")
async def get_popular_stations(
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get most popular stations by average bike availability"""
    
    latest_time = db.query(func.max(StationSnapshot.timestamp)).scalar()
    
    if not latest_time:
        return {"error": "No data available"}
    
    # Get stations from last 24 hours
    cutoff = datetime.now(timezone.utc) - timedelta(hours=24)
    
    popular = db.query(
        StationSnapshot.station_id,
        StationSnapshot.name,
        func.avg(StationSnapshot.num_bikes_available).label('avg_bikes')
    ).filter(
        StationSnapshot.timestamp >= cutoff
    ).group_by(
        StationSnapshot.station_id,
        StationSnapshot.name
    ).order_by(
        desc('avg_bikes')
    ).limit(limit).all()
    
    return {
        "popular_stations": [
            {
                "station_id": s.station_id,
                "name": s.name,
                "average_bikes": round(s.avg_bikes, 2)
            }
            for s in popular
        ]
    }