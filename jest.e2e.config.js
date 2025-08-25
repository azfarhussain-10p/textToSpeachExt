/**
 * Jest E2E Test Configuration for Intelligent TTS Extension
 */

module.exports = {
  // Test environment for E2E tests
  testEnvironment: 'node',
  
  // Test file patterns
  testMatch: [
    '<rootDir>/tests/e2e/**/*.test.js',
    '<rootDir>/tests/e2e/**/*.spec.js'
  ],
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup/e2e.setup.js'
  ],
  
  // Transform configuration
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  
  // Very long timeout for E2E tests
  testTimeout: 60000,
  
  // Global variables for E2E tests
  globals: {
    page: {},
    browser: {},
    extensionId: ''
  },
  
  // Verbose output
  verbose: true,
  
  // Don't clear mocks for E2E tests
  clearMocks: false,
  
  // Sequential execution for E2E tests
  maxWorkers: 1
};