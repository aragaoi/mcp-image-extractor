#!/usr/bin/env node

/**
 * Deployment script for Smithery
 * This script loads the API key from .env file and uses it to deploy the MCP server
 */

require('dotenv').config();
const { execSync } = require('child_process');
const path = require('path');

// Check if API key is available
const apiKey = process.env.SMITHERY_API_KEY;

if (!apiKey || apiKey === 'your_api_key_here') {
  console.error('Error: SMITHERY_API_KEY not found in .env file');
  console.error('Please add your Smithery API key to the .env file:');
  console.error('SMITHERY_API_KEY=your_actual_key_here');
  process.exit(1);
}

console.log('Starting deployment to Smithery...');

try {
  // Run the Smithery deploy command with the API key
  execSync(`SMITHERY_API_KEY=${apiKey} npx @smithery/cli install . --client claude`, { 
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..')
  });
  
  console.log('Deployment successful!');
} catch (error) {
  console.error('Deployment failed:', error.message);
  process.exit(1);
} 