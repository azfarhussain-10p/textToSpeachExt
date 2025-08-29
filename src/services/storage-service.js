/**
 * Cross-browser storage service with fallback handling
 * Provides a unified API for browser storage across Chrome, Firefox, and Safari
 */

// Import browser detection utility
const BrowserDetection = typeof window !== 'undefined' 
  ? window.BrowserDetection 
  : require('../utils/browser-detection.js');

class StorageService {
  constructor() {
    this.api = BrowserDetection.getAPI();
    this.browserType = BrowserDetection.getBrowser();
    this.config = BrowserDetection.getStorageConfig();
    
    // Initialize storage areas
    this.syncStorage = this.api?.storage?.sync;
    this.localStorage = this.api?.storage?.local;
    
    // Default settings schema
    this.defaultSettings = {
      ttsSettings: {
        voice: 'default',
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
        enabled: true
      },
      aiSettings: {
        groqEnabled: true,
        claudeEnabled: true,
        openaiEnabled: false,
        explanationLevel: 'simple', // 'simple', 'detailed', 'technical'
        autoExplain: false
      },
      uiSettings: {
        overlayPosition: 'auto',
        theme: 'light',
        fontSize: 'medium',
        showKeyboardShortcuts: true
      },
      privacySettings: {
        aiConsentGiven: false,
        dataCollection: false,
        analytics: false
      },
      apiKeys: {
        groqApiKey: '',
        claudeApiKey: '',
        openaiApiKey: ''
      }
    };
  }

  /**
   * Get data from storage with fallback handling
   * @param {string|string[]|object} keys - Keys to retrieve
   * @returns {Promise<object>} Retrieved data
   */
  async get(keys) {
    try {
      // Try sync storage first (if available and preferred)
      if (this.config.preferSync && this.syncStorage) {
        return await this._getFromStorage(this.syncStorage, keys);
      }
      
      // Fallback to local storage
      if (this.config.fallbackToLocal && this.localStorage) {
        return await this._getFromStorage(this.localStorage, keys);
      }
      
      throw new Error('No storage API available');
      
    } catch (error) {
      console.error('Storage get error:', error);
      
      // Return default values for requested keys
      if (typeof keys === 'string') {
        return { [keys]: this.defaultSettings[keys] || null };
      } else if (Array.isArray(keys)) {
        const defaults = {};
        keys.forEach(key => {
          defaults[key] = this.defaultSettings[key] || null;
        });
        return defaults;
      } else if (typeof keys === 'object') {
        return keys; // Return the default values object
      }
      
      return {};
    }
  }

  /**
   * Set data in storage with quota handling
   * @param {object} data - Data to store
   * @returns {Promise<boolean>} Success status
   */
  async set(data) {
    try {
      // Check data size against quota
      const dataSize = JSON.stringify(data).length;
      if (dataSize > this.config.quotaLimit) {
        console.warn('Data size exceeds quota limit:', dataSize, 'vs', this.config.quotaLimit);
        
        // Try to clean up old data or compress
        await this._cleanupStorage();
      }
      
      // Try sync storage first
      if (this.config.preferSync && this.syncStorage) {
        await this._setInStorage(this.syncStorage, data);
        return true;
      }
      
      // Fallback to local storage
      if (this.config.fallbackToLocal && this.localStorage) {
        await this._setInStorage(this.localStorage, data);
        return true;
      }
      
      throw new Error('No storage API available');
      
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  }

  /**
   * Remove data from storage
   * @param {string|string[]} keys - Keys to remove
   * @returns {Promise<boolean>} Success status
   */
  async remove(keys) {
    try {
      const removePromises = [];
      
      if (this.syncStorage) {
        removePromises.push(this._removeFromStorage(this.syncStorage, keys));
      }
      
      if (this.localStorage && this.config.fallbackToLocal) {
        removePromises.push(this._removeFromStorage(this.localStorage, keys));
      }
      
      await Promise.allSettled(removePromises);
      return true;
      
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  }

  /**
   * Clear all extension data (for reset/uninstall)
   * @returns {Promise<boolean>} Success status
   */
  async clear() {
    try {
      const clearPromises = [];
      
      if (this.syncStorage) {
        clearPromises.push(this._clearStorage(this.syncStorage));
      }
      
      if (this.localStorage) {
        clearPromises.push(this._clearStorage(this.localStorage));
      }
      
      await Promise.allSettled(clearPromises);
      return true;
      
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }

  /**
   * Initialize storage with default settings
   * @returns {Promise<boolean>} Success status
   */
  async initialize() {
    try {
      const existingData = await this.get(Object.keys(this.defaultSettings));
      const initData = {};
      
      // Only set defaults for missing keys
      Object.keys(this.defaultSettings).forEach(key => {
        if (!existingData[key]) {
          initData[key] = this.defaultSettings[key];
        }
      });
      
      if (Object.keys(initData).length > 0) {
        await this.set(initData);
        console.log('Storage initialized with defaults:', Object.keys(initData));
      }
      
      return true;
      
    } catch (error) {
      console.error('Storage initialization error:', error);
      return false;
    }
  }

  /**
   * Get specific settings category
   * @param {string} category - Settings category (tts, ai, ui, privacy, apiKeys)
   * @returns {Promise<object>} Settings object
   */
  async getSettings(category) {
    const key = `${category}Settings`;
    const data = await this.get(key);
    return data[key] || this.defaultSettings[key] || {};
  }

  /**
   * Update specific settings category
   * @param {string} category - Settings category
   * @param {object} newSettings - New settings to merge
   * @returns {Promise<boolean>} Success status
   */
  async updateSettings(category, newSettings) {
    const key = `${category}Settings`;
    const currentSettings = await this.getSettings(category);
    const mergedSettings = { ...currentSettings, ...newSettings };
    
    return await this.set({ [key]: mergedSettings });
  }

  /**
   * Listen for storage changes
   * @param {function} callback - Callback function for changes
   * @returns {function} Unsubscribe function
   */
  onChanged(callback) {
    if (!this.api?.storage?.onChanged) {
      console.warn('Storage change events not supported');
      return () => {};
    }

    const listener = (changes, namespace) => {
      callback(changes, namespace);
    };

    this.api.storage.onChanged.addListener(listener);
    
    return () => {
      this.api.storage.onChanged.removeListener(listener);
    };
  }

  // Private helper methods

  /**
   * Get data from specific storage area (sync or local)
   * @private
   */
  async _getFromStorage(storageArea, keys) {
    if (this.browserType === 'chrome' || this.browserType === 'edge') {
      return new Promise((resolve, reject) => {
        storageArea.get(keys, (result) => {
          if (this.api.runtime.lastError) {
            reject(new Error(this.api.runtime.lastError.message));
          } else {
            resolve(result);
          }
        });
      });
    } else {
      // Firefox/Safari use promises
      return await storageArea.get(keys);
    }
  }

  /**
   * Set data in specific storage area
   * @private
   */
  async _setInStorage(storageArea, data) {
    if (this.browserType === 'chrome' || this.browserType === 'edge') {
      return new Promise((resolve, reject) => {
        storageArea.set(data, () => {
          if (this.api.runtime.lastError) {
            reject(new Error(this.api.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      });
    } else {
      // Firefox/Safari use promises
      return await storageArea.set(data);
    }
  }

  /**
   * Remove data from specific storage area
   * @private
   */
  async _removeFromStorage(storageArea, keys) {
    if (this.browserType === 'chrome' || this.browserType === 'edge') {
      return new Promise((resolve, reject) => {
        storageArea.remove(keys, () => {
          if (this.api.runtime.lastError) {
            reject(new Error(this.api.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      });
    } else {
      return await storageArea.remove(keys);
    }
  }

  /**
   * Clear specific storage area
   * @private
   */
  async _clearStorage(storageArea) {
    if (this.browserType === 'chrome' || this.browserType === 'edge') {
      return new Promise((resolve, reject) => {
        storageArea.clear(() => {
          if (this.api.runtime.lastError) {
            reject(new Error(this.api.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      });
    } else {
      return await storageArea.clear();
    }
  }

  /**
   * Clean up old storage data to free space
   * @private
   */
  async _cleanupStorage() {
    try {
      // Remove old temporary data, cache, etc.
      await this.remove(['tempData', 'cache', 'oldSettings']);
      console.log('Storage cleanup completed');
    } catch (error) {
      console.error('Storage cleanup error:', error);
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageService;
} else if (typeof window !== 'undefined') {
  window.StorageService = StorageService;
}