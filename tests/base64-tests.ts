import { describe, it, expect, beforeEach } from '@jest/globals';
import { extractImageFromBase64 } from '../src/image-utils';

describe('Base64 Image Extraction Tests', () => {
  // Valid PNG image in base64 format (1x1 transparent pixel)
  const validPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  
  // Invalid base64 string
  const invalidBase64 = 'this-is-not-base64!';

  it('successfully processes valid base64 image data', async () => {
    const result = await extractImageFromBase64({
      base64: validPngBase64,
      mime_type: 'image/png',
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
  });

  it('handles invalid base64 data', async () => {
    const result = await extractImageFromBase64({
      base64: invalidBase64,
      mime_type: 'image/png',
      resize: true,
      max_width: 800,
      max_height: 800
    });

    // Should return an error
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Error: Invalid base64 string');
  });

  it('compresses base64 images', async () => {
    // Generate a larger base64 image (larger than our 1x1 pixel)
    // We'll simulate this with the existing base64 string repeated
    const largerBase64 = validPngBase64.repeat(10);
    
    const result = await extractImageFromBase64({
      base64: largerBase64,
      mime_type: 'image/png',
      resize: true,
      max_width: 800,
      max_height: 800
    });

    // Validate the result includes compressed data
    const metadata = JSON.parse(result.content[0].text as string);
    
    // The compressed size should be reported in the metadata
    expect(metadata.size).toBeDefined();
    
    // The output base64 should be different from input 
    // (due to compression and/or resizing)
    expect(result.content[1].data).not.toBe(largerBase64);
  });
}); 