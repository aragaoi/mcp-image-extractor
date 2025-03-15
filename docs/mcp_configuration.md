# MCP Configuration Guide

This guide explains how to configure the MCP Image Extractor server with Claude Desktop and Cursor IDE.

## Claude Desktop Configuration

Claude Desktop uses a JSON configuration file located at:
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

### Option 1: URL Configuration (Manual Start)

Use this option if you want to start the server manually:

```json
{
  "mcpServers": {
    "image-extractor": {
      "url": "http://localhost:8000"
    }
  }
}
```

### Option 2: NPX Configuration (Recommended)

This option automatically starts the server using npx:

```json
{
  "mcpServers": {
    "image-extractor": {
      "command": "npx",
      "args": ["-y", "mcp-image-extractor"],
      "env": {
        "PORT": "8000",
        "MAX_IMAGE_SIZE": "10485760"
      }
    }
  }
}
```

### Option 3: Node Configuration

This option starts the server using node directly:

```json
{
  "mcpServers": {
    "image-extractor": {
      "command": "node",
      "args": ["path/to/mcp-image-extractor/dist/index.js"],
      "env": {
        "PORT": "8000",
        "MAX_IMAGE_SIZE": "10485760",
        "ALLOWED_DOMAINS": "example.com,trusted-domain.org"
      }
    }
  }
}
```

## Cursor IDE Configuration

Cursor IDE uses a JSON configuration file located at:
```
.cursor/mcp.json
```
in your workspace.

### Option 1: URL Configuration (Manual Start)

Use this option if you want to start the server manually:

```json
{
  "servers": [
    {
      "name": "Image Extractor",
      "url": "http://localhost:8000",
      "enabled": true
    }
  ]
}
```

### Option 2: NPX Configuration (Recommended)

This option automatically starts the server using npx:

```json
{
  "servers": [
    {
      "name": "Image Extractor",
      "command": "npx",
      "args": ["-y", "mcp-image-extractor"],
      "enabled": true,
      "env": {
        "PORT": "8000",
        "MAX_IMAGE_SIZE": "10485760"
      }
    }
  ]
}
```

### Option 3: Node Configuration

This option starts the server using node directly:

```json
{
  "servers": [
    {
      "name": "Image Extractor",
      "command": "node",
      "args": ["path/to/mcp-image-extractor/dist/index.js"],
      "enabled": true,
      "env": {
        "PORT": "8000",
        "MAX_IMAGE_SIZE": "10485760",
        "ALLOWED_DOMAINS": "example.com,trusted-domain.org"
      }
    }
  ]
}
```

## Using with Full Path to Node/NPX

If you're using a Node version manager like nvm, you might need to use the full path to npx or node:

### For Claude Desktop:

```json
{
  "mcpServers": {
    "image-extractor": {
      "command": "/home/username/.nvm/versions/node/v20.11.0/bin/npx",
      "args": ["-y", "mcp-image-extractor"],
      "env": {
        "PORT": "8000"
      }
    }
  }
}
```

### For Cursor IDE:

```json
{
  "servers": [
    {
      "name": "Image Extractor",
      "command": "/home/username/.nvm/versions/node/v20.11.0/bin/node",
      "args": ["/absolute/path/to/mcp-image-extractor/dist/index.js"],
      "enabled": true
    }
  ]
}
```

## Environment Variables

The MCP Image Extractor supports the following environment variables:

- `PORT`: The port number for the server (default: 8000)
- `MAX_IMAGE_SIZE`: Maximum image size in bytes (default: 10485760, which is 10MB)
- `ALLOWED_DOMAINS`: Comma-separated list of allowed domains for URL extraction (optional)

If `ALLOWED_DOMAINS` is empty or not specified, the server will allow images from any domain.

## Troubleshooting

### Server Not Starting

If the MCP server doesn't start:

1. Check if the port is already in use
2. Verify the path to the Node.js executable or script
3. Make sure all dependencies are installed
4. Try using the full path to npx or node

### Connection Issues

If Claude or Cursor can't connect to the MCP server:

1. Verify the server is running
2. Check the URL in the configuration (should be http://localhost:8000)
3. Restart the client application

### Terminal Window Stays Open

When using command-based MCP servers in Cursor, the terminal window will stay open while the server is running. This is normal behavior. 