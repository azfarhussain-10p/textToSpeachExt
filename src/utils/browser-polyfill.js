/**
 * Browser Polyfill for Cross-Browser Compatibility
 * Normalizes browser extension APIs across Chrome, Firefox, Safari, and Edge
 */

(function() {
  'use strict';

  // Check if we're in a browser extension environment
  if (typeof chrome === 'undefined' && typeof browser === 'undefined') {
    console.warn('Browser extension APIs not available');
    return;
  }

  // Create our unified browser API object
  const browserAPI = {};

  // Determine which browser we're running in
  const isChrome = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
  const isFirefox = typeof browser !== 'undefined' && browser.runtime && browser.runtime.id;
  const isSafari = typeof safari !== 'undefined';
  const isEdge = isChrome && navigator.userAgent.indexOf('Edg/') > -1;

  // Base API object (Chrome or Firefox)
  const baseAPI = isFirefox ? browser : chrome;

  /**
   * Promisify Chrome APIs for consistency with Firefox
   * Firefox APIs are already promise-based, Chrome uses callbacks
   */
  function promisify(fn, thisArg) {
    return function(...args) {
      return new Promise((resolve, reject) => {
        args.push(function(result) {
          if (baseAPI.runtime.lastError) {
            reject(new Error(baseAPI.runtime.lastError.message));
          } else {
            resolve(result);
          }
        });
        fn.apply(thisArg, args);
      });
    };
  }

  /**
   * Create promise-based API wrappers
   */
  function _createPromiseAPI(apiObject) {
    if (!apiObject) return null;

    const promiseAPI = {};
    
    for (const key in apiObject) {
      const prop = apiObject[key];
      
      if (typeof prop === 'function') {
        // For Firefox, functions are already promise-based
        if (isFirefox) {
          promiseAPI[key] = prop.bind(apiObject);
        } else {
          // For Chrome/Edge, promisify callback-based functions
          promiseAPI[key] = promisify(prop, apiObject);
        }
      } else if (typeof prop === 'object' && prop !== null) {
        // Recursively handle nested objects
        promiseAPI[key] = _createPromiseAPI(prop);
      } else {
        // Copy primitive values and event objects
        promiseAPI[key] = prop;
      }
    }
    
    return promiseAPI;
  }

  // Runtime API
  browserAPI.runtime = {
    // Properties
    id: baseAPI.runtime.id,
    
    // Events (these are the same across browsers)
    onInstalled: baseAPI.runtime.onInstalled,
    onStartup: baseAPI.runtime.onStartup,
    onMessage: baseAPI.runtime.onMessage,
    onConnect: baseAPI.runtime.onConnect,
    onSuspend: baseAPI.runtime.onSuspend,
    
    // Methods
    getManifest: () => baseAPI.runtime.getManifest(),
    getURL: (path) => baseAPI.runtime.getURL(path),
    
    sendMessage: isFirefox 
      ? baseAPI.runtime.sendMessage.bind(baseAPI.runtime)
      : promisify(baseAPI.runtime.sendMessage, baseAPI.runtime),
    
    openOptionsPage: isFirefox
      ? baseAPI.runtime.openOptionsPage.bind(baseAPI.runtime) 
      : promisify(baseAPI.runtime.openOptionsPage, baseAPI.runtime),
      
    reload: () => baseAPI.runtime.reload(),
    
    // Error handling
    lastError: baseAPI.runtime.lastError
  };

  // Tabs API
  if (baseAPI.tabs) {
    browserAPI.tabs = {
      // Events
      onActivated: baseAPI.tabs.onActivated,
      onUpdated: baseAPI.tabs.onUpdated,
      onCreated: baseAPI.tabs.onCreated,
      onRemoved: baseAPI.tabs.onRemoved,
      
      // Methods
      query: isFirefox
        ? baseAPI.tabs.query.bind(baseAPI.tabs)
        : promisify(baseAPI.tabs.query, baseAPI.tabs),
        
      get: isFirefox
        ? baseAPI.tabs.get.bind(baseAPI.tabs)
        : promisify(baseAPI.tabs.get, baseAPI.tabs),
        
      create: isFirefox
        ? baseAPI.tabs.create.bind(baseAPI.tabs)
        : promisify(baseAPI.tabs.create, baseAPI.tabs),
        
      update: isFirefox
        ? baseAPI.tabs.update.bind(baseAPI.tabs)
        : promisify(baseAPI.tabs.update, baseAPI.tabs),
        
      remove: isFirefox
        ? baseAPI.tabs.remove.bind(baseAPI.tabs)
        : promisify(baseAPI.tabs.remove, baseAPI.tabs),
        
      sendMessage: isFirefox
        ? baseAPI.tabs.sendMessage.bind(baseAPI.tabs)
        : promisify(baseAPI.tabs.sendMessage, baseAPI.tabs),
        
      executeScript: baseAPI.tabs.executeScript 
        ? (isFirefox 
            ? baseAPI.tabs.executeScript.bind(baseAPI.tabs)
            : promisify(baseAPI.tabs.executeScript, baseAPI.tabs))
        : null,
        
      insertCSS: baseAPI.tabs.insertCSS
        ? (isFirefox
            ? baseAPI.tabs.insertCSS.bind(baseAPI.tabs) 
            : promisify(baseAPI.tabs.insertCSS, baseAPI.tabs))
        : null
    };
  }

  // Storage API
  if (baseAPI.storage) {
    browserAPI.storage = {
      // Sync storage
      sync: baseAPI.storage.sync ? {
        get: isFirefox
          ? baseAPI.storage.sync.get.bind(baseAPI.storage.sync)
          : promisify(baseAPI.storage.sync.get, baseAPI.storage.sync),
          
        set: isFirefox
          ? baseAPI.storage.sync.set.bind(baseAPI.storage.sync)
          : promisify(baseAPI.storage.sync.set, baseAPI.storage.sync),
          
        remove: isFirefox
          ? baseAPI.storage.sync.remove.bind(baseAPI.storage.sync)
          : promisify(baseAPI.storage.sync.remove, baseAPI.storage.sync),
          
        clear: isFirefox
          ? baseAPI.storage.sync.clear.bind(baseAPI.storage.sync)
          : promisify(baseAPI.storage.sync.clear, baseAPI.storage.sync),
          
        getBytesInUse: baseAPI.storage.sync.getBytesInUse
          ? (isFirefox
              ? baseAPI.storage.sync.getBytesInUse.bind(baseAPI.storage.sync)
              : promisify(baseAPI.storage.sync.getBytesInUse, baseAPI.storage.sync))
          : null,
          
        onChanged: baseAPI.storage.sync.onChanged
      } : null,
      
      // Local storage
      local: baseAPI.storage.local ? {
        get: isFirefox
          ? baseAPI.storage.local.get.bind(baseAPI.storage.local)
          : promisify(baseAPI.storage.local.get, baseAPI.storage.local),
          
        set: isFirefox
          ? baseAPI.storage.local.set.bind(baseAPI.storage.local)
          : promisify(baseAPI.storage.local.set, baseAPI.storage.local),
          
        remove: isFirefox
          ? baseAPI.storage.local.remove.bind(baseAPI.storage.local)
          : promisify(baseAPI.storage.local.remove, baseAPI.storage.local),
          
        clear: isFirefox
          ? baseAPI.storage.local.clear.bind(baseAPI.storage.local)
          : promisify(baseAPI.storage.local.clear, baseAPI.storage.local),
          
        getBytesInUse: baseAPI.storage.local.getBytesInUse
          ? (isFirefox
              ? baseAPI.storage.local.getBytesInUse.bind(baseAPI.storage.local)
              : promisify(baseAPI.storage.local.getBytesInUse, baseAPI.storage.local))
          : null,
          
        onChanged: baseAPI.storage.local.onChanged
      } : null,
      
      // Storage change events
      onChanged: baseAPI.storage.onChanged
    };
  }

  // Action API (Chrome MV3) / Browser Action API (Firefox/Chrome MV2)
  const actionAPI = baseAPI.action || baseAPI.browserAction;
  if (actionAPI) {
    browserAPI.action = {
      // Events
      onClicked: actionAPI.onClicked,
      
      // Methods  
      setTitle: isFirefox
        ? actionAPI.setTitle.bind(actionAPI)
        : promisify(actionAPI.setTitle, actionAPI),
        
      getTitle: isFirefox
        ? actionAPI.getTitle.bind(actionAPI)
        : promisify(actionAPI.getTitle, actionAPI),
        
      setIcon: isFirefox
        ? actionAPI.setIcon.bind(actionAPI)
        : promisify(actionAPI.setIcon, actionAPI),
        
      setPopup: isFirefox
        ? actionAPI.setPopup.bind(actionAPI)
        : promisify(actionAPI.setPopup, actionAPI),
        
      getPopup: isFirefox
        ? actionAPI.getPopup.bind(actionAPI)
        : promisify(actionAPI.getPopup, actionAPI),
        
      setBadgeText: actionAPI.setBadgeText
        ? (isFirefox
            ? actionAPI.setBadgeText.bind(actionAPI)
            : promisify(actionAPI.setBadgeText, actionAPI))
        : null,
        
      getBadgeText: actionAPI.getBadgeText
        ? (isFirefox
            ? actionAPI.getBadgeText.bind(actionAPI)
            : promisify(actionAPI.getBadgeText, actionAPI))
        : null,
        
      setBadgeBackgroundColor: actionAPI.setBadgeBackgroundColor
        ? (isFirefox
            ? actionAPI.setBadgeBackgroundColor.bind(actionAPI)
            : promisify(actionAPI.setBadgeBackgroundColor, actionAPI))
        : null,
        
      enable: actionAPI.enable ? actionAPI.enable.bind(actionAPI) : null,
      disable: actionAPI.disable ? actionAPI.disable.bind(actionAPI) : null
    };
  }

  // Context Menus API
  if (baseAPI.contextMenus) {
    browserAPI.contextMenus = {
      // Events
      onClicked: baseAPI.contextMenus.onClicked,
      
      // Methods
      create: isFirefox
        ? baseAPI.contextMenus.create.bind(baseAPI.contextMenus)
        : promisify(baseAPI.contextMenus.create, baseAPI.contextMenus),
        
      update: isFirefox
        ? baseAPI.contextMenus.update.bind(baseAPI.contextMenus) 
        : promisify(baseAPI.contextMenus.update, baseAPI.contextMenus),
        
      remove: isFirefox
        ? baseAPI.contextMenus.remove.bind(baseAPI.contextMenus)
        : promisify(baseAPI.contextMenus.remove, baseAPI.contextMenus),
        
      removeAll: isFirefox
        ? baseAPI.contextMenus.removeAll.bind(baseAPI.contextMenus)
        : promisify(baseAPI.contextMenus.removeAll, baseAPI.contextMenus)
    };
  }

  // Scripting API (Chrome MV3)
  if (baseAPI.scripting) {
    browserAPI.scripting = {
      executeScript: isFirefox
        ? baseAPI.scripting.executeScript.bind(baseAPI.scripting)
        : promisify(baseAPI.scripting.executeScript, baseAPI.scripting),
        
      insertCSS: isFirefox
        ? baseAPI.scripting.insertCSS.bind(baseAPI.scripting)
        : promisify(baseAPI.scripting.insertCSS, baseAPI.scripting),
        
      removeCSS: isFirefox
        ? baseAPI.scripting.removeCSS.bind(baseAPI.scripting)
        : promisify(baseAPI.scripting.removeCSS, baseAPI.scripting)
    };
  }

  // Permissions API
  if (baseAPI.permissions) {
    browserAPI.permissions = {
      // Events
      onAdded: baseAPI.permissions.onAdded,
      onRemoved: baseAPI.permissions.onRemoved,
      
      // Methods
      contains: isFirefox
        ? baseAPI.permissions.contains.bind(baseAPI.permissions)
        : promisify(baseAPI.permissions.contains, baseAPI.permissions),
        
      getAll: isFirefox
        ? baseAPI.permissions.getAll.bind(baseAPI.permissions)
        : promisify(baseAPI.permissions.getAll, baseAPI.permissions),
        
      request: isFirefox
        ? baseAPI.permissions.request.bind(baseAPI.permissions)
        : promisify(baseAPI.permissions.request, baseAPI.permissions),
        
      remove: isFirefox
        ? baseAPI.permissions.remove.bind(baseAPI.permissions)
        : promisify(baseAPI.permissions.remove, baseAPI.permissions)
    };
  }

  // Add browser detection utilities
  browserAPI.browserInfo = {
    isChrome,
    isFirefox,
    isSafari,
    isEdge,
    name: isFirefox ? 'Firefox' : isEdge ? 'Edge' : isSafari ? 'Safari' : 'Chrome',
    manifestVersion: isFirefox ? 2 : 3 // Firefox still uses MV2 primarily
  };

  // Feature detection utilities
  browserAPI.features = {
    hasServiceWorkers: isChrome || isEdge,
    hasBackgroundScripts: isFirefox || isSafari,
    hasScriptingAPI: !!baseAPI.scripting,
    hasActionAPI: !!baseAPI.action,
    hasBrowserActionAPI: !!baseAPI.browserAction,
    hasOffscreenAPI: !!baseAPI.offscreen,
    supportsModules: isChrome || isEdge
  };

  // Helper functions for common tasks
  browserAPI.helpers = {
    /**
     * Get the correct background page/service worker context
     */
    getBackgroundContext: function() {
      if (browserAPI.features.hasServiceWorkers) {
        return 'service-worker';
      } else {
        return 'background-script';
      }
    },

    /**
     * Execute script in tab with fallback for different APIs
     */
    executeScript: async function(tabId, details) {
      if (browserAPI.scripting) {
        return await browserAPI.scripting.executeScript({
          target: { tabId: tabId },
          ...details
        });
      } else if (browserAPI.tabs.executeScript) {
        return await browserAPI.tabs.executeScript(tabId, details);
      } else {
        throw new Error('Script execution not supported');
      }
    },

    /**
     * Insert CSS with fallback for different APIs  
     */
    insertCSS: async function(tabId, details) {
      if (browserAPI.scripting) {
        return await browserAPI.scripting.insertCSS({
          target: { tabId: tabId },
          ...details
        });
      } else if (browserAPI.tabs.insertCSS) {
        return await browserAPI.tabs.insertCSS(tabId, details);
      } else {
        throw new Error('CSS insertion not supported');
      }
    },

    /**
     * Get platform-specific storage limits
     */
    getStorageLimits: function() {
      if (isFirefox) {
        return {
          sync: { quota: 102400, maxItems: 512 }, // 100KB, 512 items
          local: { quota: 5242880 } // 5MB
        };
      } else {
        return {
          sync: { quota: 102400, maxItems: 512 }, // 100KB, 512 items  
          local: { quota: 5242880 } // 5MB
        };
      }
    },

    /**
     * Normalize URL for cross-browser compatibility
     */
    normalizeURL: function(url) {
      if (url.startsWith('moz-extension://')) {
        return url;
      } else if (url.startsWith('chrome-extension://')) {
        return url;
      } else if (url.startsWith('safari-web-extension://')) {
        return url;
      } else {
        return browserAPI.runtime.getURL(url);
      }
    }
  };

  // Export the unified API
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = browserAPI;
  } else {
    // Make available globally in browser extension context
    if (typeof window !== 'undefined') {
      window.browserAPI = browserAPI;
    }
    
    // Also make it available as chrome for compatibility
    if (!isFirefox && typeof chrome !== 'undefined') {
      // Extend existing chrome API with our promise-based versions
      Object.keys(browserAPI).forEach(key => {
        if (!chrome[key] || key === 'helpers' || key === 'browserInfo' || key === 'features') {
          chrome[key] = browserAPI[key];
        }
      });
    }
  }

  console.log(`Browser polyfill initialized for ${browserAPI.browserInfo.name}`);
})();