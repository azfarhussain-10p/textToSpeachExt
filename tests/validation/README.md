# 📋 Project Validation Tests

**Category**: validation  
**Audience**: Developer  
**Last Updated**: 2025-01-27  
**Status**: Active

## Overview
This directory contains lightweight validation tests that perform quick sanity checks on project structure, configuration, and build output.

## 📁 Directory Contents

```
tests/validation/
├── README.md          # This file
└── test-runner.js     # Custom validation test runner
```

## 🎯 Purpose

The validation tests serve as a **fast pre-flight check** that validates:

- ✅ **Project Structure**: Required directories and files exist
- ✅ **Configuration**: manifest.json, package.json, ESLint, etc.
- ✅ **Code Quality**: Basic syntax validation and content checks  
- ✅ **Build Output**: Generated dist/ files are valid
- ✅ **Documentation**: Essential docs are present and organized

## 🚀 Usage

### Run Validation Tests
```bash
# Direct execution
npm run test:validation

# As part of full validation
npm run validate

# Direct node execution
node tests/validation/test-runner.js
```

### Integration with Development Workflow
```bash
# Pre-commit validation
npm run validate              # Includes validation tests
npm run pre-commit            # Runs validation + unit tests

# Build validation  
npm run build:all && npm run test:validation

# Quick project health check
npm run test:validation
```

## 📊 What Gets Validated

### 1. Project Structure
```
✅ Project structure exists
   - src/, dist/, tests/, docs/ directories
   - Proper subdirectory organization
   - Essential files present
```

### 2. Configuration Files
```
✅ Required files exist
   - All essential source files
   - Configuration files (package.json, eslint, etc.)
   - HTML, CSS, and JS files

✅ Configuration files are properly set up
   - package.json has required scripts
   - ESLint configuration exists
   - Playwright config present
```

### 3. Manifest Validation
```  
✅ Manifest files are valid JSON
   - src/manifest.json parses correctly
   - dist/chrome/manifest.json is valid

✅ Manifest has required fields  
   - manifest_version: 3 (required for Chrome)
   - All required fields present
   - Required permissions included
```

### 4. Code Quality
```
✅ JavaScript files have valid syntax
   - Balanced braces and parentheses
   - No obvious syntax errors
   - All core JS files validated

✅ Core files contain expected content
   - Service worker has chrome.runtime
   - Content script has TTSContentScript
   - TTS service has class definition
```

### 5. Build Validation
```
✅ Build output is valid
   - dist/chrome/ files exist
   - Chrome manifest uses Manifest V3
   - Essential build files present
```

### 6. Documentation
```
✅ Documentation files exist
   - README.md and CLAUDE.md
   - docs/ structure properly organized  
   - Essential documentation present
```

## ⚡ Performance

- **Execution Time**: ~2-3 seconds
- **Dependencies**: Only Node.js built-ins (fs, path)
- **Resource Usage**: Minimal (file system checks only)

## 🔧 Customization

### Adding New Validation Tests
```javascript
// Add to test-runner.js
runner.test('My custom validation', () => {
  // Your validation logic here
  if (!someCondition) {
    throw new Error('Validation failed: reason');
  }
});
```

### Configuration
The test runner is self-contained and requires no external configuration. It validates against the expected project structure and conventions.

## 🐛 Troubleshooting

### Common Issues

**Test Fails**: "Missing directory: src/background"
```bash
# Ensure proper project structure
ls -la src/
mkdir -p src/background  # Create if missing
```

**Test Fails**: "Invalid JSON: src/manifest.json"
```bash
# Validate JSON syntax
npm run format  # Auto-format JSON files
# Or check manually:
cat src/manifest.json | jq .
```

**Test Fails**: "Missing build file: dist/chrome/manifest.json"
```bash
# Build the extension first
npm run build:chrome
npm run test:validation
```

**Test Fails**: "Missing npm script: test:validation"  
```bash
# This indicates package.json corruption
# The script should be present after reorganization
grep "test:validation" package.json
```

## 🔄 Integration Points

### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run validate"
    }
  }
}
```

### CI/CD Pipeline
```yaml
- name: Project Validation
  run: npm run test:validation
  
- name: Full Validation  
  run: npm run validate
```

### Development Workflow
1. **npm run test:validation** - Quick structure check
2. **npm run validate** - Full code quality validation  
3. **npm run test:unit** - Unit tests
4. **npm run test:e2e** - End-to-end tests

## 📈 Success Metrics

A successful validation run should show:
```
🚀 Starting TTS Extension Tests

✅ Project structure exists
✅ Required files exist  
✅ Manifest files are valid JSON
✅ Manifest has required fields
✅ JavaScript files have valid syntax
✅ Core files contain expected content
✅ Configuration files are properly set up
✅ Browser polyfill exports are correct
✅ CSS files are present and non-empty
✅ Documentation files exist
✅ Build output is valid

📊 Test Results:
   Passed: 11/11
   Failed: 0/11

🎉 All tests passed!
```

## 🔗 Related Testing

- **Unit Tests**: `tests/unit/` - Code functionality testing
- **Integration Tests**: `tests/integration/` - Component interaction
- **E2E Tests**: `tests/e2e/` - Full browser extension testing
- **Validation Tests**: `tests/validation/` - **You are here**

---

*This validation suite ensures project integrity and helps catch structural issues early in the development process.*