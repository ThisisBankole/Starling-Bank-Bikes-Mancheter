# MCP tools

The server exposes five read-only tools. City ids come from `list_cities`.

| Tool | Parameters | Returns |
| --- | --- | --- |
| `list_cities` | — | Supported cities with ids and coordinates |
| `get_network_status` | `city` | Live totals: bikes, e-bikes, active stations |
| `find_stations` | `city`, `query?`, `lat?`, `lon?`, `limit?` | Stations by name search or nearest to a coordinate, with live availability |
| `get_popular_stations` | `city`, `limit?` | Busiest stations by 24-hour average bikes |
| `get_availability_trend` | `city`, `hours?` | Time series of availability, one point per 10 minutes |

When `lat`/`lon` are provided to `find_stations`, results are sorted by proximity and include `distance_km`; otherwise they are sorted by bikes available.
