import { Hono } from "hono";
import type { Env } from "../index";
import { resolveCity } from "../cities";

// Ported from bbike/app/api/v1/endpoints/station.py

type StationRow = {
  timestamp: string;
  station_id: string;
  name: string;
  lat: number;
  lon: number;
  capacity: number;
  num_bikes_available: number;
  num_ebikes_available: number;
  num_docks_available: number;
  is_installed: number;
  is_renting: number;
  is_returning: number;
};

async function latestStationTimestamp(db: D1Database, city: string): Promise<string | null> {
  return db
    .prepare("SELECT MAX(timestamp) AS ts FROM station_snapshots WHERE city = ?")
    .bind(city)
    .first<string>("ts");
}

function stationStatus(s: StationRow) {
  return {
    num_bikes_available: s.num_bikes_available,
    num_ebikes_available: s.num_ebikes_available,
    num_docks_available: s.num_docks_available,
    is_installed: !!s.is_installed,
    is_renting: !!s.is_renting,
    is_returning: !!s.is_returning,
  };
}

function stationFull(s: StationRow) {
  return {
    station_id: s.station_id,
    name: s.name,
    lat: s.lat,
    lon: s.lon,
    capacity: s.capacity,
    status: stationStatus(s),
  };
}

const stations = new Hono<{ Bindings: Env }>();

stations.get("/stations/all", async (c) => {
  const city = resolveCity(c.req.query("city"));
  if (!city) return c.json({ detail: "Unknown city" }, 400);
  const ts = await latestStationTimestamp(c.env.DB, city);
  if (!ts) return c.json({ detail: "No station data available yet" }, 503);
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM station_snapshots WHERE city = ? AND timestamp = ?"
  )
    .bind(city, ts)
    .all<StationRow>();
  return c.json({ last_updated: ts, stations: results.map(stationFull) });
});

stations.get("/stations", async (c) => {
  const city = resolveCity(c.req.query("city"));
  if (!city) return c.json({ detail: "Unknown city" }, 400);
  const ts = await latestStationTimestamp(c.env.DB, city);
  if (!ts) return c.json({ detail: "No station data available yet" }, 503);
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM station_snapshots WHERE city = ? AND timestamp = ?"
  )
    .bind(city, ts)
    .all<StationRow>();
  return c.json({
    last_updated: ts,
    stations: results.map((s) => ({
      station_id: s.station_id,
      name: s.name,
      lat: s.lat,
      lon: s.lon,
      capacity: s.capacity,
    })),
  });
});

stations.get("/stations/status", async (c) => {
  const city = resolveCity(c.req.query("city"));
  if (!city) return c.json({ detail: "Unknown city" }, 400);
  const ts = await latestStationTimestamp(c.env.DB, city);
  if (!ts) return c.json({ detail: "No station data available yet" }, 503);
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM station_snapshots WHERE city = ? AND timestamp = ?"
  )
    .bind(city, ts)
    .all<StationRow>();
  return c.json({
    last_updated: ts,
    statuses: results.map((s) => ({ station_id: s.station_id, ...stationStatus(s) })),
  });
});

stations.get("/stations/active", async (c) => {
  const city = resolveCity(c.req.query("city"));
  if (!city) return c.json({ detail: "Unknown city" }, 400);
  const ts = await latestStationTimestamp(c.env.DB, city);
  if (!ts) return c.json({ detail: "No station data available yet" }, 503);
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM station_snapshots WHERE city = ? AND timestamp = ? AND is_renting = 1"
  )
    .bind(city, ts)
    .all<StationRow>();
  return c.json({ last_updated: ts, stations: results.map(stationFull) });
});

stations.get("/stations/inactive", async (c) => {
  const city = resolveCity(c.req.query("city"));
  if (!city) return c.json({ detail: "Unknown city" }, 400);
  const ts = await latestStationTimestamp(c.env.DB, city);
  if (!ts) return c.json({ detail: "No station data available yet" }, 503);
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM station_snapshots WHERE city = ? AND timestamp = ? AND is_renting = 0"
  )
    .bind(city, ts)
    .all<StationRow>();
  return c.json({ last_updated: ts, stations: results.map(stationFull) });
});

// Must stay the last-registered /stations route so static paths match first
stations.get("/stations/:station_id", async (c) => {
  const city = resolveCity(c.req.query("city"));
  if (!city) return c.json({ detail: "Unknown city" }, 400);
  const ts = await latestStationTimestamp(c.env.DB, city);
  if (!ts) return c.json({ detail: "No station data available yet" }, 503);
  const station = await c.env.DB.prepare(
    "SELECT * FROM station_snapshots WHERE city = ? AND timestamp = ? AND station_id = ?"
  )
    .bind(city, ts, c.req.param("station_id"))
    .first<StationRow>();
  if (!station) return c.json({ detail: "Station not found" }, 404);
  return c.json({ last_updated: ts, station: stationFull(station) });
});

export default stations;
