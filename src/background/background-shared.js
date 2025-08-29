/**
 * Shared background functionality
 * Common code used by both service worker (Chrome/Edge) and background script (Firefox/Safari)
 */

/**
 * Message handler for communication with content scripts and popup
 * @param {object} message - Message object
 * @param {object} sender - Sender information
 * @param {function} sendResponse - Response callback
 */
async function handleMessage(message, sender, sendResponse) {
  console.log('📨 Handling message:', message.type);
  
  try {
    switch (message.type) {
      case 'GET_SETTINGS':
        await handleGetSettings(message, sendResponse);
        break;
        
      case 'UPDATE_SETTINGS':
        await handleUpdateSettings(message, sendResponse);
        break;
        
      case 'GET_TTS_VOICES':
        await handleGetTTSVoices(message, sendResponse);
        break;
        
      case 'SPEAK_TEXT':
        await handleSpeakText(message, sender, sendResponse);
        break;
        
      case 'AI_EXPLANATION_REQUEST':
        await handleAIExplanation(message, sendResponse);
        break;
        
      case 'CHECK_API_LIMITS':
        await handleCheckAPILimits(message, sendResponse);
        break;
        
      case 'PRIVACY_CONSENT':
        await handlePrivacyConsent(message, sendResponse);
        break;
        
      case 'ERROR_REPORT':
        await handleErrorReport(message, sendResponse);
        break;
        
      case 'GET_EXTENSION_INFO':
        await handleGetExtensionInfo(message, sendResponse);
        break;
        
      default:
        console.warn('Unknown message type:', message.type);
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  } catch (error) {
    console.error('Message handler error:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Handle settings retrieval request
 */
async function handleGetSettings(message, sendResponse) {
  try {
    const api = getWebExtAPI();
    const { category } = message;
    
    let settings;
    if (category) {
      // Get specific settings category
      const key = `${category}Settings`;
      const result = await api.storage.sync.get([key]);
      settings = result[key] || {};
    } else {
      // Get all settings
      const result = await api.storage.sync.get([
        'ttsSettings',
        'aiSettings',
        'uiSettings',
        'privacySettings'
      ]);
      settings = result;
    }
    
    sendResponse({ success: true, settings });
    
  } catch (error) {
    console.error('Get settings error:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Handle settings update request
 */
async function handleUpdateSettings(message, sendResponse) {
  try {
    const api = getWebExtAPI();
    const { category, settings } = message;
    
    if (category) {
      // Update specific category
      const key = `${category}Settings`;
      
      // Get current settings and merge
      const currentResult = await api.storage.sync.get([key]);
      const currentSettings = currentResult[key] || {};
      const mergedSettings = { ...currentSettings, ...settings };
      
      await api.storage.sync.set({ [key]: mergedSettings });
      
      sendResponse({ success: true, settings: mergedSettings });
    } else {
      // Update multiple categories
      await api.storage.sync.set(settings);
      sendResponse({ success: true, settings });
    }
    
  } catch (error) {
    console.error('Update settings error:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Handle TTS voices request (this will be handled by content script, but API info provided here)
 */
async function handleGetTTSVoices(message, sendResponse) {
  try {
    // Note: Actual voice enumeration happens in content script context
    // Here we provide API guidance
    sendResponse({ 
      success: true, 
      message: 'TTS voices must be accessed from content script context',
      apiInfo: {
        supported: 'speechSynthesis' in globalThis,
        requiresUserGesture: true
      }
    });
    
  } catch (error) {
    console.error('Get TTS voices error:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Handle text-to-speech request
 */
async function handleSpeakText(message, sender, sendResponse) {
  try {
    const { text, settings } = message;
    
    if (!text || text.trim().length === 0) {
      throw new Error('No text provided for speech');
    }
    
    // Send message to content script to handle TTS (since TTS APIs are not available in service worker)
    const api = getWebExtAPI();
    
    if (sender.tab) {
      await api.tabs.sendMessage(sender.tab.id, {
        type: 'EXECUTE_TTS',
        text,
        settings
      });
      
      sendResponse({ success: true, message: 'TTS request sent to content script' });
    } else {
      throw new Error('No active tab available for TTS');
    }
    
  } catch (error) {
    console.error('Speak text error:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Handle AI explanation request
 */
async function handleAIExplanation(message, sendResponse) {
  try {
    const { text, level = 'simple', preferredProvider = 'groq' } = message;
    
    if (!text || text.trim().length === 0) {
      throw new Error('No text provided for explanation');
    }
    
    // Check privacy consent
    const api = getWebExtAPI();
    const { privacySettings } = await api.storage.sync.get(['privacySettings']);
    
    if (!privacySettings?.aiConsentGiven) {
      sendResponse({ 
        success: false, 
        error: 'AI consent not given',
        requiresConsent: true 
      });
      return;
    }
    
    // Load and execute AI explanation logic
    const explanation = await executeAIExplanation(text, level, preferredProvider);
    
    sendResponse({ success: true, explanation });
    
  } catch (error) {
    console.error('AI explanation error:', error);
    sendResponse({ 
      success: false, 
      error: error.message,
      fallback: `Selected text: "${text}". For AI explanations, please ensure API keys are configured in settings.`
    });
  }
}

/**
 * Handle API limits check request
 */
async function handleCheckAPILimits(message, sendResponse) {
  try {
    // This would check rate limiter status for each API
    const limits = {
      groq: { remaining: 95, limit: 100, resetTime: Date.now() + 3600000 },
      claude: { remaining: 58, limit: 60, resetTime: Date.now() + 60000 },
      openai: { remaining: 60, limit: 60, resetTime: Date.now() + 60000 }
    };
    
    sendResponse({ success: true, limits });
    
  } catch (error) {
    console.error('Check API limits error:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Handle privacy consent update
 */
async function handlePrivacyConsent(message, sendResponse) {
  try {
    const { consentGiven, dataCollection = false } = message;
    const api = getWebExtAPI();
    
    // Update privacy settings
    const { privacySettings = {} } = await api.storage.sync.get(['privacySettings']);
    const updatedPrivacySettings = {
      ...privacySettings,
      aiConsentGiven: consentGiven,
      dataCollection,
      consentTimestamp: Date.now()
    };
    
    await api.storage.sync.set({ privacySettings: updatedPrivacySettings });
    
    sendResponse({ success: true, settings: updatedPrivacySettings });
    
  } catch (error) {
    console.error('Privacy consent error:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Handle error report
 */
async function handleErrorReport(message, sendResponse) {
  try {
    const { error, context, timestamp = Date.now() } = message;
    
    // Log error locally
    console.error('📝 Error report received:', {
      error,
      context,
      timestamp,
      userAgent: navigator.userAgent
    });
    
    // In a production app, this would send to error tracking service
    // For now, we'll just acknowledge the report
    sendResponse({ success: true, message: 'Error report logged' });
    
  } catch (error) {
    console.error('Error report handling failed:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Handle extension info request
 */
async function handleGetExtensionInfo(message, sendResponse) {
  try {
    const api = getWebExtAPI();
    const manifest = api.runtime.getManifest();
    
    const info = {
      name: manifest.name,
      version: manifest.version,
      description: manifest.description,
      manifestVersion: manifest.manifest_version,
      permissions: manifest.permissions || [],
      browser: getBrowserType()
    };
    
    sendResponse({ success: true, info });
    
  } catch (error) {
    console.error('Get extension info error:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Execute AI explanation (simplified version - full implementation would be in AI service)
 */
async function executeAIExplanation(text, level, preferredProvider) {
  try {
    // This is a placeholder - the full implementation would use the AI service
    // with proper rate limiting, API key management, etc.
    
    // For now, return a local explanation
    return {
      explanation: `This text appears to be ${analyzeTextType(text)}. For detailed AI explanations, please configure API keys in the extension settings.`,
      provider: 'local',
      level: level,
      timestamp: Date.now()
    };
    
  } catch (error) {
    console.error('AI explanation execution error:', error);
    throw error;
  }
}

/**
 * Analyze text type for local explanations
 */
function analyzeTextType(text) {
  if (!text) return 'empty text';
  
  const length = text.trim().length;
  
  if (length === 0) return 'empty text';
  if (length < 10) return 'a short phrase';
  if (length < 50) return 'a brief sentence or phrase';
  if (length < 200) return 'a paragraph of text';
  if (length < 500) return 'several paragraphs of text';
  
  return 'a long passage of text';
}

/**
 * Get the appropriate web extension API based on browser
 */
function getWebExtAPI() {
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    return chrome;
  } else if (typeof browser !== 'undefined' && browser.runtime) {
    return browser;
  } else {
    throw new Error('No web extension API available');
  }
}

/**
 * Get the current browser type
 */
function getBrowserType() {
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    if (navigator.userAgent.includes('Edg/')) {
      return 'edge';
    }
    return 'chrome';
  } else if (typeof browser !== 'undefined' && browser.runtime) {
    return 'firefox';
  } else if (typeof safari !== 'undefined' && safari.extension) {
    return 'safari';
  }
  
  return 'unknown';
}

/**
 * Create a notification with browser-specific handling
 */
async function createNotification(title, message, type = 'basic') {
  try {
    // Validate required parameters
    if (!title || !message || !type) {
      console.warn('Skipping notification - missing required parameters:', { title, message, type });
      return null;
    }

    const api = getWebExtAPI();
    
    const notificationOptions = {
      type,
      title: String(title),
      message: String(message)
    };
    
    if (api.notifications && api.notifications.create) {
      return await api.notifications.create(notificationOptions);
    } else {
      // Fallback for browsers without notifications API
      console.log(`Notification: ${title} - ${message}`);
      return null;
    }
    
  } catch (error) {
    console.error('Create notification error:', error);
    return null;
  }
}

/**
 * Validate and sanitize text input
 */
function sanitizeTextInput(text) {
  if (typeof text !== 'string') {
    return '';
  }
  
  // Remove potential XSS content
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim()
    .substring(0, 10000); // Limit length
}

/**
 * Check if URL is safe for content script injection
 */
function isSafeURL(url) {
  if (!url) return false;
  
  // Block dangerous URLs
  const blockedSchemes = ['chrome-extension:', 'moz-extension:', 'safari-extension:', 'file:', 'data:', 'javascript:'];
  const blockedDomains = ['chrome.google.com', 'addons.mozilla.org', 'apps.apple.com'];
  
  try {
    const urlObj = new URL(url);
    
    if (blockedSchemes.includes(urlObj.protocol)) {
      return false;
    }
    
    if (blockedDomains.some(domain => urlObj.hostname.includes(domain))) {
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.error('URL validation error:', error);
    return false;
  }
}

console.log('🔧 Shared background functionality loaded');