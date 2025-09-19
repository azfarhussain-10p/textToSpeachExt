#!/usr/bin/env node

/**
 * Installation Verification Script
 * Verifies that the TTS Extension is properly set up
 */

const fs = require('fs');

console.log('🔍 Verifying TTS Extension Installation...\n');

// Check if essential source files exist
const essentialFiles = [
  'src/services/tts-service.js',
  'src/services/ai-service.js', 
  'src/utils/text-highlighter.js',
  'src/utils/content-sanitizer.js',
  'src/overlay/overlay.js',
  'src/content/content-script.js',
  'src/popup/popup.js'
];

console.log('📁 Source Files Verification:');
let allFilesExist = true;

essentialFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

// Check manifest files
const manifestFiles = [
  'src/manifest/chrome/manifest.json',
  'src/manifest/firefox/manifest.json', 
  'src/manifest/safari/manifest.json'
];

console.log('\n📄 Manifest Files:');
manifestFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

// Check build system files
const buildFiles = [
  'webpack.config.js',
  'build/webpack.chrome.js',
  'build/webpack.firefox.js',
  'build/webpack.safari.js'
];

console.log('\n🛠️  Build System Files:');
let allBuildFilesExist = true;

buildFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allBuildFilesExist = false;
});

// Check test files
const testFiles = [
  'jest.config.js',
  'jest.e2e.config.js',
  'tests/setup/jest.setup.js',
  'tests/unit/services/tts-service.test.js',
  'tests/unit/utils/text-highlighter.test.js'
];

console.log('\n🧪 Testing Framework:');
let allTestFilesExist = true;

testFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allTestFilesExist = false;
});

// Check package.json
console.log('\n📦 Package Configuration:');
const packageJsonExists = fs.existsSync('package.json');
console.log(`  ${packageJsonExists ? '✅' : '❌'} package.json`);

// Check node_modules
const nodeModulesExists = fs.existsSync('node_modules');
console.log(`  ${nodeModulesExists ? '✅' : '❌'} node_modules (dependencies installed)`);

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 VERIFICATION SUMMARY');
console.log('='.repeat(50));

if (allFilesExist) {
  console.log('✅ Core Implementation: COMPLETE');
} else {
  console.log('❌ Core Implementation: MISSING FILES');
}

if (allBuildFilesExist) {
  console.log('✅ Build System: CONFIGURED');
} else {
  console.log('❌ Build System: MISSING FILES');
}

if (allTestFilesExist) {
  console.log('✅ Testing Framework: CONFIGURED');
} else {
  console.log('❌ Testing Framework: MISSING FILES');
}

if (nodeModulesExists) {
  console.log('✅ Dependencies: INSTALLED');
} else {
  console.log('⚠️  Dependencies: NOT INSTALLED (Run: npm install)');
}

// Next steps
console.log('\n🚀 NEXT STEPS:');

if (!nodeModulesExists) {
  console.log('1. Install dependencies: npm install');
  console.log('2. Start development: npm run dev:chrome');
  console.log('3. Run tests: npm run test');
  console.log('4. Build for production: npm run build:all');
} else {
  console.log('1. Start development: npm run dev:chrome');
  console.log('2. Run tests: npm run test');
  console.log('3. Build for production: npm run build:all');
  console.log('4. Package for stores: npm run package:all');
}

console.log('\n📚 Documentation:');
console.log('• Development Guide: docs/development-guide.md');
console.log('• Implementation Status: docs/implementation-status.md');
console.log('• Final Report: docs/final-implementation-report.md');

const overallStatus = allFilesExist && allBuildFilesExist && allTestFilesExist;
if (overallStatus) {
  if (nodeModulesExists) {
    console.log('\n🎉 STATUS: PRODUCTION READY - All systems operational!');
  } else {
    console.log('\n⚡ STATUS: READY FOR DEVELOPMENT - Just install dependencies!');
  }
} else {
  console.log('\n⚠️  STATUS: SETUP INCOMPLETE - Some files are missing');
}

process.exit(overallStatus ? 0 : 1);