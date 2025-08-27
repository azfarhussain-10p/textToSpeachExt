# 🧪 Testing Suite Overview

**Category**: guides  
**Audience**: Developer  
**Last Updated**: 2025-01-27  
**Status**: Active

## Overview
Comprehensive testing suite for the Intelligent TTS Extension with multiple testing strategies for different aspects of the application.

## 📁 Testing Directory Structure

```
tests/
├── README.md                          # This file - testing overview
├── e2e/                              # End-to-End tests with Playwright
│   ├── README.md                     # E2E testing guide
│   ├── specs/                        # E2E test specifications
│   ├── setup/                        # Global setup and teardown
│   ├── utils/                        # Extension testing utilities
│   └── fixtures/                     # Test data and HTML files
├── integration/                      # Integration tests  
│   └── tts-content-integration.test.js # Content script integration
├── unit/                            # Unit tests with Jest
│   └── services/                    # Service layer tests
│       └── tts-service.test.js      # TTS service unit tests
├── validation/                      # Project validation tests
│   ├── README.md                    # Validation testing guide  
│   └── test-runner.js              # Custom validation runner
└── setup/                          # Test configuration and mocks
    ├── browser-mocks.js            # Browser API mocks
    └── jest.setup.js               # Jest configuration
```

## 🎯 Testing Types & Commands

### 1. Validation Tests ⚡ (2-3 seconds)
**Purpose**: Quick project structure and configuration validation

```bash
# Run validation tests
npm run test:validation

# Include in full validation
npm run validate
```

**What it tests**:
- Project structure integrity
- Configuration file validity  
- Build output verification
- Basic code syntax
- Documentation presence

### 2. Unit Tests 🔬 (30-60 seconds)
**Purpose**: Individual component functionality testing

```bash
# Run all unit tests
npm run test:unit

# Run with coverage
npm run test:unit:coverage

# Watch mode for development  
npm run test:unit:watch
```

**What it tests**:
- TTS service functionality
- Individual class methods
- Utility functions
- Error handling

### 3. Integration Tests 🔗 (1-2 minutes)
**Purpose**: Component interaction and data flow testing  

```bash
# Run integration tests
npm run test:integration
```

**What it tests**:
- Content script and service worker communication
- TTS service integration with browser APIs
- Message passing between components

### 4. E2E Tests 🎭 (2-5 minutes)
**Purpose**: Full browser extension testing with real browsers

```bash
# Run E2E tests for all browsers
npm run test:e2e:all

# Run for specific browser
npm run test:e2e:chrome
npm run test:e2e:firefox
npm run test:e2e:edge

# Interactive mode
npx playwright test --ui
```

**What it tests**:
- Complete extension functionality
- Text selection and overlay behavior
- Cross-browser compatibility
- User interaction flows
- Extension popup interface

## 🚀 Quick Start Testing

### Development Workflow
```bash
# 1. Quick validation (recommended during development)
npm run test:validation

# 2. Code quality check
npm run validate

# 3. Unit tests for specific functionality
npm run test:unit

# 4. Full testing before PR/release
npm run test && npm run test:e2e:all
```

### Pre-commit Testing
```bash
# Automatic pre-commit validation
npm run pre-commit
```

### CI/CD Testing
```bash
# Complete test suite
npm run test              # Unit + Integration
npm run test:e2e:all      # Cross-browser E2E
npm run validate          # Code quality + validation
```

## 📊 Test Coverage Goals

| Test Type | Coverage Target | Current Focus |
|-----------|----------------|---------------|
| Unit | >85% line coverage | Core services and utilities |
| Integration | >70% feature coverage | Component communication |
| E2E | >95% user flow coverage | Critical user paths |
| Validation | 100% project structure | Configuration and build |

## 🔧 Test Configuration Files

### Root Level Config
- `jest.config.js` - Main Jest configuration for unit tests
- `playwright.config.js` - Playwright E2E test configuration
- `.eslintrc.json` - Linting rules for test files

### Test-Specific Config
- `tests/setup/jest.setup.js` - Jest environment setup
- `tests/setup/browser-mocks.js` - Browser API mocking
- `tests/e2e/setup/global-setup.js` - E2E test environment setup

## 🐛 Debugging Tests

### Unit Test Debugging
```bash
# Debug specific test
npm run test:unit -- --testNamePattern="TTS Service"

# Run in watch mode
npm run test:unit:watch

# Enable verbose output
npm run test:unit -- --verbose
```

### E2E Test Debugging  
```bash
# Run in headed mode (see browser)
npx playwright test --headed

# Debug with slow motion
npx playwright test --headed --slowMo=1000

# Interactive debugging
npx playwright test --debug
```

### Validation Test Debugging
```bash
# Direct execution with full output
node tests/validation/test-runner.js
```

## 📈 Test Reports

### Generated Reports
- **Unit Test Coverage**: `coverage/lcov-report/index.html`
- **E2E Test Results**: `test-results/html-report/index.html`  
- **Validation Summary**: Console output + `test-results/test-summary.json`

### Viewing Reports
```bash
# Unit test coverage
npm run test:unit:coverage && open coverage/lcov-report/index.html

# E2E test results  
npm run test:e2e:chrome && npx playwright show-report
```

## 🎯 Testing Best Practices

### 1. Test Organization
- **Unit tests**: Focus on individual functions and classes
- **Integration tests**: Test component interactions
- **E2E tests**: Test complete user workflows
- **Validation tests**: Ensure project integrity

### 2. Test Writing Guidelines
```javascript
// Use descriptive test names
test('should show overlay when text is selected', async () => {
  // Test implementation
});

// Group related tests  
describe('TTS Service', () => {
  describe('voice selection', () => {
    // Voice-related tests
  });
});

// Clean up after tests
afterEach(async () => {
  await ExtensionHelpers.stopTTS(page);
});
```

### 3. Mock Strategy
- **Unit tests**: Mock external dependencies
- **Integration tests**: Use real browser APIs where possible
- **E2E tests**: Use real extension in real browsers
- **Validation tests**: Test actual file system

## 🔄 Continuous Integration

### Test Execution Order
1. **Validation** - Fast project integrity check
2. **Linting** - Code quality validation
3. **Unit Tests** - Individual component testing
4. **Integration Tests** - Component interaction testing
5. **E2E Tests** - Full browser extension testing

### Parallel Execution
- Unit and integration tests: Run in parallel
- E2E tests: Sequential execution (extension testing limitation)
- Validation tests: Independent execution

## 📚 Testing Resources

### Documentation
- [Unit Testing Guide](../docs/guides/development-guide.md#testing)
- [E2E Testing Guide](e2e/README.md)
- [Validation Testing Guide](validation/README.md)

### External Resources
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/)
- [Chrome Extension Testing](https://developer.chrome.com/docs/extensions/mv3/devguide/testing/)

## 🚨 Common Issues

### Test Environment Issues
```bash
# Clean test environment
rm -rf node_modules coverage test-results
npm install
```

### Browser Extension Testing  
```bash
# Rebuild extension before E2E tests
npm run build:all
npm run test:e2e:chrome
```

### Permission Issues
```bash
# Linux/Mac permission fix
chmod +x tests/validation/test-runner.js
```

## 📞 Getting Help

For testing issues:
1. Check relevant README in test subdirectories
2. Verify test environment setup
3. Run tests individually to isolate issues
4. Check CI logs for environment-specific problems
5. Review browser console for E2E test failures

---

*This testing suite ensures the TTS extension works reliably across all supported browsers and usage scenarios.*