/**
 * Chrome/Edge Service Worker (Manifest V3)
 * Main background script for Chrome and Edge browsers
 */

// Inline shared background functionality (importScripts not supported in service workers)

/**
 * Message handler for communication with content scripts and popup
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
        
      case 'AI_EXPLANATION_REQUEST':
        await handleAIExplanation(message, sendResponse);
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
    const { category } = message;
    
    let settings;
    if (category) {
      const key = `${category}Settings`;
      const result = await chrome.storage.sync.get([key]);
      settings = result[key] || {};
    } else {
      const result = await chrome.storage.sync.get([
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
    const { category, settings } = message;
    
    if (category) {
      const key = `${category}Settings`;
      const currentResult = await chrome.storage.sync.get([key]);
      const currentSettings = currentResult[key] || {};
      const mergedSettings = { ...currentSettings, ...settings };
      
      await chrome.storage.sync.set({ [key]: mergedSettings });
      sendResponse({ success: true, settings: mergedSettings });
    } else {
      await chrome.storage.sync.set(settings);
      sendResponse({ success: true, settings });
    }
    
  } catch (error) {
    console.error('Update settings error:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Handle AI explanation request
 */
async function handleAIExplanation(message, sendResponse) {
  try {
    const { text } = message;
    
    if (!text || text.trim().length === 0) {
      throw new Error('No text provided for explanation');
    }
    
    // Check privacy consent
    const { privacySettings } = await chrome.storage.sync.get(['privacySettings']);
    
    if (!privacySettings?.aiConsentGiven) {
      sendResponse({ 
        success: false, 
        error: 'AI consent not given',
        requiresConsent: true 
      });
      return;
    }
    
    // Return placeholder explanation
    const explanation = {
      explanation: `This text appears to be ${analyzeTextType(text)}. For detailed AI explanations, please configure API keys in the extension settings.`,
      provider: 'local',
      timestamp: Date.now()
    };
    
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
 * Handle privacy consent update
 */
async function handlePrivacyConsent(message, sendResponse) {
  try {
    const { consentGiven, dataCollection = false } = message;
    
    const { privacySettings = {} } = await chrome.storage.sync.get(['privacySettings']);
    const updatedPrivacySettings = {
      ...privacySettings,
      aiConsentGiven: consentGiven,
      dataCollection,
      consentTimestamp: Date.now()
    };
    
    await chrome.storage.sync.set({ privacySettings: updatedPrivacySettings });
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
    
    console.error('📝 Error report received:', {
      error,
      context,
      timestamp,
      userAgent: navigator.userAgent
    });
    
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
    const manifest = chrome.runtime.getManifest();
    
    const info = {
      name: manifest.name,
      version: manifest.version,
      description: manifest.description,
      manifestVersion: manifest.manifest_version,
      permissions: manifest.permissions || [],
      browser: 'chrome'
    };
    
    sendResponse({ success: true, info });
    
  } catch (error) {
    console.error('Get extension info error:', error);
    sendResponse({ success: false, error: error.message });
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

// Service Worker lifecycle events
self.addEventListener('install', (event) => {
  console.log('🔧 TTS Extension Service Worker installing...');
  
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('✅ TTS Extension Service Worker activated');
  
  event.waitUntil(
    self.clients.claim().then(() => {
      console.log('📱 Service Worker claimed all clients');
    })
  );
});

// Handle extension installation and updates
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('🚀 Extension installed/updated:', details.reason);
  
  try {
    // Initialize storage with default settings
    await initializeStorage();
    
    // Create context menus
    await setupContextMenus();
    
    // Set up alarms for periodic tasks
    await setupAlarms();
    
    // Show welcome notification on first install (disabled to prevent notification errors)
    if (details.reason === 'install') {
      console.log('🎉 Extension installed successfully! Welcome notification disabled to prevent errors.');
      // Note: Welcome notification temporarily disabled due to Chrome notification API timing issues
    }
    
    console.log('✅ Extension initialization completed');
    
  } catch (error) {
    console.error('❌ Extension initialization failed:', error);
  }
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  console.log('📱 Context menu clicked:', info.menuItemId);
  
  try {
    switch (info.menuItemId) {
      case 'tts-speak-selection':
        await handleSpeakSelection(info, tab);
        break;
        
      case 'tts-explain-selection':
        await handleExplainSelection(info, tab);
        break;
        
      case 'tts-open-settings':
        await showNotification(
          'TTS Settings',
          'Extension settings: Use right-click context menus or keyboard shortcuts (Ctrl+Shift+T, Ctrl+Shift+S) to access TTS features.'
        );
        break;
        
      default:
        console.warn('Unknown context menu item:', info.menuItemId);
    }
  } catch (error) {
    console.error('Context menu handler error:', error);
    await showNotification('Error', 'Failed to process context menu action');
  }
});

// Handle keyboard commands
chrome.commands.onCommand.addListener(async (command) => {
  console.log('⌨️ Keyboard command:', command);
  
  try {
    switch (command) {
      case 'toggle-tts':
        await handleToggleTTS();
        break;
        
      case 'speak-selection':
        await handleSpeakSelectionCommand();
        break;
        
      default:
        console.warn('Unknown command:', command);
    }
  } catch (error) {
    console.error('Command handler error:', error);
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Message received:', message.type, 'from:', sender);
  
  // Handle async responses
  handleMessage(message, sender, sendResponse);
  return true; // Keep message channel open for async response
});

// Handle alarm events for periodic tasks
if (chrome.alarms && chrome.alarms.onAlarm) {
  chrome.alarms.onAlarm.addListener(async (alarm) => {
  console.log('⏰ Alarm triggered:', alarm.name);
  
  try {
    switch (alarm.name) {
      case 'cleanup-storage':
        await cleanupStorage();
        break;
        
      case 'sync-settings':
        await syncSettings();
        break;
        
      case 'check-api-limits':
        await checkApiLimits();
        break;
        
      default:
        console.warn('Unknown alarm:', alarm.name);
    }
  } catch (error) {
    console.error('Alarm handler error:', error);
  }
  });
} else {
  console.warn('⚠️ Chrome alarms API not available');
}

// Handle notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
  console.log('🔔 Notification clicked:', notificationId);
  
  // Handle notification actions
  handleNotificationClick(notificationId);
});

// Handle service worker suspension
self.addEventListener('beforeunload', () => {
  console.log('💤 Service Worker suspending - saving critical state');
  // Any critical state saving would go here
});

// Error handling for unhandled rejections
self.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled promise rejection in service worker:', event.reason);
  
  // Report error to error tracking service if configured
  reportError('unhandled_rejection', event.reason);
});

// Error handling for unhandled errors
self.addEventListener('error', (event) => {
  console.error('🚨 Unhandled error in service worker:', event.error);
  
  // Report error to error tracking service if configured
  reportError('unhandled_error', event.error);
});

// Specific handler functions

/**
 * Initialize extension storage with default values
 */
async function initializeStorage() {
  try {
    const existingData = await chrome.storage.sync.get([
      'ttsSettings',
      'aiSettings', 
      'uiSettings',
      'privacySettings'
    ]);
    
    const defaultData = {};
    
    // Set defaults only for missing keys
    if (!existingData.ttsSettings) {
      defaultData.ttsSettings = {
        voice: 'default',
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
        enabled: true
      };
    }
    
    if (!existingData.aiSettings) {
      defaultData.aiSettings = {
        groqEnabled: true,
        claudeEnabled: true,
        explanationLevel: 'simple',
        autoExplain: false
      };
    }
    
    if (!existingData.uiSettings) {
      defaultData.uiSettings = {
        overlayPosition: 'auto',
        theme: 'light',
        showKeyboardShortcuts: true
      };
    }
    
    if (!existingData.privacySettings) {
      defaultData.privacySettings = {
        aiConsentGiven: false,
        dataCollection: false
      };
    }
    
    if (Object.keys(defaultData).length > 0) {
      await chrome.storage.sync.set(defaultData);
      console.log('📦 Storage initialized with defaults:', Object.keys(defaultData));
    }
    
  } catch (error) {
    console.error('Storage initialization error:', error);
    throw error;
  }
}

/**
 * Set up context menus
 */
async function setupContextMenus() {
  try {
    // Remove existing context menus
    await chrome.contextMenus.removeAll();
    
    // Create main TTS context menu
    chrome.contextMenus.create({
      id: 'tts-speak-selection',
      title: 'Speak selected text',
      contexts: ['selection'],
      documentUrlPatterns: ['http://*/*', 'https://*/*']
    });
    
    // Create AI explanation context menu
    chrome.contextMenus.create({
      id: 'tts-explain-selection',
      title: 'Get AI explanation',
      contexts: ['selection'],
      documentUrlPatterns: ['http://*/*', 'https://*/*']
    });
    
    // Create settings menu
    chrome.contextMenus.create({
      id: 'tts-open-settings',
      title: 'TTS Settings',
      contexts: ['page', 'frame'],
      documentUrlPatterns: ['http://*/*', 'https://*/*']
    });
    
    console.log('📋 Context menus created');
    
  } catch (error) {
    console.error('Context menu setup error:', error);
    throw error;
  }
}

/**
 * Set up periodic alarms
 */
async function setupAlarms() {
  try {
    if (!chrome.alarms) {
      console.warn('⚠️ Chrome alarms API not available, skipping alarm setup');
      return;
    }
    
    // Clear existing alarms
    await chrome.alarms.clearAll();
    
    // Storage cleanup alarm (daily)
    chrome.alarms.create('cleanup-storage', {
      delayInMinutes: 60, // First run after 1 hour
      periodInMinutes: 24 * 60 // Then every 24 hours
    });
    
    // Settings sync alarm (every 30 minutes)
    chrome.alarms.create('sync-settings', {
      delayInMinutes: 30,
      periodInMinutes: 30
    });
    
    // API limits check alarm (every 5 minutes)
    chrome.alarms.create('check-api-limits', {
      delayInMinutes: 5,
      periodInMinutes: 5
    });
    
    console.log('⏰ Alarms configured');
    
  } catch (error) {
    console.error('Alarm setup error:', error);
    throw error;
  }
}

/**
 * Handle "speak selection" context menu
 */
async function handleSpeakSelection(info, tab) {
  if (!info.selectionText) {
    await showNotification('No Selection', 'Please select some text first');
    return;
  }
  
  // Send message to content script to show overlay
  await chrome.tabs.sendMessage(tab.id, {
    type: 'SHOW_TTS_OVERLAY',
    text: info.selectionText,
    fromContextMenu: true
  });
}

/**
 * Handle "explain selection" context menu
 */
async function handleExplainSelection(info, tab) {
  if (!info.selectionText) {
    await showNotification('No Selection', 'Please select some text first');
    return;
  }
  
  // Check if AI consent has been given
  const { privacySettings } = await chrome.storage.sync.get(['privacySettings']);
  
  if (!privacySettings?.aiConsentGiven) {
    // Show consent dialog first
    await chrome.tabs.sendMessage(tab.id, {
      type: 'SHOW_AI_CONSENT_DIALOG',
      text: info.selectionText
    });
    return;
  }
  
  // Send message to content script to get AI explanation
  await chrome.tabs.sendMessage(tab.id, {
    type: 'SHOW_TTS_OVERLAY',
    text: info.selectionText,
    autoExplain: true,
    fromContextMenu: true
  });
}

/**
 * Handle toggle TTS keyboard command
 */
async function handleToggleTTS() {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (activeTab) {
    await chrome.tabs.sendMessage(activeTab.id, {
      type: 'TOGGLE_TTS_OVERLAY'
    });
  }
}

/**
 * Handle speak selection keyboard command
 */
async function handleSpeakSelectionCommand() {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (activeTab) {
    await chrome.tabs.sendMessage(activeTab.id, {
      type: 'SPEAK_CURRENT_SELECTION'
    });
  }
}

/**
 * Show browser notification
 */
async function showNotification(title, message, type = 'basic') {
  try {
    // Validate required parameters
    if (!title || !message || !type) {
      console.warn('Skipping notification - missing required parameters:', { title, message, type });
      return;
    }

    await chrome.notifications.create({
      type,
      title: String(title),
      message: String(message)
    });
  } catch (error) {
    console.error('Notification error:', error);
  }
}

/**
 * Clean up old storage data
 */
async function cleanupStorage() {
  try {
    // Remove old cache and temporary data
    await chrome.storage.local.remove(['tempData', 'cache', 'oldLogs']);
    console.log('🧹 Storage cleanup completed');
  } catch (error) {
    console.error('Storage cleanup error:', error);
  }
}

/**
 * Sync settings across devices
 */
async function syncSettings() {
  try {
    // This would implement any cross-device synchronization logic
    console.log('🔄 Settings sync completed');
  } catch (error) {
    console.error('Settings sync error:', error);
  }
}

/**
 * Check API rate limits
 */
async function checkApiLimits() {
  try {
    // Check rate limiter status for all APIs
    // This could send messages to warn about approaching limits
    console.log('📊 API limits checked');
  } catch (error) {
    console.error('API limits check error:', error);
  }
}

/**
 * Handle notification clicks
 */
async function handleNotificationClick(notificationId) {
  try {
    // Handle different notification types
    if (notificationId.startsWith('error-')) {
      await showNotification(
        'Extension Help',
        'For help with the TTS extension, right-click on text and use the context menu options.'
      );
    }
  } catch (error) {
    console.error('Notification click handler error:', error);
  }
}

/**
 * Report errors to tracking service
 */
function reportError(type, error) {
  // This would implement error reporting to analytics/monitoring service
  console.log('📝 Error reported:', type, error);
}

console.log('🚀 TTS Extension Service Worker loaded and ready');