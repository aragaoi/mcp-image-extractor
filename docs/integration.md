# Integrating MCP Image Extractor with AI Tools

This guide provides detailed instructions for integrating the MCP Image Extractor server with various AI tools and platforms.

## Cursor IDE Integration

Cursor IDE has built-in support for MCP servers, making it easy to integrate our image extraction capabilities.

### Setup Steps

1. Open Cursor IDE
2. Go to Settings > Cursor Settings
3. Find the "MCP Servers" option and enable it
4. Click "Add new MCP server"
5. Enter the following details:
   - Name: Image Extractor
   - URL: http://localhost:8000
6. Click "Enable" to activate the server

### Usage in Cursor

Once the MCP server is enabled, you can use it in your conversations with Cursor AI. For example:

```
Can you analyze this image for me? [URL to image]
```

The AI will automatically use the MCP server to extract and analyze the image.

## Claude Desktop Integration

Claude Desktop also supports MCP servers for enhanced capabilities.

### Setup Steps

1. Open Claude Desktop
2. Go to Settings > MCP Servers
3. Add a new server with URL: http://localhost:8000
4. Enable the server

### Usage in Claude Desktop

Once configured, you can ask Claude to analyze images:

```
Please analyze this screenshot: [URL to screenshot]
```

Claude will use the MCP server to extract the image and provide analysis.

## Troubleshooting

### Server Not Found

If the AI tool cannot connect to the MCP server:

1. Ensure the server is running (`npm start`)
2. Verify the URL is correct (http://localhost:8000)
3. Check if there are any firewall issues blocking the connection

### Permission Issues

If you encounter permission issues:

1. Make sure the MCP server has appropriate permissions to access the file system
2. Check the ALLOWED_DOMAINS setting in your .env file if you're getting domain restriction errors

### Image Processing Errors

If image processing fails:

1. Verify the image URL is accessible
2. Check if the image format is supported
3. Ensure the image size is within the MAX_IMAGE_SIZE limit 