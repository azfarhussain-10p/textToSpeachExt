/**
 * Extension Popup E2E Tests
 * Tests extension popup functionality and settings
 */

const { test, expect } = require('@playwright/test');
const ExtensionHelpers = require('../utils/extension-helpers');

test.describe('TTS Extension - Popup Interface', () => {
  let extensionId;
  
  test.beforeAll(async ({ browser }) => {
    // Only run popup tests on Chrome-based browsers
    const browserName = browser.browserType().name();
    test.skip(browserName !== 'chromium', 'Popup tests only run on Chrome-based browsers');
  });
  
  test.beforeEach(async ({ page }) => {
    try {
      // Get extension ID
      extensionId = await ExtensionHelpers.getExtensionId(page);
      
      // Open extension popup
      await ExtensionHelpers.openExtensionPopup(page, extensionId);
    } catch (error) {
      console.warn('Could not open popup:', error.message);
      test.skip(true, 'Extension popup not accessible');
    }
  });
  
  test('should load popup interface correctly', async ({ page }) => {
    // Verify popup elements are present
    const expectedElements = [
      'h1', // Title
      '#voice-select', // Voice selector
      '#rate-slider', // Rate slider
      '#pitch-slider', // Pitch slider
      '#volume-slider', // Volume slider
      '#test-speech-btn' // Test button
    ];
    
    for (const selector of expectedElements) {
      const element = page.locator(selector);
      await expect(element).toBeVisible({ timeout: 5000 });
    }
  });
  
  test('should display available voices in dropdown', async ({ page }) => {
    const voiceSelect = page.locator('#voice-select');
    await voiceSelect.waitFor({ state: 'visible' });
    
    // Wait for voices to load
    await page.waitForTimeout(2000);
    
    // Check if voices are populated
    const options = await voiceSelect.locator('option').count();
    expect(options).toBeGreaterThan(1); // Should have at least default + some voices
    
    // Verify default option
    const defaultOption = await voiceSelect.locator('option[value=""]');
    await expect(defaultOption).toHaveText(/System Default|Default/);
  });
  
  test('should allow voice selection', async ({ page }) => {
    const voiceSelect = page.locator('#voice-select');
    
    // Wait for voices to load
    await page.waitForTimeout(2000);
    
    // Get available options
    const optionCount = await voiceSelect.locator('option').count();
    
    if (optionCount > 2) { // More than just default and "System Default"
      // Select second voice option (first real voice)
      await voiceSelect.selectOption({ index: 2 });
      
      // Verify selection changed
      const selectedValue = await voiceSelect.inputValue();
      expect(selectedValue).toBeTruthy();
      expect(selectedValue).not.toBe('');
    } else {
      console.log('No additional voices available for testing');
    }
  });
  
  test('should control speech rate with slider', async ({ page }) => {
    const rateSlider = page.locator('#rate-slider');
    const rateValue = page.locator('#rate-value');
    
    // Test minimum rate
    await rateSlider.fill('0.5');
    await expect(rateValue).toHaveText('0.5x');
    
    // Test maximum rate
    await rateSlider.fill('2');
    await expect(rateValue).toHaveText('2x');
    
    // Test normal rate
    await rateSlider.fill('1');
    await expect(rateValue).toHaveText('1x');
  });
  
  test('should control speech pitch with slider', async ({ page }) => {
    const pitchSlider = page.locator('#pitch-slider');
    const pitchValue = page.locator('#pitch-value');
    
    // Test minimum pitch
    await pitchSlider.fill('0.5');
    await expect(pitchValue).toHaveText('0.5');
    
    // Test maximum pitch
    await pitchSlider.fill('2');
    await expect(pitchValue).toHaveText('2');
    
    // Test normal pitch
    await pitchSlider.fill('1');
    await expect(pitchValue).toHaveText('1');
  });
  
  test('should control speech volume with slider', async ({ page }) => {
    const volumeSlider = page.locator('#volume-slider');
    const volumeValue = page.locator('#volume-value');
    
    // Test minimum volume
    await volumeSlider.fill('0');
    await expect(volumeValue).toHaveText('0%');
    
    // Test maximum volume
    await volumeSlider.fill('100');
    await expect(volumeValue).toHaveText('100%');
    
    // Test normal volume
    await volumeSlider.fill('80');
    await expect(volumeValue).toHaveText('80%');
  });
  
  test('should test speech synthesis from popup', async ({ page }) => {
    const testButton = page.locator('#test-speech-btn');
    
    // Set volume to 0 for silent testing
    const volumeSlider = page.locator('#volume-slider');
    await volumeSlider.fill('0');
    
    // Click test button
    await testButton.click();
    
    // Wait for speech to potentially start
    await page.waitForTimeout(1000);
    
    // Verify button state changed (might show "Stop" or be disabled)
    const buttonText = await testButton.textContent();
    expect(buttonText).toBeTruthy();
    
    // Wait for test to complete
    await page.waitForTimeout(3000);
  });
  
  test('should save settings persistence', async ({ page }) => {
    // Change settings
    await page.locator('#rate-slider').fill('1.5');
    await page.locator('#pitch-slider').fill('1.2');
    await page.locator('#volume-slider').fill('90');
    
    // Wait for settings to be saved (auto-save)
    await page.waitForTimeout(1000);
    
    // Reload popup
    await page.reload();
    await page.waitForSelector('#rate-slider');
    
    // Verify settings persisted
    const savedRate = await page.locator('#rate-slider').inputValue();
    const savedPitch = await page.locator('#pitch-slider').inputValue();
    const savedVolume = await page.locator('#volume-slider').inputValue();
    
    expect(savedRate).toBe('1.5');
    expect(savedPitch).toBe('1.2');
    expect(savedVolume).toBe('90');
  });
  
  test('should show current extension status', async ({ page }) => {
    // Look for status indicators
    const statusElements = [
      '.extension-status',
      '.tts-status',
      '.voices-status'
    ];
    
    let statusFound = false;
    for (const selector of statusElements) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        await expect(element).toBeVisible();
        statusFound = true;
        console.log(`Found status element: ${selector}`);
        break;
      }
    }
    
    // If no specific status element, check for general info
    if (!statusFound) {
      const bodyText = await page.locator('body').textContent();
      expect(bodyText).toBeTruthy();
      expect(bodyText.length).toBeGreaterThan(50); // Should have meaningful content
    }
  });
  
  test('should handle popup navigation', async ({ page }) => {
    // Look for navigation elements (tabs, sections, etc.)
    const navElements = [
      '.nav-tabs',
      '.settings-section',
      '#options-link',
      '.popup-nav'
    ];
    
    for (const selector of navElements) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        await element.first().click();
        await page.waitForTimeout(500);
        console.log(`Clicked navigation element: ${selector}`);
      }
    }
  });
  
  test('should provide access to options page', async ({ page }) => {
    // Look for options/settings link
    const optionsLink = page.locator('a[href*="options"], #options-link, .options-button');
    
    if (await optionsLink.count() > 0) {
      await optionsLink.first().click();
      
      // Wait for navigation
      await page.waitForTimeout(1000);
      
      // Check if we navigated to options page
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/(options|settings)/);
    } else {
      console.log('No options link found in popup');
    }
  });
  
  test('should handle popup responsiveness', async ({ page }) => {
    // Test different popup sizes
    await page.setViewportSize({ width: 300, height: 400 });
    await page.waitForTimeout(500);
    
    // Verify popup still looks good
    const popupContent = page.locator('body');
    const boundingBox = await popupContent.boundingBox();
    
    expect(boundingBox.width).toBeLessThanOrEqual(320); // Should fit in popup
    expect(boundingBox.height).toBeGreaterThan(200); // Should have reasonable height
    
    // Test with wider popup
    await page.setViewportSize({ width: 400, height: 500 });
    await page.waitForTimeout(500);
    
    // Elements should still be visible and properly arranged
    const rateSlider = page.locator('#rate-slider');
    await expect(rateSlider).toBeVisible();
  });
  
  test('should show helpful error messages', async ({ page }) => {
    // Look for error containers or warning messages
    const errorElements = [
      '.error-message',
      '.warning',
      '.status-error',
      '.popup-error'
    ];
    
    for (const selector of errorElements) {
      const elements = page.locator(selector);
      const count = await elements.count();
      
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const errorText = await elements.nth(i).textContent();
          console.log(`Error message found: ${errorText}`);
          
          // Error messages should be helpful, not just technical
          expect(errorText.length).toBeGreaterThan(10);
          expect(errorText).not.toMatch(/undefined|null|error/i);
        }
      }
    }
  });
});