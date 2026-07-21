# Overview

Cycle Tracker serves live bike-share availability for Manchester, England. It reads a public General Bikeshare Feed Specification (GBFS) feed, refreshes the data every 10 minutes, and retains 90 days of history.

The service is free, and it requires no API key.

Use the following base URL:

```
https://cycle.arrakis.house/api/v1
```

Cycle Tracker covers Manchester only. Requests that take a `city` parameter use the id `manchester`.

| City | id |
| --- | --- |
| Manchester | `manchester` |

You can consume the data in two ways:

- Connect an AI agent through the Model Context Protocol (MCP).
- Call the REST API directly.
