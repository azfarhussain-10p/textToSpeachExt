/**
 * TTS Overlay JavaScript
 * Main overlay functionality with TTS and AI integration
 */

(function() {
  'use strict';

  // Overlay state
  let overlayState = {
    text: '',
    isInitialized: false,
    isSpeaking: false,
    isPaused: false,
    currentSettings: {},
    services: {
      tts: null,
      ai: null
    },
    ui: {
      settingsExpanded: false,
      shortcutsVisible: false,
      explanationVisible: false
    },
    highlighting: {
      highlighter: null,
      enabled: true
    }
  };

  // DOM elements cache
  const elements = {};

  /**
   * Initialize the overlay
   */
  async function initialize() {
    try {
      console.log('🚀 TTS Overlay initializing...');

      // Cache DOM elements
      cacheDOMElements();

      // Set up event listeners
      setupEventListeners();

      // Initialize services
      await initializeServices();

      // Load user settings
      await loadSettings();

      // Set up accessibility
      setupAccessibility();

      // Listen for messages from parent window
      setupMessageListener();

      // Signal that overlay is ready
      sendMessageToParent('OVERLAY_READY');

      overlayState.isInitialized = true;
      console.log('✅ TTS Overlay initialized successfully');

    } catch (error) {
      console.error('❌ Overlay initialization failed:', error);
      showError('Failed to initialize TTS overlay: ' + error.message);
    }
  }

  /**
   * Cache all DOM elements for performance
   */
  function cacheDOMElements() {
    const selectors = {
      // Main containers
      overlay: '#tts-overlay',
      textContent: '#tts-text-content',
      textStats: '#tts-text-stats',
      
      // Control buttons
      playBtn: '#tts-play',
      pauseBtn: '#tts-pause',
      stopBtn: '#tts-stop',
      closeBtn: '#tts-close',
      
      // Settings
      settingsToggle: '#tts-settings-toggle',
      settingsContent: '#tts-settings-content',
      voiceSelect: '#tts-voice',
      rateSlider: '#tts-rate',
      pitchSlider: '#tts-pitch',
      volumeSlider: '#tts-volume',
      rateValue: '#tts-rate-value',
      pitchValue: '#tts-pitch-value',
      volumeValue: '#tts-volume-value',
      
      // AI controls
      explainBtn: '#tts-explain',
      explanationLevel: '#tts-explanation-level',
      explanationContainer: '#tts-explanation-container',
      explanationContent: '#tts-explanation',
      explanationClose: '#tts-explanation-close',
      explanationFooter: '#tts-explanation-footer',
      speakExplanationBtn: '#tts-speak-explanation',
      
      // Progress and status
      progressSection: '#tts-progress-section',
      progressFill: '#tts-progress-fill',
      progressText: '#tts-progress-text',
      status: '#tts-status',
      loading: '#tts-loading',
      loadingText: '#tts-loading-text',
      
      // Error handling
      error: '#tts-error',
      errorMessage: '#tts-error-message',
      errorClose: '#tts-error-close',
      
      // Footer
      shortcutsToggle: '#tts-shortcuts-toggle',
      shortcuts: '#tts-shortcuts'
    };

    for (const [key, selector] of Object.entries(selectors)) {
      elements[key] = document.querySelector(selector);
      if (!elements[key]) {
        console.warn(`Element not found: ${selector}`);
      }
    }
  }

  /**
   * Set up all event listeners
   */
  function setupEventListeners() {
    // Playback controls
    elements.playBtn?.addEventListener('click', handlePlay);
    elements.pauseBtn?.addEventListener('click', handlePause);
    elements.stopBtn?.addEventListener('click', handleStop);
    elements.closeBtn?.addEventListener('click', handleClose);

    // Settings controls
    elements.settingsToggle?.addEventListener('click', toggleSettings);
    elements.voiceSelect?.addEventListener('change', handleVoiceChange);
    
    // Range sliders with real-time updates
    elements.rateSlider?.addEventListener('input', handleRateChange);
    elements.pitchSlider?.addEventListener('input', handlePitchChange);
    elements.volumeSlider?.addEventListener('input', handleVolumeChange);

    // AI controls
    elements.explainBtn?.addEventListener('click', handleExplainRequest);
    elements.explanationClose?.addEventListener('click', hideExplanation);
    elements.speakExplanationBtn?.addEventListener('click', handleSpeakExplanation);

    // Error handling
    elements.errorClose?.addEventListener('click', hideError);

    // Footer controls
    elements.shortcutsToggle?.addEventListener('click', toggleShortcuts);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);

    // Prevent focus from leaving overlay
    document.addEventListener('keydown', trapFocus);

    // Handle window resize for responsive behavior
    window.addEventListener('resize', handleResize);
  }

  /**
   * Initialize TTS and AI services
   */
  async function initializeServices() {
    try {
      // Initialize TTS service
      if (typeof TTSService !== 'undefined') {
        overlayState.services.tts = new TTSService();
        
        // Set up TTS event callbacks
        overlayState.services.tts.setEventCallbacks({
          onStart: handleTTSStart,
          onEnd: handleTTSEnd,
          onError: handleTTSError,
          onPause: handleTTSPause,
          onResume: handleTTSResume
        });

        // Set up text highlighting callbacks
        overlayState.services.tts.setWordBoundaryCallback(handleWordHighlight);
        overlayState.services.tts.setSentenceBoundaryCallback(handleSentenceHighlight);

        await overlayState.services.tts.initialize();
        await populateVoiceOptions();
        
      } else {
        throw new Error('TTSService not available');
      }

      // Initialize AI service
      try {
        if (typeof AIService !== 'undefined' && AIService) {
          overlayState.services.ai = new AIService();
          await overlayState.services.ai.initialize();
          console.log('✅ AI Service initialized');
        } else {
          throw new Error('AIService class not available');
        }
      } catch (error) {
        console.warn('AI Service not available:', error.message);
        overlayState.services.ai = null;
      }

      // Initialize text highlighter
      if (typeof TextHighlighter !== 'undefined') {
        overlayState.highlighting.highlighter = new TextHighlighter();
        console.log('✅ Text highlighter initialized');
      } else {
        console.warn('TextHighlighter not available - text highlighting disabled');
        overlayState.highlighting.enabled = false;
      }

      // Update UI based on available services
      updateUIForAvailableServices();

    } catch (error) {
      console.error('Service initialization error:', error);
      throw error;
    }
  }

  /**
   * Update UI elements based on available services
   */
  function updateUIForAvailableServices() {
    // Disable AI features if AI service is not available
    if (!overlayState.services.ai) {
      const aiSection = document.getElementById('tts-ai-section');
      const explainBtn = document.getElementById('tts-explain');
      
      if (aiSection) {
        aiSection.style.display = 'none';
      }
      
      if (explainBtn) {
        explainBtn.disabled = true;
        explainBtn.title = 'AI service unavailable';
      }
      
      console.log('🚫 AI features disabled - service not available');
    }
  }

  /**
   * Load user settings from storage
   */
  async function loadSettings() {
    try {
      // Default settings
      overlayState.currentSettings = {
        voice: 'default',
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0
      };

      // Try to load from extension storage if available
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await new Promise((resolve) => {
          chrome.storage.sync.get(['ttsSettings'], resolve);
        });

        if (result.ttsSettings) {
          overlayState.currentSettings = { ...overlayState.currentSettings, ...result.ttsSettings };
        }
      }

      // Apply settings to UI
      applySettingsToUI();

    } catch (error) {
      console.warn('Failed to load settings:', error);
    }
  }

  /**
   * Apply settings to UI elements
   */
  function applySettingsToUI() {
    const settings = overlayState.currentSettings;

    // Update sliders and their display values
    if (elements.rateSlider) {
      elements.rateSlider.value = settings.rate;
      elements.rateValue.textContent = settings.rate + 'x';
    }

    if (elements.pitchSlider) {
      elements.pitchSlider.value = settings.pitch;
      elements.pitchValue.textContent = settings.pitch + 'x';
    }

    if (elements.volumeSlider) {
      elements.volumeSlider.value = settings.volume;
      elements.volumeValue.textContent = Math.round(settings.volume * 100) + '%';
    }

    // Voice selection will be handled after voices are loaded
  }

  /**
   * Populate voice selection dropdown
   */
  async function populateVoiceOptions() {
    if (!overlayState.services.tts || !elements.voiceSelect) return;

    try {
      const voices = overlayState.services.tts.getVoices();
      
      // Clear existing options safely
      while (elements.voiceSelect.firstChild) {
        elements.voiceSelect.removeChild(elements.voiceSelect.firstChild);
      }

      if (voices.length === 0) {
        const noVoicesOption = document.createElement('option');
        noVoicesOption.value = '';
        noVoicesOption.textContent = 'No voices available';
        elements.voiceSelect.appendChild(noVoicesOption);
        return;
      }

      // Add default option
      elements.voiceSelect.add(new Option('Default Voice', 'default', true, true));

      // Group voices by language
      const voicesByLang = {};
      voices.forEach(voice => {
        const lang = voice.lang.split('-')[0].toUpperCase();
        if (!voicesByLang[lang]) {
          voicesByLang[lang] = [];
        }
        voicesByLang[lang].push(voice);
      });

      // Add voices to select, grouped by language
      Object.keys(voicesByLang).sort().forEach(lang => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = lang;
        
        voicesByLang[lang].forEach(voice => {
          const option = new Option(voice.name, voice.name);
          if (voice.default) {
            option.textContent += ' (Default)';
          }
          optgroup.appendChild(option);
        });
        
        elements.voiceSelect.appendChild(optgroup);
      });

      // Select user's preferred voice
      if (overlayState.currentSettings.voice && overlayState.currentSettings.voice !== 'default') {
        elements.voiceSelect.value = overlayState.currentSettings.voice;
      }

    } catch (error) {
      console.error('Failed to populate voices:', error);
      
      // Clear existing options safely
      while (elements.voiceSelect.firstChild) {
        elements.voiceSelect.removeChild(elements.voiceSelect.firstChild);
      }
      
      const errorOption = document.createElement('option');
      errorOption.value = '';
      errorOption.textContent = 'Error loading voices';
      elements.voiceSelect.appendChild(errorOption);
    }
  }

  /**
   * Set up accessibility features
   */
  function setupAccessibility() {
    // Ensure overlay is focusable and has proper role
    if (elements.overlay) {
      elements.overlay.setAttribute('tabindex', '-1');
      elements.overlay.focus();
    }

    // Set up aria-live regions for dynamic content
    if (elements.status) {
      elements.status.setAttribute('aria-live', 'polite');
    }

    if (elements.error) {
      elements.error.setAttribute('aria-live', 'assertive');
    }
  }

  /**
   * Set up message listener for parent window communication
   */
  function setupMessageListener() {
    window.addEventListener('message', (event) => {
      console.log('📨 Overlay received message:', event.data);
      console.log('📨 Message origin:', event.origin);
      
      // Validate event data structure
      if (!event.data || typeof event.data !== 'object') {
        console.log('📨 Ignoring non-object message');
        return; // Ignore non-object messages
      }

      const { type, data } = event.data;
      console.log('📨 Message type:', type, 'data:', data);

      // Only process messages with a defined type
      if (!type) {
        console.log('📨 Ignoring message without type');
        return; // Ignore messages without type
      }

      switch (type) {
        case 'INIT_OVERLAY':
          handleInitOverlay(data);
          break;

        default:
          // Only warn about extension-related messages
          if (type.startsWith('TTS_') || type.includes('OVERLAY')) {
            console.warn('Unknown TTS message type:', type);
          }
      }
    });
  }

  /**
   * Handle overlay initialization with text and options
   */
  async function handleInitOverlay(data) {
    console.log('📝 Initializing overlay with data:', data);
    
    const { text, options = {} } = data;
    
    console.log('📝 Extracted text:', text?.substring(0, 100) + '...');
    console.log('📝 Options:', options);
    
    if (!text) {
      console.error('❌ No text provided to overlay');
      showError('No text provided');
      return;
    }

    overlayState.text = text;
    console.log('✅ Text stored in overlay state:', overlayState.text?.substring(0, 50) + '...');

    // Update UI with text
    displayText(text);
    
    // Handle auto-actions (disabled auto-play due to browser restrictions)
    if (options.autoPlay) {
      console.log('🚀 Auto-play requested but disabled due to browser restrictions');
      console.log('👆 Please click the Play button to start TTS');
      // Note: Auto-play disabled because Chrome requires direct user interaction for speech synthesis
    }
    
    if (options.autoExplain) {
      setTimeout(() => handleExplainRequest(), 500);
    }

    // Resize overlay to fit content
    requestAnimationFrame(() => {
      const height = Math.min(document.body.scrollHeight + 20, window.innerHeight * 0.85);
      const width = Math.max(380, Math.min(500, document.body.scrollWidth + 40));
      sendMessageToParent('OVERLAY_RESIZE', { height, width });
    });
  }

  /**
   * Display text in the preview area
   */
  function displayText(text) {
    if (!elements.textContent) return;

    elements.textContent.textContent = text;
    
    // Update stats
    if (elements.textStats) {
      const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
      const charCount = text.length;
      const readingTime = Math.ceil(wordCount / 200); // Average reading speed

      // Clear existing content safely
      while (elements.textStats.firstChild) {
        elements.textStats.removeChild(elements.textStats.firstChild);
      }

      // Create stat elements safely
      const wordSpan = document.createElement('span');
      wordSpan.textContent = `${wordCount} words`;
      
      const charSpan = document.createElement('span');
      charSpan.textContent = `${charCount} characters`;
      
      const timeSpan = document.createElement('span');
      timeSpan.textContent = `~${readingTime} min read`;

      elements.textStats.appendChild(wordSpan);
      elements.textStats.appendChild(charSpan);
      elements.textStats.appendChild(timeSpan);
    }
  }

  // Event Handlers

  /**
   * Handle play button click
   */
  async function handlePlay() {
    console.log('🎵 Play button clicked');
    console.log('🔍 TTS service available:', !!overlayState.services.tts);
    console.log('🔍 Text available:', !!overlayState.text);
    console.log('🔍 Text content:', overlayState.text?.substring(0, 50) + '...');
    console.log('🔍 Current settings:', overlayState.currentSettings);

    if (!overlayState.services.tts || !overlayState.text) {
      const errorMsg = `TTS service not available or no text to speak (TTS: ${!!overlayState.services.tts}, Text: ${!!overlayState.text})`;
      console.error('❌', errorMsg);
      showError(errorMsg);
      return;
    }

    try {
      console.log('🔊 Starting TTS speech...');
      showLoading('Preparing speech...');
      
      await overlayState.services.tts.speak(overlayState.text, overlayState.currentSettings);
      console.log('✅ TTS speech completed');
      
    } catch (error) {
      console.error('❌ Play error:', error);
      showError('Failed to play text: ' + error.message);
      hideLoading();
    }
  }

  /**
   * Handle pause button click
   */
  function handlePause() {
    if (overlayState.services.tts) {
      overlayState.services.tts.pause();
    }
  }

  /**
   * Handle stop button click
   */
  function handleStop() {
    if (overlayState.services.tts) {
      overlayState.services.tts.stop();
    }
  }

  /**
   * Handle close button click
   */
  function handleClose() {
    // Stop any playing speech
    if (overlayState.services.tts) {
      overlayState.services.tts.stop();
    }
    
    sendMessageToParent('CLOSE_OVERLAY');
  }

  /**
   * Handle settings toggle
   */
  function toggleSettings() {
    overlayState.ui.settingsExpanded = !overlayState.ui.settingsExpanded;
    
    if (elements.settingsContent) {
      elements.settingsContent.hidden = !overlayState.ui.settingsExpanded;
    }
    
    if (elements.settingsToggle) {
      elements.settingsToggle.setAttribute('aria-expanded', overlayState.ui.settingsExpanded);
    }

    // Trigger resize
    requestAnimationFrame(() => {
      const height = document.body.scrollHeight;
      sendMessageToParent('OVERLAY_RESIZE', { height });
    });
  }

  /**
   * Handle voice selection change
   */
  function handleVoiceChange(event) {
    overlayState.currentSettings.voice = event.target.value;
    saveSettings();
  }

  /**
   * Handle rate slider change
   */
  function handleRateChange(event) {
    const value = parseFloat(event.target.value);
    overlayState.currentSettings.rate = value;
    elements.rateValue.textContent = value + 'x';
    saveSettings();
  }

  /**
   * Handle pitch slider change
   */
  function handlePitchChange(event) {
    const value = parseFloat(event.target.value);
    overlayState.currentSettings.pitch = value;
    elements.pitchValue.textContent = value + 'x';
    saveSettings();
  }

  /**
   * Handle volume slider change
   */
  function handleVolumeChange(event) {
    const value = parseFloat(event.target.value);
    overlayState.currentSettings.volume = value;
    elements.volumeValue.textContent = Math.round(value * 100) + '%';
    saveSettings();
  }

  /**
   * Handle AI explanation request
   */
  async function handleExplainRequest() {
    if (!overlayState.services.ai || !overlayState.text) {
      showError('AI service not available or no text to explain');
      return;
    }

    try {
      showLoading('Getting AI explanation...');
      
      const level = elements.explanationLevel?.value || 'simple';
      const result = await overlayState.services.ai.explainText(overlayState.text, { level });
      
      displayExplanation(result);
      hideLoading();
      
    } catch (error) {
      console.error('AI explanation error:', error);
      showError('Failed to get explanation: ' + error.message);
      hideLoading();
    }
  }

  /**
   * Display AI explanation
   */
  function displayExplanation(result) {
    if (!elements.explanationContent || !elements.explanationContainer) return;

    elements.explanationContent.textContent = result.explanation;
    
    if (elements.explanationFooter) {
      elements.explanationFooter.textContent = `Generated by ${result.provider} • ${result.level} level`;
    }
    
    elements.explanationContainer.hidden = false;
    overlayState.ui.explanationVisible = true;

    // Trigger resize
    requestAnimationFrame(() => {
      const height = document.body.scrollHeight;
      sendMessageToParent('OVERLAY_RESIZE', { height });
    });
  }

  /**
   * Hide explanation
   */
  function hideExplanation() {
    if (elements.explanationContainer) {
      elements.explanationContainer.hidden = true;
      overlayState.ui.explanationVisible = false;
    }

    // Trigger resize
    requestAnimationFrame(() => {
      const height = document.body.scrollHeight;
      sendMessageToParent('OVERLAY_RESIZE', { height });
    });
  }

  /**
   * Handle speak explanation button
   */
  async function handleSpeakExplanation() {
    if (!overlayState.services.tts || !elements.explanationContent) return;

    const explanationText = elements.explanationContent.textContent;
    
    try {
      await overlayState.services.tts.speak(explanationText, overlayState.currentSettings);
    } catch (error) {
      console.error('Speak explanation error:', error);
      showError('Failed to speak explanation: ' + error.message);
    }
  }

  /**
   * Handle keyboard shortcuts
   */
  function handleKeyboard(event) {
    switch (event.key) {
      case 'Escape':
        if (overlayState.ui.explanationVisible) {
          hideExplanation();
        } else {
          handleClose();
        }
        event.preventDefault();
        break;
        
      case ' ':
        if (overlayState.isSpeaking) {
          if (overlayState.isPaused) {
            handlePlay();
          } else {
            handlePause();
          }
        } else {
          handlePlay();
        }
        event.preventDefault();
        break;
        
      case 'Enter':
        if (event.target.matches('button, select, [role="button"]')) {
          event.target.click();
        }
        break;
    }
  }

  /**
   * Trap focus within overlay for accessibility
   */
  function trapFocus(event) {
    if (event.key !== 'Tab') return;

    const focusableElements = elements.overlay.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        event.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        event.preventDefault();
      }
    }
  }

  /**
   * Handle window resize
   */
  function handleResize() {
    // Notify parent of size change
    requestAnimationFrame(() => {
      const height = document.body.scrollHeight;
      sendMessageToParent('OVERLAY_RESIZE', { height });
    });
  }

  /**
   * Toggle shortcuts display
   */
  function toggleShortcuts() {
    overlayState.ui.shortcutsVisible = !overlayState.ui.shortcutsVisible;
    
    if (elements.shortcuts) {
      elements.shortcuts.hidden = !overlayState.ui.shortcutsVisible;
    }
    
    if (elements.shortcutsToggle) {
      elements.shortcutsToggle.setAttribute('aria-expanded', overlayState.ui.shortcutsVisible);
    }
  }

  // TTS Event Handlers

  function handleTTSStart() {
    overlayState.isSpeaking = true;
    overlayState.isPaused = false;
    
    updatePlaybackControls();
    updateStatus('Speaking...');
    hideLoading();

    // Initialize text highlighting for the current text
    if (overlayState.highlighting.enabled && overlayState.highlighting.highlighter && elements.textContent) {
      overlayState.highlighting.highlighter.initializeHighlighting(elements.textContent, overlayState.text);
    }
  }

  function handleTTSEnd() {
    overlayState.isSpeaking = false;
    overlayState.isPaused = false;
    
    updatePlaybackControls();
    updateStatus('Speech completed');

    // Clean up text highlighting
    if (overlayState.highlighting.enabled && overlayState.highlighting.highlighter) {
      overlayState.highlighting.highlighter.cleanup();
    }
  }

  function handleTTSError(error) {
    overlayState.isSpeaking = false;
    overlayState.isPaused = false;
    
    updatePlaybackControls();
    showError('Speech error: ' + error.error);
    hideLoading();
  }

  function handleTTSPause() {
    overlayState.isPaused = true;
    updatePlaybackControls();
    updateStatus('Speech paused');
  }

  function handleTTSResume() {
    overlayState.isPaused = false;
    updatePlaybackControls();
    updateStatus('Speech resumed');
  }

  /**
   * Handle word boundary highlighting during speech
   */
  function handleWordHighlight(event) {
    if (!overlayState.highlighting.enabled || !overlayState.highlighting.highlighter || !elements.textContent) {
      return;
    }

    try {
      overlayState.highlighting.highlighter.highlightWordAt(event.charIndex, event.text);
    } catch (error) {
      console.warn('Word highlighting error:', error);
    }
  }

  /**
   * Handle sentence boundary highlighting during speech
   */
  function handleSentenceHighlight(event) {
    if (!overlayState.highlighting.enabled || !overlayState.highlighting.highlighter || !elements.textContent) {
      return;
    }

    try {
      overlayState.highlighting.highlighter.highlightSentenceAt(event.charIndex, event.text);
    } catch (error) {
      console.warn('Sentence highlighting error:', error);
    }
  }

  // UI Helper Functions

  /**
   * Update playback control buttons based on state
   */
  function updatePlaybackControls() {
    if (elements.playBtn) {
      elements.playBtn.disabled = overlayState.isSpeaking && !overlayState.isPaused;
      
      // Clear existing content safely
      while (elements.playBtn.firstChild) {
        elements.playBtn.removeChild(elements.playBtn.firstChild);
      }
      
      // Create button content safely
      const iconSpan = document.createElement('span');
      iconSpan.className = 'tts-icon';
      iconSpan.textContent = '▶';
      
      const textSpan = document.createElement('span');
      textSpan.className = 'tts-btn-text';
      textSpan.textContent = overlayState.isPaused ? 'Resume' : 'Play';
      
      elements.playBtn.appendChild(iconSpan);
      elements.playBtn.appendChild(textSpan);
    }
    
    if (elements.pauseBtn) {
      elements.pauseBtn.disabled = !overlayState.isSpeaking || overlayState.isPaused;
    }
    
    if (elements.stopBtn) {
      elements.stopBtn.disabled = !overlayState.isSpeaking;
    }
  }

  /**
   * Show loading indicator
   */
  function showLoading(message = 'Loading...') {
    if (elements.loading) {
      elements.loading.hidden = false;
    }
    
    if (elements.loadingText) {
      elements.loadingText.textContent = message;
    }
  }

  /**
   * Hide loading indicator
   */
  function hideLoading() {
    if (elements.loading) {
      elements.loading.hidden = true;
    }
  }

  /**
   * Show error message
   */
  function showError(message) {
    if (elements.error) {
      elements.error.hidden = false;
    }
    
    if (elements.errorMessage) {
      elements.errorMessage.textContent = message;
    }
  }

  /**
   * Hide error message
   */
  function hideError() {
    if (elements.error) {
      elements.error.hidden = true;
    }
  }

  /**
   * Update status message
   */
  function updateStatus(message) {
    if (elements.status) {
      elements.status.textContent = message;
    }
  }

  /**
   * Save settings to storage
   */
  async function saveSettings() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await new Promise((resolve, reject) => {
          chrome.storage.sync.set({ ttsSettings: overlayState.currentSettings }, () => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve();
            }
          });
        });
      }
    } catch (error) {
      console.warn('Failed to save settings:', error);
    }
  }

  /**
   * Send message to parent window
   */
  function sendMessageToParent(type, data = null) {
    if (window.parent) {
      window.parent.postMessage({ type, data }, '*');
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

})();