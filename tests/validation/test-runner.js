#!/usr/bin/env node
/**
 * Simple Test Runner for TTS Extension
 * Validates core functionality without complex setup
 */

const fs = require('fs');
const _path = require('path');

class TTSTestRunner {
  constructor() {
    this.tests = [];
    this.results = { passed: 0, failed: 0, total: 0 };
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log('🚀 Starting TTS Extension Tests\n');
    
    for (const test of this.tests) {
      try {
        await test.fn();
        this.logPass(test.name);
        this.results.passed++;
      } catch (error) {
        this.logFail(test.name, error.message);
        this.results.failed++;
      }
      this.results.total++;
    }
    
    this.printSummary();
  }

  logPass(name) {
    console.log(`✅ ${name}`);
  }

  logFail(name, error) {
    console.log(`❌ ${name}: ${error}`);
  }

  printSummary() {
    console.log('\n📊 Test Results:');
    console.log(`   Passed: ${this.results.passed}/${this.results.total}`);
    console.log(`   Failed: ${this.results.failed}/${this.results.total}`);
    
    if (this.results.failed === 0) {
      console.log('\n🎉 All tests passed!');
    } else {
      console.log('\n⚠️  Some tests failed. Check the output above.');
    }
  }

  fileExists(filePath) {
    return fs.existsSync(filePath);
  }

  fileContains(filePath, content) {
    if (!this.fileExists(filePath)) return false;
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return fileContent.includes(content);
  }

  isValidJSON(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      JSON.parse(content);
      return true;
    } catch {
      return false;
    }
  }
}

// Create test runner instance
const runner = new TTSTestRunner();

// File Structure Tests
runner.test('Project structure exists', () => {
  const requiredDirs = [
    'src',
    'src/background',
    'src/content',
    'src/popup',
    'src/services',
    'src/utils',
    'src/assets',
    'dist/chrome'
  ];
  
  for (const dir of requiredDirs) {
    if (!runner.fileExists(dir)) {
      throw new Error(`Missing directory: ${dir}`);
    }
  }
});

runner.test('Required files exist', () => {
  const requiredFiles = [
    'src/manifest.json',
    'src/background/service-worker.js',
    'src/content/content-script.js',
    'src/popup/popup.html',
    'src/popup/popup.js',
    'src/popup/popup.css',
    'src/services/tts-service.js',
    'src/utils/browser-polyfill.js',
    'src/assets/styles/overlay.css',
    'dist/chrome/manifest.json'
  ];
  
  for (const file of requiredFiles) {
    if (!runner.fileExists(file)) {
      throw new Error(`Missing file: ${file}`);
    }
  }
});

// Manifest Validation
runner.test('Manifest files are valid JSON', () => {
  const manifestFiles = [
    'src/manifest.json',
    'dist/chrome/manifest.json'
  ];
  
  for (const file of manifestFiles) {
    if (!runner.isValidJSON(file)) {
      throw new Error(`Invalid JSON: ${file}`);
    }
  }
});

runner.test('Manifest has required fields', () => {
  const manifest = JSON.parse(fs.readFileSync('src/manifest.json', 'utf8'));
  
  const requiredFields = [
    'manifest_version',
    'name',
    'version',
    'description',
    'permissions',
    'background',
    'content_scripts',
    'action'
  ];
  
  for (const field of requiredFields) {
    if (!(field in manifest)) {
      throw new Error(`Missing manifest field: ${field}`);
    }
  }
  
  // Validate specific values
  if (manifest.manifest_version !== 3) {
    throw new Error('Manifest version must be 3 for Chrome');
  }
  
  if (!manifest.permissions.includes('storage')) {
    throw new Error('Missing required permission: storage');
  }
});

// JavaScript Syntax Tests
runner.test('JavaScript files have valid syntax', () => {
  const jsFiles = [
    'src/background/service-worker.js',
    'src/content/content-script.js',
    'src/popup/popup.js',
    'src/services/tts-service.js',
    'src/utils/browser-polyfill.js'
  ];
  
  for (const file of jsFiles) {
    try {
      // Basic syntax check by reading and checking for common errors
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for unclosed brackets/braces
      const openBraces = (content.match(/\{/g) || []).length;
      const closeBraces = (content.match(/\}/g) || []).length;
      const openParens = (content.match(/\(/g) || []).length;
      const closeParens = (content.match(/\)/g) || []).length;
      
      if (openBraces !== closeBraces) {
        throw new Error(`Unmatched braces in ${file}`);
      }
      
      if (openParens !== closeParens) {
        throw new Error(`Unmatched parentheses in ${file}`);
      }
      
    } catch (error) {
      throw new Error(`Syntax error in ${file}: ${error.message}`);
    }
  }
});

// Content Validation
runner.test('Core files contain expected content', () => {
  const contentChecks = [
    {
      file: 'src/background/service-worker.js',
      content: 'chrome.runtime.onInstalled'
    },
    {
      file: 'src/content/content-script.js',
      content: 'TTSContentScript'
    },
    {
      file: 'src/services/tts-service.js',
      content: 'class TTSService'
    },
    {
      file: 'src/popup/popup.html',
      content: '<title>Intelligent TTS Extension</title>'
    },
    {
      file: 'src/utils/browser-polyfill.js',
      content: 'browserAPI'
    }
  ];
  
  for (const check of contentChecks) {
    if (!runner.fileContains(check.file, check.content)) {
      throw new Error(`${check.file} missing expected content: ${check.content}`);
    }
  }
});

// Configuration Tests
runner.test('Configuration files are properly set up', () => {
  const configFiles = [
    'package.json',
    'jest.config.js',
    '.eslintrc.json',
    'playwright.config.js'
  ];
  
  for (const file of configFiles) {
    if (!runner.fileExists(file)) {
      throw new Error(`Missing config file: ${file}`);
    }
  }
  
  // Check package.json has required scripts
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredScripts = ['dev', 'build', 'test', 'lint', 'test:validation'];
  
  for (const script of requiredScripts) {
    if (!(script in (packageJson.scripts || {}))) {
      throw new Error(`Missing npm script: ${script}`);
    }
  }
});

// Browser Polyfill Tests
runner.test('Browser polyfill exports are correct', () => {
  const polyfillContent = fs.readFileSync('src/utils/browser-polyfill.js', 'utf8');
  
  const requiredExports = [
    'browserAPI.runtime',
    'browserAPI.storage',
    'browserAPI.tabs',
    'browserAPI.browserInfo',
    'browserAPI.features'
  ];
  
  for (const exportName of requiredExports) {
    if (!polyfillContent.includes(exportName)) {
      throw new Error(`Browser polyfill missing: ${exportName}`);
    }
  }
});

// CSS File Tests
runner.test('CSS files are present and non-empty', () => {
  const cssFiles = [
    'src/popup/popup.css',
    'src/assets/styles/overlay.css'
  ];
  
  for (const file of cssFiles) {
    if (!runner.fileExists(file)) {
      throw new Error(`Missing CSS file: ${file}`);
    }
    
    const content = fs.readFileSync(file, 'utf8');
    if (content.trim().length === 0) {
      throw new Error(`Empty CSS file: ${file}`);
    }
    
    // Check for basic CSS syntax
    if (!content.includes('{') || !content.includes('}')) {
      throw new Error(`Invalid CSS syntax in: ${file}`);
    }
  }
});

// Documentation Tests
runner.test('Documentation files exist', () => {
  const docFiles = [
    'README.md',
    'CLAUDE.md',
    'docs/README.md',
    'docs/guides/development-guide.md',
    'docs/implementation/api-integration.md',
    'docs/troubleshooting/loading-issues.md',
    'docs/DOCUMENTATION-STANDARDS.md'
  ];
  
  for (const file of docFiles) {
    if (!runner.fileExists(file)) {
      throw new Error(`Missing documentation: ${file}`);
    }
  }
});

// Build Output Tests
runner.test('Build output is valid', () => {
  const buildFiles = [
    'dist/chrome/manifest.json',
    'dist/chrome/background/service-worker.js',
    'dist/chrome/content/content-script.js',
    'dist/chrome/popup/popup.html'
  ];
  
  for (const file of buildFiles) {
    if (!runner.fileExists(file)) {
      throw new Error(`Missing build file: ${file}`);
    }
  }
  
  // Verify Chrome manifest is Manifest V3
  const chromeManifest = JSON.parse(fs.readFileSync('dist/chrome/manifest.json', 'utf8'));
  if (chromeManifest.manifest_version !== 3) {
    throw new Error('Chrome build must use Manifest V3');
  }
});

// Run all tests
runner.run().catch(console.error);