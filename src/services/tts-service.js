/**
 * Text-to-Speech Service
 * Handles Web Speech API integration with cross-browser compatibility
 */

class TTSService {
  constructor() {
    this.synth = null;
    this.currentUtterance = null;
    this.isInitialized = false;
    this.availableVoices = [];
    this.defaultSettings = {
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      language: 'en-US',
      voice: null
    };
    
    // Event callbacks
    this.onStart = null;
    this.onEnd = null;
    this.onPause = null;
    this.onResume = null;
    this.onError = null;
    this.onBoundary = null;
  }

  /**
   * Initialize TTS service
   */
  async initialize() {
    try {
      // Check Web Speech API support
      if (!('speechSynthesis' in window)) {
        throw new Error('Web Speech API not supported in this browser');
      }

      this.synth = window.speechSynthesis;
      
      // Wait for voices to load
      await this.loadVoices();
      
      this.isInitialized = true;
      console.log('TTS Service initialized successfully');
      console.log(`Available voices: ${this.availableVoices.length}`);
      
      return true;
    } catch (error) {
      console.error('TTS Service initialization failed:', error);
      throw error;
    }
  }

  /**
   * Load available voices with cross-browser compatibility
   */
  async loadVoices() {
    return new Promise((resolve) => {
      // Get voices immediately if available
      const voices = this.synth.getVoices();
      
      if (voices.length > 0) {
        this.availableVoices = voices;
        this.selectDefaultVoice();
        resolve();
        return;
      }

      // Wait for voiceschanged event (Chrome/Edge behavior)
      const onVoicesChanged = () => {
        const voices = this.synth.getVoices();
        if (voices.length > 0) {
          this.availableVoices = voices;
          this.selectDefaultVoice();
          this.synth.removeEventListener('voiceschanged', onVoicesChanged);
          resolve();
        }
      };

      this.synth.addEventListener('voiceschanged', onVoicesChanged);

      // Fallback timeout for Firefox/Safari
      setTimeout(() => {
        const voices = this.synth.getVoices();
        if (voices.length === 0) {
          console.warn('No voices loaded after timeout, using system default');
        }
        this.availableVoices = voices;
        this.selectDefaultVoice();
        this.synth.removeEventListener('voiceschanged', onVoicesChanged);
        resolve();
      }, 1000);
    });
  }

  /**
   * Select appropriate default voice based on language preference
   */
  selectDefaultVoice() {
    if (this.availableVoices.length === 0) {
      this.defaultSettings.voice = null;
      return;
    }

    // Try to find voice matching default language
    let defaultVoice = this.availableVoices.find(voice => 
      voice.lang.startsWith(this.defaultSettings.language.split('-')[0]) && voice.default
    );

    // Fallback to first voice of the language
    if (!defaultVoice) {
      defaultVoice = this.availableVoices.find(voice => 
        voice.lang.startsWith(this.defaultSettings.language.split('-')[0])
      );
    }

    // Fallback to system default
    if (!defaultVoice) {
      defaultVoice = this.availableVoices.find(voice => voice.default);
    }

    // Last resort: first available voice
    if (!defaultVoice) {
      defaultVoice = this.availableVoices[0];
    }

    this.defaultSettings.voice = defaultVoice;
    console.log('Default voice selected:', defaultVoice?.name || 'None');
  }

  /**
   * Speak text with given settings
   * @param {string} text - Text to speak
   * @param {Object} settings - TTS settings
   * @returns {Promise} - Promise that resolves when speech ends
   */
  async speak(text, settings = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Stop any current speech
    this.stop();

    // Validate text
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new Error('Invalid text provided for speech synthesis');
    }

    // Merge settings with defaults
    const finalSettings = { ...this.defaultSettings, ...settings };

    return new Promise((resolve, reject) => {
      try {
        // Create utterance
        this.currentUtterance = new SpeechSynthesisUtterance(text.trim());
        
        // Apply settings
        this.currentUtterance.rate = this.validateRate(finalSettings.rate);
        this.currentUtterance.pitch = this.validatePitch(finalSettings.pitch);
        this.currentUtterance.volume = this.validateVolume(finalSettings.volume);
        this.currentUtterance.lang = finalSettings.language || this.defaultSettings.language;
        
        // Set voice if specified
        if (finalSettings.voice) {
          const voice = this.findVoice(finalSettings.voice);
          if (voice) {
            this.currentUtterance.voice = voice;
            this.currentUtterance.lang = voice.lang; // Use voice's language
          }
        }

        // Set up event handlers
        this.currentUtterance.onstart = (event) => {
          console.log('TTS started');
          if (this.onStart) this.onStart(event);
        };

        this.currentUtterance.onend = (event) => {
          console.log('TTS ended');
          this.currentUtterance = null;
          if (this.onEnd) this.onEnd(event);
          resolve();
        };

        this.currentUtterance.onpause = (event) => {
          console.log('TTS paused');
          if (this.onPause) this.onPause(event);
        };

        this.currentUtterance.onresume = (event) => {
          console.log('TTS resumed');
          if (this.onResume) this.onResume(event);
        };

        this.currentUtterance.onerror = (event) => {
          console.error('TTS error:', event.error);
          this.currentUtterance = null;
          if (this.onError) this.onError(event);
          reject(new Error(`Speech synthesis failed: ${event.error}`));
        };

        this.currentUtterance.onboundary = (event) => {
          if (this.onBoundary) this.onBoundary(event);
        };

        // Start speaking
        this.synth.speak(this.currentUtterance);
        
      } catch (error) {
        console.error('Failed to start speech synthesis:', error);
        reject(error);
      }
    });
  }

  /**
   * Stop current speech
   */
  stop() {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
  }

  /**
   * Pause current speech
   */
  pause() {
    if (this.synth && this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
    }
  }

  /**
   * Resume paused speech
   */
  resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  /**
   * Check if currently speaking
   */
  isSpeaking() {
    return this.synth ? this.synth.speaking : false;
  }

  /**
   * Check if currently paused
   */
  isPaused() {
    return this.synth ? this.synth.paused : false;
  }

  /**
   * Get available voices
   */
  getVoices() {
    return this.availableVoices.map(voice => ({
      name: voice.name,
      lang: voice.lang,
      default: voice.default,
      localService: voice.localService,
      voiceURI: voice.voiceURI
    }));
  }

  /**
   * Get voices for specific language
   */
  getVoicesForLanguage(language) {
    const langCode = language.split('-')[0];
    return this.availableVoices.filter(voice => 
      voice.lang.toLowerCase().startsWith(langCode.toLowerCase())
    );
  }

  /**
   * Find voice by name or voiceURI
   */
  findVoice(voiceIdentifier) {
    if (!voiceIdentifier) return null;
    
    return this.availableVoices.find(voice => 
      voice.name === voiceIdentifier || 
      voice.voiceURI === voiceIdentifier
    );
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages() {
    const languages = new Set();
    this.availableVoices.forEach(voice => {
      languages.add(voice.lang);
    });
    return Array.from(languages).sort();
  }

  /**
   * Validate and clamp rate value
   */
  validateRate(rate) {
    const numRate = parseFloat(rate);
    if (isNaN(numRate)) return this.defaultSettings.rate;
    return Math.max(0.1, Math.min(10, numRate));
  }

  /**
   * Validate and clamp pitch value
   */
  validatePitch(pitch) {
    const numPitch = parseFloat(pitch);
    if (isNaN(numPitch)) return this.defaultSettings.pitch;
    return Math.max(0, Math.min(2, numPitch));
  }

  /**
   * Validate and clamp volume value
   */
  validateVolume(volume) {
    const numVolume = parseFloat(volume);
    if (isNaN(numVolume)) return this.defaultSettings.volume;
    return Math.max(0, Math.min(1, numVolume));
  }

  /**
   * Split long text into chunks for better browser compatibility
   */
  splitTextIntoChunks(text, maxLength = 200) {
    if (text.length <= maxLength) {
      return [text];
    }

    const chunks = [];
    const sentences = text.split(/[.!?]+/);
    let currentChunk = '';

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) continue;

      if (currentChunk.length + trimmedSentence.length <= maxLength) {
        currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk + '.');
        }
        
        if (trimmedSentence.length > maxLength) {
          // Split very long sentences by words
          const words = trimmedSentence.split(' ');
          let wordChunk = '';
          
          for (const word of words) {
            if (wordChunk.length + word.length + 1 <= maxLength) {
              wordChunk += (wordChunk ? ' ' : '') + word;
            } else {
              if (wordChunk) {
                chunks.push(wordChunk);
              }
              wordChunk = word;
            }
          }
          
          if (wordChunk) {
            currentChunk = wordChunk;
          }
        } else {
          currentChunk = trimmedSentence;
        }
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk + (currentChunk.endsWith('.') ? '' : '.'));
    }

    return chunks.filter(chunk => chunk.trim().length > 0);
  }

  /**
   * Speak long text in chunks
   */
  async speakLongText(text, settings = {}) {
    const chunks = this.splitTextIntoChunks(text);
    
    for (let i = 0; i < chunks.length; i++) {
      if (this.currentUtterance) {
        // Stop if user has stopped speech
        break;
      }
      
      console.log(`Speaking chunk ${i + 1}/${chunks.length}`);
      await this.speak(chunks[i], settings);
      
      // Small pause between chunks
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.stop();
    this.synth = null;
    this.availableVoices = [];
    this.isInitialized = false;
    
    // Clear callbacks
    this.onStart = null;
    this.onEnd = null;
    this.onPause = null;
    this.onResume = null;
    this.onError = null;
    this.onBoundary = null;
  }
}

// Export for both browser extension and testing environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TTSService;
} else if (typeof window !== 'undefined') {
  window.TTSService = TTSService;
}