# REST API

All endpoints are `GET`, return JSON, and accept a `city` query parameter (default `manchester`; see `GET /cities` for all supported ids). Unknown cities return `400`.

## Cities

### GET /cities

Supported cities with map centers and bounds.

```bash
curl "https://cycle.arrakis.house/api/v1/cities"
```

## Bikes

### GET /bikes

Every bike in the latest snapshot, with position and status.

```bash
curl "https://cycle.arrakis.house/api/v1/bikes?city=bradford"
```

```json
{
  "last_updated": "2026-07-03T12:50:37.821Z",
  "data": [
    {
      "bike_id": "4043a8f7...",
      "lat": 53.795,
      "lon": -1.752,
      "is_reserved": false,
      "is_disabled": false,
      "vehicle_type_id": "bbe"
    }
  ]
}
```

### GET /bikes/available

Only bikes that are neither reserved nor disabled.

### GET /ebikes

E-bikes only.

## Stations

### GET /stations/active

Stations currently renting, with live availability — the most useful station endpoint.

```bash
curl "https://cycle.arrakis.house/api/v1/stations/active?city=bcp"
```

```json
{
  "last_updated": "2026-07-03T12:50:37.931Z",
  "stations": [
    {
      "station_id": "2976",
      "name": "Salford Museum and Art Gallery",
      "lat": 53.487,
      "lon": -2.271,
      "capacity": 10,
      "status": {
        "num_bikes_available": 7,
        "num_ebikes_available": 3,
        "num_docks_available": 3,
        "is_installed": true,
        "is_renting": true,
        "is_returning": true
      }
    }
  ]
}
```

Related variants: `/stations` (names and positions only), `/stations/all`, `/stations/status`, `/stations/inactive`, and `/stations/{station_id}` for a single station.

## Analytics

### GET /snapshots/latest

Network-wide totals from the latest snapshot.

```bash
curl "https://cycle.arrakis.house/api/v1/snapshots/latest?city=manchester"
```

### GET /snapshots/history

Availability time series. Takes `hours` (default `24`).

```bash
curl "https://cycle.arrakis.house/api/v1/snapshots/history?hours=6&city=manchester"
```

### GET /stations/popular

Busiest stations by 24-hour average bikes available. Takes `limit` (default `10`).

```bash
curl "https://cycle.arrakis.house/api/v1/stations/popular?limit=5&city=bcp"
```
