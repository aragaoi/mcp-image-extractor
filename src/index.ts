import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from 'axios';
import * as dotenv from 'dotenv';
import * as sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

// Configuration
const MAX_IMAGE_SIZE = parseInt(process.env.MAX_IMAGE_SIZE || '10485760', 10); // 10MB default
const ALLOWED_DOMAINS = process.env.ALLOWED_DOMAINS ? process.env.ALLOWED_DOMAINS.split(',') : [];

// Create an MCP server
const server = new McpServer({
  name: "mcp-image-extractor",
  description: "MCP server for extracting and converting images to base64 for LLM analysis",
  version: "1.0.0"
});

// Add extract_image_from_url tool
server.tool(
  "extract_image_from_url",
  {
    url: z.string().describe("URL of the image to extract"),
    resize: z.boolean().default(true).describe("Whether to resize the image to optimize for LLM processing"),
    max_width: z.number().default(800).describe("Maximum width of the resized image (if resize is true)"),
    max_height: z.number().default(800).describe("Maximum height of the resized image (if resize is true)")
  },
  async ({ url, resize, max_width, max_height }) => {
    try {
      // Validate URL
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return {
          content: [{ type: "text", text: "Error: URL must start with http:// or https://" }]
        };
      }

      // Domain validation if ALLOWED_DOMAINS is set
      if (ALLOWED_DOMAINS.length > 0) {
        const urlObj = new URL(url);
        const domain = urlObj.hostname;
        const isAllowed = ALLOWED_DOMAINS.some(allowedDomain => 
          domain === allowedDomain || domain.endsWith(`.${allowedDomain}`)
        );

        if (!isAllowed) {
          return {
            content: [{ type: "text", text: `Error: Domain ${domain} is not in the allowed domains list` }]
          };
        }
      }

      // Fetch the image
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        maxContentLength: MAX_IMAGE_SIZE,
      });

      // Process the image
      let imageBuffer = Buffer.from(response.data);
      let metadata = await sharp(imageBuffer).metadata();
      
      // Resize if needed
      if (resize && metadata.width && metadata.height) {
        if (metadata.width > max_width || metadata.height > max_height) {
          imageBuffer = await sharp(imageBuffer)
            .resize({
              width: Math.min(metadata.width, max_width),
              height: Math.min(metadata.height, max_height),
              fit: 'inside',
              withoutEnlargement: true
            })
            .toBuffer();
          
          // Update metadata after resize
          metadata = await sharp(imageBuffer).metadata();
        }
      }

      // Convert to base64
      const base64 = imageBuffer.toString('base64');
      const mimeType = response.headers['content-type'] || 'image/jpeg';

      return {
        content: [
          { 
            type: "text", 
            text: JSON.stringify({
              base64,
              mime_type: mimeType,
              width: metadata.width,
              height: metadata.height,
              format: metadata.format,
              size: imageBuffer.length
            })
          }
        ]
      };
    } catch (error) {
      console.error('Error processing image from URL:', error);
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }]
      };
    }
  }
);

// Add extract_image_from_base64 tool
server.tool(
  "extract_image_from_base64",
  {
    base64: z.string().describe("Base64-encoded image data"),
    mime_type: z.string().default("image/png").describe("MIME type of the image"),
    resize: z.boolean().default(true).describe("Whether to resize the image to optimize for LLM processing"),
    max_width: z.number().default(800).describe("Maximum width of the resized image (if resize is true)"),
    max_height: z.number().default(800).describe("Maximum height of the resized image (if resize is true)")
  },
  async ({ base64, mime_type, resize, max_width, max_height }) => {
    try {
      // Decode base64
      let imageBuffer = Buffer.from(base64, 'base64');
      
      // Check size
      if (imageBuffer.length > MAX_IMAGE_SIZE) {
        return {
          content: [{ type: "text", text: `Error: Image size exceeds maximum allowed size of ${MAX_IMAGE_SIZE} bytes` }]
        };
      }
      
      // Process the image
      let metadata = await sharp(imageBuffer).metadata();
      
      // Resize if needed
      if (resize && metadata.width && metadata.height) {
        if (metadata.width > max_width || metadata.height > max_height) {
          imageBuffer = await sharp(imageBuffer)
            .resize({
              width: Math.min(metadata.width, max_width),
              height: Math.min(metadata.height, max_height),
              fit: 'inside',
              withoutEnlargement: true
            })
            .toBuffer();
          
          // Update metadata after resize
          metadata = await sharp(imageBuffer).metadata();
        }
      }

      // Convert back to base64
      const processedBase64 = imageBuffer.toString('base64');

      return {
        content: [
          { 
            type: "text", 
            text: JSON.stringify({
              base64: processedBase64,
              mime_type,
              width: metadata.width,
              height: metadata.height,
              format: metadata.format,
              size: imageBuffer.length
            })
          }
        ]
      };
    } catch (error) {
      console.error('Error processing base64 image:', error);
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }]
      };
    }
  }
);

// Add save_screenshot tool
server.tool(
  "save_screenshot",
  {
    base64: z.string().describe("Base64-encoded image data"),
    filename: z.string().default("").describe("Name to save the file as (without extension)"),
    format: z.enum(["png", "jpg", "jpeg", "webp"]).default("png").describe("Image format to save as")
  },
  async ({ base64, filename, format }) => {
    try {
      // Create screenshots directory if it doesn't exist
      const screenshotsDir = path.join(process.cwd(), 'screenshots');
      if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
      }
      
      // Generate filename if not provided
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const finalFilename = filename || `screenshot-${timestamp}`;
      const filePath = path.join(screenshotsDir, `${finalFilename}.${format}`);
      
      // Decode and save the image
      const imageBuffer = Buffer.from(base64, 'base64');
      await sharp(imageBuffer).toFormat(format as any).toFile(filePath);
      
      return {
        content: [{ type: "text", text: `Screenshot saved to ${filePath}` }]
      };
    } catch (error) {
      console.error('Error saving screenshot:', error);
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }]
      };
    }
  }
);

// Start the server using stdio transport
const transport = new StdioServerTransport();
server.connect(transport).catch(error => {
  console.error('Error starting MCP server:', error);
  process.exit(1);
});

console.log('MCP Image Extractor server started in stdio mode'); 