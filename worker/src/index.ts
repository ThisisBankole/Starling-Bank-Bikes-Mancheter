import { Hono } from "hono";
import { cors } from "hono/cors";
import { takeSnapshot } from "./snapshot";
import bikes from "./routes/bikes";
import stations from "./routes/stations";
import analytics from "./routes/analytics";

export type Env = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Env }>();

// Same-origin once the frontend moves onto this Worker (Phase 4); until then,
// allow the existing frontend hosts, mirroring bbike/app/main.py
app.use(
  "/api/*",
  cors({
    origin: [
      "https://bikes.desertnode.com",
      "https://bike-monitor-dkbkh8anaweqd0e3.ukwest-01.azurewebsites.net",
      "http://localhost:3000",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);

app.get("/api/v1/health", (c) => c.json({ status: "ok" }));

app.route("/api/v1", bikes);
// analytics registers /stations/popular, which must precede stations' /stations/:station_id
app.route("/api/v1", analytics);
app.route("/api/v1", stations);

export default {
  fetch: app.fetch,
  async scheduled(_event, env, _ctx) {
    await takeSnapshot(env);
  },
} satisfies ExportedHandler<Env>;
