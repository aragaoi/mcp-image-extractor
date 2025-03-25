# MCP Image Extractor

MCP server for extracting and converting images to base64 for LLM analysis.

This MCP server provides tools for AI assistants to:
- Extract images from local files
- Extract images from URLs
- Process base64-encoded images

How it looks in Cursor:

<img width="687" alt="image" src="https://github.com/user-attachments/assets/8954dbbd-7e7a-4f27-82a7-b251bd3c5af2" />

## Installation

### Via Smithery (Recommended)

The easiest way to install and use this MCP server is via Smithery.

#### For Claude Desktop

1. Open your terminal and run:
```bash
npx @smithery/cli install @ifmelate/mcp-image-extractor --client claude
```

2. The server will be automatically configured and ready to use in Claude Desktop.

#### For Cursor or Other Clients

For Cursor or other MCP clients, you can install the server from Smithery directly:

1. Visit [Smithery](https://smithery.ai) and go to the [Image Extractor page](https://smithery.ai/server/@ifmelate/mcp-image-extractor)
2. Click on the "Connect" button and follow the instructions to install

### Manual Installation

Since this package is only available in the Smithery registry and not in npm, you need to install it directly from GitHub:

```bash
# Clone and install 
git clone https://github.com/ifmelate/mcp-image-extractor.git
cd mcp-image-extractor
npm install
npm run build
npm link
```

This will make the `mcp-image-extractor` command available globally.

## Configuration

### For Claude Desktop

After installing via Smithery, the server should be automatically configured. If you need to manually configure it, add the following to your Claude Desktop settings:

```json
{
  "mcpServers": {
    "image-extractor": {
      "command": "npx",
      "args": ["--yes", "@smithery/mcp-image-extractor"]
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
      "args": ["--yes", "@smithery/mcp-image-extractor"]
    }
  }
}
```

Settings file location:
- macOS: `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
- Windows: `%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`

### For Cursor

You can configure Cursor to use this MCP server in one of the following ways:

#### Option 1: Using Cursor MCP Settings UI

Add this configuration through Cursor's MCP Settings UI:

```json
{
  "mcpServers": {
    "image-extractor": {
      "command": "npx",
      "args": ["--yes", "@smithery/mcp-image-extractor"],
      "disabled": false
    }
  }
}
```

#### Option 2: Using .cursor/mcp.json file

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

## Configuration Options

When connecting via Smithery UI, you can configure:

- **port**: The port number for the server (default: 8000)
- **maxImageSize**: Maximum image size in bytes (default: 10485760)
- **allowedDomains**: Comma-separated list of allowed domains for URL extraction (default: all domains allowed)

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
