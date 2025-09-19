/**
 * Jest Integration Testing Configuration
 * Integration testing framework setup for TTS Extension
 */

module.exports = {
  // Test environment
  testEnvironment: 'jsdom',

  // Test file patterns for integration tests
  testMatch: [
    '**/tests/integration/**/*.test.js',
    '**/tests/integration/**/*.spec.js'
  ],

  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup/jest.setup.js',
    '<rootDir>/tests/setup/integration.setup.js'
  ],

  // Module name mapping for aliases
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },

  // Transform files
  transform: {
    '^.+\\.js$': 'babel-jest'
  },

  // Module file extensions
  moduleFileExtensions: ['js', 'json'],

  // Mock globals for browser extension environment
  globals: {
    chrome: {},
    browser: {},
    webkitSpeechSynthesis: {},
    speechSynthesis: {},
    SpeechSynthesisUtterance: class {}
  },

  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,

  // Verbose output
  verbose: true,

  // Test timeout (longer for integration tests)
  testTimeout: 30000,

  // Coverage settings (optional for integration tests)
  collectCoverage: false,

  // Test reporter
  reporters: [
    'default',
    ['jest-junit', {
      outputName: 'integration-test-results.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › '
    }]
  ]
};