/**
 * Playwright Configuration for TTS Extension E2E Testing
 * Comprehensive cross-browser testing setup for browser extensions
 */

const { defineConfig, devices } = require('@playwright/test');
const path = require('path');

module.exports = defineConfig({
  // Test directory
  testDir: './tests/e2e',
  
  // Parallel execution settings
  fullyParallel: false, // Extension testing requires sequential execution
  forbidOnly: !!process.env.CI, // Forbid test.only in CI
  retries: process.env.CI ? 2 : 0, // Retry failed tests in CI
  workers: process.env.CI ? 1 : 1, // Single worker for extension tests
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'test-results/html-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['line']
  ],
  
  // Global test settings
  use: {
    // Base URL for testing
    baseURL: 'https://example.com',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video recording
    video: 'retain-on-failure',
    
    // Trace collection
    trace: 'retain-on-failure',
    
    // Action timeout
    actionTimeout: 10000,
    
    // Navigation timeout
    navigationTimeout: 30000,
  },
  
  // Test output directory
  outputDir: 'test-results/',
  
  // Browser projects for cross-browser testing
  projects: [
    {
      name: 'chrome-extension',
      use: {
        ...devices['Desktop Chrome'],
        // Chrome-specific extension setup
        launchOptions: {
          args: [
            `--disable-extensions-except=${path.resolve('./dist/chrome')}`,
            `--load-extension=${path.resolve('./dist/chrome')}`,
            '--disable-web-security',
            '--disable-features=TranslateUI',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding'
          ]
        }
      }
    },
    
    {
      name: 'firefox-extension',
      use: {
        ...devices['Desktop Firefox'],
        // Firefox-specific extension setup will be handled in test setup
        launchOptions: {
          firefoxUserPrefs: {
            'extensions.autoDisableScopes': 0,
            'extensions.enabledScopes': 15,
            'xpinstall.signatures.required': false
          }
        }
      }
    },
    
    {
      name: 'edge-extension',
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge',
        launchOptions: {
          args: [
            `--disable-extensions-except=${path.resolve('./dist/chrome')}`,
            `--load-extension=${path.resolve('./dist/chrome')}`,
            '--disable-web-security'
          ]
        }
      }
    }
  ],
  
  // Global setup and teardown
  globalSetup: require.resolve('./tests/e2e/setup/global-setup.js'),
  globalTeardown: require.resolve('./tests/e2e/setup/global-teardown.js'),
  
  // Test timeout
  timeout: 60000,
  
  // Expect timeout
  expect: {
    timeout: 10000
  },
  
  // Web server for testing (if needed)
  webServer: {
    command: 'npm run serve:test',
    port: 8080,
    reuseExistingServer: !process.env.CI,
    env: {
      NODE_ENV: 'test'
    }
  }
});