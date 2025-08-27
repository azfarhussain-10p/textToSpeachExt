/**
 * Jest Configuration for TTS Extension
 * Supports unit, integration, and E2E testing across browsers
 */

module.exports = {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup/jest.setup.js'
  ],
  
  // Module paths
  roots: [
    '<rootDir>/src',
    '<rootDir>/tests'
  ],
  
  // Test file patterns
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.js',
    '<rootDir>/tests/integration/**/*.test.js',
    '<rootDir>/src/**/__tests__/**/*.js',
    '<rootDir>/src/**/*.test.js'
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/__tests__/**',
    '!src/assets/**',
    '!src/_locales/**'
  ],
  
  coverageDirectory: 'coverage',
  
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary'
  ],
  
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  
  // Module name mapping for imports
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  
  // Transform files
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  
  // Mock configuration
  moduleFileExtensions: [
    'js',
    'json'
  ],
  
  // Test timeout
  testTimeout: 10000,
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
  
  // Mock browser APIs
  setupFiles: [
    '<rootDir>/tests/setup/browser-mocks.js'
  ],
  
  // Global variables for tests
  globals: {
    'chrome': {},
    'browser': {},
    'speechSynthesis': {}
  },
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/'
  ],
  
  // Transform ignore patterns
  transformIgnorePatterns: [
    'node_modules/(?!(esm-module|another-esm-module)/)'
  ],
  
  // Error handling
  bail: 0, // Don't stop on first error
  
  // Watch mode configuration
  watchman: true,
  
  // Snapshot serializers
  snapshotSerializers: [],
  
  // Custom test results processor
  testResultsProcessor: undefined,
  
  // Test environment options
  testEnvironmentOptions: {
    url: 'https://localhost'
  },
  
  // Projects for different test types
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/tests/unit/**/*.test.js'],
      testEnvironment: 'jsdom'
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/tests/integration/**/*.test.js'],
      testEnvironment: 'jsdom'
    }
  ]
};