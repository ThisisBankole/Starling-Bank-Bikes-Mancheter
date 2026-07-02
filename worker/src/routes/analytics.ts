import { Hono } from "hono";
import type { Env } from "../index";
import { resolveCity } from "../cities";

// Ported from bbike/app/api/v1/endpoints/analytics.py

const analytics = new Hono<{ Bindings: Env }>();

analytics.get("/snapshots/latest", async (c) => {
  const city = resolveCity(c.req.query("city"));
  if (!city) return c.json({ detail: "Unknown city" }, 400);
  const [bikeTs, stationTs] = await Promise.all([
    c.env.DB
      .prepare("SELECT MAX(timestamp) AS ts FROM bike_snapshots WHERE city = ?")
      .bind(city)
      .first<string>("ts"),
    c.env.DB
      .prepare("SELECT MAX(timestamp) AS ts FROM station_snapshots WHERE city = ?")
      .bind(city)
      .first<string>("ts"),
  ]);
  // Python returns a 200 with an error body here, not a 5xx
  if (!bikeTs || !stationTs) return c.json({ error: "No snapshots available yet" });

  const [bikeAgg, stationAgg] = await c.env.DB.batch([
    c.env.DB
      .prepare(
        `SELECT COUNT(*) AS total,
                SUM(CASE WHEN is_reserved = 0 AND is_disabled = 0 THEN 1 ELSE 0 END) AS available,
                SUM(is_reserved) AS reserved,
                SUM(is_disabled) AS disabled
         FROM bike_snapshots WHERE city = ? AND timestamp = ?`
      )
      .bind(city, bikeTs),
    c.env.DB
      .prepare(
        `SELECT COUNT(*) AS total,
                SUM(CASE WHEN is_installed = 1 AND is_renting = 1 THEN 1 ELSE 0 END) AS active,
                SUM(num_bikes_available) AS total_bikes,
                SUM(num_ebikes_available) AS total_ebikes
         FROM station_snapshots WHERE city = ? AND timestamp = ?`
      )
      .bind(city, stationTs),
  ]);

  const b = bikeAgg.results[0] as Record<string, number>;
  const s = stationAgg.results[0] as Record<string, number>;
  return c.json({
    timestamp: bikeTs,
    bikes: {
      total: b.total,
      available: b.available ?? 0,
      reserved: b.reserved ?? 0,
      disabled: b.disabled ?? 0,
    },
    stations: {
      total: s.total,
      active: s.active ?? 0,
      total_bikes: s.total_bikes ?? 0,
      total_ebikes: s.total_ebikes ?? 0,
    },
  });
});

analytics.get("/snapshots/history", async (c) => {
  const city = resolveCity(c.req.query("city"));
  if (!city) return c.json({ detail: "Unknown city" }, 400);
  const hours = Number(c.req.query("hours") ?? 24);
  const cutoff = new Date(Date.now() - hours * 3600_000).toISOString();

  // The Python version ran 3 queries per timestamp (N+1); this does one GROUP BY per table
  const [bikeRows, stationRows] = await c.env.DB.batch([
    c.env.DB
      .prepare(
        `SELECT timestamp,
                SUM(CASE WHEN is_reserved = 0 AND is_disabled = 0 THEN 1 ELSE 0 END) AS bikes_available
         FROM bike_snapshots WHERE city = ? AND timestamp >= ?
         GROUP BY timestamp ORDER BY timestamp DESC`
      )
      .bind(city, cutoff),
    c.env.DB
      .prepare(
        `SELECT timestamp,
                SUM(is_renting) AS stations_active,
                SUM(num_bikes_available) AS total_bikes_at_stations
         FROM station_snapshots WHERE city = ? AND timestamp >= ?
         GROUP BY timestamp`
      )
      .bind(city, cutoff),
  ]);

  const stationList = stationRows.results as {
    timestamp: string;
    stations_active: number;
    total_bikes_at_stations: number;
  }[];

  // Bike and station snapshots for a city share a timestamp within a cron tick,
  // but tolerate drift by pairing each bike row with the nearest earlier station row
  const stationByTs = new Map(stationList.map((r) => [r.timestamp, r]));
  const history = (bikeRows.results as { timestamp: string; bikes_available: number }[]).map((r) => ({
    timestamp: r.timestamp,
    bikes_available: r.bikes_available,
    stations_active: stationByTs.get(r.timestamp)?.stations_active ?? 0,
    total_bikes_at_stations: stationByTs.get(r.timestamp)?.total_bikes_at_stations ?? 0,
  }));

  return c.json({ hours, data_points: history.length, history });
});

analytics.get("/stations/popular", async (c) => {
  const city = resolveCity(c.req.query("city"));
  if (!city) return c.json({ detail: "Unknown city" }, 400);
  const limit = Number(c.req.query("limit") ?? 10);
  const hasData = await c.env.DB
    .prepare("SELECT MAX(timestamp) AS ts FROM station_snapshots WHERE city = ?")
    .bind(city)
    .first<string>("ts");
  if (!hasData) return c.json({ error: "No data available" });

  const cutoff = new Date(Date.now() - 24 * 3600_000).toISOString();
  const { results } = await c.env.DB
    .prepare(
      `SELECT station_id, name, AVG(num_bikes_available) AS avg_bikes
       FROM station_snapshots WHERE city = ? AND timestamp >= ?
       GROUP BY station_id, name
       ORDER BY avg_bikes DESC LIMIT ?`
    )
    .bind(city, cutoff, limit)
    .all<{ station_id: string; name: string; avg_bikes: number }>();

  return c.json({
    popular_stations: results.map((s) => ({
      station_id: s.station_id,
      name: s.name,
      average_bikes: Math.round(s.avg_bikes * 100) / 100,
    })),
  });
});

export default analytics;
