#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as dotenv from 'dotenv';
import {
  extractImageFromFile,
  extractImageFromUrl,
  extractImageFromBase64,
  extractScreenshotFromUrl,
} from "./image-utils";

dotenv.config();

// Create an MCP server
const server = new McpServer({
  name: "mcp-image-extractor",
  description:
    "MCP server for analyzing of images from files, URLs, and base64 data for visual content understanding, text extraction (OCR), and object recognition in screenshots and photos",
  version: "1.0.0",
});

// Add extract_image_from_file tool
server.tool(
  "extract_image_from_file",
  "Extract and analyze images from local file paths. Supports visual content understanding, OCR text extraction, and object recognition for screenshots, photos, diagrams, and documents.",
  {
    file_path: z
      .string()
      .describe(
        "Path to the image file to analyze (supports screenshots, photos, diagrams, and documents in PNG, JPG, GIF, WebP formats)"
      ),
    resize: z
      .boolean()
      .default(true)
      .describe(
        "For backward compatibility only. Images are always automatically resized to optimal dimensions (max 512x512) for LLM analysis"
      ),
    max_width: z
      .number()
      .default(512)
      .describe(
        "For backward compatibility only. Default maximum width is now 512px"
      ),
    max_height: z
      .number()
      .default(512)
      .describe(
        "For backward compatibility only. Default maximum height is now 512px"
      ),
  },
  async (args, extra) => {
    const result = await extractImageFromFile(args);
    return result;
  }
);

// Add extract_image_from_url tool
server.tool(
  "extract_image_from_url",
  "Extract and analyze images from web URLs. Perfect for analyzing web screenshots, online photos, diagrams, or any image accessible via HTTP/HTTPS for visual content analysis and text extraction.",
  {
    url: z
      .string()
      .describe(
        "URL of the image to analyze for visual content, text extraction, or object recognition (supports web screenshots, photos, diagrams)"
      ),
    resize: z
      .boolean()
      .default(true)
      .describe(
        "For backward compatibility only. Images are always automatically resized to optimal dimensions (max 512x512) for LLM analysis"
      ),
    max_width: z
      .number()
      .default(512)
      .describe(
        "For backward compatibility only. Default maximum width is now 512px"
      ),
    max_height: z
      .number()
      .default(512)
      .describe(
        "For backward compatibility only. Default maximum height is now 512px"
      ),
  },
  async (args, extra) => {
    const result = await extractImageFromUrl(args);
    return result;
  }
);

// Add extract_image_from_base64 tool
server.tool(
  "extract_image_from_base64",
  "Extract and analyze images from base64-encoded data. Ideal for processing screenshots from clipboard, dynamically generated images, or images embedded in applications without requiring file system access.",
  {
    base64: z
      .string()
      .describe(
        "Base64-encoded image data to analyze (useful for screenshots, images from clipboard, or dynamically generated visuals)"
      ),
    mime_type: z
      .string()
      .default("image/png")
      .describe("MIME type of the image (e.g., image/png, image/jpeg)"),
    resize: z
      .boolean()
      .default(true)
      .describe(
        "For backward compatibility only. Images are always automatically resized to optimal dimensions (max 512x512) for LLM analysis"
      ),
    max_width: z
      .number()
      .default(512)
      .describe(
        "For backward compatibility only. Default maximum width is now 512px"
      ),
    max_height: z
      .number()
      .default(512)
      .describe(
        "For backward compatibility only. Default maximum height is now 512px"
      ),
  },
  async (args, extra) => {
    const result = await extractImageFromBase64(args);
    return result;
  }
);

// Add extract_screenshot_from_url tool
server.tool(
  "extract_screenshot_from_url",
  "Generate and analyze screenshots from web URLs using Puppeteer. Perfect for capturing webpage visuals, testing responsive designs, or analyzing web content across different viewport sizes. Supports clicking elements to open dropdowns, modals, or menus before capturing.",
  {
    url: z
      .string()
      .describe(
        "URL of the webpage to capture as screenshot (supports any web page accessible via HTTP/HTTPS)"
      ),
    viewport_width: z
      .number()
      .default(1920)
      .describe("Browser viewport width in pixels for screenshot capture"),
    viewport_height: z
      .number()
      .default(1080)
      .describe("Browser viewport height in pixels for screenshot capture"),
    full_page: z
      .boolean()
      .default(true)
      .describe(
        "Whether to capture the full page height or just the viewport area"
      ),
    wait_for_load: z
      .number()
      .default(2000)
      .describe(
        "Additional wait time in milliseconds after page load before taking screenshot"
      ),
    wait_for_selector: z
      .string()
      .optional()
      .describe(
        "Optional CSS selector to wait for before taking screenshot (useful for dynamic content)"
      ),
    click_selector: z
      .string()
      .optional()
      .describe(
        "Optional CSS selector to click before taking screenshot (useful for opening dropdowns, modals, menus, or triggering interactions)"
      ),
    click_wait_after: z
      .number()
      .default(500)
      .describe(
        "Wait time in milliseconds after clicking the selector to allow animations/transitions to complete"
      ),
    resize: z
      .boolean()
      .default(true)
      .describe(
        "For backward compatibility only. Screenshots are always automatically resized to optimal dimensions (max 512x512) for LLM analysis"
      ),
    max_width: z
      .number()
      .default(512)
      .describe(
        "For backward compatibility only. Default maximum width is now 512px"
      ),
    max_height: z
      .number()
      .default(512)
      .describe(
        "For backward compatibility only. Default maximum height is now 512px"
      ),
  },
  async (args, extra) => {
    const result = await extractScreenshotFromUrl(args);
    return result;
  }
);

// Start the server using stdio transport
const transport = new StdioServerTransport();
server.connect(transport).catch((error: unknown) => {
  console.error('Error starting MCP server:', error);
  process.exit(1);
});

console.log('MCP Image Extractor server started in stdio mode'); 