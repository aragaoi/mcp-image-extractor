import { createServer, Tool, ToolCallResult } from '@modelcontextprotocol/server';
import axios from 'axios';
import * as dotenv from 'dotenv';
import * as sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

// Configuration
const PORT = process.env.PORT || 8000;
const MAX_IMAGE_SIZE = parseInt(process.env.MAX_IMAGE_SIZE || '10485760', 10); // 10MB default
const ALLOWED_DOMAINS = process.env.ALLOWED_DOMAINS ? process.env.ALLOWED_DOMAINS.split(',') : [];

// Define the tools
const tools: Tool[] = [
  {
    name: 'extract_image_from_url',
    description: 'Extract an image from a URL and convert it to base64 for LLM analysis',
    parameters: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'URL of the image to extract',
        },
        resize: {
          type: 'boolean',
          description: 'Whether to resize the image to optimize for LLM processing',
          default: true,
        },
        max_width: {
          type: 'integer',
          description: 'Maximum width of the resized image (if resize is true)',
          default: 800,
        },
        max_height: {
          type: 'integer',
          description: 'Maximum height of the resized image (if resize is true)',
          default: 800,
        },
      },
      required: ['url'],
    },
    handler: async (params: any): Promise<ToolCallResult> => {
      try {
        const { url, resize = true, max_width = 800, max_height = 800 } = params;
        
        // Validate URL
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          return {
            error: 'Invalid URL. URL must start with http:// or https://',
          };
        }
        
        // Check allowed domains if configured
        if (ALLOWED_DOMAINS.length > 0) {
          const urlObj = new URL(url);
          const domain = urlObj.hostname;
          if (!ALLOWED_DOMAINS.some(allowedDomain => domain.endsWith(allowedDomain))) {
            return {
              error: `Domain not allowed. Allowed domains: ${ALLOWED_DOMAINS.join(', ')}`,
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
        
        // Resize if needed
        if (resize) {
          imageBuffer = await sharp(imageBuffer)
            .resize({
              width: max_width,
              height: max_height,
              fit: 'inside',
              withoutEnlargement: true,
            })
            .toBuffer();
        }
        
        // Convert to base64
        const base64Image = imageBuffer.toString('base64');
        
        // Get image metadata
        const metadata = await sharp(imageBuffer).metadata();
        
        return {
          result: {
            base64: base64Image,
            mime_type: response.headers['content-type'],
            width: metadata.width,
            height: metadata.height,
            format: metadata.format,
            size_bytes: imageBuffer.length,
          },
        };
      } catch (error: any) {
        console.error('Error extracting image from URL:', error);
        return {
          error: `Failed to extract image: ${error.message}`,
        };
      }
    },
  },
  {
    name: 'extract_image_from_base64',
    description: 'Process a base64-encoded image for LLM analysis',
    parameters: {
      type: 'object',
      properties: {
        base64: {
          type: 'string',
          description: 'Base64-encoded image data',
        },
        mime_type: {
          type: 'string',
          description: 'MIME type of the image',
          default: 'image/png',
        },
        resize: {
          type: 'boolean',
          description: 'Whether to resize the image to optimize for LLM processing',
          default: true,
        },
        max_width: {
          type: 'integer',
          description: 'Maximum width of the resized image (if resize is true)',
          default: 800,
        },
        max_height: {
          type: 'integer',
          description: 'Maximum height of the resized image (if resize is true)',
          default: 800,
        },
      },
      required: ['base64'],
    },
    handler: async (params: any): Promise<ToolCallResult> => {
      try {
        const { base64, mime_type = 'image/png', resize = true, max_width = 800, max_height = 800 } = params;
        
        // Decode base64
        let imageBuffer = Buffer.from(base64, 'base64');
        
        // Check size
        if (imageBuffer.length > MAX_IMAGE_SIZE) {
          return {
            error: `Image size exceeds maximum allowed size of ${MAX_IMAGE_SIZE} bytes`,
          };
        }
        
        // Resize if needed
        if (resize) {
          imageBuffer = await sharp(imageBuffer)
            .resize({
              width: max_width,
              height: max_height,
              fit: 'inside',
              withoutEnlargement: true,
            })
            .toBuffer();
        }
        
        // Get image metadata
        const metadata = await sharp(imageBuffer).metadata();
        
        // Convert back to base64
        const processedBase64 = imageBuffer.toString('base64');
        
        return {
          result: {
            base64: processedBase64,
            mime_type: mime_type,
            width: metadata.width,
            height: metadata.height,
            format: metadata.format,
            size_bytes: imageBuffer.length,
          },
        };
      } catch (error: any) {
        console.error('Error processing base64 image:', error);
        return {
          error: `Failed to process image: ${error.message}`,
        };
      }
    },
  },
  {
    name: 'save_screenshot',
    description: 'Save a screenshot or image as a file and return its path',
    parameters: {
      type: 'object',
      properties: {
        base64: {
          type: 'string',
          description: 'Base64-encoded image data',
        },
        filename: {
          type: 'string',
          description: 'Name to save the file as (without extension)',
          default: '',
        },
        format: {
          type: 'string',
          description: 'Image format to save as',
          enum: ['png', 'jpg', 'jpeg', 'webp'],
          default: 'png',
        },
      },
      required: ['base64'],
    },
    handler: async (params: any): Promise<ToolCallResult> => {
      try {
        const { base64, filename = '', format = 'png' } = params;
        
        // Create screenshots directory if it doesn't exist
        const screenshotsDir = path.join(process.cwd(), 'screenshots');
        if (!fs.existsSync(screenshotsDir)) {
          fs.mkdirSync(screenshotsDir, { recursive: true });
        }
        
        // Generate filename if not provided
        const actualFilename = filename || `screenshot_${Date.now()}`;
        const fullFilename = `${actualFilename}.${format}`;
        const filePath = path.join(screenshotsDir, fullFilename);
        
        // Decode and save the image
        const imageBuffer = Buffer.from(base64, 'base64');
        await sharp(imageBuffer).toFile(filePath);
        
        return {
          result: {
            filename: fullFilename,
            path: filePath,
            size_bytes: fs.statSync(filePath).size,
          },
        };
      } catch (error: any) {
        console.error('Error saving screenshot:', error);
        return {
          error: `Failed to save screenshot: ${error.message}`,
        };
      }
    },
  },
];

// Create and start the MCP server
const server = createServer({
  tools,
  metadata: {
    name: 'mcp-image-extractor',
    description: 'MCP server for extracting and converting images to base64 for LLM analysis',
    version: '1.0.0',
  },
});

// Use stdio transport instead of HTTP
server.start();
console.log('MCP Image Extractor server started in stdio mode'); 