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
      console.log('✅ TTS Service initialized successfully');
      
    } catch (error) {
      console.error('❌ TTS Service initialization failed:', error);
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
          console.log(`🎤 Loaded ${this.voices.length} TTS voices`);
          this.logAvailableVoices();
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
        utterance.onend = () => {
          this.currentUtterance = null;
          if (this.onSpeakEnd) this.onSpeakEnd();
          resolve();
        };
        
        utterance.onerror = (event) => {
          console.error('TTS error:', event);
          this.currentUtterance = null;
          if (this.onSpeakError) this.onSpeakError(event);
          reject(new Error(`TTS failed: ${event.error}`));
        };
        
        utterance.onstart = () => {
          if (this.onSpeakStart) this.onSpeakStart();
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
    if (this.synthesis) {
      this.synthesis.cancel();
      this.currentUtterance = null;
    }
  }

  /**
   * Pause current speech
   */
  pause() {
    if (this.synthesis && this.currentUtterance) {
      this.synthesis.pause();
      if (this.onSpeakPause) this.onSpeakPause();
    }
  }

  /**
   * Resume paused speech
   */
  resume() {
    if (this.synthesis && this.currentUtterance) {
      this.synthesis.resume();
      if (this.onSpeakResume) this.onSpeakResume();
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
      if (!api) return this.getDefaultSettings();
      
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
    utterance.onboundary = (event) => {
      // Word/sentence boundaries - used for text highlighting
      if (event.name === 'word' && this.onWordBoundary) {
        this.onWordBoundary({
          charIndex: event.charIndex,
          text: utterance.text,
          name: event.name
        });
      } else if (event.name === 'sentence' && this.onSentenceBoundary) {
        this.onSentenceBoundary({
          charIndex: event.charIndex,
          text: utterance.text,
          name: event.name
        });
      }
      
      console.log('TTS boundary:', event.name, 'at', event.charIndex);
    };
    
    utterance.onmark = (event) => {
      // SSML marks - for advanced speech control
      console.log('TTS mark:', event.name);
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
      if (!this.isInitialized) break;
      
      await this.speak(chunks[i], options);
      
      // Small delay between chunks
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  /**
   * Log available voices for debugging
   */
  logAvailableVoices() {
    if (this.voices.length === 0) {
      console.warn('⚠️ No TTS voices available');
      return;
    }
    
    console.log('🎤 Available TTS voices:');
    this.voices.forEach((voice, index) => {
      console.log(`  ${index + 1}. ${voice.name} (${voice.lang}) ${voice.default ? '[DEFAULT]' : ''}`);
    });
    
    // Group by language for summary
    const languageGroups = {};
    this.voices.forEach(voice => {
      const lang = voice.lang.split('-')[0];
      if (!languageGroups[lang]) {
        languageGroups[lang] = 0;
      }
      languageGroups[lang]++;
    });
    
    console.log('📊 Voice summary by language:', languageGroups);
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
   * Remove highlighting callbacks
   */
  clearHighlightCallbacks() {
    this.onWordBoundary = null;
    this.onSentenceBoundary = null;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TTSService;
} else if (typeof window !== 'undefined') {
  window.TTSService = TTSService;
}