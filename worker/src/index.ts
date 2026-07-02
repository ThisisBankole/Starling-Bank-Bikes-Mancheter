import { Hono } from "hono";
import { cors } from "hono/cors";
import { takeSnapshot } from "./snapshot";
import { CITIES, DEFAULT_CITY } from "./cities";
import bikes from "./routes/bikes";
import stations from "./routes/stations";
import analytics from "./routes/analytics";

export type Env = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Env }>();

// Production is same-origin (the Worker serves the frontend); CORS is only
// for the Vite dev server hitting a local or deployed Worker
app.use(
  "/api/*",
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);

app.get("/api/v1/health", (c) => c.json({ status: "ok" }));

app.get("/api/v1/cities", (c) =>
  c.json({
    default: DEFAULT_CITY,
    cities: CITIES.map(({ id, name, center, bounds }) => ({ id, name, center, bounds })),
  })
);

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
