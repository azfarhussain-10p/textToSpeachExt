/**
 * Content Script for Intelligent TTS Extension
 * Handles text selection, TTS functionality, and overlay management
 */

import { TTSService } from '../services/tts-service.js';
import { UIOverlay } from '../components/ui-overlay.js';
import { SelectionHandler } from '../utils/selection-handler.js';
import { AccessibilityManager } from '../utils/accessibility-manager.js';
import { LanguageManager } from '../utils/language-manager.js';

class ContentScript {
    constructor() {
        this.ttsService = new TTSService();
        this.overlay = new UIOverlay();
        this.selectionHandler = new SelectionHandler();
        this.accessibilityManager = new AccessibilityManager();
        this.languageManager = new LanguageManager();
        this.isInitialized = false;
        this.currentSelection = null;
        this.settings = null;
    }

    async initialize() {
        try {
            // Get extension settings
            await this.loadSettings();
            
            // Initialize managers and services
            await this.languageManager.initialize();
            await this.accessibilityManager.initialize();
            await this.ttsService.initialize();
            
            // Set up event listeners
            this.registerEventListeners();
            
            // Initialize overlay
            await this.overlay.initialize();
            
            this.isInitialized = true;
            console.log('TTS Content Script initialized successfully');
            
            // Announce initialization for screen readers
            this.accessibilityManager.announce('TTS Assistant ready');
        } catch (error) {
            console.error('Failed to initialize content script:', error);
        }
    }

    async loadSettings() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'GET_SETTINGS' });
            if (response.success) {
                this.settings = response.data;
                this.applySettings();
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
            // Use default settings
            this.settings = {
                language: 'en-US',
                voice: null,
                rate: 1.0,
                pitch: 1.0,
                volume: 1.0,
                showOverlay: true,
                aiProvider: 'groq',
                enableKeyboardShortcuts: true
            };
        }
    }

    applySettings() {
        this.ttsService.updateSettings(this.settings);
        this.overlay.updateSettings(this.settings);
    }

    registerEventListeners() {
        // Text selection events
        document.addEventListener('mouseup', this.handleTextSelection.bind(this));
        document.addEventListener('keyup', this.handleKeyboardSelection.bind(this));
        
        // Keyboard shortcuts
        if (this.settings.enableKeyboardShortcuts) {
            document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
        }
        
        // Message listener for service worker communication
        chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
        
        // Clean up on page unload
        window.addEventListener('beforeunload', this.cleanup.bind(this));
    }

    async handleTextSelection(event) {
        setTimeout(() => {
            const selection = window.getSelection();
            const selectedText = selection.toString().trim();
            
            if (selectedText && selectedText.length > 0) {
                this.currentSelection = {
                    text: selectedText,
                    range: selection.getRangeAt(0),
                    position: {
                        x: event.pageX,
                        y: event.pageY
                    }
                };
                
                if (this.settings.showOverlay) {
                    this.showOverlay();
                }
            } else {
                this.hideOverlay();
                this.currentSelection = null;
            }
        }, 100); // Small delay to ensure selection is complete
    }

    handleKeyboardSelection(event) {
        // Handle keyboard text selection (Shift + Arrow keys)
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();
        
        if (selectedText && selectedText.length > 0) {
            this.currentSelection = {
                text: selectedText,
                range: selection.getRangeAt(0),
                position: this.getSelectionPosition()
            };
            
            if (this.settings.showOverlay) {
                this.showOverlay();
            }
        }
    }

    handleKeyboardShortcuts(event) {
        // Ctrl+Shift+S: Speak selected text
        if (event.ctrlKey && event.shiftKey && event.code === 'KeyS') {
            event.preventDefault();
            this.speakSelection();
        }
        
        // Ctrl+Shift+E: Get AI explanation
        if (event.ctrlKey && event.shiftKey && event.code === 'KeyE') {
            event.preventDefault();
            this.explainSelection();
        }
        
        // Ctrl+Shift+X: Stop speech
        if (event.ctrlKey && event.shiftKey && event.code === 'KeyX') {
            event.preventDefault();
            this.stopSpeech();
        }
        
        // Escape: Hide overlay
        if (event.code === 'Escape') {
            this.hideOverlay();
        }
    }

    async handleMessage(request, sender, sendResponse) {
        try {
            const { action, data } = request;
            let response = { success: true };

            switch (action) {
                case 'SPEAK_SELECTION':
                    await this.speakText(data.text);
                    break;
                    
                case 'SPEAK_TEXT_INTERNAL':
                    await this.speakText(data.text, data.options);
                    break;
                    
                case 'SHOW_EXPLANATION':
                    this.showExplanation(data.text, data.explanation);
                    break;
                    
                case 'SETTINGS_CHANGED':
                    await this.loadSettings();
                    break;
                    
                case 'STOP_SPEECH':
                    this.stopSpeech();
                    break;
                    
                default:
                    response = { success: false, error: 'Unknown action' };
            }

            sendResponse(response);
        } catch (error) {
            console.error('Error handling message:', error);
            sendResponse({ success: false, error: error.message });
        }
        
        return true; // Indicate asynchronous response
    }

    getSelectionPosition() {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            return {
                x: rect.left + window.pageXOffset,
                y: rect.top + window.pageYOffset
            };
        }
        return { x: 0, y: 0 };
    }

    showOverlay() {
        if (this.currentSelection && this.settings.showOverlay) {
            this.overlay.show({
                text: this.currentSelection.text,
                position: this.currentSelection.position,
                onSpeak: () => this.speakSelection(),
                onExplain: () => this.explainSelection(),
                onClose: () => this.hideOverlay()
            });
        }
    }

    hideOverlay() {
        this.overlay.hide();
    }

    async speakSelection() {
        if (this.currentSelection) {
            await this.speakText(this.currentSelection.text);
        }
    }

    async speakText(text, options = {}) {
        try {
            this.overlay.setLoadingState('speaking');
            await this.ttsService.speak(text, {
                ...options,
                voice: this.settings.voice,
                rate: this.settings.rate,
                pitch: this.settings.pitch,
                volume: this.settings.volume
            });
            this.overlay.clearLoadingState();
        } catch (error) {
            console.error('Failed to speak text:', error);
            this.overlay.showError('Failed to speak text');
        }
    }

    async explainSelection() {
        if (this.currentSelection) {
            try {
                this.overlay.setLoadingState('explaining');
                
                const response = await chrome.runtime.sendMessage({
                    action: 'GET_AI_EXPLANATION',
                    data: { 
                        text: this.currentSelection.text,
                        options: { language: this.settings.language }
                    }
                });
                
                if (response.success) {
                    this.showExplanation(this.currentSelection.text, response.data);
                } else {
                    throw new Error(response.error);
                }
                
                this.overlay.clearLoadingState();
            } catch (error) {
                console.error('Failed to get AI explanation:', error);
                this.overlay.showError('Failed to get explanation');
            }
        }
    }

    showExplanation(text, explanation) {
        this.overlay.showExplanation({
            originalText: text,
            explanation: explanation,
            onSpeak: (text) => this.speakText(text)
        });
    }

    stopSpeech() {
        this.ttsService.stop();
        this.overlay.clearLoadingState();
    }

    cleanup() {
        this.stopSpeech();
        this.overlay.destroy();
    }
}

// Auto-initialize when script loads
// Prevent multiple initializations
if (!window.ttsContentScriptInitialized) {
    window.ttsContentScriptInitialized = true;
    const contentScript = new ContentScript();
    contentScript.initialize();
    
    // Make it globally accessible for debugging
    window.ttsContentScript = contentScript;
}