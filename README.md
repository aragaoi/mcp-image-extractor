# MCP Image Extractor

MCP server for extracting and converting images to base64 for LLM analysis.

This MCP server provides tools for AI assistants to:
- Extract images from local files
- Extract images from URLs
- Process base64-encoded images

How it looks in Cursor:

<img width="687" alt="image" src="https://github.com/user-attachments/assets/8954dbbd-7e7a-4f27-82a7-b251bd3c5af2" />

Suitable cases:
- analyze playwright test results: screenshots


#### For Cursor or Other Clients


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


#### Using .cursor/mcp.json file

For local development or when working in a specific project, you can add a `.cursor/mcp.json` file in your project root:

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

Or, if you've installed via npm link:

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

> **Important Note for Cursor Users**: If you see "Failed to create client" error, try these alternatives:
> 
> Option 1: Use direct GitHub installation
> ```bash
> git clone https://github.com/ifmelate/mcp-image-extractor.git
> cd mcp-image-extractor
> npm install
> npm run build
> npm link
> ```
> 
> Then configure in `.cursor/mcp.json`:
> ```json
> {
>   "mcpServers": {
>     "image-extractor": {
>       "command": "mcp-image-extractor",
>       "disabled": false
>     }
>   }
> }
> ```
> 
> Option 2: Clone and run locally
> ```bash
> git clone https://github.com/ifmelate/mcp-image-extractor.git
> cd mcp-image-extractor
> npm install
> npm run build
> ```
> 
> Then configure in `.cursor/mcp.json`:
> ```json
> {
>   "mcpServers": {
>     "image-extractor": {
>       "command": "node",
>       "args": ["/full/path/to/mcp-image-extractor/dist/index.js"],
>       "disabled": false
>     }
>   }
> }
> ```

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
