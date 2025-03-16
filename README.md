# MCP Image Extractor

MCP server for extracting and converting images to base64 for LLM analysis.

This MCP server provides tools for AI assistants to:
- Extract images from URLs
- Process base64-encoded images
- Save screenshots to files

## Installation

### Via Smithery (Recommended)

The easiest way to install and use this MCP server with Claude is via Smithery:

```bash
npx -y @smithery/cli install mcp-image-extractor --client claude
```

### Manual Installation

You can also install the package globally:

```bash
npm install -g mcp-image-extractor
```

## Configuration

### For Claude Desktop

Add the following configuration to your Claude Desktop settings:

```json
{
  "mcpServers": {
    "image-extractor": {
      "command": "npx",
      "args": ["-y", "mcp-image-extractor"]
    }
  }
}
```

Settings file location:
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

### For VSCode with Cline Extension

Add this configuration to the Cline MCP settings:

```json
{
  "mcpServers": {
    "image-extractor": {
      "command": "npx",
      "args": ["-y", "mcp-image-extractor"]
    }
  }
}
```

Settings file location:
- macOS: `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
- Windows: `%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`

## Available Tools

### extract_image_from_url

Extracts an image from a URL and converts it to base64.

Parameters:
- `url` (required): URL of the image to extract
- `resize` (optional, default: true): Whether to resize the image
- `max_width` (optional, default: 800): Maximum width after resizing
- `max_height` (optional, default: 800): Maximum height after resizing

### extract_image_from_base64

Processes a base64-encoded image for LLM analysis.

Parameters:
- `base64` (required): Base64-encoded image data
- `mime_type` (optional, default: "image/png"): MIME type of the image
- `resize` (optional, default: true): Whether to resize the image
- `max_width` (optional, default: 800): Maximum width after resizing
- `max_height` (optional, default: 800): Maximum height after resizing

### save_screenshot

Saves a screenshot or image as a file and returns its path.

Parameters:
- `base64` (required): Base64-encoded image data
- `filename` (optional): Name to save the file as (without extension)
- `format` (optional, default: "png"): Image format to save as (png, jpg, jpeg, webp)

## Development

1. Clone the repository:
   ```bash
   git clone https://github.com/ifmelate/mcp-image-extractor.git
   cd mcp-image-extractor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Start the server locally:
   ```bash
   npm start
   ```

5. Test with MCP Inspector:
   ```bash
   npx @modelcontextprotocol/inspector dist/index.js
   ```

## Publishing

To publish your own version:

1. Log in to npm:
   ```bash
   npm login
   ```

2. Publish the package:
   ```bash
   npm publish
   ```

## Docker

Build and run with Docker:

```bash
docker build -t mcp-image-extractor .
docker run -p 8000:8000 mcp-image-extractor
```

## License

MIT 
