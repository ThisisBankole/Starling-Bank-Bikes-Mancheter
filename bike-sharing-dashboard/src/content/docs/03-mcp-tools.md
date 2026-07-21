# MCP tools

The server exposes five read-only tools. Each tool that takes a `city` parameter uses the id `manchester`, which you can also retrieve from `list_cities`.

| Tool | Parameters | Returns |
| --- | --- | --- |
| `list_cities` | — | Supported cities with ids and coordinates |
| `get_network_status` | `city` | Live totals: bikes, e-bikes, and active stations |
| `find_stations` | `city`, `query?`, `lat?`, `lon?`, `limit?` | Stations by name search or nearest to a coordinate, with live availability |
| `get_popular_stations` | `city`, `limit?` | Busiest stations by 24-hour average bikes |
| `get_availability_trend` | `city`, `hours?` | Time series of availability, with one point every 10 minutes |

When you provide `lat` and `lon` to `find_stations`, the server sorts results by proximity and includes `distance_km`. Otherwise, it sorts results by the number of bikes available.
