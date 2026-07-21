# REST API

Every endpoint uses `GET`, returns JSON, and accepts a `city` query parameter. The parameter defaults to `manchester`, which is the only supported city. A request for any other city returns `400`.

## Cities

### GET /cities

Returns the supported cities with their map centers and bounds.

```bash
curl "https://cycle.arrakis.house/api/v1/cities"
```

## Bikes

### GET /bikes

Returns every bike in the latest snapshot, with its position and status.

```bash
curl "https://cycle.arrakis.house/api/v1/bikes?city=manchester"
```

```json
{
  "last_updated": "2026-07-03T12:50:37.821Z",
  "data": [
    {
      "bike_id": "4043a8f7...",
      "lat": 53.481,
      "lon": -2.243,
      "is_reserved": false,
      "is_disabled": false,
      "vehicle_type_id": "bbe"
    }
  ]
}
```

### GET /bikes/available

Returns only bikes that are neither reserved nor disabled.

### GET /ebikes

Returns e-bikes only.

## Stations

### GET /stations/active

Returns stations that are currently renting, with live availability. This is the most useful station endpoint.

```bash
curl "https://cycle.arrakis.house/api/v1/stations/active?city=manchester"
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

The following related variants are also available:

- `/stations`: names and positions only
- `/stations/all`
- `/stations/status`
- `/stations/inactive`
- `/stations/{station_id}`: a single station

## Analytics

### GET /snapshots/latest

Returns network-wide totals from the latest snapshot.

```bash
curl "https://cycle.arrakis.house/api/v1/snapshots/latest?city=manchester"
```

### GET /snapshots/history

Returns an availability time series. Accepts an `hours` parameter, which defaults to `24`.

```bash
curl "https://cycle.arrakis.house/api/v1/snapshots/history?hours=6&city=manchester"
```

### GET /stations/popular

Returns the busiest stations by 24-hour average bikes available. Accepts a `limit` parameter, which defaults to `10`.

```bash
curl "https://cycle.arrakis.house/api/v1/stations/popular?limit=5&city=manchester"
```
