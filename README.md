# Starling Bank Bikes Manchester

A dashboard for real-time monitoring and analytics of bike-sharing stations in Manchester, powered by Starling Bank. This project features both a web frontend and a backend API.

## Features

- **Live bike and station stats**: View availability, utilization, and capacity for stations.
- **Interactive map**: Visualize station locations and bike distribution.
- **Popular stations analytics**: Insights into the most-used and highest capacity stations.
- **Modern UI**: Built with React, Tailwind CSS, and Radix UI for a responsive experience.

## Project Structure

```
- bike-sharing-dashboard/   # Frontend (React, TypeScript, Vite)
  ├── src/
  │   ├── components/
  │   │   ├── dashboard/         # Dashboard features (PopularStationAnalytics, StatsCards, InteractiveMap)
  │   │   ├── home/              # Home page
  │   │   └── ui/                # UI primitives (Sheet, Tabs, Card, Table)
  │   ├── lib/                   # Utility functions
  │   ├── App.css, index.css     # Styles
  │   └── main.tsx               # App entry point
  ├── index.html                 # Root HTML
  ├── vite.config.ts             # Vite config
  └── tailwind.config.js         # Tailwind config

- worker/                   # Backend (Cloudflare Worker, TypeScript, Hono, D1)
  ├── src/
  │   ├── index.ts              # Hono app, CORS, static assets, cron entry
  │   ├── snapshot.ts           # GBFS feed -> D1 snapshot job (10-min cron)
  │   └── routes/               # API routes (bikes, stations, analytics)
  ├── migrations/               # D1 schema migrations
  └── wrangler.jsonc            # Worker + D1 + cron + custom domain config
```

## Getting Started

### Prerequisites

- Node.js & npm
- A Cloudflare account (Workers + D1) for deployment

### Local development

**Backend (Worker + local D1):**

```sh
cd worker
npm install
npm run migrate:local   # first time only
npx wrangler dev        # API on http://localhost:8787
```

**Frontend:**

```sh
cd bike-sharing-dashboard
npm install
npm run dev             # UI on http://localhost:5173, calls the local worker
```

### Deployment

Live at [cycle.arrakis.house](https://cycle.arrakis.house). Pushes to `main` that touch
`worker/` or `bike-sharing-dashboard/` trigger `.github/workflows/deploy.yml`, which builds
the frontend, applies D1 migrations, and runs `wrangler deploy`. The Worker serves the
static frontend and the `/api/v1` API from the same origin, and a 10-minute cron snapshots
the Beryl GBFS feeds into D1.

## Technologies Used

- **Frontend:** React, TypeScript, Tailwind CSS, Vite, Radix UI
- **Backend:** Cloudflare Workers, Hono, D1 (SQLite), TypeScript

## Author

[ThisisBankole](https://github.com/ThisisBankole)
