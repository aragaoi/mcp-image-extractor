import { jest } from '@jest/globals';

// Mock modules before importing the code that uses them
jest.mock('@modelcontextprotocol/sdk/server/mcp.js', () => {
  const mockTool = jest.fn();
  const mockConnect = jest.fn().mockImplementation(() => Promise.resolve());
  
  return {
    McpServer: jest.fn().mockImplementation(() => ({
      tool: mockTool,
      connect: mockConnect
    }))
  };
});

jest.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
  StdioServerTransport: jest.fn()
}));

jest.mock('axios');
jest.mock('sharp');
jest.mock('fs');
jest.mock('path');

describe('MCP Image Extractor Server', () => {
  it('should import without errors', () => {
    // This test just verifies that the server can be imported without errors
    expect(() => {
      jest.isolateModules(() => {
        require('../src/index');
      });
    }).not.toThrow();
  });
}); 