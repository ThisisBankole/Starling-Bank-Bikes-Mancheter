# Starling Bank Bikes Manchester

Starling Bank Bikes Manchester is a dashboard that monitors bike-sharing stations in
Manchester in real time and reports analytics about them. The project includes a web
frontend and a backend API.

## Features

- **Live bike and station stats**: View availability, utilization, and capacity for each station.
- **Interactive map**: See station locations and bike distribution.
- **Popular-station analytics**: Find the most-used and highest-capacity stations.
- **Modern UI**: Use a responsive interface built with React, Tailwind CSS, and Radix UI.

## Project structure

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
  └── wrangler.jsonc            # Worker + D1 + cron + custom-domain config
```

## Get started

### Prerequisites

- Node.js and npm
- A Cloudflare account with Workers and D1, for deployment

### Develop locally

To run the backend (Worker plus local D1), enter the following commands:

```sh
cd worker
npm install
npm run migrate:local   # first time only
npx wrangler dev        # API on http://localhost:8787
```

To run the frontend, enter the following commands:

```sh
cd bike-sharing-dashboard
npm install
npm run dev             # UI on http://localhost:5173, calls the local worker
```

### Deploy

The app runs at [cycle.arrakis.house](https://cycle.arrakis.house). When you push a
change to `main` that touches `worker/` or `bike-sharing-dashboard/`, the
`.github/workflows/deploy.yml` workflow builds the frontend, applies the D1 migrations,
and runs `wrangler deploy`. The Worker serves the static frontend and the `/api/v1` API
from the same origin. A 10-minute cron job snapshots the Manchester Beryl General
Bikeshare Feed Specification (GBFS) feed into D1.

## Technologies used

- **Frontend:** React, TypeScript, Tailwind CSS, Vite, Radix UI
- **Backend:** Cloudflare Workers, Hono, D1 (SQLite), TypeScript

## Author

[ThisisBankole](https://github.com/ThisisBankole)
