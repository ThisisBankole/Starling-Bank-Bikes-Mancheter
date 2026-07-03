# Connect your AI agent

Cycle Tracker exposes a remote [MCP](https://modelcontextprotocol.io) server — no authentication, no install. Point your client at:

```
https://cycle.arrakis.house/mcp
```

Then ask things like *"How many bikes are free near Piccadilly Gardens right now?"* or *"Which Bradford stations are busiest?"*

## Claude Code

```bash
claude mcp add --transport http cycle-tracker https://cycle.arrakis.house/mcp
```

## Claude Desktop and claude.ai

Go to **Settings → Connectors → Add custom connector** and paste the server URL:

```
https://cycle.arrakis.house/mcp
```

## Cursor

Add to `~/.cursor/mcp.json` (or the project's `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "cycle-tracker": {
      "url": "https://cycle.arrakis.house/mcp"
    }
  }
}
```

## VS Code (Copilot)

Add to your `mcp.json`:

```json
{
  "servers": {
    "cycle-tracker": {
      "type": "http",
      "url": "https://cycle.arrakis.house/mcp"
    }
  }
}
```

## Other clients (stdio only)

Clients that only support local MCP servers can connect through the standard [mcp-remote](https://www.npmjs.com/package/mcp-remote) bridge:

```json
{
  "mcpServers": {
    "cycle-tracker": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://cycle.arrakis.house/mcp"]
    }
  }
}
```
