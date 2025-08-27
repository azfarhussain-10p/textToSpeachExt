#!/usr/bin/env node

/**
 * Setup Development Environment
 * Creates necessary directories and files for the TTS extension development
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up development environment...');

// Create necessary directories if they don't exist
const directories = [
  'dist',
  'releases',
  'dist/chrome', 
  'dist/firefox',
  'dist/safari'
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

console.log('✅ Development environment setup complete!');
console.log('📝 Next steps:');
console.log('   1. Configure your .env file with API keys');
console.log('   2. Run npm run dev to start development');
console.log('   3. Run npm run build:all to build for all browsers');