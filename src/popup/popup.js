/**
 * Popup Script for Intelligent TTS Extension
 * Handles popup UI interactions and settings management
 */

class PopupManager {
    constructor() {
        this.settings = {};
        this.currentTab = null;
        this.voices = [];
        this.usageStats = {};
        this.isInitialized = false;
        
        // UI element references
        this.elements = {};
        
        this.initialize();
    }

    async initialize() {
        try {
            // Get current tab
            await this.getCurrentTab();
            
            // Initialize UI elements
            this.initializeElements();
            
            // Load current settings
            await this.loadSettings();
            
            // Load voices
            await this.loadVoices();
            
            // Load usage stats
            await this.loadUsageStats();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Update UI
            this.updateUI();
            
            // Check extension status
            await this.checkExtensionStatus();
            
            this.isInitialized = true;
            console.log('Popup initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize popup:', error);
            this.showError('Failed to initialize extension popup');
        }
    }

    initializeElements() {
        // Cache DOM elements
        this.elements = {
            // Status
            statusDot: document.getElementById('status-dot'),
            statusIndicator: document.getElementById('status-indicator'),
            
            // Actions
            btnReadPage: document.getElementById('btn-read-page'),
            btnStopSpeech: document.getElementById('btn-stop-speech'),
            
            // Voice settings
            languageSelect: document.getElementById('language-select'),
            voiceSelect: document.getElementById('voice-select'),
            rateSlider: document.getElementById('rate-slider'),
            rateValue: document.getElementById('rate-value'),
            pitchSlider: document.getElementById('pitch-slider'),
            pitchValue: document.getElementById('pitch-value'),
            volumeSlider: document.getElementById('volume-slider'),
            volumeValue: document.getElementById('volume-value'),
            
            // AI settings
            aiProviderSelect: document.getElementById('ai-provider-select'),
            complexitySelect: document.getElementById('complexity-select'),
            cacheExplanations: document.getElementById('cache-explanations'),
            
            // Quick settings
            showOverlay: document.getElementById('show-overlay'),
            keyboardShortcuts: document.getElementById('keyboard-shortcuts'),
            contextMenu: document.getElementById('context-menu'),
            
            // Stats
            textsRead: document.getElementById('texts-read'),
            explanationsRequested: document.getElementById('explanations-requested'),
            timeSaved: document.getElementById('time-saved'),
            
            // Footer
            btnOptions: document.getElementById('btn-options'),
            btnHelp: document.getElementById('btn-help'),
            version: document.getElementById('version'),
            
            // States
            loadingState: document.getElementById('loading-state'),
            errorState: document.getElementById('error-state'),
            errorMessage: document.getElementById('error-message'),
            retryBtn: document.getElementById('retry-btn'),
            
            // Test area
            testText: document.getElementById('test-text'),
            btnTestSpeak: document.getElementById('btn-test-speak'),
            btnTestStop: document.getElementById('btn-test-stop')
        };
    }

    async getCurrentTab() {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        this.currentTab = tabs[0];
    }

    async loadSettings() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'GET_SETTINGS' });
            if (response.success) {
                this.settings = response.data;
            } else {
                throw new Error(response.error);
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
                aiProvider: 'groq',
                explanationComplexity: 'simple',
                showOverlay: true,
                enableKeyboardShortcuts: true,
                contextMenu: true,
                cacheExplanations: true
            };
        }
    }

    async loadVoices() {
        try {
            // Get voices from content script since speechSynthesis is not available in popup
            const response = await chrome.tabs.sendMessage(this.currentTab.id, {
                action: 'GET_VOICES'
            });
            
            if (response && response.success) {
                this.voices = response.data;
                this.populateVoiceSelect();
            } else {
                // Fallback: inject content script and try again
                await this.injectContentScript();
                setTimeout(() => this.loadVoices(), 500);
            }
        } catch (error) {
            console.error('Failed to load voices:', error);
            this.elements.voiceSelect.innerHTML = '<option value="">No voices available</option>';
        }
    }

    async loadUsageStats() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'GET_USAGE_STATS' });
            if (response.success) {
                this.usageStats = response.data;
            }
        } catch (error) {
            console.error('Failed to load usage stats:', error);
            this.usageStats = {
                textsRead: 0,
                explanationsRequested: 0,
                timeSaved: 0
            };
        }
    }

    setupEventListeners() {
        // Action buttons
        this.elements.btnReadPage.addEventListener('click', () => this.handleReadPage());
        this.elements.btnStopSpeech.addEventListener('click', () => this.handleStopSpeech());
        
        // Voice settings
        this.elements.languageSelect.addEventListener('change', (e) => this.handleLanguageChange(e.target.value));
        this.elements.voiceSelect.addEventListener('change', (e) => this.handleVoiceChange(e.target.value));
        
        // Sliders
        this.elements.rateSlider.addEventListener('input', (e) => this.handleRateChange(e.target.value));
        this.elements.pitchSlider.addEventListener('input', (e) => this.handlePitchChange(e.target.value));
        this.elements.volumeSlider.addEventListener('input', (e) => this.handleVolumeChange(e.target.value));
        
        // AI settings
        this.elements.aiProviderSelect.addEventListener('change', (e) => this.handleAIProviderChange(e.target.value));
        this.elements.complexitySelect.addEventListener('change', (e) => this.handleComplexityChange(e.target.value));
        this.elements.cacheExplanations.addEventListener('change', (e) => this.handleCacheExplanationsChange(e.target.checked));
        
        // Quick settings
        this.elements.showOverlay.addEventListener('change', (e) => this.handleShowOverlayChange(e.target.checked));
        this.elements.keyboardShortcuts.addEventListener('change', (e) => this.handleKeyboardShortcutsChange(e.target.checked));
        this.elements.contextMenu.addEventListener('change', (e) => this.handleContextMenuChange(e.target.checked));
        
        // Footer buttons
        this.elements.btnOptions.addEventListener('click', () => this.openOptionsPage());
        this.elements.btnHelp.addEventListener('click', () => this.openHelpPage());
        
        // Error handling
        this.elements.retryBtn.addEventListener('click', () => this.initialize());
        
        // Test functionality
        if (this.elements.btnTestSpeak) {
            this.elements.btnTestSpeak.addEventListener('click', () => this.handleTestSpeak());
            this.elements.btnTestStop.addEventListener('click', () => this.handleTestStop());
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    updateUI() {
        // Update voice settings
        this.elements.languageSelect.value = this.settings.language || 'en-US';
        this.elements.rateSlider.value = this.settings.rate || 1.0;
        this.elements.rateValue.textContent = (this.settings.rate || 1.0).toFixed(1);
        this.elements.pitchSlider.value = this.settings.pitch || 1.0;
        this.elements.pitchValue.textContent = (this.settings.pitch || 1.0).toFixed(1);
        this.elements.volumeSlider.value = this.settings.volume || 1.0;
        this.elements.volumeValue.textContent = Math.round((this.settings.volume || 1.0) * 100);
        
        // Update AI settings
        this.elements.aiProviderSelect.value = this.settings.aiProvider || 'groq';
        this.elements.complexitySelect.value = this.settings.explanationComplexity || 'simple';
        this.elements.cacheExplanations.checked = this.settings.cacheExplanations !== false;
        
        // Update quick settings
        this.elements.showOverlay.checked = this.settings.showOverlay !== false;
        this.elements.keyboardShortcuts.checked = this.settings.enableKeyboardShortcuts !== false;
        this.elements.contextMenu.checked = this.settings.contextMenu !== false;
        
        // Update usage stats
        this.elements.textsRead.textContent = this.usageStats.textsRead || 0;
        this.elements.explanationsRequested.textContent = this.usageStats.explanationsRequested || 0;
        this.elements.timeSaved.textContent = Math.round(this.usageStats.timeSaved || 0);
        
        // Update version
        this.elements.version.textContent = chrome.runtime.getManifest().version;
    }

    populateVoiceSelect() {
        const voiceSelect = this.elements.voiceSelect;
        voiceSelect.innerHTML = '<option value="">Default Voice</option>';
        
        // Group voices by language
        const voicesByLang = {};
        this.voices.forEach(voice => {
            const lang = voice.lang.split('-')[0];
            if (!voicesByLang[lang]) {
                voicesByLang[lang] = [];
            }
            voicesByLang[lang].push(voice);
        });
        
        // Add voices to select
        Object.keys(voicesByLang).sort().forEach(lang => {
            const optGroup = document.createElement('optgroup');
            optGroup.label = this.getLanguageName(lang);
            
            voicesByLang[lang].forEach(voice => {
                const option = document.createElement('option');
                option.value = voice.voiceURI || voice.name;
                option.textContent = `${voice.name} ${voice.localService ? '(Local)' : '(Online)'}`;
                optGroup.appendChild(option);
            });
            
            voiceSelect.appendChild(optGroup);
        });
        
        // Set current voice
        if (this.settings.voice) {
            voiceSelect.value = this.settings.voice.voiceURI || this.settings.voice.name || '';
        }
    }

    getLanguageName(code) {
        const names = {
            'en': 'English',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese',
            'ru': 'Russian',
            'zh': 'Chinese',
            'ja': 'Japanese',
            'ko': 'Korean',
            'ar': 'Arabic',
            'hi': 'Hindi',
            'ur': 'Urdu'
        };
        return names[code] || code.toUpperCase();
    }

    async injectContentScript() {
        try {
            await chrome.scripting.executeScript({
                target: { tabId: this.currentTab.id },
                files: ['content/content-script.js']
            });
        } catch (error) {
            console.error('Failed to inject content script:', error);
        }
    }

    async checkExtensionStatus() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'HEALTH_CHECK' });
            
            if (response && response.success) {
                this.setStatus('healthy');
            } else {
                this.setStatus('warning');
            }
        } catch (error) {
            console.error('Health check failed:', error);
            this.setStatus('error');
        }
    }

    setStatus(status) {
        const statusClasses = {
            healthy: 'status-healthy',
            warning: 'status-warning',
            error: 'status-error'
        };
        
        // Remove all status classes
        Object.values(statusClasses).forEach(cls => {
            this.elements.statusDot.classList.remove(cls);
        });
        
        // Add current status class
        if (statusClasses[status]) {
            this.elements.statusDot.classList.add(statusClasses[status]);
        }
    }

    // Event Handlers
    async handleReadPage() {
        try {
            // First try to speak selected text
            const response = await chrome.tabs.sendMessage(this.currentTab.id, {
                action: 'SPEAK_CURRENT_SELECTION'
            });
            
            if (!response || !response.success) {
                // If no selection, read page title or first paragraph
                await chrome.tabs.sendMessage(this.currentTab.id, {
                    action: 'SPEAK_PAGE_CONTENT'
                });
            }
            
            this.elements.btnStopSpeech.disabled = false;
            window.close(); // Close popup after action
            
        } catch (error) {
            console.error('Failed to read page:', error);
            this.showError('Failed to read page content');
        }
    }

    async handleStopSpeech() {
        try {
            await chrome.tabs.sendMessage(this.currentTab.id, {
                action: 'STOP_SPEECH'
            });
            
            this.elements.btnStopSpeech.disabled = true;
            
        } catch (error) {
            console.error('Failed to stop speech:', error);
        }
    }

    async handleLanguageChange(language) {
        this.settings.language = language;
        await this.updateSettings({ language });
        
        // Reload voices for new language
        await this.loadVoices();
    }

    async handleVoiceChange(voiceId) {
        const voice = this.voices.find(v => v.voiceURI === voiceId || v.name === voiceId);
        this.settings.voice = voice;
        await this.updateSettings({ voice: voiceId });
    }

    async handleRateChange(rate) {
        const numRate = parseFloat(rate);
        this.settings.rate = numRate;
        this.elements.rateValue.textContent = numRate.toFixed(1);
        await this.updateSettings({ rate: numRate });
    }

    async handlePitchChange(pitch) {
        const numPitch = parseFloat(pitch);
        this.settings.pitch = numPitch;
        this.elements.pitchValue.textContent = numPitch.toFixed(1);
        await this.updateSettings({ pitch: numPitch });
    }

    async handleVolumeChange(volume) {
        const numVolume = parseFloat(volume);
        this.settings.volume = numVolume;
        this.elements.volumeValue.textContent = Math.round(numVolume * 100);
        await this.updateSettings({ volume: numVolume });
    }

    async handleAIProviderChange(provider) {
        this.settings.aiProvider = provider;
        await this.updateSettings({ aiProvider: provider });
    }

    async handleComplexityChange(complexity) {
        this.settings.explanationComplexity = complexity;
        await this.updateSettings({ explanationComplexity: complexity });
    }

    async handleCacheExplanationsChange(enabled) {
        this.settings.cacheExplanations = enabled;
        await this.updateSettings({ cacheExplanations: enabled });
    }

    async handleShowOverlayChange(enabled) {
        this.settings.showOverlay = enabled;
        await this.updateSettings({ showOverlay: enabled });
    }

    async handleKeyboardShortcutsChange(enabled) {
        this.settings.enableKeyboardShortcuts = enabled;
        await this.updateSettings({ enableKeyboardShortcuts: enabled });
    }

    async handleContextMenuChange(enabled) {
        this.settings.contextMenu = enabled;
        await this.updateSettings({ contextMenu: enabled });
    }

    async handleTestSpeak() {
        const text = this.elements.testText.value.trim();
        if (!text) return;
        
        try {
            await chrome.tabs.sendMessage(this.currentTab.id, {
                action: 'SPEAK_TEXT',
                data: { text }
            });
        } catch (error) {
            console.error('Failed to test speak:', error);
            this.showError('Failed to test speech');
        }
    }

    async handleTestStop() {
        try {
            await chrome.tabs.sendMessage(this.currentTab.id, {
                action: 'STOP_SPEECH'
            });
        } catch (error) {
            console.error('Failed to stop test speech:', error);
        }
    }

    handleKeyboardShortcuts(event) {
        // Handle popup keyboard shortcuts
        if (event.ctrlKey && event.altKey) {
            switch (event.key) {
                case 'r':
                    event.preventDefault();
                    this.handleReadPage();
                    break;
                case 's':
                    event.preventDefault();
                    this.handleStopSpeech();
                    break;
                case 'o':
                    event.preventDefault();
                    this.openOptionsPage();
                    break;
            }
        }
        
        // Escape key closes popup
        if (event.key === 'Escape') {
            window.close();
        }
    }

    async updateSettings(newSettings) {
        try {
            const response = await chrome.runtime.sendMessage({
                action: 'UPDATE_SETTINGS',
                data: { settings: newSettings }
            });
            
            if (!response.success) {
                throw new Error(response.error);
            }
            
        } catch (error) {
            console.error('Failed to update settings:', error);
            this.showError('Failed to save settings');
        }
    }

    async openOptionsPage() {
        try {
            await chrome.runtime.openOptionsPage();
            window.close();
        } catch (error) {
            console.error('Failed to open options page:', error);
            chrome.tabs.create({ 
                url: chrome.runtime.getURL('options/options.html') 
            });
            window.close();
        }
    }

    openHelpPage() {
        const helpUrl = 'https://github.com/azfarhussain-10p/textToSpeachExt#readme';
        chrome.tabs.create({ url: helpUrl });
        window.close();
    }

    showError(message) {
        this.elements.errorMessage.textContent = message;
        this.elements.errorState.style.display = 'block';
        this.elements.loadingState.style.display = 'none';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.elements.errorState.style.display = 'none';
        }, 5000);
    }

    showLoading() {
        this.elements.loadingState.style.display = 'block';
        this.elements.errorState.style.display = 'none';
    }

    hideLoading() {
        this.elements.loadingState.style.display = 'none';
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PopupManager();
});