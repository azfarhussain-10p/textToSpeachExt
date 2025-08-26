/**
 * speech-synthesis.js
 * Comprehensive Web Speech API Implementation with Cross-Browser Support
 * Handles all major browser quirks, platform limitations, and provides robust error recovery
 * 
 * @author Generated from Web Speech API Research
 * @version 1.0.0
 * @license MIT
 */

'use strict';

/**
 * Main SpeechSynthesisManager class
 * Provides a robust, cross-browser implementation of the Web Speech API
 */
class SpeechSynthesisManager {
  constructor(options = {}) {
    // Core properties
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.currentUtterance = null;
    this.queue = [];
    this.isProcessing = false;
    this.isReady = false;
    
    // Platform detection
    this.platform = this._detectPlatform();
    this.adaptations = this._getPlatformAdaptations();
    
    // Configuration
    this.config = {
      voiceLoadTimeout: options.voiceLoadTimeout || 5000,
      defaultLang: options.defaultLang || 'en-US',
      defaultRate: options.defaultRate || 1.0,
      defaultPitch: options.defaultPitch || 1.0,
      defaultVolume: options.defaultVolume || 1.0,
      maxTextLength: this.adaptations.maxTextLength,
      enableChromeWorkaround: options.enableChromeWorkaround !== false,
      enableLogging: options.enableLogging || false,
      ...options
    };
    
    // State management
    this.state = {
      speaking: false,
      paused: false,
      pending: false
    };
    
    // Event emitter for custom events
    this.listeners = new Map();
    
    // Chrome workaround timer
    this.chromeWorkaroundTimer = null;
    
    // Voice manager
    this.voiceManager = new VoiceManager(this);
    
    // Initialize
    this._initialize();
  }
  
  /**
   * Initialize the speech synthesis manager
   */
  async _initialize() {
    if (!this.isSupported()) {
      this._emit('error', new Error('Speech Synthesis API not supported'));
      return;
    }
    
    try {
      await this._loadVoices();
      this.isReady = true;
      this._emit('ready', { voices: this.voices });
      this._log('Speech synthesis initialized successfully');
    } catch (error) {
      this._emit('error', error);
      this._log('Failed to initialize speech synthesis', error);
    }
  }
  
  /**
   * Check if Speech Synthesis API is supported
   */
  isSupported() {
    return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  }
  
  /**
   * Detect platform and browser
   */
  _detectPlatform() {
    const ua = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();
    
    return {
      isIOS: /iphone|ipad|ipod/.test(ua) || (platform === 'macintel' && navigator.maxTouchPoints > 1),
      isAndroid: /android/.test(ua),
      isChrome: /chrome/.test(ua) && !/edg/.test(ua),
      isSafari: /safari/.test(ua) && !/chrome/.test(ua),
      isFirefox: /firefox/.test(ua),
      isEdge: /edg/.test(ua),
      isMobile: /mobile|tablet/.test(ua)
    };
  }
  
  /**
   * Get platform-specific adaptations
   */
  _getPlatformAdaptations() {
    return {
      pauseResumeSupported: !this.platform.isAndroid,
      requiresUserActivation: this.platform.isIOS,
      needsChromeWorkaround: this.platform.isChrome,
      needsVoiceFiltering: this.platform.isIOS,
      maxTextLength: this.platform.isAndroid ? 4000 : 32767,
      voiceLoadingAsync: this.platform.isChrome,
      needsDelayAfterCancel: this.platform.isChrome
    };
  }
  
  /**
   * Load available voices with cross-browser support
   */
  _loadVoices() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Voice loading timeout'));
      }, this.config.voiceLoadTimeout);
      
      const checkVoices = () => {
        let voices = this.synth.getVoices();
        
        if (voices.length > 0) {
          clearTimeout(timeout);
          
          // Filter iOS voices if needed
          if (this.adaptations.needsVoiceFiltering) {
            voices = this._filterIOSVoices(voices);
          }
          
          this.voices = voices;
          this.voiceManager.setVoices(voices);
          resolve(voices);
        }
      };
      
      // Immediate check (Firefox/Safari)
      checkVoices();
      
      // Async loading (Chrome)
      if (this.voices.length === 0) {
        if ('onvoiceschanged' in this.synth) {
          this.synth.onvoiceschanged = () => {
            checkVoices();
            this.synth.onvoiceschanged = null;
          };
        } else {
          // Polling fallback
          const pollInterval = setInterval(() => {
            checkVoices();
            if (this.voices.length > 0) {
              clearInterval(pollInterval);
            }
          }, 100);
          
          setTimeout(() => {
            clearInterval(pollInterval);
          }, this.config.voiceLoadTimeout);
        }
      }
    });
  }
  
  /**
   * Filter iOS voices to only usable ones
   */
  _filterIOSVoices(voices) {
    const usableVoices = [
      'en-US', 'en-GB', 'en-AU', 'en-IN', 'en-ZA',
      'es-ES', 'es-MX', 'es-AR', 
      'fr-FR', 'fr-CA',
      'de-DE', 'it-IT', 'ja-JP', 'ko-KR', 
      'zh-CN', 'zh-TW', 'zh-HK',
      'pt-BR', 'pt-PT',
      'ru-RU', 'ar-SA', 'hi-IN', 
      'th-TH', 'nl-NL', 'sv-SE', 'da-DK', 
      'nb-NO', 'fi-FI', 'tr-TR', 'pl-PL',
      'cs-CZ', 'sk-SK', 'hu-HU', 'ro-RO'
    ];
    
    return voices.filter(voice => {
      return usableVoices.includes(voice.lang) || voice.default;
    });
  }
  
  /**
   * Main speak method with queue management
   */
  async speak(text, options = {}) {
    if (!this.isReady) {
      throw new Error('Speech synthesis not ready');
    }
    
    // Handle text chunking for Android
    if (this.platform.isAndroid && text.length > this.adaptations.maxTextLength) {
      const chunks = this._chunkText(text, this.adaptations.maxTextLength);
      for (const chunk of chunks) {
        await this.speak(chunk, options);
      }
      return;
    }
    
    // Cancel current speech if immediate mode
    if (options.immediate) {
      await this.cancel();
    }
    
    // Create utterance
    const utterance = this._createUtterance(text, options);
    
    // Add to queue or speak immediately
    if (this.state.speaking && !options.immediate) {
      this.queue.push({ utterance, options });
      this._emit('queued', { text, position: this.queue.length });
      return;
    }
    
    return this._speak(utterance, options);
  }
  
  /**
   * Internal speak implementation
   */
  _speak(utterance, options = {}) {
    return new Promise((resolve, reject) => {
      this.currentUtterance = utterance;
      this.state.speaking = true;
      this.state.paused = false;
      
      // Setup event handlers
      this._attachEventHandlers(utterance, {
        onStart: (event) => {
          this._log('Speech started');
          this._startChromeWorkaround();
          this._emit('start', event);
          options.onStart?.(event);
        },
        onEnd: (event) => {
          this._log('Speech ended');
          this._stopChromeWorkaround();
          this.state.speaking = false;
          this.currentUtterance = null;
          this._emit('end', event);
          options.onEnd?.(event);
          this._processQueue();
          resolve();
        },
        onError: (event) => {
          this._log('Speech error:', event.error);
          this._stopChromeWorkaround();
          this.state.speaking = false;
          this.currentUtterance = null;
          const error = this._handleSpeechError(event);
          this._emit('error', error);
          options.onError?.(error);
          reject(error);
        },
        onPause: (event) => {
          this.state.paused = true;
          this._emit('pause', event);
          options.onPause?.(event);
        },
        onResume: (event) => {
          this.state.paused = false;
          this._emit('resume', event);
          options.onResume?.(event);
        },
        onBoundary: (event) => {
          this._emit('boundary', event);
          options.onBoundary?.(event);
        }
      });
      
      // Speak
      this.synth.speak(utterance);
    });
  }
  
  /**
   * Create utterance with proper configuration
   */
  _createUtterance(text, options = {}) {
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice
    if (options.voice) {
      utterance.voice = options.voice;
    } else if (options.lang || options.voiceName) {
      const voice = this.voiceManager.findVoice({
        lang: options.lang || this.config.defaultLang,
        name: options.voiceName,
        gender: options.gender
      });
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      }
    }
    
    // Set parameters with validation
    utterance.rate = this._validateRate(options.rate ?? this.config.defaultRate);
    utterance.pitch = this._validatePitch(options.pitch ?? this.config.defaultPitch);
    utterance.volume = this._validateVolume(options.volume ?? this.config.defaultVolume);
    
    // Set language if not set by voice
    if (!utterance.voice && (options.lang || this.config.defaultLang)) {
      utterance.lang = options.lang || this.config.defaultLang;
    }
    
    return utterance;
  }
  
  /**
   * Attach event handlers to utterance
   */
  _attachEventHandlers(utterance, handlers) {
    utterance.onstart = handlers.onStart;
    utterance.onend = handlers.onEnd;
    utterance.onerror = handlers.onError;
    utterance.onpause = handlers.onPause;
    utterance.onresume = handlers.onResume;
    utterance.onboundary = handlers.onBoundary;
  }
  
  /**
   * Chrome workaround for 14-second timeout bug
   */
  _startChromeWorkaround() {
    if (!this.config.enableChromeWorkaround || !this.platform.isChrome) {
      return;
    }
    
    this._stopChromeWorkaround();
    
    // Resume every 14 seconds to prevent Chrome timeout
    this.chromeWorkaroundTimer = setInterval(() => {
      if (this.state.speaking && !this.state.paused) {
        this.synth.pause();
        this.synth.resume();
      }
    }, 14000);
  }
  
  /**
   * Stop Chrome workaround timer
   */
  _stopChromeWorkaround() {
    if (this.chromeWorkaroundTimer) {
      clearInterval(this.chromeWorkaroundTimer);
      this.chromeWorkaroundTimer = null;
    }
  }
  
  /**
   * Pause speech (if supported)
   */
  pause() {
    if (!this.adaptations.pauseResumeSupported) {
      this._log('Pause not supported on this platform');
      return false;
    }
    
    if (this.state.speaking && !this.state.paused) {
      this.synth.pause();
      this.state.paused = true;
      this._emit('pause', {});
      return true;
    }
    
    return false;
  }
  
  /**
   * Resume speech (if supported)
   */
  resume() {
    if (!this.adaptations.pauseResumeSupported) {
      this._log('Resume not supported on this platform');
      return false;
    }
    
    if (this.state.speaking && this.state.paused) {
      this.synth.resume();
      this.state.paused = false;
      this._emit('resume', {});
      return true;
    }
    
    return false;
  }
  
  /**
   * Cancel current speech and clear queue
   */
  async cancel() {
    this._stopChromeWorkaround();
    this.synth.cancel();
    
    // Chrome needs delay after cancel
    if (this.adaptations.needsDelayAfterCancel) {
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    
    this.queue = [];
    this.state.speaking = false;
    this.state.paused = false;
    this.currentUtterance = null;
    this._emit('cancel', {});
  }
  
  /**
   * Process speech queue
   */
  _processQueue() {
    if (this.queue.length === 0 || this.state.speaking) {
      return;
    }
    
    const { utterance, options } = this.queue.shift();
    this._speak(utterance, options);
  }
  
  /**
   * Handle speech errors with recovery strategies
   */
  _handleSpeechError(event) {
    const error = {
      type: event.error,
      message: this._getErrorMessage(event.error),
      utterance: event.utterance,
      recoverable: this._isRecoverableError(event.error)
    };
    
    return error;
  }
  
  /**
   * Get human-readable error message
   */
  _getErrorMessage(errorType) {
    const messages = {
      'canceled': 'Speech was canceled',
      'interrupted': 'Speech was interrupted',
      'audio-busy': 'Audio system is busy',
      'audio-hardware': 'Audio hardware error',
      'network': 'Network error',
      'synthesis-unavailable': 'Speech synthesis unavailable',
      'synthesis-failed': 'Speech synthesis failed',
      'language-unavailable': 'Language not available',
      'voice-unavailable': 'Voice not available',
      'text-too-long': 'Text is too long',
      'invalid-argument': 'Invalid argument',
      'not-allowed': 'Speech synthesis not allowed'
    };
    
    return messages[errorType] || `Unknown error: ${errorType}`;
  }
  
  /**
   * Check if error is recoverable
   */
  _isRecoverableError(errorType) {
    const recoverableErrors = [
      'canceled',
      'interrupted',
      'audio-busy',
      'network'
    ];
    
    return recoverableErrors.includes(errorType);
  }
  
  /**
   * Chunk text for length limitations
   */
  _chunkText(text, maxLength) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks = [];
    let currentChunk = '';
    
    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > maxLength) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = sentence;
      } else {
        currentChunk += sentence;
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }
  
  /**
   * Parameter validation methods
   */
  _validateRate(rate) {
    // Chrome breaks above 2.0
    const maxRate = this.platform.isChrome ? 2.0 : 10.0;
    return Math.max(0.1, Math.min(rate, maxRate));
  }
  
  _validatePitch(pitch) {
    return Math.max(0, Math.min(pitch, 2));
  }
  
  _validateVolume(volume) {
    return Math.max(0, Math.min(volume, 1));
  }
  
  /**
   * Event emitter methods
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }
  
  off(event, callback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }
  
  _emit(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
  
  /**
   * Logging utility
   */
  _log(...args) {
    if (this.config.enableLogging) {
      console.log('[SpeechSynthesis]', ...args);
    }
  }
  
  /**
   * Get current state
   */
  getState() {
    return {
      ...this.state,
      ready: this.isReady,
      supported: this.isSupported(),
      voices: this.voices.length,
      queueLength: this.queue.length
    };
  }
  
  /**
   * Get platform adaptations
   */
  getAdaptations() {
    return { ...this.adaptations };
  }
  
  /**
   * Get available voices
   */
  getVoices() {
    return [...this.voices];
  }
  
  /**
   * Set default configuration
   */
  setConfig(config) {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Voice Manager for intelligent voice selection
 */
class VoiceManager {
  constructor(speechManager) {
    this.speechManager = speechManager;
    this.voices = [];
    this.voiceMap = new Map();
    this.languageMap = new Map();
  }
  
  setVoices(voices) {
    this.voices = voices;
    this._buildMaps();
  }
  
  _buildMaps() {
    this.voiceMap.clear();
    this.languageMap.clear();
    
    this.voices.forEach(voice => {
      // Build voice name map
      this.voiceMap.set(voice.name.toLowerCase(), voice);
      
      // Build language map
      const lang = voice.lang.toLowerCase();
      if (!this.languageMap.has(lang)) {
        this.languageMap.set(lang, []);
      }
      this.languageMap.get(lang).push(voice);
      
      // Also map base language (e.g., 'en' for 'en-US')
      const baseLang = lang.split('-')[0];
      if (!this.languageMap.has(baseLang)) {
        this.languageMap.set(baseLang, []);
      }
      this.languageMap.get(baseLang).push(voice);
    });
  }
  
  findVoice(criteria = {}) {
    // Priority 1: Exact voice name match
    if (criteria.name) {
      const exactMatch = this.voiceMap.get(criteria.name.toLowerCase());
      if (exactMatch) return exactMatch;
    }
    
    // Priority 2: Language + gender match
    if (criteria.lang) {
      const langVoices = this._getVoicesForLanguage(criteria.lang);
      
      if (criteria.gender) {
        const genderMatch = langVoices.find(voice => 
          this._matchesGender(voice.name, criteria.gender)
        );
        if (genderMatch) return genderMatch;
      }
      
      // Priority 3: Best language match
      if (langVoices.length > 0) {
        // Prefer local/default voices
        const defaultVoice = langVoices.find(v => v.default);
        if (defaultVoice) return defaultVoice;
        
        const localVoice = langVoices.find(v => v.localService);
        if (localVoice) return localVoice;
        
        return langVoices[0];
      }
    }
    
    // Priority 4: Default voice
    const defaultVoice = this.voices.find(v => v.default);
    if (defaultVoice) return defaultVoice;
    
    // Priority 5: First available
    return this.voices[0];
  }
  
  _getVoicesForLanguage(lang) {
    const normalizedLang = lang.toLowerCase();
    
    // Try exact match first
    if (this.languageMap.has(normalizedLang)) {
      return this.languageMap.get(normalizedLang);
    }
    
    // Try base language
    const baseLang = normalizedLang.split('-')[0];
    if (this.languageMap.has(baseLang)) {
      return this.languageMap.get(baseLang);
    }
    
    // Try to find any voice that starts with the language
    return this.voices.filter(voice => 
      voice.lang.toLowerCase().startsWith(baseLang)
    );
  }
  
  _matchesGender(voiceName, gender) {
    const name = voiceName.toLowerCase();
    const genderLower = gender.toLowerCase();
    
    const maleIndicators = ['male', 'man', 'guy', 'boy', 'masculine'];
    const femaleIndicators = ['female', 'woman', 'girl', 'lady', 'feminine'];
    
    // Common voice names by gender
    const maleNames = ['alex', 'daniel', 'thomas', 'fred', 'bruce', 'lee', 'aaron'];
    const femaleNames = ['samantha', 'victoria', 'karen', 'alice', 'susan', 'emily', 'zoe'];
    
    if (genderLower === 'male' || genderLower === 'm') {
      return maleIndicators.some(indicator => name.includes(indicator)) ||
             maleNames.some(n => name.includes(n));
    }
    
    if (genderLower === 'female' || genderLower === 'f') {
      return femaleIndicators.some(indicator => name.includes(indicator)) ||
             femaleNames.some(n => name.includes(n));
    }
    
    return false;
  }
  
  getVoicesByLanguage(lang) {
    return this._getVoicesForLanguage(lang);
  }
  
  getAvailableLanguages() {
    const languages = new Set();
    this.voices.forEach(voice => {
      languages.add(voice.lang);
    });
    return Array.from(languages).sort();
  }
}

/**
 * Utility functions
 */
const SpeechSynthesisUtils = {
  /**
   * Create a simple speech button
   */
  createSpeechButton(text, options = {}) {
    const button = document.createElement('button');
    button.textContent = options.buttonText || 'Speak';
    button.setAttribute('aria-label', options.ariaLabel || 'Speak text');
    button.className = options.className || 'speech-button';
    
    const manager = new SpeechSynthesisManager(options.managerOptions);
    
    button.addEventListener('click', async () => {
      try {
        if (manager.getState().speaking) {
          await manager.cancel();
          button.textContent = options.buttonText || 'Speak';
        } else {
          await manager.speak(text, options.speakOptions);
          button.textContent = options.stopText || 'Stop';
        }
      } catch (error) {
        console.error('Speech error:', error);
      }
    });
    
    manager.on('end', () => {
      button.textContent = options.buttonText || 'Speak';
    });
    
    return { button, manager };
  },
  
  /**
   * Check if speech synthesis is available
   */
  isAvailable() {
    return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  },
  
  /**
   * Get best voice for language
   */
  async getBestVoice(lang, timeout = 3000) {
    if (!this.isAvailable()) return null;
    
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const checkVoices = () => {
        const voices = speechSynthesis.getVoices();
        const voice = voices.find(v => v.lang.startsWith(lang)) || 
                     voices.find(v => v.default);
        
        if (voice || Date.now() - startTime > timeout) {
          resolve(voice || null);
        } else {
          setTimeout(checkVoices, 100);
        }
      };
      
      checkVoices();
    });
  },
  
  /**
   * Speak text with minimal setup
   */
  async speakSimple(text, lang = 'en-US') {
    const manager = new SpeechSynthesisManager();
    
    // Wait for initialization
    await new Promise(resolve => {
      if (manager.isReady) {
        resolve();
      } else {
        manager.on('ready', resolve);
        manager.on('error', resolve);
      }
    });
    
    return manager.speak(text, { lang });
  }
};

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SpeechSynthesisManager, VoiceManager, SpeechSynthesisUtils };
} else if (typeof define === 'function' && define.amd) {
  define([], function() {
    return { SpeechSynthesisManager, VoiceManager, SpeechSynthesisUtils };
  });
} else {
  window.SpeechSynthesisManager = SpeechSynthesisManager;
  window.VoiceManager = VoiceManager;
  window.SpeechSynthesisUtils = SpeechSynthesisUtils;
}