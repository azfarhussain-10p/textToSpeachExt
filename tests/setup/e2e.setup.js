/**
 * End-to-End Test Setup for Cross-Browser Testing
 */

// Extend default timeout for E2E tests
jest.setTimeout(120000); // 2 minutes

// Global setup for Puppeteer
global.extensionPath = {
    chrome: 'dist/chrome',
    firefox: 'dist/firefox', 
    safari: 'dist/safari'
};

// Browser launch options
global.browserOptions = {
    chrome: {
        headless: false,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-web-security',
            '--disable-features=TranslateUI',
            '--disable-ipc-flooding-protection',
            '--disable-extensions-except=./dist/chrome',
            '--load-extension=./dist/chrome'
        ]
    },
    firefox: {
        headless: false,
        args: []
    },
    safari: {
        headless: false,
        args: []
    }
};

// Test utilities for E2E
global.e2eUtils = {
    waitForExtensionLoad: async (page, timeout = 10000) => {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error('Extension failed to load within timeout'));
            }, timeout);

            const checkLoad = async () => {
                try {
                    // Check if extension context is available
                    const extensionLoaded = await page.evaluate(() => {
                        return typeof chrome !== 'undefined' && 
                               chrome.runtime && 
                               chrome.runtime.id;
                    });
                    
                    if (extensionLoaded) {
                        clearTimeout(timer);
                        resolve();
                    } else {
                        setTimeout(checkLoad, 500);
                    }
                } catch (error) {
                    setTimeout(checkLoad, 500);
                }
            };
            
            checkLoad();
        });
    },

    selectText: async (page, selector) => {
        await page.evaluate((sel) => {
            const element = document.querySelector(sel);
            if (element) {
                const range = document.createRange();
                range.selectNodeContents(element);
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }, selector);
    },

    waitForOverlay: async (page, timeout = 5000) => {
        await page.waitForSelector('.tts-overlay-container', { timeout });
        await page.waitForFunction(() => {
            const overlay = document.querySelector('.tts-overlay-container');
            return overlay && overlay.classList.contains('visible');
        }, { timeout });
    },

    getExtensionId: (targets) => {
        const extensionTarget = targets.find(
            target => target.type() === 'service_worker' && 
                     target.url().includes('chrome-extension://')
        );
        
        if (extensionTarget) {
            return extensionTarget.url().split('chrome-extension://')[1].split('/')[0];
        }
        
        return null;
    }
};

// Clean up after each test
afterEach(async () => {
    // Clean up any global state
    if (global.browser) {
        const pages = await global.browser.pages();
        for (const page of pages.slice(1)) { // Keep the first page
            if (!page.isClosed()) {
                await page.close();
            }
        }
    }
});

// Clean up after all tests
afterAll(async () => {
    if (global.browser) {
        await global.browser.close();
    }
});