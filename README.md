# MCP Image Extractor

A Model Context Protocol (MCP) server that extracts images from content and returns them as base64-encoded strings. This tool enables Large Language Models (LLMs) to analyze visual content such as screenshots, diagrams, or any other image-based information.

## Features

- Extract images from URLs
- Process base64-encoded images
- Save screenshots to disk
- Support for various image formats (PNG, JPEG, GIF, etc.)
- Resize images for optimal LLM processing
- Simple integration with Cursor IDE, Claude Desktop, and other MCP clients

## Installation

### Local Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Build the project:
   ```
   npm run build
   ```

## Usage

### Running Locally

1. Start the server:
   ```
   npm start
   ```
   
   For development with auto-reload:
   ```
   npm run dev
   ```

2. The server will be available at `http://localhost:8000`

### Using with Claude Desktop

Add the server to your Claude Desktop configuration:

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

### Using with Cursor IDE


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

For more configuration options, see [MCP Configuration Guide](docs/mcp_configuration.md).

## MCP Tools

This server provides the following MCP tools:

### extract_image_from_url

Extracts an image from a URL and converts it to base64 for LLM analysis.

Parameters:
- `url` (required): URL of the image to extract
- `resize` (optional, default: true): Whether to resize the image
- `max_width` (optional, default: 800): Maximum width of the resized image
- `max_height` (optional, default: 800): Maximum height of the resized image

### extract_image_from_base64

Processes a base64-encoded image for LLM analysis.

Parameters:
- `base64` (required): Base64-encoded image data
- `mime_type` (optional, default: 'image/png'): MIME type of the image
- `resize` (optional, default: true): Whether to resize the image
- `max_width` (optional, default: 800): Maximum width of the resized image
- `max_height` (optional, default: 800): Maximum height of the resized image

### save_screenshot

Saves a screenshot or image as a file and returns its path.

Parameters:
- `base64` (required): Base64-encoded image data
- `filename` (optional): Name to save the file as (without extension)
- `format` (optional, default: 'png'): Image format to save as ('png', 'jpg', 'jpeg', 'webp')

## Environment Variables

- `PORT`: Server port (default: 8000)
- `MAX_IMAGE_SIZE`: Maximum image size in bytes (default: 10MB)
- `ALLOWED_DOMAINS`: Comma-separated list of allowed domains for URL extraction (optional)

## License

MIT 
