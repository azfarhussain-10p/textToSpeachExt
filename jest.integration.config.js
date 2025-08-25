/**
 * Jest Integration Test Configuration for Intelligent TTS Extension
 */

module.exports = {
  // Test environment for integration tests
  testEnvironment: 'jsdom',
  
  // Test file patterns
  testMatch: [
    '<rootDir>/tests/integration/**/*.test.js',
    '<rootDir>/tests/integration/**/*.spec.js'
  ],
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup/jest.setup.js',
    '<rootDir>/tests/setup/integration.setup.js'
  ],
  
  // Module paths
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1'
  },
  
  // Transform configuration
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  
  // Longer timeout for integration tests
  testTimeout: 30000,
  
  // Global variables for integration tests
  globals: {
    chrome: {},
    browser: {},
    speechSynthesis: {}
  },
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true
};