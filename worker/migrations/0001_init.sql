-- Migration number: 0001
-- Ported from bbike/app/models/snapshot.py (BikeSnapshot, StationSnapshot)
-- Timestamps are ISO-8601 UTC strings so API responses match FastAPI's .isoformat()

CREATE TABLE bike_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    bike_id TEXT,
    lat REAL,
    lon REAL,
    is_reserved INTEGER NOT NULL DEFAULT 0,
    is_disabled INTEGER NOT NULL DEFAULT 0,
    vehicle_type_id TEXT
);
CREATE INDEX idx_bike_snapshots_timestamp ON bike_snapshots(timestamp);
CREATE INDEX idx_bike_snapshots_bike_id ON bike_snapshots(bike_id);

CREATE TABLE station_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    station_id TEXT,
    name TEXT,
    lat REAL,
    lon REAL,
    capacity INTEGER NOT NULL DEFAULT 0,
    num_bikes_available INTEGER NOT NULL DEFAULT 0,
    num_ebikes_available INTEGER NOT NULL DEFAULT 0,
    num_docks_available INTEGER NOT NULL DEFAULT 0,
    is_installed INTEGER NOT NULL DEFAULT 0,
    is_renting INTEGER NOT NULL DEFAULT 0,
    is_returning INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_station_snapshots_timestamp ON station_snapshots(timestamp);
CREATE INDEX idx_station_snapshots_station_id ON station_snapshots(station_id);
