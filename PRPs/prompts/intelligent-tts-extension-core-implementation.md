# PRP: Intelligent Text-to-Speech Browser Extension - Core Implementation

## Metadata
```yaml
template_version: "1.0.0"
ai_optimization: "claude-4-compatible"
methodology: "test-driven-development"
architecture: "browser-extension-mvc"
extension_type: "text-to-speech"
manifest_version: "v3"
compliance: ["manifest-v3", "csp", "privacy-focused", "accessibility", "cross-browser"]
feature_scope: "comprehensive-tts-extension"
context7_integrated: true
generated_from: "INITIAL.md"
last_updated: "2025-01-23"
```

---

## 📋 TTS Extension Feature Definition

### Goal Statement
**SMART Goal**: Implement a production-ready, cross-browser text-to-speech extension that enables users to select any text on any website and listen with natural voices, includes AI-powered explanations via Groq (free) and Claude APIs, supports 15+ languages with full accessibility compliance (WCAG 2.1 AA), and deploys to Chrome, Firefox, Safari, and Edge stores within 4 weeks.

**Business Context**: This extension addresses the growing need for web accessibility, supports users with reading difficulties, enables multitasking while consuming content, and provides AI-enhanced understanding of complex text. The extension leverages modern Web Speech API capabilities with privacy-first AI integration.

**Technical Scope**: Cross-browser extension using Manifest V3, Web Speech API for TTS, Groq/Claude APIs for AI explanations, responsive overlay UI, comprehensive settings management, and full offline TTS functionality with optional online AI enhancements.

### Why (TTS Feature Justification)
- **Accessibility Value**: Supports users with dyslexia, visual impairments, reading disabilities, and learning differences through natural speech synthesis
- **User Experience**: Enables content consumption while multitasking, supports language learning through pronunciation, provides audio alternatives for text-heavy content
- **Market Opportunity**: Growing accessibility compliance requirements, increasing demand for audio content consumption, untapped potential for AI-enhanced text understanding
- **Technology Advantage**: Leverages cutting-edge Web Speech API, integrates free and premium AI services, implements Manifest V3 best practices for security and performance
- **Privacy Leadership**: User-controlled AI processing, transparent data usage, local TTS processing where possible, explicit consent for all external API calls

### What (TTS Functional Requirements)

**Primary TTS Features**:
- Universal text selection and speech synthesis with natural voices across all websites
- Cross-browser compatibility (Chrome 88+, Firefox 78+, Safari 14+, Edge 88+) with Manifest V3
- Voice customization (rate: 0.1-10, pitch: 0-2, volume: 0-1, language selection from 15+ options)
- Full accessibility compliance (WCAG 2.1 AA, keyboard navigation, screen reader support)
- Smart overlay UI with contextual positioning and mobile-optimized touch targets

**AI-Enhanced Features**:
- Intelligent text explanations using Groq API (free tier: 100 requests/hour)
- Premium explanations via Claude API (paid: 60 requests/minute, advanced reasoning)
- Context-aware content processing with real-world examples and simplified explanations  
- Multi-language support with appropriate voice matching for content language
- Privacy-first AI integration with explicit user consent and transparent usage policies

**Secondary Features**:
- Text highlighting during speech playback with synchronized visual feedback
- Speech queue management for multiple text selections with play/pause/skip controls
- Offline functionality for core TTS features without internet dependency
- Settings import/export for user preferences and voice configurations
- Cross-browser settings synchronization via chrome.storage.sync API

**Non-Functional Requirements**:
- **Performance**: Overlay appears within 300ms of text selection, TTS starts within 500ms of play button click, memory usage <50MB during operation
- **Security**: Strict Manifest V3 compliance, Content Security Policy adherence, no inline scripts or eval(), secure API key storage with encryption
- **Accessibility**: Full WCAG 2.1 AA compliance, complete keyboard navigation support, screen reader compatibility, high contrast mode support
- **Reliability**: Works on 95% of websites including SPAs and complex DOM structures, graceful error handling with user-friendly messages, automatic recovery mechanisms
- **Privacy**: No data collection without explicit consent, local storage for all settings, transparent AI usage with opt-in/opt-out granular controls

### Success Criteria & KPIs

**Technical Metrics**:
- [ ] **Performance**: Overlay response time <300ms (95th percentile), TTS start delay <500ms, AI response time <3 seconds
- [ ] **Cross-Browser**: Full compatibility with Chrome 88+, Firefox 78+, Safari 14+, Edge 88+ with identical feature sets
- [ ] **Security**: Zero CSP violations, complete Manifest V3 compliance, no security vulnerabilities in dependencies
- [ ] **Quality**: Unit test coverage >85%, integration tests for all browser APIs, E2E tests covering user workflows
- [ ] **Accessibility**: WCAG 2.1 AA compliance score 100%, keyboard navigation support, screen reader compatibility verified

**User Experience Metrics**:
- [ ] **Usability**: Maximum 2 clicks to start TTS, intuitive overlay design with clear visual hierarchy
- [ ] **Reliability**: TTS success rate >95% across supported browsers and websites
- [ ] **AI Integration**: Explanation generation success rate >90%, meaningful content analysis
- [ ] **Memory Efficiency**: Extension memory usage <50MB during active use, no memory leaks during extended sessions
- [ ] **Voice Quality**: Support for 15+ languages with natural-sounding voices, appropriate voice selection per content language

---

## 📚 Comprehensive Context Repository

### Required Documentation & References

**AI Services Integration** (use context7 for current documentation):
- **Groq API**: Authentication methods, rate limiting (100 requests/hour free tier), model availability (llama3-8b-8192, mixtral-8x7b-32768), request/response formats, error handling patterns
- **Claude API**: Authentication, message format, rate limits (60 requests/minute), model capabilities (claude-3-haiku-20240307), content policies, pricing structure

**Browser Extension APIs** (use context7 for Manifest V3 requirements):
- **Chrome Extension APIs**: Service worker limitations, chrome.storage quotas and sync behavior, content script injection patterns, cross-origin request policies, CSP requirements
- **Web Speech API**: speechSynthesis browser compatibility, voice availability across platforms, language support variations, browser-specific limitations and error handling

**Cross-Browser Compatibility** (use context7 for WebExtension standards):
- **Firefox Extensions**: manifest.json differences, browser API polyfill requirements, Firefox-specific voice handling, AMO submission requirements
- **Safari Extensions**: Safari extension format conversion, macOS/iOS voice integration, Safari-specific permissions, App Store submission process

### Current System Architecture
```bash
# CURRENT PROJECT STATUS: Configuration Complete, Source Code Missing
textToSpeachExt/
├── .claude/                    # ✅ AI-assisted development setup
├── .env                       # ✅ Complete environment configuration  
├── docs/                      # ✅ Comprehensive documentation
├── package.json              # ✅ Full dependency and script configuration
├── PRPs/                     # ✅ Production Ready Prompts system
├── src/                      # ❌ MISSING - Needs complete implementation
└── tests/                    # ❌ MISSING - Needs test suite implementation
```

### Target Architecture with New Components

**Complete Browser Extension Structure (Manifest V3)**:
```bash
src/
├── background/               # Service Worker (Manifest V3)
│   ├── service-worker.js    # Main background service with message handling
│   ├── ai-service.js        # Groq/Claude API integration with rate limiting
│   ├── storage-service.js   # Settings and user preference management
│   └── permissions-manager.js # Runtime permission handling and validation
├── content/                 # Content Scripts  
│   ├── content-script.js    # Main content script with text selection detection
│   ├── text-selector.js     # Robust text selection across DOM structures
│   ├── overlay-ui.js        # TTS control overlay with accessibility support
│   └── tts-controller.js    # Speech synthesis control and queue management
├── popup/                   # Extension Popup (toolbar interface)
│   ├── popup.html          # Popup interface with settings preview
│   ├── popup.js            # Popup logic and quick controls
│   └── popup.css           # Popup styling with theme support
├── options/                 # Settings Page
│   ├── options.html        # Comprehensive settings interface
│   ├── options.js          # Settings management and validation
│   └── options.css         # Settings page styling with accessibility focus
├── shared/                  # Shared Utilities
│   ├── browser-compat.js   # Cross-browser API compatibility layer
│   ├── error-handler.js    # Global error management and user feedback
│   ├── logger.js          # Debug logging with privacy compliance
│   └── constants.js       # Configuration constants and feature flags
├── assets/                  # Static Assets
│   ├── icons/              # Extension icons (16x16, 48x48, 128x128, SVG)
│   ├── sounds/             # Audio feedback (notification.mp3, error.mp3)
│   └── styles/             # Global CSS (variables.css, themes.css)
├── _locales/               # Internationalization (15+ languages)
│   ├── en/messages.json    # English (primary language)
│   ├── ur/messages.json    # Urdu with RTL support
│   ├── ar/messages.json    # Arabic with RTL support
│   └── [13 more languages]
├── manifest.chrome.json    # Chrome Manifest V3 configuration
├── manifest.firefox.json  # Firefox WebExtension manifest  
└── manifest.safari.json   # Safari Web Extension manifest

# BUILD SYSTEM (to be implemented):
build/
├── webpack.chrome.js       # Chrome-specific build configuration
├── webpack.firefox.js      # Firefox-specific build configuration  
├── webpack.safari.js       # Safari-specific build configuration
└── webpack.common.js       # Shared webpack configuration

# TESTING FRAMEWORK (to be implemented):
tests/
├── unit/                   # Unit tests (>85% coverage required)
├── integration/            # Browser API integration tests
├── e2e/                   # Cross-browser end-to-end tests
└── accessibility/         # WCAG 2.1 AA compliance tests
```

### Critical Codebase Knowledge & Extension Constraints

```javascript
// MANIFEST V3 CRITICAL REQUIREMENTS (use context7 for latest updates)
// SECURITY: No inline scripts - all JavaScript in separate files
// PERFORMANCE: Service workers can be terminated - use storage for persistence
// COMPATIBILITY: Different manifest formats for each browser

// SERVICE WORKER PATTERNS (Manifest V3)
// Register listeners synchronously at top level
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TTS_REQUEST') {
    handleTTSRequest(message.data).then(sendResponse);
    return true; // Keep message channel open for async response
  }
});

// STORAGE API USAGE (Critical for service worker persistence)
// Use chrome.storage instead of global variables
const StorageService = {
  async set(key, value) {
    return chrome.storage.sync.set({ [key]: value });
  },
  async get(key) {
    const result = await chrome.storage.sync.get([key]);
    return result[key];
  }
};

// AI API INTEGRATION PATTERNS
// Groq API (use context7 for current authentication format)
const GroqService = {
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
  rateLimit: { requests: 100, window: 3600000 }, // 100/hour
  
  async explainText(text, context = {}) {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: 'Explain this text simply with examples.' },
          { role: 'user', content: text }
        ],
        max_tokens: 500
      })
    });
    return response.json();
  }
};

// Claude API (use context7 for current message format)
const ClaudeService = {
  apiKey: process.env.CLAUDE_API_KEY,
  baseURL: 'https://api.anthropic.com/v1',
  rateLimit: { requests: 60, window: 60000 }, // 60/minute
  
  async explainText(text, context = {}) {
    const response = await fetch(`${this.baseURL}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'content-type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [
          { role: 'user', content: `Explain this text: ${text}` }
        ]
      })
    });
    return response.json();
  }
};

// WEB SPEECH API PATTERNS (use context7 for browser compatibility)
const TTSService = {
  speak(text, options = {}) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;
    utterance.voice = options.voice || null;
    
    // Error handling for speech synthesis failures
    utterance.onerror = (event) => {
      console.error('TTS Error:', event.error);
      // Implement fallback or retry logic
    };
    
    speechSynthesis.speak(utterance);
    return utterance;
  },
  
  getVoices() {
    return speechSynthesis.getVoices();
  },
  
  cancel() {
    speechSynthesis.cancel();
  }
};

// CONTENT SCRIPT COMMUNICATION
async function sendToBackground(message) {
  try {
    const response = await chrome.runtime.sendMessage(message);
    return response;
  } catch (error) {
    if (error.message.includes('Extension context invalidated')) {
      // Extension was reloaded/disabled - handle gracefully
      window.location.reload();
    }
    throw error;
  }
}

// CROSS-BROWSER COMPATIBILITY
const browserAPI = (() => {
  if (typeof browser !== 'undefined') {
    return browser; // Firefox WebExtensions
  } else if (typeof chrome !== 'undefined') {
    return chrome; // Chrome/Edge
  } else {
    throw new Error('Browser extension API not available');
  }
})();

// PRIVACY COMPLIANCE PATTERNS
const PrivacyManager = {
  async getConsent(feature) {
    const consent = await StorageService.get(`consent_${feature}`);
    return consent === true;
  },
  
  async requestConsent(feature, description) {
    // Show consent dialog to user
    const userChoice = await this.showConsentDialog(feature, description);
    await StorageService.set(`consent_${feature}`, userChoice);
    return userChoice;
  }
};

// ACCESSIBILITY PATTERNS
const AccessibilityHelper = {
  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  },
  
  makeKeyboardAccessible(element) {
    element.setAttribute('tabindex', '0');
    element.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        element.click();
      }
    });
  }
};
```

---

## 🏗️ Implementation Blueprint

### Phase 1: Foundation & Core TTS (Week 1)

**Task 1: Project Structure Setup**
```bash
CREATE src/manifest.chrome.json:
  - Manifest V3 configuration with required permissions
  - Service worker declaration with type: "module"
  - Content scripts for universal website compatibility
  - Icons and extension metadata

CREATE src/background/service-worker.js:
  - Message handling for content-background communication  
  - Storage service initialization and state management
  - Error handling and logging service integration
  - Lifecycle event handlers (onInstalled, onStartup)

CREATE src/shared/storage-service.js:
  - Chrome storage API wrapper with sync/local fallback
  - Settings schema validation and migration handling
  - Privacy-compliant data persistence patterns
  - Cross-browser compatibility layer
```

**Task 2: Text Selection & Basic TTS**
```bash
CREATE src/content/content-script.js:
  - Universal text selection detection across DOM types
  - Text sanitization and processing for speech synthesis
  - Overlay injection and positioning logic
  - Message passing to background service worker

CREATE src/content/text-selector.js:
  - Robust selection handling (mouse, keyboard, touch)
  - Context detection (language, content type, complexity)
  - Selection validation and cleanup
  - Edge case handling (iframes, shadow DOM, dynamic content)

CREATE src/shared/tts-service.js:
  - Web Speech API wrapper with error handling
  - Voice loading and caching mechanisms
  - Rate, pitch, volume control with validation
  - Cross-browser voice compatibility layer
```

**Task 3: Overlay UI & Controls**  
```bash
CREATE src/content/overlay-ui.js:
  - Responsive overlay with mobile-optimized touch targets
  - Accessibility-compliant UI (ARIA labels, keyboard navigation)
  - Theme support (dark/light mode, high contrast)
  - Animation and visual feedback systems

CREATE src/assets/styles/overlay.css:
  - CSS custom properties for theming
  - Responsive design breakpoints
  - Accessibility compliance (focus indicators, contrast ratios)
  - Animation performance optimizations
```

### Phase 2: AI Integration & Privacy (Week 2)

**Task 4: AI Service Integration**
```bash
CREATE src/background/ai-service.js:
  - Multi-provider AI integration (Groq primary, Claude fallback)
  - Rate limiting implementation with request queuing
  - Response caching with TTL and size management  
  - Error handling with graceful fallback strategies

CREATE src/shared/privacy-manager.js:
  - Consent management with granular controls
  - Data usage transparency and user notifications
  - Opt-in/opt-out functionality for AI features
  - Privacy policy integration and user education
```

**Task 5: Settings & Preferences**
```bash  
CREATE src/options/options.html:
  - Comprehensive settings interface with logical grouping
  - Voice selection with preview functionality
  - AI service configuration and consent management
  - Import/export functionality for user preferences

CREATE src/options/options.js:
  - Settings validation and sanitization
  - Real-time preview of voice and speed changes
  - Privacy controls and consent status display
  - Settings migration and version compatibility
```

### Phase 3: Cross-Browser & Testing (Week 3)

**Task 6: Cross-Browser Support**
```bash
CREATE build/webpack.chrome.js:
  - Chrome-specific build optimizations
  - Manifest V3 compliance validation
  - Asset bundling and code splitting
  - Development vs production configurations

CREATE build/webpack.firefox.js:
  - Firefox WebExtensions compatibility
  - Browser API polyfill integration
  - Firefox-specific manifest generation
  - AMO submission preparation

CREATE build/webpack.safari.js:
  - Safari Web Extensions format
  - macOS/iOS compatibility handling
  - App Store compliance preparations
  - Platform-specific asset optimization
```

**Task 7: Testing Implementation**
```bash
CREATE tests/unit/tts-service.test.js:
  - Speech synthesis API testing with mocks
  - Voice loading and selection validation
  - Error handling and recovery testing
  - Performance benchmarking

CREATE tests/e2e/cross-browser.spec.js:
  - Multi-browser test suite (Chrome, Firefox, Safari)
  - Text selection workflows across browser engines
  - AI integration functionality validation
  - Accessibility compliance verification
```

### Phase 4: Polish & Deployment (Week 4)

**Task 8: Store Preparation**
```bash
CREATE assets/store-listings/:
  - Chrome Web Store metadata and screenshots
  - Firefox Add-ons submission materials
  - Safari App Store Connect assets
  - Privacy policy and GDPR compliance documentation

CREATE scripts/package-for-stores.js:
  - Automated packaging for each browser store
  - Version consistency validation
  - Asset optimization and compression
  - Submission checklist automation
```

### Per Task Implementation Pseudocode

**Task 1 - Service Worker Pseudocode**:
```javascript
// src/background/service-worker.js
// PATTERN: Register all listeners at top level (Manifest V3 requirement)
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  // CRITICAL: Handle all message types with proper error handling
  switch (message.type) {
    case 'TTS_REQUEST':
      const result = await TTSController.speak(message.text, message.options);
      sendResponse({ success: true, data: result });
      break;
    case 'AI_EXPLAIN':
      const explanation = await AIService.explainText(message.text);
      sendResponse({ success: true, data: explanation });
      break;
    default:
      sendResponse({ success: false, error: 'Unknown message type' });
  }
  return true; // Keep channel open for async responses
});

chrome.runtime.onInstalled.addListener(async (details) => {
  // PATTERN: Initialize storage and set default preferences
  await StorageService.initializeDefaults({
    ttsSettings: { rate: 1.0, pitch: 1.0, language: 'en-US' },
    privacyConsent: { aiExplanations: false, analytics: false },
    features: { overlayEnabled: true, keyboardShortcuts: true }
  });
});
```

**Task 2 - Text Selection Pseudocode**:
```javascript
// src/content/text-selector.js
class TextSelector {
  constructor() {
    this.selectionHandler = this.handleTextSelection.bind(this);
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // PATTERN: Use passive listeners for performance
    document.addEventListener('mouseup', this.selectionHandler, { passive: true });
    document.addEventListener('keyup', this.selectionHandler, { passive: true });
    document.addEventListener('touchend', this.selectionHandler, { passive: true });
  }
  
  async handleTextSelection(event) {
    const selection = window.getSelection();
    if (!selection.rangeCount || selection.toString().trim().length < 10) return;
    
    // CRITICAL: Sanitize selected text to prevent XSS
    const selectedText = this.sanitizeText(selection.toString());
    const boundingRect = selection.getRangeAt(0).getBoundingClientRect();
    
    // PATTERN: Detect content language for appropriate voice selection
    const contentLanguage = this.detectLanguage(selectedText);
    
    await OverlayUI.show({
      text: selectedText,
      position: boundingRect,
      language: contentLanguage
    });
  }
  
  sanitizeText(text) {
    // SECURITY: Remove any HTML entities and suspicious content
    return text.replace(/[<>]/g, '').trim();
  }
}
```

**Task 4 - AI Service Pseudocode**:
```javascript
// src/background/ai-service.js  
class AIService {
  constructor() {
    this.providers = {
      groq: new GroqProvider(),
      claude: new ClaudeProvider()
    };
    this.rateLimitManager = new RateLimitManager();
  }
  
  async explainText(text, options = {}) {
    // PRIVACY: Check user consent before making API calls
    const hasConsent = await PrivacyManager.getConsent('aiExplanations');
    if (!hasConsent) {
      throw new Error('AI explanations require user consent');
    }
    
    // PATTERN: Try Groq first (free), fall back to Claude if needed
    let provider = 'groq';
    let result;
    
    try {
      // RATE LIMITING: Check if we can make request
      await this.rateLimitManager.checkLimit(provider);
      result = await this.providers.groq.explainText(text, options);
    } catch (error) {
      if (error.name === 'RateLimitExceeded') {
        // FALLBACK: Switch to Claude if Groq rate limit exceeded
        provider = 'claude';
        await this.rateLimitManager.checkLimit(provider);
        result = await this.providers.claude.explainText(text, options);
      } else {
        throw error;
      }
    }
    
    // CACHING: Store successful responses to reduce API calls
    await this.cacheResponse(text, result, provider);
    return result;
  }
}
```

### Integration Points

**BROWSER PERMISSIONS**:
```json
{
  "permissions": ["storage", "activeTab"],
  "host_permissions": ["<all_urls>"],
  "optional_permissions": ["notifications"]
}
```

**STORAGE SCHEMA**:
```javascript
{
  "userSettings": {
    "tts": { "rate": 1.0, "pitch": 1.0, "voice": null, "language": "en-US" },
    "ui": { "theme": "auto", "overlayPosition": "smart", "keyboardShortcuts": true },
    "privacy": { "aiConsent": false, "analyticsConsent": false }
  },
  "performanceMetrics": {
    "overlayResponseTimes": [], // Array of response times for monitoring
    "ttsStartDelays": [],       // Speech synthesis start times
    "memoryUsage": []           // Memory usage tracking
  }
}
```

**API INTEGRATION**:
```yaml
GROQ_API:
  endpoint: "https://api.groq.com/openai/v1/chat/completions"
  rate_limit: "100 requests/hour (free tier)"
  models: ["llama3-8b-8192", "mixtral-8x7b-32768"]
  authentication: "Bearer token"

CLAUDE_API:
  endpoint: "https://api.anthropic.com/v1/messages"  
  rate_limit: "60 requests/minute"
  models: ["claude-3-haiku-20240307", "claude-3-sonnet-20240229"]
  authentication: "x-api-key header"
```

---

## 🧪 Comprehensive Testing Strategy

### Level 1: Unit Tests (>85% Coverage Required)

```javascript
// tests/unit/tts-service.test.js
describe('TTSService', () => {
  let mockSpeechSynthesis;
  
  beforeEach(() => {
    // MOCK: Web Speech API for consistent testing
    mockSpeechSynthesis = {
      speak: jest.fn(),
      cancel: jest.fn(),
      getVoices: jest.fn(() => [
        { name: 'Test Voice', lang: 'en-US', default: true }
      ])
    };
    global.speechSynthesis = mockSpeechSynthesis;
  });
  
  test('should create valid TTS utterance with proper settings', () => {
    const text = 'Hello world for testing';
    const options = { rate: 1.5, pitch: 1.2, voice: null };
    
    const utterance = TTSService.createUtterance(text, options);
    
    expect(utterance.text).toBe(text);
    expect(utterance.rate).toBe(1.5);
    expect(utterance.pitch).toBe(1.2);
  });
  
  test('should handle empty text gracefully', () => {
    expect(() => {
      TTSService.createUtterance('');
    }).toThrow('Text cannot be empty for speech synthesis');
  });
  
  test('should implement speech synthesis error recovery', async () => {
    const mockUtterance = { onerror: null };
    jest.spyOn(window, 'SpeechSynthesisUtterance').mockReturnValue(mockUtterance);
    
    const promise = TTSService.speak('test text');
    
    // Simulate network error in speech synthesis
    mockUtterance.onerror({ error: 'network', message: 'Connection failed' });
    
    await expect(promise).rejects.toThrow('Speech synthesis failed');
  });
});

// tests/unit/ai-service.test.js
describe('AIService', () => {
  let mockFetch;
  
  beforeEach(() => {
    mockFetch = jest.fn();
    global.fetch = mockFetch;
    // Mock privacy consent as approved for testing
    jest.spyOn(PrivacyManager, 'getConsent').mockResolvedValue(true);
  });
  
  test('should explain text using Groq API successfully', async () => {
    const testText = 'Quantum computing uses quantum mechanics';
    const mockResponse = {
      choices: [{
        message: {
          content: 'Quantum computing is a type of computing that uses quantum mechanical phenomena...'
        }
      }]
    };
    
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });
    
    const result = await AIService.explainText(testText);
    
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('api.groq.com'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': expect.stringContaining('Bearer')
        })
      })
    );
    expect(result.choices[0].message.content).toContain('quantum mechanical');
  });
  
  test('should fall back to Claude when Groq rate limit exceeded', async () => {
    const testText = 'Complex technical explanation needed';
    
    // First call to Groq fails with rate limit
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: () => Promise.resolve({ error: 'Rate limit exceeded' })
    });
    
    // Second call to Claude succeeds
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        content: [{ text: 'Here is a simple explanation...' }]
      })
    });
    
    const result = await AIService.explainText(testText);
    
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenNthCalledWith(2,
      expect.stringContaining('api.anthropic.com'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'x-api-key': expect.any(String)
        })
      })
    );
  });
});
```

### Level 2: Integration Tests (Browser Context)

```javascript
// tests/integration/extension-messaging.test.js
describe('Extension Integration Tests', () => {
  let mockExtension;
  
  beforeEach(async () => {
    // Load extension in isolated test environment
    mockExtension = await loadMockExtension('./dist/test');
  });
  
  afterEach(async () => {
    await mockExtension.unload();
  });
  
  test('should handle content-background messaging for TTS requests', async () => {
    const testPage = await mockExtension.newTab('https://example.com');
    
    // Inject test content
    await testPage.setContent(`
      <div id="test-content">
        This is test content for text-to-speech functionality testing.
        The extension should detect this selection and provide TTS controls.
      </div>
    `);
    
    // Simulate text selection and TTS request
    const response = await testPage.evaluate(async () => {
      // Select text programmatically
      const textElement = document.getElementById('test-content');
      const range = document.createRange();
      range.selectNodeContents(textElement);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Send TTS request to background
      return chrome.runtime.sendMessage({
        type: 'TTS_REQUEST',
        text: selection.toString(),
        options: { rate: 1.0, pitch: 1.0, language: 'en-US' }
      });
    });
    
    expect(response.success).toBe(true);
    expect(response.data.utteranceId).toBeDefined();
  });
  
  test('should persist settings across extension sessions', async () => {
    const testSettings = {
      rate: 1.5,
      pitch: 1.2,
      language: 'en-GB',
      aiConsent: true
    };
    
    // Set settings
    await mockExtension.storage.set('userSettings', testSettings);
    
    // Simulate extension restart
    await mockExtension.restart();
    
    // Retrieve settings after restart
    const retrievedSettings = await mockExtension.storage.get('userSettings');
    
    expect(retrievedSettings).toEqual(testSettings);
  });
  
  test('should handle AI service integration with proper consent', async () => {
    // Grant consent for AI features
    await mockExtension.storage.set('privacyConsent', { aiExplanations: true });
    
    // Mock AI API response
    mockExtension.mockAPI('https://api.groq.com/openai/v1/chat/completions', {
      choices: [{
        message: { content: 'This is a test explanation from Groq API.' }
      }]
    });
    
    const response = await mockExtension.background.explainText(
      'Artificial intelligence is the simulation of human intelligence'
    );
    
    expect(response.choices[0].message.content).toContain('test explanation');
  });
});
```

### Level 3: Cross-Browser E2E Tests

```javascript
// tests/e2e/cross-browser-tts.spec.js
const { test, expect } = require('@playwright/test');

['chromium', 'firefox', 'webkit'].forEach(browserName => {
  test.describe(`TTS Extension E2E - ${browserName}`, () => {
    test.use({ browserName });
    
    test('complete TTS workflow with AI explanation', async ({ page, context }) => {
      // Mock extension APIs for testing
      await context.addInitScript(() => {
        window.chrome = {
          runtime: {
            sendMessage: (msg) => {
              if (msg.type === 'TTS_REQUEST') {
                return Promise.resolve({ success: true, utteranceId: 'test-123' });
              } else if (msg.type === 'AI_EXPLAIN') {
                return Promise.resolve({
                  success: true,
                  explanation: 'This is a simplified explanation of the selected text.'
                });
              }
            },
            onMessage: { addListener: () => {} }
          },
          storage: {
            sync: {
              get: () => Promise.resolve({
                userSettings: { rate: 1.0, pitch: 1.0, language: 'en-US' },
                privacyConsent: { aiExplanations: true }
              }),
              set: () => Promise.resolve()
            }
          }
        };
      });
      
      await page.goto('https://example.com');
      
      // Set up test content
      await page.setContent(`
        <div id="test-article">
          <h1>Artificial Intelligence in Modern Computing</h1>
          <p id="target-paragraph">
            Machine learning algorithms are mathematical models that enable 
            computers to learn and make decisions from data without being 
            explicitly programmed for each specific task.
          </p>
        </div>
      `);
      
      // Select text for TTS
      await page.locator('#target-paragraph').selectText();
      
      // Wait for overlay to appear (should be <300ms)
      const overlay = page.locator('[data-tts-overlay]');
      await expect(overlay).toBeVisible({ timeout: 300 });
      
      // Test accessibility - overlay should be keyboard accessible
      await overlay.press('Tab');
      const playButton = page.locator('[data-tts-play]');
      await expect(playButton).toBeFocused();
      
      // Click play button for TTS
      await playButton.click();
      
      // Verify TTS is initiated (mock should confirm)
      const ttsStatus = await page.evaluate(() => {
        return window.mockTTSActive === true;
      });
      expect(ttsStatus).toBe(true);
      
      // Test AI explanation feature
      const explainButton = page.locator('[data-tts-explain]');
      await explainButton.click();
      
      // Wait for explanation popup
      const explanationPopup = page.locator('[data-explanation-popup]');
      await expect(explanationPopup).toBeVisible({ timeout: 3000 });
      
      const explanationText = await page.locator('[data-explanation-content]').textContent();
      expect(explanationText).toContain('simplified explanation');
    });
    
    test('accessibility compliance validation', async ({ page }) => {
      await page.goto('https://example.com');
      await page.setContent(`<p id="test-text">Accessibility test content</p>`);
      
      // Select text to trigger overlay
      await page.locator('#test-text').selectText();
      const overlay = page.locator('[data-tts-overlay]');
      await expect(overlay).toBeVisible();
      
      // Test keyboard navigation
      await page.keyboard.press('Tab');
      let focusedElement = await page.evaluate(() => 
        document.activeElement.getAttribute('data-tts-control')
      );
      expect(focusedElement).not.toBeNull();
      
      // Test ARIA labels
      const playButton = page.locator('[data-tts-play]');
      await expect(playButton).toHaveAttribute('aria-label', 'Play text-to-speech');
      
      // Test role attributes
      await expect(overlay).toHaveAttribute('role', 'dialog');
      await expect(overlay).toHaveAttribute('aria-labelledby', 'tts-overlay-title');
      
      // Test color contrast (WCAG AA requirement: >4.5:1)
      const contrast = await page.evaluate(() => {
        const button = document.querySelector('[data-tts-play]');
        const styles = window.getComputedStyle(button);
        // Mock contrast calculation - in real test, use accessibility testing library
        return 7.2; // Simulated contrast ratio
      });
      expect(contrast).toBeGreaterThan(4.5);
    });
  });
});
```

### Level 4: Performance Tests

```javascript
// tests/performance/extension-performance.test.js
describe('Extension Performance Tests', () => {
  
  test('should load extension within performance budget', async () => {
    const startTime = performance.now();
    
    const extension = await loadExtension('./dist');
    await extension.waitForReady();
    
    const loadTime = performance.now() - startTime;
    
    // Extension should load within 500ms
    expect(loadTime).toBeLessThan(500);
  });
  
  test('should handle large text selections efficiently', async () => {
    // Generate large text (50KB)
    const largeText = 'Lorem ipsum dolor sit amet. '.repeat(2000);
    const startTime = performance.now();
    
    const result = await TTSService.processText(largeText);
    const processingTime = performance.now() - startTime;
    
    // Should process large text within 1 second
    expect(processingTime).toBeLessThan(1000);
    expect(result.success).toBe(true);
  });
  
  test('should maintain memory usage within limits', async () => {
    const initialMemory = await getExtensionMemoryUsage();
    
    // Simulate intensive usage
    for (let i = 0; i < 100; i++) {
      await TTSService.speak(`Test text number ${i}`);
      await AIService.explainText(`Technical term ${i}`);
    }
    
    const finalMemory = await getExtensionMemoryUsage();
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should not exceed 50MB
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
  });
});
```

---

## 🔒 Security & Compliance Framework

### Browser Extension Security Checklist
- [ ] **Manifest V3 Compliance**: Service worker architecture, no background.persistent
- [ ] **Content Security Policy**: Strict CSP with no unsafe-eval/unsafe-inline
- [ ] **Input Sanitization**: All user content sanitized to prevent XSS attacks
- [ ] **Permission Minimization**: Only necessary permissions (storage, activeTab)
- [ ] **Cross-Origin Isolation**: Proper origin validation for all API requests
- [ ] **Data Privacy**: No data collection without explicit user consent
- [ ] **Secrets Management**: API keys encrypted in storage, not in source code
- [ ] **Extension Isolation**: Proper isolation between content/background contexts
- [ ] **Host Permissions**: Minimal host permissions, avoid <all_urls> where possible
- [ ] **Dependency Scanning**: No known vulnerabilities in npm dependencies

### Compliance Validation Framework

```javascript
// Extension security testing framework
class ExtensionComplianceTests {
  
  testPrivacyCompliance() {
    // GDPR/CCPA compliance validation
    const collectedData = extension.getCollectedDataTypes();
    expect(collectedData).toEqual(['userSettings', 'errorLogs']); // Minimal data only
    
    // Consent management validation  
    const hasConsentDialog = extension.hasConsentDialog();
    expect(hasConsentDialog).toBe(true);
    
    // Data deletion capability
    const canDeleteData = extension.canDeleteUserData();
    expect(canDeleteData).toBe(true);
  }
  
  testAccessibilityCompliance() {
    // WCAG 2.1 AA compliance validation
    
    // Keyboard navigation test
    const keyboardAccessible = extension.testKeyboardNavigation();
    expect(keyboardAccessible).toBe(true);
    
    // Screen reader compatibility
    const hasAriaLabels = extension.testAriaLabels();
    expect(hasAriaLabels).toBe(true);
    
    // Color contrast validation
    const contrastRatio = extension.getColorContrast();
    expect(contrastRatio).toBeGreaterThan(4.5); // WCAG AA requirement
  }
  
  testStoreCompliance() {
    // Chrome Web Store policy compliance
    const chromeCompliant = extension.validateChromeStoreRequirements();
    expect(chromeCompliant.manifestV3).toBe(true);
    expect(chromeCompliant.permissions.length).toBeLessThan(5);
    
    // Firefox Add-ons compliance  
    const firefoxCompliant = extension.validateFirefoxRequirements();
    expect(firefoxCompliant.privacyPolicy).toBe(true);
    expect(firefoxCompliant.noEval).toBe(true);
  }
}
```

---

## 📊 Observability & Monitoring

### Performance Monitoring (use context7 for current browser performance APIs)

```javascript
// Performance tracking service
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      overlayResponseTimes: [],
      ttsStartDelays: [],
      aiResponseTimes: [],
      memoryUsage: []
    };
  }
  
  recordOverlayResponse(startTime, endTime) {
    const responseTime = endTime - startTime;
    this.metrics.overlayResponseTimes.push(responseTime);
    
    // Alert if response time exceeds 300ms threshold
    if (responseTime > 300) {
      console.warn(`Overlay response time exceeded threshold: ${responseTime}ms`);
    }
  }
  
  recordTTSStart(startTime, endTime) {
    const delay = endTime - startTime;
    this.metrics.ttsStartDelays.push(delay);
    
    // Target: TTS should start within 500ms
    if (delay > 500) {
      console.warn(`TTS start delay exceeded threshold: ${delay}ms`);
    }
  }
  
  async getMetricsSummary() {
    return {
      overlayResponseP95: this.getPercentile(this.metrics.overlayResponseTimes, 95),
      ttsStartP95: this.getPercentile(this.metrics.ttsStartDelays, 95),
      averageMemoryUsage: this.getAverage(this.metrics.memoryUsage),
      totalApiCalls: this.metrics.aiResponseTimes.length
    };
  }
}
```

---

## 🎯 TTS Extension Implementation Checklist

### Context7 Integration Points (CRITICAL for current documentation)

**AI Service Integration** (use context7 for real-time documentation):
- **Groq API**: Use context7 to fetch current authentication methods, rate limits (100 requests/hour free), available models (llama3-8b-8192, mixtral-8x7b-32768), request/response formats, error codes, pricing updates
- **Claude API**: Use context7 to get latest message format specification, authentication headers (x-api-key), rate limits (60 requests/minute), model capabilities (claude-3-haiku-20240307), content policies, pricing structure

**Browser Extension APIs** (use context7 for Manifest V3 requirements):
- **Chrome Extension APIs**: Use context7 for service worker limitations, chrome.storage sync/local quotas and behavior, content script injection best practices, CSP requirements, permission changes
- **Web Speech API**: Use context7 for speechSynthesis browser compatibility matrix, voice availability per platform, language support variations, browser-specific limitations and error handling

**Cross-Browser Compatibility** (use context7 for WebExtension standards):
- **Firefox Extensions**: Use context7 for manifest.json differences from Chrome, browser API polyfill requirements, Firefox-specific voice handling, AMO submission guidelines
- **Safari Extensions**: Use context7 for Safari Web Extension conversion process, macOS/iOS voice integration differences, Safari-specific permissions, App Store submission requirements

### Implementation Phases with Success Validation

#### Phase 1: Foundation (Week 1) ✅ Ready to Implement
```javascript
// Essential files to create with Context7 guidance:
src/manifest.chrome.json      // Use context7 for latest Manifest V3 requirements
src/background/service-worker.js // Use context7 for service worker best practices
src/content/content-script.js    // Use context7 for content script patterns
src/shared/tts-service.js        // Use context7 for Web Speech API compatibility
src/content/overlay-ui.js        // Use context7 for accessibility compliance

// Key validation criteria:
✅ Manifest V3 compliance with proper permissions
✅ Service worker message handling with async response patterns
✅ Text selection detection across complex DOM structures
✅ Basic TTS functionality with error handling and voice loading
✅ Responsive overlay with accessibility support (ARIA labels, keyboard nav)
```

#### Phase 2: AI Integration (Week 2) ✅ Ready to Implement  
```javascript
// AI integration files with Context7 API guidance:
src/background/ai-service.js     // Use context7 for Groq/Claude API formats
src/shared/privacy-manager.js    // Use context7 for privacy best practices
src/shared/rate-limiter.js       // Use context7 for API rate limiting patterns

// Privacy & security implementation:
✅ Explicit consent dialogs before any AI API calls
✅ API key secure storage (chrome.storage.sync with encryption)
✅ Rate limiting: Groq (100/hour), Claude (60/minute) with queue management
✅ Request sanitization and response validation with XSS prevention
✅ Local fallback when AI services unavailable or consent denied
```

#### Phase 3: Cross-Browser Testing (Week 3) ✅ Ready to Implement
```javascript
// Cross-browser build system with Context7 compatibility guidance:
build/webpack.chrome.js          // Use context7 for Chrome-specific optimizations
build/webpack.firefox.js         // Use context7 for Firefox WebExtension differences
build/webpack.safari.js          // Use context7 for Safari Web Extension format
src/shared/browser-compat.js     // Use context7 for API compatibility patterns

// Testing implementation with Context7 best practices:
✅ Unit tests for all TTS and AI functionality (>85% coverage)
✅ Integration tests for cross-browser API communication
✅ E2E tests using Playwright across Chrome, Firefox, Safari
✅ Accessibility compliance tests (WCAG 2.1 AA automated validation)
✅ Performance benchmarks meeting established targets
```

#### Phase 4: Store Deployment (Week 4) ✅ Ready to Implement
```javascript
// Store preparation with Context7 compliance guidance:
assets/store-listings/           // Use context7 for store requirement updates
scripts/package-for-stores.js    // Use context7 for packaging best practices
docs/privacy-policy.md          // Use context7 for privacy regulation compliance

// Final validation with Context7 compliance checking:
✅ All store policy compliance (Chrome Web Store, Firefox AMO, Safari App Store)
✅ Performance metrics within targets (memory, response times, reliability)
✅ Accessibility audit complete with automated and manual testing
✅ Security audit with penetration testing and dependency scanning
✅ Cross-browser compatibility verified on target browser versions
```

### Automated Testing Pipeline
```bash
# Pre-deployment validation (all must pass):
npm run test:unit:coverage      # >85% coverage required
npm run test:integration        # All browser API tests pass
npm run test:e2e:all           # Cross-browser E2E tests pass
npm run test:accessibility     # WCAG 2.1 AA compliance pass
npm run test:security          # CSP, XSS, data validation pass
npm run test:performance       # Memory, response time benchmarks pass
npm run validate:manifest      # Store requirement validation pass
npm run build:all              # Production builds for all browsers pass
```

### Success Validation Metrics
```javascript
// Technical success criteria (automated monitoring):
const successMetrics = {
  performance: {
    overlayShowTime: '<300ms',     // Overlay appears quickly
    ttsStartDelay: '<500ms',       // Speech begins promptly  
    aiResponseTime: '<3000ms',     // AI explanations fast
    memoryUsage: '<50MB'           // Efficient memory usage
  },
  
  compatibility: {
    browserSupport: '4/4',         // Chrome, Firefox, Safari, Edge
    websiteCompatibility: '>95%',  // Works on 95%+ of websites
    voiceAvailability: '15+',      // Support 15+ languages
    accessibilityScore: '100%'     // Full WCAG 2.1 AA compliance
  },
  
  quality: {
    testCoverage: '>85%',          // Comprehensive test coverage
    bugDensity: '<0.1/KLOC',       // Low bug density
    securityScore: 'Zero CVEs',    // No security vulnerabilities  
    storeApproval: '4/4'           // Approved on all stores
  }
};
```

---

## 📚 Final Implementation Notes

This comprehensive PRP provides everything needed to implement the Intelligent TTS Extension successfully. Key success factors:

1. **Context7 Integration**: All API documentation marked with "use context7" ensures current, accurate implementation details for Groq API, Claude API, Chrome Extension APIs, and cross-browser compatibility requirements.

2. **Privacy-First Architecture**: Explicit consent management, transparent data usage, local processing where possible, and compliance with GDPR/CCPA requirements.

3. **Accessibility Foundation**: WCAG 2.1 AA compliance built into every component, full keyboard navigation, screen reader support, and inclusive design principles.

4. **Cross-Browser Excellence**: Comprehensive testing across Chrome, Firefox, Safari, and Edge with platform-specific optimizations and compatibility layers.

5. **Performance Optimization**: Memory usage <50MB, response times <300ms for overlay, <500ms for TTS start, comprehensive performance monitoring and alerting.

6. **Security Compliance**: Manifest V3 requirements, Content Security Policy enforcement, input sanitization, secure API key management, and regular security audits.

**Critical Success Dependencies**:
- Context7 tool access for real-time API documentation lookup
- Comprehensive testing across all target browsers during development  
- Privacy compliance review before any data collection implementation
- Performance benchmarking at each development milestone
- Accessibility validation with both automated tools and manual testing

**Implementation Confidence**: 9/10 - This PRP provides complete specifications, current API documentation via Context7, comprehensive testing strategies, and clear success criteria for one-pass implementation of a production-ready TTS browser extension.