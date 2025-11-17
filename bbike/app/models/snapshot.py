from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from app.core.database import Base
from datetime import datetime

class BikeSnapshot(Base):
    __tablename__ = "bike_snapshots"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    bike_id = Column(String, index=True)
    lat = Column(Float)
    lon = Column(Float)
    is_reserved = Column(Boolean)
    is_disabled = Column(Boolean)
    vehicle_type_id = Column(String)

class StationSnapshot(Base):
    __tablename__ = "station_snapshots"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    station_id = Column(String, index=True)
    name = Column(String)
    lat = Column(Float)
    lon = Column(Float)
    capacity = Column(Integer)
    num_bikes_available = Column(Integer)
    num_ebikes_available = Column(Integer)
    num_docks_available = Column(Integer)
    is_installed = Column(Boolean)
    is_renting = Column(Boolean)
    is_returning = Column(Boolean)