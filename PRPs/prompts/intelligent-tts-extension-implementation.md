# PRP: Intelligent Text-to-Speech Browser Extension with AI-Powered Explanations

## Metadata
```yaml
template_version: "1.0.0"
ai_optimization: "claude-4-compatible"
methodology: "test-driven-development"
architecture: "browser-extension-mvc"
extension_type: "text-to-speech"
manifest_version: "v3"
compliance: ["manifest-v3", "csp", "privacy-focused", "accessibility", "cross-browser"]
created: "2025-01-27"
feature_scope: "complete-tts-extension-implementation"
confidence_score: 9
```

## 📋 TTS Extension Feature Definition

### Goal Statement
**SMART Goal**: Build a production-ready, cross-browser text-to-speech extension that supports Chrome, Firefox, Safari, and Edge with AI-powered explanations, achieving 95% website compatibility, <300ms overlay response time, WCAG 2.1 AA accessibility compliance, and successful submission to all browser extension stores within 4 weeks.

**Business Context**: Address the growing need for web accessibility by providing intelligent text-to-speech functionality that not only reads content aloud but also provides AI-generated explanations to enhance comprehension for users with reading difficulties, visual impairments, language barriers, or learning differences.

**Technical Scope**: Manifest V3 compliant browser extension with Web Speech API integration, multi-provider AI service integration (Groq free tier, Claude API fallback), privacy-first design with explicit user consent, comprehensive cross-browser compatibility, and full accessibility support.

### Why (TTS Feature Justification)
- **Accessibility Value**: Serves 285 million visually impaired users globally, plus millions with dyslexia, ADHD, and reading difficulties
- **User Experience**: Enables multitasking (listening while working), language learning support, and improved content comprehension through AI explanations
- **Market Opportunity**: $1.5B assistive technology market growing 7.2% annually, with increased focus on digital accessibility compliance
- **Technology Advantage**: Leverages modern Web Speech API (93% browser support), free AI models (Groq), and Manifest V3 security model
- **Privacy Leadership**: User-controlled data with transparent AI usage, no tracking, local processing where possible

### What (TTS Functional Requirements)

**Primary TTS Features**:
- Universal text selection and speech synthesis with 15+ natural voices
- Cross-browser compatibility (Chrome 88+, Firefox 78+, Safari 14+, Edge 88+)
- Voice customization (rate: 0.1-10, pitch: 0-2, volume: 0-1, language selection)
- Smart overlay with play/pause/stop controls and progress indication
- Accessibility compliance (keyboard navigation, screen reader support, ARIA labels)

**AI-Enhanced Features**:
- Intelligent text explanations using Groq API (free tier: 100 requests/hour)
- Claude API fallback for premium explanations (60 requests/minute)
- Context-aware content processing with privacy-first consent system
- Multi-language support with appropriate AI model selection
- Local fallback for offline functionality

**Secondary Features**:
- Text highlighting synchronized with speech playback
- Speech queue management for multiple text selections
- Extension settings with import/export capability
- Reading progress tracking and bookmarking
- Customizable keyboard shortcuts

**Non-Functional Requirements**:
- **Performance**: Overlay appears <300ms, TTS starts <500ms, AI explanations <3s
- **Security**: Manifest V3 compliance, strict CSP, no inline scripts, secure API key storage
- **Accessibility**: WCAG 2.1 AA compliance, full keyboard navigation, screen reader compatibility
- **Reliability**: 95% website compatibility, graceful error handling, offline core functionality
- **Privacy**: No data collection without consent, transparent AI usage, local settings storage
- **Memory**: Extension usage <50MB, no memory leaks, efficient garbage collection

### Success Criteria & KPIs

**Technical Metrics**:
- [ ] **Performance**: Overlay response time <300ms (95th percentile)
- [ ] **Cross-Browser**: Compatible with Chrome 88+, Firefox 78+, Safari 14+, Edge 88+
- [ ] **Security**: Zero CSP violations, Manifest V3 compliant, security audit passed
- [ ] **Quality**: Test coverage >85%, all cross-browser E2E tests passing
- [ ] **Accessibility**: WCAG 2.1 AA compliance verified, keyboard navigation score 100%

**User Experience Metrics**:
- [ ] **Usability**: <2 clicks to start TTS, intuitive overlay design
- [ ] **Reliability**: TTS success rate >95% across supported browsers
- [ ] **AI Integration**: Explanation generation within 3 seconds
- [ ] **Memory Efficiency**: Extension memory usage <50MB during active use
- [ ] **Voice Quality**: Support for 15+ languages with appropriate voice selection

## 📚 Comprehensive Context Repository

### Required Documentation & References

#### AI Service Integration
**Groq API**: use context7 to fetch current Groq API documentation for:
- Authentication methods (Bearer token) and API key format
- Rate limiting (100 requests/hour for free tier, daily quota)
- Model availability (llama-3.3-70b-versatile, llama3-8b-8192, gemma2-9b-it)
- Request/response format and comprehensive error handling
- Pricing and usage quotas for free and paid tiers

**Claude API**: use context7 to get latest Claude API specifications for:
- Authentication (x-api-key header) and API key management
- Message format and conversation structure for explanations
- Rate limits (tier-based: 60 RPM for lower tiers, 4000 RPM for Tier 4)
- Model capabilities (claude-3-haiku-20240307 for cost-effective explanations)
- Content policies, safety guidelines, and acceptable use policies

#### Browser Extension APIs
**Chrome Extension APIs**: use context7 for Manifest V3 requirements:
- Service worker limitations and best practices
- chrome.storage API quotas (sync: 102,400 bytes, local: 10MB)
- Content script injection patterns and CSP compliance
- Cross-origin request policies for AI API calls
- Extension permissions and host_permissions requirements

**Web Speech API**: use context7 for browser compatibility:
- speechSynthesis availability across browsers (Chrome 33+, Firefox 49+, Safari 7+)
- Voice availability and language support per platform
- Platform-specific voice characteristics and limitations
- Browser-specific rate and pitch limitations
- Known issues (Chrome 15-second timeout on Windows)

#### Cross-Browser Compatibility
**Firefox Extensions**: use context7 for WebExtension standards:
- Manifest V2/V3 differences and migration timeline
- Browser API polyfill requirements (webextension-polyfill)
- Firefox-specific voice handling and onvoiceschanged event
- AMO (addons.mozilla.org) submission requirements

**Safari Extensions**: use context7 for Safari-specific requirements:
- Safari Web Extension format and xcrun conversion process
- macOS/iOS voice integration patterns
- Safari-specific permissions and privacy requirements
- Mac App Store submission process for Safari extensions

### Current System Architecture

```bash
# Current Project Structure Analysis
textToSpeachExt/
├── 📚 Documentation (Complete)
│   ├── CLAUDE.md - Development guide with critical requirements
│   ├── README.md - 945-line comprehensive project overview  
│   ├── INITIAL.md - Feature requirements and implementation examples
│   └── docs/
│       ├── development-guide.md - Technical reference
│       ├── implementation-examples.md - Code patterns
│       └── project-structure.md - Architecture details
├── ⚙️ Configuration (Complete)
│   ├── package.json - Full dependency & script setup (71 scripts)
│   ├── .env - 260+ lines of environment configuration
│   └── .claude/ - AI development infrastructure
│       ├── agents/ - Specialized AI agents
│       ├── commands/ - Development workflow commands
│       ├── hooks/ - 11+ validation and security hooks
│       └── examples/ - 16 production-ready code examples
├── 🔍 Examples (Rich Library - Ready for Reference)
│   ├── ai/ - Groq & Claude API clients with rate limiting
│   ├── extension/ - Manifest V3 templates and browser compatibility
│   ├── tts/ - 835-line speech synthesis service
│   └── ui/ - Smart overlay with accessibility support
└── ❌ Implementation (NEEDS CREATION)
    ├── src/ - NO SOURCE CODE EXISTS YET
    ├── build/ - NO BUILD CONFIGS YET
    └── tests/ - NO TEST SUITE YET
```

### Target Architecture with New Components

```bash
# Browser Extension Architecture (Manifest V3) - TO BE CREATED
src/
├── background/               # Service Worker (Manifest V3)
│   ├── service-worker.js    # Main background script
│   ├── ai-service.js        # Multi-provider AI integration (Groq → Claude → Local)
│   ├── storage-service.js   # Secure settings and API key management
│   ├── message-handler.js   # Cross-context communication
│   └── rate-limiter.js      # API rate limiting and usage tracking
├── content/                 # Content Scripts
│   ├── content-script.js    # Main content script entry point
│   ├── text-selector.js     # Text selection handling with sanitization
│   ├── overlay-manager.js   # TTS overlay UI lifecycle management
│   ├── tts-controller.js    # Speech synthesis control with error handling
│   └── privacy-consent.js   # User consent dialogs for AI services
├── popup/                   # Extension Popup
│   ├── popup.html          # Toolbar popup interface
│   ├── popup.js            # Popup logic and settings access
│   ├── popup.css           # Popup styling with accessibility
│   └── api-key-setup.js    # Secure API key configuration
├── options/                 # Options Page
│   ├── options.html        # Comprehensive settings page
│   ├── options.js          # Settings logic with validation
│   ├── options.css         # Settings styling
│   └── voice-tester.js     # Voice preview and testing
├── shared/                  # Shared Utilities
│   ├── browser-compat.js   # Cross-browser API compatibility layer
│   ├── error-handler.js    # Global error handling and reporting
│   ├── logger.js           # Debug logging with privacy compliance
│   ├── constants.js        # Configuration constants
│   └── utils.js            # Common utilities and helpers
├── assets/                  # Static Assets
│   ├── icons/              # Extension icons (16x16 to 512x512)
│   ├── images/             # UI images and graphics
│   └── sounds/             # Audio feedback (optional)
└── _locales/               # Internationalization
    ├── en/messages.json    # English strings
    ├── ur/messages.json    # Urdu strings
    ├── ar/messages.json    # Arabic strings
    └── [15+ more languages]

# Build System - TO BE CREATED
build/
├── webpack.chrome.js       # Chrome-specific build configuration
├── webpack.firefox.js      # Firefox WebExtension build
├── webpack.safari.js       # Safari extension build
└── webpack.common.js       # Shared build configuration

# Testing Suite - TO BE CREATED  
tests/
├── unit/                   # Unit tests (>85% coverage required)
├── integration/            # Extension context integration tests
├── e2e/                   # Cross-browser E2E tests (Playwright)
├── accessibility/          # WCAG 2.1 AA compliance tests
└── security/              # CSP, XSS, and privacy tests
```

### Critical Codebase Knowledge & Extension Constraints

```javascript
// MANIFEST V3 GOTCHAS - CRITICAL IMPLEMENTATION REQUIREMENTS
// NO inline scripts allowed - all scripts must be in separate files
// BAD: <script>inline code</script> or onclick="handler()"
// GOOD: <script src="script.js"></script> and addEventListener

// SERVICE WORKER PATTERNS (background/service-worker.js)
// Background scripts are service workers in Manifest V3
// Service workers can be terminated - use chrome.storage for persistence
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TTS_REQUEST') {
    handleTTSRequest(message.data).then(sendResponse);
    return true; // Keep message channel open for async response
  }
  if (message.type === 'AI_EXPLANATION_REQUEST') {
    handleAIExplanation(message.text, message.context).then(sendResponse);
    return true;
  }
});

// CONTENT SCRIPT COMMUNICATION (content/content-script.js)
// Content scripts communicate via message passing
const requestAIExplanation = async (selectedText, pageContext) => {
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'AI_EXPLANATION_REQUEST',
      text: selectedText,
      context: pageContext,
      userConsent: await getConsentStatus()
    });
    return response;
  } catch (error) {
    if (error.message.includes('Extension context invalidated')) {
      // Extension was reloaded/disabled - reload page
      window.location.reload();
    }
    throw error;
  }
};

// CSP COMPLIANCE - CRITICAL SECURITY REQUIREMENTS
// NO eval(), no inline event handlers, no external script loading
// GOOD: All event handlers via addEventListener
element.addEventListener('click', handleClick);
element.addEventListener('keydown', handleKeyboard);

// TTS API CONSTRAINTS - CRITICAL BROWSER LIMITATIONS
// speechSynthesis can be paused by browser - implement recovery
const createUtterance = (text, options) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = options.rate || 1.0;
  utterance.pitch = options.pitch || 1.0;
  utterance.volume = options.volume || 1.0;
  
  // Chrome Windows: 15-second timeout workaround
  if (text.length > 200 && /Windows|Win/.test(navigator.userAgent)) {
    return splitTextForChunking(text, options);
  }
  
  utterance.onerror = (event) => {
    console.error('TTS Error:', event.error);
    // Implement fallback or retry logic
    handleTTSError(event.error, text, options);
  };
  
  return utterance;
};

// CROSS-BROWSER COMPATIBILITY - API NAMESPACE HANDLING
const getBrowserAPI = () => {
  // Firefox uses browser.* API, Chrome uses chrome.*
  return typeof browser !== 'undefined' ? browser : chrome;
};

// MEMORY MANAGEMENT - PREVENT MEMORY LEAKS
class OverlayManager {
  constructor() {
    this.cleanup = [];
    this.activeUtterances = new Set();
  }
  
  addCleanup(cleanupFn) {
    this.cleanup.push(cleanupFn);
  }
  
  destroy() {
    // Stop all active speech
    this.activeUtterances.forEach(utterance => {
      speechSynthesis.cancel();
    });
    
    // Run all cleanup functions
    this.cleanup.forEach(fn => fn());
    this.cleanup = [];
    this.activeUtterances.clear();
  }
}

// PRIVACY COMPLIANCE - EXPLICIT CONSENT MANAGEMENT
const getConsentForAIService = async () => {
  const stored = await chrome.storage.sync.get(['aiServiceConsent']);
  if (stored.aiServiceConsent) {
    return stored.aiServiceConsent;
  }
  
  // Show consent dialog
  const consent = await showConsentDialog();
  if (consent.granted) {
    await chrome.storage.sync.set({ 
      aiServiceConsent: {
        granted: true,
        timestamp: Date.now(),
        services: consent.services
      }
    });
  }
  
  return consent;
};

// PERFORMANCE OPTIMIZATION
// Use requestIdleCallback for non-critical operations
const performBackgroundTask = (task) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(task);
  } else {
    setTimeout(task, 1);
  }
};

// API RATE LIMITING - CRITICAL FOR AI SERVICES
class RateLimiter {
  constructor(requests, windowMs) {
    this.requests = requests;
    this.windowMs = windowMs;
    this.calls = [];
  }
  
  async checkLimit() {
    const now = Date.now();
    this.calls = this.calls.filter(time => now - time < this.windowMs);
    
    if (this.calls.length >= this.requests) {
      const oldestCall = Math.min(...this.calls);
      const waitTime = this.windowMs - (now - oldestCall);
      throw new Error(`Rate limit exceeded. Wait ${Math.ceil(waitTime / 1000)}s`);
    }
    
    this.calls.push(now);
  }
}

// Groq: 100 requests/hour
const groqLimiter = new RateLimiter(100, 60 * 60 * 1000);
// Claude: 60 requests/minute (typical for paid tiers)
const claudeLimiter = new RateLimiter(60, 60 * 1000);
```

## 🏗️ Implementation Blueprint

### Implementation Task List

```yaml
Phase 1: Foundation & Core TTS (Week 1)
  Task 1: Project Structure Setup
    CREATE src/manifest.json:
      - Define Manifest V3 configuration
      - Set permissions (storage, activeTab, scripting)
      - Configure host_permissions for AI APIs
      - Add web_accessible_resources for overlay
    
    CREATE build/webpack.*.js files:
      - Chrome/Edge build configuration
      - Firefox WebExtension build configuration  
      - Safari extension build configuration
      - Common build configuration with optimization

  Task 2: Service Worker Implementation
    CREATE src/background/service-worker.js:
      - Message handling for TTS and AI requests
      - API key management and secure storage
      - Rate limiting for AI services
      - Error handling and recovery logic
    
    CREATE src/background/ai-service.js:
      - Multi-provider integration (Groq → Claude → Local)
      - Request formatting and response parsing
      - Fallback logic and error recovery
      - Usage tracking and quota management

  Task 3: Content Script Core
    CREATE src/content/content-script.js:
      - Text selection detection and validation
      - DOM manipulation with CSP compliance
      - Message passing with background script
      - Extension lifecycle management
    
    CREATE src/content/text-selector.js:
      - Robust text selection across DOM structures
      - Content sanitization and XSS prevention
      - iframe and shadow DOM handling
      - Context extraction for AI services

  Task 4: TTS Service Implementation
    CREATE src/shared/tts-service.js:
      - Cross-browser Web Speech API wrapper
      - Voice enumeration and selection logic
      - Rate/pitch/volume control with validation
      - Error handling and recovery mechanisms
      - Chrome Windows timeout workaround
    
    CREATE src/content/tts-controller.js:
      - Speech synthesis control and coordination
      - Queue management for multiple requests
      - Progress tracking and text highlighting
      - Playback state management

  Task 5: UI Overlay System
    CREATE src/content/overlay-manager.js:
      - Smart overlay positioning with viewport detection
      - Touch-optimized controls for mobile
      - Keyboard navigation and focus management
      - ARIA labels and accessibility attributes
      - Responsive design with theme support

Phase 2: AI Integration & Privacy (Week 2)
  Task 6: Privacy Management
    CREATE src/content/privacy-consent.js:
      - Consent dialog UI with clear explanations
      - Consent storage and validation
      - Service-specific permission management
      - Data minimization and transparency
    
    CREATE src/shared/privacy-manager.js:
      - Privacy policy compliance
      - Data deletion and export capabilities
      - Consent withdrawal mechanisms
      - Audit trail for privacy compliance

  Task 7: Multi-Provider AI Integration
    ENHANCE src/background/ai-service.js:
      - Groq API integration with free tier limits
      - Claude API fallback with paid tier features
      - Local processing fallback for offline use
      - Response quality assessment and routing
    
    CREATE src/background/rate-limiter.js:
      - Per-service rate limiting (Groq: 100/hr, Claude: 60/min)
      - Usage tracking and quota management
      - Graceful degradation on limit exceeded
      - User notification for quota status

  Task 8: Settings and Configuration
    CREATE src/popup/popup.html + popup.js:
      - Extension toolbar interface
      - Quick settings access
      - API key configuration with security
      - Usage statistics and quota display
    
    CREATE src/options/options.html + options.js:
      - Comprehensive settings page
      - Voice testing and preview
      - Privacy settings and consent management
      - Settings import/export functionality

Phase 3: Cross-Browser & Testing (Week 3)
  Task 9: Cross-Browser Compatibility
    CREATE src/shared/browser-compat.js:
      - API namespace handling (chrome vs browser)
      - Promise polyfills for Chrome callbacks
      - Feature detection for browser capabilities
      - Browser-specific workarounds and fixes
    
    UPDATE manifest files for each browser:
      - Chrome Manifest V3 configuration
      - Firefox Manifest V2/V3 with gecko settings
      - Safari extension manifest conversion

  Task 10: Comprehensive Testing Suite
    CREATE tests/unit/ directory:
      - TTS service unit tests with mock speechSynthesis
      - AI service unit tests with mocked API responses
      - Privacy manager unit tests with consent scenarios
      - Utility function tests with edge cases
    
    CREATE tests/integration/ directory:
      - Extension messaging integration tests
      - Storage service persistence tests
      - AI service integration tests with real APIs
      - Cross-context communication tests
    
    CREATE tests/e2e/ directory:
      - Cross-browser E2E tests with Playwright
      - User workflow tests (select → TTS → explain)
      - Settings persistence and import/export tests
      - Accessibility compliance tests

  Task 11: Security and Performance Validation
    CREATE tests/security/ directory:
      - CSP compliance validation
      - XSS prevention tests
      - API input sanitization tests
      - Extension isolation tests
    
    CREATE tests/performance/ directory:
      - Memory usage benchmarks
      - Response time measurements
      - Concurrent request handling
      - Large text processing performance

Phase 4: Polish & Store Submission (Week 4)
  Task 12: Accessibility Compliance
    ENHANCE all UI components:
      - WCAG 2.1 AA compliance verification
      - Screen reader compatibility testing
      - Keyboard navigation optimization
      - High contrast theme support
      - Language and cultural preferences

  Task 13: Store Submission Preparation
    CREATE assets/ directory:
      - Icon sets for all stores (16x16 to 512x512)
      - Screenshots and promotional materials
      - Store listing descriptions and metadata
      - Privacy policy and terms of service
    
    CREATE documentation:
      - User guide and help documentation
      - Developer API documentation
      - Troubleshooting and FAQ
      - Security and privacy documentation

  Task 14: Final Quality Assurance
    RUN comprehensive validation:
      - All automated tests passing (>85% coverage)
      - Manual testing on all target browsers
      - Accessibility audit with real users
      - Security penetration testing
      - Performance benchmarking and optimization
```

### Per Task Implementation Details

#### Task 1: Manifest V3 Configuration (src/manifest.json)
```json
{
  "manifest_version": 3,
  "name": "Intelligent TTS Extension",
  "version": "1.0.0",
  "description": "AI-powered text-to-speech with intelligent explanations for enhanced web accessibility",
  
  "permissions": [
    "storage",           // Settings and API key storage
    "activeTab",         // Access to current tab content
    "scripting"          // Content script injection
  ],
  
  "host_permissions": [
    "https://api.groq.com/*",      // Groq API access
    "https://api.anthropic.com/*"   // Claude API access
  ],
  
  "background": {
    "service_worker": "background/service-worker.js"
  },
  
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content/content-script.js"],
    "css": ["content/overlay.css"],
    "run_at": "document_idle"
  }],
  
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": {
      "16": "assets/icons/icon16.png",
      "32": "assets/icons/icon32.png",
      "48": "assets/icons/icon48.png",
      "128": "assets/icons/icon128.png"
    }
  },
  
  "options_page": "options/options.html",
  
  "web_accessible_resources": [{
    "resources": [
      "content/overlay.html",
      "assets/icons/*",
      "assets/images/*"
    ],
    "matches": ["<all_urls>"]
  }],
  
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

#### Task 2: Service Worker Implementation (src/background/service-worker.js)
```javascript
// Service Worker - Background Script for Manifest V3
import { AIService } from './ai-service.js';
import { StorageService } from '../shared/storage-service.js';
import { RateLimiter } from './rate-limiter.js';

class TTSBackgroundService {
  constructor() {
    this.aiService = new AIService();
    this.storage = new StorageService();
    this.groqLimiter = new RateLimiter(100, 60 * 60 * 1000); // 100/hour
    this.claudeLimiter = new RateLimiter(60, 60 * 1000);     // 60/minute
    
    this.setupMessageHandlers();
  }
  
  setupMessageHandlers() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.type) {
        case 'TTS_REQUEST':
          this.handleTTSRequest(message.data).then(sendResponse);
          return true; // Keep channel open for async response
          
        case 'AI_EXPLANATION_REQUEST':
          this.handleAIExplanation(message.text, message.context).then(sendResponse);
          return true;
          
        case 'STORE_API_KEY':
          this.handleAPIKeyStorage(message.service, message.key).then(sendResponse);
          return true;
          
        case 'GET_SETTINGS':
          this.storage.getSettings().then(sendResponse);
          return true;
          
        default:
          sendResponse({ error: 'Unknown message type' });
      }
    });
  }
  
  async handleTTSRequest(data) {
    try {
      // Validate input
      if (!data.text || data.text.length === 0) {
        throw new Error('No text provided for TTS');
      }
      
      // Sanitize text content
      const sanitizedText = this.sanitizeText(data.text);
      
      // Return TTS configuration
      return {
        success: true,
        text: sanitizedText,
        options: data.options || {},
        utteranceId: this.generateUtteranceId()
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  }
  
  async handleAIExplanation(text, context) {
    try {
      // Check user consent
      const consent = await this.storage.getConsentStatus();
      if (!consent.granted) {
        throw new Error('AI service consent required');
      }
      
      // Try providers in order: Groq → Claude → Local
      const providers = [
        { name: 'groq', limiter: this.groqLimiter },
        { name: 'claude', limiter: this.claudeLimiter }
      ];
      
      for (const provider of providers) {
        try {
          await provider.limiter.checkLimit();
          const explanation = await this.aiService.explainText(
            text, 
            context, 
            provider.name
          );
          
          return {
            success: true,
            explanation: explanation.content,
            provider: provider.name,
            examples: explanation.examples || [],
            complexity: explanation.complexity || 'unknown'
          };
        } catch (error) {
          console.warn(`${provider.name} failed:`, error);
          continue;
        }
      }
      
      // All providers failed - return local fallback
      return {
        success: true,
        explanation: this.generateLocalFallback(text),
        provider: 'local',
        examples: [],
        complexity: 'unknown'
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  sanitizeText(text) {
    // Remove HTML tags and normalize whitespace
    return text
      .replace(/<[^>]*>/g, '')              // Remove HTML tags
      .replace(/&[^;]+;/g, ' ')             // Remove HTML entities
      .replace(/\s+/g, ' ')                 // Normalize whitespace
      .trim();
  }
  
  generateUtteranceId() {
    return `tts_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  generateLocalFallback(text) {
    const wordCount = text.split(' ').length;
    if (wordCount < 10) {
      return "This is a short text selection.";
    } else if (wordCount < 50) {
      return "This appears to be a paragraph or brief section of text.";
    } else {
      return "This is a longer text selection that may contain multiple ideas or concepts.";
    }
  }
}

// Initialize background service
const backgroundService = new TTSBackgroundService();

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Open welcome page
    chrome.tabs.create({
      url: chrome.runtime.getURL('options/options.html?welcome=true')
    });
  }
});
```

#### Task 3: Multi-Provider AI Service (src/background/ai-service.js)
```javascript
// Multi-Provider AI Integration Service
export class AIService {
  constructor() {
    this.providers = {
      groq: {
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        model: 'llama-3.3-70b-versatile',
        maxTokens: 500
      },
      claude: {
        endpoint: 'https://api.anthropic.com/v1/messages', 
        model: 'claude-3-haiku-20240307',
        maxTokens: 400
      }
    };
  }
  
  async explainText(text, context, provider = 'groq') {
    const apiKey = await this.getAPIKey(provider);
    if (!apiKey) {
      throw new Error(`${provider} API key not configured`);
    }
    
    switch (provider) {
      case 'groq':
        return this.callGroqAPI(text, context, apiKey);
      case 'claude':
        return this.callClaudeAPI(text, context, apiKey);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }
  
  async callGroqAPI(text, context, apiKey) {
    const response = await fetch(this.providers.groq.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.providers.groq.model,
        messages: [
          {
            role: 'system',
            content: 'Provide a clear, concise explanation suitable for text-to-speech. Include 1-2 simple examples if helpful.'
          },
          {
            role: 'user',
            content: `Explain this text: "${text}"\n\nContext: ${context}`
          }
        ],
        max_tokens: this.providers.groq.maxTokens,
        temperature: 0.3
      })
    });
    
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Try again later.');
      }
      throw new Error(`Groq API error: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      provider: 'groq',
      usage: data.usage
    };
  }
  
  async callClaudeAPI(text, context, apiKey) {
    const response = await fetch(this.providers.claude.endpoint, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.providers.claude.model,
        max_tokens: this.providers.claude.maxTokens,
        messages: [
          {
            role: 'user',
            content: `Provide a clear explanation of this text for text-to-speech reading:\n\n"${text}"\n\nContext: ${context}\n\nKeep the explanation conversational and include examples if helpful.`
          }
        ]
      })
    });
    
    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      content: data.content[0].text,
      provider: 'claude',
      usage: data.usage
    };
  }
  
  async getAPIKey(provider) {
    const result = await chrome.storage.sync.get([`${provider}ApiKey`]);
    return result[`${provider}ApiKey`];
  }
}
```

### Integration Points

```yaml
BROWSER_APIS:
  manifest_v3: "Service worker background script with proper CSP"
  storage_api: "Secure API key storage with chrome.storage.sync (102KB limit)"
  messaging: "Cross-context communication between content/background"
  permissions: "Minimal permissions with host_permissions for AI APIs"

AI_SERVICES:
  groq_integration:
    endpoint: "https://api.groq.com/openai/v1/chat/completions"
    rate_limit: "100 requests/hour for free tier"
    model: "llama-3.3-70b-versatile (recommended for explanations)"
    authentication: "Bearer token in Authorization header"
  
  claude_integration:
    endpoint: "https://api.anthropic.com/v1/messages"
    rate_limit: "60 requests/minute (tier-dependent)"
    model: "claude-3-haiku-20240307 (cost-effective)"
    authentication: "x-api-key header with API key"

WEB_SPEECH_API:
  browser_support: "Chrome 33+, Firefox 49+, Safari 7+, Edge 14+ (93.45% global)"
  voice_loading: "Firefox/Safari need onvoiceschanged event handler"
  limitations: "Chrome Windows 15-second timeout requires text chunking"
  error_handling: "Network errors, voice unavailable, speech interrupted"

CROSS_BROWSER:
  chrome_manifest_v3: "Modern extension format with service workers"
  firefox_webext: "Manifest V2/V3 support with browser.* API namespace"
  safari_extension: "Requires xcrun conversion and App Store submission"
  api_polyfill: "webextension-polyfill for unified API access"
```

## 🧪 Comprehensive Testing Strategy

### Level 1: Unit Tests (85%+ Coverage Required)

```javascript
// tests/unit/tts-service.test.js
describe('TTSService', () => {
  let ttsService;
  let mockSpeechSynthesis;
  
  beforeEach(() => {
    // Mock Web Speech API
    mockSpeechSynthesis = {
      speak: jest.fn(),
      cancel: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      getVoices: jest.fn(() => [
        { name: 'Google US English', lang: 'en-US', localService: true },
        { name: 'Microsoft Zira', lang: 'en-US', localService: true }
      ])
    };
    
    global.speechSynthesis = mockSpeechSynthesis;
    global.SpeechSynthesisUtterance = jest.fn().mockImplementation((text) => ({
      text,
      rate: 1,
      pitch: 1,
      volume: 1,
      voice: null,
      onstart: null,
      onend: null,
      onerror: null
    }));
    
    ttsService = new TTSService();
  });
  
  test('should create valid TTS utterance with default options', () => {
    const text = 'Hello world';
    const utterance = ttsService.createUtterance(text);
    
    expect(SpeechSynthesisUtterance).toHaveBeenCalledWith(text);
    expect(utterance.rate).toBe(1);
    expect(utterance.pitch).toBe(1);
    expect(utterance.volume).toBe(1);
  });
  
  test('should apply custom voice options', () => {
    const text = 'Test text';
    const options = { rate: 1.5, pitch: 1.2, volume: 0.8 };
    const utterance = ttsService.createUtterance(text, options);
    
    expect(utterance.rate).toBe(1.5);
    expect(utterance.pitch).toBe(1.2);
    expect(utterance.volume).toBe(0.8);
  });
  
  test('should validate text input', () => {
    expect(() => {
      ttsService.createUtterance('');
    }).toThrow('Text cannot be empty');
    
    expect(() => {
      ttsService.createUtterance(null);
    }).toThrow('Text must be a string');
  });
  
  test('should handle speech synthesis errors', async () => {
    const errorHandler = jest.fn();
    ttsService.onError = errorHandler;
    
    const utterance = ttsService.createUtterance('test text');
    
    // Simulate error event
    utterance.onerror({ error: 'network' });
    
    expect(errorHandler).toHaveBeenCalledWith('network', 'test text');
  });
  
  test('should select appropriate voice for language', async () => {
    const voices = [
      { name: 'Google US English', lang: 'en-US', localService: true },
      { name: 'Google UK English', lang: 'en-GB', localService: true },
      { name: 'Microsoft Spanish', lang: 'es-ES', localService: true }
    ];
    
    mockSpeechSynthesis.getVoices.mockReturnValue(voices);
    
    const selectedVoice = await ttsService.selectVoice('es');
    expect(selectedVoice.lang).toBe('es-ES');
  });
  
  test('should chunk long text for Chrome Windows workaround', () => {
    // Mock Chrome on Windows
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Chrome/120.0.0.0 Windows NT 10.0',
      configurable: true
    });
    
    const longText = 'Lorem ipsum '.repeat(50); // 550 characters
    const chunks = ttsService.chunkText(longText);
    
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every(chunk => chunk.length <= 200)).toBe(true);
  });
});

// tests/unit/ai-service.test.js
describe('AIService', () => {
  let aiService;
  let mockFetch;
  
  beforeEach(() => {
    mockFetch = jest.fn();
    global.fetch = mockFetch;
    aiService = new AIService();
    
    // Mock chrome storage
    global.chrome = {
      storage: {
        sync: {
          get: jest.fn().mockResolvedValue({ groqApiKey: 'test-key' })
        }
      }
    };
  });
  
  test('should explain text using Groq API', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: 'This is a simple explanation of the text.'
        }
      }],
      usage: { total_tokens: 150 }
    };
    
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });
    
    const result = await aiService.explainText('Complex technical text', 'article');
    
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.groq.com/openai/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-key'
        })
      })
    );
    
    expect(result.content).toBe('This is a simple explanation of the text.');
    expect(result.provider).toBe('groq');
  });
  
  test('should handle API rate limiting', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 429,
      json: () => Promise.resolve({ error: 'Rate limit exceeded' })
    });
    
    await expect(aiService.explainText('test', 'context'))
      .rejects.toThrow('Rate limit exceeded');
  });
  
  test('should sanitize input text', () => {
    const maliciousText = '<script>alert("xss")</script>Normal text';
    const sanitized = aiService.sanitizeInput(maliciousText);
    
    expect(sanitized).toBe('Normal text');
    expect(sanitized).not.toContain('<script>');
  });
  
  test('should handle missing API key', async () => {
    global.chrome.storage.sync.get.mockResolvedValue({});
    
    await expect(aiService.explainText('test', 'context'))
      .rejects.toThrow('groq API key not configured');
  });
});

// tests/unit/privacy-manager.test.js
describe('PrivacyManager', () => {
  let privacyManager;
  
  beforeEach(() => {
    // Mock chrome storage
    global.chrome = {
      storage: {
        sync: {
          get: jest.fn(),
          set: jest.fn(),
          remove: jest.fn()
        }
      }
    };
    
    privacyManager = new PrivacyManager();
  });
  
  test('should request consent for AI services', async () => {
    global.chrome.storage.sync.get.mockResolvedValue({});
    
    // Mock user consent
    const mockConsent = { granted: true, services: ['groq'], timestamp: Date.now() };
    jest.spyOn(privacyManager, 'showConsentDialog').mockResolvedValue(mockConsent);
    
    const consent = await privacyManager.getConsent();
    
    expect(consent.granted).toBe(true);
    expect(global.chrome.storage.sync.set).toHaveBeenCalledWith({
      aiServiceConsent: mockConsent
    });
  });
  
  test('should respect user consent withdrawal', async () => {
    await privacyManager.withdrawConsent();
    
    expect(global.chrome.storage.sync.remove).toHaveBeenCalledWith(['aiServiceConsent']);
  });
  
  test('should validate stored consent timestamp', async () => {
    const oldConsent = {
      granted: true,
      timestamp: Date.now() - (365 * 24 * 60 * 60 * 1000) // 1 year old
    };
    
    global.chrome.storage.sync.get.mockResolvedValue({ aiServiceConsent: oldConsent });
    
    const isValid = await privacyManager.isConsentValid();
    expect(isValid).toBe(false);
  });
});
```

### Level 2: Integration Tests (Extension Context)

```javascript
// tests/integration/extension-integration.test.js
describe('Extension Integration', () => {
  let extension;
  
  beforeEach(async () => {
    // Load extension in test environment
    extension = await loadExtension('./dist/chrome');
    await extension.waitForReady();
  });
  
  afterEach(async () => {
    if (extension) {
      await extension.unload();
    }
  });
  
  test('should handle content-background messaging', async () => {
    const testPage = await extension.newTab('data:text/html,<p>Test content</p>');
    
    // Content script sends TTS request to background
    const response = await testPage.evaluate(() => {
      return chrome.runtime.sendMessage({
        type: 'TTS_REQUEST',
        data: {
          text: 'Hello world test',
          options: { rate: 1.2 }
        }
      });
    });
    
    expect(response.success).toBe(true);
    expect(response.text).toBe('Hello world test');
    expect(response.utteranceId).toBeDefined();
  });
  
  test('should persist settings across sessions', async () => {
    const settings = { 
      rate: 1.5, 
      pitch: 1.2, 
      language: 'en-US',
      preferredVoice: 'Google US English'
    };
    
    // Set settings
    await extension.storage.set('ttsSettings', settings);
    
    // Simulate extension restart
    await extension.restart();
    
    // Retrieve settings
    const retrievedSettings = await extension.storage.get('ttsSettings');
    expect(retrievedSettings).toEqual(settings);
  });
  
  test('should handle AI service integration end-to-end', async () => {
    // Mock AI API response
    const mockResponse = {
      explanation: 'This is a test explanation from AI service',
      examples: ['Example 1', 'Example 2'],
      complexity: 'intermediate'
    };
    
    await extension.mockAPIResponse('/api/explain', mockResponse);
    
    const testPage = await extension.newTab('data:text/html,<p>Complex technical content</p>');
    
    // Request AI explanation
    const result = await testPage.evaluate(() => {
      return chrome.runtime.sendMessage({
        type: 'AI_EXPLANATION_REQUEST',
        text: 'Complex technical content',
        context: 'test-context'
      });
    });
    
    expect(result.success).toBe(true);
    expect(result.explanation).toBe('This is a test explanation from AI service');
    expect(result.examples).toHaveLength(2);
  });
  
  test('should validate content script injection', async () => {
    const testPage = await extension.newTab('https://example.com');
    
    // Wait for content script injection
    await testPage.waitForFunction(() => {
      return typeof window.ttsExtension !== 'undefined';
    });
    
    const isInjected = await testPage.evaluate(() => {
      return {
        ttsExtension: typeof window.ttsExtension !== 'undefined',
        textSelector: typeof window.ttsExtension?.textSelector !== 'undefined',
        overlayManager: typeof window.ttsExtension?.overlayManager !== 'undefined'
      };
    });
    
    expect(isInjected.ttsExtension).toBe(true);
    expect(isInjected.textSelector).toBe(true);
    expect(isInjected.overlayManager).toBe(true);
  });
  
  test('should handle rate limiting gracefully', async () => {
    // Simulate rate limit exceeded
    await extension.mockAPIResponse('/api/explain', { error: 'Rate limit exceeded' }, 429);
    
    const testPage = await extension.newTab('data:text/html,<p>Test content</p>');
    
    const result = await testPage.evaluate(() => {
      return chrome.runtime.sendMessage({
        type: 'AI_EXPLANATION_REQUEST',
        text: 'Test text',
        context: 'test'
      });
    });
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('Rate limit');
  });
});

// tests/integration/storage-integration.test.js
describe('Storage Integration', () => {
  let storageService;
  
  beforeEach(() => {
    // Mock chrome.storage API
    global.chrome = {
      storage: {
        sync: {
          get: jest.fn(),
          set: jest.fn().mockResolvedValue(undefined),
          remove: jest.fn().mockResolvedValue(undefined),
          clear: jest.fn().mockResolvedValue(undefined),
          getBytesInUse: jest.fn().mockResolvedValue(1024)
        },
        local: {
          get: jest.fn(),
          set: jest.fn().mockResolvedValue(undefined),
          remove: jest.fn().mockResolvedValue(undefined)
        }
      }
    };
    
    storageService = new StorageService();
  });
  
  test('should store and retrieve API keys securely', async () => {
    const apiKey = 'test-api-key-123';
    
    await storageService.storeAPIKey('groq', apiKey);
    
    expect(chrome.storage.sync.set).toHaveBeenCalledWith({
      groqApiKey: apiKey
    });
    
    // Mock retrieval
    chrome.storage.sync.get.mockResolvedValue({ groqApiKey: apiKey });
    const retrieved = await storageService.getAPIKey('groq');
    
    expect(retrieved).toBe(apiKey);
  });
  
  test('should handle storage quota limits', async () => {
    // Mock quota exceeded
    chrome.storage.sync.set.mockRejectedValue(new Error('QUOTA_BYTES_PER_ITEM quota exceeded'));
    
    await expect(
      storageService.storeSettings({ largeData: 'x'.repeat(10000) })
    ).rejects.toThrow('Storage quota exceeded');
  });
  
  test('should migrate legacy settings format', async () => {
    const legacySettings = {
      voice: 'Google US English',
      speed: 1.2 // Old property name
    };
    
    chrome.storage.sync.get.mockResolvedValue({ settings: legacySettings });
    
    const migratedSettings = await storageService.getSettings();
    
    expect(migratedSettings.preferredVoice).toBe('Google US English');
    expect(migratedSettings.rate).toBe(1.2); // Migrated to new property name
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
    
    let extensionId;
    
    test.beforeEach(async ({ context }) => {
      if (browserName === 'chromium') {
        // Load Chrome extension
        const pathToExtension = require('path').join(__dirname, '../dist/chrome');
        extensionId = await context.addExtension(pathToExtension);
      }
      // Note: Firefox and Safari extension loading would require different setup
    });
    
    test('complete TTS workflow with AI explanation', async ({ page }) => {
      // Navigate to test page
      await page.goto('data:text/html,<div id="content">This is a complex quantum physics explanation that needs to be simplified for better understanding.</div>');
      
      // Select text
      await page.locator('#content').selectText();
      
      // Verify TTS overlay appears
      await expect(page.locator('[data-tts-overlay]')).toBeVisible({ timeout: 5000 });
      
      // Verify overlay accessibility
      const overlay = page.locator('[data-tts-overlay]');
      await expect(overlay).toHaveAttribute('role', 'dialog');
      await expect(overlay).toHaveAttribute('aria-label');
      
      // Test keyboard navigation
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => document.activeElement.dataset.ttsControl);
      expect(focusedElement).toBe('play');
      
      // Click play button
      await page.locator('[data-tts-play]').click();
      
      // Verify TTS is initiated (browser-specific)
      if (browserName === 'chromium') {
        const ttsActive = await page.evaluate(() => window.speechSynthesis.speaking);
        expect(ttsActive).toBe(true);
      }
      
      // Test AI explanation request
      await page.locator('[data-tts-explain]').click();
      
      // Wait for consent dialog (if not already granted)
      const consentDialog = page.locator('[data-consent-dialog]');
      if (await consentDialog.isVisible()) {
        await page.locator('[data-consent-accept]').click();
      }
      
      // Verify explanation appears
      await expect(page.locator('[data-explanation-content]')).toBeVisible({ timeout: 10000 });
      
      const explanationText = await page.locator('[data-explanation-content]').textContent();
      expect(explanationText.length).toBeGreaterThan(10);
      expect(explanationText.toLowerCase()).toContain('quantum');
    });
    
    test('voice selection and settings persistence', async ({ page }) => {
      // Open extension popup
      if (extensionId) {
        await page.goto(`chrome-extension://${extensionId}/popup/popup.html`);
      } else {
        // Fallback for other browsers
        await page.goto('about:blank');
        return; // Skip test for unsupported browsers in this setup
      }
      
      // Change voice settings
      await page.locator('[data-voice-selector]').selectOption({ label: /British/ });
      await page.locator('[data-rate-slider]').fill('1.5');
      await page.locator('[data-pitch-slider]').fill('1.2');
      
      // Save settings
      await page.locator('[data-save-settings]').click();
      
      // Navigate to content page
      await page.goto('data:text/html,<p>Test content for voice verification</p>');
      
      // Select and play text
      await page.locator('p').selectText();
      await page.locator('[data-tts-play]').click();
      
      // Verify settings were applied (implementation-specific verification)
      const appliedSettings = await page.evaluate(() => {
        const utterance = window.lastUtterance; // Assuming this is set by extension
        return utterance ? {
          rate: utterance.rate,
          pitch: utterance.pitch,
          voiceName: utterance.voice?.name
        } : null;
      });
      
      if (appliedSettings) {
        expect(appliedSettings.rate).toBe(1.5);
        expect(appliedSettings.pitch).toBe(1.2);
        expect(appliedSettings.voiceName).toMatch(/British|UK/);
      }
    });
    
    test('error handling and recovery', async ({ page }) => {
      // Mock network failure for AI service
      await page.route('https://api.groq.com/**', route => {
        route.fulfill({ status: 503, body: 'Service unavailable' });
      });
      
      await page.goto('data:text/html,<p>Complex text that needs explanation</p>');
      
      // Select text and request explanation
      await page.locator('p').selectText();
      await page.locator('[data-tts-explain]').click();
      
      // Accept consent if needed
      if (await page.locator('[data-consent-dialog]').isVisible()) {
        await page.locator('[data-consent-accept]').click();
      }
      
      // Verify error handling
      await expect(page.locator('[data-error-message]')).toBeVisible({ timeout: 8000 });
      
      const errorText = await page.locator('[data-error-message]').textContent();
      expect(errorText).toContain('service unavailable');
      
      // Verify basic TTS still works
      await page.locator('[data-tts-play]').click();
      
      // Should not throw errors and basic TTS should function
      const hasError = await page.locator('[data-tts-error]').isVisible();
      expect(hasError).toBe(false);
    });
    
    test('accessibility compliance verification', async ({ page }) => {
      await page.goto('data:text/html,<p>Accessibility test content for screen readers and keyboard users</p>');
      
      // Select text
      await page.locator('p').selectText();
      
      // Wait for overlay
      await expect(page.locator('[data-tts-overlay]')).toBeVisible();
      
      // Test keyboard navigation through all controls
      const controls = ['play', 'pause', 'stop', 'explain', 'settings'];
      
      await page.keyboard.press('Tab'); // Focus first control
      
      for (let i = 0; i < controls.length; i++) {
        const activeElement = await page.evaluate(() => ({
          tagName: document.activeElement.tagName,
          role: document.activeElement.getAttribute('role'),
          ariaLabel: document.activeElement.getAttribute('aria-label'),
          control: document.activeElement.dataset.ttsControl
        }));
        
        // Verify element is focusable and has accessibility attributes
        expect(['BUTTON', 'SELECT', 'INPUT']).toContain(activeElement.tagName);
        expect(activeElement.ariaLabel).toBeTruthy();
        
        if (i < controls.length - 1) {
          await page.keyboard.press('Tab');
        }
      }
      
      // Test escape key closes overlay
      await page.keyboard.press('Escape');
      await expect(page.locator('[data-tts-overlay]')).toBeHidden();
      
      // Test activation with Enter and Space
      await page.locator('p').selectText();
      await page.keyboard.press('Tab'); // Focus play button
      await page.keyboard.press('Enter'); // Should start playback
      
      // Verify playback started (browser-specific)
      if (browserName === 'chromium') {
        const isPlaying = await page.evaluate(() => window.speechSynthesis.speaking);
        expect(isPlaying).toBe(true);
      }
    });
    
    test('mobile responsiveness', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('data:text/html,<p>Mobile test content that should work well on touch devices</p>');
      
      // Select text (simulate touch selection)
      await page.locator('p').click();
      await page.locator('p').selectText();
      
      // Verify overlay is mobile-friendly
      const overlay = page.locator('[data-tts-overlay]');
      await expect(overlay).toBeVisible();
      
      // Check touch target sizes (minimum 44px)
      const buttonSizes = await page.locator('[data-tts-overlay] button').evaluateAll(buttons => {
        return buttons.map(btn => {
          const rect = btn.getBoundingClientRect();
          return { width: rect.width, height: rect.height };
        });
      });
      
      buttonSizes.forEach(size => {
        expect(size.width).toBeGreaterThanOrEqual(44);
        expect(size.height).toBeGreaterThanOrEqual(44);
      });
      
      // Verify overlay positioning doesn't overflow viewport
      const overlayRect = await overlay.boundingBox();
      expect(overlayRect.x).toBeGreaterThanOrEqual(0);
      expect(overlayRect.y).toBeGreaterThanOrEqual(0);
      expect(overlayRect.x + overlayRect.width).toBeLessThanOrEqual(375);
    });
  });
});
```

### Level 4: Security & Performance Tests

```javascript
// tests/security/extension-security.test.js
describe('Extension Security Tests', () => {
  
  test('should prevent XSS in content processing', async () => {
    const maliciousContent = `
      <div data-text="<script>window.xssExecuted = true; alert('XSS')</script>">
        Legitimate content
      </div>
      <img src="x" onerror="window.xssExecuted = true">
    `;
    
    const testPage = await extension.newTab(`data:text/html,${encodeURIComponent(maliciousContent)}`);
    
    // Extension processes the content
    const result = await testPage.evaluate(() => {
      const element = document.querySelector('[data-text]');
      return {
        processedText: window.ttsExtension.extractText(element),
        xssExecuted: window.xssExecuted || false
      };
    });
    
    expect(result.processedText).toBe('Legitimate content');
    expect(result.processedText).not.toContain('<script>');
    expect(result.processedText).not.toContain('alert(');
    expect(result.xssExecuted).toBe(false);
  });
  
  test('should sanitize AI API inputs', async () => {
    const maliciousPayload = {
      text: '"; DROP TABLE users; -- <script>eval(atob("YWxlcnQoIlhTUyIp"))</script>',
      context: 'malicious context with \'; DELETE FROM sensitive_data; --'
    };
    
    const response = await extension.background.sendMessage({
      type: 'AI_EXPLANATION_REQUEST',
      text: maliciousPayload.text,
      context: maliciousPayload.context
    });
    
    expect(response.success).toBe(false);
    expect(response.error).toContain('Invalid input');
  });
  
  test('should enforce CSP compliance', async () => {
    const testPage = await extension.newTab('https://example.com');
    
    // Try to execute inline script (should be blocked)
    const cspViolations = [];
    testPage.on('securitystatechanged', event => {
      if (event.type === 'csp-violation') {
        cspViolations.push(event);
      }
    });
    
    await testPage.evaluate(() => {
      try {
        // These should be blocked by CSP
        eval('console.log("CSP violation")');
        document.body.innerHTML = '<img src=x onerror=alert(1)>';
        return false;
      } catch (e) {
        return e.name === 'EvalError';
      }
    });
    
    // Verify CSP violations were caught
    // (Implementation depends on test framework's CSP monitoring)
    expect(cspViolations.length).toBeGreaterThan(0);
  });
  
  test('should protect API keys in storage', async () => {
    const testApiKey = 'test-secret-api-key-12345';
    
    // Store API key
    await extension.background.storeAPIKey('groq', testApiKey);
    
    // Try to access from content script (should be prevented)
    const testPage = await extension.newTab('https://malicious-site.com');
    
    const canAccessKeys = await testPage.evaluate(() => {
      try {
        // Content scripts should not be able to access API keys directly
        return chrome.storage.sync.get(['groqApiKey']);
      } catch (e) {
        return { error: e.message };
      }
    });
    
    expect(canAccessKeys.error || canAccessKeys.groqApiKey).toBeUndefined();
  });
  
  test('should validate extension permissions', async () => {
    const permissions = await extension.getPermissions();
    
    // Verify only necessary permissions are requested
    const expectedPermissions = ['storage', 'activeTab', 'scripting'];
    const hostPermissions = ['https://api.groq.com/*', 'https://api.anthropic.com/*'];
    
    expect(permissions.permissions).toEqual(expect.arrayContaining(expectedPermissions));
    expect(permissions.permissions.length).toBeLessThanOrEqual(expectedPermissions.length);
    
    expect(permissions.origins).toEqual(expect.arrayContaining(hostPermissions));
    expect(permissions.origins.length).toBeLessThanOrEqual(hostPermissions.length + 1); // +1 for potential wildcard
  });
});

// tests/performance/extension-performance.test.js
describe('Extension Performance Tests', () => {
  
  test('should load extension within performance budget', async () => {
    const startTime = performance.now();
    
    const extension = await loadExtension('./dist/chrome');
    await extension.waitForReady();
    
    const loadTime = performance.now() - startTime;
    
    // Should load within 1 second
    expect(loadTime).toBeLessThan(1000);
  });
  
  test('should handle large text efficiently', async () => {
    const largeText = generateText(10000); // 10KB of text
    const startTime = performance.now();
    
    const result = await extension.background.sendMessage({
      type: 'TTS_REQUEST',
      data: { text: largeText, options: {} }
    });
    
    const processingTime = performance.now() - startTime;
    
    expect(processingTime).toBeLessThan(500); // Process within 500ms
    expect(result.success).toBe(true);
  });
  
  test('should limit memory usage during operation', async () => {
    const initialMemory = await extension.getMemoryUsage();
    
    // Process multiple TTS requests
    for (let i = 0; i < 50; i++) {
      await extension.background.sendMessage({
        type: 'TTS_REQUEST',
        data: { text: `Test text number ${i}`, options: {} }
      });
    }
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    const finalMemory = await extension.getMemoryUsage();
    const memoryIncrease = finalMemory - initialMemory;
    
    // Should not exceed 20MB increase for 50 requests
    expect(memoryIncrease).toBeLessThan(20 * 1024 * 1024);
  });
  
  test('should handle concurrent requests efficiently', async () => {
    const concurrentRequests = 20;
    const startTime = performance.now();
    
    const promises = Array.from({ length: concurrentRequests }, (_, i) =>
      extension.background.sendMessage({
        type: 'TTS_REQUEST',
        data: { text: `Concurrent test ${i}`, options: {} }
      })
    );
    
    const results = await Promise.all(promises);
    const totalTime = performance.now() - startTime;
    
    expect(results.every(r => r.success)).toBe(true);
    expect(totalTime).toBeLessThan(2000); // Complete within 2 seconds
  });
  
  test('should optimize overlay rendering performance', async () => {
    const testPage = await extension.newTab('data:text/html,<p>Performance test content</p>');
    
    const startTime = await testPage.evaluate(() => performance.now());
    
    // Trigger text selection and overlay
    await testPage.locator('p').selectText();
    
    const overlayVisible = await testPage.waitForSelector('[data-tts-overlay]', { timeout: 1000 });
    
    const endTime = await testPage.evaluate(() => performance.now());
    const renderTime = endTime - startTime;
    
    expect(overlayVisible).toBeTruthy();
    expect(renderTime).toBeLessThan(300); // Overlay appears within 300ms
  });
  
  function generateText(bytes) {
    const words = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit'];
    let text = '';
    
    while (text.length < bytes) {
      text += words[Math.floor(Math.random() * words.length)] + ' ';
    }
    
    return text.substring(0, bytes);
  }
});
```

## 🔒 Security & Compliance Framework

### Browser Extension Security Checklist
- [ ] **Manifest V3 Compliance**: Service worker background script, no persistent background
- [ ] **Content Security Policy**: Strict CSP with no unsafe-eval/unsafe-inline directives
- [ ] **Input Sanitization**: All user content sanitized to prevent XSS attacks
- [ ] **Permission Minimization**: Only activeTab, storage, scripting permissions requested
- [ ] **Cross-Origin Isolation**: Proper origin validation for AI API calls
- [ ] **Data Privacy**: No data collection without explicit user consent
- [ ] **Secrets Management**: API keys stored in chrome.storage.sync, not in code
- [ ] **Extension Isolation**: Proper isolation between content/background scripts
- [ ] **Host Permissions**: Minimal host permissions for specific AI API domains only
- [ ] **Dependency Scanning**: Regular vulnerability scans of all dependencies

### Privacy Compliance Implementation

```javascript
// Privacy-first consent management system
class ConsentManager {
  static async requestConsent() {
    const existingConsent = await chrome.storage.sync.get(['aiServiceConsent']);
    
    if (existingConsent.aiServiceConsent?.granted) {
      // Check if consent is still valid (within 1 year)
      const consentAge = Date.now() - existingConsent.aiServiceConsent.timestamp;
      if (consentAge < 365 * 24 * 60 * 60 * 1000) {
        return existingConsent.aiServiceConsent;
      }
    }
    
    // Show consent dialog
    const consent = await this.showConsentDialog();
    
    if (consent.granted) {
      await chrome.storage.sync.set({
        aiServiceConsent: {
          granted: true,
          timestamp: Date.now(),
          services: consent.services,
          dataRetention: '0-days', // No data retention
          purposes: ['text-explanation-only']
        }
      });
    }
    
    return consent;
  }
  
  static async showConsentDialog() {
    return new Promise(resolve => {
      const dialog = document.createElement('div');
      dialog.className = 'tts-consent-overlay';
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-labelledby', 'consent-title');
      dialog.innerHTML = `
        <div class="consent-content">
          <h3 id="consent-title">AI Explanation Service</h3>
          <p>To provide intelligent explanations of selected text, we need to send your content to an AI service.</p>
          
          <div class="consent-details">
            <h4>Data Handling:</h4>
            <ul>
              <li>✓ Text is sent only for this explanation</li>
              <li>✓ No personal data is collected or stored</li>
              <li>✓ Content is not used for AI training</li>
              <li>✓ Requests are deleted immediately after processing</li>
            </ul>
            
            <h4>Service Options:</h4>
            <label>
              <input type="radio" name="service" value="groq" checked>
              Groq (Free, privacy-focused)
            </label>
            <label>
              <input type="radio" name="service" value="claude">
              Claude (Paid, advanced explanations)
            </label>
          </div>
          
          <div class="consent-buttons">
            <button class="consent-deny">Just read aloud (no AI)</button>
            <button class="consent-grant">Accept & explain</button>
          </div>
          
          <p class="consent-footer">
            <small>
              You can change this in extension settings. 
              <a href="#" onclick="chrome.runtime.openOptionsPage()">View privacy policy</a>
            </small>
          </p>
        </div>
      `;
      
      document.body.appendChild(dialog);
      
      dialog.querySelector('.consent-grant').onclick = () => {
        const selectedService = dialog.querySelector('input[name="service"]:checked').value;
        dialog.remove();
        resolve({
          granted: true,
          services: [selectedService],
          timestamp: Date.now()
        });
      };
      
      dialog.querySelector('.consent-deny').onclick = () => {
        dialog.remove();
        resolve({ granted: false });
      };
    });
  }
  
  static async withdrawConsent() {
    await chrome.storage.sync.remove(['aiServiceConsent']);
    await chrome.storage.local.remove(['aiUsageStats', 'aiResponseCache']);
    
    // Notify user
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'assets/icons/icon48.png',
      title: 'TTS Extension',
      message: 'AI service consent withdrawn. All related data deleted.'
    });
  }
}
```

## 📊 Observability & Monitoring

### Performance Monitoring Implementation
**IMPORTANT**: use context7 to get current Performance API specifications and browser extension monitoring best practices

### Logging Implementation for Extensions
```javascript
// Privacy-compliant logging system
class ExtensionLogger {
  constructor() {
    this.debugMode = false;
    this.logLevel = 'INFO';
    this.initialize();
  }
  
  async initialize() {
    const settings = await chrome.storage.sync.get(['debugMode', 'logLevel']);
    this.debugMode = settings.debugMode || false;
    this.logLevel = settings.logLevel || 'INFO';
  }
  
  log(level, message, data = {}) {
    if (!this.shouldLog(level)) return;
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      extensionId: chrome.runtime.id,
      // Only log non-sensitive data
      sanitizedData: this.sanitizeLogData(data)
    };
    
    if (this.debugMode) {
      console.log(`[TTS Extension ${level}]`, logEntry);
    }
    
    // Store logs for debugging (with size limits)
    this.storeLogEntry(logEntry);
  }
  
  sanitizeLogData(data) {
    const sanitized = { ...data };
    
    // Remove sensitive information
    delete sanitized.apiKey;
    delete sanitized.userText; // Don't log user content
    delete sanitized.personalInfo;
    
    // Truncate long strings
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string' && sanitized[key].length > 100) {
        sanitized[key] = sanitized[key].substring(0, 100) + '...[truncated]';
      }
    });
    
    return sanitized;
  }
  
  async storeLogEntry(entry) {
    const logs = await chrome.storage.local.get(['debugLogs']);
    const debugLogs = logs.debugLogs || [];
    
    debugLogs.push(entry);
    
    // Keep only last 100 log entries
    if (debugLogs.length > 100) {
      debugLogs.splice(0, debugLogs.length - 100);
    }
    
    await chrome.storage.local.set({ debugLogs });
  }
  
  shouldLog(level) {
    const levels = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 };
    return levels[level] <= levels[this.logLevel];
  }
  
  error(message, data) { this.log('ERROR', message, data); }
  warn(message, data) { this.log('WARN', message, data); }
  info(message, data) { this.log('INFO', message, data); }
  debug(message, data) { this.log('DEBUG', message, data); }
}

const logger = new ExtensionLogger();
```

### Metrics Collection for Extensions
```javascript
// Performance and usage metrics
class ExtensionMetrics {
  constructor() {
    this.metrics = new Map();
    this.initialize();
  }
  
  async initialize() {
    // Check user consent for analytics
    const settings = await chrome.storage.sync.get(['analyticsConsent']);
    this.analyticsEnabled = settings.analyticsConsent || false;
  }
  
  recordMetric(name, value, tags = {}) {
    if (!this.analyticsEnabled) return;
    
    const metric = {
      name,
      value,
      tags,
      timestamp: Date.now()
    };
    
    // Store locally for privacy
    this.storeMetric(metric);
  }
  
  async storeMetric(metric) {
    const stored = await chrome.storage.local.get(['metrics']);
    const metrics = stored.metrics || [];
    
    metrics.push(metric);
    
    // Keep only last 1000 metrics
    if (metrics.length > 1000) {
      metrics.splice(0, metrics.length - 1000);
    }
    
    await chrome.storage.local.set({ metrics });
  }
  
  startTimer(operation) {
    return {
      operation,
      startTime: performance.now(),
      end: () => {
        const duration = performance.now() - this.startTime;
        this.recordMetric('operation_duration', duration, { operation });
        return duration;
      }
    };
  }
  
  // Usage tracking methods
  recordTTSUsage(language, voiceName, textLength) {
    this.recordMetric('tts_usage', 1, {
      language,
      voiceName: voiceName?.substring(0, 20), // Truncate for privacy
      textLength: Math.floor(textLength / 100) * 100 // Round for privacy
    });
  }
  
  recordAIRequest(provider, success, responseTime) {
    this.recordMetric('ai_request', 1, {
      provider,
      success: success.toString(),
      responseTimeCategory: this.categorizeResponseTime(responseTime)
    });
  }
  
  categorizeResponseTime(time) {
    if (time < 1000) return 'fast';
    if (time < 3000) return 'medium';
    return 'slow';
  }
  
  async getMetricsSummary() {
    const stored = await chrome.storage.local.get(['metrics']);
    const metrics = stored.metrics || [];
    
    const summary = {
      totalTTSUsage: metrics.filter(m => m.name === 'tts_usage').length,
      totalAIRequests: metrics.filter(m => m.name === 'ai_request').length,
      averageResponseTime: this.calculateAverageResponseTime(metrics),
      topLanguages: this.getTopLanguages(metrics),
      errorRate: this.calculateErrorRate(metrics)
    };
    
    return summary;
  }
  
  calculateAverageResponseTime(metrics) {
    const aiMetrics = metrics.filter(m => m.name === 'ai_request');
    if (aiMetrics.length === 0) return 0;
    
    const totalTime = aiMetrics.reduce((sum, m) => {
      const category = m.tags.responseTimeCategory;
      const estimatedTime = category === 'fast' ? 500 : category === 'medium' ? 2000 : 4000;
      return sum + estimatedTime;
    }, 0);
    
    return Math.round(totalTime / aiMetrics.length);
  }
  
  getTopLanguages(metrics) {
    const ttsMetrics = metrics.filter(m => m.name === 'tts_usage');
    const languageCounts = {};
    
    ttsMetrics.forEach(m => {
      const lang = m.tags.language || 'unknown';
      languageCounts[lang] = (languageCounts[lang] || 0) + 1;
    });
    
    return Object.entries(languageCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([lang, count]) => ({ language: lang, usage: count }));
  }
  
  calculateErrorRate(metrics) {
    const aiMetrics = metrics.filter(m => m.name === 'ai_request');
    if (aiMetrics.length === 0) return 0;
    
    const errors = aiMetrics.filter(m => m.tags.success === 'false').length;
    return Math.round((errors / aiMetrics.length) * 100);
  }
}

const metrics = new ExtensionMetrics();
```

## 🎯 TTS Extension Implementation Checklist

### Pre-Implementation Requirements
**CRITICAL - Review Before Starting**:

- [ ] **Context7 Documentation Access**: Verify context7 tool availability for real-time API documentation
- [ ] **Browser Compatibility Matrix**: use context7 for current Web Speech API support across browsers
- [ ] **Manifest V3 Requirements**: use context7 for latest Chrome extension guidelines and CSP requirements  
- [ ] **AI Service Documentation**: use context7 for current Groq API (free tier) and Claude API specifications
- [ ] **Accessibility Guidelines**: use context7 for WCAG 2.1 AA requirements and testing methodologies
- [ ] **Privacy Regulations**: use context7 for current data privacy laws and browser extension compliance

### Context7 Integration Points
**IMPORTANT**: The following areas MUST use context7 for current documentation:

#### AI Service Integration
**Groq API**: use context7 to fetch current Groq API documentation for:
- Authentication methods (Bearer token format and API key structure)
- Rate limiting details (100 requests/hour for free tier, daily quotas)
- Model availability (llama-3.3-70b-versatile recommended, gemma2-9b-it alternative)
- Request/response format with proper error handling patterns
- Pricing tiers and usage monitoring for cost management

**Claude API**: use context7 to get latest Claude API specifications for:
- Authentication (x-api-key header format and key management)
- Message format (anthropic-version header and conversation structure)
- Rate limits (60 RPM for basic tiers, 4000 RPM for Tier 4)
- Model capabilities (claude-3-haiku-20240307 for cost-effective explanations)
- Content policies, safety guidelines, and acceptable use boundaries

#### Browser Extension APIs  
**Chrome Extension APIs**: use context7 for Manifest V3 requirements:
- Service worker lifecycle management and event handling patterns
- chrome.storage API quotas (sync: 102,400 bytes, local: 10MB) and best practices
- Content script injection timing and DOM interaction patterns
- Cross-origin request policies and CORS handling for AI APIs
- Extension permissions model and user consent flows

**Web Speech API**: use context7 for browser compatibility:
- speechSynthesis availability matrix (Chrome 33+, Firefox 49+, Safari 7+)
- Voice enumeration differences across platforms and languages
- Platform-specific voice characteristics (Windows vs Mac vs Linux)
- Browser-specific limitations (Chrome 15-second timeout, Firefox voice loading)
- Error handling patterns and recovery strategies

#### Cross-Browser Compatibility
**Firefox Extensions**: use context7 for WebExtension standards:
- Manifest V2/V3 migration timeline and compatibility matrix
- Browser API polyfill requirements (webextension-polyfill usage patterns)
- Firefox-specific voice handling and onvoiceschanged event implementation
- AMO (addons.mozilla.org) submission guidelines and review process

**Safari Extensions**: use context7 for Safari-specific requirements:
- Safari Web Extension conversion process (xcrun safari-web-extension-converter)
- macOS/iOS voice integration patterns and system preferences
- Safari-specific privacy and permission requirements
- Mac App Store submission process and review guidelines

### Implementation Success Validation

#### Technical Success Criteria
```javascript
// Performance Benchmarks (All must pass)
const requiredMetrics = {
  overlayShowTime: '<300ms',      // Overlay appears quickly after text selection
  ttsStartDelay: '<500ms',        // Speech synthesis begins promptly  
  aiResponseTime: '<3000ms',      // AI explanations generate within 3 seconds
  memoryUsage: '<50MB',           // Efficient memory utilization during operation
  crossBrowserSupport: '4/4',     // Chrome, Firefox, Safari, Edge all functional
  testCoverage: '>85%',           // Comprehensive automated test coverage
  wcagCompliance: 'AA',           // Full WCAG 2.1 AA accessibility compliance
  storeApproval: '4/4'            // Successfully approved on all extension stores
};

// User Experience Validation (Manual testing required)
const uxCriteria = {
  usabilityScore: 'New users can start TTS in <2 clicks',
  reliabilityScore: 'TTS functions correctly on >95% of websites',
  accessibilityScore: 'Full functionality via keyboard and screen readers',
  privacyScore: 'Users understand and control all data usage',
  performanceScore: 'No noticeable impact on browser performance'
};
```

#### Quality Gates Automation
```bash
# Pre-commit validation (must pass before code commit)
npm run validate                # ESLint + Prettier + TypeScript
npm run test:unit              # Unit tests (>85% coverage required)
npm run test:security          # Security and CSP compliance tests

# Pre-release validation (must pass before store submission)  
npm run test:e2e:all          # Cross-browser end-to-end tests
npm run test:accessibility    # WCAG 2.1 AA compliance verification
npm run test:performance      # Memory and response time benchmarks
npm run validate:manifest     # Extension store validation
npm run build:all             # Production builds for all browsers
npm run package:all           # Store-ready extension packages
```

### Emergency Response & Rollback Plan

#### Common Issues & Solutions
1. **Web Speech API Failures**: 
   - Fallback to alternative voices
   - Clear error messaging with troubleshooting steps
   - Graceful degradation to text-only mode

2. **AI Service Downtime**:
   - Automatic provider switching (Groq → Claude → Local)
   - User notification with expected restoration time
   - Cache previous explanations for repeat content

3. **CSP Violations**:
   - Immediate code review for inline scripts
   - Manifest V3 compliance verification
   - Emergency patch deployment process

4. **Cross-Browser Issues**:
   - Browser-specific feature detection
   - Progressive enhancement approach
   - Quick disable for problematic browsers

5. **Performance Problems**:
   - Memory leak detection and cleanup
   - Code splitting and lazy loading
   - Background processing optimization

#### Rollback Strategy
- **Store Rollback**: Maintain previous stable version packages for emergency rollback
- **Feature Flags**: Gradual rollout with ability to disable features remotely
- **User Communication**: Clear status page and notification system
- **Monitoring**: Real-time error tracking and automated alerts

### Post-Launch Success Tracking

#### Key Performance Indicators
```javascript
// User Engagement Metrics
const engagementKPIs = {
  dailyActiveUsers: 'target: 1000+ within 3 months',
  ttsUsageFrequency: 'target: 5+ times per user per week', 
  aiExplanationRequests: 'target: 20% of TTS sessions',
  settingsCustomization: 'target: 60% of users customize voice/speed'
};

// Technical Performance Metrics
const technicalKPIs = {
  errorRateByBrowser: 'target: <2% for all browsers',
  apiResponseTimes: 'target: 95th percentile <3s',
  memoryUsagePatterns: 'target: no memory leaks detected',
  extensionLoadTimes: 'target: 95th percentile <1s'
};

// Business Impact Metrics  
const businessKPIs = {
  userRetentionRates: 'target: 70% 7-day retention',
  accessibilityFeedback: 'target: 4.5+ star accessibility rating',
  storeRatings: 'target: 4.2+ stars across all stores',
  supportTicketVolume: 'target: <5% of users need support'
};
```

## 📚 Final Implementation Notes

This comprehensive PRP provides the complete framework for implementing a production-ready TTS browser extension with AI integration. The implementation follows these critical success factors:

### 🔑 Key Success Factors

1. **Context7 Integration**: All external API documentation accessed via context7 for accuracy
2. **Privacy-First Design**: Explicit consent, transparent data handling, no tracking
3. **Accessibility Mandate**: WCAG 2.1 AA compliance is required, not optional
4. **Cross-Browser Excellence**: Thorough testing on all target browsers throughout development
5. **Performance Excellence**: Metrics tracked from day one with established benchmarks
6. **Security Compliance**: Manifest V3, strict CSP, and secure coding practices
7. **User Experience Focus**: Simple, intuitive interface with powerful functionality
8. **Quality Assurance**: Comprehensive testing strategy with 85%+ coverage requirement

### 🚀 Implementation Timeline

**Week 1**: Foundation (Manifest V3, service worker, basic TTS, content scripts)
**Week 2**: AI Integration (Multi-provider, privacy consent, rate limiting)  
**Week 3**: Cross-Browser (Compatibility layer, testing suite, performance optimization)
**Week 4**: Polish (Accessibility audit, store preparation, final QA)

### 📋 Deliverables Checklist

- [ ] **Source Code**: Complete `/src/` directory with all extension components
- [ ] **Build System**: Multi-browser webpack configurations and automation  
- [ ] **Test Suite**: Unit, integration, E2E, security, and performance tests
- [ ] **Documentation**: User guide, privacy policy, technical documentation
- [ ] **Store Assets**: Icons, screenshots, store listings for all platforms
- [ ] **Compliance**: WCAG 2.1 AA certification, security audit results

### ⚠️ Critical Implementation Reminders

**MUST DO**:
- Use context7 for all external API documentation lookups
- Implement explicit consent before any AI service usage
- Test on all target browsers before each release
- Maintain >85% test coverage throughout development
- Validate WCAG 2.1 AA compliance with real accessibility users

**NEVER DO**:
- Hardcode API keys or use inline scripts (CSP violations)
- Collect user data without explicit consent
- Skip cross-browser testing or accessibility validation
- Deploy without comprehensive security review
- Ignore performance budgets or memory limitations

### 📞 Success Validation

This implementation will be considered successful when:
- Extension approved on all 4 browser stores (Chrome, Firefox, Safari, Edge)
- Performance metrics meet all benchmarks (response times, memory usage)
- Accessibility compliance verified by independent audit
- User feedback demonstrates clear value for accessibility use cases
- Technical metrics show stable, secure operation at scale

**Confidence Score: 9/10** - This PRP provides comprehensive, actionable guidance for building a production-ready TTS extension with AI integration that meets all technical, security, accessibility, and business requirements.

**Context7 Integration Points: 8** - All critical external documentation areas identified for real-time lookup during implementation.