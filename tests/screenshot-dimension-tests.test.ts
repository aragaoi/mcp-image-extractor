import { jest } from '@jest/globals';
import puppeteer from 'puppeteer';
import sharp from 'sharp';

// Mock puppeteer
jest.mock('puppeteer');

// Import the function to test
import { extractScreenshotFromUrl } from '../src/image-utils';

describe('Screenshot Dimension Tests', () => {
  let mockPage: any;
  let mockBrowser: any;
  let mockSharpInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock page
    mockPage = {
      setViewport: jest.fn().mockResolvedValue(undefined),
      goto: jest.fn().mockResolvedValue(undefined),
      waitForSelector: jest.fn().mockResolvedValue(undefined),
      click: jest.fn().mockResolvedValue(undefined),
      screenshot: jest.fn().mockResolvedValue(Buffer.from('mock-screenshot-data'))
    };

    // Create mock browser
    mockBrowser = {
      newPage: jest.fn().mockResolvedValue(mockPage),
      close: jest.fn().mockResolvedValue(undefined)
    };

    // Mock puppeteer.launch
    (puppeteer.launch as jest.Mock).mockResolvedValue(mockBrowser);

    // Create mock sharp instance
    mockSharpInstance = {
      metadata: jest.fn(),
      resize: jest.fn().mockReturnThis(),
      toBuffer: jest.fn().mockResolvedValue(Buffer.from('processed-image-data'))
    };

    (sharp as unknown as jest.Mock).mockImplementation(() => mockSharpInstance);
  });

  describe('Dimension Validation', () => {
    it('should resize large screenshots to max dimensions', async () => {
      // Mock large screenshot dimensions
      mockSharpInstance.metadata
        .mockResolvedValueOnce({ width: 1920, height: 1080, format: 'png' }) // Initial
        .mockResolvedValueOnce({ width: 512, height: 288, format: 'png' });   // After resize

      const result = await extractScreenshotFromUrl({
        url: 'https://example.com',
        viewport_width: 1920,
        viewport_height: 1080,
        full_page: true,
        wait_for_load: 2000,
        click_wait_after: 500,
        resize: true,
        max_width: 512,
        max_height: 512
      });

      // Should call resize with correct parameters
      expect(mockSharpInstance.resize).toHaveBeenCalledWith({
        width: 512,
        height: 288, // 1080 * (512/1920) = 288
        fit: 'inside',
        withoutEnlargement: true
      });

      // Verify final dimensions in response
      const metadata = JSON.parse(result.content[0].text);
      expect(metadata.width).toBe(512);
      expect(metadata.height).toBe(288);
    });

    it('should not resize small screenshots', async () => {
      // Mock small screenshot dimensions
      mockSharpInstance.metadata
        .mockResolvedValueOnce({ width: 400, height: 300, format: 'png' }) // Initial
        .mockResolvedValueOnce({ width: 400, height: 300, format: 'png' }); // After (no resize)

      const result = await extractScreenshotFromUrl({
        url: 'https://example.com',
        viewport_width: 1920,
        viewport_height: 1080,
        full_page: true,
        wait_for_load: 2000,
        click_wait_after: 500,
        resize: true,
        max_width: 512,
        max_height: 512
      });

      // Should not call resize for small images
      expect(mockSharpInstance.resize).not.toHaveBeenCalled();

      // Verify dimensions in response
      const metadata = JSON.parse(result.content[0].text);
      expect(metadata.width).toBe(400);
      expect(metadata.height).toBe(300);
    });

    it('should handle very wide screenshots correctly', async () => {
      // Mock very wide screenshot (ultrawide monitor)
      mockSharpInstance.metadata
        .mockResolvedValueOnce({ width: 3440, height: 1440, format: 'png' }) // Initial
        .mockResolvedValueOnce({ width: 512, height: 214, format: 'png' });   // After resize

      const result = await extractScreenshotFromUrl({
        url: 'https://example.com',
        viewport_width: 3440,
        viewport_height: 1440,
        full_page: true,
        wait_for_load: 2000,
        click_wait_after: 500,
        resize: true,
        max_width: 512,
        max_height: 512
      });

      // Should resize to fit within max dimensions
      expect(mockSharpInstance.resize).toHaveBeenCalledWith({
        width: 512,
        height: 214, // 1440 * (512/3440) = 214
        fit: 'inside',
        withoutEnlargement: true
      });

      const metadata = JSON.parse(result.content[0].text);
      expect(metadata.width).toBe(512);
      expect(metadata.height).toBe(214);
    });

    it('should handle very tall screenshots correctly', async () => {
      // Mock very tall screenshot (long page)
      mockSharpInstance.metadata
        .mockResolvedValueOnce({ width: 1920, height: 5000, format: 'png' }) // Initial
        .mockResolvedValueOnce({ width: 512, height: 1333, format: 'png' });  // After resize

      const result = await extractScreenshotFromUrl({
        url: 'https://example.com',
        viewport_width: 1920,
        viewport_height: 1080,
        full_page: true,
        wait_for_load: 2000,
        click_wait_after: 500,
        resize: true,
        max_width: 512,
        max_height: 512
      });

      // Should resize to fit within max dimensions
      expect(mockSharpInstance.resize).toHaveBeenCalledWith({
        width: 512,
        height: 512, // Limited by max_height
        fit: 'inside',
        withoutEnlargement: true
      });

      const metadata = JSON.parse(result.content[0].text);
      expect(metadata.width).toBe(512);
      expect(metadata.height).toBe(1333); // This would be the actual result after resize
    });

    it('should respect custom max dimensions', async () => {
      // Mock large screenshot
      mockSharpInstance.metadata
        .mockResolvedValueOnce({ width: 1920, height: 1080, format: 'png' }) // Initial
        .mockResolvedValueOnce({ width: 800, height: 450, format: 'png' });   // After resize

      const result = await extractScreenshotFromUrl({
        url: 'https://example.com',
        viewport_width: 1920,
        viewport_height: 1080,
        full_page: true,
        wait_for_load: 2000,
        click_wait_after: 500,
        resize: true,
        max_width: 800,
        max_height: 600
      });

      // Should use custom max dimensions
      expect(mockSharpInstance.resize).toHaveBeenCalledWith({
        width: 800,
        height: 450, // 1080 * (800/1920) = 450
        fit: 'inside',
        withoutEnlargement: true
      });

      const metadata = JSON.parse(result.content[0].text);
      expect(metadata.width).toBe(800);
      expect(metadata.height).toBe(450);
    });

    it('should handle square screenshots correctly', async () => {
      // Mock square screenshot
      mockSharpInstance.metadata
        .mockResolvedValueOnce({ width: 2000, height: 2000, format: 'png' }) // Initial
        .mockResolvedValueOnce({ width: 512, height: 512, format: 'png' });   // After resize

      const result = await extractScreenshotFromUrl({
        url: 'https://example.com',
        viewport_width: 2000,
        viewport_height: 2000,
        full_page: true,
        wait_for_load: 2000,
        click_wait_after: 500,
        resize: true,
        max_width: 512,
        max_height: 512
      });

      // Should resize to square max dimensions
      expect(mockSharpInstance.resize).toHaveBeenCalledWith({
        width: 512,
        height: 512,
        fit: 'inside',
        withoutEnlargement: true
      });

      const metadata = JSON.parse(result.content[0].text);
      expect(metadata.width).toBe(512);
      expect(metadata.height).toBe(512);
    });

    it('should maintain aspect ratio during resize', async () => {
      // Test various aspect ratios
      const testCases = [
        { original: { w: 1920, h: 1080 }, expected: { w: 512, h: 288 } }, // 16:9
        { original: { w: 1080, h: 1920 }, expected: { w: 288, h: 512 } }, // 9:16
        { original: { w: 1600, h: 900 }, expected: { w: 512, h: 288 } },  // 16:9
        { original: { w: 1200, h: 800 }, expected: { w: 512, h: 341 } },  // 3:2
      ];

      for (const testCase of testCases) {
        jest.clearAllMocks();
        mockSharpInstance.metadata
          .mockResolvedValueOnce({ 
            width: testCase.original.w, 
            height: testCase.original.h, 
            format: 'png' 
          })
          .mockResolvedValueOnce({ 
            width: testCase.expected.w, 
            height: testCase.expected.h, 
            format: 'png' 
          });

        await extractScreenshotFromUrl({
          url: 'https://example.com',
          viewport_width: testCase.original.w,
          viewport_height: testCase.original.h,
          full_page: true,
          wait_for_load: 2000,
          click_wait_after: 500,
          resize: true,
          max_width: 512,
          max_height: 512
        });

        expect(mockSharpInstance.resize).toHaveBeenCalledWith({
          width: testCase.expected.w,
          height: testCase.expected.h,
          fit: 'inside',
          withoutEnlargement: true
        });
      }
    });

    it('should handle edge case of very small max dimensions', async () => {
      // Mock normal screenshot
      mockSharpInstance.metadata
        .mockResolvedValueOnce({ width: 1920, height: 1080, format: 'png' }) // Initial
        .mockResolvedValueOnce({ width: 100, height: 56, format: 'png' });    // After resize

      const result = await extractScreenshotFromUrl({
        url: 'https://example.com',
        viewport_width: 1920,
        viewport_height: 1080,
        full_page: true,
        wait_for_load: 2000,
        click_wait_after: 500,
        resize: true,
        max_width: 100,
        max_height: 100
      });

      // Should resize to very small dimensions
      expect(mockSharpInstance.resize).toHaveBeenCalledWith({
        width: 100,
        height: 56, // 1080 * (100/1920) = 56
        fit: 'inside',
        withoutEnlargement: true
      });

      const metadata = JSON.parse(result.content[0].text);
      expect(metadata.width).toBe(100);
      expect(metadata.height).toBe(56);
    });

    it('should verify viewport dimensions are passed correctly', async () => {
      const testViewports = [
        { width: 1920, height: 1080 },
        { width: 1366, height: 768 },
        { width: 375, height: 667 },
        { width: 414, height: 896 },
        { width: 1024, height: 768 },
        { width: 1440, height: 900 }
      ];

      for (const viewport of testViewports) {
        jest.clearAllMocks();
        mockPage.setViewport.mockResolvedValue(undefined);

        await extractScreenshotFromUrl({
          url: 'https://example.com',
          viewport_width: viewport.width,
          viewport_height: viewport.height,
          full_page: true,
          wait_for_load: 2000,
          click_wait_after: 500,
          resize: true,
          max_width: 512,
          max_height: 512
        });

        expect(mockPage.setViewport).toHaveBeenCalledWith({
          width: viewport.width,
          height: viewport.height
        });
      }
    });
  });
});
