import { jest } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { extractImageFromFile } from '../src/image-utils';

// Mock dependencies to run in isolation
jest.mock('fs');
jest.mock('path');
jest.mock('sharp');

// Mock console.warn and error
beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

// Define mock types
type MockedSharp = {
  metadata: jest.Mock;
  resize: jest.Mock;
  toBuffer: jest.Mock;
  jpeg: jest.Mock;
  png: jest.Mock;
  webp: jest.Mock;
  avif: jest.Mock;
  tiff: jest.Mock;
};

describe('Image Compression', () => {
  // Sample image buffer for testing
  const testImageBuffer = Buffer.from('test-image-data');
  const originalSize = testImageBuffer.length;
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock file system
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(testImageBuffer);
    (fs.statSync as jest.Mock).mockReturnValue({ size: originalSize });
    
    // Path mock
    (path.extname as jest.Mock).mockReturnValue('.png');
    (path.basename as jest.Mock).mockImplementation(function(p: unknown, ext?: unknown) {
      return String(p).replace(String(ext || ''), '');
    });
    
    // Create compressed buffer that's smaller than the original
    const compressedBuffer = Buffer.from('compressed');
    
    // Create a mock sharp instance with properly typed methods
    const mockSharpInstance: MockedSharp = {
      // @ts-ignore - Ignore type error for mockResolvedValue
      metadata: jest.fn().mockResolvedValue({ width: 800, height: 600, format: 'png' }),
      resize: jest.fn().mockReturnThis(),
      // @ts-ignore - Ignore type error for mockResolvedValue
      toBuffer: jest.fn().mockResolvedValue(compressedBuffer),
      jpeg: jest.fn().mockReturnThis(),
      png: jest.fn().mockReturnThis(),
      webp: jest.fn().mockReturnThis(),
      avif: jest.fn().mockReturnThis(),
      tiff: jest.fn().mockReturnThis(),
    };
    
    ((sharp as unknown) as jest.Mock).mockImplementation(() => mockSharpInstance);
  });

  it('should compress PNG images', async () => {
    (path.extname as jest.Mock).mockReturnValue('.png');
    
    const result = await extractImageFromFile({
      file_path: 'test_image.png',
      resize: true,
      max_width: 512,
      max_height: 512
    });
    
    expect(result.content).toBeDefined();
    expect(result.content.length).toBeGreaterThan(0);
    
    // Get the metadata from the result
    const metadata = JSON.parse(result.content[0].text as string);
    
    // Since our compressed buffer is smaller than the original, size should be reduced
    expect(metadata.size).toBeLessThan(originalSize);
    
    // Check if the PNG compression method was called
    const sharpInstance = (sharp as unknown as jest.Mock).mock.results[0].value as MockedSharp;
    expect(sharpInstance.png).toHaveBeenCalled();
  });

  it('should compress JPEG images', async () => {
    (path.extname as jest.Mock).mockReturnValue('.jpg');
    
    const result = await extractImageFromFile({
      file_path: 'test_image.jpg',
      resize: true,
      max_width: 512,
      max_height: 512
    });
    
    expect(result.content).toBeDefined();
    expect(result.content.length).toBeGreaterThan(0);
    
    // Get the metadata from the result
    const metadata = JSON.parse(result.content[0].text as string);
    
    // Check if the JPEG compression method was called
    const sharpInstance = (sharp as unknown as jest.Mock).mock.results[0].value as MockedSharp;
    expect(sharpInstance.jpeg).toHaveBeenCalled();
  });

  it('should handle unsupported formats gracefully', async () => {
    // Mock sharp instance to throw on compression
    const mockErrorSharpInstance: MockedSharp = {
      // @ts-ignore
      metadata: jest.fn().mockResolvedValue({ width: 800, height: 600, format: 'unknown' }),
      resize: jest.fn().mockReturnThis(),
      // @ts-ignore
      toBuffer: jest.fn().mockResolvedValue(testImageBuffer),
      jpeg: jest.fn().mockImplementation(() => {
        throw new Error('Unsupported format');
      }),
      png: jest.fn().mockImplementation(() => {
        throw new Error('Unsupported format');
      }),
      webp: jest.fn().mockImplementation(() => {
        throw new Error('Unsupported format');
      }),
      avif: jest.fn().mockImplementation(() => {
        throw new Error('Unsupported format');
      }),
      tiff: jest.fn().mockImplementation(() => {
        throw new Error('Unsupported format');
      }),
    };
    
    ((sharp as unknown) as jest.Mock).mockImplementation(() => mockErrorSharpInstance);
    
    (path.extname as jest.Mock).mockReturnValue('.unknown');
    
    const result = await extractImageFromFile({
      file_path: 'test_image.unknown',
      resize: true,
      max_width: 512,
      max_height: 512
    });
    
    // The function should still return a result even if compression fails
    expect(result.content).toBeDefined();
    expect(result.content.length).toBeGreaterThan(0);
    
    // Check that console.warn was called
    expect(console.warn).toHaveBeenCalled();
  });
}); 