/**
 * Extension Helper Utilities for E2E Tests
 * Browser extension specific testing utilities
 */

const fs = require('fs');
const path = require('path');

class ExtensionHelpers {
  
  /**
   * Get extension ID from Chrome
   * @param {Page} page - Playwright page instance
   */
  static async getExtensionId(page) {
    await page.goto('chrome://extensions/');
    
    // Enable developer mode if not already enabled
    const devModeToggle = page.locator('#devMode');
    const isEnabled = await devModeToggle.isChecked();
    
    if (!isEnabled) {
      await devModeToggle.click();
    }
    
    // Find TTS extension in the list
    const extensionCards = page.locator('extensions-item');
    const count = await extensionCards.count();
    
    for (let i = 0; i < count; i++) {
      const card = extensionCards.nth(i);
      const name = await card.locator('#name').textContent();
      
      if (name && name.includes('Intelligent TTS Extension')) {
        const id = await card.getAttribute('id');
        return id;
      }
    }
    
    throw new Error('TTS Extension not found in Chrome extensions list');
  }
  
  /**
   * Wait for extension to be loaded and ready
   * @param {Page} page - Playwright page instance
   */
  static async waitForExtensionReady(page) {
    // Wait for content script to be injected
    await page.waitForFunction(() => {
      return window.TTSService !== undefined;
    }, { timeout: 10000 });
    
    // Wait for TTS service to be initialized
    await page.waitForFunction(() => {
      return window.ttsContentScript && 
             window.ttsContentScript.isInitialized === true;
    }, { timeout: 15000 });
  }
  
  /**
   * Select text on the page and wait for overlay
   * @param {Page} page - Playwright page instance
   * @param {string} selector - Element selector to select text from
   */
  static async selectTextAndWaitForOverlay(page, selector) {
    const element = page.locator(selector);
    await element.waitFor({ state: 'visible' });
    
    // Triple-click to select all text in element
    await element.click({ clickCount: 3 });
    
    // Wait for text selection
    await page.waitForFunction(() => {
      const selection = window.getSelection();
      return selection.toString().trim().length > 0;
    }, { timeout: 5000 });
    
    // Wait for TTS overlay to appear
    const overlay = page.locator('.tts-overlay');
    await overlay.waitFor({ state: 'visible', timeout: 5000 });
    
    return overlay;
  }
  
  /**
   * Get selected text from page
   * @param {Page} page - Playwright page instance
   */
  static async getSelectedText(page) {
    return await page.evaluate(() => {
      return window.getSelection().toString().trim();
    });
  }
  
  /**
   * Check if TTS is currently speaking
   * @param {Page} page - Playwright page instance
   */
  static async isTTSSpeaking(page) {
    return await page.evaluate(() => {
      return window.speechSynthesis && window.speechSynthesis.speaking;
    });
  }
  
  /**
   * Stop current TTS speech
   * @param {Page} page - Playwright page instance
   */
  static async stopTTS(page) {
    await page.evaluate(() => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    });
  }
  
  /**
   * Get available TTS voices
   * @param {Page} page - Playwright page instance
   */
  static async getTTSVoices(page) {
    return await page.evaluate(() => {
      if (!window.speechSynthesis) return [];
      
      return Array.from(window.speechSynthesis.getVoices()).map(voice => ({
        name: voice.name,
        lang: voice.lang,
        default: voice.default,
        localService: voice.localService
      }));
    });
  }
  
  /**
   * Open extension popup
   * @param {Page} page - Playwright page instance
   * @param {string} extensionId - Chrome extension ID
   */
  static async openExtensionPopup(page, extensionId) {
    const popupUrl = `chrome-extension://${extensionId}/popup/popup.html`;
    await page.goto(popupUrl);
    
    // Wait for popup to be ready
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('body[data-popup-ready="true"]', { timeout: 5000 });
  }
  
  /**
   * Open extension options page
   * @param {Page} page - Playwright page instance
   * @param {string} extensionId - Chrome extension ID
   */
  static async openExtensionOptions(page, extensionId) {
    const optionsUrl = `chrome-extension://${extensionId}/options/options.html`;
    await page.goto(optionsUrl);
    
    // Wait for options page to be ready
    await page.waitForLoadState('domcontentloaded');
  }
  
  /**
   * Check if overlay contains expected elements
   * @param {Locator} overlay - Overlay element locator
   */
  static async validateOverlayStructure(overlay) {
    const expectedElements = [
      '.tts-selected-text',
      '.tts-speak-btn',
      '.tts-close-btn'
    ];
    
    for (const selector of expectedElements) {
      const element = overlay.locator(selector);
      await element.waitFor({ state: 'visible', timeout: 3000 });
    }
    
    return true;
  }
  
  /**
   * Simulate context menu interaction
   * @param {Page} page - Playwright page instance
   * @param {string} selector - Element to right-click
   */
  static async triggerContextMenu(page, selector) {
    const element = page.locator(selector);
    await element.click({ button: 'right' });
    
    // Wait for context menu to appear
    await page.waitForTimeout(500);
  }
  
  /**
   * Check console for extension errors
   * @param {Page} page - Playwright page instance
   */
  static async checkConsoleErrors(page) {
    const logs = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error' && 
          msg.text().toLowerCase().includes('extension')) {
        logs.push({
          type: msg.type(),
          text: msg.text(),
          location: msg.location()
        });
      }
    });
    
    return logs;
  }
  
  /**
   * Wait for network requests to complete
   * @param {Page} page - Playwright page instance
   * @param {number} timeout - Timeout in milliseconds
   */
  static async waitForNetworkIdle(page, timeout = 2000) {
    await page.waitForLoadState('networkidle', { timeout });
  }
  
  /**
   * Verify extension permissions
   * @param {Page} page - Playwright page instance
   */
  static async verifyExtensionPermissions(page) {
    await page.goto('chrome://extensions/');
    
    const extensionCards = page.locator('extensions-item');
    const ttsExtension = extensionCards.filter({ 
      has: page.locator('#name:has-text("Intelligent TTS Extension")') 
    });
    
    if (await ttsExtension.count() === 0) {
      throw new Error('TTS Extension not found');
    }
    
    // Check if extension has required permissions
    const detailsButton = ttsExtension.locator('#details-button');
    await detailsButton.click();
    
    // Verify permissions are granted
    const permissionsSection = page.locator('#permissions-section');
    await permissionsSection.waitFor({ state: 'visible' });
    
    return true;
  }
  
  /**
   * Simulate keyboard shortcuts
   * @param {Page} page - Playwright page instance
   * @param {string} shortcut - Keyboard shortcut (e.g., 'Ctrl+Shift+S')
   */
  static async pressKeyboardShortcut(page, shortcut) {
    await page.keyboard.press(shortcut);
    await page.waitForTimeout(100);
  }
  
  /**
   * Create test page with specific content
   * @param {Page} page - Playwright page instance
   * @param {string} content - HTML content
   */
  static async createTestPage(page, content) {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>E2E Test Page</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .test-content { margin: 20px 0; padding: 10px; border: 1px solid #ccc; }
    </style>
</head>
<body>
    ${content}
    <script>
        document.body.setAttribute('data-test-ready', 'true');
    </script>
</body>
</html>`;
    
    await page.setContent(html);
    await page.waitForSelector('[data-test-ready="true"]');
  }
}

module.exports = ExtensionHelpers;