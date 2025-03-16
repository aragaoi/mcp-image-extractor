# Deploying to Smithery.ai

This guide explains how to deploy the MCP Image Extractor to Smithery.ai.

## Prerequisites

1. Create a Smithery.ai account at https://smithery.ai/
2. Install the Smithery CLI:
   ```
   npm install -g smithery-cli
   ```
3. Log in to Smithery:
   ```
   smithery login
   ```

## Deployment Steps

1. Make sure your code is ready for deployment:
   ```
   npm run build
   ```

2. Deploy to Smithery:
   ```
   npm run smithery:deploy
   ```
   
   Alternatively, you can use the Smithery CLI directly:
   ```
   smithery deploy
   ```

3. Once deployed, you'll receive a URL for your MCP server that you can use in Claude Desktop or Cursor IDE.

## Configuration

The deployment uses the configuration in `smithery.yaml`, which defines:

- Server metadata (name, description, version)
- Available tools and their parameters
- Environment variables

## Using the Deployed Server

### In Claude Desktop

#### Option 1: URL Configuration

Add the deployed server to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "image-extractor": {
      "url": "https://your-smithery-url.smithery.ai"
    }
  }
}
```

#### Option 2: NPX Configuration (Local Development)

For local development using npx:

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

### In Cursor IDE

#### Option 1: URL Configuration

Add the deployed server to your Cursor IDE configuration:

```json
{
  "servers": [
    {
      "name": "Image Extractor",
      "url": "https://your-smithery-url.smithery.ai",
      "enabled": true
    }
  ]
}
```

#### Option 2: NPX Configuration (Local Development)

For local development using npx:

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

## Publishing to NPM

To make your MCP server available via npx, you'll need to publish it to npm:

1. Make sure your package.json is properly configured
2. Login to npm:
   ```
   npm login
   ```
3. Publish your package:
   ```
   npm publish
   ```

After publishing, users can use your MCP server with npx without cloning the repository.

## Troubleshooting

If you encounter issues with your Smithery deployment:

1. Check the deployment logs in the Smithery dashboard
2. Verify that all required dependencies are included in your package.json
3. Make sure your smithery.yaml file correctly defines all tools and parameters
4. Check that your environment variables are properly configured 