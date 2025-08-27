# 🎭 E2E Testing with Playwright

This directory contains End-to-End tests for the TTS Extension using Playwright, specifically designed for browser extension testing.

## 📁 Directory Structure

```
tests/e2e/
├── README.md                           # This file
├── specs/                             # Test specifications
│   ├── basic-functionality.spec.js   # Core TTS functionality tests
│   ├── cross-browser-compatibility.spec.js # Browser compatibility tests
│   └── extension-popup.spec.js       # Popup interface tests
├── setup/                            # Test setup and configuration
│   ├── global-setup.js              # Pre-test setup (builds extensions)
│   └── global-teardown.js           # Post-test cleanup
├── utils/                           # Test utilities and helpers
│   └── extension-helpers.js         # Extension-specific testing utilities
└── fixtures/                       # Test data and static files
    └── test-page.html              # Generated test page for TTS testing
```

## 🚀 Running E2E Tests

### Prerequisites
1. Extension must be built: `npm run build:all`
2. Playwright browsers installed: `npx playwright install`

### Test Commands

```bash
# Run all E2E tests across all browsers
npm run test:e2e:all

# Run tests for specific browser
npm run test:e2e:chrome     # Chrome/Edge tests
npm run test:e2e:firefox    # Firefox tests
npm run test:e2e:edge       # Edge-specific tests

# Run with UI mode (interactive)
npx playwright test --ui

# Run specific test file
npx playwright test specs/basic-functionality.spec.js

# Run in headed mode (see browser)
npx playwright test --headed

# Generate test report
npx playwright show-report
```

## 🧪 Test Categories

### Basic Functionality Tests (`basic-functionality.spec.js`)
- Extension content script loading
- Text selection and overlay display
- TTS speech synthesis functionality
- Overlay controls (speak, close buttons)
- Keyboard interactions
- Multiple text selections
- Long text handling
- Console error checking

### Cross-Browser Compatibility Tests (`cross-browser-compatibility.spec.js`)
- Browser detection and adaptation
- Text selection behavior differences
- Speech synthesis API variations
- Extension manifest compatibility
- CSS and styling consistency
- Keyboard shortcut handling
- Viewport and scrolling behavior
- Performance measurements

### Extension Popup Tests (`extension-popup.spec.js`)
- Popup interface loading
- Voice selection dropdown
- Speech rate/pitch/volume controls
- Settings persistence
- Test speech functionality
- Navigation and responsiveness

## 🔧 Configuration

### Playwright Config (`playwright.config.js`)
- **Chrome Extension**: Loads extension with `--load-extension` flag
- **Firefox Extension**: Uses Firefox-specific configuration
- **Edge Extension**: Similar to Chrome with Edge browser
- **Parallel Execution**: Disabled for extension testing (sequential execution)
- **Retries**: 2 retries in CI, 0 locally
- **Screenshots**: On failure only
- **Video**: Retained on failure

### Browser-Specific Setup

#### Chrome/Edge
```javascript
launchOptions: {
  args: [
    `--disable-extensions-except=${path.resolve('./dist/chrome')}`,
    `--load-extension=${path.resolve('./dist/chrome')}`,
    '--disable-web-security',
    '--disable-features=TranslateUI'
  ]
}
```

#### Firefox
```javascript
launchOptions: {
  firefoxUserPrefs: {
    'extensions.autoDisableScopes': 0,
    'extensions.enabledScopes': 15,
    'xpinstall.signatures.required': false
  }
}
```

## 🛠️ Extension Testing Utilities

### ExtensionHelpers Class
Key methods for extension testing:

```javascript
// Wait for extension to be ready
await ExtensionHelpers.waitForExtensionReady(page);

// Select text and wait for overlay
const overlay = await ExtensionHelpers.selectTextAndWaitForOverlay(page, '#text-element');

// Get extension ID (Chrome)
const extensionId = await ExtensionHelpers.getExtensionId(page);

// Check if TTS is speaking
const isSpeaking = await ExtensionHelpers.isTTSSpeaking(page);

// Open extension popup
await ExtensionHelpers.openExtensionPopup(page, extensionId);
```

## 📊 Test Reports

Test results are generated in multiple formats:
- **HTML Report**: `test-results/html-report/index.html`
- **JSON Report**: `test-results/results.json`
- **Console Output**: Real-time during execution

## 🐛 Debugging E2E Tests

### Common Issues

1. **Extension Not Loading**
   ```bash
   # Ensure extension is built
   npm run build:chrome
   
   # Check dist/chrome/manifest.json exists
   ls -la dist/chrome/
   ```

2. **Timeouts**
   ```javascript
   // Increase timeout for slow operations
   await element.waitFor({ timeout: 10000 });
   ```

3. **Voice Loading Issues**
   ```javascript
   // Wait longer for voices on Firefox
   const timeout = browserName === 'firefox' ? 20000 : 15000;
   await ExtensionHelpers.waitForExtensionReady(page);
   ```

### Debug Mode
```bash
# Run with debug output
DEBUG=pw:api npx playwright test

# Run in headed mode with slow motion
npx playwright test --headed --slowMo=1000

# Pause test execution for inspection
await page.pause();
```

## 📝 Writing New E2E Tests

### Test Structure
```javascript
const { test, expect } = require('@playwright/test');
const ExtensionHelpers = require('../utils/extension-helpers');

test.describe('My Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('file:///path/to/test-page.html');
    await ExtensionHelpers.waitForExtensionReady(page);
  });

  test('should do something', async ({ page }) => {
    // Test implementation
    const overlay = await ExtensionHelpers.selectTextAndWaitForOverlay(page, '#test-text');
    await expect(overlay).toBeVisible();
  });
});
```

### Best Practices
1. **Always clean up**: Stop TTS, clear selections in `afterEach`
2. **Use helpers**: Leverage `ExtensionHelpers` for common operations
3. **Browser-specific handling**: Check browser type for different behavior
4. **Meaningful assertions**: Test user-visible behavior, not implementation
5. **Error handling**: Wrap risky operations in try-catch blocks

## 🔍 Continuous Integration

E2E tests run automatically in CI with:
- All browsers (Chrome, Firefox, Edge)
- Headless mode for speed
- Artifact collection on failures
- Parallel execution disabled for stability

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Browser Extension Testing Guide](https://playwright.dev/docs/chrome-extensions)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Extension Development](https://developer.chrome.com/docs/extensions/)