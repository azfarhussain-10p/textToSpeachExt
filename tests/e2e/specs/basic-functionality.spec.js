/**
 * Basic TTS Extension Functionality E2E Tests
 * Tests core text-to-speech functionality across browsers
 */

const { test, expect } = require('@playwright/test');
const ExtensionHelpers = require('../utils/extension-helpers');
const path = require('path');
const fs = require('fs');

test.describe('TTS Extension - Basic Functionality', () => {
  let extensionId;
  
  test.beforeEach(async ({ page }) => {
    // Navigate to test page
    const testPagePath = path.resolve('./tests/e2e/fixtures/test-page.html');
    await page.goto(`file://${testPagePath}`);
    
    // Wait for page and extension to be ready
    await page.waitForSelector('[data-test-ready="true"]');
    await ExtensionHelpers.waitForExtensionReady(page);
    
    // Get extension ID for Chrome-based browsers
    if (page.context().browser().browserType().name() === 'chromium') {
      try {
        extensionId = await ExtensionHelpers.getExtensionId(page);
        console.log('Extension ID:', extensionId);
      } catch (error) {
        console.warn('Could not get extension ID:', error.message);
      }
    }
  });
  
  test.afterEach(async ({ page }) => {
    // Stop any ongoing speech synthesis
    await ExtensionHelpers.stopTTS(page);
    
    // Clear text selections
    await page.evaluate(() => {
      if (window.getSelection) {
        window.getSelection().removeAllRanges();
      }
    });
  });
  
  test('should load extension content script on page', async ({ page }) => {
    // Verify TTS service is available
    const hasTTSService = await page.evaluate(() => {
      return typeof window.TTSService !== 'undefined';
    });
    
    expect(hasTTSService).toBeTruthy();
    
    // Verify content script is initialized
    const isInitialized = await page.evaluate(() => {
      return window.ttsContentScript && 
             window.ttsContentScript.isInitialized === true;
    });
    
    expect(isInitialized).toBeTruthy();
  });
  
  test('should show overlay when text is selected', async ({ page }) => {
    // Select text from test content
    const overlay = await ExtensionHelpers.selectTextAndWaitForOverlay(page, '#simple-text');
    
    // Verify overlay is visible
    await expect(overlay).toBeVisible();
    
    // Verify overlay contains expected elements
    await ExtensionHelpers.validateOverlayStructure(overlay);
    
    // Verify selected text is displayed in overlay
    const selectedText = await ExtensionHelpers.getSelectedText(page);
    const overlayText = await overlay.locator('.tts-selected-text').textContent();
    
    expect(selectedText.trim()).toBeTruthy();
    expect(overlayText).toContain(selectedText.substring(0, 20)); // First 20 chars
  });
  
  test('should start TTS when speak button is clicked', async ({ page }) => {
    // Select text and get overlay
    const overlay = await ExtensionHelpers.selectTextAndWaitForOverlay(page, '#simple-text');
    
    // Click speak button
    const speakButton = overlay.locator('.tts-speak-btn');
    await speakButton.click();
    
    // Wait a moment for TTS to start
    await page.waitForTimeout(1000);
    
    // Verify TTS is speaking
    const isSpeaking = await ExtensionHelpers.isTTSSpeaking(page);
    expect(isSpeaking).toBeTruthy();
    
    // Stop TTS to prevent interference with other tests
    await ExtensionHelpers.stopTTS(page);
  });
  
  test('should close overlay when close button is clicked', async ({ page }) => {
    // Select text and get overlay
    const overlay = await ExtensionHelpers.selectTextAndWaitForOverlay(page, '#simple-text');
    
    // Verify overlay is visible
    await expect(overlay).toBeVisible();
    
    // Click close button
    const closeButton = overlay.locator('.tts-close-btn');
    await closeButton.click();
    
    // Verify overlay is hidden
    await expect(overlay).not.toBeVisible();
  });
  
  test('should handle multiple text selections', async ({ page }) => {
    // Select first text
    let overlay = await ExtensionHelpers.selectTextAndWaitForOverlay(page, '#simple-text');
    await expect(overlay).toBeVisible();
    
    // Select different text
    overlay = await ExtensionHelpers.selectTextAndWaitForOverlay(page, '#complex-text');
    await expect(overlay).toBeVisible();
    
    // Verify new selection is reflected in overlay
    const selectedText = await ExtensionHelpers.getSelectedText(page);
    const overlayText = await overlay.locator('.tts-selected-text').textContent();
    
    expect(selectedText).toContain('Artificial Intelligence');
    expect(overlayText).toContain('Artificial Intelligence');
  });
  
  test('should handle long text content', async ({ page }) => {
    // Select long text
    const overlay = await ExtensionHelpers.selectTextAndWaitForOverlay(page, '#long-text');
    
    // Verify overlay appears for long content
    await expect(overlay).toBeVisible();
    
    // Verify text is truncated in display
    const overlayText = await overlay.locator('.tts-selected-text').textContent();
    expect(overlayText.length).toBeLessThan(200); // Should be truncated
    expect(overlayText).toMatch(/\.\.\./); // Should contain ellipsis
  });
  
  test('should work with different text elements', async ({ page }) => {
    const testSelectors = [
      '#simple-text',
      '#complex-text',
      '#multilingual-text',
      '#test-input',
      '#test-textarea'
    ];
    
    for (const selector of testSelectors) {
      console.log(`Testing selector: ${selector}`);
      
      try {
        // Clear any previous selection
        await page.evaluate(() => window.getSelection().removeAllRanges());
        
        // Select text and wait for overlay
        const overlay = await ExtensionHelpers.selectTextAndWaitForOverlay(page, selector);
        await expect(overlay).toBeVisible();
        
        // Verify selection worked
        const selectedText = await ExtensionHelpers.getSelectedText(page);
        expect(selectedText.trim()).toBeTruthy();
        
        // Close overlay for next iteration
        await overlay.locator('.tts-close-btn').click();
        await expect(overlay).not.toBeVisible();
        
      } catch (error) {
        console.error(`Failed for selector ${selector}:`, error.message);
        throw error;
      }
    }
  });
  
  test('should not show overlay for empty selections', async ({ page }) => {
    // Click on empty area
    await page.locator('body').click();
    
    // Wait a moment to ensure no overlay appears
    await page.waitForTimeout(1000);
    
    // Verify no overlay is visible
    const overlay = page.locator('.tts-overlay');
    await expect(overlay).not.toBeVisible();
  });
  
  test('should have proper overlay positioning', async ({ page }) => {
    // Select text and get overlay
    const overlay = await ExtensionHelpers.selectTextAndWaitForOverlay(page, '#simple-text');
    
    // Get overlay position
    const boundingBox = await overlay.boundingBox();
    
    expect(boundingBox).toBeTruthy();
    expect(boundingBox.x).toBeGreaterThan(0);
    expect(boundingBox.y).toBeGreaterThan(0);
    expect(boundingBox.width).toBeGreaterThan(0);
    expect(boundingBox.height).toBeGreaterThan(0);
    
    // Verify overlay is within viewport
    const viewport = page.viewportSize();
    expect(boundingBox.x + boundingBox.width).toBeLessThanOrEqual(viewport.width);
    expect(boundingBox.y + boundingBox.height).toBeLessThanOrEqual(viewport.height);
  });
  
  test('should handle keyboard interactions', async ({ page }) => {
    // Select text
    const overlay = await ExtensionHelpers.selectTextAndWaitForOverlay(page, '#simple-text');
    
    // Test Escape key closes overlay
    await page.keyboard.press('Escape');
    await expect(overlay).not.toBeVisible();
    
    // Select text again
    await ExtensionHelpers.selectTextAndWaitForOverlay(page, '#simple-text');
    
    // Test Enter key on speak button
    const speakButton = overlay.locator('.tts-speak-btn');
    await speakButton.focus();
    await page.keyboard.press('Enter');
    
    // Verify TTS started
    await page.waitForTimeout(500);
    const isSpeaking = await ExtensionHelpers.isTTSSpeaking(page);
    expect(isSpeaking).toBeTruthy();
    
    await ExtensionHelpers.stopTTS(page);
  });
  
  test('should check for console errors', async ({ page }) => {
    const consoleErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Perform basic interactions
    await ExtensionHelpers.selectTextAndWaitForOverlay(page, '#simple-text');
    
    const overlay = page.locator('.tts-overlay');
    await overlay.locator('.tts-speak-btn').click();
    
    await page.waitForTimeout(2000);
    await ExtensionHelpers.stopTTS(page);
    
    // Filter out non-critical errors
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('Permissions policy') &&
      !error.includes('Cross-Origin-Embedder-Policy') &&
      !error.includes('document.domain')
    );
    
    expect(criticalErrors).toEqual([]);
  });
});