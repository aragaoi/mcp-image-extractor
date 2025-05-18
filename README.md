# MCP Image Extractor

MCP server for extracting and converting images to base64 for LLM analysis.

This MCP server provides tools for AI assistants to:
- Extract images from local files
- Extract images from URLs
- Process base64-encoded images

<a href="https://glama.ai/mcp/servers/@ifmelate/mcp-image-extractor">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@ifmelate/mcp-image-extractor/badge" alt="Image Extractor MCP server" />
</a>

How it looks in Cursor:

<img width="687" alt="image" src="https://github.com/user-attachments/assets/8954dbbd-7e7a-4f27-82a7-b251bd3c5af2" />

Suitable cases:
- analyze playwright test results: screenshots

## Installation

### Recommended: Using npx in mcp.json (Easiest)

The recommended way to install this MCP server is using npx directly in your `.cursor/mcp.json` file:

```json
{
  "mcpServers": {
    "image-extractor": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-image-extractor"
      ]
    }
  }
}
```

This approach:
- Automatically installs the latest version
- Does not require global installation
- Works reliably across different environments

### Alternative: Local Path Installation

If you prefer to use a local installation of the package, you can clone the repository and point to the built files:

```json
{
  "mcpServers": {
    "image-extractor": {
      "command": "node",
      "args": ["/full/path/to/mcp-image-extractor/dist/index.js"],
      "disabled": false
    }
  }
}
```

### Manual Installation

```bash
# Clone and install 
git clone https://github.com/ifmelate/mcp-image-extractor.git
cd mcp-image-extractor
npm install
npm run build
npm link
```

This will make the `mcp-image-extractor` command available globally.

Then configure in `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "image-extractor": {
      "command": "mcp-image-extractor",
      "disabled": false
    }
  }
}
```

> **Troubleshooting for Cursor Users**: If you see "Failed to create client" error, try the local path installation method above or ensure you're using the correct path to the executable.

## Available Tools

### extract_image_from_file

Extracts an image from a local file and converts it to base64.

Parameters:
- `file_path` (required): Path to the local image file

**Note:** All images are automatically resized to optimal dimensions (max 512x512) for LLM analysis to limit the size of the base64 output and optimize context window usage.

### extract_image_from_url

Extracts an image from a URL and converts it to base64.

Parameters:
- `url` (required): URL of the image to extract

**Note:** All images are automatically resized to optimal dimensions (max 512x512) for LLM analysis to limit the size of the base64 output and optimize context window usage.

### extract_image_from_base64

Processes a base64-encoded image for LLM analysis.

Parameters:
- `base64` (required): Base64-encoded image data
- `mime_type` (optional, default: "image/png"): MIME type of the image

**Note:** All images are automatically resized to optimal dimensions (max 512x512) for LLM analysis to limit the size of the base64 output and optimize context window usage.

## Example Usage

Here's an example of how to use the tools from Claude:

```
Please extract the image from this local file: images/photo.jpg
```

Claude will automatically use the `extract_image_from_file` tool to load and analyze the image content.

```
Please extract the image from this URL: https://example.com/image.jpg
```

Claude will automatically use the `extract_image_from_url` tool to fetch and analyze the image content.

## Docker

Build and run with Docker:

```bash
docker build -t mcp-image-extractor .
docker run -p 8000:8000 mcp-image-extractor
```

## License

MIT