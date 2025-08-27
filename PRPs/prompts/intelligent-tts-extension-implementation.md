# Production Ready Prompt: Intelligent Text-to-Speech Browser Extension - Complete Implementation

## Metadata
```yaml
template_version: "1.0.0"
ai_optimization: "claude-4-compatible"  
methodology: "test-driven-development"
architecture: "browser-extension-mvc"
extension_type: "text-to-speech"
manifest_version: "v3"
compliance: ["manifest-v3", "csp", "privacy-focused", "accessibility", "cross-browser"]
last_updated: "2024-08-26"
maintainer: "development-team"
```

## 📋 TTS Extension Feature Definition

### Goal Statement
**SMART Goal**: Implement a complete, production-ready cross-browser TTS extension that converts any web text to speech with AI-powered explanations, achieving 95% website compatibility, supporting 15+ languages, and maintaining <50MB memory usage while being fully accessible (WCAG 2.1 AA compliant) - deliverable within 4 weeks.

**Business Context**: This extension addresses the growing demand for accessible web content consumption, benefiting users with reading difficulties, language learners, multitaskers, and anyone preferring audio content consumption.

**Technical Scope**: Browser extension for Chrome (88+), Firefox (78+), Safari (14+), Edge (88+) with Manifest V3 compliance, Web Speech API integration, AI service integration (Groq + Claude), and privacy-first design.

### Why (TTS Feature Justification)
- **Accessibility Value**: Transforms web browsing for users with dyslexia, visual impairments, and learning disabilities
- **User Experience**: Enables multitasking, audio learning, and content consumption while commuting or exercising
- **Market Opportunity**: Addresses 15% of population with reading difficulties and growing audio content preference
- **Technology Advantage**: Combines modern Web Speech API with AI explanations for enhanced understanding
- **Privacy Leadership**: Local processing where possible, explicit consent for AI services, no tracking

### What (TTS Functional Requirements)
**Primary TTS Features**:
1. **Text Selection & Processing**: Select any text on any website, intelligent text chunking for long content
2. **Speech Synthesis**: Natural voice generation using Web Speech API with cross-browser compatibility
3. **Voice Customization**: Language selection (15+ languages), voice selection, rate/pitch/volume controls
4. **AI Explanations**: Intelligent content explanations via Groq API (free) with Claude API fallback
5. **Smart UI Overlay**: Contextual controls appearing near selected text with accessibility features
6. **Cross-Browser Support**: Chrome, Firefox, Safari, Edge with consistent functionality

**Secondary Features**:
- **Keyboard Navigation**: Full keyboard accessibility for all controls
- **Settings Management**: User preferences, API key management, privacy controls
- **Offline Functionality**: Basic TTS without internet, cached voice preferences
- **Performance Monitoring**: Memory usage tracking, error reporting, usage analytics (opt-in)

## 🏗️ Implementation Requirements

### External Documentation (Context7 Integration Points)
**CRITICAL**: Use Context7 to fetch real-time documentation for all external APIs and specifications:

#### Browser Extension APIs
- **Chrome Manifest V3**: Use Context7 to get `/websites/developer_chrome_com-docs-extensions-reference-manifest` for current requirements
- **Content Scripts**: Use Context7 for chrome.scripting API best practices and CSP compliance
- **Service Workers**: Use Context7 for background script patterns and lifecycle management
- **Storage APIs**: Use Context7 for chrome.storage usage patterns and limitations
- **Cross-Browser APIs**: Use Context7 for WebExtension API differences and polyfills

#### Web Speech API Integration  
- **Speech Synthesis**: Use Context7 to fetch `/webaudio/web-speech-api` for browser compatibility matrix
- **Voice Enumeration**: Use Context7 for platform-specific voice availability patterns
- **Audio Control**: Use Context7 for audio playback, pause, resume patterns across browsers
- **Error Handling**: Use Context7 for speech synthesis error scenarios and recovery

#### AI Service Integration
- **Groq API**: Use Context7 to fetch `/groq/groq-api-cookbook` for authentication, rate limits, and JavaScript integration patterns
- **Claude API**: Use Context7 to get latest Anthropic API documentation for message formatting and streaming
- **Fallback Strategy**: Use Context7 to compare both APIs for optimal failover implementation
- **Rate Limiting**: Use Context7 for API rate limiting best practices and queue management

#### Security & Privacy
- **CSP Requirements**: Use Context7 for current Content Security Policy guidelines for extensions
- **Permission Model**: Use Context7 for extension permission best practices and user consent patterns  
- **API Key Security**: Use Context7 for secure key storage and rotation patterns
- **Privacy Compliance**: Use Context7 for GDPR and privacy-first extension development

## 🎯 Implementation Plan

### Phase 1: Foundation & Core Structure
1. **Project Structure Setup**
   ```
   src/
   ├── background/
   │   ├── service-worker.js          # Main background service worker
   │   ├── api-coordinator.js         # AI API management and fallbacks
   │   └── storage-manager.js         # Extension storage handling
   ├── content/
   │   ├── content-script.js          # Main content script entry point
   │   ├── text-selector.js           # Text selection detection and handling
   │   ├── overlay-manager.js         # TTS overlay UI management
   │   └── dom-utils.js               # DOM manipulation utilities
   ├── popup/
   │   ├── popup.html                 # Extension popup interface
   │   ├── popup.js                   # Popup functionality
   │   └── popup.css                  # Popup styling
   ├── options/
   │   ├── options.html               # Extension settings page
   │   ├── options.js                 # Settings functionality
   │   └── options.css                # Settings page styling
   ├── services/
   │   ├── tts-service.js             # Text-to-speech core functionality
   │   ├── ai-service.js              # AI explanation service
   │   ├── language-service.js        # Multi-language support
   │   └── error-service.js           # Error handling and reporting
   ├── utils/
   │   ├── browser-polyfill.js        # Cross-browser compatibility layer
   │   ├── constants.js               # Application constants
   │   └── helpers.js                 # Utility functions
   ├── assets/
   │   ├── icons/                     # Extension icons (16, 48, 128px)
   │   ├── sounds/                    # Audio feedback files
   │   └── styles/                    # Global CSS styles
   └── _locales/
       ├── en/messages.json           # English localization
       ├── es/messages.json           # Spanish localization
       ├── ar/messages.json           # Arabic localization
       └── [additional languages]
   ```

2. **Manifest V3 Configuration Files**
   ```javascript
   // manifest.json (Chrome/Edge)
   {
     "manifest_version": 3,
     "name": "Intelligent TTS Extension",
     "version": "1.0.0",
     "description": "Convert any web text to speech with AI-powered explanations",
     "permissions": [
       "storage",
       "activeTab", 
       "scripting"
     ],
     "host_permissions": [
       "<all_urls>"
     ],
     "background": {
       "service_worker": "background/service-worker.js",
       "type": "module"
     },
     "content_scripts": [{
       "matches": ["<all_urls>"],
       "js": ["content/content-script.js"],
       "css": ["assets/styles/content.css"],
       "run_at": "document_end"
     }],
     "action": {
       "default_popup": "popup/popup.html",
       "default_icon": {
         "16": "assets/icons/icon16.png",
         "48": "assets/icons/icon48.png", 
         "128": "assets/icons/icon128.png"
       }
     },
     "options_ui": {
       "page": "options/options.html",
       "open_in_tab": true
     },
     "content_security_policy": {
       "extension_pages": "script-src 'self'; object-src 'self'"
     }
   }
   ```

3. **Build System Configuration**
   ```javascript
   // webpack.common.js
   const path = require('path');
   const CopyWebpackPlugin = require('copy-webpack-plugin');

   module.exports = {
     entry: {
       'background/service-worker': './src/background/service-worker.js',
       'content/content-script': './src/content/content-script.js',
       'popup/popup': './src/popup/popup.js',
       'options/options': './src/options/options.js'
     },
     output: {
       path: path.resolve(__dirname, 'dist'),
       filename: '[name].js'
     },
     plugins: [
       new CopyWebpackPlugin({
         patterns: [
           { from: 'src/manifest.json', to: 'manifest.json' },
           { from: 'src/assets', to: 'assets' },
           { from: 'src/_locales', to: '_locales' },
           { from: 'src/popup/popup.html', to: 'popup/popup.html' },
           { from: 'src/options/options.html', to: 'options/options.html' }
         ]
       })
     ]
   };
   ```

### Phase 2: Core TTS Service Implementation

```javascript
// src/services/tts-service.js
class TTSService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.currentUtterance = null;
    this.isInitialized = false;
    
    this.loadVoices();
    this.setupEventListeners();
  }

  async loadVoices() {
    // Use Context7: Web Speech API voice enumeration patterns
    return new Promise((resolve) => {
      const loadVoicesWhenReady = () => {
        this.voices = this.synth.getVoices();
        if (this.voices.length > 0) {
          this.isInitialized = true;
          resolve(this.voices);
        } else {
          setTimeout(loadVoicesWhenReady, 100);
        }
      };
      
      if (this.synth.getVoices().length > 0) {
        loadVoicesWhenReady();
      } else {
        this.synth.onvoiceschanged = loadVoicesWhenReady;
      }
    });
  }

  async speak(text, options = {}) {
    if (!this.isInitialized) {
      await this.loadVoices();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure utterance with options
    utterance.voice = this.getVoiceByLang(options.lang) || this.voices[0];
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;

    // Setup event handlers
    utterance.onstart = options.onStart || null;
    utterance.onend = options.onEnd || null;
    utterance.onerror = options.onError || this.handleSpeechError.bind(this);

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
    
    return utterance;
  }

  pause() {
    if (this.synth.speaking) {
      this.synth.pause();
    }
  }

  resume() {
    if (this.synth.paused) {
      this.synth.resume();
    }
  }

  stop() {
    this.synth.cancel();
    this.currentUtterance = null;
  }

  getVoiceByLang(lang) {
    return this.voices.find(voice => 
      voice.lang.startsWith(lang) || voice.lang.includes(lang)
    );
  }

  handleSpeechError(event) {
    console.error('Speech synthesis error:', event);
    // Report to error service
  }
}
```

### Phase 3: AI Service Integration

```javascript
// src/services/ai-service.js
class AIService {
  constructor() {
    this.groqClient = null;
    this.claudeClient = null;
    this.rateLimiter = new Map(); // Rate limiting per API
    this.init();
  }

  async init() {
    // Use Context7: Groq API authentication patterns
    const { groqApiKey, claudeApiKey } = await chrome.storage.sync.get([
      'groqApiKey', 
      'claudeApiKey'
    ]);

    if (groqApiKey) {
      this.groqClient = this.initGroqClient(groqApiKey);
    }

    if (claudeApiKey) {
      this.claudeClient = this.initClaudeClient(claudeApiKey);
    }
  }

  initGroqClient(apiKey) {
    // Use Context7: Groq JavaScript SDK integration
    return {
      async chatCompletion(messages, model = 'mixtral-8x7b-32768') {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages,
            model,
            max_tokens: 500,
            temperature: 0.7
          })
        });

        if (!response.ok) {
          throw new Error(`Groq API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content;
      }
    };
  }

  async explainText(text, context = {}) {
    // Rate limiting check
    if (!this.checkRateLimit('groq', 100)) { // 100 requests per hour for Groq
      throw new Error('Rate limit exceeded for Groq API');
    }

    const prompt = this.buildExplanationPrompt(text, context);
    
    try {
      // Try Groq first (free tier)
      if (this.groqClient) {
        const explanation = await this.groqClient.chatCompletion([
          {
            role: 'system', 
            content: 'You are a helpful assistant that explains complex text in simple terms.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]);
        
        this.updateRateLimit('groq');
        return { explanation, provider: 'groq' };
      }
      
      // Fallback to Claude if Groq unavailable
      if (this.claudeClient) {
        const explanation = await this.claudeClient.explain(prompt);
        this.updateRateLimit('claude');
        return { explanation, provider: 'claude' };
      }

      throw new Error('No AI service available');
      
    } catch (error) {
      console.error('AI explanation error:', error);
      return { 
        explanation: 'Unable to generate explanation at this time. Please try again later.',
        error: error.message 
      };
    }
  }

  buildExplanationPrompt(text, context) {
    return `Please explain this text in simple, clear language:

TEXT: "${text}"

CONTEXT: ${context.pageTitle ? `From page: ${context.pageTitle}` : 'General web content'}

Please provide:
1. A simple explanation (2-3 sentences)
2. Key concepts or terms defined
3. Real-world examples if applicable

Keep the explanation accessible for general audiences.`;
  }

  checkRateLimit(provider, limit) {
    const now = Date.now();
    const windowStart = now - (60 * 60 * 1000); // 1 hour window
    
    if (!this.rateLimiter.has(provider)) {
      this.rateLimiter.set(provider, []);
    }

    const requests = this.rateLimiter.get(provider);
    const recentRequests = requests.filter(timestamp => timestamp > windowStart);
    
    return recentRequests.length < limit;
  }

  updateRateLimit(provider) {
    if (!this.rateLimiter.has(provider)) {
      this.rateLimiter.set(provider, []);
    }
    
    this.rateLimiter.get(provider).push(Date.now());
  }
}
```

### Phase 4: Text Selection & Overlay UI

```javascript
// src/content/text-selector.js
class TextSelector {
  constructor(onTextSelected) {
    this.onTextSelected = onTextSelected;
    this.selectedText = '';
    this.selectionRange = null;
    this.lastSelection = null;
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.addEventListener('mouseup', this.handleTextSelection.bind(this));
    document.addEventListener('touchend', this.handleTextSelection.bind(this));
    document.addEventListener('keyup', this.handleKeyboardSelection.bind(this));
  }

  handleTextSelection(event) {
    const selection = window.getSelection();
    
    if (selection.rangeCount === 0) {
      return;
    }

    const selectedText = selection.toString().trim();
    
    // Minimum text length threshold
    if (selectedText.length < 10) {
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // Skip if selection is not visible
    if (rect.width === 0 && rect.height === 0) {
      return;
    }

    this.selectedText = selectedText;
    this.selectionRange = range;
    
    const context = this.getSelectionContext();
    
    this.onTextSelected({
      text: selectedText,
      rect: rect,
      range: range,
      context: context
    });
  }

  handleKeyboardSelection(event) {
    // Handle Ctrl+A or other keyboard-based selections
    if (event.ctrlKey || event.metaKey) {
      setTimeout(() => this.handleTextSelection(event), 100);
    }
  }

  getSelectionContext() {
    return {
      pageTitle: document.title,
      pageUrl: window.location.href,
      selectedElement: this.selectionRange?.commonAncestorContainer?.parentElement?.tagName,
      timestamp: new Date().toISOString()
    };
  }

  clearSelection() {
    window.getSelection().removeAllRanges();
    this.selectedText = '';
    this.selectionRange = null;
  }
}

// src/content/overlay-manager.js
class OverlayManager {
  constructor() {
    this.overlay = null;
    this.isVisible = false;
    this.ttsService = new TTSService();
    this.aiService = new AIService();
    
    this.createOverlay();
  }

  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.id = 'tts-overlay';
    this.overlay.className = 'tts-overlay';
    this.overlay.innerHTML = this.getOverlayHTML();
    
    // Use Shadow DOM for style isolation
    const shadow = this.overlay.attachShadow({ mode: 'closed' });
    shadow.innerHTML = `
      <style>${this.getOverlayCSS()}</style>
      ${this.getOverlayHTML()}
    `;
    
    this.setupOverlayEvents(shadow);
    document.body.appendChild(this.overlay);
  }

  getOverlayHTML() {
    return `
      <div class="tts-controls" role="toolbar" aria-label="Text-to-Speech Controls">
        <button id="play-btn" class="tts-btn" aria-label="Play text">
          <svg viewBox="0 0 24 24" class="tts-icon">
            <polygon points="5,3 19,12 5,21"></polygon>
          </svg>
        </button>
        
        <button id="pause-btn" class="tts-btn" aria-label="Pause" disabled>
          <svg viewBox="0 0 24 24" class="tts-icon">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
        </button>
        
        <button id="stop-btn" class="tts-btn" aria-label="Stop" disabled>
          <svg viewBox="0 0 24 24" class="tts-icon">
            <rect x="6" y="6" width="12" height="12"></rect>
          </svg>
        </button>
        
        <select id="voice-select" class="tts-select" aria-label="Select voice">
          <option value="">Select Voice...</option>
        </select>
        
        <input type="range" id="rate-slider" class="tts-slider" 
               min="0.5" max="2" step="0.1" value="1" 
               aria-label="Speech rate">
        
        <button id="explain-btn" class="tts-btn tts-explain" aria-label="Get AI explanation">
          <svg viewBox="0 0 24 24" class="tts-icon">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9,9h6v6H9z"></path>
          </svg>
          Explain
        </button>
        
        <button id="close-btn" class="tts-btn tts-close" aria-label="Close">
          <svg viewBox="0 0 24 24" class="tts-icon">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;
  }

  getOverlayCSS() {
    return `
      .tts-overlay {
        position: fixed;
        z-index: 2147483647;
        background: white;
        border: 2px solid #007cba;
        border-radius: 8px;
        padding: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        max-width: 400px;
        opacity: 0;
        transform: translateY(-10px);
        transition: opacity 0.2s, transform 0.2s;
      }
      
      .tts-overlay.visible {
        opacity: 1;
        transform: translateY(0);
      }
      
      .tts-controls {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      
      .tts-btn {
        background: #007cba;
        color: white;
        border: none;
        border-radius: 4px;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      
      .tts-btn:hover:not(:disabled) {
        background: #005a87;
      }
      
      .tts-btn:disabled {
        background: #ccc;
        cursor: not-allowed;
      }
      
      .tts-btn:focus {
        outline: 2px solid #007cba;
        outline-offset: 2px;
      }
      
      .tts-icon {
        width: 18px;
        height: 18px;
        fill: currentColor;
        stroke: currentColor;
        stroke-width: 1;
      }
      
      .tts-explain {
        width: auto;
        padding: 0 12px;
        font-size: 12px;
        gap: 4px;
      }
      
      .tts-select, .tts-slider {
        flex: 1;
        min-width: 100px;
      }
      
      .tts-select {
        padding: 6px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 12px;
      }
      
      .tts-slider {
        height: 6px;
        background: #ddd;
        border-radius: 3px;
      }
      
      .tts-close {
        background: #dc3545;
        margin-left: auto;
      }
      
      .tts-close:hover {
        background: #c82333;
      }
      
      /* High contrast mode support */
      @media (prefers-contrast: high) {
        .tts-overlay {
          border-width: 3px;
        }
      }
      
      /* Reduced motion support */
      @media (prefers-reduced-motion: reduce) {
        .tts-overlay {
          transition: none;
        }
      }
    `;
  }

  showOverlay(selectionData) {
    this.currentSelection = selectionData;
    this.positionOverlay(selectionData.rect);
    this.populateVoiceSelect();
    
    this.overlay.classList.add('visible');
    this.isVisible = true;
    
    // Focus management for accessibility
    setTimeout(() => {
      const playBtn = this.overlay.shadowRoot.getElementById('play-btn');
      playBtn?.focus();
    }, 100);
  }

  hideOverlay() {
    this.overlay.classList.remove('visible');
    this.isVisible = false;
    this.ttsService.stop();
  }

  positionOverlay(rect) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const overlayWidth = 400; // Max width from CSS
    const overlayHeight = 60; // Estimated height
    
    let left = rect.left + (rect.width / 2) - (overlayWidth / 2);
    let top = rect.bottom + 10;
    
    // Keep overlay in viewport
    if (left < 10) left = 10;
    if (left + overlayWidth > viewportWidth - 10) {
      left = viewportWidth - overlayWidth - 10;
    }
    
    // Position above selection if not enough space below
    if (top + overlayHeight > viewportHeight - 10) {
      top = rect.top - overlayHeight - 10;
    }
    
    this.overlay.style.left = `${left}px`;
    this.overlay.style.top = `${top}px`;
  }

  setupOverlayEvents(shadow) {
    const playBtn = shadow.getElementById('play-btn');
    const pauseBtn = shadow.getElementById('pause-btn');
    const stopBtn = shadow.getElementById('stop-btn');
    const voiceSelect = shadow.getElementById('voice-select');
    const rateSlider = shadow.getElementById('rate-slider');
    const explainBtn = shadow.getElementById('explain-btn');
    const closeBtn = shadow.getElementById('close-btn');

    playBtn.addEventListener('click', () => this.handlePlay());
    pauseBtn.addEventListener('click', () => this.handlePause());
    stopBtn.addEventListener('click', () => this.handleStop());
    voiceSelect.addEventListener('change', () => this.handleVoiceChange());
    rateSlider.addEventListener('input', () => this.handleRateChange());
    explainBtn.addEventListener('click', () => this.handleExplain());
    closeBtn.addEventListener('click', () => this.hideOverlay());

    // Keyboard navigation
    shadow.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        this.hideOverlay();
      }
    });
  }

  async handlePlay() {
    if (!this.currentSelection) return;

    const shadow = this.overlay.shadowRoot;
    const voiceSelect = shadow.getElementById('voice-select');
    const rateSlider = shadow.getElementById('rate-slider');
    
    const options = {
      lang: voiceSelect.value || 'en-US',
      rate: parseFloat(rateSlider.value),
      onStart: () => this.updateButtonStates(true),
      onEnd: () => this.updateButtonStates(false),
      onError: (error) => {
        console.error('TTS Error:', error);
        this.updateButtonStates(false);
      }
    };

    await this.ttsService.speak(this.currentSelection.text, options);
  }

  handlePause() {
    this.ttsService.pause();
    this.updateButtonStates(false);
  }

  handleStop() {
    this.ttsService.stop();
    this.updateButtonStates(false);
  }

  async handleExplain() {
    if (!this.currentSelection) return;

    const explainBtn = this.overlay.shadowRoot.getElementById('explain-btn');
    explainBtn.textContent = 'Loading...';
    explainBtn.disabled = true;

    try {
      const result = await this.aiService.explainText(
        this.currentSelection.text,
        this.currentSelection.context
      );

      // Show explanation in a modal or expand the overlay
      this.showExplanation(result);
      
    } catch (error) {
      console.error('Explanation error:', error);
      this.showExplanation({ 
        explanation: 'Unable to generate explanation. Please check your API configuration.',
        error: error.message 
      });
    } finally {
      explainBtn.textContent = 'Explain';
      explainBtn.disabled = false;
    }
  }

  updateButtonStates(isPlaying) {
    const shadow = this.overlay.shadowRoot;
    const playBtn = shadow.getElementById('play-btn');
    const pauseBtn = shadow.getElementById('pause-btn');
    const stopBtn = shadow.getElementById('stop-btn');

    playBtn.disabled = isPlaying;
    pauseBtn.disabled = !isPlaying;
    stopBtn.disabled = !isPlaying;
  }

  async populateVoiceSelect() {
    const voices = await this.ttsService.loadVoices();
    const voiceSelect = this.overlay.shadowRoot.getElementById('voice-select');
    
    voiceSelect.innerHTML = '<option value="">Select Voice...</option>';
    
    voices.forEach(voice => {
      const option = document.createElement('option');
      option.value = voice.lang;
      option.textContent = `${voice.name} (${voice.lang})`;
      voiceSelect.appendChild(option);
    });
  }

  showExplanation(result) {
    // Create explanation modal
    const modal = document.createElement('div');
    modal.className = 'tts-explanation-modal';
    modal.innerHTML = `
      <div class="tts-explanation-content">
        <h3>AI Explanation</h3>
        <div class="tts-explanation-text">${result.explanation}</div>
        <div class="tts-explanation-actions">
          <button id="read-explanation" class="tts-btn">Read Aloud</button>
          <button id="close-explanation" class="tts-btn">Close</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Setup modal events
    modal.querySelector('#read-explanation').addEventListener('click', () => {
      this.ttsService.speak(result.explanation);
    });
    
    modal.querySelector('#close-explanation').addEventListener('click', () => {
      modal.remove();
    });

    // Close on click outside
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.remove();
      }
    });
  }
}
```

### Phase 5: Background Service Worker & Storage

```javascript
// src/background/service-worker.js
import { APICoordinator } from './api-coordinator.js';
import { StorageManager } from './storage-manager.js';

class BackgroundService {
  constructor() {
    this.apiCoordinator = new APICoordinator();
    this.storageManager = new StorageManager();
    
    this.setupEventListeners();
    this.init();
  }

  setupEventListeners() {
    // Use Context7: Chrome Extension service worker patterns
    
    // Handle extension installation
    chrome.runtime.onInstalled.addListener((details) => {
      this.handleInstall(details);
    });

    // Handle messages from content scripts
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Async response
    });

    // Handle storage changes
    chrome.storage.onChanged.addListener((changes, namespace) => {
      this.handleStorageChange(changes, namespace);
    });
  }

  async init() {
    // Initialize default settings
    await this.storageManager.initializeDefaults();
    
    // Setup API clients
    await this.apiCoordinator.init();
    
    console.log('TTS Extension background service initialized');
  }

  handleInstall(details) {
    if (details.reason === 'install') {
      // First installation
      chrome.tabs.create({
        url: chrome.runtime.getURL('options/options.html')
      });
    } else if (details.reason === 'update') {
      // Extension update
      this.handleUpdate(details);
    }
  }

  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.type) {
        case 'GET_SETTINGS':
          const settings = await this.storageManager.getSettings();
          sendResponse({ success: true, data: settings });
          break;

        case 'UPDATE_SETTINGS':
          await this.storageManager.updateSettings(message.settings);
          sendResponse({ success: true });
          break;

        case 'GET_AI_EXPLANATION':
          const explanation = await this.apiCoordinator.getExplanation(
            message.text, 
            message.context
          );
          sendResponse({ success: true, data: explanation });
          break;

        case 'TEST_API_CONNECTION':
          const testResult = await this.apiCoordinator.testConnection(message.provider);
          sendResponse({ success: true, data: testResult });
          break;

        case 'GET_USAGE_STATS':
          const stats = await this.storageManager.getUsageStats();
          sendResponse({ success: true, data: stats });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('Background message handler error:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  handleStorageChange(changes, namespace) {
    // React to settings changes
    if (changes.apiKeys) {
      this.apiCoordinator.updateApiKeys(changes.apiKeys.newValue);
    }
    
    if (changes.preferences) {
      // Broadcast preference changes to content scripts
      this.broadcastToContentScripts({
        type: 'PREFERENCES_UPDATED',
        preferences: changes.preferences.newValue
      });
    }
  }

  broadcastToContentScripts(message) {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, message).catch(() => {
            // Tab might not have content script
          });
        }
      });
    });
  }
}

// Initialize background service
new BackgroundService();

// src/background/storage-manager.js
export class StorageManager {
  constructor() {
    this.defaults = {
      preferences: {
        defaultLanguage: 'en-US',
        defaultRate: 1.0,
        defaultPitch: 1.0,
        defaultVolume: 1.0,
        autoPlay: false,
        showExplanations: true,
        enableAnalytics: false
      },
      apiKeys: {
        groqApiKey: '',
        claudeApiKey: ''
      },
      usage: {
        totalSpeechRequests: 0,
        totalExplanationRequests: 0,
        lastUsed: null
      }
    };
  }

  async initializeDefaults() {
    const existing = await chrome.storage.sync.get(Object.keys(this.defaults));
    
    // Set defaults for missing keys
    const updates = {};
    for (const [key, value] of Object.entries(this.defaults)) {
      if (!existing[key]) {
        updates[key] = value;
      }
    }
    
    if (Object.keys(updates).length > 0) {
      await chrome.storage.sync.set(updates);
    }
  }

  async getSettings() {
    return await chrome.storage.sync.get(['preferences', 'apiKeys']);
  }

  async updateSettings(settings) {
    return await chrome.storage.sync.set(settings);
  }

  async getUsageStats() {
    const { usage } = await chrome.storage.sync.get('usage');
    return usage || this.defaults.usage;
  }

  async incrementUsage(type) {
    const { usage } = await chrome.storage.sync.get('usage');
    const currentUsage = usage || this.defaults.usage;
    
    if (type === 'speech') {
      currentUsage.totalSpeechRequests++;
    } else if (type === 'explanation') {
      currentUsage.totalExplanationRequests++;
    }
    
    currentUsage.lastUsed = new Date().toISOString();
    
    await chrome.storage.sync.set({ usage: currentUsage });
  }
}
```

### Phase 6: Cross-Browser Compatibility & Testing

```javascript
// src/utils/browser-polyfill.js
class BrowserPolyfill {
  constructor() {
    this.browser = this.detectBrowser();
    this.setupPolyfills();
  }

  detectBrowser() {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      return 'chrome';
    } else if (typeof browser !== 'undefined' && browser.runtime) {
      return 'firefox';
    } else if (typeof safari !== 'undefined') {
      return 'safari';
    }
    return 'unknown';
  }

  setupPolyfills() {
    // Use Context7: WebExtension polyfill patterns
    if (this.browser === 'firefox') {
      // Firefox uses browser.* namespace
      window.chrome = window.browser;
    }
    
    // Promise-ify callback-based APIs
    this.promisifyAPIs();
  }

  promisifyAPIs() {
    const apis = ['storage', 'tabs', 'runtime'];
    
    apis.forEach(api => {
      if (chrome[api]) {
        const original = chrome[api];
        chrome[api] = new Proxy(original, {
          get(target, prop) {
            const value = target[prop];
            if (typeof value === 'function') {
              return this.promisify(value.bind(target));
            }
            return value;
          }
        });
      }
    });
  }

  promisify(fn) {
    return (...args) => {
      return new Promise((resolve, reject) => {
        fn(...args, (result) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(result);
          }
        });
      });
    };
  }
}

// Initialize polyfill
new BrowserPolyfill();
```

### Phase 7: Testing Implementation

```javascript
// tests/unit/tts-service.test.js
describe('TTSService', () => {
  let ttsService;
  let mockSpeechSynthesis;

  beforeEach(() => {
    mockSpeechSynthesis = {
      getVoices: jest.fn(() => []),
      speak: jest.fn(),
      cancel: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      onvoiceschanged: null
    };
    
    global.window = { speechSynthesis: mockSpeechSynthesis };
    global.SpeechSynthesisUtterance = jest.fn(() => ({
      onstart: null,
      onend: null,
      onerror: null
    }));

    ttsService = new TTSService();
  });

  describe('voice loading', () => {
    it('should load voices when available', async () => {
      const mockVoices = [
        { name: 'Test Voice', lang: 'en-US' }
      ];
      
      mockSpeechSynthesis.getVoices.mockReturnValue(mockVoices);
      
      const voices = await ttsService.loadVoices();
      
      expect(voices).toEqual(mockVoices);
      expect(ttsService.isInitialized).toBe(true);
    });

    it('should wait for voices to load if not immediately available', async () => {
      mockSpeechSynthesis.getVoices
        .mockReturnValueOnce([])
        .mockReturnValueOnce([{ name: 'Test Voice', lang: 'en-US' }]);

      setTimeout(() => {
        if (mockSpeechSynthesis.onvoiceschanged) {
          mockSpeechSynthesis.onvoiceschanged();
        }
      }, 50);

      const voices = await ttsService.loadVoices();
      
      expect(voices).toHaveLength(1);
      expect(ttsService.isInitialized).toBe(true);
    });
  });

  describe('speech synthesis', () => {
    it('should create and speak utterance with correct settings', async () => {
      const mockVoices = [{ name: 'Test Voice', lang: 'en-US' }];
      mockSpeechSynthesis.getVoices.mockReturnValue(mockVoices);
      
      await ttsService.loadVoices();
      
      const text = 'Hello world';
      const options = { lang: 'en-US', rate: 1.2 };
      
      const utterance = await ttsService.speak(text, options);
      
      expect(SpeechSynthesisUtterance).toHaveBeenCalledWith(text);
      expect(mockSpeechSynthesis.speak).toHaveBeenCalledWith(utterance);
      expect(utterance.rate).toBe(1.2);
    });

    it('should handle speech errors gracefully', async () => {
      const mockVoices = [{ name: 'Test Voice', lang: 'en-US' }];
      mockSpeechSynthesis.getVoices.mockReturnValue(mockVoices);
      
      await ttsService.loadVoices();
      
      const errorCallback = jest.fn();
      const options = { onError: errorCallback };
      
      const utterance = await ttsService.speak('test', options);
      
      // Simulate error
      const errorEvent = { error: 'network-error' };
      utterance.onerror(errorEvent);
      
      expect(errorCallback).toHaveBeenCalledWith(errorEvent);
    });
  });

  describe('playback controls', () => {
    beforeEach(async () => {
      mockSpeechSynthesis.getVoices.mockReturnValue([
        { name: 'Test Voice', lang: 'en-US' }
      ]);
      await ttsService.loadVoices();
    });

    it('should pause speech synthesis', () => {
      mockSpeechSynthesis.speaking = true;
      
      ttsService.pause();
      
      expect(mockSpeechSynthesis.pause).toHaveBeenCalled();
    });

    it('should resume paused speech', () => {
      mockSpeechSynthesis.paused = true;
      
      ttsService.resume();
      
      expect(mockSpeechSynthesis.resume).toHaveBeenCalled();
    });

    it('should stop speech synthesis', () => {
      ttsService.stop();
      
      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
      expect(ttsService.currentUtterance).toBeNull();
    });
  });
});

// tests/integration/ai-service.test.js
describe('AIService Integration', () => {
  let aiService;
  
  beforeEach(() => {
    global.chrome = {
      storage: {
        sync: {
          get: jest.fn(() => Promise.resolve({
            groqApiKey: 'test-groq-key',
            claudeApiKey: 'test-claude-key'
          }))
        }
      }
    };
    
    global.fetch = jest.fn();
    aiService = new AIService();
  });

  it('should explain text using Groq API', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        choices: [{
          message: {
            content: 'This is an explanation of the text.'
          }
        }]
      })
    };
    
    fetch.mockResolvedValue(mockResponse);
    
    const result = await aiService.explainText('Complex text to explain');
    
    expect(result.explanation).toBe('This is an explanation of the text.');
    expect(result.provider).toBe('groq');
    expect(fetch).toHaveBeenCalledWith(
      'https://api.groq.com/openai/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-groq-key'
        })
      })
    );
  });

  it('should handle API rate limiting', async () => {
    // Simulate rate limit exceeded
    for (let i = 0; i < 101; i++) {
      aiService.updateRateLimit('groq');
    }
    
    await expect(aiService.explainText('test text')).rejects.toThrow('Rate limit exceeded');
  });

  it('should fallback to Claude on Groq failure', async () => {
    // Mock Groq failure
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    });
    
    // Mock successful Claude response
    aiService.claudeClient = {
      explain: jest.fn(() => Promise.resolve('Claude explanation'))
    };
    
    const result = await aiService.explainText('test text');
    
    expect(result.explanation).toBe('Claude explanation');
    expect(result.provider).toBe('claude');
  });
});
```

## 🧪 Validation Commands

These commands must all pass for successful implementation:

```bash
# Code Quality Checks
npm run lint                    # ESLint validation
npm run format:check           # Prettier formatting check  
npm run typecheck             # TypeScript compilation

# Testing Suite
npm run test:unit             # Unit test suite (>85% coverage required)
npm run test:integration      # Integration tests
npm run test:e2e:chrome      # Chrome E2E tests
npm run test:e2e:firefox     # Firefox E2E tests
npm run test:accessibility   # WCAG 2.1 AA compliance tests

# Build Validation
npm run build:all             # Multi-browser production builds
npm run validate:manifest     # Manifest V3 validation
npm run validate:csp         # Content Security Policy check
npm run validate:permissions # Permission usage analysis

# Cross-Browser Testing
npm run test:cross-browser   # All browsers simultaneously
npm run package:all          # Extension packaging for all browsers
```

## ✅ Success Criteria

### Functional Requirements
- [ ] **Text Selection**: Works on 95% of websites including SPAs, iframes, dynamic content
- [ ] **Speech Synthesis**: Natural voice output with <200ms start delay
- [ ] **Voice Control**: 15+ languages, adjustable rate/pitch/volume, pause/resume/stop
- [ ] **AI Explanations**: Groq integration with Claude fallback, <3s response time
- [ ] **Cross-Browser**: Consistent functionality on Chrome 88+, Firefox 78+, Safari 14+, Edge 88+

### Technical Requirements
- [ ] **Manifest V3 Compliance**: Strict CSP adherence, no remote code execution
- [ ] **Performance**: <50MB memory usage, <300ms overlay display time
- [ ] **Accessibility**: Full keyboard navigation, screen reader support, ARIA labels
- [ ] **Security**: Secure API key storage, input sanitization, permission minimization
- [ ] **Privacy**: Explicit consent for AI processing, no data collection without permission

### Quality Gates  
- [ ] **Code Quality**: TypeScript compilation without errors, ESLint rules passing
- [ ] **Test Coverage**: >85% unit test coverage, integration tests for all major features
- [ ] **Cross-Browser Testing**: E2E tests passing on all target browsers
- [ ] **Extension Validation**: Store submission requirements met for all browsers
- [ ] **Documentation**: Complete API documentation, user guide, troubleshooting guide

## 🎯 Implementation Notes

### Critical Technical Decisions
1. **No eval()**: Use Function constructor or template literals for dynamic code
2. **CSP Compliance**: No inline scripts, external CDN restrictions
3. **Service Worker Lifecycle**: Handle service worker termination and restart
4. **Memory Management**: Clean up event listeners, cancel pending requests
5. **Error Recovery**: Graceful degradation when APIs unavailable

### Browser-Specific Considerations
- **Chrome**: Native Manifest V3 support, full API access
- **Firefox**: Use webextension-polyfill, different voice enumeration timing
- **Safari**: Limited extension API support, requires conversion for App Store
- **Edge**: Chromium-based, same as Chrome with minor differences

### Security Best Practices
- **API Keys**: Store in chrome.storage.sync, never in code
- **Content Scripts**: Minimal permissions, sandboxed execution
- **AI Requests**: User consent required, content filtering for sensitive data
- **Error Messages**: No sensitive information exposure to users

### Performance Optimizations
- **Lazy Loading**: Load AI services only when needed
- **Voice Caching**: Cache available voices to avoid repeated enumeration
- **Request Debouncing**: Prevent rapid API calls from text selection
- **Memory Cleanup**: Proper cleanup of speech synthesis resources

This PRP provides everything needed to implement a production-ready, cross-browser TTS extension with AI integration, following all modern web standards and accessibility guidelines.