/**
 * Cross-browser detection and API abstraction utility
 * Handles differences between Chrome (Manifest V3), Firefox, and Safari
 */

class BrowserDetection {
  
  /**
   * Detect the current browser environment
   * @returns {string} Browser type: 'chrome', 'firefox', 'safari', or 'unknown'
   */
  static getBrowser() {
    // Check for Chrome/Edge (has chrome global and supports Manifest V3)
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      // Distinguish between Chrome and Edge
      if (navigator.userAgent.includes('Edg/')) {
        return 'edge';
      }
      return 'chrome';
    }
    
    // Check for Firefox (has browser global)
    if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.onMessage) {
      return 'firefox';
    }
    
    // Check for Safari (has safari global)
    if (typeof safari !== 'undefined' && safari.extension) {
      return 'safari';
    }
    
    return 'unknown';
  }
  
  /**
   * Get the appropriate browser API object
   * @returns {object} Browser API object (chrome, browser, safari.extension)
   */
  static getAPI() {
    const browserType = this.getBrowser();
    
    switch (browserType) {
      case 'chrome':
      case 'edge':
        return chrome;
      case 'firefox':
        return browser;
      case 'safari':
        return safari.extension;
      default:
        console.warn('Unknown browser environment');
        return null;
    }
  }
  
  /**
   * Check if the browser supports Service Workers (Manifest V3)
   * @returns {boolean} True if Service Workers are supported
   */
  static supportsServiceWorker() {
    const browserType = this.getBrowser();
    return browserType === 'chrome' || browserType === 'edge';
  }
  
  /**
   * Get the manifest version used by the current browser
   * @returns {number} Manifest version (2 or 3)
   */
  static getManifestVersion() {
    const browserType = this.getBrowser();
    return (browserType === 'chrome' || browserType === 'edge') ? 3 : 2;
  }
  
  /**
   * Check if the browser supports the Web Speech API
   * @returns {boolean} True if Web Speech API is available
   */
  static supportsWebSpeech() {
    return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  }
  
  /**
   * Get browser-specific TTS voice loading behavior
   * @returns {object} Voice loading configuration
   */
  static getVoiceLoadingConfig() {
    const browserType = this.getBrowser();
    
    return {
      requiresEventListener: browserType === 'firefox' || browserType === 'safari',
      loadDelay: browserType === 'chrome' || browserType === 'edge' ? 100 : 0,
      maxRetries: 5
    };
  }
  
  /**
   * Get browser-specific storage API preferences
   * @returns {object} Storage configuration
   */
  static getStorageConfig() {
    const browserType = this.getBrowser();
    
    return {
      preferSync: true, // All browsers support sync storage
      fallbackToLocal: true,
      quotaLimit: browserType === 'chrome' || browserType === 'edge' ? 102400 : 5242880 // Chrome: 100KB, Firefox: 5MB
    };
  }
  
  /**
   * Get browser-specific CSP (Content Security Policy) constraints
   * @returns {object} CSP configuration
   */
  static getCSPConfig() {
    const browserType = this.getBrowser();
    
    return {
      allowsEval: browserType === 'safari', // Only Safari allows 'unsafe-eval'
      requiresNonce: false, // None of our target browsers require nonces
      strictMode: browserType === 'chrome' || browserType === 'edge' // Manifest V3 is stricter
    };
  }
  
  /**
   * Check if browser supports specific extension APIs
   * @param {string} apiName - Name of the API to check
   * @returns {boolean} True if API is supported
   */
  static supportsAPI(apiName) {
    const api = this.getAPI();
    if (!api) return false;
    
    // Handle nested API paths (e.g., 'storage.sync')
    const apiParts = apiName.split('.');
    let currentAPI = api;
    
    for (const part of apiParts) {
      if (!currentAPI || typeof currentAPI[part] === 'undefined') {
        return false;
      }
      currentAPI = currentAPI[part];
    }
    
    return true;
  }
  
  /**
   * Get cross-browser compatible event listener
   * @param {string} eventType - Type of event to listen for
   * @returns {function} Event listener function
   */
  static getEventListener(eventType) {
    const api = this.getAPI();
    const browserType = this.getBrowser();
    
    switch (eventType) {
      case 'runtime.onMessage':
        return api.runtime.onMessage;
      case 'runtime.onInstalled':
        return api.runtime.onInstalled;
      case 'contextMenus.onClicked':
        return api.contextMenus.onClicked;
      case 'storage.onChanged':
        return api.storage.onChanged;
      case 'commands.onCommand':
        return api.commands.onCommand;
      default:
        console.warn(`Unknown event type: ${eventType}`);
        return null;
    }
  }
  
  /**
   * Log browser environment information for debugging
   */
  static logEnvironment() {
    const browserType = this.getBrowser();
    const manifestVersion = this.getManifestVersion();
    const supportsServiceWorker = this.supportsServiceWorker();
    const supportsWebSpeech = this.supportsWebSpeech();
    
    console.log('🔍 Browser Environment Detection:', {
      browser: browserType,
      manifestVersion,
      supportsServiceWorker,
      supportsWebSpeech,
      userAgent: navigator.userAgent,
      apis: {
        storage: this.supportsAPI('storage'),
        contextMenus: this.supportsAPI('contextMenus'),
        notifications: this.supportsAPI('notifications'),
        commands: this.supportsAPI('commands')
      }
    });
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BrowserDetection;
} else if (typeof window !== 'undefined') {
  window.BrowserDetection = BrowserDetection;
}