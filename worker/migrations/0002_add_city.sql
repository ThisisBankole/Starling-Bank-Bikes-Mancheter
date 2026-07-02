-- Migration number: 0002
-- Multi-city support: existing rows are all Manchester

ALTER TABLE bike_snapshots ADD COLUMN city TEXT NOT NULL DEFAULT 'manchester';
ALTER TABLE station_snapshots ADD COLUMN city TEXT NOT NULL DEFAULT 'manchester';

CREATE INDEX idx_bike_snapshots_city_timestamp ON bike_snapshots(city, timestamp);
CREATE INDEX idx_station_snapshots_city_timestamp ON station_snapshots(city, timestamp);
