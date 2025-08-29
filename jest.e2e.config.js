/**
 * Jest E2E Testing Configuration
 * Cross-browser extension testing setup
 */

module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Test file patterns
  testMatch: [
    '**/tests/e2e/**/*.test.js',
    '**/tests/e2e/**/*.spec.js'
  ],
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup/e2e.setup.js'
  ],
  
  // Module name mapping
  moduleNameMapping: {
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  
  // Test timeout for E2E tests (longer for browser operations)
  testTimeout: 30000,
  
  // Sequential test execution for E2E stability
  maxWorkers: 1,
  
  // Don't collect coverage for E2E tests
  collectCoverage: false,
  
  // Verbose output for debugging
  verbose: true,
  
  // Global variables for E2E testing
  globals: {
    EXTENSION_PATH: {
      chrome: './dist/chrome',
      firefox: './dist/firefox',
      safari: './dist/safari'
    },
    TEST_URL: 'https://example.com',
    HEADLESS: process.env.HEADLESS !== 'false'
  },
  
  // Transform
  transform: {
    '^.+\\.js$': 'babel-jest'
  }
};