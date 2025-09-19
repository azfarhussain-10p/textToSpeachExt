#!/usr/bin/env node

/**
 * Universal Extension Packaging Script
 * Creates production packages for all supported browsers
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const packageJson = require('../package.json');
const RELEASES_DIR = './releases';

console.log('🚀 Packaging TTS Extension for All Browsers...');
console.log(`📦 Version: ${packageJson.version}`);
console.log('=' .repeat(50));

// Ensure releases directory exists
if (!fs.existsSync(RELEASES_DIR)) {
  fs.mkdirSync(RELEASES_DIR, { recursive: true });
  console.log('✅ Created releases directory');
}

// Track packaging results
const results = {
  chrome: { success: false, error: null, size: null },
  firefox: { success: false, error: null, size: null },
  safari: { success: false, error: null, size: null }
};

// Package Chrome Extension
console.log('\n🔵 Packaging Chrome Extension...');
try {
  execSync('node scripts/package-chrome.js', { stdio: 'inherit' });
  
  const chromePackage = path.join(RELEASES_DIR, `chrome-extension-v${packageJson.version}.zip`);
  if (fs.existsSync(chromePackage)) {
    results.chrome.success = true;
    results.chrome.size = fs.statSync(chromePackage).size;
    console.log('✅ Chrome packaging completed');
  }
} catch (error) {
  results.chrome.error = error.message;
  console.error('❌ Chrome packaging failed');
}

// Package Firefox Add-on
console.log('\n🦊 Packaging Firefox Add-on...');
try {
  execSync('node scripts/package-firefox.js', { stdio: 'inherit' });
  
  const firefoxPackage = path.join(RELEASES_DIR, `firefox-addon-v${packageJson.version}.zip`);
  if (fs.existsSync(firefoxPackage)) {
    results.firefox.success = true;
    results.firefox.size = fs.statSync(firefoxPackage).size;
    console.log('✅ Firefox packaging completed');
  }
} catch (error) {
  results.firefox.error = error.message;
  console.error('❌ Firefox packaging failed');
}

// Package Safari Extension (if on macOS)
console.log('\n🍎 Packaging Safari Extension...');
try {
  const isMacOS = process.platform === 'darwin';
  if (isMacOS) {
    // Check if Safari build exists
    const SAFARI_DIST = './dist/safari';
    if (fs.existsSync(SAFARI_DIST)) {
      execSync('mkdir -p releases', { stdio: 'inherit' });
      execSync('xcrun safari-web-extension-converter dist/safari --app-name "TTS Extension" --bundle-identifier com.ttse.extension', { 
        stdio: 'inherit' 
      });
      
      results.safari.success = true;
      console.log('✅ Safari packaging completed (Xcode project created)');
    } else {
      throw new Error('Safari build not found. Run `npm run build:safari` first');
    }
  } else {
    console.log('⚠️  Safari packaging skipped (requires macOS)');
    results.safari.error = 'Requires macOS';
  }
} catch (error) {
  results.safari.error = error.message;
  console.error('❌ Safari packaging failed:', error.message);
}

// Generate packaging summary
console.log('\n' + '='.repeat(50));
console.log('📊 PACKAGING SUMMARY');
console.log('='.repeat(50));

const successCount = Object.values(results).filter(r => r.success).length;
const totalBrowsers = Object.keys(results).length;

console.log(`✅ Successfully packaged: ${successCount}/${totalBrowsers} browsers`);
console.log();

// Detail results for each browser
Object.entries(results).forEach(([browser, result]) => {
  const icon = result.success ? '✅' : '❌';
  const name = browser.charAt(0).toUpperCase() + browser.slice(1);
  
  if (result.success) {
    const sizeKB = result.size ? Math.round(result.size / 1024) : 'Unknown';
    console.log(`${icon} ${name}: Package created (${sizeKB} KB)`);
  } else {
    const reason = result.error || 'Unknown error';
    console.log(`${icon} ${name}: Failed - ${reason}`);
  }
});

// List created packages
console.log('\n📦 Created Packages:');
try {
  const releaseFiles = fs.readdirSync(RELEASES_DIR)
    .filter(file => file.includes(packageJson.version))
    .sort();
  
  if (releaseFiles.length > 0) {
    releaseFiles.forEach(file => {
      const filePath = path.join(RELEASES_DIR, file);
      const stats = fs.statSync(filePath);
      const sizeKB = Math.round(stats.size / 1024);
      console.log(`   📄 ${file} (${sizeKB} KB)`);
    });
  } else {
    console.log('   (No packages found)');
  }
} catch {
  console.log('   (Could not list packages)');
}

// Store submission guidance
if (successCount > 0) {
  console.log('\n🚀 STORE SUBMISSION READY!');
  console.log('\n📚 Next Steps:');
  
  if (results.chrome.success) {
    console.log('   🔵 Chrome Web Store: https://chrome.google.com/webstore/devconsole');
  }
  
  if (results.firefox.success) {
    console.log('   🦊 Firefox Add-ons (AMO): https://addons.mozilla.org/developers/');
  }
  
  if (results.safari.success) {
    console.log('   🍎 Safari Extensions: Use generated Xcode project');
  }
  
  console.log('\n⚠️  Remember to:');
  console.log('   • Test packages before submission');
  console.log('   • Prepare store listings and screenshots'); 
  console.log('   • Set up analytics and error tracking');
  console.log('   • Plan release rollout strategy');
}

// Exit with appropriate code
const exitCode = successCount > 0 ? 0 : 1;
process.exit(exitCode);