/**
 * Storage Manager for Intelligent TTS Extension
 * Handles all extension settings and data persistence
 */

export class StorageManager {
    constructor() {
        this.isInitialized = false;
        this.defaultSettings = {
            // TTS Settings
            language: 'en-US',
            voice: null,
            rate: 1.0,
            pitch: 1.0,
            volume: 1.0,
            
            // UI Settings
            showOverlay: true,
            overlayPosition: 'smart', // 'smart', 'top', 'bottom', 'cursor'
            theme: 'auto', // 'light', 'dark', 'auto'
            animations: true,
            showShortcuts: true,
            
            // AI Settings
            aiProvider: 'groq', // 'groq' or 'claude'
            explanationComplexity: 'simple', // 'simple', 'detailed', 'technical'
            explanationContext: 'general', // 'general', 'academic', 'business'
            autoExplain: false,
            
            // Privacy Settings
            dataCollection: false,
            analytics: false,
            crashReporting: true,
            
            // Accessibility Settings
            enableKeyboardShortcuts: true,
            highContrast: false,
            largeText: false,
            screenReaderSupport: true,
            
            // Advanced Settings
            maxTextLength: 5000,
            apiTimeout: 10000,
            cacheExplanations: true,
            preloadVoices: true,
            
            // First-time setup
            onboardingComplete: false,
            version: '1.0.0'
        };
        
        this.currentSettings = { ...this.defaultSettings };
        this.settingsListeners = new Set();
    }

    async initialize() {
        try {
            await this.loadSettings();
            await this.performMigrations();
            this.isInitialized = true;
            console.log('Storage Manager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Storage Manager:', error);
            throw error;
        }
    }

    async loadSettings() {
        try {
            const stored = await chrome.storage.sync.get(null);
            
            // Merge with defaults, preferring stored values
            this.currentSettings = {
                ...this.defaultSettings,
                ...stored
            };
            
            // Validate settings
            this.validateSettings();
            
            console.log('Settings loaded:', this.currentSettings);
        } catch (error) {
            console.error('Failed to load settings:', error);
            // Use defaults if loading fails
            this.currentSettings = { ...this.defaultSettings };
        }
    }

    async setDefaultSettings() {
        try {
            await chrome.storage.sync.set(this.defaultSettings);
            this.currentSettings = { ...this.defaultSettings };
            console.log('Default settings applied');
        } catch (error) {
            console.error('Failed to set default settings:', error);
            throw error;
        }
    }

    async updateSettings(newSettings) {
        try {
            // Validate new settings
            const validatedSettings = this.validatePartialSettings(newSettings);
            
            // Update current settings
            this.currentSettings = { ...this.currentSettings, ...validatedSettings };
            
            // Save to storage
            await chrome.storage.sync.set(validatedSettings);
            
            // Notify listeners
            this.notifySettingsChange(validatedSettings);
            
            console.log('Settings updated:', validatedSettings);
        } catch (error) {
            console.error('Failed to update settings:', error);
            throw error;
        }
    }

    async getSetting(key) {
        if (!this.isInitialized) {
            await this.loadSettings();
        }
        return this.currentSettings[key];
    }

    async getSettings() {
        if (!this.isInitialized) {
            await this.loadSettings();
        }
        return { ...this.currentSettings };
    }

    async resetSettings() {
        try {
            await chrome.storage.sync.clear();
            await this.setDefaultSettings();
            this.notifySettingsChange(this.currentSettings, true);
            console.log('Settings reset to defaults');
        } catch (error) {
            console.error('Failed to reset settings:', error);
            throw error;
        }
    }

    // API Keys Management (stored separately for security)
    async setApiKey(provider, key) {
        try {
            const keyName = `${provider}ApiKey`;
            await chrome.storage.sync.set({ [keyName]: key });
            console.log(`${provider} API key updated`);
        } catch (error) {
            console.error(`Failed to set ${provider} API key:`, error);
            throw error;
        }
    }

    async getApiKey(provider) {
        try {
            const keyName = `${provider}ApiKey`;
            const result = await chrome.storage.sync.get([keyName]);
            return result[keyName] || null;
        } catch (error) {
            console.error(`Failed to get ${provider} API key:`, error);
            return null;
        }
    }

    async removeApiKey(provider) {
        try {
            const keyName = `${provider}ApiKey`;
            await chrome.storage.sync.remove([keyName]);
            console.log(`${provider} API key removed`);
        } catch (error) {
            console.error(`Failed to remove ${provider} API key:`, error);
            throw error;
        }
    }

    // Usage Statistics (local storage for privacy)
    async incrementUsageStat(statName) {
        try {
            const result = await chrome.storage.local.get(['usageStats']);
            const stats = result.usageStats || {};
            
            stats[statName] = (stats[statName] || 0) + 1;
            stats.lastUsed = Date.now();
            
            await chrome.storage.local.set({ usageStats: stats });
        } catch (error) {
            console.error('Failed to update usage stats:', error);
        }
    }

    async getUsageStats() {
        try {
            const result = await chrome.storage.local.get(['usageStats']);
            return result.usageStats || {};
        } catch (error) {
            console.error('Failed to get usage stats:', error);
            return {};
        }
    }

    async clearUsageStats() {
        try {
            await chrome.storage.local.remove(['usageStats']);
        } catch (error) {
            console.error('Failed to clear usage stats:', error);
        }
    }

    // Cache Management
    async cacheExplanation(text, explanation, provider) {
        if (!this.currentSettings.cacheExplanations) return;
        
        try {
            const cacheKey = this.generateCacheKey(text);
            const cacheData = {
                explanation,
                provider,
                timestamp: Date.now(),
                language: this.currentSettings.language
            };
            
            const result = await chrome.storage.local.get(['explanationCache']);
            const cache = result.explanationCache || {};
            
            // Limit cache size (keep last 100 entries)
            const entries = Object.entries(cache);
            if (entries.length >= 100) {
                // Remove oldest entries
                entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
                const toRemove = entries.slice(0, entries.length - 99);
                toRemove.forEach(([key]) => delete cache[key]);
            }
            
            cache[cacheKey] = cacheData;
            await chrome.storage.local.set({ explanationCache: cache });
        } catch (error) {
            console.error('Failed to cache explanation:', error);
        }
    }

    async getCachedExplanation(text) {
        if (!this.currentSettings.cacheExplanations) return null;
        
        try {
            const cacheKey = this.generateCacheKey(text);
            const result = await chrome.storage.local.get(['explanationCache']);
            const cache = result.explanationCache || {};
            
            const cached = cache[cacheKey];
            if (cached && cached.language === this.currentSettings.language) {
                // Check if cache is still valid (24 hours)
                const isValid = (Date.now() - cached.timestamp) < 86400000;
                if (isValid) {
                    return cached;
                }
            }
            
            return null;
        } catch (error) {
            console.error('Failed to get cached explanation:', error);
            return null;
        }
    }

    async clearExplanationCache() {
        try {
            await chrome.storage.local.remove(['explanationCache']);
        } catch (error) {
            console.error('Failed to clear explanation cache:', error);
        }
    }

    // Settings validation
    validateSettings() {
        // Validate TTS settings
        if (typeof this.currentSettings.rate !== 'number' || this.currentSettings.rate < 0.1 || this.currentSettings.rate > 10) {
            this.currentSettings.rate = 1.0;
        }
        
        if (typeof this.currentSettings.pitch !== 'number' || this.currentSettings.pitch < 0 || this.currentSettings.pitch > 2) {
            this.currentSettings.pitch = 1.0;
        }
        
        if (typeof this.currentSettings.volume !== 'number' || this.currentSettings.volume < 0 || this.currentSettings.volume > 1) {
            this.currentSettings.volume = 1.0;
        }
        
        // Validate string settings
        const validProviders = ['groq', 'claude'];
        if (!validProviders.includes(this.currentSettings.aiProvider)) {
            this.currentSettings.aiProvider = 'groq';
        }
        
        const validComplexity = ['simple', 'detailed', 'technical'];
        if (!validComplexity.includes(this.currentSettings.explanationComplexity)) {
            this.currentSettings.explanationComplexity = 'simple';
        }
        
        const validContext = ['general', 'academic', 'business'];
        if (!validContext.includes(this.currentSettings.explanationContext)) {
            this.currentSettings.explanationContext = 'general';
        }
        
        const validPositions = ['smart', 'top', 'bottom', 'cursor'];
        if (!validPositions.includes(this.currentSettings.overlayPosition)) {
            this.currentSettings.overlayPosition = 'smart';
        }
        
        const validThemes = ['light', 'dark', 'auto'];
        if (!validThemes.includes(this.currentSettings.theme)) {
            this.currentSettings.theme = 'auto';
        }
        
        // Validate numbers with limits
        if (typeof this.currentSettings.maxTextLength !== 'number' || this.currentSettings.maxTextLength < 100 || this.currentSettings.maxTextLength > 50000) {
            this.currentSettings.maxTextLength = 5000;
        }
        
        if (typeof this.currentSettings.apiTimeout !== 'number' || this.currentSettings.apiTimeout < 1000 || this.currentSettings.apiTimeout > 60000) {
            this.currentSettings.apiTimeout = 10000;
        }
    }

    validatePartialSettings(settings) {
        const validated = {};
        
        for (const [key, value] of Object.entries(settings)) {
            if (Object.prototype.hasOwnProperty.call(this.defaultSettings, key)) {
                validated[key] = value;
            }
        }
        
        return validated;
    }

    // Migration handling for version updates
    async performMigrations() {
        const currentVersion = this.currentSettings.version;
        const targetVersion = this.defaultSettings.version;
        
        if (currentVersion !== targetVersion) {
            console.log(`Migrating settings from ${currentVersion} to ${targetVersion}`);
            
            // Perform any necessary migrations here
            // For now, just update the version
            await this.updateSettings({ version: targetVersion });
        }
    }

    // Settings change listeners
    addSettingsListener(callback) {
        this.settingsListeners.add(callback);
    }

    removeSettingsListener(callback) {
        this.settingsListeners.delete(callback);
    }

    notifySettingsChange(changedSettings, isReset = false) {
        this.settingsListeners.forEach(callback => {
            try {
                callback(changedSettings, this.currentSettings, isReset);
            } catch (error) {
                console.error('Error in settings change listener:', error);
            }
        });
    }

    // Utility methods
    generateCacheKey(text) {
        // Simple hash function for cache keys
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString();
    }

    // Import/Export settings
    async exportSettings() {
        try {
            const settings = await this.getSettings();
            // Remove sensitive data
            const { groqApiKey, claudeApiKey, ...exportableSettings } = settings;
            
            return {
                version: '1.0',
                timestamp: Date.now(),
                settings: exportableSettings
            };
        } catch (error) {
            console.error('Failed to export settings:', error);
            throw error;
        }
    }

    async importSettings(importData) {
        try {
            if (!importData.settings || importData.version !== '1.0') {
                throw new Error('Invalid import data format');
            }
            
            await this.updateSettings(importData.settings);
            console.log('Settings imported successfully');
        } catch (error) {
            console.error('Failed to import settings:', error);
            throw error;
        }
    }

    // Data cleanup
    async cleanupOldData() {
        try {
            // Clean up old cache entries (older than 7 days)
            const result = await chrome.storage.local.get(['explanationCache']);
            const cache = result.explanationCache || {};
            
            const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days
            let cleanedCount = 0;
            
            for (const [key, value] of Object.entries(cache)) {
                if (value.timestamp < cutoffTime) {
                    delete cache[key];
                    cleanedCount++;
                }
            }
            
            if (cleanedCount > 0) {
                await chrome.storage.local.set({ explanationCache: cache });
                console.log(`Cleaned up ${cleanedCount} old cache entries`);
            }
        } catch (error) {
            console.error('Failed to cleanup old data:', error);
        }
    }

    // Storage space management
    async getStorageInfo() {
        try {
            const syncUsage = await chrome.storage.sync.getBytesInUse();
            const localUsage = await chrome.storage.local.getBytesInUse();
            
            return {
                sync: {
                    used: syncUsage,
                    quota: chrome.storage.sync.QUOTA_BYTES || 102400 // 100KB default
                },
                local: {
                    used: localUsage,
                    quota: chrome.storage.local.QUOTA_BYTES || 5242880 // 5MB default
                }
            };
        } catch (error) {
            console.error('Failed to get storage info:', error);
            return null;
        }
    }
}