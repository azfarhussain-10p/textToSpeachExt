/**
 * Text-to-Speech Service
 * Cross-browser Web Speech API implementation with fallback handling
 */

class TTSService {
  constructor() {
    this.synthesis = null;
    this.voices = [];
    this.currentUtterance = null;
    this.isInitialized = false;
    this.voiceLoadRetries = 0;
    this.maxVoiceLoadRetries = 5;

    // Browser-specific configuration
    this.browserType = this.detectBrowser();
    this.config = this.getBrowserConfig();

    // Event callbacks
    this.onSpeakStart = null;
    this.onSpeakEnd = null;
    this.onSpeakError = null;
    this.onSpeakPause = null;
    this.onSpeakResume = null;
    this.onWordBoundary = null;  // New: for text highlighting
    this.onSentenceBoundary = null; // New: for sentence highlighting

    // Initialize TTS
    this.initialize();
  }

  /**
   * Initialize the TTS service
   */
  async initialize() {
    try {
      if (!this.isWebSpeechSupported()) {
        throw new Error('Web Speech API is not supported in this browser');
      }

      this.synthesis = window.speechSynthesis;

      // Load voices with browser-specific handling
      await this.loadVoices();

      this.isInitialized = true;

    } catch (error) {
      console.error('TTS Service initialization failed:', error);
      this.isInitialized = false;
      throw error;
    }
  }

  /**
   * Check if Web Speech API is supported
   */
  isWebSpeechSupported() {
    return (
      'speechSynthesis' in window &&
      'SpeechSynthesisUtterance' in window
    );
  }

  /**
   * Load available voices with cross-browser compatibility
   */
  async loadVoices() {
    return new Promise((resolve, reject) => {
      const loadVoicesAttempt = () => {
        this.voices = this.synthesis.getVoices();

        if (this.voices.length > 0) {
          resolve(this.voices);
          return;
        }

        // Handle browser-specific voice loading
        if (this.voiceLoadRetries < this.maxVoiceLoadRetries) {
          this.voiceLoadRetries++;

          if (this.config.requiresEventListener) {
            // Firefox and Safari may need the voiceschanged event
            this.synthesis.onvoiceschanged = () => {
              this.synthesis.onvoiceschanged = null; // Remove listener
              loadVoicesAttempt();
            };
          } else {
            // Chrome may need multiple attempts with delays
            setTimeout(loadVoicesAttempt, this.config.loadDelay);
          }
        } else {
          reject(new Error('Failed to load voices after maximum retries'));
        }
      };

      loadVoicesAttempt();
    });
  }

  /**
   * Speak text with specified options
   */
  async speak(text, options = {}) {
    if (!this.isInitialized) {
      throw new Error('TTS Service not initialized');
    }

    if (!text || text.trim().length === 0) {
      throw new Error('No text provided for speech');
    }

    // Stop any current speech
    this.stop();

    try {
      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text.trim());

      // Apply settings
      await this.applySettings(utterance, options);

      // Set up event listeners
      this.setupUtteranceEvents(utterance);

      // Start speech
      return new Promise((resolve, reject) => {
        let hasEnded = false;
        let endCallbackTimer = null;
        let reachedLastWord = false;
        let stagnationCount = 0;
        const maxStagnation = 10;
        const startTime = Date.now();

        // Calculate word count for completion detection
        const words = text.trim().split(/\s+/).filter(w => w.length > 0);
        const totalWords = words.length;

        const handleEnd = () => {
          if (hasEnded) {return;}
          hasEnded = true;

          this.currentUtterance = null;

          if (endCallbackTimer) {
            clearTimeout(endCallbackTimer);
            endCallbackTimer = null;
          }

          if (this.onSpeakEnd) {
            this.onSpeakEnd();
          }
          resolve();
        };

        // Completion detection polling
        const checkSpeechStatus = () => {
          if (hasEnded) {return;}

          // Check if synthesis reports not speaking
          const isActuallySpeaking = this.synthesis && this.synthesis.speaking;
          const isActuallyPaused = this.synthesis && this.synthesis.paused;

          if (!isActuallySpeaking && !isActuallyPaused) {
            handleEnd();
            return;
          }

          // Aggressive check after last word
          if (reachedLastWord) {
            stagnationCount++;

            if (stagnationCount >= maxStagnation || !isActuallySpeaking) {
              handleEnd();
              return;
            }
          }

          // Timeout fallback
          const estimatedDuration = (totalWords / 2.5) * 1000;
          const maxDuration = Math.max(estimatedDuration * 2, 15000);

          if (Date.now() - startTime > maxDuration) {
            handleEnd();
            return;
          }

          // Schedule next check
          const nextCheckInterval = reachedLastWord ? 100 : 200;
          endCallbackTimer = setTimeout(checkSpeechStatus, nextCheckInterval);
        };

        // Track word progress for last word detection
        this.speechProgressCallback = (event) => {
          if (hasEnded || event.name !== 'word' || event.charIndex === undefined) {return;}

          // Calculate current word index
          let currentWordIndex = 0;
          let charCount = 0;

          for (let i = 0; i < words.length; i++) {
            if (charCount + words[i].length > event.charIndex) {
              currentWordIndex = i;
              break;
            }
            charCount += words[i].length + 1;
          }

          // Activate aggressive detection on last word
          if (currentWordIndex >= totalWords - 1 && !reachedLastWord) {
            reachedLastWord = true;
            stagnationCount = 0;

            // Immediate check after last word
            setTimeout(() => {
              if (!hasEnded) {checkSpeechStatus();}
            }, 500);
          }
        };

        utterance.onend = handleEnd;

        utterance.onerror = (event) => {
          hasEnded = true;
          this.currentUtterance = null;

          if (endCallbackTimer) {
            clearTimeout(endCallbackTimer);
            endCallbackTimer = null;
          }

          if (this.onSpeakError) {this.onSpeakError(event);}
          reject(new Error(`TTS failed: ${event.error}`));
        };

        utterance.onstart = () => {
          if (this.onSpeakStart) {this.onSpeakStart();}

          // Start completion detection
          endCallbackTimer = setTimeout(checkSpeechStatus, 1000);
        };

        this.currentUtterance = utterance;
        this.synthesis.speak(utterance);

        // Handle potential browser timeout issues
        this.handleBrowserTimeouts(utterance);
      });

    } catch (error) {
      console.error('Speak error:', error);
      throw error;
    }
  }

  /**
   * Stop current speech
   */
  stop() {
    // Clear highlight timers from current utterance before stopping
    if (this.currentUtterance && this.currentUtterance._highlightTimer) {
      clearInterval(this.currentUtterance._highlightTimer);
      this.currentUtterance._highlightTimer = null;
    }

    if (this.synthesis) {
      this.synthesis.cancel();
      this.currentUtterance = null;
    }

    // Clear fallback timer if running
    if (this.fallbackTimer) {
      clearTimeout(this.fallbackTimer);
      this.fallbackTimer = null;
    }
  }

  /**
   * Pause current speech
   */
  pause() {
    if (this.synthesis && this.currentUtterance) {
      this.synthesis.pause();
      if (this.onSpeakPause) {this.onSpeakPause();}
    }
  }

  /**
   * Resume paused speech
   */
  resume() {
    if (this.synthesis && this.currentUtterance) {
      this.synthesis.resume();
      if (this.onSpeakResume) {this.onSpeakResume();}
    }
  }

  /**
   * Check if currently speaking
   */
  isSpeaking() {
    return this.synthesis ? this.synthesis.speaking : false;
  }

  /**
   * Check if speech is paused
   */
  isPaused() {
    return this.synthesis ? this.synthesis.paused : false;
  }

  /**
   * Get available voices
   */
  getVoices() {
    return this.voices;
  }

  /**
   * Get voices filtered by language
   */
  getVoicesByLanguage(language) {
    return this.voices.filter(voice =>
      voice.lang.toLowerCase().startsWith(language.toLowerCase())
    );
  }

  /**
   * Get default voice for a language
   */
  getDefaultVoice(language = 'en') {
    const languageVoices = this.getVoicesByLanguage(language);

    if (languageVoices.length > 0) {
      // Prefer default voice
      const defaultVoice = languageVoices.find(voice => voice.default);
      return defaultVoice || languageVoices[0];
    }

    // Fallback to first available voice
    return this.voices[0] || null;
  }

  /**
   * Get voice by name
   */
  getVoiceByName(name) {
    if (!name || name === 'default') {
      return this.getDefaultVoice();
    }

    return this.voices.find(voice =>
      voice.name === name || voice.name.toLowerCase().includes(name.toLowerCase())
    ) || this.getDefaultVoice();
  }

  /**
   * Set event callbacks
   */
  setEventCallbacks(callbacks = {}) {
    this.onSpeakStart = callbacks.onStart || null;
    this.onSpeakEnd = callbacks.onEnd || null;
    this.onSpeakError = callbacks.onError || null;
    this.onSpeakPause = callbacks.onPause || null;
    this.onSpeakResume = callbacks.onResume || null;
  }

  // Private methods

  /**
   * Detect current browser
   */
  detectBrowser() {
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
      return 'chrome';
    } else if (userAgent.includes('firefox')) {
      return 'firefox';
    } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      return 'safari';
    } else if (userAgent.includes('edg')) {
      return 'edge';
    }

    return 'unknown';
  }

  /**
   * Get browser-specific configuration
   */
  getBrowserConfig() {
    switch (this.browserType) {
    case 'chrome':
    case 'edge':
      return {
        requiresEventListener: false,
        loadDelay: 100,
        maxSegmentLength: 200, // Chrome has limits on utterance length
        resumeWorkaround: true // Chrome needs workaround for resume
      };

    case 'firefox':
      return {
        requiresEventListener: true,
        loadDelay: 0,
        maxSegmentLength: 500,
        resumeWorkaround: false
      };

    case 'safari':
      return {
        requiresEventListener: true,
        loadDelay: 0,
        maxSegmentLength: 300,
        resumeWorkaround: false
      };

    default:
      return {
        requiresEventListener: true,
        loadDelay: 100,
        maxSegmentLength: 200,
        resumeWorkaround: true
      };
    }
  }

  /**
   * Apply TTS settings to utterance
   */
  async applySettings(utterance, options) {
    // Get user settings from storage or use defaults
    const settings = await this.getUserSettings();
    const finalOptions = { ...settings, ...options };

    // Set voice
    if (finalOptions.voice) {
      const voice = this.getVoiceByName(finalOptions.voice);
      if (voice) {
        utterance.voice = voice;
      }
    }

    // Set rate (0.1 to 10, default 1)
    if (finalOptions.rate !== undefined) {
      utterance.rate = Math.max(0.1, Math.min(10, finalOptions.rate));
    }

    // Set pitch (0 to 2, default 1)
    if (finalOptions.pitch !== undefined) {
      utterance.pitch = Math.max(0, Math.min(2, finalOptions.pitch));
    }

    // Set volume (0 to 1, default 1)
    if (finalOptions.volume !== undefined) {
      utterance.volume = Math.max(0, Math.min(1, finalOptions.volume));
    }

    // Set language
    if (finalOptions.lang) {
      utterance.lang = finalOptions.lang;
    }
  }

  /**
   * Get user TTS settings from storage
   */
  async getUserSettings() {
    try {
      const api = this.getStorageAPI();
      if (!api) {return this.getDefaultSettings();}

      const result = await this.getStorageData(api, ['ttsSettings']);
      return result.ttsSettings || this.getDefaultSettings();

    } catch (error) {
      console.error('Failed to load TTS settings:', error);
      return this.getDefaultSettings();
    }
  }

  /**
   * Get default TTS settings
   */
  getDefaultSettings() {
    return {
      voice: 'default',
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      enabled: true
    };
  }

  /**
   * Get appropriate storage API
   */
  getStorageAPI() {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return chrome;
    } else if (typeof browser !== 'undefined' && browser.storage) {
      return browser;
    }
    return null;
  }

  /**
   * Get data from storage with promise handling
   */
  getStorageData(api, keys) {
    if (api === chrome) {
      return new Promise((resolve) => {
        api.storage.sync.get(keys, resolve);
      });
    } else {
      return api.storage.sync.get(keys);
    }
  }

  /**
   * Set up event listeners for utterance
   */
  setupUtteranceEvents(utterance) {
    // Enhanced boundary event handling with fallback support
    let boundaryEventReceived = false;
    let fallbackTimer = null;

    utterance.onboundary = (event) => {
      boundaryEventReceived = true;

      // Clear fallback timer since native events are working
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }

      // Call our speech progress callback for completion detection
      if (this.speechProgressCallback) {
        this.speechProgressCallback(event);
      }

      if (event.name === 'word' && this.onWordBoundary) {
        this.onWordBoundary({
          charIndex: event.charIndex,
          text: utterance.text,
          name: event.name,
          event: event,
          native: true
        });
      } else if (event.name === 'sentence' && this.onSentenceBoundary) {
        this.onSentenceBoundary({
          charIndex: event.charIndex,
          text: utterance.text,
          name: event.name,
          event: event,
          native: true
        });
      }
    };

    // Set up a fallback detection timer
    fallbackTimer = setTimeout(() => {
      if (!boundaryEventReceived && (this.onWordBoundary || this.onSentenceBoundary)) {
        console.warn('⚠️ No boundary events received, activating fallback highlighting');
        this.setupFallbackHighlighting(utterance);
      }
    }, 500); // Wait 500ms for boundary events

    // Store the timer for cleanup
    this.fallbackTimer = fallbackTimer;

    // Store reference to utterance for cleanup
    this.currentUtterance = utterance;

    // Test onboundary support after a short delay to allow voice to load
    setTimeout(() => {
      this.testAndSetupHighlighting(utterance);
    }, 100);

    utterance.onmark = (event) => {
      // SSML marks - for advanced speech control
      console.warn('TTS mark:', event.name);
    };

    // Test if boundary events are supported
    const originalOnStart = utterance.onstart;
    utterance.onstart = () => {
      if (originalOnStart) {originalOnStart();}
    };
  }

  /**
   * Handle browser-specific timeout issues
   */
  handleBrowserTimeouts(utterance) {
    if (this.browserType === 'chrome' || this.browserType === 'edge') {
      // Chrome has issues with long utterances - implement resume workaround
      let timeout;

      const resetTimeout = () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          if (this.synthesis.speaking) {
            this.synthesis.pause();
            setTimeout(() => {
              if (this.currentUtterance) {
                this.synthesis.resume();
              }
            }, 10);
          }
        }, 14000); // Resume every 14 seconds to prevent Chrome timeout
      };

      utterance.onstart = resetTimeout;
      utterance.onresume = resetTimeout;

      utterance.onend = () => {
        clearTimeout(timeout);
      };

      utterance.onerror = () => {
        clearTimeout(timeout);
      };
    }
  }

  /**
   * Split long text into chunks for better browser compatibility
   */
  splitTextIntoChunks(text, maxLength = null) {
    const chunkLength = maxLength || this.config.maxSegmentLength;

    if (text.length <= chunkLength) {
      return [text];
    }

    const chunks = [];
    const sentences = text.split(/[.!?]+/);
    let currentChunk = '';

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length <= chunkLength) {
        currentChunk += sentence + '. ';
      } else {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = sentence + '. ';
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  /**
   * Speak long text by splitting into chunks
   */
  async speakLongText(text, options = {}) {
    const chunks = this.splitTextIntoChunks(text);

    for (let i = 0; i < chunks.length; i++) {
      if (!this.isInitialized) {break;}

      await this.speak(chunks[i], options);

      // Small delay between chunks
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }


  /**
   * Get TTS service status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      supported: this.isWebSpeechSupported(),
      speaking: this.isSpeaking(),
      paused: this.isPaused(),
      voicesLoaded: this.voices.length,
      browserType: this.browserType,
      currentVoice: this.currentUtterance?.voice?.name || null
    };
  }

  /**
   * Set callback for word boundary events (used for text highlighting)
   */
  setWordBoundaryCallback(callback) {
    this.onWordBoundary = callback;
  }

  /**
   * Set callback for sentence boundary events
   */
  setSentenceBoundaryCallback(callback) {
    this.onSentenceBoundary = callback;
  }

  /**
   * Test onboundary support and setup appropriate highlighting
   */
  testAndSetupHighlighting(utterance) {
    // Check if highlighting callbacks are set
    if (!this.onWordBoundary && !this.onSentenceBoundary) {
      console.warn('🔍 No highlighting callbacks set, skipping highlighting setup');
      return;
    }

    // Test if the current voice/browser combination supports onboundary
    const supportsOnBoundary = this.testOnBoundarySupport(utterance);

    if (!supportsOnBoundary) {
      console.warn('⚠️ onboundary not supported with current voice, using fallback highlighting');
      this.setupFallbackHighlighting(utterance);
    } else {
      console.warn('✅ onboundary supported, using native highlighting');
    }
  }

  /**
   * Test if onboundary events are supported with current voice
   */
  testOnBoundarySupport(utterance) {
    // Basic check - if onboundary property doesn't exist, definitely not supported
    if (typeof utterance.onboundary === 'undefined') {
      return false;
    }

    // Check voice-specific support
    if (utterance.voice) {
      // Some voices (especially remote/cloud voices) might not support onboundary
      const isLocalVoice = utterance.voice.localService !== false;

      // Prefer local voices for onboundary support
      if (!isLocalVoice) {
        console.warn(`🌐 Remote voice detected (${utterance.voice.name}), may have limited onboundary support`);
        // Don't return false immediately, let the fallback detection handle it
      }
    }

    return true; // Assume supported, fallback will kick in if needed
  }

  /**
   * Setup fallback highlighting for browsers without onboundary support
   */
  setupFallbackHighlighting(utterance) {
    if (!this.onWordBoundary && !this.onSentenceBoundary) {
      return;
    }

    console.warn('⏰ Setting up timer-based highlighting fallback');

    const words = utterance.text.split(/\s+/);
    const currentRate = utterance.rate || 1.0;

    // Improved timing calculation based on voice characteristics
    const voiceTimingFactor = this.getVoiceTimingFactor(utterance.voice);
    const languageTimingFactor = this.getLanguageTimingFactor(utterance.lang || utterance.voice?.lang);

    // Base timing: 2.5 words per second for English, adjusted for rate, voice, and language
    const baseWordsPerSecond = 2.5;
    const adjustedWordsPerSecond = baseWordsPerSecond * currentRate * voiceTimingFactor * languageTimingFactor;
    const wordInterval = 1000 / adjustedWordsPerSecond;

    console.warn(`📊 Timing calculation - Rate: ${currentRate}, Voice Factor: ${voiceTimingFactor}, Lang Factor: ${languageTimingFactor}, Final WPS: ${adjustedWordsPerSecond.toFixed(2)}, Interval: ${wordInterval.toFixed(0)}ms`);

    let wordIndex = 0;
    let charIndex = 0;
    const startTime = Date.now();
    let lastHighlightTime = startTime;

    const highlightTimer = setInterval(() => {
      if (!this.currentUtterance || this.currentUtterance !== utterance || wordIndex >= words.length) {
        clearInterval(highlightTimer);
        return;
      }

      // Add adaptive timing adjustment based on actual speech progress
      const currentTime = Date.now();
      const elapsedTime = currentTime - startTime;
      const expectedWordIndex = Math.floor((elapsedTime / 1000) * adjustedWordsPerSecond);

      // If we're significantly ahead or behind, adjust
      if (Math.abs(expectedWordIndex - wordIndex) > 2 && wordIndex > 5) {
        console.warn(`🔄 Adjusting timing - Expected: ${expectedWordIndex}, Current: ${wordIndex}`);
        wordIndex = Math.max(0, Math.min(expectedWordIndex, words.length - 1));

        // Recalculate charIndex for the adjusted position
        charIndex = 0;
        for (let i = 0; i < wordIndex; i++) {
          charIndex += words[i].length + 1; // +1 for space
        }
      }

      const currentWord = words[wordIndex];
      if (currentWord && this.onWordBoundary) {
        this.onWordBoundary({
          charIndex: charIndex,
          text: utterance.text,
          name: 'word',
          fallback: true,
          wordIndex: wordIndex,
          totalWords: words.length,
          actualTiming: currentTime - lastHighlightTime
        });
      }

      charIndex += currentWord.length + 1; // +1 for space
      wordIndex++;
      lastHighlightTime = currentTime;
    }, wordInterval);

    // Store timer reference for cleanup
    utterance._highlightTimer = highlightTimer;
  }

  /**
   * Get timing factor based on voice characteristics
   */
  getVoiceTimingFactor(voice) {
    if (!voice) {return 1.0;}

    const voiceName = voice.name.toLowerCase();

    // Voice-specific timing adjustments based on observed speech patterns
    if (voiceName.includes('google')) {
      if (voiceName.includes('uk') || voiceName.includes('british')) {
        return 0.85; // British voices tend to speak slower
      }
      if (voiceName.includes('us') || voiceName.includes('american')) {
        return 1.0; // Standard timing
      }
      if (voiceName.includes('australian')) {
        return 0.9; // Slightly slower
      }
      return 0.95; // Google voices generally slightly slower
    }

    if (voiceName.includes('microsoft') || voiceName.includes('edge')) {
      return 1.1; // Microsoft voices tend to be faster
    }

    if (voiceName.includes('apple') || voiceName.includes('system')) {
      return 0.9; // Apple system voices tend to be slower
    }

    // Default for unknown voices
    return 1.0;
  }

  /**
   * Get timing factor based on language characteristics
   */
  getLanguageTimingFactor(language) {
    if (!language) {return 1.0;}

    const lang = language.toLowerCase();

    // Language-specific timing adjustments based on typical speaking rates
    if (lang.startsWith('en')) {
      if (lang.includes('gb') || lang.includes('uk')) {
        return 0.85; // British English slower
      }
      if (lang.includes('au')) {
        return 0.9; // Australian English
      }
      return 1.0; // Standard English (US)
    }

    if (lang.startsWith('es')) {
      return 1.2; // Spanish typically faster
    }

    if (lang.startsWith('fr')) {
      return 1.1; // French slightly faster
    }

    if (lang.startsWith('de')) {
      return 0.9; // German slightly slower
    }

    if (lang.startsWith('it')) {
      return 1.15; // Italian faster
    }

    if (lang.startsWith('pt')) {
      return 1.1; // Portuguese faster
    }

    if (lang.startsWith('ru')) {
      return 0.95; // Russian slightly slower
    }

    if (lang.startsWith('ja')) {
      return 0.8; // Japanese slower
    }

    if (lang.startsWith('ko')) {
      return 0.85; // Korean slower
    }

    if (lang.startsWith('zh')) {
      return 0.9; // Chinese slightly slower
    }

    if (lang.startsWith('hi')) {
      return 0.95; // Hindi slightly slower
    }

    if (lang.startsWith('ar')) {
      return 0.9; // Arabic slower
    }

    if (lang.startsWith('ur')) {
      return 0.9; // Urdu slower
    }

    // Default for unknown languages
    return 1.0;
  }

  /**
   * Remove highlighting callbacks
   */
  clearHighlightCallbacks() {
    console.warn('🧹 Clearing highlight callbacks');
    this.onWordBoundary = null;
    this.onSentenceBoundary = null;

    // Clear fallback timer if running
    if (this.fallbackTimer) {
      clearTimeout(this.fallbackTimer);
      this.fallbackTimer = null;
    }

    // Clear highlight timers from current utterance
    if (this.currentUtterance && this.currentUtterance._highlightTimer) {
      clearInterval(this.currentUtterance._highlightTimer);
      this.currentUtterance._highlightTimer = null;
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TTSService;
} else if (typeof window !== 'undefined') {
  window.TTSService = TTSService;
}