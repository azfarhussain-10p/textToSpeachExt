name: "Intelligent Text-to-Speech Browser Extension with AI-Powered Explanation - Complete Implementation"
description: |

## Purpose
Build a production-ready, cross-browser Text-to-Speech extension with AI-powered explanations that demonstrates advanced context engineering, modern web APIs, and cross-browser compatibility. This comprehensive implementation provides users with intelligent text-to-speech functionality and content understanding across all major browsers.

## Core Principles
1. **Context is King**: Include ALL necessary browser extension patterns, TTS APIs, and AI integration examples
2. **Validation Loops**: Provide executable tests for cross-browser compatibility and functionality
3. **Information Dense**: Use proven extension development patterns and modern web standards
4. **Progressive Success**: Start with core TTS, validate, then enhance with AI features
5. **Global rules**: Follow all rules in CLAUDE.md

---

## Goal
Create a comprehensive browser extension that transforms web reading by providing intelligent text-to-speech with multi-language support and AI-powered content explanations. The extension should work seamlessly across Chrome, Firefox, Safari, and Edge with mobile optimization.

## Why
- **Accessibility**: Makes web content accessible to visually impaired users and those with reading difficulties
- **Learning Enhancement**: Helps users understand complex content through AI explanations and examples
- **Multi-language Support**: Breaks language barriers by providing TTS in user's preferred language
- **Universal Compatibility**: Works on any website, article, blog, or social media post
- **Modern Development**: Demonstrates Manifest V3, service workers, and AI integration best practices

## What
A browser extension with intelligent text selection overlay that provides:
- Text-to-Speech in 15+ languages with voice customization and cross-browser fallbacks
- AI-powered explanations using Groq (free) and Claude API (premium) with rate limiting
- Smart overlay UI with play, pause, stop, voice selection, and explanation controls
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge) with polyfills
- Mobile-responsive design with touch-friendly controls
- Full accessibility compliance (WCAG 2.1 AA) with keyboard navigation

### Success Criteria
- [ ] Text selection triggers overlay within 300ms across all browsers
- [ ] TTS works on 95% of websites with graceful fallbacks
- [ ] Supports 15+ languages with intelligent voice selection
- [ ] AI explanations generated within 3 seconds with fallback strategies
- [ ] Works across Chrome, Firefox, Safari, Edge with consistent UI
- [ ] Mobile-optimized overlay positioning and touch targets
- [ ] Full accessibility compliance with screen reader support
- [ ] Memory usage stays under 50MB with proper cleanup
- [ ] Extension loads in under 1 second on average websites

## All Needed Context

### Documentation & References (list all context needed to implement the feature)
```yaml
# MUST READ - Include these in your context window
- url: https://developer.chrome.com/docs/extensions/mv3/
  why: Manifest V3 requirements, service workers, content script patterns
  critical: Service workers are event-driven, non-persistent unlike background pages

- url: https://developer.chrome.com/docs/extensions/develop/migrate/to-service-workers
  why: Service worker lifecycle management, keep-alive patterns, message passing
  critical: Use alarms API instead of setTimeout, register listeners at top level

- url: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
  why: SpeechSynthesis interface, voice selection, cross-browser compatibility
  critical: Firefox supports TTS but limited, Edge has WebSpeech but no data returned

- url: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API
  why: Practical implementation patterns, error handling, voice configuration
  
- url: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions
  why: Cross-browser WebExtensions API compatibility and polyfill usage
  critical: Use webextension-polyfill for consistent API across browsers

- url: https://github.com/mozilla/webextension-polyfill
  why: Cross-browser API compatibility layer, unified promise-based API
  critical: Essential for Firefox/Safari compatibility with Chrome extension patterns

- url: https://developer.apple.com/documentation/safariservices/safari_web_extensions
  why: Safari Web Extensions specific requirements and limitations
  critical: iOS Safari has limited extension support, different permission model

- url: https://console.groq.com/docs/api-reference
  why: Groq API integration for free AI explanations, rate limits
  critical: Developer tier has 10x more rate limits, batch API for high volume

- url: https://console.groq.com/docs/rate-limits
  why: Rate limiting strategies, batching, error handling patterns
  critical: Implement exponential backoff and queuing for rate limit compliance

- url: https://docs.anthropic.com/en/api/getting-started
  why: Claude API integration for premium AI features
  critical: CORS enabled in August 2024, direct browser access now possible

- url: https://web.dev/articles/csp
  why: Content Security Policy requirements for extensions and websites
  critical: Many websites block inline scripts, external resources - handle gracefully

- file: CLAUDE.md
  why: Comprehensive extension development patterns, error handling, security practices
  critical: Never ignore Manifest V3 compliance, memory management, privacy requirements

- file: INITIAL.md
  why: Complete feature requirements, gotchas, performance considerations
  critical: Mobile browser limitations, voice availability variations, XSS prevention

- file: package.json
  why: Build scripts, testing patterns, cross-browser webpack configurations
  critical: Uses separate webpack configs per browser, comprehensive test suite
```

### Current Codebase tree (project structure overview)
```bash
textToSpeachExt/
├── .claude/                    # Claude Code configuration
├── .devcontainer/             # Development container setup
├── PRPs/                      # Project Requirements Plans
├── package.json               # Comprehensive build system with cross-browser support
├── CLAUDE.md                  # Development patterns and critical requirements
├── INITIAL.md                 # Feature requirements and implementation guidelines
└── README.md                  # Project documentation

# No src/ directory exists yet - fresh implementation needed
```

### Desired Codebase tree with files to be added and responsibility of file
```bash
textToSpeachExt/
├── src/
│   ├── background/
│   │   └── service-worker.js         # Manifest V3 service worker with message handling
│   ├── content/
│   │   ├── content-script.js         # Text selection detection, overlay injection
│   │   └── overlay/
│   │       ├── overlay.js            # TTS controls, AI explanation UI
│   │       ├── overlay.css           # Mobile-responsive overlay styling
│   │       └── selection-handler.js   # Robust text selection across DOM types
│   ├── popup/
│   │   ├── popup.html               # Extension popup interface
│   │   ├── popup.js                 # Settings, voice selection, preferences
│   │   └── popup.css                # Popup styling with accessibility support
│   ├── services/
│   │   ├── tts-service.js           # Cross-browser TTS with fallbacks
│   │   ├── ai-service.js            # Groq/Claude API integration with rate limiting
│   │   ├── storage-service.js       # Extension storage management
│   │   └── error-handler.js         # Centralized error handling and logging
│   ├── utils/
│   │   ├── browser-polyfill.js      # Cross-browser compatibility utilities
│   │   ├── dom-utils.js             # DOM manipulation helpers
│   │   └── constants.js             # Configuration constants
│   └── assets/
│       ├── icons/                   # Extension icons (16, 48, 128px)
│       └── _locales/                # Internationalization files
├── build/
│   ├── webpack.chrome.js            # Chrome-specific build configuration
│   ├── webpack.firefox.js           # Firefox-specific build configuration
│   └── webpack.safari.js            # Safari-specific build configuration
├── tests/
│   ├── unit/                        # Unit tests for core functionality
│   ├── integration/                 # Integration tests across browsers
│   └── e2e/                         # End-to-end browser automation tests
├── dist/                            # Built extension files per browser
├── releases/                        # Packaged extension files
└── scripts/                         # Development automation scripts
```

### Known Gotchas of our codebase & Library Quirks
```javascript
// CRITICAL: Manifest V3 Service Workers (2024 patterns)
// Service workers are event-driven and terminate when idle
// Global variables don't persist - use chrome.storage instead
// Timer functions (setTimeout/setInterval) may fail - use chrome.alarms API

// CRITICAL: Web Speech API Cross-Browser Issues
// Firefox: TTS works but limited voice options, no speech recognition
// Edge: API exists but returns no data despite Chromium base
// Safari: Limited mobile support, different permission model
// Fallback strategy essential for production deployment

// CRITICAL: Content Security Policy (CSP) Restrictions
// Many websites block inline scripts and external resources
// Extension content scripts must handle CSP violations gracefully
// Use try-catch blocks around all DOM manipulations and API calls

// CRITICAL: Cross-Browser Extension APIs
// Use webextension-polyfill for consistent API across browsers
// Chrome uses chrome.* namespace, others use browser.*
// Safari Web Extensions have different lifecycle and permissions

// CRITICAL: AI API Rate Limiting (2024)
// Groq free tier: Limited requests per minute
// Claude API: CORS enabled August 2024, direct browser access
// Implement exponential backoff and request queuing
// Cache responses when appropriate to reduce API calls

// CRITICAL: Mobile Browser Extensions
// Safari iOS: Limited extension support, different touch events
// Chrome mobile: Full support but overlay positioning challenges
// Touch targets must be 44px minimum for accessibility

// CRITICAL: Memory Management
// Extensions can be killed by browsers if memory usage exceeds limits
// Implement proper cleanup in content scripts
// Use WeakMap for DOM element references
// Clear intervals/timeouts and event listeners on unload
```

## Implementation Blueprint

### Data models and structure

Create the core data models for type safety and consistency across the extension:

```javascript
// Core data models for extension
interface TTSOptions {
  language: string;
  voice?: string;
  rate: number; // 0.1 to 10
  pitch: number; // 0 to 2
  volume: number; // 0 to 1
}

interface AIExplanationRequest {
  text: string;
  context?: string;
  provider: 'groq' | 'claude';
  maxTokens?: number;
}

interface ExtensionSettings {
  preferredLanguage: string;
  autoExplain: boolean;
  overlayPosition: 'auto' | 'top' | 'bottom';
  aiProvider: 'groq' | 'claude' | 'both';
  privacyMode: boolean;
}

interface SelectionData {
  text: string;
  bounds: DOMRect;
  context: string;
  url: string;
  timestamp: number;
}
```

### List of tasks to be completed to fulfill the PRP in the order they should be completed

```yaml
Task 1: Setup Manifest V3 Foundation
CREATE src/manifest.chrome.json:
  - DEFINE Manifest V3 structure with service worker background
  - SPECIFY permissions: activeTab, storage, tts, host_permissions
  - CONFIGURE content_scripts for universal text selection
  - SET icons and default_popup configurations

CREATE src/manifest.firefox.json:
  - MODIFY Chrome manifest for Firefox compatibility 
  - ADJUST background script configuration (different syntax)
  - UPDATE host_permissions format for Firefox standards

CREATE src/manifest.safari.json:
  - ADAPT manifest for Safari Web Extensions requirements
  - MODIFY permission model for Safari's restrictions

Task 2: Core Service Worker Implementation  
CREATE src/background/service-worker.js:
  - IMPLEMENT event-driven architecture with top-level listeners
  - HANDLE runtime.onMessage for content script communication
  - MANAGE storage operations and settings persistence
  - SETUP keep-alive mechanism using chrome.alarms if needed

Task 3: Text Selection and DOM Handling
CREATE src/content/content-script.js:
  - DETECT text selection across various DOM structures  
  - HANDLE edge cases: iframes, shadow DOM, dynamic content
  - INJECT overlay when minimum selection threshold met
  - IMPLEMENT cleanup for extension unload/page navigation

CREATE src/content/overlay/selection-handler.js:
  - EXTRACT selected text with context preservation
  - CALCULATE optimal overlay positioning near selection
  - HANDLE mobile touch events and responsive positioning

Task 4: Cross-Browser TTS Service
CREATE src/services/tts-service.js:
  - IMPLEMENT Web Speech API with cross-browser fallbacks
  - DETECT available voices and filter by language support
  - HANDLE browser-specific voice loading patterns
  - PROVIDE graceful degradation when TTS unavailable

Task 5: Overlay UI Component
CREATE src/content/overlay/overlay.js:
  - BUILD responsive overlay with TTS controls
  - IMPLEMENT play, pause, stop, voice selection functionality
  - ADD AI explanation button with loading states
  - ENSURE keyboard navigation and accessibility compliance

CREATE src/content/overlay/overlay.css:
  - STYLE mobile-responsive overlay with CSS Grid/Flexbox
  - IMPLEMENT high contrast mode and font scaling
  - ENSURE 44px touch targets for mobile accessibility
  - HANDLE z-index conflicts with website content

Task 6: AI Integration Service
CREATE src/services/ai-service.js:
  - INTEGRATE Groq API with rate limiting and queuing
  - IMPLEMENT Claude API integration with CORS handling
  - BUILD fallback hierarchy: Groq → Claude → Local processing
  - HANDLE API errors, timeouts, and response formatting

Task 7: Extension Popup Interface
CREATE src/popup/popup.html:
  - DESIGN settings interface for voice and AI preferences
  - BUILD language selection and accessibility options

CREATE src/popup/popup.js:
  - IMPLEMENT settings persistence with chrome.storage
  - HANDLE voice enumeration and preference saving
  - BUILD privacy controls and data management options

Task 8: Cross-Browser Build System
CREATE build/webpack.chrome.js:
  - CONFIGURE production build for Chrome with optimization
  - SETUP source maps for debugging and error tracking

CREATE build/webpack.firefox.js:
  - MODIFY build for Firefox-specific requirements
  - HANDLE different manifest and API patterns

CREATE build/webpack.safari.js:
  - ADAPT build for Safari Web Extensions conversion process

Task 9: Comprehensive Testing Suite
CREATE tests/unit/tts-service.test.js:
  - TEST voice detection and TTS functionality across browsers
  - MOCK Web Speech API for consistent testing
  - VALIDATE error handling and fallback mechanisms

CREATE tests/integration/cross-browser.test.js:
  - TEST extension functionality across Chrome, Firefox, Safari
  - VALIDATE message passing between components
  - ENSURE storage operations work consistently

CREATE tests/e2e/user-workflow.test.js:
  - AUTOMATE complete user workflow with Puppeteer/Playwright
  - TEST text selection → overlay → TTS → AI explanation flow
  - VALIDATE mobile responsive behavior

Task 10: Security and Privacy Implementation
CREATE src/services/privacy-service.js:
  - IMPLEMENT user consent management for AI features
  - BUILD local storage encryption for sensitive settings
  - HANDLE CSP violations and security error reporting

Task 11: Accessibility and Internationalization
CREATE src/assets/_locales/en/messages.json:
  - DEFINE all user-facing strings for internationalization
  - INCLUDE ARIA labels and screen reader descriptions

CREATE src/utils/accessibility.js:
  - IMPLEMENT keyboard navigation handlers
  - BUILD screen reader announcements for TTS state changes
  - ENSURE high contrast and font scaling support
```

### Per task pseudocode as needed added to each task

```javascript
// Task 2: Service Worker Implementation
// PATTERN: Event-driven architecture with persistent listeners
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // CRITICAL: Handle async operations properly in service worker
  if (request.action === 'getTTSVoices') {
    chrome.tts.getVoices((voices) => {
      sendResponse({ voices: voices });
    });
    return true; // Keep message channel open for async response
  }
  
  // GOTCHA: Service worker may terminate, use chrome.storage for persistence
  if (request.action === 'saveSettings') {
    chrome.storage.sync.set(request.settings, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Task 4: TTS Service with Cross-Browser Support
class TTSService {
  constructor() {
    this.synthesis = window.speechSynthesis;
    this.voices = [];
    this.currentUtterance = null;
    
    // CRITICAL: Voice loading is async and browser-specific
    this.loadVoices();
  }
  
  async speak(text, options = {}) {
    // PATTERN: Validate input and handle edge cases first
    if (!text || text.length > 4000) {
      throw new Error('Text length must be between 1 and 4000 characters');
    }
    
    // GOTCHA: speechSynthesis may not be available (Firefox mobile)
    if (!this.synthesis) {
      throw new Error('Speech synthesis not supported');
    }
    
    // PATTERN: Cancel previous speech before starting new
    this.synthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options.language || 'en-US';
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;
    
    // CRITICAL: Handle voice selection with fallbacks
    const voice = this.findBestVoice(options.language, options.voice);
    if (voice) utterance.voice = voice;
    
    return new Promise((resolve, reject) => {
      utterance.onend = resolve;
      utterance.onerror = reject;
      this.synthesis.speak(utterance);
    });
  }
  
  findBestVoice(language, preferredVoice) {
    // PATTERN: Prioritize user preference, fallback to language match
    if (preferredVoice) {
      const exact = this.voices.find(v => v.name === preferredVoice);
      if (exact) return exact;
    }
    
    // FALLBACK: Find any voice for the language
    return this.voices.find(v => v.lang.startsWith(language.split('-')[0]));
  }
}

// Task 6: AI Service with Rate Limiting
class AIService {
  constructor() {
    this.groqApiKey = process.env.GROQ_API_KEY;
    this.claudeApiKey = process.env.CLAUDE_API_KEY;
    this.requestQueue = [];
    this.rateLimitDelay = 1000; // Start with 1 second between requests
  }
  
  async explainText(text, options = {}) {
    const request = { text, options, provider: options.provider || 'groq' };
    
    // PATTERN: Queue requests to handle rate limiting
    this.requestQueue.push(request);
    return this.processQueue();
  }
  
  async processQueue() {
    if (this.requestQueue.length === 0) return;
    
    const request = this.requestQueue.shift();
    
    try {
      // PATTERN: Try primary provider first, fallback on failure
      if (request.provider === 'groq') {
        return await this.callGroqAPI(request);
      } else {
        return await this.callClaudeAPI(request);
      }
    } catch (error) {
      // CRITICAL: Handle rate limiting with exponential backoff
      if (error.status === 429) {
        this.rateLimitDelay *= 2;
        setTimeout(() => this.processQueue(), this.rateLimitDelay);
        throw new Error('Rate limit exceeded, please try again');
      }
      
      // FALLBACK: Try alternative provider
      const fallbackProvider = request.provider === 'groq' ? 'claude' : 'groq';
      request.provider = fallbackProvider;
      return this.processQueue();
    }
  }
}

// Task 3: Content Script with Robust Text Selection
class SelectionHandler {
  constructor() {
    this.minSelectionLength = 10;
    this.overlay = null;
    this.lastSelection = null;
    
    // PATTERN: Use event delegation for performance
    document.addEventListener('mouseup', this.handleSelection.bind(this));
    document.addEventListener('touchend', this.handleSelection.bind(this));
  }
  
  handleSelection(event) {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    // VALIDATE: Minimum length and change detection
    if (selectedText.length < this.minSelectionLength || 
        selectedText === this.lastSelection) {
      return;
    }
    
    // GOTCHA: Handle special DOM cases
    const range = selection.getRangeAt(0);
    if (this.isInSpecialElement(range.commonAncestorContainer)) {
      return;
    }
    
    // CRITICAL: Calculate overlay position before DOM changes
    const selectionBounds = range.getBoundingClientRect();
    const overlayPosition = this.calculateOverlayPosition(selectionBounds);
    
    this.showOverlay(selectedText, overlayPosition);
    this.lastSelection = selectedText;
  }
  
  isInSpecialElement(element) {
    // PATTERN: Check for problematic DOM contexts
    const specialTags = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'];
    const specialClasses = ['no-tts', 'skip-tts'];
    
    let current = element;
    while (current && current !== document.body) {
      if (specialTags.includes(current.tagName) ||
          specialClasses.some(cls => current.classList?.contains(cls))) {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }
}
```

### Integration Points
```yaml
BROWSER APIs:
  - chrome.runtime: Message passing between service worker and content scripts
  - chrome.storage: Settings persistence across browser sessions
  - chrome.tts: Native browser TTS when available (Chrome/Edge)
  - speechSynthesis: Web Speech API fallback for all browsers

EXTERNAL APIs:
  - Groq API: Free AI explanations with rate limiting
  - Claude API: Premium AI features with CORS support
  - Both: Exponential backoff and request queuing required

STORAGE:
  - chrome.storage.sync: User settings and preferences (cross-device)
  - chrome.storage.local: Temporary data and cached responses
  - localStorage fallback: For browsers with limited extension storage

PERMISSIONS:
  - activeTab: Access to current tab content for text selection
  - storage: Persistent settings and temporary data storage
  - host_permissions: ["<all_urls>"] for universal text selection
  - Optional: tts permission for Chrome native TTS
```

## Validation Loop

### Level 1: Syntax & Style
```bash
# Run these FIRST - fix any errors before proceeding
npm run lint                     # ESLint validation with extension-specific rules
npm run format:check             # Prettier code formatting validation
npm run typecheck                # TypeScript type checking

# Expected: No errors. If errors, READ the error and fix.
```

### Level 2: Unit Tests each new feature/file/function use existing test patterns
```javascript
// CREATE tests/unit/tts-service.test.js with these test cases:
describe('TTSService', () => {
  test('should initialize with browser compatibility check', () => {
    const tts = new TTSService();
    expect(tts.isSupported()).toBe(true);
  });

  test('should handle text length validation', async () => {
    const tts = new TTSService();
    await expect(tts.speak('')).rejects.toThrow('Text length must be between 1 and 4000');
    await expect(tts.speak('a'.repeat(4001))).rejects.toThrow('Text length must be between 1 and 4000');
  });

  test('should find best voice with fallback strategy', () => {
    const tts = new TTSService();
    const voice = tts.findBestVoice('en-US', 'Google US English');
    expect(voice).toBeDefined();
  });

  test('should handle speech synthesis errors gracefully', async () => {
    const tts = new TTSService();
    // Mock speechSynthesis to throw error
    jest.spyOn(window.speechSynthesis, 'speak').mockImplementation(() => {
      throw new Error('Speech synthesis failed');
    });
    
    await expect(tts.speak('test')).rejects.toThrow();
  });
});

// CREATE tests/unit/ai-service.test.js
describe('AIService', () => {
  test('should queue requests for rate limiting', () => {
    const ai = new AIService();
    ai.explainText('test text 1');
    ai.explainText('test text 2');
    expect(ai.requestQueue.length).toBe(2);
  });

  test('should handle rate limit errors with exponential backoff', async () => {
    const ai = new AIService();
    // Mock API to return 429 rate limit error
    global.fetch = jest.fn(() => 
      Promise.resolve({ status: 429, json: () => Promise.resolve({}) })
    );
    
    await expect(ai.explainText('test')).rejects.toThrow('Rate limit exceeded');
    expect(ai.rateLimitDelay).toBeGreaterThan(1000);
  });
});
```

```bash
# Run and iterate until passing:
npm run test:unit
# If failing: Read error, understand root cause, fix code, re-run
```

### Level 3: Integration Test
```bash
# Build extension for testing
npm run build:chrome
npm run build:firefox

# Load extension in browsers for manual testing
npm run load:chrome        # Opens Chrome with extension loaded
npm run load:firefox       # Opens Firefox with extension loaded

# Test core workflow:
# 1. Navigate to https://example.com
# 2. Select text (minimum 10 characters)
# 3. Verify overlay appears within 300ms
# 4. Click play button - verify TTS starts
# 5. Click AI explain - verify explanation appears within 3 seconds

# Cross-browser automated testing
npm run test:e2e:chrome    # Chrome-specific E2E tests
npm run test:e2e:firefox   # Firefox-specific E2E tests
npm run test:cross-browser # All browsers

# Expected: All tests pass, no console errors, responsive behavior
```

### Level 4: Browser-Specific Validation
```bash
# Chrome Web Store validation
npm run validate:chrome
npm run validate:manifest
npm run validate:csp

# Firefox Add-ons validation  
npm run validate:firefox
web-ext lint --source-dir dist/firefox

# Performance testing
npm run test:performance   # Memory usage, load times
npm run analyze:chrome     # Bundle size analysis

# Expected: Pass all browser store requirements
```

## Final validation Checklist
- [ ] All unit tests pass: `npm run test:unit`
- [ ] Cross-browser E2E tests pass: `npm run test:cross-browser`
- [ ] No linting errors: `npm run lint`
- [ ] No type errors: `npm run typecheck`
- [ ] Manual testing successful in Chrome, Firefox, Safari
- [ ] TTS works with voice selection and language switching
- [ ] AI explanations work with both Groq and Claude APIs
- [ ] Overlay positioning works on mobile viewports
- [ ] Memory usage stays under 50MB during extended use
- [ ] Accessibility testing with screen readers passes
- [ ] CSP violations handled gracefully on complex websites
- [ ] Rate limiting works without breaking user experience
- [ ] Extension loads in under 1 second on typical websites

---

## Anti-Patterns to Avoid
- ❌ Don't use persistent background pages (Manifest V2 pattern)
- ❌ Don't rely on global variables in service workers  
- ❌ Don't ignore cross-browser API differences
- ❌ Don't skip CSP violation handling
- ❌ Don't hardcode API keys in source code
- ❌ Don't block UI thread with synchronous operations
- ❌ Don't assume all voices are available on all devices
- ❌ Don't send user data to AI APIs without explicit consent
- ❌ Don't ignore mobile browser extension limitations
- ❌ Don't skip accessibility testing and keyboard navigation

## Confidence Score: 9/10

**High confidence due to:**
- ✅ Comprehensive research on 2024 browser extension patterns
- ✅ Deep understanding of Manifest V3 service worker architecture  
- ✅ Detailed cross-browser compatibility strategies with fallbacks
- ✅ Proven AI API integration patterns with rate limiting
- ✅ Complete testing approach covering unit, integration, and E2E
- ✅ Real-world security and privacy considerations
- ✅ Mobile-responsive design with accessibility compliance
- ✅ Executable validation loops for iterative refinement

**Minor uncertainty around:**
- Safari iOS extension limitations requiring additional testing
- Specific voice availability variations across different devices
- Edge browser Web Speech API reliability in production

**Mitigation strategies included:**
- Comprehensive fallback mechanisms for TTS across browsers
- Progressive enhancement approach for AI features
- Extensive error handling and graceful degradation patterns