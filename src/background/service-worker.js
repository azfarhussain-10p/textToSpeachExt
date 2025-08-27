/**
 * Service Worker for Intelligent TTS Extension
 * Handles extension lifecycle, cross-context messaging, and API coordination
 */

// Extension lifecycle management
chrome.runtime.onInstalled.addListener((details) => {
  console.log('TTS Extension installed:', details.reason);
  
  if (details.reason === 'install') {
    initializeExtension();
  } else if (details.reason === 'update') {
    handleUpdate(details.previousVersion);
  }
});

chrome.runtime.onStartup.addListener(() => {
  console.log('TTS Extension startup');
  initializeExtension();
});

// Initialize extension with default settings
async function initializeExtension() {
  try {
    const defaultSettings = {
      ttsSettings: {
        voice: null, // Will be set to default system voice
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
        language: 'en-US'
      },
      aiSettings: {
        provider: 'groq', // Default to free Groq API
        enableExplanations: true,
        explanationLength: 'medium'
      },
      uiSettings: {
        theme: 'auto',
        overlayPosition: 'bottom-right',
        keyboardShortcuts: true
      },
      privacySettings: {
        aiExplanationsConsent: false, // User must explicitly consent
        dataCollection: false,
        analytics: false
      }
    };

    // Only set defaults if not already configured
    const currentSettings = await chrome.storage.sync.get();
    if (!currentSettings.ttsSettings) {
      await chrome.storage.sync.set(defaultSettings);
      console.log('Default settings initialized');
    }
  } catch (error) {
    console.error('Failed to initialize extension:', error);
  }
}

// Handle extension updates
async function handleUpdate(previousVersion) {
  console.log(`Updated from version ${previousVersion}`);
  // Migration logic if needed for future updates
}

// Cross-context messaging hub
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Service worker received message:', message.type, 'from:', sender.tab?.url || 'popup');
  
  switch (message.type) {
    case 'TTS_START':
      handleTTSStart(message.data, sender, sendResponse);
      break;
    
    case 'TTS_STOP':
      handleTTSStop(message.data, sender, sendResponse);
      break;
    
    case 'AI_EXPLAIN':
      handleAIExplanation(message.data, sender, sendResponse);
      break;
    
    case 'GET_SETTINGS':
      handleGetSettings(sendResponse);
      break;
    
    case 'UPDATE_SETTINGS':
      handleUpdateSettings(message.data, sendResponse);
      break;
    
    case 'GET_VOICES':
      handleGetVoices(sendResponse);
      break;
    
    default:
      console.warn('Unknown message type:', message.type);
      sendResponse({ success: false, error: 'Unknown message type' });
  }
  
  // Return true to indicate async response
  return true;
});

// TTS Start Handler
async function handleTTSStart(data, sender, sendResponse) {
  try {
    const { text, settings } = data;
    
    // Validate text content
    if (!text || text.trim().length === 0) {
      throw new Error('No text provided for TTS');
    }
    
    // Get current TTS settings
    const { ttsSettings } = await chrome.storage.sync.get(['ttsSettings']);
    const mergedSettings = { ...ttsSettings, ...settings };
    
    // Send message to content script to start TTS
    await chrome.tabs.sendMessage(sender.tab.id, {
      type: 'TTS_START_RESPONSE',
      data: {
        text,
        settings: mergedSettings,
        success: true
      }
    });
    
    sendResponse({ success: true });
  } catch (error) {
    console.error('TTS start failed:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// TTS Stop Handler
async function handleTTSStop(data, sender, sendResponse) {
  try {
    // Send message to content script to stop TTS
    await chrome.tabs.sendMessage(sender.tab.id, {
      type: 'TTS_STOP_RESPONSE',
      data: { success: true }
    });
    
    sendResponse({ success: true });
  } catch (error) {
    console.error('TTS stop failed:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// AI Explanation Handler
async function handleAIExplanation(data, sender, sendResponse) {
  try {
    const { text, context } = data;
    
    // Check user consent for AI services
    const { privacySettings } = await chrome.storage.sync.get(['privacySettings']);
    if (!privacySettings.aiExplanationsConsent) {
      throw new Error('User consent required for AI explanations');
    }
    
    // Get AI settings
    const { aiSettings } = await chrome.storage.sync.get(['aiSettings']);
    
    let explanation;
    if (aiSettings.provider === 'groq') {
      explanation = await getGroqExplanation(text, context, aiSettings);
    } else if (aiSettings.provider === 'claude') {
      explanation = await getClaudeExplanation(text, context, aiSettings);
    } else {
      throw new Error('Invalid AI provider');
    }
    
    sendResponse({ 
      success: true, 
      explanation,
      provider: aiSettings.provider 
    });
    
  } catch (error) {
    console.error('AI explanation failed:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Groq API Integration
async function getGroqExplanation(text, context, settings) {
  const { groqApiKey } = await chrome.storage.sync.get(['groqApiKey']);
  
  if (!groqApiKey) {
    throw new Error('Groq API key not configured');
  }
  
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192', // Fast, free model
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that explains text content clearly and concisely. 
                   Explanation length should be ${settings.explanationLength}.
                   Focus on making complex concepts understandable.`
        },
        {
          role: 'user',
          content: `Please explain this text: "${text}"
                   ${context ? `Context: ${context}` : ''}`
        }
      ],
      max_tokens: settings.explanationLength === 'short' ? 150 : 
                 settings.explanationLength === 'long' ? 500 : 300,
      temperature: 0.7
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Groq API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
  }
  
  const data = await response.json();
  return data.choices[0]?.message?.content || 'No explanation generated';
}

// Claude API Integration (Premium fallback)
async function getClaudeExplanation(text, context, settings) {
  const { claudeApiKey } = await chrome.storage.sync.get(['claudeApiKey']);
  
  if (!claudeApiKey) {
    throw new Error('Claude API key not configured');
  }
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': claudeApiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307', // Fast, cost-effective
      max_tokens: settings.explanationLength === 'short' ? 150 : 
                 settings.explanationLength === 'long' ? 500 : 300,
      messages: [
        {
          role: 'user',
          content: `Please explain this text clearly and concisely: "${text}"
                   ${context ? `Context: ${context}` : ''}
                   Explanation length: ${settings.explanationLength}`
        }
      ]
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Claude API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
  }
  
  const data = await response.json();
  return data.content[0]?.text || 'No explanation generated';
}

// Settings Handlers
async function handleGetSettings(sendResponse) {
  try {
    const settings = await chrome.storage.sync.get();
    sendResponse({ success: true, settings });
  } catch (error) {
    console.error('Failed to get settings:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleUpdateSettings(data, sendResponse) {
  try {
    await chrome.storage.sync.set(data);
    sendResponse({ success: true });
  } catch (error) {
    console.error('Failed to update settings:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Voice Information Handler
async function handleGetVoices(sendResponse) {
  try {
    // Since Service Worker doesn't have access to speechSynthesis,
    // we'll request this from the content script
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]) {
      const response = await chrome.tabs.sendMessage(tabs[0].id, {
        type: 'GET_VOICES_REQUEST'
      });
      sendResponse(response);
    } else {
      throw new Error('No active tab found');
    }
  } catch (error) {
    console.error('Failed to get voices:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Context menu setup (optional feature)
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'tts-speak',
    title: 'Speak selected text',
    contexts: ['selection']
  });
  
  chrome.contextMenus.create({
    id: 'tts-explain',
    title: 'Explain with AI',
    contexts: ['selection']
  });
});

// Context menu handlers
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'tts-speak' && info.selectionText) {
    await chrome.tabs.sendMessage(tab.id, {
      type: 'TTS_CONTEXT_MENU',
      data: { text: info.selectionText, action: 'speak' }
    });
  } else if (info.menuItemId === 'tts-explain' && info.selectionText) {
    await chrome.tabs.sendMessage(tab.id, {
      type: 'TTS_CONTEXT_MENU',
      data: { text: info.selectionText, action: 'explain' }
    });
  }
});

// Error handling and logging
chrome.runtime.onSuspend.addListener(() => {
  console.log('TTS Extension service worker suspending');
});

// Keep service worker alive during active TTS sessions
let keepAliveInterval;

function _startKeepAlive() {
  if (keepAliveInterval) return;
  
  keepAliveInterval = setInterval(() => {
    chrome.storage.local.set({ keepAlive: Date.now() });
  }, 20000); // 20 seconds
}

function _stopKeepAlive() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeExtension,
    handleTTSStart,
    handleTTSStop,
    handleAIExplanation,
    getGroqExplanation,
    getClaudeExplanation
  };
}