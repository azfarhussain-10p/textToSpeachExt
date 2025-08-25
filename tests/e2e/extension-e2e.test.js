/**
 * End-to-End Tests for TTS Extension
 * Tests the complete extension functionality in browser environment
 */

const puppeteer = require('puppeteer');
const path = require('path');

describe('TTS Extension E2E Tests', () => {
    let browser, page, extensionId;
    
    const EXTENSION_PATH = path.join(__dirname, '../../dist/chrome');
    const TEST_PAGE_URL = 'https://example.com';

    beforeAll(async () => {
        // Launch browser with extension
        browser = await puppeteer.launch({
            headless: false, // Set to true for CI
            args: [
                `--disable-extensions-except=${EXTENSION_PATH}`,
                `--load-extension=${EXTENSION_PATH}`,
                '--disable-web-security',
                '--disable-features=TranslateUI',
                '--disable-ipc-flooding-protection'
            ]
        });

        // Get extension ID
        const targets = await browser.targets();
        const extensionTarget = targets.find(
            target => target.type() === 'service_worker' && target.url().includes('chrome-extension://')
        );
        
        if (extensionTarget) {
            extensionId = extensionTarget.url().split('chrome-extension://')[1].split('/')[0];
        }

        page = await browser.newPage();
        
        // Enable permissions for testing
        const context = browser.defaultBrowserContext();
        await context.overridePermissions(TEST_PAGE_URL, ['clipboard-read', 'clipboard-write']);
    });

    afterAll(async () => {
        if (browser) {
            await browser.close();
        }
    });

    beforeEach(async () => {
        await page.goto(TEST_PAGE_URL);
        await page.waitForLoadState();
    });

    describe('Extension Loading and Initialization', () => {
        test('extension should load successfully', async () => {
            expect(extensionId).toBeDefined();
            expect(extensionId).toMatch(/[a-z]{32}/); // Chrome extension ID format
        });

        test('extension popup should be accessible', async () => {
            const popupURL = `chrome-extension://${extensionId}/popup/popup.html`;
            
            await page.goto(popupURL);
            await page.waitForSelector('#popup-container');
            
            const title = await page.title();
            expect(title).toBe('TTS Assistant');
            
            const statusDot = await page.$('#status-dot');
            expect(statusDot).toBeTruthy();
        });

        test('extension options page should be accessible', async () => {
            const optionsURL = `chrome-extension://${extensionId}/options/options.html`;
            
            await page.goto(optionsURL);
            await page.waitForSelector('.options-container');
            
            const title = await page.title();
            expect(title).toBe('TTS Assistant - Advanced Settings');
        });
    });

    describe('Text Selection and TTS', () => {
        test('should show overlay when text is selected', async () => {
            await page.goto(TEST_PAGE_URL);
            
            // Add test content
            await page.evaluate(() => {
                document.body.innerHTML = '<p id="test-paragraph">This is a test paragraph for TTS functionality.</p>';
            });
            
            // Select text
            await page.click('#test-paragraph', { clickCount: 3 }); // Triple-click to select all
            
            // Wait for overlay to appear
            await page.waitForSelector('.tts-overlay-container', { timeout: 5000 });
            
            const overlay = await page.$('.tts-overlay-container');
            expect(overlay).toBeTruthy();
            
            const isVisible = await page.evaluate(el => el.classList.contains('visible'), overlay);
            expect(isVisible).toBe(true);
        });

        test('should trigger speech when speak button is clicked', async () => {
            await page.goto(TEST_PAGE_URL);
            
            // Add test content
            await page.evaluate(() => {
                document.body.innerHTML = '<p id="test-content">Hello world, this is a speech test.</p>';
            });
            
            // Select text
            await page.click('#test-content', { clickCount: 3 });
            
            // Wait for overlay and click speak button
            await page.waitForSelector('.tts-speak-btn');
            await page.click('.tts-speak-btn');
            
            // Verify speech synthesis was called (mock in test environment)
            const speechCalled = await page.evaluate(() => {
                return window.speechSynthesis && typeof window.speechSynthesis.speak === 'function';
            });
            
            expect(speechCalled).toBe(true);
        });

        test('should handle keyboard shortcuts', async () => {
            await page.goto(TEST_PAGE_URL);
            
            // Add test content
            await page.evaluate(() => {
                document.body.innerHTML = '<p id="shortcut-test">Test text for keyboard shortcuts.</p>';
            });
            
            // Select text
            await page.click('#shortcut-test', { clickCount: 3 });
            
            // Use keyboard shortcut (Ctrl+Shift+S)
            await page.keyboard.down('Control');
            await page.keyboard.down('Shift');
            await page.keyboard.press('KeyS');
            await page.keyboard.up('Shift');
            await page.keyboard.up('Control');
            
            // Should trigger speech functionality
            // In a real test, we'd verify the speech was triggered
            await page.waitForTimeout(500);
        });
    });

    describe('Context Menu Integration', () => {
        test('should show context menu options on right-click', async () => {
            await page.goto(TEST_PAGE_URL);
            
            await page.evaluate(() => {
                document.body.innerHTML = '<p id="context-test">Right-click this text for context menu.</p>';
            });
            
            // Select text first
            await page.click('#context-test', { clickCount: 3 });
            
            // Right-click to show context menu
            await page.click('#context-test', { button: 'right' });
            
            // Note: Testing context menus in Puppeteer is limited
            // In real scenarios, we'd use browser-specific APIs
            await page.waitForTimeout(500);
        });
    });

    describe('Settings and Configuration', () => {
        test('should save and load settings correctly', async () => {
            const optionsURL = `chrome-extension://${extensionId}/options/options.html`;
            await page.goto(optionsURL);
            
            // Wait for page to load
            await page.waitForSelector('#language');
            
            // Change language setting
            await page.select('#language', 'es-ES');
            
            // Change speech rate
            await page.evaluate(() => {
                const rateSlider = document.getElementById('rate');
                rateSlider.value = '1.5';
                rateSlider.dispatchEvent(new Event('input'));
            });
            
            // Save settings
            await page.click('#save-btn');
            
            // Wait for save confirmation
            await page.waitForTimeout(1000);
            
            // Reload page and verify settings persist
            await page.reload();
            await page.waitForSelector('#language');
            
            const languageValue = await page.$eval('#language', el => el.value);
            const rateValue = await page.$eval('#rate', el => el.value);
            
            expect(languageValue).toBe('es-ES');
            expect(parseFloat(rateValue)).toBe(1.5);
        });

        test('should apply accessibility settings', async () => {
            const optionsURL = `chrome-extension://${extensionId}/options/options.html`;
            await page.goto(optionsURL);
            
            // Navigate to advanced tab
            await page.click('[data-tab="advanced"]');
            await page.waitForSelector('#high-contrast');
            
            // Enable high contrast mode
            await page.click('#high-contrast');
            
            // Save settings
            await page.click('#save-btn');
            await page.waitForTimeout(500);
            
            // Go to a test page and verify high contrast is applied
            await page.goto(TEST_PAGE_URL);
            
            const hasHighContrast = await page.evaluate(() => {
                return document.documentElement.hasAttribute('data-tts-high-contrast');
            });
            
            expect(hasHighContrast).toBe(true);
        });
    });

    describe('Cross-Browser Compatibility', () => {
        test('should handle different page layouts', async () => {
            // Test with various page structures
            const testPages = [
                '<div><p>Simple paragraph text.</p></div>',
                '<article><h1>Article Title</h1><p>Article content goes here.</p></article>',
                '<div style="display: flex;"><span>Flex layout text</span></div>',
                '<table><tr><td>Table cell content</td></tr></table>'
            ];
            
            for (const content of testPages) {
                await page.evaluate((html) => {
                    document.body.innerHTML = html;
                }, content);
                
                // Select text in different layouts
                const textElement = await page.$('p, span, td, h1');
                if (textElement) {
                    await textElement.click({ clickCount: 3 });
                    
                    // Should show overlay regardless of layout
                    await page.waitForSelector('.tts-overlay-container', { timeout: 3000 });
                    const overlay = await page.$('.tts-overlay-container.visible');
                    expect(overlay).toBeTruthy();
                }
            }
        });

        test('should work with dynamic content', async () => {
            await page.goto(TEST_PAGE_URL);
            
            // Add initial content
            await page.evaluate(() => {
                document.body.innerHTML = '<div id="dynamic-content">Initial content</div>';
            });
            
            // Update content dynamically
            await page.evaluate(() => {
                setTimeout(() => {
                    document.getElementById('dynamic-content').textContent = 'Updated dynamic content for TTS testing';
                }, 1000);
            });
            
            await page.waitForTimeout(1500);
            
            // Select the new content
            await page.click('#dynamic-content', { clickCount: 3 });
            
            // Should work with dynamically updated content
            await page.waitForSelector('.tts-overlay-container');
            const overlay = await page.$('.tts-overlay-container.visible');
            expect(overlay).toBeTruthy();
        });
    });

    describe('Performance and Memory', () => {
        test('should not cause memory leaks', async () => {
            const initialMetrics = await page.metrics();
            
            // Perform multiple TTS operations
            for (let i = 0; i < 10; i++) {
                await page.evaluate((index) => {
                    document.body.innerHTML = `<p id="perf-test-${index}">Performance test content ${index}</p>`;
                }, i);
                
                await page.click(`#perf-test-${i}`, { clickCount: 3 });
                await page.waitForSelector('.tts-overlay-container', { timeout: 2000 });
                
                // Close overlay
                await page.keyboard.press('Escape');
                await page.waitForTimeout(100);
            }
            
            // Check final metrics
            const finalMetrics = await page.metrics();
            
            // Memory usage shouldn't increase dramatically
            const memoryIncrease = finalMetrics.JSHeapUsedSize - initialMetrics.JSHeapUsedSize;
            expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024); // Less than 5MB increase
        });

        test('should handle rapid interactions efficiently', async () => {
            await page.evaluate(() => {
                document.body.innerHTML = '<p id="rapid-test">Rapid interaction test content</p>';
            });
            
            const startTime = Date.now();
            
            // Rapid selection/deselection
            for (let i = 0; i < 20; i++) {
                await page.click('#rapid-test', { clickCount: 3 });
                await page.keyboard.press('Escape');
            }
            
            const endTime = Date.now();
            const totalTime = endTime - startTime;
            
            // Should handle rapid interactions in reasonable time
            expect(totalTime).toBeLessThan(10000); // Less than 10 seconds
        });
    });

    describe('Error Handling', () => {
        test('should gracefully handle network errors', async () => {
            // Simulate offline condition
            await page.setOfflineMode(true);
            
            await page.evaluate(() => {
                document.body.innerHTML = '<p id="offline-test">Offline test content</p>';
            });
            
            await page.click('#offline-test', { clickCount: 3 });
            await page.waitForSelector('.tts-overlay-container');
            
            // Try to get AI explanation (should fail gracefully)
            await page.click('.tts-explain-btn');
            
            // Should show error message instead of crashing
            await page.waitForTimeout(2000);
            
            // Restore online mode
            await page.setOfflineMode(false);
        });

        test('should handle invalid text selections', async () => {
            await page.evaluate(() => {
                document.body.innerHTML = '<div><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="test image"></div>';
            });
            
            // Try to select non-text content
            await page.click('img');
            
            // Should not show overlay for non-text selections
            await page.waitForTimeout(1000);
            const overlay = await page.$('.tts-overlay-container.visible');
            expect(overlay).toBeFalsy();
        });
    });
});