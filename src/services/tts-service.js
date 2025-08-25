/**
 * Text-to-Speech Service for Intelligent TTS Extension
 * Handles speech synthesis with cross-browser compatibility
 */

export class TTSService {
    constructor() {
        this.synthesis = null;
        this.currentUtterance = null;
        this.isInitialized = false;
        this.availableVoices = [];
        this.settings = {
            language: 'en-US',
            voice: null,
            rate: 1.0,
            pitch: 1.0,
            volume: 1.0
        };
        this.eventListeners = new Map();
    }

    async initialize() {
        try {
            // Check for Web Speech API support
            if (!('speechSynthesis' in window)) {
                throw new Error('Web Speech API is not supported in this browser');
            }

            this.synthesis = window.speechSynthesis;
            
            // Load available voices
            await this.loadVoices();
            
            // Set up voice change listener
            this.synthesis.addEventListener('voiceschanged', () => {
                this.loadVoices();
            });

            this.isInitialized = true;
            console.log('TTS Service initialized successfully');
        } catch (error) {
            console.error('Failed to initialize TTS Service:', error);
            throw error;
        }
    }

    async loadVoices() {
        return new Promise((resolve) => {
            // Sometimes voices are loaded asynchronously
            const loadVoicesRecursive = () => {
                this.availableVoices = this.synthesis.getVoices();
                
                if (this.availableVoices.length > 0) {
                    this.organizeVoices();
                    resolve();
                } else {
                    // Retry after short delay
                    setTimeout(loadVoicesRecursive, 100);
                }
            };
            
            loadVoicesRecursive();
        });
    }

    organizeVoices() {
        // Organize voices by language for better accessibility
        this.voicesByLanguage = {};
        
        this.availableVoices.forEach(voice => {
            const lang = voice.lang.split('-')[0]; // Get base language code
            
            if (!this.voicesByLanguage[lang]) {
                this.voicesByLanguage[lang] = [];
            }
            
            this.voicesByLanguage[lang].push({
                name: voice.name,
                lang: voice.lang,
                localService: voice.localService,
                default: voice.default,
                voiceURI: voice.voiceURI,
                voice: voice
            });
        });

        // Sort voices by preference (local first, then by name)
        Object.keys(this.voicesByLanguage).forEach(lang => {
            this.voicesByLanguage[lang].sort((a, b) => {
                if (a.localService && !b.localService) return -1;
                if (!a.localService && b.localService) return 1;
                return a.name.localeCompare(b.name);
            });
        });

        this.selectDefaultVoice();
    }

    selectDefaultVoice() {
        if (!this.settings.voice && this.availableVoices.length > 0) {
            // Try to find a voice for the current language setting
            const preferredVoices = this.getVoicesForLanguage(this.settings.language);
            
            if (preferredVoices.length > 0) {
                // Prefer local voices over remote ones
                const localVoices = preferredVoices.filter(v => v.localService);
                this.settings.voice = localVoices.length > 0 ? localVoices[0].voice : preferredVoices[0].voice;
            } else {
                // Fallback to first available voice
                this.settings.voice = this.availableVoices[0];
            }
        }
    }

    getVoicesForLanguage(language) {
        const baseLang = language.split('-')[0];
        return this.voicesByLanguage[baseLang] || [];
    }

    getAllVoices() {
        return this.availableVoices.map(voice => ({
            name: voice.name,
            lang: voice.lang,
            localService: voice.localService,
            default: voice.default,
            voiceURI: voice.voiceURI
        }));
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        
        // If voice is specified by name/URI, find the actual voice object
        if (newSettings.voice && typeof newSettings.voice === 'string') {
            const foundVoice = this.availableVoices.find(v => 
                v.name === newSettings.voice || v.voiceURI === newSettings.voice
            );
            if (foundVoice) {
                this.settings.voice = foundVoice;
            }
        }
    }

    async speak(text, options = {}) {
        if (!this.isInitialized) {
            throw new Error('TTS Service not initialized');
        }

        // Stop any current speech
        this.stop();

        return new Promise((resolve, reject) => {
            try {
                // Create utterance
                this.currentUtterance = new SpeechSynthesisUtterance(text);
                
                // Apply settings
                const effectiveSettings = { ...this.settings, ...options };
                
                this.currentUtterance.voice = effectiveSettings.voice;
                this.currentUtterance.lang = effectiveSettings.language || this.settings.language;
                this.currentUtterance.rate = this.clamp(effectiveSettings.rate || this.settings.rate, 0.1, 10);
                this.currentUtterance.pitch = this.clamp(effectiveSettings.pitch || this.settings.pitch, 0, 2);
                this.currentUtterance.volume = this.clamp(effectiveSettings.volume || this.settings.volume, 0, 1);

                // Set up event handlers
                this.currentUtterance.onstart = (event) => {
                    console.log('Speech started');
                    this.fireEvent('start', { event, text });
                };

                this.currentUtterance.onend = (event) => {
                    console.log('Speech ended');
                    this.currentUtterance = null;
                    this.fireEvent('end', { event, text });
                    resolve();
                };

                this.currentUtterance.onerror = (event) => {
                    console.error('Speech error:', event.error);
                    this.currentUtterance = null;
                    this.fireEvent('error', { event, text, error: event.error });
                    reject(new Error(`Speech synthesis failed: ${event.error}`));
                };

                this.currentUtterance.onpause = (event) => {
                    this.fireEvent('pause', { event, text });
                };

                this.currentUtterance.onresume = (event) => {
                    this.fireEvent('resume', { event, text });
                };

                // Start speaking
                this.synthesis.speak(this.currentUtterance);

            } catch (error) {
                console.error('Failed to create speech utterance:', error);
                reject(error);
            }
        });
    }

    stop() {
        if (this.synthesis && this.synthesis.speaking) {
            this.synthesis.cancel();
        }
        if (this.currentUtterance) {
            this.currentUtterance = null;
        }
        this.fireEvent('stop');
    }

    pause() {
        if (this.synthesis && this.synthesis.speaking && !this.synthesis.paused) {
            this.synthesis.pause();
        }
    }

    resume() {
        if (this.synthesis && this.synthesis.paused) {
            this.synthesis.resume();
        }
    }

    isSpeaking() {
        return this.synthesis ? this.synthesis.speaking : false;
    }

    isPaused() {
        return this.synthesis ? this.synthesis.paused : false;
    }

    // Event system for TTS events
    addEventListener(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    removeEventListener(event, callback) {
        if (this.eventListeners.has(event)) {
            const listeners = this.eventListeners.get(event);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    fireEvent(eventName, data = {}) {
        if (this.eventListeners.has(eventName)) {
            this.eventListeners.get(eventName).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Error in TTS event listener:', error);
                }
            });
        }
    }

    // Utility functions
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    // Text preprocessing for better speech
    preprocessText(text) {
        return text
            // Remove excessive whitespace
            .replace(/\s+/g, ' ')
            .trim()
            // Handle common abbreviations
            .replace(/\bDr\./g, 'Doctor')
            .replace(/\bMr\./g, 'Mister')
            .replace(/\bMrs\./g, 'Missus')
            .replace(/\bMs\./g, 'Miss')
            // Handle URLs
            .replace(/https?:\/\/[^\s]+/g, 'link')
            // Handle email addresses
            .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, 'email address');
    }

    // Get speech synthesis info
    getInfo() {
        return {
            isInitialized: this.isInitialized,
            isSupported: 'speechSynthesis' in window,
            voiceCount: this.availableVoices.length,
            currentVoice: this.settings.voice ? this.settings.voice.name : null,
            isActive: this.isSpeaking(),
            isPaused: this.isPaused()
        };
    }

    // Language detection helper
    detectLanguage(text) {
        // Simple language detection based on character sets
        // This is a basic implementation - could be enhanced with a proper language detection library
        
        if (/[\u0600-\u06FF]/.test(text)) return 'ar'; // Arabic
        if (/[\u0590-\u05FF]/.test(text)) return 'he'; // Hebrew
        if (/[\u4E00-\u9FFF]/.test(text)) return 'zh'; // Chinese
        if (/[\u3040-\u309F]/.test(text)) return 'ja'; // Japanese Hiragana
        if (/[\u30A0-\u30FF]/.test(text)) return 'ja'; // Japanese Katakana
        if (/[\uAC00-\uD7AF]/.test(text)) return 'ko'; // Korean
        if (/[\u0400-\u04FF]/.test(text)) return 'ru'; // Russian/Cyrillic
        
        // Default to English for Latin-based text
        return 'en';
    }
}