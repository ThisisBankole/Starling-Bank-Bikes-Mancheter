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
  ├── tailwind.config.js         # Tailwind config
  └── eslint.config.js           # Linting config

- bbike/                   # Backend API (Python, FastAPI, Uvicorn)
  ├── app/
  │   └── main.py               # FastAPI application entry
  └── Dockerfile                # Containerization for backend
```

## Getting Started

### Prerequisites

- Node.js & npm (for frontend)
- Python 3.10+ (for backend)
- Docker (optional, for backend containerization)

### Installation

**Frontend:**

```sh
cd bike-sharing-dashboard
npm install
npm run dev
```

**Backend:**

```sh
cd bbike
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Alternatively, run the backend with Docker:

```sh
cd bbike
docker build -t starling-bike-backend .
docker run -p 8000:8000 starling-bike-backend
```

### Usage

- Visit [localhost:5173](http://localhost:5173) (or the port Vite specifies) for the dashboard UI.
- Backend API will run on [localhost:8000](http://localhost:8000).

## Technologies Used

- **Frontend:** React, TypeScript, Tailwind CSS, Vite, Radix UI
- **Backend:** Python, FastAPI, Uvicorn
- **Containerization:** Docker

## Contributing

Contributions and suggestions are welcome! Please open issues or submit pull requests.

## License

This project currently does not specify a license.

## Author

[ThisisBankole](https://github.com/ThisisBankole)
