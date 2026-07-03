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

## Codex

Add to `~/.codex/config.toml` (or a trusted project's `.codex/config.toml`):

```toml
[mcp_servers.cycle-tracker]
url = "https://cycle.arrakis.house/mcp"
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

## GitHub Copilot CLI

Run `/mcp add` inside Copilot CLI (transport **HTTP**), or add to `~/.copilot/mcp-config.json`:

```json
{
  "mcpServers": {
    "cycle-tracker": {
      "type": "http",
      "url": "https://cycle.arrakis.house/mcp"
    }
  }
}
```

## opencode

Add to `opencode.json` (project) or `~/.config/opencode/opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "cycle-tracker": {
      "type": "remote",
      "url": "https://cycle.arrakis.house/mcp"
    }
  }
}
```

## Google Antigravity

Open **Settings → Customizations → Open MCP Config** (`mcp_config.json`) and add — note Antigravity uses `serverUrl`, not `url`:

```json
{
  "mcpServers": {
    "cycle-tracker": {
      "serverUrl": "https://cycle.arrakis.house/mcp"
    }
  }
}
```

Then hit refresh in the Installed MCP Servers section.

## Hermes

Add to `~/.hermes/config.yaml`, then run `/reload-mcp`:

```yaml
mcp_servers:
  cycle_tracker:
    url: "https://cycle.arrakis.house/mcp"
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
