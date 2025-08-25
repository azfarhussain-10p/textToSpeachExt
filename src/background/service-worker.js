/**
 * Service Worker for Intelligent TTS Extension
 * Handles background processes, API calls, and extension coordination
 */

import { APIManager } from '../services/api-manager.js';
import { StorageManager } from '../services/storage-manager.js';
import { ContextMenuManager } from '../services/context-menu-manager.js';

class ServiceWorker {
    constructor() {
        this.apiManager = new APIManager();
        this.storageManager = new StorageManager();
        this.contextMenuManager = new ContextMenuManager();
        this.isInitialized = false;
    }

    async initialize() {
        try {
            // Initialize storage and settings
            await this.storageManager.initialize();
            
            // Set up context menus
            await this.contextMenuManager.initialize();
            
            // Register event listeners
            this.registerEventListeners();
            
            this.isInitialized = true;
            console.log('TTS Extension Service Worker initialized successfully');
        } catch (error) {
            console.error('Failed to initialize service worker:', error);
        }
    }

    registerEventListeners() {
        // Handle extension installation
        chrome.runtime.onInstalled.addListener(this.handleInstall.bind(this));
        
        // Handle messages from content scripts and popup
        chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
        
        // Handle context menu clicks
        chrome.contextMenus.onClicked.addListener(this.handleContextMenuClick.bind(this));
        
        // Handle storage changes
        chrome.storage.onChanged.addListener(this.handleStorageChange.bind(this));
    }

    async handleInstall(details) {
        if (details.reason === 'install') {
            // First-time installation setup
            await this.storageManager.setDefaultSettings();
            console.log('TTS Extension installed successfully');
        } else if (details.reason === 'update') {
            // Handle updates
            console.log('TTS Extension updated successfully');
        }
    }

    async handleMessage(request, sender, sendResponse) {
        try {
            const { action, data } = request;
            let response = { success: true };

            switch (action) {
                case 'GET_TTS_VOICES':
                    response.data = await this.getTTSVoices();
                    break;
                    
                case 'SPEAK_TEXT':
                    await this.speakText(data.text, data.options);
                    break;
                    
                case 'GET_AI_EXPLANATION':
                    response.data = await this.getAIExplanation(data.text, data.options);
                    break;
                    
                case 'UPDATE_SETTINGS':
                    await this.storageManager.updateSettings(data.settings);
                    break;
                    
                case 'GET_SETTINGS':
                    response.data = await this.storageManager.getSettings();
                    break;
                    
                case 'HEALTH_CHECK':
                    response.data = { status: 'healthy', initialized: this.isInitialized };
                    break;
                    
                default:
                    response = { success: false, error: 'Unknown action' };
            }

            sendResponse(response);
        } catch (error) {
            console.error('Error handling message:', error);
            sendResponse({ success: false, error: error.message });
        }
        
        // Return true to indicate asynchronous response
        return true;
    }

    async handleContextMenuClick(info, tab) {
        try {
            const { menuItemId, selectionText } = info;
            
            if (menuItemId === 'tts-speak-selection' && selectionText) {
                // Inject content script if not already present
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['content/content-script.js']
                });

                // Send message to content script to speak selection
                chrome.tabs.sendMessage(tab.id, {
                    action: 'SPEAK_SELECTION',
                    data: { text: selectionText }
                });
            } else if (menuItemId === 'tts-explain-selection' && selectionText) {
                // Get AI explanation
                const explanation = await this.getAIExplanation(selectionText);
                
                // Send to content script for display
                chrome.tabs.sendMessage(tab.id, {
                    action: 'SHOW_EXPLANATION',
                    data: { text: selectionText, explanation }
                });
            }
        } catch (error) {
            console.error('Error handling context menu click:', error);
        }
    }

    handleStorageChange(changes, namespace) {
        if (namespace === 'sync') {
            console.log('Settings updated:', changes);
            // Notify content scripts about settings changes
            this.broadcastMessage({ action: 'SETTINGS_CHANGED', data: changes });
        }
    }

    async getTTSVoices() {
        // This will be handled by content scripts since speechSynthesis is not available in service worker
        return [];
    }

    async speakText(text, options = {}) {
        // Delegate to content script for actual speech synthesis
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'SPEAK_TEXT_INTERNAL',
                data: { text, options }
            });
        }
    }

    async getAIExplanation(text, options = {}) {
        try {
            const settings = await this.storageManager.getSettings();
            return await this.apiManager.getExplanation(text, {
                ...options,
                language: settings.language,
                provider: settings.aiProvider
            });
        } catch (error) {
            console.error('Failed to get AI explanation:', error);
            throw error;
        }
    }

    async broadcastMessage(message) {
        const tabs = await chrome.tabs.query({});
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, message).catch(() => {
                // Ignore errors for tabs without content scripts
            });
        });
    }
}

// Initialize service worker
const serviceWorker = new ServiceWorker();
serviceWorker.initialize();