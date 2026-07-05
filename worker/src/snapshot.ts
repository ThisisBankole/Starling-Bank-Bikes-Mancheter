import type { Env } from "./index";
import { CITIES, type City } from "./cities";

// gbfs_service.py accepted feeds up to 2x the 5-minute max_age
const MAX_STALENESS_SECONDS = 600;
const RETENTION_DAYS = 90;

// last_updated is epoch seconds in GBFS 2.2, an ISO-8601 string in 3.0
type GbfsFeed<T> = { last_updated: number | string; data: T };

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

// GBFS 3.0 shapes (Bolt): renamed feeds/fields, localized station names
type V3Vehicle = {
  vehicle_id: string;
  lat: number;
  lon: number;
  is_reserved: boolean;
  is_disabled: boolean;
  vehicle_type_id?: string;
};

type V3StationInfo = Omit<StationInfo, "name"> & {
  name: { language: string; text: string }[];
};

type V3StationStatus = Omit<StationStatus, "num_bikes_available"> & {
  num_vehicles_available?: number;
};

async function fetchFeed<T>(base: string, path: string): Promise<GbfsFeed<T>> {
  const res = await fetch(`${base}/${path}`);
  if (!res.ok) throw new Error(`GBFS ${base}/${path}: HTTP ${res.status}`);
  return res.json();
}

function isFresh(feed: GbfsFeed<unknown>): boolean {
  const updated =
    typeof feed.last_updated === "number" ? feed.last_updated : Date.parse(feed.last_updated) / 1000;
  return Date.now() / 1000 - updated < MAX_STALENESS_SECONDS;
}

type CityFeeds = {
  bikes: GbfsFeed<{ bikes: Bike[] }>;
  stationInfo: GbfsFeed<{ stations: StationInfo[] }>;
  stationStatus: GbfsFeed<{ stations: StationStatus[] }>;
};

async function fetchCityFeeds(city: City): Promise<CityFeeds> {
  if (city.feedFormat === "3.0") {
    const [vehicles, info, status] = await Promise.all([
      fetchFeed<{ vehicles: V3Vehicle[] }>(city.gbfsBase, "vehicle_status"),
      fetchFeed<{ stations: V3StationInfo[] }>(city.gbfsBase, "station_information"),
      fetchFeed<{ stations: V3StationStatus[] }>(city.gbfsBase, "station_status"),
    ]);
    return {
      bikes: {
        last_updated: vehicles.last_updated,
        data: {
          bikes: vehicles.data.vehicles.map((v) => ({
            bike_id: v.vehicle_id,
            lat: v.lat,
            lon: v.lon,
            is_reserved: v.is_reserved,
            is_disabled: v.is_disabled,
            vehicle_type_id: v.vehicle_type_id,
          })),
        },
      },
      stationInfo: {
        last_updated: info.last_updated,
        data: {
          stations: info.data.stations.map((s) => ({
            ...s,
            name: s.name.find((n) => n.language === "en")?.text ?? s.name[0]?.text ?? s.station_id,
          })),
        },
      },
      stationStatus: {
        last_updated: status.last_updated,
        data: {
          stations: status.data.stations.map((s) => ({
            ...s,
            num_bikes_available: s.num_vehicles_available,
          })),
        },
      },
    };
  }

  const [bikes, stationInfo, stationStatus] = await Promise.all([
    fetchFeed<{ bikes: Bike[] }>(city.gbfsBase, "free_bike_status.json"),
    fetchFeed<{ stations: StationInfo[] }>(city.gbfsBase, "station_information.json"),
    fetchFeed<{ stations: StationStatus[] }>(city.gbfsBase, "station_status.json"),
  ]);
  return { bikes, stationInfo, stationStatus };
}

async function snapshotCity(env: Env, city: City): Promise<void> {
  const { bikes, stationInfo, stationStatus } = await fetchCityFeeds(city);

  const timestamp = new Date().toISOString();
  const statements: D1PreparedStatement[] = [];

  if (isFresh(bikes)) {
    const insertBike = env.DB.prepare(
      `INSERT INTO bike_snapshots
         (city, timestamp, bike_id, lat, lon, is_reserved, is_disabled, vehicle_type_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const b of bikes.data.bikes) {
      statements.push(
        insertBike.bind(
          city.id,
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
    console.warn(`[${city.id}] Skipping bike snapshot: feed stale (last_updated=${bikes.last_updated})`);
  }

  if (isFresh(stationStatus)) {
    const statusMap = new Map(stationStatus.data.stations.map((s) => [s.station_id, s]));
    const insertStation = env.DB.prepare(
      `INSERT INTO station_snapshots
         (city, timestamp, station_id, name, lat, lon, capacity,
          num_bikes_available, num_ebikes_available, num_docks_available,
          is_installed, is_renting, is_returning)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const s of stationInfo.data.stations) {
      const status = statusMap.get(s.station_id);
      statements.push(
        insertStation.bind(
          city.id,
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
    console.warn(`[${city.id}] Skipping station snapshot: feed stale (last_updated=${stationStatus.last_updated})`);
  }

  if (statements.length > 0) {
    await env.DB.batch(statements);
  }
  console.log(
    `[${city.id}] Snapshot ${timestamp}: ${isFresh(bikes) ? bikes.data.bikes.length : 0} bikes, ` +
      `${isFresh(stationStatus) ? stationInfo.data.stations.length : 0} stations`
  );
}

export async function takeSnapshot(env: Env): Promise<void> {
  // One city failing (stale feed, network) must not block the others
  const results = await Promise.allSettled(CITIES.map((city) => snapshotCity(env, city)));
  for (const [i, r] of results.entries()) {
    if (r.status === "rejected") console.error(`[${CITIES[i].id}] Snapshot failed:`, r.reason);
  }

  // Cutoff computed in JS: stored timestamps are ISO-8601 with 'T', which
  // doesn't compare correctly against SQLite's datetime('now') format
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 86400_000).toISOString();
  await env.DB.batch([
    env.DB.prepare("DELETE FROM bike_snapshots WHERE timestamp < ?").bind(cutoff),
    env.DB.prepare("DELETE FROM station_snapshots WHERE timestamp < ?").bind(cutoff),
  ]);
}
