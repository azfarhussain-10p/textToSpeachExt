# 💻 Implementation Examples - TTS Extension

Comprehensive code examples and patterns for implementing the Intelligent Text-to-Speech Browser Extension.

## 📋 Table of Contents
- [Text-to-Speech Implementation](#text-to-speech-implementation)
- [AI Integration Implementation](#ai-integration-implementation)
- [UI Implementation Guide](#ui-implementation-guide)
- [Internationalization Implementation](#internationalization-implementation)
- [Performance & Monitoring](#performance--monitoring)
- [Security & Privacy Implementation](#security--privacy-implementation)

## 🎤 Text-to-Speech Implementation

### Core TTS Service Structure
```javascript
/**
 * Text-to-Speech Service for browser extension
 * 
 * Handles speech synthesis across different browsers with fallback support.
 * Supports multiple languages, voice selection, and playback controls.
 */
class TTSService {
  constructor() {
    if (!this.checkBrowserSupport()) {
      throw new Error('Speech synthesis not supported in this browser');
    }
    this.initializeVoices();
    this.setupEventListeners();
  }

  checkBrowserSupport() {
    return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  }

  /**
   * Convert text to speech with specified options
   * 
   * @param {string} text - Text content to speak (max 4000 characters)
   * @param {Object} options - Speech configuration
   * @param {string} options.language - Language code (e.g., 'en-US', 'ur-PK')
   * @param {number} options.rate - Speech rate (0.1 to 10, default: 1)
   * @param {number} options.pitch - Voice pitch (0 to 2, default: 1)
   * @param {string} options.voice - Specific voice name (optional)
   * 
   * @returns {Promise<void>} Resolves when speech completes
   */
  async speak(text, options = {}) {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure utterance
      utterance.lang = options.language || 'en-US';
      utterance.rate = Math.min(Math.max(options.rate || 1, 0.1), 10);
      utterance.pitch = Math.min(Math.max(options.pitch || 1, 0), 2);
      utterance.volume = Math.min(Math.max(options.volume || 1, 0), 1);

      // Set voice if specified
      if (options.voice) {
        const voice = this.getVoiceByName(options.voice);
        if (voice) utterance.voice = voice;
      }

      // Return promise that resolves when speech ends
      return new Promise((resolve, reject) => {
        utterance.onend = () => resolve();
        utterance.onerror = (error) => reject(error);
        speechSynthesis.speak(utterance);
      });

    } catch (error) {
      console.error('[TTS] Speech synthesis error:', error);
      throw new Error(`TTS failed: ${error.message}`);
    }
  }

  pause() {
    speechSynthesis.pause();
  }

  resume() {
    speechSynthesis.resume();
  }

  stop() {
    speechSynthesis.cancel();
  }

  getAvailableVoices() {
    return speechSynthesis.getVoices();
  }

  // Safari compatibility: voices load asynchronously
  initializeVoices() {
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => {
        this.voices = speechSynthesis.getVoices();
      };
    }
  }

  // Memory cleanup
  destroy() {
    this.stop();
    speechSynthesis.onvoiceschanged = null;
  }
}
```

### Browser Compatibility Handling
```javascript
// Cross-browser API compatibility
const browserAPI = (() => {
  if (typeof browser !== 'undefined') {
    return browser; // Firefox
  } else if (typeof chrome !== 'undefined') {
    return chrome;  // Chrome/Edge
  } else {
    throw new Error('Browser extension API not available');
  }
})();

// TTS rate limits vary by browser
const getTTSRateLimits = () => {
  const userAgent = navigator.userAgent;
  
  if (userAgent.includes('Chrome')) {
    return { min: 0.1, max: 10, default: 1 };
  } else if (userAgent.includes('Firefox')) {
    return { min: 0.1, max: 2, default: 1 };    // Firefox has lower max
  } else if (userAgent.includes('Safari')) {
    return { min: 0.1, max: 3, default: 1 };    // Safari middle range
  }
  
  return { min: 0.1, max: 10, default: 1 };     // Default fallback
};
```

## 🤖 AI Integration Implementation

### Multi-Provider AI Service
```javascript
/**
 * AI Explanation Service with fallback support
 * Priority: Groq (free) → Claude → Local fallback
 */
class AIExplanationService {
  constructor() {
    this.providers = {
      groq: {
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        rateLimit: { requests: 100, period: 3600000 }, // 100/hour
        models: ['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768']
      },
      claude: {
        endpoint: 'https://api.anthropic.com/v1/messages',
        rateLimit: { requests: 60, period: 60000 }, // 60/minute
        models: ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229']
      }
    };
    
    this.rateLimiters = {};
    this.initializeRateLimiters();
  }

  async explainText(text, context = {}) {
    // Check user consent
    const hasConsent = await this.checkUserConsent();
    if (!hasConsent) {
      return this.getLocalFallback(text);
    }

    // Try providers in order
    const providers = ['groq', 'claude'];
    
    for (const provider of providers) {
      try {
        if (this.canMakeRequest(provider)) {
          const explanation = await this.requestExplanation(provider, text, context);
          return explanation;
        }
      } catch (error) {
        console.warn(`[AI] ${provider} failed:`, error.message);
        continue; // Try next provider
      }
    }

    // All providers failed - return local fallback
    return this.getLocalFallback(text);
  }

  async requestExplanation(provider, text, context) {
    const config = this.providers[provider];
    const apiKey = await this.getApiKey(provider);
    
    if (!apiKey) {
      throw new Error(`No API key for ${provider}`);
    }

    // Record rate limit usage
    this.recordRequest(provider);

    const requestBody = this.buildRequest(provider, text, context);
    
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`${provider} API error: ${response.status}`);
    }

    const data = await response.json();
    return this.parseResponse(provider, data);
  }

  // Rate limiting implementation
  canMakeRequest(provider) {
    const limiter = this.rateLimiters[provider];
    const now = Date.now();
    
    // Clean old requests
    limiter.requests = limiter.requests.filter(
      time => now - time < this.providers[provider].rateLimit.period
    );
    
    return limiter.requests.length < this.providers[provider].rateLimit.requests;
  }

  recordRequest(provider) {
    this.rateLimiters[provider].requests.push(Date.now());
  }

  // Local fallback when AI is unavailable
  getLocalFallback(text) {
    return {
      explanation: `Selected text: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`,
      examples: ['This is the selected text content'],
      complexity: 'unknown',
      readingTime: Math.ceil(text.split(' ').length / 200), // ~200 WPM
      source: 'local'
    };
  }

  // Privacy: Check user consent
  async checkUserConsent() {
    const { aiConsent } = await browserAPI.storage.sync.get(['aiConsent']);
    return aiConsent === true;
  }

  async getApiKey(provider) {
    // Never hardcode keys - use storage or environment
    const key = provider === 'groq' ? 'groqApiKey' : 'claudeApiKey';
    const { [key]: apiKey } = await browserAPI.storage.sync.get([key]);
    return apiKey || process.env[`${provider.toUpperCase()}_API_KEY`];
  }

  initializeRateLimiters() {
    Object.keys(this.providers).forEach(provider => {
      this.rateLimiters[provider] = { requests: [] };
    });
  }
}
```

## 🎨 UI Implementation Guide

### Contextual Overlay
```javascript
/**
 * TTS Overlay - Appears near selected text
 * Responsive, accessible, and mobile-optimized
 */
class TTSOverlay {
  constructor() {
    this.overlay = null;
    this.isVisible = false;
    this.selectedText = '';
    this.position = { x: 0, y: 0 };
    
    this.setupOverlay();
    this.setupEventListeners();
  }

  setupOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'tts-overlay';
    this.overlay.setAttribute('role', 'dialog');
    this.overlay.setAttribute('aria-label', 'Text-to-Speech Controls');
    this.overlay.innerHTML = this.getOverlayHTML();
    
    // Accessibility
    this.overlay.tabIndex = -1;
    this.setupKeyboardNavigation();
    
    document.body.appendChild(this.overlay);
  }

  getOverlayHTML() {
    return `
      <div class="tts-overlay-content">
        <button class="tts-btn tts-play" aria-label="Play selected text">
          <svg class="tts-icon"><!-- Play icon SVG --></svg>
        </button>
        <button class="tts-btn tts-pause" aria-label="Pause speech">
          <svg class="tts-icon"><!-- Pause icon SVG --></svg>
        </button>
        <button class="tts-btn tts-stop" aria-label="Stop speech">
          <svg class="tts-icon"><!-- Stop icon SVG --></svg>
        </button>
        <button class="tts-btn tts-explain" aria-label="Explain with AI">
          <svg class="tts-icon"><!-- Brain icon SVG --></svg>
        </button>
        <button class="tts-btn tts-settings" aria-label="TTS Settings">
          <svg class="tts-icon"><!-- Settings icon SVG --></svg>
        </button>
        <button class="tts-btn tts-close" aria-label="Close overlay">
          <svg class="tts-icon"><!-- X icon SVG --></svg>
        </button>
      </div>
    `;
  }

  show(selectedText, mouseX, mouseY) {
    this.selectedText = selectedText;
    this.position = this.calculatePosition(mouseX, mouseY);
    
    this.overlay.style.left = `${this.position.x}px`;
    this.overlay.style.top = `${this.position.y}px`;
    this.overlay.style.display = 'block';
    this.overlay.classList.add('tts-overlay-visible');
    
    this.isVisible = true;
    
    // Focus management for accessibility
    this.overlay.focus();
    
    // Auto-hide after inactivity
    this.scheduleAutoHide();
  }

  hide() {
    this.overlay.classList.remove('tts-overlay-visible');
    setTimeout(() => {
      this.overlay.style.display = 'none';
    }, 300); // Match CSS transition
    
    this.isVisible = false;
    this.clearAutoHide();
  }

  calculatePosition(mouseX, mouseY) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const overlayWidth = 300; // Approximate overlay width
    const overlayHeight = 60;  // Approximate overlay height
    
    let x = mouseX;
    let y = mouseY - overlayHeight - 10; // Above selection
    
    // Keep within viewport bounds
    if (x + overlayWidth > viewportWidth) {
      x = viewportWidth - overlayWidth - 10;
    }
    if (x < 10) {
      x = 10;
    }
    if (y < 10) {
      y = mouseY + 20; // Below selection if not enough space above
    }
    
    return { x, y };
  }

  setupKeyboardNavigation() {
    this.overlay.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'Escape':
          this.hide();
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          this.handlePlayPause();
          break;
        case 'Tab':
          // Let browser handle tab navigation within overlay
          break;
      }
    });
  }

  // Mobile touch support
  setupTouchEvents() {
    let touchStartTime = 0;
    
    this.overlay.addEventListener('touchstart', (e) => {
      touchStartTime = Date.now();
    });
    
    this.overlay.addEventListener('touchend', (e) => {
      const touchDuration = Date.now() - touchStartTime;
      
      // Treat quick taps as clicks
      if (touchDuration < 200) {
        const target = document.elementFromPoint(
          e.changedTouches[0].clientX,
          e.changedTouches[0].clientY
        );
        
        if (target && target.classList.contains('tts-btn')) {
          target.click();
        }
      }
    });
  }

  scheduleAutoHide() {
    this.clearAutoHide();
    this.autoHideTimer = setTimeout(() => {
      if (this.isVisible) {
        this.hide();
      }
    }, 10000); // 10 seconds
  }

  clearAutoHide() {
    if (this.autoHideTimer) {
      clearTimeout(this.autoHideTimer);
      this.autoHideTimer = null;
    }
  }

  // Cleanup for memory management
  destroy() {
    this.clearAutoHide();
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
  }
}
```

### CSS for Overlay (Responsive & Accessible)
```css
.tts-overlay {
  position: fixed;
  z-index: 999999;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 8px;
  display: none;
  opacity: 0;
  transform: scale(0.9) translateY(-10px);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.tts-overlay-visible {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.tts-overlay-content {
  display: flex;
  gap: 4px;
  align-items: center;
}

.tts-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.tts-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.tts-btn:focus {
  outline: 2px solid #4A90F4;
  outline-offset: 2px;
}

.tts-btn:active {
  transform: scale(0.95);
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .tts-overlay {
    background: white;
    border: 2px solid black;
  }
  
  .tts-btn:focus {
    outline: 3px solid #0066CC;
  }
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .tts-btn {
    width: 44px;    /* Larger touch targets */
    height: 44px;
  }
  
  .tts-overlay-content {
    gap: 8px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .tts-overlay {
    transition: opacity 0.1s;
  }
}

/* RTL language support */
.tts-overlay[dir="rtl"] .tts-overlay-content {
  flex-direction: row-reverse;
}
```

## 🌍 Internationalization Implementation

### Multi-Language Support Structure
```javascript
/**
 * Internationalization Manager
 * Supports 15+ languages including RTL languages
 */
class I18nManager {
  constructor() {
    this.locale = this.detectLocale();
    this.messages = {};
    this.rtlLanguages = ['ar', 'fa', 'he', 'ur'];
    this.loadMessages();
  }

  detectLocale() {
    // Priority: storage > browser > default
    return new Promise(async (resolve) => {
      try {
        const { userLocale } = await browserAPI.storage.sync.get(['userLocale']);
        if (userLocale) {
          resolve(userLocale);
          return;
        }
      } catch (error) {
        console.warn('Could not get stored locale:', error);
      }

      // Use browser locale
      const browserLocale = browserAPI.i18n.getUILanguage() || navigator.language || 'en';
      const locale = browserLocale.split('-')[0]; // Get base language
      resolve(locale);
    });
  }

  async loadMessages() {
    try {
      const response = await fetch(browserAPI.runtime.getURL(`_locales/${this.locale}/messages.json`));
      this.messages = await response.json();
    } catch (error) {
      console.warn(`Could not load messages for ${this.locale}, falling back to English`);
      // Fallback to English
      const response = await fetch(browserAPI.runtime.getURL('_locales/en/messages.json'));
      this.messages = await response.json();
    }
  }

  getMessage(key, substitutions = []) {
    const message = this.messages[key];
    if (!message) {
      console.warn(`Missing translation for key: ${key}`);
      return key; // Return key as fallback
    }
    
    let text = message.message || message;
    
    // Handle placeholders
    substitutions.forEach((sub, index) => {
      text = text.replace(`$${index + 1}`, sub);
    });
    
    return text;
  }

  isRTL() {
    return this.rtlLanguages.includes(this.locale);
  }

  // Update page direction for RTL languages
  updatePageDirection() {
    document.documentElement.dir = this.isRTL() ? 'rtl' : 'ltr';
    document.documentElement.lang = this.locale;
  }

  // TTS voice mapping for languages
  getTTSLanguageCode() {
    const mapping = {
      'en': 'en-US',
      'ur': 'ur-PK',
      'ar': 'ar-SA', 
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'hi': 'hi-IN',
      'pt': 'pt-BR',
      'it': 'it-IT',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
      'zh': 'zh-CN',
      'ru': 'ru-RU',
      'tr': 'tr-TR',
      'nl': 'nl-NL'
    };
    
    return mapping[this.locale] || 'en-US';
  }
}
```

### Message Files Structure (_locales/)
```json
// _locales/en/messages.json
{
  "extensionName": {
    "message": "Intelligent TTS Extension"
  },
  "extensionDescription": {
    "message": "Transform any web text into speech with AI explanations"
  },
  "playButton": {
    "message": "Play"
  },
  "pauseButton": {
    "message": "Pause"
  },
  "stopButton": {
    "message": "Stop"
  },
  "explainButton": {
    "message": "Explain with AI"
  },
  "settingsButton": {
    "message": "Settings"
  },
  "voiceSettings": {
    "message": "Voice Settings"
  },
  "speechRate": {
    "message": "Speech Rate"
  },
  "speechPitch": {
    "message": "Speech Pitch"
  },
  "language": {
    "message": "Language"
  },
  "selectText": {
    "message": "Select text to hear it spoken"
  },
  "aiExplanation": {
    "message": "AI Explanation"
  },
  "privacyNotice": {
    "message": "AI explanations are sent to external services. Only use with non-sensitive text."
  }
}
```

```json
// _locales/ur/messages.json (Urdu)
{
  "extensionName": {
    "message": "ذہین ٹی ٹی ایس ایکسٹینشن"
  },
  "extensionDescription": {
    "message": "کسی بھی ویب ٹیکسٹ کو AI وضاحات کے ساتھ آواز میں تبدیل کریں"
  },
  "playButton": {
    "message": "چلائیں"
  },
  "pauseButton": {
    "message": "روکیں"
  },
  "stopButton": {
    "message": "بند کریں"
  },
  "explainButton": {
    "message": "AI سے وضاحت"
  },
  "settingsButton": {
    "message": "ترتیبات"
  },
  "selectText": {
    "message": "سننے کے لیے متن منتخب کریں"
  }
}
```

## 📊 Performance & Monitoring

### Performance Monitoring Implementation
```javascript
/**
 * Performance Monitor - Tracks key metrics
 * Helps maintain <300ms overlay response time
 */
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = {};
    this.setupObservers();
  }

  startTimer(label) {
    this.metrics.set(label, performance.now());
  }

  endTimer(label) {
    const start = this.metrics.get(label);
    if (start) {
      const duration = performance.now() - start;
      this.reportMetric(label, duration);
      this.metrics.delete(label);
      return duration;
    }
    return 0;
  }

  reportMetric(label, value) {
    // Log performance metrics (with user consent)
    console.log(`[Performance] ${label}: ${value.toFixed(2)}ms`);
    
    // Store for analysis
    this.storeMetric(label, value);
    
    // Alert for slow operations
    if (value > this.getThreshold(label)) {
      console.warn(`[Performance] Slow operation detected: ${label} took ${value.toFixed(2)}ms`);
    }
  }

  getThreshold(label) {
    const thresholds = {
      'overlay-show': 300,      // Overlay should appear within 300ms
      'tts-start': 500,         // TTS should start within 500ms
      'ai-request': 3000,       // AI explanation within 3 seconds
      'voice-load': 1000        // Voice loading within 1 second
    };
    
    return thresholds[label] || 1000; // Default 1 second threshold
  }

  // Memory usage monitoring
  monitorMemoryUsage() {
    if (performance.memory) {
      const memory = performance.memory;
      const memoryInfo = {
        used: Math.round(memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
      };
      
      console.log('[Performance] Memory usage:', memoryInfo);
      
      // Warn if memory usage is high (>50MB as per success metrics)
      if (memoryInfo.used > 50) {
        console.warn(`[Performance] High memory usage: ${memoryInfo.used}MB`);
      }
      
      return memoryInfo;
    }
    
    return null;
  }

  // Store metrics for analysis
  async storeMetric(label, value) {
    try {
      const { performanceMetrics = {} } = await browserAPI.storage.local.get(['performanceMetrics']);
      
      if (!performanceMetrics[label]) {
        performanceMetrics[label] = [];
      }
      
      performanceMetrics[label].push({
        value,
        timestamp: Date.now()
      });
      
      // Keep only last 100 entries per metric
      if (performanceMetrics[label].length > 100) {
        performanceMetrics[label] = performanceMetrics[label].slice(-100);
      }
      
      await browserAPI.storage.local.set({ performanceMetrics });
    } catch (error) {
      console.warn('Could not store performance metric:', error);
    }
  }

  // Generate performance report
  async generateReport() {
    const { performanceMetrics = {} } = await browserAPI.storage.local.get(['performanceMetrics']);
    
    const report = {};
    
    for (const [label, values] of Object.entries(performanceMetrics)) {
      if (values.length > 0) {
        const durations = values.map(v => v.value);
        report[label] = {
          count: durations.length,
          average: durations.reduce((a, b) => a + b, 0) / durations.length,
          min: Math.min(...durations),
          max: Math.max(...durations),
          threshold: this.getThreshold(label),
          passing: durations.filter(d => d <= this.getThreshold(label)).length / durations.length * 100
        };
      }
    }
    
    return report;
  }
}
```

## 🔒 Security & Privacy Implementation

### Error Handling & Security
```javascript
/**
 * Global Error Handler - Security-focused error management
 */
class ExtensionErrorHandler {
  constructor() {
    this.setupGlobalErrorHandlers();
    this.sensitiveDataPatterns = [
      /sk-[a-zA-Z0-9]{48}/, // OpenAI API keys
      /gsk_[a-zA-Z0-9]{56}/, // Groq API keys  
      /anthropic_[a-zA-Z0-9]{40}/, // Claude API keys
      /password/i,
      /token/i,
      /secret/i
    ];
  }

  setupGlobalErrorHandlers() {
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError('Unhandled Promise Rejection', event.reason);
      event.preventDefault(); // Prevent console spam
    });

    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError('JavaScript Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });

    // Extension context errors
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'error') {
          this.logError('Extension Error', message.error);
        }
      });
    }
  }

  logError(type, details) {
    // Sanitize error details to remove sensitive data
    const sanitizedDetails = this.sanitizeError(details);
    
    // Log to console with extension prefix
    console.error(`[TTS Extension] ${type}:`, sanitizedDetails);
    
    // Store for debugging (with user consent)
    this.storeErrorForDebugging(type, sanitizedDetails);
  }

  sanitizeError(details) {
    let sanitized = JSON.parse(JSON.stringify(details));
    
    // Convert to string for pattern matching
    let detailsString = JSON.stringify(sanitized);
    
    // Remove sensitive patterns
    this.sensitiveDataPatterns.forEach(pattern => {
      detailsString = detailsString.replace(pattern, '[REDACTED]');
    });
    
    try {
      return JSON.parse(detailsString);
    } catch {
      return { message: '[Error details sanitized]' };
    }
  }
}
```

### Privacy-First Features
```javascript
/**
 * Privacy Manager - Handles user consent and data protection
 */
class PrivacyManager {
  constructor() {
    this.consentTypes = {
      ai: 'aiConsent',           // AI explanation services
      analytics: 'analyticsConsent', // Usage analytics
      debug: 'debugConsent'       // Debug logging
    };
  }

  async requestConsent(type, message) {
    return new Promise((resolve) => {
      // Show consent dialog
      const dialog = this.createConsentDialog(type, message);
      document.body.appendChild(dialog);
      
      dialog.addEventListener('click', async (e) => {
        if (e.target.classList.contains('consent-accept')) {
          await this.storeConsent(type, true);
          resolve(true);
        } else if (e.target.classList.contains('consent-deny')) {
          await this.storeConsent(type, false);
          resolve(false);
        }
        
        dialog.remove();
      });
    });
  }

  async checkConsent(type) {
    const consentKey = this.consentTypes[type];
    const { [consentKey]: consent } = await browserAPI.storage.sync.get([consentKey]);
    return consent === true;
  }

  async storeConsent(type, granted) {
    const consentKey = this.consentTypes[type];
    await browserAPI.storage.sync.set({
      [consentKey]: granted,
      [`${consentKey}Timestamp`]: Date.now()
    });
  }

  createConsentDialog(type, message) {
    const dialog = document.createElement('div');
    dialog.className = 'tts-consent-dialog';
    dialog.innerHTML = `
      <div class="tts-consent-content">
        <h3>Privacy Notice</h3>
        <p>${message}</p>
        <div class="tts-consent-buttons">
          <button class="consent-accept">Accept</button>
          <button class="consent-deny">Decline</button>
        </div>
      </div>
    `;
    
    return dialog;
  }

  // Clear all stored data
  async clearAllData() {
    const keys = [
      'aiConsent', 'aiConsentTimestamp',
      'analyticsConsent', 'analyticsConsentTimestamp', 
      'debugConsent', 'debugConsentTimestamp',
      'performanceMetrics',
      'errors',
      'userSettings'
    ];
    
    await browserAPI.storage.local.clear();
    await browserAPI.storage.sync.remove(keys);
  }
}
```

---

These implementation examples provide comprehensive code patterns for building the TTS extension. Each example follows the security, performance, and accessibility requirements outlined in the project specifications.