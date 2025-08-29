/**
 * Popup JavaScript
 * Handles the extension popup interface and settings management
 */

(function() {
  'use strict';

  // State management
  let popupState = {
    isInitialized: false,
    currentTab: null,
    services: {
      tts: null,
      ai: null
    },
    settings: {
      tts: {},
      ai: {},
      ui: {}
    },
    status: {
      tts: 'checking',
      ai: 'checking'
    }
  };

  // DOM elements cache
  const elements = {};

  // Browser API
  const browserAPI = typeof chrome !== 'undefined' ? chrome : browser;

  /**
   * Initialize the popup
   */
  async function initialize() {
    try {
      console.log('🚀 Popup initializing...');
      
      // Show loading
      showLoading('Initializing...');

      // Cache DOM elements
      cacheDOMElements();

      // Set up event listeners
      setupEventListeners();

      // Get current tab
      await getCurrentTab();

      // Load extension info
      loadExtensionInfo();

      // Load settings
      await loadSettings();

      // Initialize services
      await initializeServices();

      // Update UI
      await updateUI();

      // Hide loading
      hideLoading();

      popupState.isInitialized = true;
      console.log('✅ Popup initialized successfully');

    } catch (error) {
      console.error('❌ Popup initialization failed:', error);
      showError('Failed to initialize popup: ' + error.message);
      hideLoading();
    }
  }

  /**
   * Cache DOM elements
   */
  function cacheDOMElements() {
    const selectors = {
      // Header
      version: '#popup-version',
      
      // Action buttons
      speakSelectionBtn: '#btn-speak-selection',
      testVoiceBtn: '#btn-test-voice',
      configureApisBtn: '#btn-configure-apis',
      
      // Status indicators
      ttsStatus: '#tts-status',
      aiStatus: '#ai-status',
      groqIndicator: '#groq-indicator',
      claudeIndicator: '#claude-indicator',
      
      // Settings
      voiceSelect: '#voice-select',
      speedRange: '#speed-range',
      speedValue: '#speed-value',
      aiEnabled: '#ai-enabled',
      
      // Footer buttons
      optionsBtn: '#btn-options',
      shortcutsBtn: '#btn-shortcuts',
      helpBtn: '#btn-help',
      
      // Panels
      shortcutsPanel: '#shortcuts-panel',
      closeShortcuts: '#close-shortcuts',
      
      // Sections
      apiSection: '#api-section',
      activitySection: '#activity-section',
      activityList: '#activity-list',
      
      // Loading and errors
      loadingOverlay: '#loading-overlay',
      errorBanner: '#error-banner',
      errorText: '#error-text',
      errorClose: '#error-close'
    };

    for (const [key, selector] of Object.entries(selectors)) {
      elements[key] = document.querySelector(selector);
    }
  }

  /**
   * Set up event listeners
   */
  function setupEventListeners() {
    // Action buttons
    elements.speakSelectionBtn?.addEventListener('click', handleSpeakSelection);
    elements.testVoiceBtn?.addEventListener('click', handleTestVoice);
    elements.configureApisBtn?.addEventListener('click', handleConfigureAPIs);
    
    // Settings
    elements.voiceSelect?.addEventListener('change', handleVoiceChange);
    elements.speedRange?.addEventListener('input', handleSpeedChange);
    elements.aiEnabled?.addEventListener('change', handleAIToggle);
    
    // Footer buttons
    elements.optionsBtn?.addEventListener('click', handleOpenOptions);
    elements.shortcutsBtn?.addEventListener('click', handleShowShortcuts);
    elements.helpBtn?.addEventListener('click', handleShowHelp);
    
    // Panel controls
    elements.closeShortcuts?.addEventListener('click', handleCloseShortcuts);
    
    // Error handling
    elements.errorClose?.addEventListener('click', hideError);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
  }

  /**
   * Get current active tab
   */
  async function getCurrentTab() {
    try {
      const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
      popupState.currentTab = tabs[0] || null;
    } catch (error) {
      console.warn('Failed to get current tab:', error);
    }
  }

  /**
   * Load extension info
   */
  function loadExtensionInfo() {
    const manifest = browserAPI.runtime.getManifest();
    
    if (elements.version) {
      elements.version.textContent = `v${manifest.version}`;
    }
  }

  /**
   * Load settings from storage
   */
  async function loadSettings() {
    try {
      const result = await new Promise((resolve) => {
        browserAPI.storage.sync.get([
          'ttsSettings',
          'aiSettings',
          'uiSettings',
          'privacySettings',
          'apiKeys'
        ], resolve);
      });

      // Merge with defaults
      popupState.settings = {
        tts: {
          voice: 'default',
          rate: 1.0,
          pitch: 1.0,
          volume: 1.0,
          enabled: true,
          ...result.ttsSettings
        },
        ai: {
          groqEnabled: true,
          claudeEnabled: true,
          explanationLevel: 'simple',
          autoExplain: false,
          ...result.aiSettings
        },
        ui: {
          theme: 'light',
          showKeyboardShortcuts: true,
          ...result.uiSettings
        },
        privacy: result.privacySettings || {},
        apiKeys: result.apiKeys || {}
      };

    } catch (error) {
      console.warn('Failed to load settings:', error);
    }
  }

  /**
   * Initialize services
   */
  async function initializeServices() {
    try {
      // Initialize TTS service
      if (typeof TTSService !== 'undefined') {
        popupState.services.tts = new TTSService();
        await popupState.services.tts.initialize();
        popupState.status.tts = 'online';
      } else {
        popupState.status.tts = 'offline';
      }
    } catch (error) {
      console.warn('TTS service initialization failed:', error);
      popupState.status.tts = 'offline';
    }

    try {
      // Initialize AI service
      if (typeof AIService !== 'undefined') {
        popupState.services.ai = new AIService();
        await popupState.services.ai.initialize();
        popupState.status.ai = 'online';
      } else {
        popupState.status.ai = 'offline';
      }
    } catch (error) {
      console.warn('AI service initialization failed:', error);
      popupState.status.ai = 'warning';
    }
  }

  /**
   * Update UI based on current state
   */
  async function updateUI() {
    // Update status indicators
    updateStatusIndicators();
    
    // Update settings controls
    updateSettingsUI();
    
    // Update voice options
    await updateVoiceOptions();
    
    // Update API status
    updateAPIStatus();
    
    // Update activity
    updateActivity();
    
    // Show/hide sections based on state
    updateSectionVisibility();
  }

  /**
   * Update status indicators
   */
  function updateStatusIndicators() {
    // TTS Status
    if (elements.ttsStatus) {
      const dot = elements.ttsStatus.querySelector('.status-dot');
      const text = elements.ttsStatus.querySelector('.status-text');
      
      dot.className = `status-dot status-${popupState.status.tts}`;
      text.textContent = {
        online: 'Ready',
        offline: 'Unavailable',
        warning: 'Limited',
        checking: 'Checking...'
      }[popupState.status.tts] || 'Unknown';
    }
    
    // AI Status
    if (elements.aiStatus) {
      const dot = elements.aiStatus.querySelector('.status-dot');
      const text = elements.aiStatus.querySelector('.status-text');
      
      dot.className = `status-dot status-${popupState.status.ai}`;
      text.textContent = {
        online: 'Ready',
        offline: 'Unavailable',
        warning: 'Limited',
        checking: 'Checking...'
      }[popupState.status.ai] || 'Unknown';
    }
  }

  /**
   * Update settings UI
   */
  function updateSettingsUI() {
    // Speed setting
    if (elements.speedRange && elements.speedValue) {
      elements.speedRange.value = popupState.settings.tts.rate;
      elements.speedValue.textContent = popupState.settings.tts.rate + 'x';
    }
    
    // AI enabled setting
    if (elements.aiEnabled) {
      elements.aiEnabled.checked = popupState.settings.privacy.aiConsentGiven || false;
    }
  }

  /**
   * Update voice selection options
   */
  async function updateVoiceOptions() {
    if (!elements.voiceSelect || !popupState.services.tts) return;

    try {
      const voices = popupState.services.tts.getVoices();
      // Clear voice select safely
      while (elements.voiceSelect.firstChild) {
        elements.voiceSelect.removeChild(elements.voiceSelect.firstChild);
      }

      if (voices.length === 0) {
        const noVoiceOption = document.createElement('option');
        noVoiceOption.value = '';
        noVoiceOption.textContent = 'No voices available';
        elements.voiceSelect.appendChild(noVoiceOption);
        return;
      }

      // Add default option
      elements.voiceSelect.add(new Option('Default Voice', 'default', true));

      // Add voices
      voices.forEach(voice => {
        const option = new Option(
          voice.name + (voice.default ? ' (Default)' : ''),
          voice.name
        );
        elements.voiceSelect.add(option);
      });

      // Select current voice
      if (popupState.settings.tts.voice) {
        elements.voiceSelect.value = popupState.settings.tts.voice;
      }

    } catch (error) {
      console.error('Failed to update voice options:', error);
      const errorOption = document.createElement('option');
      errorOption.value = '';
      errorOption.textContent = 'Error loading voices';
      elements.voiceSelect.appendChild(errorOption);
    }
  }

  /**
   * Update API status indicators
   */
  function updateAPIStatus() {
    const hasGroqKey = !!popupState.settings.apiKeys.groqApiKey;
    const hasClaudeKey = !!popupState.settings.apiKeys.claudeApiKey;
    
    if (elements.groqIndicator) {
      const dot = elements.groqIndicator.querySelector('.status-dot');
      dot.className = `status-dot ${hasGroqKey ? 'status-online' : 'status-unknown'}`;
    }
    
    if (elements.claudeIndicator) {
      const dot = elements.claudeIndicator.querySelector('.status-dot');
      dot.className = `status-dot ${hasClaudeKey ? 'status-online' : 'status-unknown'}`;
    }
  }

  /**
   * Update activity list
   */
  function updateActivity() {
    if (!elements.activityList) return;
    
    // This would be implemented with actual activity tracking
    // For now, show placeholder
    // Clear activity list safely
    while (elements.activityList.firstChild) {
      elements.activityList.removeChild(elements.activityList.firstChild);
    }

    // Create activity item
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    
    const activityText = document.createElement('div');
    activityText.className = 'activity-text';
    activityText.textContent = 'No recent activity';
    activityItem.appendChild(activityText);
    
    const activityTime = document.createElement('div');
    activityTime.className = 'activity-time';
    activityItem.appendChild(activityTime);
    
    elements.activityList.appendChild(activityItem);
  }

  /**
   * Update section visibility
   */
  function updateSectionVisibility() {
    // Show API section if any API keys are configured or AI is enabled
    const showAPI = popupState.settings.apiKeys.groqApiKey || 
                    popupState.settings.apiKeys.claudeApiKey || 
                    popupState.settings.privacy.aiConsentGiven;
    
    if (elements.apiSection) {
      elements.apiSection.style.display = showAPI ? 'block' : 'none';
    }
    
    // Activity section - show if there's actual activity (placeholder for now)
    if (elements.activitySection) {
      elements.activitySection.style.display = 'none'; // Hidden until implemented
    }
  }

  // Event handlers

  /**
   * Handle speak selection button
   */
  async function handleSpeakSelection() {
    try {
      if (!popupState.currentTab) {
        throw new Error('No active tab available');
      }

      // Send message to content script
      await browserAPI.tabs.sendMessage(popupState.currentTab.id, {
        type: 'SPEAK_CURRENT_SELECTION'
      });

      // Close popup
      window.close();

    } catch (error) {
      console.error('Speak selection failed:', error);
      showError('Failed to speak selection. Please try selecting text on the page first.');
    }
  }

  /**
   * Handle test voice button
   */
  async function handleTestVoice() {
    try {
      if (!popupState.services.tts) {
        throw new Error('TTS service not available');
      }

      const testText = "This is a test of the text-to-speech functionality.";
      await popupState.services.tts.speak(testText, popupState.settings.tts);

    } catch (error) {
      console.error('Test voice failed:', error);
      showError('Failed to test voice: ' + error.message);
    }
  }

  /**
   * Handle voice selection change
   */
  function handleVoiceChange(event) {
    popupState.settings.tts.voice = event.target.value;
    saveSettings();
  }

  /**
   * Handle speed change
   */
  function handleSpeedChange(event) {
    const value = parseFloat(event.target.value);
    popupState.settings.tts.rate = value;
    
    if (elements.speedValue) {
      elements.speedValue.textContent = value + 'x';
    }
    
    saveSettings();
  }

  /**
   * Handle AI toggle
   */
  function handleAIToggle(event) {
    const enabled = event.target.checked;
    
    if (enabled) {
      // Show consent if not already given
      if (!popupState.settings.privacy.aiConsentGiven) {
        showAIConsentDialog();
        return;
      }
    }
    
    updateAISettings(enabled);
  }

  /**
   * Handle configure APIs button
   */
  function handleConfigureAPIs() {
    handleOpenOptions();
  }

  /**
   * Handle open options
   */
  function handleOpenOptions() {
    browserAPI.runtime.openOptionsPage();
    window.close();
  }

  /**
   * Handle show shortcuts
   */
  function handleShowShortcuts() {
    if (elements.shortcutsPanel) {
      elements.shortcutsPanel.style.display = 'block';
    }
  }

  /**
   * Handle close shortcuts
   */
  function handleCloseShortcuts() {
    if (elements.shortcutsPanel) {
      elements.shortcutsPanel.style.display = 'none';
    }
  }

  /**
   * Handle show help
   */
  function handleShowHelp() {
    // Open help/documentation page
    browserAPI.tabs.create({ 
      url: 'https://github.com/azfarhussain-10p/textToSpeachExt#readme' 
    });
    window.close();
  }

  /**
   * Handle keyboard shortcuts
   */
  function handleKeyboard(event) {
    switch (event.key) {
      case 'Escape':
        if (elements.shortcutsPanel && elements.shortcutsPanel.style.display === 'block') {
          handleCloseShortcuts();
        } else {
          window.close();
        }
        event.preventDefault();
        break;
        
      case '1':
        if (event.altKey) {
          handleSpeakSelection();
          event.preventDefault();
        }
        break;
        
      case '2':
        if (event.altKey) {
          handleTestVoice();
          event.preventDefault();
        }
        break;
    }
  }

  /**
   * Show AI consent dialog
   */
  function showAIConsentDialog() {
    const consent = confirm(
      'AI Explanations Privacy Notice\n\n' +
      'To provide AI explanations, your selected text will be sent to AI services (Groq or Claude). ' +
      'This helps generate intelligent explanations for the content you select.\n\n' +
      'Your privacy: No personal data is stored. Text is only sent when you explicitly request explanations.\n\n' +
      'Do you want to enable AI explanations?'
    );
    
    if (consent) {
      updateAISettings(true);
      popupState.settings.privacy.aiConsentGiven = true;
      popupState.settings.privacy.consentTimestamp = Date.now();
    } else {
      // Reset checkbox
      if (elements.aiEnabled) {
        elements.aiEnabled.checked = false;
      }
    }
  }

  /**
   * Update AI settings
   */
  function updateAISettings(enabled) {
    popupState.settings.ai.enabled = enabled;
    
    if (enabled && !popupState.settings.privacy.aiConsentGiven) {
      popupState.settings.privacy.aiConsentGiven = true;
      popupState.settings.privacy.consentTimestamp = Date.now();
    }
    
    saveSettings();
    updateSectionVisibility();
  }

  /**
   * Save settings to storage
   */
  async function saveSettings() {
    try {
      await new Promise((resolve, reject) => {
        browserAPI.storage.sync.set({
          ttsSettings: popupState.settings.tts,
          aiSettings: popupState.settings.ai,
          uiSettings: popupState.settings.ui,
          privacySettings: popupState.settings.privacy
        }, () => {
          if (browserAPI.runtime.lastError) {
            reject(new Error(browserAPI.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      console.warn('Failed to save settings:', error);
    }
  }

  /**
   * Show loading overlay
   */
  function showLoading(message = 'Loading...') {
    if (elements.loadingOverlay) {
      elements.loadingOverlay.style.display = 'flex';
      const text = elements.loadingOverlay.querySelector('.loading-text');
      if (text) text.textContent = message;
    }
  }

  /**
   * Hide loading overlay
   */
  function hideLoading() {
    if (elements.loadingOverlay) {
      elements.loadingOverlay.style.display = 'none';
    }
  }

  /**
   * Show error message
   */
  function showError(message) {
    if (elements.errorBanner && elements.errorText) {
      elements.errorText.textContent = message;
      elements.errorBanner.style.display = 'block';
    }
  }

  /**
   * Hide error message
   */
  function hideError() {
    if (elements.errorBanner) {
      elements.errorBanner.style.display = 'none';
    }
  }

  /**
   * Check if page is compatible with extension
   */
  function isPageCompatible() {
    if (!popupState.currentTab) return false;
    
    const url = popupState.currentTab.url;
    const incompatibleSchemes = ['chrome:', 'chrome-extension:', 'moz-extension:', 'about:'];
    
    return !incompatibleSchemes.some(scheme => url.startsWith(scheme));
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

})();