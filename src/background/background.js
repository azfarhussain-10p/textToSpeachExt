/**
 * Firefox/Safari Background Script (Manifest V2)
 * Background script for Firefox and Safari browsers
 */

// Load shared background functionality
if (typeof importScripts !== 'undefined') {
  importScripts('./background-shared.js');
} else {
  // For browsers that don't support importScripts in background context
  const script = document.createElement('script');
  script.src = './background-shared.js';
  document.head.appendChild(script);
}

// Get the appropriate browser API
const browserAPI = (typeof browser !== 'undefined') ? browser : chrome;

// Extension installation and startup
browserAPI.runtime.onInstalled.addListener(async (details) => {
  console.log('🚀 TTS Extension installed/updated:', details.reason);
  
  try {
    // Initialize storage with default settings
    await initializeStorageManifestV2();
    
    // Create context menus
    await setupContextMenusManifestV2();
    
    // Open options page on first install
    if (details.reason === 'install') {
      await browserAPI.runtime.openOptionsPage();
    }
    
    console.log('✅ Extension initialization completed');
    
  } catch (error) {
    console.error('❌ Extension initialization failed:', error);
  }
});

// Handle context menu clicks
browserAPI.contextMenus.onClicked.addListener(async (info, tab) => {
  console.log('📱 Context menu clicked:', info.menuItemId);
  
  try {
    switch (info.menuItemId) {
      case 'tts-speak-selection':
        await handleSpeakSelectionManifestV2(info, tab);
        break;
        
      case 'tts-explain-selection':
        await handleExplainSelectionManifestV2(info, tab);
        break;
        
      case 'tts-open-settings':
        await browserAPI.runtime.openOptionsPage();
        break;
        
      default:
        console.warn('Unknown context menu item:', info.menuItemId);
    }
  } catch (error) {
    console.error('Context menu handler error:', error);
    await showNotificationManifestV2('Error', 'Failed to process context menu action');
  }
});

// Handle keyboard commands
browserAPI.commands.onCommand.addListener(async (command) => {
  console.log('⌨️ Keyboard command:', command);
  
  try {
    switch (command) {
      case 'toggle-tts':
        await handleToggleTTSManifestV2();
        break;
        
      case 'speak-selection':
        await handleSpeakSelectionCommandManifestV2();
        break;
        
      default:
        console.warn('Unknown command:', command);
    }
  } catch (error) {
    console.error('Command handler error:', error);
  }
});

// Handle messages from content scripts and popup
browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Message received:', message.type, 'from:', sender);
  
  // Use the shared message handler
  handleMessage(message, sender, sendResponse);
  return true; // Keep message channel open for async response
});

// Handle notification clicks (if supported)
if (browserAPI.notifications && browserAPI.notifications.onClicked) {
  browserAPI.notifications.onClicked.addListener((notificationId) => {
    console.log('🔔 Notification clicked:', notificationId);
    handleNotificationClickManifestV2(notificationId);
  });
}

// Manifest V2 specific implementations

/**
 * Initialize storage for Manifest V2
 */
async function initializeStorageManifestV2() {
  try {
    const existingData = await browserAPI.storage.sync.get([
      'ttsSettings',
      'aiSettings', 
      'uiSettings',
      'privacySettings'
    ]);
    
    const defaultData = {};
    
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
      await browserAPI.storage.sync.set(defaultData);
      console.log('📦 Storage initialized with defaults:', Object.keys(defaultData));
    }
    
  } catch (error) {
    console.error('Storage initialization error:', error);
    throw error;
  }
}

/**
 * Set up context menus for Manifest V2
 */
async function setupContextMenusManifestV2() {
  try {
    // Remove existing context menus
    await browserAPI.contextMenus.removeAll();
    
    // Create main TTS context menu
    browserAPI.contextMenus.create({
      id: 'tts-speak-selection',
      title: 'Speak selected text',
      contexts: ['selection'],
      documentUrlPatterns: ['http://*/*', 'https://*/*']
    });
    
    // Create AI explanation context menu
    browserAPI.contextMenus.create({
      id: 'tts-explain-selection',
      title: 'Get AI explanation',
      contexts: ['selection'],
      documentUrlPatterns: ['http://*/*', 'https://*/*']
    });
    
    // Create settings menu
    browserAPI.contextMenus.create({
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
 * Handle "speak selection" context menu for Manifest V2
 */
async function handleSpeakSelectionManifestV2(info, tab) {
  if (!info.selectionText) {
    await showNotificationManifestV2('No Selection', 'Please select some text first');
    return;
  }
  
  try {
    // Send message to content script to show overlay
    await browserAPI.tabs.sendMessage(tab.id, {
      type: 'SHOW_TTS_OVERLAY',
      text: info.selectionText,
      fromContextMenu: true
    });
  } catch (error) {
    console.error('Failed to send message to content script:', error);
    await showNotificationManifestV2('Error', 'Failed to communicate with page. Please refresh and try again.');
  }
}

/**
 * Handle "explain selection" context menu for Manifest V2
 */
async function handleExplainSelectionManifestV2(info, tab) {
  if (!info.selectionText) {
    await showNotificationManifestV2('No Selection', 'Please select some text first');
    return;
  }
  
  try {
    // Check if AI consent has been given
    const { privacySettings } = await browserAPI.storage.sync.get(['privacySettings']);
    
    if (!privacySettings?.aiConsentGiven) {
      // Show consent dialog first
      await browserAPI.tabs.sendMessage(tab.id, {
        type: 'SHOW_AI_CONSENT_DIALOG',
        text: info.selectionText
      });
      return;
    }
    
    // Send message to content script to get AI explanation
    await browserAPI.tabs.sendMessage(tab.id, {
      type: 'SHOW_TTS_OVERLAY',
      text: info.selectionText,
      autoExplain: true,
      fromContextMenu: true
    });
  } catch (error) {
    console.error('Failed to handle explain selection:', error);
    await showNotificationManifestV2('Error', 'Failed to process explanation request.');
  }
}

/**
 * Handle toggle TTS keyboard command for Manifest V2
 */
async function handleToggleTTSManifestV2() {
  try {
    const activeTabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
    
    if (activeTabs.length > 0) {
      await browserAPI.tabs.sendMessage(activeTabs[0].id, {
        type: 'TOGGLE_TTS_OVERLAY'
      });
    }
  } catch (error) {
    console.error('Toggle TTS command error:', error);
  }
}

/**
 * Handle speak selection keyboard command for Manifest V2
 */
async function handleSpeakSelectionCommandManifestV2() {
  try {
    const activeTabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
    
    if (activeTabs.length > 0) {
      await browserAPI.tabs.sendMessage(activeTabs[0].id, {
        type: 'SPEAK_CURRENT_SELECTION'
      });
    }
  } catch (error) {
    console.error('Speak selection command error:', error);
  }
}

/**
 * Show notification for Manifest V2
 */
async function showNotificationManifestV2(title, message, type = 'basic') {
  try {
    // Validate required parameters
    if (!title || !message || !type) {
      console.warn('Skipping notification - missing required parameters:', { title, message, type });
      return;
    }

    if (browserAPI.notifications && browserAPI.notifications.create) {
      await browserAPI.notifications.create({
        type,
        title: String(title),
        message: String(message)
      });
    } else {
      // Fallback: log to console if notifications aren't available
      console.log(`📢 ${title}: ${message}`);
    }
  } catch (error) {
    console.error('Notification error:', error);
  }
}

/**
 * Handle notification clicks for Manifest V2
 */
async function handleNotificationClickManifestV2(notificationId) {
  try {
    // Handle different notification types
    if (notificationId && notificationId.startsWith('error-')) {
      await browserAPI.runtime.openOptionsPage();
    }
  } catch (error) {
    console.error('Notification click handler error:', error);
  }
}

// Set up periodic tasks (simpler than Chrome's alarms API)
function setupPeriodicTasks() {
  // Storage cleanup every hour
  setInterval(async () => {
    try {
      await browserAPI.storage.local.remove(['tempData', 'cache', 'oldLogs']);
      console.log('🧹 Periodic storage cleanup completed');
    } catch (error) {
      console.error('Periodic cleanup error:', error);
    }
  }, 60 * 60 * 1000); // 1 hour
  
  // Settings sync every 30 minutes  
  setInterval(async () => {
    try {
      // This would implement any cross-device synchronization logic
      console.log('🔄 Periodic settings sync completed');
    } catch (error) {
      console.error('Periodic sync error:', error);
    }
  }, 30 * 60 * 1000); // 30 minutes
}

// Initialize periodic tasks
setupPeriodicTasks();

// Handle browser-specific startup
browserAPI.runtime.onStartup.addListener(() => {
  console.log('🔄 Extension started up');
  
  // Re-initialize periodic tasks if needed
  setupPeriodicTasks();
});

// Handle extension suspend/shutdown
if (browserAPI.runtime.onSuspend) {
  browserAPI.runtime.onSuspend.addListener(() => {
    console.log('💤 Extension suspending');
    // Clean up any timers or intervals if needed
  });
}

console.log('🚀 TTS Extension Background Script (Manifest V2) loaded and ready');