#!/usr/bin/env node

/**
 * Chrome Extension Packaging Script
 * Creates production-ready Chrome extension package
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CHROME_DIST = './dist/chrome';
const RELEASES_DIR = './releases';
const packageJson = require('../package.json');

console.log('📦 Packaging Chrome Extension...');

// Ensure releases directory exists
if (!fs.existsSync(RELEASES_DIR)) {
  fs.mkdirSync(RELEASES_DIR, { recursive: true });
  console.log('✅ Created releases directory');
}

// Check if Chrome build exists
if (!fs.existsSync(CHROME_DIST)) {
  console.error('❌ Chrome build not found. Run `npm run build:chrome` first');
  process.exit(1);
}

// Validate manifest exists
const manifestPath = path.join(CHROME_DIST, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error('❌ manifest.json not found in Chrome build');
  process.exit(1);
}

// Validate required files exist
const requiredFiles = [
  'background/service-worker.js',
  'content/content-script.js',
  'popup/popup.html',
  'popup/popup.js',
  'overlay/overlay.html',
  'overlay/overlay.js'
];

const missingFiles = requiredFiles.filter(file => 
  !fs.existsSync(path.join(CHROME_DIST, file))
);

if (missingFiles.length > 0) {
  console.error('❌ Missing required files:');
  missingFiles.forEach(file => console.error(`   - ${file}`));
  process.exit(1);
}

// Read and validate manifest
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
console.log(`📄 Manifest version: ${manifest.manifest_version}`);
console.log(`🏷️  Extension version: ${manifest.version}`);

// Ensure manifest version matches package.json
if (manifest.version !== packageJson.version) {
  console.warn(`⚠️  Version mismatch: package.json(${packageJson.version}) vs manifest(${manifest.version})`);
}

// Create package filename
const packageName = `chrome-extension-v${packageJson.version}.zip`;
const packagePath = path.join(RELEASES_DIR, packageName);

try {
  // Remove existing package if it exists
  if (fs.existsSync(packagePath)) {
    fs.unlinkSync(packagePath);
    console.log('🗑️  Removed existing package');
  }

  // Create ZIP package
  process.chdir(CHROME_DIST);
  execSync(`zip -r ../../${packagePath} .`, { stdio: 'inherit' });
  process.chdir('../..');

  // Verify package was created and get size
  const stats = fs.statSync(packagePath);
  const sizeKB = Math.round(stats.size / 1024);
  const sizeMB = Math.round(stats.size / (1024 * 1024) * 100) / 100;

  console.log('✅ Chrome extension packaged successfully!');
  console.log(`📦 Package: ${packageName}`);
  console.log(`📊 Size: ${sizeKB} KB (${sizeMB} MB)`);
  
  // Chrome Web Store size warning
  if (stats.size > 128 * 1024 * 1024) {
    console.warn('⚠️  WARNING: Package exceeds Chrome Web Store 128MB limit');
  } else if (stats.size > 25 * 1024 * 1024) {
    console.warn('⚠️  WARNING: Large package size may affect store review time');
  }

  // Display package contents summary
  console.log('\n📋 Package Contents:');
  try {
    const contents = execSync(`unzip -l "${packagePath}"`, { encoding: 'utf8' });
    const lines = contents.split('\n');
    const fileLines = lines.filter(line => 
      line.includes('.js') || line.includes('.html') || line.includes('.css') || 
      line.includes('.json') || line.includes('.png')
    );
    
    fileLines.slice(0, 10).forEach(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 4) {
        const size = parts[0];
        const file = parts[parts.length - 1];
        console.log(`   📄 ${file} (${size} bytes)`);
      }
    });
    
    if (fileLines.length > 10) {
      console.log(`   ... and ${fileLines.length - 10} more files`);
    }
  } catch (error) {
    console.log('   (Could not list package contents)');
  }

  console.log('\n🚀 Ready for Chrome Web Store submission!');
  console.log('\n📚 Next steps:');
  console.log('   1. Go to https://chrome.google.com/webstore/devconsole');
  console.log('   2. Upload the package file');
  console.log('   3. Fill in store listing details');
  console.log('   4. Submit for review');

} catch (error) {
  console.error('❌ Packaging failed:', error.message);
  process.exit(1);
}