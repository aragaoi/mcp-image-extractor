import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import axios from 'axios';
import sharp from 'sharp';
import { extractImageFromUrl } from '../src/image-utils';

// Mock dependencies
jest.mock('axios');
jest.mock('sharp');

// Mock console functions
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
};

describe('URL Image Extraction Tests', () => {
  const testImageBuffer = Buffer.from('test-image-data');
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Create a mock response with image data
    (axios.get as jest.Mock).mockResolvedValue({
      data: testImageBuffer,
      headers: {
        'content-type': 'image/png'
      }
    } as any);
    
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
    };
    
    ((sharp as unknown) as jest.Mock).mockImplementation(() => mockSharpInstance);

    // Mock axios to throw a network error
    (axios.get as jest.Mock).mockRejectedValue(new Error('Network error') as never);

    // Mock a large image buffer
    const largeImageBuffer = Buffer.alloc(1000, 'x');
    (axios.get as jest.Mock).mockResolvedValue({
      data: largeImageBuffer,
      headers: {
        'content-type': 'image/jpeg'
      }
    } as any);
  });

  it('validates URL format', async () => {
    const result = await extractImageFromUrl({
      url: 'invalid-url',
      resize: true,
      max_width: 800,
      max_height: 800
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error: URL must start with http://');
  });

  it('successfully processes valid URLs', async () => {
    const result = await extractImageFromUrl({
      url: 'https://example.com/image.png',
      resize: true,
      max_width: 800,
      max_height: 800
    });

    // Validate the result
    expect(result.isError).toBeUndefined();
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
    expect(result.content[1].mimeType).toBe('image/png');
    
    // Verify axios was called with the right params
    expect(axios.get).toHaveBeenCalledWith('https://example.com/image.png', 
      expect.objectContaining({
        responseType: 'arraybuffer'
      })
    );
  });

  it('handles network errors', async () => {
    const result = await extractImageFromUrl({
      url: 'https://example.com/image.png',
      resize: true,
      max_width: 800,
      max_height: 800
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error: Network error');
  });

  it('compresses images from URLs', async () => {
    const result = await extractImageFromUrl({
      url: 'https://example.com/large-image.jpg',
      resize: true,
      max_width: 800,
      max_height: 800
    });

    // Get the metadata from the result
    const metadata = JSON.parse(result.content[0].text as string);
    
    // Verify size was reduced
    expect(metadata.size).toBe(compressedBuffer.length);
    expect(metadata.size).toBeLessThan(largeImageBuffer.length);
    
    // Verify jpeg compression was used for jpeg image
    const sharpInstance = (sharp as unknown as jest.Mock).mock.results[0].value as MockedSharp;
    expect(sharpInstance.jpeg).toHaveBeenCalled();
  });
}); 