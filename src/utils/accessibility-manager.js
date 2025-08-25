/**
 * Accessibility Manager for Intelligent TTS Extension
 * Ensures WCAG 2.1 AA compliance and enhanced accessibility features
 */

export class AccessibilityManager {
    constructor() {
        this.isInitialized = false;
        this.settings = {
            screenReaderSupport: true,
            highContrast: false,
            largeText: false,
            reducedMotion: false,
            keyboardNavigation: true,
            focusManagement: true,
            announcements: true
        };
        
        this.announcer = null;
        this.focusStack = [];
        this.keyboardTrapElements = new Set();
        this.lastFocusedElement = null;
    }

    async initialize() {
        try {
            await this.loadSettings();
            this.createScreenReaderAnnouncer();
            this.setupKeyboardNavigation();
            this.detectSystemPreferences();
            this.applyAccessibilityEnhancements();
            
            this.isInitialized = true;
            console.log('Accessibility Manager initialized');
        } catch (error) {
            console.error('Failed to initialize Accessibility Manager:', error);
        }
    }

    async loadSettings() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'GET_SETTINGS' });
            if (response.success) {
                this.settings = { ...this.settings, ...response.data };
            }
        } catch (error) {
            console.error('Failed to load accessibility settings:', error);
        }
    }

    /**
     * Create invisible element for screen reader announcements
     */
    createScreenReaderAnnouncer() {
        if (this.announcer || !this.settings.screenReaderSupport) return;

        this.announcer = document.createElement('div');
        this.announcer.id = 'tts-announcer';
        this.announcer.setAttribute('aria-live', 'polite');
        this.announcer.setAttribute('aria-atomic', 'true');
        this.announcer.style.cssText = `
            position: absolute !important;
            left: -10000px !important;
            width: 1px !important;
            height: 1px !important;
            overflow: hidden !important;
            clip: rect(1px, 1px, 1px, 1px) !important;
            clip-path: inset(50%) !important;
        `;
        
        document.body.appendChild(this.announcer);
    }

    /**
     * Announce text to screen readers
     */
    announce(text, priority = 'polite') {
        if (!this.announcer || !this.settings.announcements) return;

        // Clear previous announcement
        this.announcer.textContent = '';
        
        // Set priority level
        this.announcer.setAttribute('aria-live', priority);
        
        // Add announcement after brief delay for screen reader compatibility
        setTimeout(() => {
            this.announcer.textContent = text;
        }, 100);
    }

    /**
     * Announce extension status changes
     */
    announceStatus(action, details = '') {
        const messages = {
            'speech_started': `Reading selected text. ${details}`,
            'speech_stopped': 'Speech stopped',
            'speech_paused': 'Speech paused',
            'speech_resumed': 'Speech resumed',
            'explanation_requested': 'Getting AI explanation...',
            'explanation_ready': `AI explanation ready. ${details}`,
            'error': `Error: ${details}`,
            'settings_changed': 'Settings updated',
            'overlay_opened': 'TTS controls opened',
            'overlay_closed': 'TTS controls closed'
        };

        const message = messages[action] || `${action}: ${details}`;
        this.announce(message);
    }

    /**
     * Setup comprehensive keyboard navigation
     */
    setupKeyboardNavigation() {
        if (!this.settings.keyboardNavigation) return;

        // Global keyboard shortcuts
        document.addEventListener('keydown', this.handleGlobalKeyboard.bind(this));
        
        // Focus management
        document.addEventListener('focusin', this.handleFocusIn.bind(this));
        document.addEventListener('focusout', this.handleFocusOut.bind(this));
    }

    handleGlobalKeyboard(event) {
        // Skip if user is typing in input fields
        if (this.isTypingContext(event.target)) return;

        const { ctrlKey, shiftKey, altKey, key, code } = event;

        // TTS Extension shortcuts (accessible)
        if (ctrlKey && shiftKey) {
            switch (key) {
                case 'S':
                    event.preventDefault();
                    this.handleSpeakShortcut();
                    break;
                case 'E':
                    event.preventDefault();
                    this.handleExplainShortcut();
                    break;
                case 'X':
                    event.preventDefault();
                    this.handleStopShortcut();
                    break;
                case 'O':
                    event.preventDefault();
                    this.handleOverlayToggle();
                    break;
                case 'H':
                    event.preventDefault();
                    this.showKeyboardHelp();
                    break;
            }
        }

        // Escape key handling
        if (key === 'Escape') {
            this.handleEscapeKey(event);
        }

        // Arrow key navigation in overlays
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
            this.handleArrowNavigation(event);
        }
    }

    isTypingContext(element) {
        const typingElements = ['input', 'textarea', 'select'];
        const isContentEditable = element.contentEditable === 'true';
        const isTypingElement = typingElements.includes(element.tagName.toLowerCase());
        
        return isContentEditable || isTypingElement;
    }

    async handleSpeakShortcut() {
        try {
            this.announce('Speaking selected text', 'assertive');
            await chrome.runtime.sendMessage({
                action: 'SPEAK_SELECTION_KEYBOARD'
            });
        } catch (error) {
            this.announce('Unable to speak text', 'assertive');
        }
    }

    async handleExplainShortcut() {
        try {
            this.announce('Getting AI explanation', 'polite');
            await chrome.runtime.sendMessage({
                action: 'EXPLAIN_SELECTION_KEYBOARD'
            });
        } catch (error) {
            this.announce('Unable to get explanation', 'assertive');
        }
    }

    async handleStopShortcut() {
        try {
            this.announce('Stopping speech', 'assertive');
            await chrome.runtime.sendMessage({
                action: 'STOP_SPEECH_KEYBOARD'
            });
        } catch (error) {
            this.announce('Unable to stop speech', 'assertive');
        }
    }

    handleOverlayToggle() {
        const overlay = document.getElementById('tts-extension-overlay');
        if (overlay) {
            const isVisible = overlay.classList.contains('visible');
            if (isVisible) {
                this.announce('Closing TTS controls', 'polite');
            } else {
                this.announce('Opening TTS controls', 'polite');
                setTimeout(() => this.focusOverlay(overlay), 200);
            }
        }
    }

    showKeyboardHelp() {
        const helpText = `
            TTS Extension Keyboard Shortcuts:
            Ctrl+Shift+S: Speak selected text
            Ctrl+Shift+E: Get AI explanation
            Ctrl+Shift+X: Stop speech
            Ctrl+Shift+O: Toggle TTS controls
            Ctrl+Shift+H: Show this help
            Escape: Close overlays
            Tab: Navigate controls
        `;
        this.announce(helpText, 'polite');
    }

    handleEscapeKey(event) {
        // Close any open TTS overlays
        const overlays = document.querySelectorAll('.tts-overlay-container');
        let closed = false;

        overlays.forEach(overlay => {
            if (overlay.classList.contains('visible')) {
                overlay.classList.remove('visible');
                closed = true;
            }
        });

        if (closed) {
            event.preventDefault();
            this.announce('TTS overlay closed', 'polite');
            this.restoreFocus();
        }
    }

    handleArrowNavigation(event) {
        const overlay = document.querySelector('.tts-overlay-container.visible');
        if (!overlay) return;

        const focusableElements = this.getFocusableElements(overlay);
        const currentIndex = focusableElements.indexOf(document.activeElement);

        if (currentIndex === -1) return;

        let nextIndex;
        switch (event.key) {
            case 'ArrowDown':
            case 'ArrowRight':
                nextIndex = (currentIndex + 1) % focusableElements.length;
                break;
            case 'ArrowUp':
            case 'ArrowLeft':
                nextIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
                break;
            default:
                return;
        }

        event.preventDefault();
        focusableElements[nextIndex].focus();
    }

    /**
     * Focus management utilities
     */
    handleFocusIn(event) {
        if (!this.isExtensionElement(event.target)) {
            this.lastFocusedElement = event.target;
        }
    }

    handleFocusOut(event) {
        // Track focus changes for restoration
    }

    saveFocus() {
        this.focusStack.push(document.activeElement);
    }

    restoreFocus() {
        const element = this.focusStack.pop() || this.lastFocusedElement;
        if (element && element.focus) {
            element.focus();
        }
    }

    focusOverlay(overlay) {
        const firstFocusable = this.getFocusableElements(overlay)[0];
        if (firstFocusable) {
            this.saveFocus();
            firstFocusable.focus();
        }
    }

    getFocusableElements(container) {
        const focusableSelectors = [
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            'a[href]',
            '[tabindex]:not([tabindex="-1"])'
        ];

        return Array.from(container.querySelectorAll(focusableSelectors.join(',')))
            .filter(element => {
                return element.offsetWidth > 0 && 
                       element.offsetHeight > 0 && 
                       !element.hidden;
            });
    }

    /**
     * Detect system accessibility preferences
     */
    detectSystemPreferences() {
        // Detect reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.settings.reducedMotion = true;
        }

        // Detect high contrast preference
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            this.settings.highContrast = true;
        }

        // Listen for changes
        window.matchMedia('(prefers-reduced-motion: reduce)')
            .addEventListener('change', (e) => {
                this.settings.reducedMotion = e.matches;
                this.applyMotionPreferences();
            });

        window.matchMedia('(prefers-contrast: high)')
            .addEventListener('change', (e) => {
                this.settings.highContrast = e.matches;
                this.applyContrastPreferences();
            });
    }

    /**
     * Apply accessibility enhancements
     */
    applyAccessibilityEnhancements() {
        this.enhanceExtensionElements();
        this.applyContrastPreferences();
        this.applyMotionPreferences();
        this.setupAriaLabels();
    }

    enhanceExtensionElements() {
        // Add accessibility attributes to dynamically created elements
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && this.isExtensionElement(node)) {
                        this.enhanceElement(node);
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    enhanceElement(element) {
        // Add proper ARIA labels and roles
        if (element.classList.contains('tts-overlay-container')) {
            element.setAttribute('role', 'dialog');
            element.setAttribute('aria-modal', 'true');
            element.setAttribute('aria-label', 'TTS Assistant Controls');
        }

        // Enhance buttons
        const buttons = element.querySelectorAll('button:not([aria-label])');
        buttons.forEach(button => {
            const text = button.textContent.trim();
            if (text) {
                button.setAttribute('aria-label', text);
            }
        });

        // Enhance sliders
        const sliders = element.querySelectorAll('input[type="range"]');
        sliders.forEach(slider => {
            if (!slider.getAttribute('aria-label')) {
                const label = slider.previousElementSibling;
                if (label && label.textContent) {
                    slider.setAttribute('aria-label', label.textContent);
                }
            }
        });
    }

    applyContrastPreferences() {
        if (this.settings.highContrast) {
            document.documentElement.setAttribute('data-tts-high-contrast', 'true');
        } else {
            document.documentElement.removeAttribute('data-tts-high-contrast');
        }
    }

    applyMotionPreferences() {
        if (this.settings.reducedMotion) {
            document.documentElement.setAttribute('data-tts-reduced-motion', 'true');
        } else {
            document.documentElement.removeAttribute('data-tts-reduced-motion');
        }
    }

    setupAriaLabels() {
        // Ensure all interactive elements have proper labels
        const unlabeledElements = document.querySelectorAll('button:not([aria-label]), input:not([aria-label])');
        
        unlabeledElements.forEach(element => {
            if (this.isExtensionElement(element)) {
                this.addAriaLabel(element);
            }
        });
    }

    addAriaLabel(element) {
        const tagName = element.tagName.toLowerCase();
        const className = element.className;
        const text = element.textContent.trim();

        if (text) {
            element.setAttribute('aria-label', text);
        } else if (className.includes('tts-speak')) {
            element.setAttribute('aria-label', 'Speak selected text');
        } else if (className.includes('tts-explain')) {
            element.setAttribute('aria-label', 'Get AI explanation');
        } else if (className.includes('tts-stop')) {
            element.setAttribute('aria-label', 'Stop speech');
        } else if (className.includes('tts-close')) {
            element.setAttribute('aria-label', 'Close TTS controls');
        }
    }

    isExtensionElement(element) {
        return element.id && element.id.startsWith('tts-') ||
               element.className && element.className.includes('tts-') ||
               element.closest('[id^="tts-"]');
    }

    /**
     * Color contrast utilities
     */
    checkColorContrast(foreground, background) {
        // Calculate contrast ratio according to WCAG guidelines
        const getLuminance = (color) => {
            const rgb = this.hexToRgb(color);
            const rsRGB = rgb.r / 255;
            const gsRGB = rgb.g / 255;
            const bsRGB = rgb.b / 255;

            const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
            const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
            const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

            return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        };

        const l1 = getLuminance(foreground);
        const l2 = getLuminance(background);
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);

        return (lighter + 0.05) / (darker + 0.05);
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    /**
     * Update accessibility settings
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.applyAccessibilityEnhancements();
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.announcer) {
            this.announcer.remove();
        }

        document.removeEventListener('keydown', this.handleGlobalKeyboard);
        document.removeEventListener('focusin', this.handleFocusIn);
        document.removeEventListener('focusout', this.handleFocusOut);

        this.isInitialized = false;
    }
}