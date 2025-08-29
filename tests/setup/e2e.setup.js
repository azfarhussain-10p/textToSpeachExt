/**
 * E2E Test Setup
 * Browser automation and extension testing utilities
 */

const puppeteer = require('puppeteer');
const path = require('path');

// Global test utilities for E2E testing
global.e2eUtils = {
  // Browser instances cache
  browsers: {},
  
  /**
   * Launch browser with extension
   */
  async launchBrowser(browserType = 'chrome', options = {}) {
    const extensionPath = path.resolve(global.EXTENSION_PATH[browserType]);
    
    let browser;
    
    switch (browserType) {
      case 'chrome':
        browser = await puppeteer.launch({
          headless: global.HEADLESS,
          args: [
            `--disable-extensions-except=${extensionPath}`,
            `--load-extension=${extensionPath}`,
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-web-security',
            '--disable-features=TranslateUI'
          ],
          ...options
        });
        break;
        
      case 'firefox':
        // Firefox requires different setup
        browser = await puppeteer.launch({
          product: 'firefox',
          headless: global.HEADLESS,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
          ],
          ...options
        });
        break;
        
      default:
        throw new Error(`Unsupported browser type: ${browserType}`);
    }
    
    this.browsers[browserType] = browser;
    return browser;
  },
  
  /**
   * Get extension page (popup, background, etc.)
   */
  async getExtensionPage(browser, pageType = 'popup') {
    const pages = await browser.pages();
    
    // Wait for extension to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Get extension pages
    const targets = await browser.targets();
    const extensionTarget = targets.find(target => 
      target.type() === 'page' && target.url().includes('chrome-extension')
    );
    
    if (!extensionTarget) {
      throw new Error('Extension not loaded');
    }
    
    return await extensionTarget.page();
  },
  
  /**
   * Navigate to test page with text content
   */
  async navigateToTestPage(page, content = null) {
    const testContent = content || `
      <h1>Test Page for TTS Extension</h1>
      <p>This is a sample paragraph that can be selected and read aloud using the text-to-speech extension.</p>
      <div>Another piece of text for testing various text selection scenarios.</div>
      <span>Short text snippet.</span>
    `;
    
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>TTS Test Page</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          p { margin: 20px 0; line-height: 1.6; }
        </style>
      </head>
      <body>
        ${testContent}
      </body>
      </html>
    `);
    
    await page.waitForLoadState?.('networkidle') || await page.waitForTimeout(1000);
  },
  
  /**
   * Select text on page
   */
  async selectText(page, selector, text = null) {
    if (text) {
      // Select specific text within element
      await page.evaluate((sel, txt) => {
        const element = document.querySelector(sel);
        if (element) {
          const textNode = Array.from(element.childNodes)
            .find(node => node.nodeType === 3 && node.textContent.includes(txt));
          if (textNode) {
            const range = document.createRange();
            const startIndex = textNode.textContent.indexOf(txt);
            range.setStart(textNode, startIndex);
            range.setEnd(textNode, startIndex + txt.length);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      }, selector, text);
    } else {
      // Select entire element content
      await page.evaluate(sel => {
        const element = document.querySelector(sel);
        if (element) {
          const range = document.createRange();
          range.selectNodeContents(element);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }, selector);
    }
  },
  
  /**
   * Wait for TTS overlay to appear
   */
  async waitForTTSOverlay(page, timeout = 5000) {
    return await page.waitForSelector('.tts-overlay', { timeout });
  },
  
  /**
   * Wait for extension to inject content script
   */
  async waitForExtensionInjection(page, timeout = 10000) {
    return await page.waitForFunction(
      () => window.ttsExtensionInjected === true,
      { timeout }
    );
  },
  
  /**
   * Clean up browser instances
   */
  async cleanup() {
    for (const [browserType, browser] of Object.entries(this.browsers)) {
      if (browser) {
        await browser.close();
        delete this.browsers[browserType];
      }
    }
  },
  
  /**
   * Take screenshot for debugging
   */
  async screenshot(page, name) {
    if (process.env.DEBUG_SCREENSHOTS) {
      await page.screenshot({ 
        path: `tests/screenshots/${name}-${Date.now()}.png`,
        fullPage: true
      });
    }
  }
};

// Cleanup after all tests
afterAll(async () => {
  await global.e2eUtils.cleanup();
});