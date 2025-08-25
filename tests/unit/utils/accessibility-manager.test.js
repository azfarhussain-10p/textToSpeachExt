/**
 * Unit Tests for Accessibility Manager
 */

import { AccessibilityManager } from '../../../src/utils/accessibility-manager.js';

describe('AccessibilityManager', () => {
    let accessibilityManager;

    beforeEach(() => {
        accessibilityManager = new AccessibilityManager();
        // Mock matchMedia
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: jest.fn().mockImplementation(query => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: jest.fn(),
                removeListener: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
            }))
        });
    });

    afterEach(() => {
        if (accessibilityManager.isInitialized) {
            accessibilityManager.destroy();
        }
    });

    describe('Initialization', () => {
        test('should initialize successfully', async () => {
            global.chrome.runtime.sendMessage.mockResolvedValue({
                success: true,
                data: { screenReaderSupport: true }
            });

            await accessibilityManager.initialize();
            expect(accessibilityManager.isInitialized).toBe(true);
        });

        test('should create screen reader announcer', async () => {
            global.chrome.runtime.sendMessage.mockResolvedValue({
                success: true,
                data: { screenReaderSupport: true }
            });

            await accessibilityManager.initialize();
            
            const announcer = document.getElementById('tts-announcer');
            expect(announcer).toBeTruthy();
            expect(announcer.getAttribute('aria-live')).toBe('polite');
        });

        test('should detect system preferences', async () => {
            window.matchMedia.mockImplementation(query => ({
                matches: query.includes('prefers-reduced-motion'),
                addEventListener: jest.fn()
            }));

            await accessibilityManager.initialize();
            expect(accessibilityManager.settings.reducedMotion).toBe(true);
        });
    });

    describe('Screen Reader Announcements', () => {
        beforeEach(async () => {
            global.chrome.runtime.sendMessage.mockResolvedValue({
                success: true,
                data: { screenReaderSupport: true, announcements: true }
            });
            await accessibilityManager.initialize();
        });

        test('should announce text to screen readers', (done) => {
            accessibilityManager.announce('Test announcement');
            
            setTimeout(() => {
                const announcer = document.getElementById('tts-announcer');
                expect(announcer.textContent).toBe('Test announcement');
                done();
            }, 150);
        });

        test('should set announcement priority', (done) => {
            accessibilityManager.announce('Urgent message', 'assertive');
            
            setTimeout(() => {
                const announcer = document.getElementById('tts-announcer');
                expect(announcer.getAttribute('aria-live')).toBe('assertive');
                done();
            }, 150);
        });

        test('should announce extension status changes', () => {
            const spy = jest.spyOn(accessibilityManager, 'announce');
            
            accessibilityManager.announceStatus('speech_started', 'Reading article');
            expect(spy).toHaveBeenCalledWith('Reading selected text. Reading article');
            
            accessibilityManager.announceStatus('speech_stopped');
            expect(spy).toHaveBeenCalledWith('Speech stopped');
        });
    });

    describe('Keyboard Navigation', () => {
        beforeEach(async () => {
            global.chrome.runtime.sendMessage.mockResolvedValue({
                success: true,
                data: { keyboardNavigation: true }
            });
            await accessibilityManager.initialize();
        });

        test('should handle keyboard shortcuts', async () => {
            const event = new KeyboardEvent('keydown', {
                key: 'S',
                ctrlKey: true,
                shiftKey: true
            });

            global.chrome.runtime.sendMessage.mockResolvedValue({ success: true });
            
            document.dispatchEvent(event);
            expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith({
                action: 'SPEAK_SELECTION_KEYBOARD'
            });
        });

        test('should ignore shortcuts in typing contexts', () => {
            const input = document.createElement('input');
            document.body.appendChild(input);
            input.focus();

            const event = new KeyboardEvent('keydown', {
                key: 'S',
                ctrlKey: true,
                shiftKey: true,
                target: input
            });

            const spy = jest.spyOn(global.chrome.runtime, 'sendMessage');
            accessibilityManager.handleGlobalKeyboard(event);
            
            expect(spy).not.toHaveBeenCalled();
        });

        test('should handle escape key to close overlays', () => {
            const overlay = document.createElement('div');
            overlay.className = 'tts-overlay-container visible';
            document.body.appendChild(overlay);

            const event = new KeyboardEvent('keydown', { key: 'Escape' });
            accessibilityManager.handleEscapeKey(event);

            expect(overlay.classList.contains('visible')).toBe(false);
        });

        test('should navigate with arrow keys', () => {
            const overlay = document.createElement('div');
            overlay.className = 'tts-overlay-container visible';
            
            const button1 = document.createElement('button');
            const button2 = document.createElement('button');
            overlay.appendChild(button1);
            overlay.appendChild(button2);
            document.body.appendChild(overlay);

            button1.focus();
            const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
            event.preventDefault = jest.fn();
            
            accessibilityManager.handleArrowNavigation(event);
            expect(event.preventDefault).toHaveBeenCalled();
        });
    });

    describe('Focus Management', () => {
        beforeEach(async () => {
            await accessibilityManager.initialize();
        });

        test('should save and restore focus', () => {
            const button = document.createElement('button');
            document.body.appendChild(button);
            button.focus();

            accessibilityManager.saveFocus();
            
            const input = document.createElement('input');
            document.body.appendChild(input);
            input.focus();

            accessibilityManager.restoreFocus();
            expect(document.activeElement).toBe(button);
        });

        test('should get focusable elements', () => {
            const container = document.createElement('div');
            const button = document.createElement('button');
            const input = document.createElement('input');
            const disabledButton = document.createElement('button');
            disabledButton.disabled = true;

            container.appendChild(button);
            container.appendChild(input);
            container.appendChild(disabledButton);

            const focusable = accessibilityManager.getFocusableElements(container);
            expect(focusable).toHaveLength(2);
            expect(focusable).toContain(button);
            expect(focusable).toContain(input);
            expect(focusable).not.toContain(disabledButton);
        });
    });

    describe('Accessibility Enhancements', () => {
        beforeEach(async () => {
            await accessibilityManager.initialize();
        });

        test('should enhance extension elements with ARIA attributes', () => {
            const button = document.createElement('button');
            button.className = 'tts-speak-btn';
            button.textContent = 'Speak';
            document.body.appendChild(button);

            accessibilityManager.enhanceElement(button);
            expect(button.getAttribute('aria-label')).toBe('Speak');
        });

        test('should add proper role to overlay container', () => {
            const overlay = document.createElement('div');
            overlay.className = 'tts-overlay-container';
            document.body.appendChild(overlay);

            accessibilityManager.enhanceElement(overlay);
            expect(overlay.getAttribute('role')).toBe('dialog');
            expect(overlay.getAttribute('aria-modal')).toBe('true');
        });

        test('should apply high contrast preferences', () => {
            accessibilityManager.settings.highContrast = true;
            accessibilityManager.applyContrastPreferences();
            
            expect(document.documentElement.getAttribute('data-tts-high-contrast')).toBe('true');
        });

        test('should apply reduced motion preferences', () => {
            accessibilityManager.settings.reducedMotion = true;
            accessibilityManager.applyMotionPreferences();
            
            expect(document.documentElement.getAttribute('data-tts-reduced-motion')).toBe('true');
        });
    });

    describe('Color Contrast Utilities', () => {
        test('should check color contrast ratios', () => {
            const contrast = accessibilityManager.checkColorContrast('#000000', '#FFFFFF');
            expect(contrast).toBe(21); // Perfect contrast
        });

        test('should convert hex colors to RGB', () => {
            const rgb = accessibilityManager.hexToRgb('#FF5733');
            expect(rgb).toEqual({ r: 255, g: 87, b: 51 });
        });

        test('should handle invalid hex colors', () => {
            const rgb = accessibilityManager.hexToRgb('invalid');
            expect(rgb).toBeNull();
        });
    });

    describe('Settings Updates', () => {
        beforeEach(async () => {
            await accessibilityManager.initialize();
        });

        test('should update accessibility settings', () => {
            const newSettings = {
                highContrast: true,
                largeText: true,
                reducedMotion: false
            };

            accessibilityManager.updateSettings(newSettings);
            
            expect(accessibilityManager.settings.highContrast).toBe(true);
            expect(accessibilityManager.settings.largeText).toBe(true);
            expect(accessibilityManager.settings.reducedMotion).toBe(false);
        });
    });

    describe('Cleanup', () => {
        test('should clean up properly on destroy', async () => {
            await accessibilityManager.initialize();
            const announcer = document.getElementById('tts-announcer');
            
            accessibilityManager.destroy();
            
            expect(document.getElementById('tts-announcer')).toBeNull();
            expect(accessibilityManager.isInitialized).toBe(false);
        });
    });
});