import type { Env } from "./index";

const GBFS_BASE = "https://beryl-gbfs-production.web.app/v2_2/Greater_Manchester";
// gbfs_service.py accepted feeds up to 2x the 5-minute max_age
const MAX_STALENESS_SECONDS = 600;
const RETENTION_DAYS = 90;

type GbfsFeed<T> = { last_updated: number; data: T };

type Bike = {
  bike_id: string;
  lat: number;
  lon: number;
  is_reserved: boolean;
  is_disabled: boolean;
  vehicle_type_id?: string;
};

type StationInfo = {
  station_id: string;
  name: string;
  lat: number;
  lon: number;
  capacity?: number;
};

type StationStatus = {
  station_id: string;
  num_bikes_available?: number;
  num_docks_available?: number;
  is_installed?: boolean;
  is_renting?: boolean;
  is_returning?: boolean;
  vehicle_types_available?: { vehicle_type_id?: string; count?: number }[];
};

async function fetchFeed<T>(path: string): Promise<GbfsFeed<T>> {
  const res = await fetch(`${GBFS_BASE}/${path}`);
  if (!res.ok) throw new Error(`GBFS ${path}: HTTP ${res.status}`);
  return res.json();
}

function isFresh(feed: GbfsFeed<unknown>): boolean {
  return Date.now() / 1000 - feed.last_updated < MAX_STALENESS_SECONDS;
}

export async function takeSnapshot(env: Env): Promise<void> {
  const [bikes, stationInfo, stationStatus] = await Promise.all([
    fetchFeed<{ bikes: Bike[] }>("free_bike_status.json"),
    fetchFeed<{ stations: StationInfo[] }>("station_information.json"),
    fetchFeed<{ stations: StationStatus[] }>("station_status.json"),
  ]);

  const timestamp = new Date().toISOString();
  const statements: D1PreparedStatement[] = [];

  if (isFresh(bikes)) {
    const insertBike = env.DB.prepare(
      `INSERT INTO bike_snapshots
         (timestamp, bike_id, lat, lon, is_reserved, is_disabled, vehicle_type_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    for (const b of bikes.data.bikes) {
      statements.push(
        insertBike.bind(
          timestamp,
          b.bike_id,
          b.lat,
          b.lon,
          b.is_reserved ? 1 : 0,
          b.is_disabled ? 1 : 0,
          b.vehicle_type_id ?? "unknown"
        )
      );
    }
  } else {
    console.warn(`Skipping bike snapshot: feed stale (last_updated=${bikes.last_updated})`);
  }

  if (isFresh(stationStatus)) {
    const statusMap = new Map(stationStatus.data.stations.map((s) => [s.station_id, s]));
    const insertStation = env.DB.prepare(
      `INSERT INTO station_snapshots
         (timestamp, station_id, name, lat, lon, capacity,
          num_bikes_available, num_ebikes_available, num_docks_available,
          is_installed, is_renting, is_returning)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const s of stationInfo.data.stations) {
      const status = statusMap.get(s.station_id);
      statements.push(
        insertStation.bind(
          timestamp,
          s.station_id,
          s.name,
          s.lat,
          s.lon,
          s.capacity ?? 0,
          status?.num_bikes_available ?? 0,
          status?.vehicle_types_available?.[0]?.count ?? 0,
          status?.num_docks_available ?? 0,
          status?.is_installed ? 1 : 0,
          status?.is_renting ? 1 : 0,
          status?.is_returning ? 1 : 0
        )
      );
    }
  } else {
    console.warn(`Skipping station snapshot: feed stale (last_updated=${stationStatus.last_updated})`);
  }

  // Cutoff computed in JS: stored timestamps are ISO-8601 with 'T', which
  // doesn't compare correctly against SQLite's datetime('now') format
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 86400_000).toISOString();
  statements.push(env.DB.prepare("DELETE FROM bike_snapshots WHERE timestamp < ?").bind(cutoff));
  statements.push(env.DB.prepare("DELETE FROM station_snapshots WHERE timestamp < ?").bind(cutoff));

  await env.DB.batch(statements);
  console.log(
    `Snapshot ${timestamp}: ${isFresh(bikes) ? bikes.data.bikes.length : 0} bikes, ` +
      `${isFresh(stationStatus) ? stationInfo.data.stations.length : 0} stations`
  );
}
