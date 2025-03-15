import axios from 'axios';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const MAX_IMAGE_SIZE = parseInt(process.env.MAX_IMAGE_SIZE || '10485760', 10); // 10MB default
const ALLOWED_DOMAINS = process.env.ALLOWED_DOMAINS ? process.env.ALLOWED_DOMAINS.split(',') : [];

// Type definitions
export type ExtractImageFromUrlParams = {
  url: string;
  resize: boolean;
  max_width: number;
  max_height: number;
};

export type ExtractImageFromBase64Params = {
  base64: string;
  mime_type: string;
  resize: boolean;
  max_width: number;
  max_height: number;
};

export type SaveScreenshotParams = {
  base64: string;
  filename: string;
  format: "png" | "jpg" | "jpeg" | "webp";
};

export type McpToolResponse = {
  content: Array<{ 
    type: "text" | "image" | "resource"; 
    text?: string;
    data?: string;
    mimeType?: string;
    resource?: {
      text: string;
      uri: string;
      mimeType?: string;
    } | {
      uri: string;
      blob: string;
      mimeType?: string;
    };
  }>;
  _meta?: Record<string, unknown>;
  isError?: boolean;
};

// Extract image from URL
export async function extractImageFromUrl(params: ExtractImageFromUrlParams): Promise<McpToolResponse> {
  try {
    const { url, resize, max_width, max_height } = params;
    
    // Validate URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return {
        content: [{ type: "text", text: "Error: URL must start with http:// or https://" }],
        isError: true
      };
    }

    // Domain validation if ALLOWED_DOMAINS is set
    if (ALLOWED_DOMAINS.length > 0) {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      const isAllowed = ALLOWED_DOMAINS.some((allowedDomain: string) => 
        domain === allowedDomain || domain.endsWith(`.${allowedDomain}`)
      );

      if (!isAllowed) {
        return {
          content: [{ type: "text", text: `Error: Domain ${domain} is not in the allowed domains list` }],
          isError: true
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

    // Return both text and image content
    return {
      content: [
        { 
          type: "text", 
          text: JSON.stringify({
            width: metadata.width,
            height: metadata.height,
            format: metadata.format,
            size: imageBuffer.length
          })
        },
        {
          type: "image",
          data: base64,
          mimeType: mimeType
        }
      ]
    };
  } catch (error: unknown) {
    console.error('Error processing image from URL:', error);
    return {
      content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true
    };
  }
}

// Extract image from base64
export async function extractImageFromBase64(params: ExtractImageFromBase64Params): Promise<McpToolResponse> {
  try {
    const { base64, mime_type, resize, max_width, max_height } = params;
    
    // Decode base64
    let imageBuffer = Buffer.from(base64, 'base64');
    
    // Check size
    if (imageBuffer.length > MAX_IMAGE_SIZE) {
      return {
        content: [{ type: "text", text: `Error: Image size exceeds maximum allowed size of ${MAX_IMAGE_SIZE} bytes` }],
        isError: true
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

    // Return both text and image content
    return {
      content: [
        { 
          type: "text", 
          text: JSON.stringify({
            width: metadata.width,
            height: metadata.height,
            format: metadata.format,
            size: imageBuffer.length
          })
        },
        {
          type: "image",
          data: processedBase64,
          mimeType: mime_type
        }
      ]
    };
  } catch (error: unknown) {
    console.error('Error processing base64 image:', error);
    return {
      content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true
    };
  }
}

// Save screenshot
export async function saveScreenshot(params: SaveScreenshotParams): Promise<McpToolResponse> {
  try {
    const { base64, filename, format } = params;
    
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
  } catch (error: unknown) {
    console.error('Error saving screenshot:', error);
    return {
      content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true
    };
  }
} 