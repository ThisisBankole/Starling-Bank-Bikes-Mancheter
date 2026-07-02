import { Hono } from "hono";
import type { Env } from "../index";
import { resolveCity } from "../cities";

// Ported from bbike/app/api/v1/endpoints/bikes.py
// 503 only when there is no snapshot at all; filtered queries may return empty lists.

type BikeRow = {
  timestamp: string;
  bike_id: string;
  lat: number;
  lon: number;
  is_reserved: number;
  is_disabled: number;
  vehicle_type_id: string;
};

async function latestBikeTimestamp(db: D1Database, city: string): Promise<string | null> {
  return db
    .prepare("SELECT MAX(timestamp) AS ts FROM bike_snapshots WHERE city = ?")
    .bind(city)
    .first<string>("ts");
}

const bikes = new Hono<{ Bindings: Env }>();

bikes.get("/bikes", async (c) => {
  const city = resolveCity(c.req.query("city"));
  if (!city) return c.json({ detail: "Unknown city" }, 400);
  const ts = await latestBikeTimestamp(c.env.DB, city);
  if (!ts) return c.json({ detail: "No bike data available yet" }, 503);
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM bike_snapshots WHERE city = ? AND timestamp = ?"
  )
    .bind(city, ts)
    .all<BikeRow>();
  return c.json({
    last_updated: ts,
    data: results.map((b) => ({
      bike_id: b.bike_id,
      lat: b.lat,
      lon: b.lon,
      is_reserved: !!b.is_reserved,
      is_disabled: !!b.is_disabled,
      vehicle_type_id: b.vehicle_type_id,
    })),
  });
});

bikes.get("/bikes/available", async (c) => {
  const city = resolveCity(c.req.query("city"));
  if (!city) return c.json({ detail: "Unknown city" }, 400);
  const ts = await latestBikeTimestamp(c.env.DB, city);
  if (!ts) return c.json({ detail: "No bike data available yet" }, 503);
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM bike_snapshots WHERE city = ? AND timestamp = ? AND is_reserved = 0 AND is_disabled = 0"
  )
    .bind(city, ts)
    .all<BikeRow>();
  return c.json({
    last_updated: ts,
    available_bikes: results.map((b) => ({
      bike_id: b.bike_id,
      lat: b.lat,
      lon: b.lon,
      vehicle_type_id: b.vehicle_type_id,
    })),
  });
});

bikes.get("/ebikes", async (c) => {
  const city = resolveCity(c.req.query("city"));
  if (!city) return c.json({ detail: "Unknown city" }, 400);
  const ts = await latestBikeTimestamp(c.env.DB, city);
  if (!ts) return c.json({ detail: "No bike data available yet" }, 503);
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM bike_snapshots WHERE city = ? AND timestamp = ? AND vehicle_type_id = 'bbe'"
  )
    .bind(city, ts)
    .all<BikeRow>();
  return c.json({
    last_updated: ts,
    ebikes: results.map((b) => ({
      bike_id: b.bike_id,
      lat: b.lat,
      lon: b.lon,
      is_reserved: !!b.is_reserved,
      is_disabled: !!b.is_disabled,
    })),
  });
});

export default bikes;
