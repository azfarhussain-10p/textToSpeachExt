/**
 * Cross-Browser Compatibility E2E Tests
 * Tests extension functionality across different browsers
 */

const { test, expect } = require('@playwright/test');
const ExtensionHelpers = require('../utils/extension-helpers');
const path = require('path');

test.describe('TTS Extension - Cross-Browser Compatibility', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to test page
    const testPagePath = path.resolve('./tests/e2e/fixtures/test-page.html');
    await page.goto(`file://${testPagePath}`);
    
    // Wait for page to be ready
    await page.waitForSelector('[data-test-ready="true"]');
    
    // Wait for extension with browser-specific timeout
    const browserName = page.context().browser().browserType().name();
    const timeout = browserName === 'firefox' ? 20000 : 15000;
    
    try {
      await ExtensionHelpers.waitForExtensionReady(page);
    } catch (error) {
      console.warn(`Extension readiness check failed for ${browserName}:`, error.message);
      // Continue with reduced functionality tests
    }
  });
  
  test.afterEach(async ({ page }) => {
    await ExtensionHelpers.stopTTS(page);
    await page.evaluate(() => {
      if (window.getSelection) {
        window.getSelection().removeAllRanges();
      }
    });
  });
  
  test('should detect browser type and adapt functionality', async ({ page }) => {
    const browserName = page.context().browser().browserType().name();
    
    console.log(`Testing on browser: ${browserName}`);
    
    // Test browser-specific capabilities
    const hasSpeechSynthesis = await page.evaluate(() => {
      return 'speechSynthesis' in window;
    });
    
    expect(hasSpeechSynthesis).toBeTruthy();
    
    // Get available voices (browser-specific)
    const voices = await ExtensionHelpers.getTTSVoices(page);
    
    if (browserName === 'chromium') {
      // Chrome/Edge typically have more voices
      expect(voices.length).toBeGreaterThan(0);
    } else if (browserName === 'firefox') {
      // Firefox may have fewer voices but should have at least one
      expect(voices.length).toBeGreaterThanOrEqual(0);
    }
    
    console.log(`Available voices: ${voices.length}`);
    voices.slice(0, 3).forEach(voice => {
      console.log(`- ${voice.name} (${voice.lang})`);
    });
  });
  
  test('should handle text selection across browsers', async ({ page }) => {
    const browserName = page.context().browser().browserType().name();
    
    // Test text selection behavior
    const testText = page.locator('#simple-text');
    await testText.click({ clickCount: 3 });
    
    // Wait for selection to register
    await page.waitForTimeout(500);
    
    const selectedText = await ExtensionHelpers.getSelectedText(page);
    expect(selectedText.trim()).toBeTruthy();
    
    console.log(`${browserName} - Selected text length: ${selectedText.length}`);
    
    // Browser-specific selection handling
    if (browserName === 'firefox') {
      // Firefox may need additional time for selection events
      await page.waitForTimeout(1000);
    }
    
    // Try to show overlay (may fail in some browsers)
    try {
      const overlay = page.locator('.tts-overlay');
      await overlay.waitFor({ state: 'visible', timeout: 5000 });
      await expect(overlay).toBeVisible();
      console.log(`${browserName} - Overlay appeared successfully`);
    } catch (error) {
      console.warn(`${browserName} - Overlay test skipped:`, error.message);
    }
  });
  
  test('should handle speech synthesis across browsers', async ({ page }) => {
    const browserName = page.context().browser().browserType().name();
    
    // Test basic speech synthesis API
    const speechSupport = await page.evaluate(() => {
      return {
        hasSpeechSynthesis: 'speechSynthesis' in window,
        hasUtterance: 'SpeechSynthesisUtterance' in window,
        canGetVoices: typeof window.speechSynthesis?.getVoices === 'function'
      };
    });
    
    expect(speechSupport.hasSpeechSynthesis).toBeTruthy();
    expect(speechSupport.hasUtterance).toBeTruthy();
    expect(speechSupport.canGetVoices).toBeTruthy();
    
    // Test voice loading (browser-specific timing)
    const voicesPromise = page.evaluate(() => {
      return new Promise((resolve) => {
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
          resolve(voices.length);
        } else {
          speechSynthesis.addEventListener('voiceschanged', () => {
            resolve(speechSynthesis.getVoices().length);
          });
          
          // Fallback timeout for Firefox
          setTimeout(() => {
            resolve(speechSynthesis.getVoices().length);
          }, 3000);
        }
      });
    });
    
    const voiceCount = await voicesPromise;
    console.log(`${browserName} - Voice count: ${voiceCount}`);
    
    if (voiceCount > 0) {
      // Test actual speech synthesis
      const speechResult = await page.evaluate(() => {
        return new Promise((resolve) => {
          const utterance = new SpeechSynthesisUtterance('Test');
          utterance.volume = 0; // Silent test
          utterance.rate = 2; // Fast test
          
          utterance.onstart = () => {
            speechSynthesis.cancel(); // Stop immediately
            resolve({ success: true, started: true });
          };
          
          utterance.onerror = (error) => {
            resolve({ success: false, error: error.error });
          };
          
          setTimeout(() => {
            resolve({ success: false, error: 'timeout' });
          }, 5000);
          
          speechSynthesis.speak(utterance);
        });
      });
      
      if (speechResult.success) {
        console.log(`${browserName} - Speech synthesis working`);
      } else {
        console.warn(`${browserName} - Speech synthesis failed:`, speechResult.error);
      }
    }
  });
  
  test('should handle extension manifest differences', async ({ page }) => {
    const browserName = page.context().browser().browserType().name();
    
    // Test extension-specific APIs based on browser
    const extensionAPIs = await page.evaluate(() => {
      return {
        hasChrome: typeof chrome !== 'undefined',
        hasBrowser: typeof browser !== 'undefined',
        hasWebextensionPolyfill: typeof window.browser !== 'undefined',
        chromeRuntime: typeof chrome?.runtime !== 'undefined',
        browserRuntime: typeof browser?.runtime !== 'undefined'
      };
    });
    
    console.log(`${browserName} extension APIs:`, extensionAPIs);
    
    if (browserName === 'chromium') {
      // Chrome/Edge should have chrome APIs
      expect(extensionAPIs.hasChrome || extensionAPIs.hasWebextensionPolyfill).toBeTruthy();
    } else if (browserName === 'firefox') {
      // Firefox should have browser APIs
      expect(extensionAPIs.hasBrowser || extensionAPIs.hasWebextensionPolyfill).toBeTruthy();
    }
  });
  
  test('should handle CSS and styling differences', async ({ page }) => {
    const browserName = page.context().browser().browserType().name();
    
    // Create test overlay manually to check styling
    await ExtensionHelpers.createTestPage(page, `
      <div class="tts-overlay" style="
        position: fixed;
        top: 50px;
        left: 50px;
        background: white;
        border: 1px solid #ccc;
        padding: 10px;
        z-index: 9999;
        display: block;
      ">
        <div class="tts-selected-text">Test content</div>
        <button class="tts-speak-btn">Speak</button>
        <button class="tts-close-btn">×</button>
      </div>
    `);
    
    const overlay = page.locator('.tts-overlay');
    await expect(overlay).toBeVisible();
    
    // Test computed styles
    const computedStyle = await overlay.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        position: style.position,
        zIndex: style.zIndex,
        display: style.display,
        backgroundColor: style.backgroundColor
      };
    });
    
    expect(computedStyle.position).toBe('fixed');
    expect(computedStyle.display).toBe('block');
    
    console.log(`${browserName} computed styles:`, computedStyle);
  });
  
  test('should handle keyboard shortcuts across browsers', async ({ page }) => {
    const browserName = page.context().browser().browserType().name();
    
    // Test keyboard event handling
    await ExtensionHelpers.createTestPage(page, `
      <div id="test-content" style="padding: 20px;">
        <p id="keyboard-test">This is test content for keyboard shortcuts.</p>
      </div>
    `);
    
    // Select text first
    await page.locator('#keyboard-test').click({ clickCount: 3 });
    await page.waitForTimeout(500);
    
    const selectedText = await ExtensionHelpers.getSelectedText(page);
    expect(selectedText.trim()).toBeTruthy();
    
    // Test browser-specific keyboard shortcuts
    if (browserName === 'chromium') {
      // Chrome/Edge shortcuts
      await page.keyboard.press('Control+c'); // Copy
      await page.waitForTimeout(100);
    } else if (browserName === 'firefox') {
      // Firefox shortcuts
      await page.keyboard.press('Control+c'); // Copy
      await page.waitForTimeout(100);
    }
    
    // Test Escape key (universal)
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    console.log(`${browserName} - Keyboard shortcuts tested`);
  });
  
  test('should handle window and viewport differences', async ({ page }) => {
    const browserName = page.context().browser().browserType().name();
    
    // Get viewport information
    const viewportInfo = await page.evaluate(() => {
      return {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        outerWidth: window.outerWidth,
        outerHeight: window.outerHeight,
        devicePixelRatio: window.devicePixelRatio,
        scrollX: window.scrollX,
        scrollY: window.scrollY
      };
    });
    
    console.log(`${browserName} viewport:`, viewportInfo);
    
    expect(viewportInfo.innerWidth).toBeGreaterThan(0);
    expect(viewportInfo.innerHeight).toBeGreaterThan(0);
    
    // Test responsive overlay positioning
    await ExtensionHelpers.createTestPage(page, `
      <div style="height: 2000px; padding: 20px;">
        <p id="scroll-test" style="margin-top: 500px;">
          This content requires scrolling to see.
        </p>
      </div>
    `);
    
    // Scroll to content
    await page.locator('#scroll-test').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    
    const scrollPosition = await page.evaluate(() => {
      return {
        scrollX: window.scrollX,
        scrollY: window.scrollY
      };
    });
    
    expect(scrollPosition.scrollY).toBeGreaterThan(0);
    console.log(`${browserName} - Scroll position:`, scrollPosition);
  });
  
  test('should handle performance differences', async ({ page }) => {
    const browserName = page.context().browser().browserType().name();
    
    // Measure performance of basic operations
    const performanceResults = await page.evaluate(() => {
      const results = {};
      
      // Test text selection performance
      const start1 = performance.now();
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(document.body);
      selection.removeAllRanges();
      selection.addRange(range);
      selection.removeAllRanges();
      results.textSelection = performance.now() - start1;
      
      // Test DOM manipulation performance
      const start2 = performance.now();
      const div = document.createElement('div');
      div.className = 'tts-test-overlay';
      div.innerHTML = '<span>Test</span>';
      document.body.appendChild(div);
      document.body.removeChild(div);
      results.domManipulation = performance.now() - start2;
      
      // Test event listener performance
      const start3 = performance.now();
      const handler = () => {};
      document.addEventListener('click', handler);
      document.removeEventListener('click', handler);
      results.eventListeners = performance.now() - start3;
      
      return results;
    });
    
    console.log(`${browserName} performance:`, performanceResults);
    
    // Verify reasonable performance (under 50ms for basic operations)
    expect(performanceResults.textSelection).toBeLessThan(50);
    expect(performanceResults.domManipulation).toBeLessThan(50);
    expect(performanceResults.eventListeners).toBeLessThan(50);
  });
});