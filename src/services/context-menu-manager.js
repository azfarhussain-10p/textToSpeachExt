/**
 * Context Menu Manager for Intelligent TTS Extension
 * Handles browser context menu integration
 */

export class ContextMenuManager {
    constructor() {
        this.isInitialized = false;
        this.menuItems = new Map();
        this.settings = null;
    }

    async initialize() {
        try {
            await this.loadSettings();
            await this.createContextMenus();
            this.setupEventListeners();
            this.isInitialized = true;
            console.log('Context Menu Manager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Context Menu Manager:', error);
            throw error;
        }
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get([
                'language',
                'enableContextMenu',
                'showContextMenuIcons'
            ]);
            
            this.settings = {
                language: result.language || 'en-US',
                enableContextMenu: result.enableContextMenu !== false, // Default to true
                showContextMenuIcons: result.showContextMenuIcons !== false
            };
        } catch (error) {
            console.error('Failed to load context menu settings:', error);
            this.settings = {
                language: 'en-US',
                enableContextMenu: true,
                showContextMenuIcons: true
            };
        }
    }

    async createContextMenus() {
        if (!this.settings.enableContextMenu) return;

        try {
            // Remove existing menus
            await chrome.contextMenus.removeAll();
            this.menuItems.clear();

            const menuConfig = this.getMenuConfiguration();
            
            // Create parent menu
            const parentId = await this.createMenuItem({
                id: 'tts-extension-parent',
                title: 'TTS Assistant',
                contexts: ['selection'],
                documentUrlPatterns: ['http://*/*', 'https://*/*']
            });

            if (parentId) {
                // Create sub-menus
                for (const item of menuConfig.subItems) {
                    await this.createMenuItem({
                        ...item,
                        parentId: parentId
                    });
                }
                
                // Add separator and settings
                await this.createMenuItem({
                    id: 'tts-separator-1',
                    type: 'separator',
                    parentId: parentId,
                    contexts: ['selection']
                });
                
                await this.createMenuItem({
                    id: 'tts-open-options',
                    title: 'Settings...',
                    parentId: parentId,
                    contexts: ['selection']
                });
            }

            console.log('Context menus created successfully');
        } catch (error) {
            console.error('Failed to create context menus:', error);
        }
    }

    async createMenuItem(options) {
        return new Promise((resolve, reject) => {
            chrome.contextMenus.create(options, () => {
                if (chrome.runtime.lastError) {
                    console.error('Context menu creation error:', chrome.runtime.lastError);
                    reject(chrome.runtime.lastError);
                } else {
                    this.menuItems.set(options.id, options);
                    resolve(options.id);
                }
            });
        });
    }

    getMenuConfiguration() {
        const icons = this.settings.showContextMenuIcons;
        
        return {
            subItems: [
                {
                    id: 'tts-speak-selection',
                    title: `${icons ? '🔊 ' : ''}Read Selected Text`,
                    contexts: ['selection']
                },
                {
                    id: 'tts-explain-selection',
                    title: `${icons ? '💡 ' : ''}Explain with AI`,
                    contexts: ['selection']
                },
                {
                    id: 'tts-translate-and-speak',
                    title: `${icons ? '🌐 ' : ''}Translate & Speak`,
                    contexts: ['selection']
                },
                {
                    id: 'tts-separator-2',
                    type: 'separator',
                    contexts: ['selection']
                },
                {
                    id: 'tts-voice-settings',
                    title: `${icons ? '⚙️ ' : ''}Voice Settings`,
                    contexts: ['selection']
                }
            ]
        };
    }

    setupEventListeners() {
        // Listen for context menu clicks
        chrome.contextMenus.onClicked.addListener(this.handleMenuClick.bind(this));
        
        // Listen for settings changes
        chrome.storage.onChanged.addListener(this.handleSettingsChange.bind(this));
    }

    async handleMenuClick(info, tab) {
        try {
            const { menuItemId, selectionText, pageUrl } = info;
            
            if (!selectionText) {
                console.warn('No text selected for context menu action');
                return;
            }

            // Ensure content script is injected
            await this.ensureContentScript(tab.id);
            
            switch (menuItemId) {
                case 'tts-speak-selection':
                    await this.handleSpeakSelection(tab.id, selectionText);
                    break;
                    
                case 'tts-explain-selection':
                    await this.handleExplainSelection(tab.id, selectionText);
                    break;
                    
                case 'tts-translate-and-speak':
                    await this.handleTranslateAndSpeak(tab.id, selectionText);
                    break;
                    
                case 'tts-voice-settings':
                    await this.handleVoiceSettings(tab.id);
                    break;
                    
                case 'tts-open-options':
                    await this.handleOpenOptions();
                    break;
                    
                default:
                    console.warn('Unknown context menu action:', menuItemId);
            }
            
            // Track usage
            await this.trackMenuUsage(menuItemId);
            
        } catch (error) {
            console.error('Error handling context menu click:', error);
        }
    }

    async ensureContentScript(tabId) {
        try {
            // Try to ping the content script first
            const response = await chrome.tabs.sendMessage(tabId, { 
                action: 'PING' 
            }).catch(() => null);
            
            if (!response) {
                // Content script not present, inject it
                await chrome.scripting.executeScript({
                    target: { tabId },
                    files: ['content/content-script.js']
                });
                
                // Also inject CSS if needed
                await chrome.scripting.insertCSS({
                    target: { tabId },
                    files: ['styles/content.css']
                }).catch(() => {
                    // CSS injection might fail, but it's not critical
                });
                
                // Wait a moment for initialization
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        } catch (error) {
            console.error('Failed to ensure content script:', error);
            throw new Error('Unable to initialize TTS on this page');
        }
    }

    async handleSpeakSelection(tabId, text) {
        try {
            const response = await chrome.tabs.sendMessage(tabId, {
                action: 'SPEAK_SELECTION',
                data: { text }
            });
            
            if (!response || !response.success) {
                throw new Error(response?.error || 'Failed to speak text');
            }
        } catch (error) {
            console.error('Failed to speak selection:', error);
            this.showError(tabId, 'Failed to speak selected text');
        }
    }

    async handleExplainSelection(tabId, text) {
        try {
            // Get AI explanation from service worker
            const explanation = await chrome.runtime.sendMessage({
                action: 'GET_AI_EXPLANATION',
                data: { text, options: { language: this.settings.language } }
            });
            
            if (explanation.success) {
                // Send explanation to content script for display
                await chrome.tabs.sendMessage(tabId, {
                    action: 'SHOW_EXPLANATION',
                    data: { 
                        text, 
                        explanation: explanation.data 
                    }
                });
            } else {
                throw new Error(explanation.error);
            }
        } catch (error) {
            console.error('Failed to explain selection:', error);
            this.showError(tabId, 'Failed to get AI explanation');
        }
    }

    async handleTranslateAndSpeak(tabId, text) {
        try {
            // This is a placeholder for translation functionality
            // Could integrate with Google Translate API or similar
            const translatedText = await this.translateText(text, this.settings.language);
            
            if (translatedText) {
                await chrome.tabs.sendMessage(tabId, {
                    action: 'SPEAK_SELECTION',
                    data: { text: translatedText }
                });
            } else {
                throw new Error('Translation failed');
            }
        } catch (error) {
            console.error('Failed to translate and speak:', error);
            this.showError(tabId, 'Translation feature coming soon');
        }
    }

    async handleVoiceSettings(tabId) {
        try {
            // Show voice settings overlay
            await chrome.tabs.sendMessage(tabId, {
                action: 'SHOW_VOICE_SETTINGS'
            });
        } catch (error) {
            console.error('Failed to show voice settings:', error);
            this.handleOpenOptions();
        }
    }

    async handleOpenOptions() {
        try {
            await chrome.runtime.openOptionsPage();
        } catch (error) {
            console.error('Failed to open options page:', error);
            // Fallback: open in new tab
            chrome.tabs.create({ 
                url: chrome.runtime.getURL('options/options.html') 
            });
        }
    }

    async translateText(text, targetLanguage) {
        // Placeholder for translation functionality
        // In a real implementation, you would integrate with:
        // - Google Translate API
        // - Microsoft Translator
        // - DeepL API
        // - Or include a translation AI model
        
        console.log('Translation requested:', { text, targetLanguage });
        return null; // Not implemented yet
    }

    async showError(tabId, message) {
        try {
            await chrome.tabs.sendMessage(tabId, {
                action: 'SHOW_ERROR',
                data: { message }
            });
        } catch (error) {
            console.error('Failed to show error message:', error);
        }
    }

    async trackMenuUsage(menuItemId) {
        try {
            await chrome.runtime.sendMessage({
                action: 'TRACK_USAGE',
                data: { 
                    type: 'context_menu',
                    action: menuItemId,
                    timestamp: Date.now()
                }
            });
        } catch (error) {
            console.error('Failed to track menu usage:', error);
        }
    }

    async handleSettingsChange(changes, namespace) {
        if (namespace !== 'sync') return;
        
        const relevantChanges = [
            'language',
            'enableContextMenu',
            'showContextMenuIcons'
        ];
        
        const hasRelevantChanges = relevantChanges.some(key => 
            Object.prototype.hasOwnProperty.call(changes, key)
        );
        
        if (hasRelevantChanges) {
            console.log('Context menu settings changed, recreating menus');
            await this.loadSettings();
            await this.createContextMenus();
        }
    }

    async updateMenuLanguage(newLanguage) {
        this.settings.language = newLanguage;
        await this.createContextMenus();
    }

    async enableContextMenu(enabled) {
        this.settings.enableContextMenu = enabled;
        
        if (enabled) {
            await this.createContextMenus();
        } else {
            await chrome.contextMenus.removeAll();
            this.menuItems.clear();
        }
    }

    async toggleMenuIcons(showIcons) {
        this.settings.showContextMenuIcons = showIcons;
        await this.createContextMenus();
    }

    getMenuItems() {
        return Array.from(this.menuItems.values());
    }

    isEnabled() {
        return this.settings.enableContextMenu;
    }

    async destroy() {
        try {
            await chrome.contextMenus.removeAll();
            this.menuItems.clear();
            this.isInitialized = false;
            console.log('Context Menu Manager destroyed');
        } catch (error) {
            console.error('Failed to destroy Context Menu Manager:', error);
        }
    }
}