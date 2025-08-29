/**
 * Content Script - Main entry point for page interaction
 * Handles text selection, overlay injection, and communication with background script
 */

// Content script initialization
(function() {
  'use strict';

  // State management
  let isExtensionEnabled = true;
  let overlayInstance = null;
  let currentSelection = null;
  let ttsService = null;
  let aiService = null;

  // Configuration
  const CONFIG = {
    minSelectionLength: 3,
    maxSelectionLength: 10000,
    overlayDelay: 500,
    keyboardShortcuts: {
      'ctrl+shift+t': 'toggle-overlay',
      'ctrl+shift+s': 'speak-selection',
      'esc': 'close-overlay'
    }
  };

  // DOM elements cache
  const DOM = {
    overlay: null,
    selectionTooltip: null
  };

  /**
   * Initialize content script
   */
  async function initialize() {
    try {
      console.log('🚀 TTS Content Script initializing...');

      // Load user settings
      await loadSettings();

      // Set up event listeners
      setupEventListeners();

      // Initialize services
      await initializeServices();

      // Set up keyboard shortcuts
      setupKeyboardShortcuts();

      // Inject necessary styles
      injectStyles();

      console.log('✅ TTS Content Script initialized successfully');

    } catch (error) {
      console.error('❌ Content Script initialization failed:', error);
    }
  }

  /**
   * Set up event listeners for text selection and user interaction
   */
  function setupEventListeners() {
    // Text selection events
    document.addEventListener('mouseup', handleTextSelection);
    document.addEventListener('keyup', handleTextSelection);
    document.addEventListener('touchend', handleTextSelection);

    // Background script communication
    setupMessageListener();

    // Page lifecycle events
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', cleanup);

    // Selection change events
    document.addEventListener('selectionchange', debounce(handleSelectionChange, 300));
  }

  /**
   * Handle text selection events
   */
  function handleTextSelection(event) {
    setTimeout(() => {
      console.log('📝 handleTextSelection triggered by:', event.type);
      
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();
      
      console.log('📝 Selected text:', selectedText.substring(0, 100) + '...');
      console.log('📝 Text length:', selectedText.length);

      if (selectedText.length === 0) {
        console.log('📝 No text selected, hiding tooltip');
        hideSelectionTooltip();
        currentSelection = null;
        return;
      }

      if (selectedText.length < CONFIG.minSelectionLength) {
        console.log('📝 Text too short, minimum length:', CONFIG.minSelectionLength);
        return;
      }

      if (selectedText.length > CONFIG.maxSelectionLength) {
        console.warn('📝 Selected text too long:', selectedText.length, 'max:', CONFIG.maxSelectionLength);
        return;
      }

      console.log('📝 Text selection valid, creating tooltip...');

      // Update current selection
      currentSelection = {
        text: selectedText,
        range: selection.getRangeAt(0).cloneRange(),
        timestamp: Date.now()
      };

      console.log('📝 Current selection updated:', currentSelection.text.substring(0, 50) + '...');

      // Show selection tooltip
      showSelectionTooltip(event, selectedText);

    }, 10); // Small delay to ensure selection is complete
  }

  /**
   * Handle selection change events (for keyboard selection)
   */
  function handleSelectionChange() {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText.length === 0 && currentSelection) {
      hideSelectionTooltip();
      currentSelection = null;
    }
  }

  /**
   * Show selection tooltip near the selected text
   */
  function showSelectionTooltip(event, text) {
    console.log('💬 Creating selection tooltip with text:', text?.substring(0, 50) + '...');
    
    hideSelectionTooltip(); // Remove existing tooltip

    const tooltip = document.createElement('div');
    tooltip.className = 'tts-selection-tooltip';
    
    console.log('💬 Tooltip element created:', tooltip);
    
    // Create speak button safely
    const speakBtn = document.createElement('button');
    speakBtn.className = 'tts-tooltip-btn tts-speak-btn';
    speakBtn.title = 'Speak selected text (Ctrl+Shift+S)';
    const speakIcon = document.createElement('span');
    speakIcon.className = 'tts-icon';
    speakIcon.textContent = '🔊';
    speakBtn.appendChild(speakIcon);
    
    // Create explain button safely
    const explainBtn = document.createElement('button');
    explainBtn.className = 'tts-tooltip-btn tts-explain-btn';
    explainBtn.title = 'Get AI explanation';
    const explainIcon = document.createElement('span');
    explainIcon.className = 'tts-icon';
    explainIcon.textContent = '🤖';
    explainBtn.appendChild(explainIcon);
    
    // Create more button safely
    const moreBtn = document.createElement('button');
    moreBtn.className = 'tts-tooltip-btn tts-more-btn';
    moreBtn.title = 'More options';
    const moreIcon = document.createElement('span');
    moreIcon.className = 'tts-icon';
    moreIcon.textContent = '⚙️';
    moreBtn.appendChild(moreIcon);
    
    // Append buttons to tooltip
    tooltip.appendChild(speakBtn);
    tooltip.appendChild(explainBtn);
    tooltip.appendChild(moreBtn);

    // Position tooltip
    const rect = window.getSelection().getRangeAt(0).getBoundingClientRect();
    tooltip.style.position = 'fixed';
    tooltip.style.left = `${rect.left + (rect.width / 2) - 60}px`;
    tooltip.style.top = `${rect.top - 50}px`;
    tooltip.style.zIndex = '10000';

    // Add event listeners using the created elements
    speakBtn.addEventListener('click', (event) => {
      console.log('🔊 Tooltip speak button clicked!');
      console.log('🔊 Text to speak:', text?.substring(0, 100) + '...');
      
      event.preventDefault();
      event.stopPropagation();
      
      try {
        showTTSOverlay(text, { autoPlay: true });
        hideSelectionTooltip();
        console.log('✅ showTTSOverlay called from tooltip');
      } catch (error) {
        console.error('❌ Error calling showTTSOverlay:', error);
      }
    });

    explainBtn.addEventListener('click', async () => {
      const hasConsent = await checkAIConsent();
      if (hasConsent) {
        showTTSOverlay(text, { autoExplain: true });
      } else {
        showConsentDialog(text);
      }
      hideSelectionTooltip();
    });

    moreBtn.addEventListener('click', (event) => {
      console.log('⚙️ Tooltip more button clicked!');
      console.log('⚙️ Text to show in overlay:', text?.substring(0, 100) + '...');
      
      event.preventDefault();
      event.stopPropagation();
      
      try {
        showTTSOverlay(text);
        hideSelectionTooltip();
        console.log('✅ showTTSOverlay called from more button');
      } catch (error) {
        console.error('❌ Error calling showTTSOverlay from more button:', error);
      }
    });

    document.body.appendChild(tooltip);
    DOM.selectionTooltip = tooltip;
    
    console.log('💬 Tooltip added to page, DOM.selectionTooltip:', DOM.selectionTooltip);
    console.log('💬 Speak button element:', speakBtn);
    console.log('💬 Tooltip position:', tooltip.style.left, tooltip.style.top);

    // Auto-hide after 5 seconds
    setTimeout(hideSelectionTooltip, 5000);
  }

  /**
   * Hide selection tooltip
   */
  function hideSelectionTooltip() {
    if (DOM.selectionTooltip) {
      DOM.selectionTooltip.remove();
      DOM.selectionTooltip = null;
    }
  }

  /**
   * Show TTS overlay with selected text
   */
  function showTTSOverlay(text, options = {}) {
    try {
      console.log('🚀 showTTSOverlay called with text:', text?.substring(0, 100) + '...');
      console.log('🚀 Options:', options);
      
      if (!text || !text.trim()) {
        console.warn('❌ No text provided to showTTSOverlay');
        return;
      }

      // Check if extension context is still valid
      if (!chrome.runtime || !chrome.runtime.getURL) {
        console.warn('Extension context invalidated, overlay cannot be shown');
        return;
      }

      // Remove existing overlay
      if (DOM.overlay) {
        DOM.overlay.remove();
      }

      // Create overlay iframe for security isolation
      const overlay = document.createElement('iframe');
      overlay.className = 'tts-overlay-iframe';
      overlay.src = chrome.runtime.getURL('overlay/overlay.html');
      
      overlay.style.cssText = `
        position: fixed !important;
        top: 20px !important;
        right: 20px !important;
        width: 380px !important;
        height: auto !important;
        min-height: 250px !important;
        max-height: 85vh !important;
        border: none !important;
        border-radius: 12px !important;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
        background: white !important;
        z-index: 2147483647 !important;
        resize: both !important;
        overflow: auto !important;
      `;

      // Wait for iframe to load then send data
      overlay.onload = () => {
        console.log('🎬 Overlay iframe loaded, sending init message...');
        console.log('📤 Sending text:', text.trim().substring(0, 100) + '...');
        console.log('📤 Sending options:', options);
        
        // Add small delay to ensure iframe is fully ready
        setTimeout(() => {
          console.log('📤 Sending INIT_OVERLAY message now...');
          
          const message = {
            type: 'INIT_OVERLAY',
            data: {
              text: text.trim(),
              options
            }
          };
          
          console.log('📤 Message object:', message);
          
          overlay.contentWindow.postMessage(message, '*');
          
          console.log('✅ Init message sent to overlay');
          
          // Retry after 100ms if needed
          setTimeout(() => {
            console.log('📤 Sending retry message...');
            overlay.contentWindow.postMessage(message, '*');
          }, 100);
        }, 50);
      };

      // Add error handling for iframe loading
      overlay.onerror = (error) => {
        console.error('❌ Overlay iframe failed to load:', error);
      };

      document.body.appendChild(overlay);
      DOM.overlay = overlay;

      // Set up message listener for overlay communication
      setupOverlayMessageListener();
    } catch (error) {
      console.warn('Cannot show TTS overlay - extension context may be invalidated:', error.message);
      return;
    }
  }

  /**
   * Set up message listener for overlay communication
   */
  function setupOverlayMessageListener() {
    const messageListener = (event) => {
      // Verify origin
      if (event.source !== DOM.overlay?.contentWindow) {
        return;
      }

      const { type, data } = event.data;

      switch (type) {
        case 'OVERLAY_READY':
          console.log('📱 Overlay ready');
          break;

        case 'CLOSE_OVERLAY':
          closeTTSOverlay();
          break;

        case 'SPEAK_TEXT':
          handleSpeakRequest(data);
          break;

        case 'AI_EXPLAIN':
          handleAIExplainRequest(data);
          break;

        case 'OVERLAY_RESIZE':
          if (DOM.overlay) {
            if (data.height) {
              DOM.overlay.style.height = `${data.height}px`;
            }
            if (data.width) {
              DOM.overlay.style.width = `${data.width}px`;
            }
          }
          break;

        default:
          console.warn('Unknown overlay message:', type);
      }
    };

    window.addEventListener('message', messageListener);

    // Clean up listener when overlay is closed
    if (DOM.overlay) {
      DOM.overlay.onunload = () => {
        window.removeEventListener('message', messageListener);
      };
    }
  }

  /**
   * Close TTS overlay
   */
  function closeTTSOverlay() {
    if (DOM.overlay) {
      DOM.overlay.remove();
      DOM.overlay = null;
    }
  }

  /**
   * Handle speak request from overlay
   */
  async function handleSpeakRequest(data) {
    try {
      if (!ttsService) {
        throw new Error('TTS service not initialized');
      }

      const { text, settings } = data;
      await ttsService.speak(text, settings);

      // Send success message back to overlay
      if (DOM.overlay) {
        DOM.overlay.contentWindow.postMessage({
          type: 'SPEAK_SUCCESS'
        }, '*');
      }

    } catch (error) {
      console.error('Speak request failed:', error);
      
      if (DOM.overlay) {
        DOM.overlay.contentWindow.postMessage({
          type: 'SPEAK_ERROR',
          error: error.message
        }, '*');
      }
    }
  }

  /**
   * Handle AI explanation request
   */
  async function handleAIExplainRequest(data) {
    try {
      if (!aiService) {
        throw new Error('AI service not initialized');
      }

      const { text, level } = data;
      
      // Send loading state to overlay
      if (DOM.overlay) {
        DOM.overlay.contentWindow.postMessage({
          type: 'AI_EXPLAIN_LOADING'
        }, '*');
      }

      const result = await aiService.explainText(text, { level });

      // Send result to overlay
      if (DOM.overlay) {
        DOM.overlay.contentWindow.postMessage({
          type: 'AI_EXPLAIN_SUCCESS',
          result
        }, '*');
      }

    } catch (error) {
      console.error('AI explanation failed:', error);
      
      if (DOM.overlay) {
        DOM.overlay.contentWindow.postMessage({
          type: 'AI_EXPLAIN_ERROR',
          error: error.message
        }, '*');
      }
    }
  }

  /**
   * Set up message listener for background script communication
   */
  function setupMessageListener() {
    const browserAPI = typeof chrome !== 'undefined' ? chrome : browser;
    
    browserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('📨 Content script received message:', message.type);

      switch (message.type) {
        case 'SHOW_TTS_OVERLAY':
          showTTSOverlay(message.text, message.options || {});
          sendResponse({ success: true });
          break;

        case 'TOGGLE_TTS_OVERLAY':
          toggleTTSOverlay();
          sendResponse({ success: true });
          break;

        case 'SPEAK_CURRENT_SELECTION':
          handleSpeakCurrentSelection();
          sendResponse({ success: true });
          break;

        case 'SHOW_AI_CONSENT_DIALOG':
          showConsentDialog(message.text);
          sendResponse({ success: true });
          break;

        case 'EXECUTE_TTS':
          handleExecuteTTS(message.text, message.settings);
          sendResponse({ success: true });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown message type' });
      }

      return true; // Keep message channel open
    });
  }

  /**
   * Toggle TTS overlay (show/hide)
   */
  function toggleTTSOverlay() {
    if (DOM.overlay) {
      closeTTSOverlay();
    } else if (currentSelection) {
      showTTSOverlay(currentSelection.text);
    } else {
      // No selection, try to get any text from page
      const selectedText = window.getSelection().toString().trim();
      if (selectedText) {
        showTTSOverlay(selectedText);
      }
    }
  }

  /**
   * Handle speak current selection command
   */
  async function handleSpeakCurrentSelection() {
    const selectedText = window.getSelection().toString().trim();
    
    if (selectedText) {
      showTTSOverlay(selectedText, { autoPlay: true });
    } else {
      // No selection, show notification
      showNotification('No text selected', 'Please select some text to speak');
    }
  }

  /**
   * Handle direct TTS execution from background script
   */
  async function handleExecuteTTS(text, settings) {
    try {
      if (!ttsService) {
        throw new Error('TTS service not initialized');
      }

      await ttsService.speak(text, settings);
    } catch (error) {
      console.error('Direct TTS execution failed:', error);
      showNotification('TTS Error', error.message);
    }
  }

  /**
   * Set up keyboard shortcuts
   */
  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
      const key = [
        event.ctrlKey ? 'ctrl' : '',
        event.altKey ? 'alt' : '',
        event.shiftKey ? 'shift' : '',
        event.key.toLowerCase()
      ].filter(Boolean).join('+');

      const action = CONFIG.keyboardShortcuts[key];
      
      if (action) {
        event.preventDefault();
        handleKeyboardShortcut(action);
      }
    });
  }

  /**
   * Handle keyboard shortcut actions
   */
  function handleKeyboardShortcut(action) {
    switch (action) {
      case 'toggle-overlay':
        toggleTTSOverlay();
        break;
        
      case 'speak-selection':
        handleSpeakCurrentSelection();
        break;
        
      case 'close-overlay':
        closeTTSOverlay();
        break;
        
      default:
        console.warn('Unknown keyboard shortcut action:', action);
    }
  }

  /**
   * Load user settings from storage
   */
  async function loadSettings() {
    try {
      const browserAPI = typeof chrome !== 'undefined' ? chrome : browser;
      
      const result = await new Promise((resolve) => {
        browserAPI.storage.sync.get(['ttsSettings', 'uiSettings'], resolve);
      });

      // Apply settings
      if (result.ttsSettings) {
        // TTS settings will be applied when services are initialized
      }

      if (result.uiSettings) {
        isExtensionEnabled = result.uiSettings.enabled !== false;
      }

    } catch (error) {
      console.warn('Failed to load settings:', error);
    }
  }

  /**
   * Initialize TTS and AI services
   */
  async function initializeServices() {
    try {
      // Initialize TTS service
      if (typeof TTSService !== 'undefined') {
        ttsService = new TTSService();
        await ttsService.initialize();
      }

      // Initialize AI service
      if (typeof AIService !== 'undefined') {
        aiService = new AIService();
        await aiService.initialize();
      }

    } catch (error) {
      console.warn('Service initialization error:', error);
    }
  }

  /**
   * Check if user has given AI consent
   */
  async function checkAIConsent() {
    try {
      const browserAPI = typeof chrome !== 'undefined' ? chrome : browser;
      
      const result = await new Promise((resolve) => {
        browserAPI.storage.sync.get(['privacySettings'], resolve);
      });

      return result.privacySettings?.aiConsentGiven || false;

    } catch (error) {
      console.error('Failed to check AI consent:', error);
      return false;
    }
  }

  /**
   * Show AI consent dialog
   */
  function showConsentDialog(text) {
    // Create consent dialog
    const dialog = document.createElement('div');
    dialog.className = 'tts-consent-dialog';
    // Create consent content structure safely
    const consentContent = document.createElement('div');
    consentContent.className = 'tts-consent-content';
    
    // Create title
    const title = document.createElement('h3');
    title.textContent = 'AI Explanation Privacy Notice';
    consentContent.appendChild(title);
    
    // Create description paragraphs
    const p1 = document.createElement('p');
    p1.textContent = 'To provide AI explanations, your selected text will be sent to AI services (Groq or Claude). This helps generate intelligent explanations for the content you select.';
    consentContent.appendChild(p1);
    
    const p2 = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = 'Your privacy:';
    p2.appendChild(strong);
    p2.appendChild(document.createTextNode(' No personal data is stored. Text is only sent when you explicitly request explanations.'));
    consentContent.appendChild(p2);
    
    // Create action buttons container
    const actions = document.createElement('div');
    actions.className = 'tts-consent-actions';
    
    const allowBtn = document.createElement('button');
    allowBtn.className = 'tts-consent-allow';
    allowBtn.textContent = 'Allow AI Explanations';
    actions.appendChild(allowBtn);
    
    const denyBtn = document.createElement('button');
    denyBtn.className = 'tts-consent-deny';
    denyBtn.textContent = 'Not Now';
    actions.appendChild(denyBtn);
    
    consentContent.appendChild(actions);
    dialog.appendChild(consentContent);

    // Style the dialog
    dialog.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      background: rgba(0, 0, 0, 0.5) !important;
      z-index: 2147483647 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    `;

    // Handle consent response using created button elements
    allowBtn.addEventListener('click', async () => {
      await giveAIConsent();
      dialog.remove();
      showTTSOverlay(text, { autoExplain: true });
    });

    denyBtn.addEventListener('click', () => {
      dialog.remove();
    });

    // Close on background click
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) {
        dialog.remove();
      }
    });

    document.body.appendChild(dialog);
  }

  /**
   * Grant AI consent and save to storage
   */
  async function giveAIConsent() {
    try {
      const browserAPI = typeof chrome !== 'undefined' ? chrome : browser;
      
      await new Promise((resolve, reject) => {
        browserAPI.storage.sync.set({
          privacySettings: {
            aiConsentGiven: true,
            consentTimestamp: Date.now()
          }
        }, () => {
          if (browserAPI.runtime.lastError) {
            reject(new Error(browserAPI.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      });

    } catch (error) {
      console.error('Failed to save AI consent:', error);
    }
  }

  /**
   * Inject necessary CSS styles
   */
  function injectStyles() {
    if (document.getElementById('tts-content-styles')) {
      return; // Already injected
    }

    const styles = document.createElement('style');
    styles.id = 'tts-content-styles';
    styles.textContent = `
      .tts-selection-tooltip {
        background: #1a1a1a !important;
        border-radius: 8px !important;
        padding: 8px !important;
        display: flex !important;
        gap: 4px !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
        backdrop-filter: blur(10px) !important;
      }

      .tts-tooltip-btn {
        background: transparent !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        border-radius: 6px !important;
        color: white !important;
        padding: 8px !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
        font-size: 14px !important;
      }

      .tts-tooltip-btn:hover {
        background: rgba(255, 255, 255, 0.1) !important;
        border-color: rgba(255, 255, 255, 0.3) !important;
      }

      .tts-consent-dialog {
        font-family: system-ui, -apple-system, sans-serif !important;
      }

      .tts-consent-content {
        background: white !important;
        padding: 24px !important;
        border-radius: 12px !important;
        max-width: 500px !important;
        margin: 20px !important;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
      }

      .tts-consent-content h3 {
        margin: 0 0 16px 0 !important;
        color: #1a1a1a !important;
        font-size: 20px !important;
        font-weight: 600 !important;
      }

      .tts-consent-content p {
        margin: 0 0 12px 0 !important;
        color: #4a4a4a !important;
        line-height: 1.5 !important;
      }

      .tts-consent-actions {
        display: flex !important;
        gap: 12px !important;
        margin-top: 24px !important;
      }

      .tts-consent-allow, .tts-consent-deny {
        padding: 10px 20px !important;
        border-radius: 8px !important;
        border: none !important;
        font-weight: 500 !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
      }

      .tts-consent-allow {
        background: #007bff !important;
        color: white !important;
      }

      .tts-consent-allow:hover {
        background: #0056b3 !important;
      }

      .tts-consent-deny {
        background: #f8f9fa !important;
        color: #6c757d !important;
        border: 1px solid #dee2e6 !important;
      }

      .tts-consent-deny:hover {
        background: #e9ecef !important;
      }
    `;

    document.head.appendChild(styles);
  }

  /**
   * Handle page visibility changes
   */
  function handleVisibilityChange() {
    if (document.hidden) {
      // Page is hidden, pause TTS if playing
      if (ttsService && ttsService.isSpeaking()) {
        ttsService.pause();
      }
    }
  }

  /**
   * Show notification to user
   */
  function showNotification(title, message) {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.className = 'tts-notification';
    // Create notification content safely
    const notificationContent = document.createElement('div');
    notificationContent.className = 'tts-notification-content';
    
    const titleElement = document.createElement('strong');
    titleElement.textContent = title;
    notificationContent.appendChild(titleElement);
    
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    notificationContent.appendChild(messageElement);
    
    notification.appendChild(notificationContent);

    notification.style.cssText = `
      position: fixed !important;
      top: 20px !important;
      right: 20px !important;
      background: #1a1a1a !important;
      color: white !important;
      padding: 16px !important;
      border-radius: 8px !important;
      z-index: 2147483646 !important;
      max-width: 300px !important;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
    `;

    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  /**
   * Cleanup function
   */
  function cleanup() {
    closeTTSOverlay();
    hideSelectionTooltip();
    
    if (ttsService) {
      ttsService.stop();
    }
  }

  /**
   * Debounce utility function
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  // Expose cleanup for extension unload
  window.ttsCleanup = cleanup;

})();