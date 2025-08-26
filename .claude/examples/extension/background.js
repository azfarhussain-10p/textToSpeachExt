// background.js - Comprehensive Manifest V3 Service Worker with Cross-Browser Compatibility

// Assume webextension-polyfill is included before this script in manifest.json
// This enables 'browser' API in Chrome, aligning with Firefox

// For Chrome without polyfill: if (typeof browser === 'undefined') { var browser = chrome; }

// Event listener for extension installation or update
browser.runtime.onInstalled.addListener(async (details) => {
  console.log('Extension installed/updated:', details.reason);
  try {
    // Initialize default storage values
    await browser.storage.local.set({
      userSettings: { theme: 'light', notificationsEnabled: true },
      lastUpdate: new Date().toISOString()
    });
    console.log('Default settings initialized.');

    // Open options page on first install (cross-browser safe)
    if (details.reason === 'install') {
      await browser.runtime.openOptionsPage();
    }
  } catch (error) {
    console.error('Error during installation:', error);
  }
});

// Message listener for communication from content scripts or popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message, 'from:', sender);

  // Handle different action types
  switch (message.action) {
    case 'getSettings':
      browser.storage.local.get('userSettings').then((data) => {
        sendResponse(data.userSettings || {});
      }).catch((error) => {
        console.error('Error getting settings:', error);
        sendResponse({ error: 'Failed to retrieve settings' });
      });
      return true; // Keep message channel open for async response

    case 'setSettings':
      browser.storage.local.set({ userSettings: message.data }).then(() => {
        sendResponse({ success: true });
      }).catch((error) => {
        console.error('Error setting settings:', error);
        sendResponse({ error: 'Failed to save settings' });
      });
      return true;

    case 'createNotification':
      browser.notifications.create({
        type: 'basic',
        iconUrl: browser.runtime.getURL('icons/icon48.png'),
        title: message.title || 'Extension Alert',
        message: message.content || 'Default message'
      }).then((id) => {
        sendResponse({ id });
      }).catch((error) => {
        console.error('Error creating notification:', error);
        sendResponse({ error: 'Notification failed' });
      });
      return true;

    case 'queryTabs':
      browser.tabs.query({ currentWindow: true }).then((tabs) => {
        sendResponse(tabs.map(tab => ({ id: tab.id, title: tab.title })));
      }).catch((error) => {
        console.error('Error querying tabs:', error);
        sendResponse({ error: 'Tab query failed' });
      });
      return true;

    default:
      sendResponse({ error: 'Unknown action' });
  }
});

// Alarm listener for periodic tasks (e.g., data sync every 5 minutes)
browser.alarms.create('periodicSync', { periodInMinutes: 5 });

browser.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'periodicSync') {
    console.log('Performing periodic sync at:', new Date().toISOString());
    try {
      // Example: Fetch and store data (use fetch if "declarativeNetRequest" permitted)
      const response = await fetch('https://api.example.com/data');
      const data = await response.json();
      await browser.storage.local.set({ syncedData: data });
      console.log('Sync completed.');
    } catch (error) {
      console.error('Sync error:', error);
    }
  }
});

// Handle suspension (service worker unloading in Chrome)
browser.runtime.onSuspend.addListener(() => {
  console.log('Service worker suspending. Saving critical state if needed.');
  // Any last-minute state saving
});

// Error handling for unhandled rejections
self.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Log startup for debugging
console.log('Background service worker started.');