#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as dotenv from 'dotenv';
import {
  extractImageFromFile,
  extractImageFromUrl,
  extractImageFromBase64
} from './image-utils';

dotenv.config();

// Create an MCP server
const server = new McpServer({
  name: "mcp-image-extractor",
  description: "MCP server for extracting and converting images to base64 for LLM analysis",
  version: "1.0.0"
});

// Add extract_image_from_file tool
server.tool(
  "extract_image_from_file",
  {
    file_path: z.string().describe("Path to the local image file"),
    resize: z.boolean().default(true).describe("Whether to resize the image to optimize for LLM processing"),
    max_width: z.number().default(800).describe("Maximum width of the resized image (if resize is true)"),
    max_height: z.number().default(800).describe("Maximum height of the resized image (if resize is true)")
  },
  async (args, extra) => {
    const result = await extractImageFromFile(args);
    return result;
  }
);

// Add extract_image_from_url tool
server.tool(
  "extract_image_from_url",
  {
    url: z.string().describe("URL of the image to extract"),
    resize: z.boolean().default(true).describe("Whether to resize the image to optimize for LLM processing"),
    max_width: z.number().default(800).describe("Maximum width of the resized image (if resize is true)"),
    max_height: z.number().default(800).describe("Maximum height of the resized image (if resize is true)")
  },
  async (args, extra) => {
    const result = await extractImageFromUrl(args);
    return result;
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
  async (args, extra) => {
    const result = await extractImageFromBase64(args);
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