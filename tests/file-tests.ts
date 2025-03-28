import { describe, it, expect, beforeEach } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import { extractImageFromFile } from '../src/image-utils';

// Test file paths
const TEST_IMAGE_PATH = path.join(__dirname, '../test_image.png');

describe('Image Extractor File Tests', () => {
  let originalReadFileSync: typeof fs.readFileSync;
  let originalExistsSync: typeof fs.existsSync;

  beforeEach(() => {
    // Save original functions
    originalReadFileSync = fs.readFileSync;
    originalExistsSync = fs.existsSync;
  });

  afterEach(() => {
    // Restore original functions
    (fs as any).readFileSync = originalReadFileSync;
    (fs as any).existsSync = originalExistsSync;
  });

  it('extracts image from file', async () => {
    // Only run this test if the test file exists
    if (fs.existsSync(TEST_IMAGE_PATH)) {
      const result = await extractImageFromFile({
        file_path: TEST_IMAGE_PATH,
        resize: true,
        max_width: 800,
        max_height: 800
      });

      // Basic validation of the result
      expect(result).toBeDefined();
      expect(result.content).toHaveLength(2);
      
      // Validate metadata
      const metadata = JSON.parse(result.content[0].text as string);
      expect(metadata.width).toBeDefined();
      expect(metadata.height).toBeDefined();
      expect(metadata.format).toBeDefined();
      expect(metadata.size).toBeDefined();

      // Validate image data
      expect(result.content[1].type).toBe('image');
      expect(result.content[1].data).toBeDefined();
      expect(result.content[1].mimeType).toBeDefined();
    } else {
      console.warn(`Test file not found: ${TEST_IMAGE_PATH}`);
    }
  });

  it('handles non-existent files', async () => {
    // Mock fs.existsSync to return false
    (fs as any).existsSync = jest.fn().mockReturnValue(false);

    const result = await extractImageFromFile({
      file_path: 'non-existent-file.png',
      resize: true,
      max_width: 800,
      max_height: 800
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('does not exist');
  });

  it('handles file reading errors', async () => {
    // Mock fs.existsSync to return true but fs.readFileSync to throw
    (fs as any).existsSync = jest.fn().mockReturnValue(true);
    (fs as any).readFileSync = jest.fn().mockImplementation(() => {
      throw new Error('Simulated read error');
    });

    const result = await extractImageFromFile({
      file_path: 'error-file.png',
      resize: true,
      max_width: 800,
      max_height: 800
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error:');
  });

  it('handles base64 encoding from test.js', async () => {
    // Only run this test if the test file exists
    if (fs.existsSync(TEST_IMAGE_PATH)) {
      const result = await extractImageFromFile({
        file_path: TEST_IMAGE_PATH,
        resize: true,
        max_width: 800,
        max_height: 800
      });

      // Validate base64 data
      expect(result.content[1].data).toBeDefined();
      expect(typeof result.content[1].data).toBe('string');
      
      // Basic validation that it's a base64 string
      const base64Data = result.content[1].data as string;
      expect(base64Data.length % 4).toBe(0); // Base64 length multiple of 4
    } else {
      console.warn(`Test file not found: ${TEST_IMAGE_PATH}`);
    }
  });

  it('compresses images to reduce file size', async () => {
    // Only run this test if the test file exists
    if (fs.existsSync(TEST_IMAGE_PATH)) {
      // Get original file size
      const originalSize = fs.statSync(TEST_IMAGE_PATH).size;
      
      // Extract and compress the image
      const result = await extractImageFromFile({
        file_path: TEST_IMAGE_PATH,
        resize: true,
        max_width: 800,
        max_height: 800
      });

      // Get metadata with compressed size
      const metadata = JSON.parse(result.content[0].text as string);
      
      console.log(`Original size: ${originalSize}, Compressed size: ${metadata.size}`);
      
      // The compressed size should be smaller than the original
      expect(metadata.size).toBeLessThan(originalSize);
    } else {
      console.warn(`Test file not found: ${TEST_IMAGE_PATH}`);
    }
  });
}); 