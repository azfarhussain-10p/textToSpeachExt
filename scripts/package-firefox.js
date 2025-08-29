#!/usr/bin/env node

/**
 * Firefox Add-on Packaging Script
 * Creates production-ready Firefox add-on package
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FIREFOX_DIST = './dist/firefox';
const RELEASES_DIR = './releases';
const packageJson = require('../package.json');

console.log('🦊 Packaging Firefox Add-on...');

// Ensure releases directory exists
if (!fs.existsSync(RELEASES_DIR)) {
  fs.mkdirSync(RELEASES_DIR, { recursive: true });
  console.log('✅ Created releases directory');
}

// Check if Firefox build exists
if (!fs.existsSync(FIREFOX_DIST)) {
  console.error('❌ Firefox build not found. Run `npm run build:firefox` first');
  process.exit(1);
}

// Validate manifest exists
const manifestPath = path.join(FIREFOX_DIST, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error('❌ manifest.json not found in Firefox build');
  process.exit(1);
}

// Read and validate manifest
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
console.log(`📄 Manifest version: ${manifest.manifest_version}`);
console.log(`🏷️  Extension version: ${manifest.version}`);

// Firefox-specific validations
if (manifest.manifest_version !== 2) {
  console.warn('⚠️  Firefox typically uses Manifest V2');
}

// Check for Firefox-specific fields
if (!manifest.browser_specific_settings && !manifest.applications) {
  console.warn('⚠️  Consider adding browser_specific_settings for Firefox compatibility');
}

// Validate required files
const requiredFiles = [
  'background/background.js',
  'content/content-script.js', 
  'popup/popup.html',
  'popup/popup.js',
  'overlay/overlay.html',
  'overlay/overlay.js'
];

const missingFiles = requiredFiles.filter(file => 
  !fs.existsSync(path.join(FIREFOX_DIST, file))
);

if (missingFiles.length > 0) {
  console.error('❌ Missing required files:');
  missingFiles.forEach(file => console.error(`   - ${file}`));
  process.exit(1);
}

// Create package filename
const packageName = `firefox-addon-v${packageJson.version}.zip`;
const packagePath = path.join(RELEASES_DIR, packageName);

try {
  // Remove existing package if it exists
  if (fs.existsSync(packagePath)) {
    fs.unlinkSync(packagePath);
    console.log('🗑️  Removed existing package');
  }

  // Use web-ext if available, otherwise use zip
  let useWebExt = false;
  try {
    execSync('web-ext --version', { stdio: 'ignore' });
    useWebExt = true;
    console.log('🔧 Using web-ext for packaging');
  } catch {
    console.log('📦 Using zip for packaging (web-ext not available)');
  }

  if (useWebExt) {
    // Use web-ext build for better Firefox compatibility
    const webExtOutput = path.resolve('./web-ext-artifacts');
    
    // Clean previous web-ext artifacts
    if (fs.existsSync(webExtOutput)) {
      execSync(`rm -rf ${webExtOutput}`, { stdio: 'inherit' });
    }

    // Build with web-ext
    process.chdir(FIREFOX_DIST);
    execSync('web-ext build --overwrite-dest', { 
      stdio: 'inherit',
      env: { ...process.env, WEB_EXT_ARTIFACTS_DIR: webExtOutput }
    });
    process.chdir('../..');

    // Find the generated file and move it
    const artifacts = fs.readdirSync(webExtOutput).filter(f => f.endsWith('.zip'));
    if (artifacts.length > 0) {
      const sourcePath = path.join(webExtOutput, artifacts[0]);
      fs.copyFileSync(sourcePath, packagePath);
      console.log(`📦 Moved ${artifacts[0]} to ${packageName}`);
    } else {
      throw new Error('web-ext did not generate expected package');
    }
  } else {
    // Fallback to zip
    process.chdir(FIREFOX_DIST);
    execSync(`zip -r ../../${packagePath} .`, { stdio: 'inherit' });
    process.chdir('../..');
  }

  // Verify package was created and get size
  const stats = fs.statSync(packagePath);
  const sizeKB = Math.round(stats.size / 1024);
  const sizeMB = Math.round(stats.size / (1024 * 1024) * 100) / 100;

  console.log('✅ Firefox add-on packaged successfully!');
  console.log(`📦 Package: ${packageName}`);
  console.log(`📊 Size: ${sizeKB} KB (${sizeMB} MB)`);
  
  // Firefox AMO size warning
  if (stats.size > 200 * 1024 * 1024) {
    console.warn('⚠️  WARNING: Package exceeds Firefox AMO typical size limits');
  }

  // Run lint check if web-ext is available
  if (useWebExt) {
    console.log('\n🔍 Running Firefox compatibility checks...');
    try {
      process.chdir(FIREFOX_DIST);
      execSync('web-ext lint --pretty', { stdio: 'inherit' });
      console.log('✅ Firefox compatibility checks passed');
      process.chdir('../..');
    } catch (error) {
      console.warn('⚠️  Firefox compatibility warnings detected');
      process.chdir('../..');
    }
  }

  console.log('\n🚀 Ready for Firefox Add-ons (AMO) submission!');
  console.log('\n📚 Next steps:');
  console.log('   1. Go to https://addons.mozilla.org/developers/');
  console.log('   2. Upload the package file');  
  console.log('   3. Fill in add-on listing details');
  console.log('   4. Submit for review');
  console.log('   5. Note: Firefox review process may take several days');

} catch (error) {
  console.error('❌ Packaging failed:', error.message);
  process.exit(1);
}