/**
 * Options Page Script for Intelligent TTS Extension
 * Handles advanced settings and configuration management
 */

class OptionsManager {
    constructor() {
        this.settings = {};
        this.isInitialized = false;
        this.unsavedChanges = false;
        
        this.initialize();
    }

    async initialize() {
        try {
            await this.loadSettings();
            this.setupEventListeners();
            this.updateUI();
            this.setupTabNavigation();
            
            this.isInitialized = true;
            console.log('Options page initialized');
        } catch (error) {
            console.error('Failed to initialize options page:', error);
        }
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
            this.settings = this.getDefaultSettings();
        }
    }

    getDefaultSettings() {
        return {
            language: 'en-US',
            voice: null,
            rate: 1.0,
            pitch: 1.0,
            volume: 1.0,
            aiProvider: 'groq',
            explanationComplexity: 'simple',
            explanationContext: 'general',
            showOverlay: true,
            overlayPosition: 'smart',
            theme: 'auto',
            enableKeyboardShortcuts: true,
            contextMenu: true,
            animations: true,
            showShortcuts: true,
            cacheExplanations: true,
            dataCollection: false,
            crashReporting: true,
            apiTimeout: 10000,
            maxTextLength: 5000,
            autoExplain: false,
            highContrast: false,
            largeText: false,
            screenReaderSupport: true,
            debugMode: false,
            preloadVoices: true
        };
    }

    setupEventListeners() {
        // Save and reset buttons
        document.getElementById('save-btn').addEventListener('click', () => this.saveSettings());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetSettings());

        // Form changes tracking
        document.addEventListener('change', (e) => {
            if (e.target.matches('input, select, textarea')) {
                this.markUnsavedChanges();
            }
        });

        // Special button actions
        document.getElementById('clear-cache-btn').addEventListener('click', () => this.clearCache());
        document.getElementById('clear-stats-btn').addEventListener('click', () => this.clearStats());
        document.getElementById('export-btn').addEventListener('click', () => this.exportSettings());
        document.getElementById('import-btn').addEventListener('click', () => this.importSettings());
        document.getElementById('import-file').addEventListener('change', (e) => this.handleFileImport(e));

        // Slider value updates
        this.setupSliderUpdates();

        // Before unload warning
        window.addEventListener('beforeunload', (e) => {
            if (this.unsavedChanges) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            }
        });
    }

    setupSliderUpdates() {
        const sliders = [
            { id: 'rate', valueId: 'rate-value', suffix: 'x', decimals: 1 },
            { id: 'pitch', valueId: 'pitch-value', suffix: '', decimals: 1 },
            { id: 'volume', valueId: 'volume-value', suffix: '%', decimals: 0, multiplier: 100 }
        ];

        sliders.forEach(({ id, valueId, suffix, decimals, multiplier = 1 }) => {
            const slider = document.getElementById(id);
            const valueDisplay = document.getElementById(valueId);

            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value) * multiplier;
                valueDisplay.textContent = value.toFixed(decimals) + suffix;
            });
        });
    }

    setupTabNavigation() {
        const tabs = document.querySelectorAll('.nav-tab');
        const contents = document.querySelectorAll('.tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;

                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update active content
                contents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === `${targetTab}-tab`) {
                        content.classList.add('active');
                    }
                });
            });
        });
    }

    updateUI() {
        // Voice settings
        document.getElementById('language').value = this.settings.language || 'en-US';
        document.getElementById('rate').value = this.settings.rate || 1.0;
        document.getElementById('rate-value').textContent = (this.settings.rate || 1.0).toFixed(1) + 'x';
        document.getElementById('pitch').value = this.settings.pitch || 1.0;
        document.getElementById('pitch-value').textContent = (this.settings.pitch || 1.0).toFixed(1);
        document.getElementById('volume').value = this.settings.volume || 1.0;
        document.getElementById('volume-value').textContent = Math.round((this.settings.volume || 1.0) * 100) + '%';
        document.getElementById('max-text-length').value = this.settings.maxTextLength || 5000;
        document.getElementById('preload-voices').checked = this.settings.preloadVoices !== false;

        // AI settings
        document.getElementById('ai-provider').value = this.settings.aiProvider || 'groq';
        document.getElementById('complexity').value = this.settings.explanationComplexity || 'simple';
        document.getElementById('context').value = this.settings.explanationContext || 'general';
        document.getElementById('cache-explanations').checked = this.settings.cacheExplanations !== false;

        // Interface settings
        document.getElementById('show-overlay').checked = this.settings.showOverlay !== false;
        document.getElementById('overlay-position').value = this.settings.overlayPosition || 'smart';
        document.getElementById('theme').value = this.settings.theme || 'auto';
        document.getElementById('keyboard-shortcuts').checked = this.settings.enableKeyboardShortcuts !== false;
        document.getElementById('context-menu').checked = this.settings.contextMenu !== false;
        document.getElementById('animations').checked = this.settings.animations !== false;
        document.getElementById('show-shortcuts').checked = this.settings.showShortcuts !== false;

        // Privacy settings
        document.getElementById('data-collection').checked = this.settings.dataCollection === true;
        document.getElementById('crash-reporting').checked = this.settings.crashReporting !== false;

        // Advanced settings
        document.getElementById('api-timeout').value = this.settings.apiTimeout || 10000;
        document.getElementById('auto-explain').checked = this.settings.autoExplain === true;
        document.getElementById('high-contrast').checked = this.settings.highContrast === true;
        document.getElementById('large-text').checked = this.settings.largeText === true;
        document.getElementById('screen-reader').checked = this.settings.screenReaderSupport !== false;
        document.getElementById('debug-mode').checked = this.settings.debugMode === true;

        // Extension info
        this.updateExtensionInfo();
        
        // Load voices
        this.loadVoices();
    }

    updateExtensionInfo() {
        const manifest = chrome.runtime.getManifest();
        document.getElementById('version-info').textContent = manifest.version;
        document.getElementById('build-info').textContent = 'Production';
        document.getElementById('browser-info').textContent = this.getBrowserName();
    }

    getBrowserName() {
        const userAgent = navigator.userAgent;
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        return 'Unknown';
    }

    async loadVoices() {
        // This would ideally load voices from the background script
        // For now, we'll show a placeholder
        const voiceSelect = document.getElementById('voice');
        voiceSelect.innerHTML = '<option value="">Default System Voice</option>';
    }

    collectFormData() {
        return {
            // Voice settings
            language: document.getElementById('language').value,
            rate: parseFloat(document.getElementById('rate').value),
            pitch: parseFloat(document.getElementById('pitch').value),
            volume: parseFloat(document.getElementById('volume').value),
            maxTextLength: parseInt(document.getElementById('max-text-length').value),
            preloadVoices: document.getElementById('preload-voices').checked,

            // AI settings
            aiProvider: document.getElementById('ai-provider').value,
            explanationComplexity: document.getElementById('complexity').value,
            explanationContext: document.getElementById('context').value,
            cacheExplanations: document.getElementById('cache-explanations').checked,

            // Interface settings
            showOverlay: document.getElementById('show-overlay').checked,
            overlayPosition: document.getElementById('overlay-position').value,
            theme: document.getElementById('theme').value,
            enableKeyboardShortcuts: document.getElementById('keyboard-shortcuts').checked,
            contextMenu: document.getElementById('context-menu').checked,
            animations: document.getElementById('animations').checked,
            showShortcuts: document.getElementById('show-shortcuts').checked,

            // Privacy settings
            dataCollection: document.getElementById('data-collection').checked,
            crashReporting: document.getElementById('crash-reporting').checked,

            // Advanced settings
            apiTimeout: parseInt(document.getElementById('api-timeout').value),
            autoExplain: document.getElementById('auto-explain').checked,
            highContrast: document.getElementById('high-contrast').checked,
            largeText: document.getElementById('large-text').checked,
            screenReaderSupport: document.getElementById('screen-reader').checked,
            debugMode: document.getElementById('debug-mode').checked
        };
    }

    async saveSettings() {
        try {
            const newSettings = this.collectFormData();
            
            const response = await chrome.runtime.sendMessage({
                action: 'UPDATE_SETTINGS',
                data: { settings: newSettings }
            });

            if (response.success) {
                this.settings = { ...this.settings, ...newSettings };
                this.unsavedChanges = false;
                this.showToast('Settings saved successfully', 'success');
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
            this.showToast('Failed to save settings', 'error');
        }
    }

    async resetSettings() {
        if (!confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
            return;
        }

        try {
            const response = await chrome.runtime.sendMessage({ action: 'RESET_SETTINGS' });
            
            if (response.success) {
                this.settings = this.getDefaultSettings();
                this.updateUI();
                this.unsavedChanges = false;
                this.showToast('Settings reset to defaults', 'success');
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('Failed to reset settings:', error);
            this.showToast('Failed to reset settings', 'error');
        }
    }

    async clearCache() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'CLEAR_CACHE' });
            if (response.success) {
                this.showToast('Cache cleared successfully', 'success');
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('Failed to clear cache:', error);
            this.showToast('Failed to clear cache', 'error');
        }
    }

    async clearStats() {
        if (!confirm('Are you sure you want to clear all usage statistics?')) {
            return;
        }

        try {
            const response = await chrome.runtime.sendMessage({ action: 'CLEAR_STATS' });
            if (response.success) {
                this.showToast('Statistics cleared successfully', 'success');
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('Failed to clear stats:', error);
            this.showToast('Failed to clear statistics', 'error');
        }
    }

    async exportSettings() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'EXPORT_SETTINGS' });
            
            if (response.success) {
                const dataStr = JSON.stringify(response.data, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'tts-extension-settings.json';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                
                this.showToast('Settings exported successfully', 'success');
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('Failed to export settings:', error);
            this.showToast('Failed to export settings', 'error');
        }
    }

    importSettings() {
        document.getElementById('import-file').click();
    }

    async handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const importData = JSON.parse(text);
            
            const response = await chrome.runtime.sendMessage({
                action: 'IMPORT_SETTINGS',
                data: importData
            });

            if (response.success) {
                await this.loadSettings();
                this.updateUI();
                this.unsavedChanges = false;
                this.showToast('Settings imported successfully', 'success');
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('Failed to import settings:', error);
            this.showToast('Failed to import settings. Please check the file format.', 'error');
        }

        // Reset file input
        event.target.value = '';
    }

    markUnsavedChanges() {
        this.unsavedChanges = true;
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Auto-remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => container.removeChild(toast), 300);
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new OptionsManager();
});