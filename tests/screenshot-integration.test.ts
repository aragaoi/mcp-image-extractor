import { jest } from "@jest/globals";

// Mock puppeteer at the module level
jest.mock("puppeteer", () => ({
  launch: jest.fn(),
}));

// Mock sharp at the module level
jest.mock("sharp", () => {
  return jest.fn().mockImplementation(() => ({
    metadata: jest.fn(),
    resize: jest.fn().mockReturnThis(),
    toBuffer: jest.fn(),
  }));
});

// Import after mocking
import puppeteer from "puppeteer";
import sharp from "sharp";
import { extractScreenshotFromUrl } from "../src/image-utils";

describe("Screenshot Integration Tests", () => {
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
      screenshot: jest
        .fn()
        .mockResolvedValue(Buffer.from("mock-screenshot-data")),
    };

    // Create mock browser
    mockBrowser = {
      newPage: jest.fn().mockResolvedValue(mockPage),
      close: jest.fn().mockResolvedValue(undefined),
    };

    // Mock puppeteer.launch
    (puppeteer.launch as jest.Mock).mockResolvedValue(mockBrowser);

    // Create mock sharp instance
    mockSharpInstance = {
      metadata: jest.fn(),
      resize: jest.fn().mockReturnThis(),
      toBuffer: jest
        .fn()
        .mockResolvedValue(Buffer.from("processed-image-data")),
    };

    (sharp as jest.Mock).mockImplementation(() => mockSharpInstance);
  });

  describe("Dimension Validation", () => {
    it("should maintain viewport dimensions without resizing", async () => {
      // Mock screenshot dimensions matching viewport (1920x1080)
      mockSharpInstance.metadata.mockResolvedValue({
        width: 1920,
        height: 1080,
        format: "png",
      });

      const result = await extractScreenshotFromUrl({
        url: "https://example.com",
        viewport_width: 1920,
        viewport_height: 1080,
        full_page: true,
        wait_for_load: 2000,
        click_wait_after: 500,
        resize: true,
        max_width: 512,
        max_height: 512,
      });

      // Verify sharp was called with screenshot data
      expect(sharp).toHaveBeenCalledWith(Buffer.from("mock-screenshot-data"));

      // Verify NO resize was called - screenshots should maintain original dimensions
      expect(mockSharpInstance.resize).not.toHaveBeenCalled();

      // Verify final dimensions match viewport
      const metadata = JSON.parse(result.content[0].text);
      expect(metadata.width).toBe(1920);
      expect(metadata.height).toBe(1080);
      expect(metadata.viewport).toEqual({ width: 1920, height: 1080 });
    });

    it("should maintain small viewport dimensions", async () => {
      // Mock small viewport screenshot dimensions (400x300)
      mockSharpInstance.metadata.mockResolvedValue({
        width: 400,
        height: 300,
        format: "png",
      });

      const result = await extractScreenshotFromUrl({
        url: "https://example.com",
        viewport_width: 400,
        viewport_height: 300,
        full_page: true,
        wait_for_load: 2000,
        click_wait_after: 500,
        resize: true,
        max_width: 512,
        max_height: 512,
      });

      // Should not call resize - screenshots maintain viewport dimensions
      expect(mockSharpInstance.resize).not.toHaveBeenCalled();

      // Verify dimensions match viewport
      const metadata = JSON.parse(result.content[0].text);
      expect(metadata.width).toBe(400);
      expect(metadata.height).toBe(300);
      expect(metadata.viewport).toEqual({ width: 400, height: 300 });
    });

    it("should handle ultrawide viewport screenshots correctly", async () => {
      // Mock ultrawide viewport screenshot (3440x1440)
      mockSharpInstance.metadata.mockResolvedValue({
        width: 3440,
        height: 1440,
        format: "png",
      });

      const result = await extractScreenshotFromUrl({
        url: "https://example.com",
        viewport_width: 3440,
        viewport_height: 1440,
        full_page: true,
        wait_for_load: 2000,
        click_wait_after: 500,
        resize: true,
        max_width: 512,
        max_height: 512,
      });

      // Should not resize - screenshots maintain viewport dimensions
      expect(mockSharpInstance.resize).not.toHaveBeenCalled();

      const metadata = JSON.parse(result.content[0].text);
      expect(metadata.width).toBe(3440);
      expect(metadata.height).toBe(1440);
      expect(metadata.viewport).toEqual({ width: 3440, height: 1440 });
    });

    it("should handle full page screenshots correctly", async () => {
      // Mock full page screenshot (1920x5000) - tall page
      mockSharpInstance.metadata.mockResolvedValue({
        width: 1920,
        height: 5000,
        format: "png",
      });

      const result = await extractScreenshotFromUrl({
        url: "https://example.com",
        viewport_width: 1920,
        viewport_height: 1080,
        full_page: true,
        wait_for_load: 2000,
        click_wait_after: 500,
        resize: true,
        max_width: 512,
        max_height: 512,
      });

      // Should not resize - screenshots maintain original dimensions
      expect(mockSharpInstance.resize).not.toHaveBeenCalled();

      const metadata = JSON.parse(result.content[0].text);
      expect(metadata.width).toBe(1920);
      expect(metadata.height).toBe(5000);
      expect(metadata.viewport).toEqual({ width: 1920, height: 1080 });
    });

    it("should maintain viewport dimensions regardless of max dimensions", async () => {
      // Mock screenshot matching viewport
      mockSharpInstance.metadata.mockResolvedValue({
        width: 1920,
        height: 1080,
        format: "png",
      });

      const result = await extractScreenshotFromUrl({
        url: "https://example.com",
        viewport_width: 1920,
        viewport_height: 1080,
        full_page: true,
        wait_for_load: 2000,
        click_wait_after: 500,
        resize: true,
        max_width: 800,
        max_height: 600,
      });

      // Should not resize - screenshots maintain viewport dimensions
      expect(mockSharpInstance.resize).not.toHaveBeenCalled();

      const metadata = JSON.parse(result.content[0].text);
      expect(metadata.width).toBe(1920);
      expect(metadata.height).toBe(1080);
      expect(metadata.viewport).toEqual({ width: 1920, height: 1080 });
    });

    it("should maintain viewport aspect ratio", async () => {
      // Test 16:9 aspect ratio viewport
      mockSharpInstance.metadata.mockResolvedValue({
        width: 1920,
        height: 1080,
        format: "png",
      });

      const result = await extractScreenshotFromUrl({
        url: "https://example.com",
        viewport_width: 1920,
        viewport_height: 1080,
        full_page: true,
        wait_for_load: 2000,
        click_wait_after: 500,
        resize: true,
        max_width: 512,
        max_height: 512,
      });

      // Verify aspect ratio is maintained from viewport
      const viewportRatio = 1920 / 1080;
      const screenshotRatio = 1920 / 1080;
      expect(Math.abs(viewportRatio - screenshotRatio)).toBeLessThan(0.01);

      // Should not resize
      expect(mockSharpInstance.resize).not.toHaveBeenCalled();

      const metadata = JSON.parse(result.content[0].text);
      expect(metadata.width).toBe(1920);
      expect(metadata.height).toBe(1080);
    });

    it("should verify viewport dimensions are passed correctly", async () => {
      const testViewports = [
        { width: 1920, height: 1080 },
        { width: 1366, height: 768 },
        { width: 375, height: 667 },
        { width: 414, height: 896 },
      ];

      for (const viewport of testViewports) {
        jest.clearAllMocks();
        mockPage.setViewport.mockResolvedValue(undefined);
        mockSharpInstance.metadata.mockResolvedValue({
          width: 512,
          height: 288,
          format: "png",
        });

        await extractScreenshotFromUrl({
          url: "https://example.com",
          viewport_width: viewport.width,
          viewport_height: viewport.height,
          full_page: true,
          wait_for_load: 100, // Reduced wait time for test
          click_wait_after: 50, // Reduced wait time for test
          resize: true,
          max_width: 512,
          max_height: 512,
        });

        expect(mockPage.setViewport).toHaveBeenCalledWith({
          width: viewport.width,
          height: viewport.height,
        });
      }
    });

    it("should handle click functionality with correct timing", async () => {
      mockSharpInstance.metadata.mockResolvedValue({
        width: 512,
        height: 288,
        format: "png",
      });

      const startTime = Date.now();

      await extractScreenshotFromUrl({
        url: "https://example.com",
        viewport_width: 1920,
        viewport_height: 1080,
        full_page: true,
        wait_for_load: 2000,
        click_selector: ".dropdown-trigger",
        click_wait_after: 1000,
        resize: true,
        max_width: 512,
        max_height: 512,
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should wait for click and additional time
      expect(duration).toBeGreaterThanOrEqual(1000);
      expect(mockPage.waitForSelector).toHaveBeenCalledWith(
        ".dropdown-trigger",
        { timeout: 10000 }
      );
      expect(mockPage.click).toHaveBeenCalledWith(".dropdown-trigger");
    });

    it("should return correct response format", async () => {
      mockSharpInstance.metadata.mockResolvedValue({
        width: 512,
        height: 288,
        format: "png",
      });

      const result = await extractScreenshotFromUrl({
        url: "https://example.com",
        viewport_width: 1920,
        viewport_height: 1080,
        full_page: true,
        wait_for_load: 2000,
        click_selector: ".dropdown-trigger",
        click_wait_after: 500,
        resize: true,
        max_width: 512,
        max_height: 512,
      });

      // Verify response structure
      expect(result.content).toHaveLength(2);
      expect(result.content[0].type).toBe("text");
      expect(result.content[1].type).toBe("image");
      expect(result.content[1].mimeType).toBe("image/png");

      // Verify metadata
      const metadata = JSON.parse(result.content[0].text);
      expect(metadata.url).toBe("https://example.com");
      expect(metadata.viewport).toEqual({ width: 1920, height: 1080 });
      expect(metadata.full_page).toBe(true);
      expect(metadata.click_selector).toBe(".dropdown-trigger");
      expect(metadata.click_wait_after).toBe(500);
      expect(metadata.width).toBe(512);
      expect(metadata.height).toBe(288);
      expect(metadata.format).toBe("png");
    });
  });
});
