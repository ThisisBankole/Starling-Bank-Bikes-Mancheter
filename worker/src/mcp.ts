import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { z } from "zod";
import type { Env } from "./index";
import { CITIES, resolveCity } from "./cities";

const json = (data: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
});

const errorResult = (message: string) => ({
  content: [{ type: "text" as const, text: message }],
  isError: true,
});

const distanceKm = (aLat: number, aLon: number, bLat: number, bLon: number) => {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

type StationRow = {
  station_id: string;
  name: string;
  lat: number;
  lon: number;
  capacity: number;
  num_bikes_available: number;
  num_ebikes_available: number;
  num_docks_available: number;
  is_renting: number;
};

const cityParam = z
  .string()
  .describe("City id: one of " + CITIES.map((c) => c.id).join(", "));

export class CycleTrackerMCP extends McpAgent<Env> {
  server = new McpServer({ name: "cycle-tracker", version: "1.0.0" });

  async init() {
    this.server.registerTool(
      "list_cities",
      {
        description:
          "List the bike-share cities Cycle Tracker covers, with their ids (used by every other tool) and map coordinates.",
        inputSchema: {},
      },
      async () =>
        json(
          CITIES.map(({ id, name, center }) => ({ id, name, center }))
        )
    );

    this.server.registerTool(
      "get_network_status",
      {
        description:
          "Live network totals for a city: bikes available, e-bikes, active stations, bikes docked at stations. Data refreshes every 10 minutes.",
        inputSchema: { city: cityParam },
      },
      async ({ city: cityInput }) => {
        const city = resolveCity(cityInput);
        if (!city) return errorResult(`Unknown city '${cityInput}'. Use list_cities.`);

        const ts = await this.latestStationTimestamp(city);
        if (!ts) return errorResult("No data for this city yet.");

        const [bikeAgg, stationAgg] = await this.env.DB.batch([
          this.env.DB
            .prepare(
              `SELECT COUNT(*) AS bikes_total,
                      SUM(CASE WHEN is_reserved = 0 AND is_disabled = 0 THEN 1 ELSE 0 END) AS bikes_available
               FROM bike_snapshots
               WHERE city = ? AND timestamp = (SELECT MAX(timestamp) FROM bike_snapshots WHERE city = ?)`
            )
            .bind(city, city),
          this.env.DB
            .prepare(
              `SELECT COUNT(*) AS stations_total,
                      SUM(CASE WHEN is_installed = 1 AND is_renting = 1 THEN 1 ELSE 0 END) AS stations_active,
                      SUM(num_bikes_available) AS bikes_at_stations,
                      SUM(num_ebikes_available) AS ebikes_at_stations
               FROM station_snapshots WHERE city = ? AND timestamp = ?`
            )
            .bind(city, ts),
        ]);

        return json({
          city,
          as_of: ts,
          ...(bikeAgg.results[0] as object),
          ...(stationAgg.results[0] as object),
        });
      }
    );

    this.server.registerTool(
      "find_stations",
      {
        description:
          "Find bike stations in a city with live availability. Filter by a name search and/or sort by distance from a coordinate (results then include distance_km). Without lat/lon, results are sorted by most bikes available.",
        inputSchema: {
          city: cityParam,
          query: z.string().optional().describe("Case-insensitive station name filter"),
          lat: z.number().optional().describe("Latitude to sort by proximity"),
          lon: z.number().optional().describe("Longitude to sort by proximity"),
          limit: z.number().int().min(1).max(50).default(10),
        },
      },
      async ({ city: cityInput, query, lat, lon, limit }) => {
        const city = resolveCity(cityInput);
        if (!city) return errorResult(`Unknown city '${cityInput}'. Use list_cities.`);

        const ts = await this.latestStationTimestamp(city);
        if (!ts) return errorResult("No data for this city yet.");

        const { results } = await this.env.DB
          .prepare("SELECT * FROM station_snapshots WHERE city = ? AND timestamp = ?")
          .bind(city, ts)
          .all<StationRow>();

        let stations = results.map((s) => ({
          station_id: s.station_id,
          name: s.name,
          lat: s.lat,
          lon: s.lon,
          bikes_available: s.num_bikes_available,
          ebikes_available: s.num_ebikes_available,
          docks_available: s.num_docks_available,
          capacity: s.capacity,
          is_renting: !!s.is_renting,
          ...(lat !== undefined && lon !== undefined
            ? { distance_km: Math.round(distanceKm(lat, lon, s.lat, s.lon) * 100) / 100 }
            : {}),
        }));

        if (query) {
          const q = query.toLowerCase();
          stations = stations.filter((s) => s.name.toLowerCase().includes(q));
        }

        stations.sort((a, b) =>
          "distance_km" in a && "distance_km" in b
            ? (a.distance_km as number) - (b.distance_km as number)
            : b.bikes_available - a.bikes_available
        );

        return json({ city, as_of: ts, stations: stations.slice(0, limit) });
      }
    );

    this.server.registerTool(
      "get_popular_stations",
      {
        description:
          "Busiest stations in a city ranked by average bikes available over the last 24 hours.",
        inputSchema: {
          city: cityParam,
          limit: z.number().int().min(1).max(50).default(10),
        },
      },
      async ({ city: cityInput, limit }) => {
        const city = resolveCity(cityInput);
        if (!city) return errorResult(`Unknown city '${cityInput}'. Use list_cities.`);

        const cutoff = new Date(Date.now() - 24 * 3600_000).toISOString();
        const { results } = await this.env.DB
          .prepare(
            `SELECT station_id, name, ROUND(AVG(num_bikes_available), 2) AS average_bikes
             FROM station_snapshots WHERE city = ? AND timestamp >= ?
             GROUP BY station_id, name
             ORDER BY average_bikes DESC LIMIT ?`
          )
          .bind(city, cutoff, limit)
          .all();

        return json({ city, window: "24h", popular_stations: results });
      }
    );

    this.server.registerTool(
      "get_availability_trend",
      {
        description:
          "Time series of bikes available and active stations for a city, one point per 10-minute snapshot, newest first. Up to 90 days of history.",
        inputSchema: {
          city: cityParam,
          hours: z.number().int().min(1).max(2160).default(24),
        },
      },
      async ({ city: cityInput, hours }) => {
        const city = resolveCity(cityInput);
        if (!city) return errorResult(`Unknown city '${cityInput}'. Use list_cities.`);

        const cutoff = new Date(Date.now() - hours * 3600_000).toISOString();
        const { results } = await this.env.DB
          .prepare(
            `SELECT timestamp,
                    SUM(CASE WHEN is_reserved = 0 AND is_disabled = 0 THEN 1 ELSE 0 END) AS bikes_available
             FROM bike_snapshots WHERE city = ? AND timestamp >= ?
             GROUP BY timestamp ORDER BY timestamp DESC`
          )
          .bind(city, cutoff)
          .all();

        return json({ city, hours, data_points: results.length, history: results });
      }
    );
  }

  private latestStationTimestamp(city: string): Promise<string | null> {
    return this.env.DB
      .prepare("SELECT MAX(timestamp) AS ts FROM station_snapshots WHERE city = ?")
      .bind(city)
      .first<string>("ts");
  }
}
