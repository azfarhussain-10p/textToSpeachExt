# 🎭 E2E Testing Troubleshooting Guide

**Category**: troubleshooting  
**Audience**: Developer  
**Last Updated**: 2025-01-27  
**Status**: Active

## Overview
Comprehensive troubleshooting guide for E2E tests using Playwright with browser extension testing.

## Quick Start Validation

### Verify E2E Setup
```bash
# 1. Check Playwright installation
npx playwright test --version

# 2. Install browsers if needed
npx playwright install

# 3. Build extension for testing
npm run build:chrome

# 4. Run a simple test
npm run test:e2e:chrome --grep="should load extension"
```

## Common E2E Issues

### 1. Extension Not Loading

**Symptoms**:
```
Error: Extension not found in Chrome extensions list
TimeoutError: Waiting for selector '.tts-overlay' failed
```

**Solutions**:
```bash
# Ensure extension is built
npm run build:chrome

# Verify manifest exists
cat dist/chrome/manifest.json

# Check for build errors
npm run build:chrome 2>&1 | grep -i error

# Clean and rebuild
npm run clean && npm run build:chrome
```

### 2. Browser Launch Failures

**Symptoms**:
```
browserType.launch: Executable doesn't exist
Error: Failed to launch browser
```

**Solutions**:
```bash
# Install Playwright browsers
npx playwright install

# Install system dependencies (Linux)
npx playwright install-deps

# Check available browsers
npx playwright list

# Use specific browser channel
npx playwright test --project=chrome-extension
```

### 3. Test Timeouts

**Symptoms**:
```
TimeoutError: Waiting for selector failed: 15000ms
Test timeout of 60000ms exceeded
```

**Solutions**:
```javascript
// Increase timeout for extension loading
test.setTimeout(120000); // 2 minutes

// Wait longer for specific operations
await ExtensionHelpers.waitForExtensionReady(page);

// Use browser-specific timeouts
const timeout = browserName === 'firefox' ? 20000 : 15000;
await element.waitFor({ timeout });
```

### 4. Voice Loading Issues

**Symptoms**:
```
Error: No voices available
TTS test failed: speechSynthesis not ready
```

**Solutions**:
```javascript
// Wait for voices with longer timeout
const voices = await page.evaluate(() => {
  return new Promise((resolve) => {
    const checkVoices = () => {
      const voiceList = speechSynthesis.getVoices();
      if (voiceList.length > 0) {
        resolve(voiceList);
      } else {
        setTimeout(checkVoices, 500);
      }
    };
    
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = checkVoices;
    }
    checkVoices();
    
    // Fallback timeout
    setTimeout(() => resolve([]), 5000);
  });
});
```

### 5. Cross-Browser Compatibility

**Symptoms**:
```
Firefox tests failing
Safari extension not supported
Edge specific errors
```

**Solutions**:
```javascript
// Browser detection and adaptation
test.beforeEach(async ({ page }) => {
  const browserName = page.context().browser().browserType().name();
  
  if (browserName === 'firefox') {
    // Firefox-specific setup
    await page.waitForTimeout(2000); // Extra time for extension loading
  } else if (browserName === 'webkit') {
    test.skip(true, 'Safari extension testing requires different setup');
  }
});
```

## Browser-Specific Troubleshooting

### Chrome/Edge Issues

**Problem**: `--load-extension` not working
```bash
# Verify extension path is absolute
ls -la "$(pwd)/dist/chrome"

# Check Chrome version compatibility
google-chrome --version

# Use explicit Chrome path
export CHROME_PATH="/usr/bin/google-chrome"
```

**Problem**: Service worker registration fails
```javascript
// Add debug logging
launchOptions: {
  args: [
    `--load-extension=${path.resolve('./dist/chrome')}`,
    '--enable-logging',
    '--log-level=0',
    '--disable-web-security'
  ]
}
```

### Firefox Issues

**Problem**: Extension not loading in Firefox
```javascript
// Firefox requires signed extensions in production
// Use development preferences
firefoxUserPrefs: {
  'extensions.autoDisableScopes': 0,
  'extensions.enabledScopes': 15,
  'xpinstall.signatures.required': false,
  'devtools.console.stdout.content': true
}
```

**Problem**: Web Speech API differences
```javascript
// Firefox voice loading is slower
await page.waitForFunction(() => {
  return speechSynthesis.getVoices().length > 0;
}, { timeout: 10000 });
```

## Debugging Strategies

### 1. Enable Debug Mode
```bash
# Run with debug output
DEBUG=pw:api npx playwright test

# Enable browser console logs
DEBUG=pw:browser npx playwright test

# Full debugging
DEBUG=pw:* npx playwright test
```

### 2. Interactive Debugging
```bash
# Run tests with UI
npx playwright test --ui

# Run in headed mode
npx playwright test --headed

# Use slow motion
npx playwright test --headed --slowMo=1000
```

### 3. Pause and Inspect
```javascript
test('debug test', async ({ page }) => {
  await page.goto('http://example.com');
  
  // Pause test execution
  await page.pause();
  
  // Continue with test...
});
```

### 4. Screenshot on Every Step
```javascript
// Take screenshot before assertions
await page.screenshot({ path: 'debug-before-assertion.png' });
await expect(element).toBeVisible();
await page.screenshot({ path: 'debug-after-assertion.png' });
```

## Performance Optimization

### 1. Parallel Execution
```javascript
// Disable for extension tests (required)
fullyParallel: false,
workers: 1,
```

### 2. Test Isolation
```javascript
test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }) => {
  // Clean state
  await ExtensionHelpers.stopTTS(page);
  await page.evaluate(() => window.getSelection().removeAllRanges());
});
```

### 3. Resource Management
```javascript
test.afterAll(async () => {
  // Clean up test files
  await fs.remove('./test-results/temp');
});
```

## CI/CD Troubleshooting

### GitHub Actions Issues
```yaml
- name: Install Playwright
  run: |
    npm ci
    npx playwright install --with-deps

- name: Build Extensions
  run: npm run build:all

- name: Run E2E Tests
  run: npm run test:e2e:all
  env:
    CI: true
```

### Headless Mode Issues
```javascript
// Force headless mode in CI
use: {
  headless: process.env.CI ? true : false,
  video: process.env.CI ? 'on-failure' : 'off'
}
```

## Test Data Management

### 1. Dynamic Test Pages
```javascript
await ExtensionHelpers.createTestPage(page, `
  <div id="test-content">
    <p id="test-text">This is test content.</p>
  </div>
`);
```

### 2. Fixture Management
```javascript
// Use absolute paths for fixtures
const testPagePath = path.resolve('./tests/e2e/fixtures/test-page.html');
await page.goto(`file://${testPagePath}`);
```

## Error Analysis

### Common Error Patterns

**Pattern**: `net::ERR_FILE_NOT_FOUND`
- **Cause**: Incorrect file paths in fixtures
- **Fix**: Use absolute paths, verify file existence

**Pattern**: `Extension context invalidated`
- **Cause**: Extension reload or crash
- **Fix**: Add extension health checks, restart browser

**Pattern**: `Element not found`
- **Cause**: Timing issues, dynamic content
- **Fix**: Use proper wait strategies, verify element existence

### Log Analysis
```bash
# Filter relevant logs
grep -i "extension\|tts\|error" test-results/browser-logs.txt

# Check network requests
grep -i "net::" test-results/browser-logs.txt

# Find JavaScript errors
grep -i "console.*error" test-results/browser-logs.txt
```

## Monitoring and Reporting

### Test Metrics
```javascript
// Measure test performance
const startTime = Date.now();
await ExtensionHelpers.selectTextAndWaitForOverlay(page, '#test-text');
const duration = Date.now() - startTime;
console.log(`Overlay appeared in ${duration}ms`);
```

### Health Checks
```bash
# Quick health check
npm run test:e2e:chrome --grep="should load extension" --reporter=line

# Generate test report
npx playwright show-report

# Check test results summary
cat test-results/test-summary.json
```

## Getting Help

When E2E tests fail:

1. **Check recent changes**: Extension code, test code, dependencies
2. **Run locally first**: Reproduce issues outside CI
3. **Enable debug mode**: Use `DEBUG=pw:*` for detailed logs
4. **Check browser versions**: Ensure compatibility with Playwright
5. **Verify extension build**: Ensure `dist/` files are correct
6. **Review test reports**: Check `test-results/html-report/`

For complex issues:
- Create minimal reproduction case
- Run single test in headed mode
- Use browser developer tools
- Check Playwright GitHub issues
- Consult browser extension documentation

---

*This guide covers the most common E2E testing issues. Update as new patterns emerge.*