# Execute TTS Extension Production Ready Prompts

## Command: /tts-execute-prp $ARGUMENTS

Execute a TTS browser extension feature implementation using the specified PRP file from PRPs/prompts/ directory with comprehensive validation, cross-browser testing, and iterative refinement. This command ensures complete implementation with context7 integration, privacy compliance, accessibility support, and AI service integration (Groq/Claude APIs).

---

## Phase 1: Load and Analyze PRP 📋

### 1.1 Read TTS PRP File
```bash
# Load the specified TTS PRP file from prompts directory
cat PRPs/prompts/$ARGUMENTS

# Verify this is a TTS-specific PRP
grep -i "tts\|text-to-speech\|speech synthesis" PRPs/prompts/$ARGUMENTS
```

### 1.2 Context Verification
- [ ] **Objective** clearly understood
- [ ] **File references** accessible and reviewed
- [ ] **External documentation** URLs noted
- [ ] **Validation commands** executable
- [ ] **Success criteria** measurable

### 1.3 TTS Extension Dependency Check
```bash
# Verify browser extension development dependencies
npm list | grep -E "webpack|web-ext|playwright|jest"
cat package.json | grep -A30 "dependencies\|devDependencies"

# Check for extension-specific tools
which web-ext || echo "Install web-ext: npm install -g web-ext"
ls -la build/ || echo "Missing build directory - run npm run setup"

# Verify browser APIs are understood
grep -r "chrome.storage\|chrome.runtime\|speechSynthesis" src/ || echo "Missing browser API usage"

# Install missing TTS extension dependencies
npm install [missing-packages]
```

### 1.4 Context7 Documentation Integration
**CRITICAL**: Use context7 for real-time documentation access as specified in PRP:

```bash
# Verify context7 integration points from PRP
grep -n "use context7" PRPs/prompts/$ARGUMENTS

# Check for required external documentation references:
# - Groq API documentation and pricing
# - Claude API capabilities and rate limits
# - Web Speech API browser compatibility
# - Chrome Extension Manifest V3 requirements
# - Content Security Policy guidelines
# - Privacy compliance frameworks
```

### 1.5 TTS Extension Context Research (if needed)
If PRP lacks context, perform additional research:
```bash
# Find similar TTS/extension patterns in codebase
find . -name "*.js" -type f -exec grep -l "speechSynthesis\|chrome.runtime\|TTSService" {} \;

# Check extension structure patterns
ls -la src/background/ src/content/ src/popup/ src/options/

# Review existing browser extension tests
find . -name "*.test.js" -exec grep -l "chrome\|extension\|TTS" {} \;

# Check for AI service integration patterns
grep -r "groq\|claude\|AI\|explanation" src/

# Review cross-browser compatibility
ls -la build/webpack.*.js
```

---

## Phase 2: ULTRATHINK - TTS Extension Planning 🧠

### 2.1 TTS Implementation Strategy
Create a detailed mental model for browser extension development:
```javascript
/*
TTS EXTENSION ARCHITECTURE THINKING:
1. Service Worker (background) vs Content Script responsibilities
2. Cross-context messaging patterns (runtime.sendMessage)
3. Browser API compatibility (Chrome, Firefox, Safari, Edge)
4. Web Speech API integration and fallback strategies
5. AI service communication (Groq/Claude) with privacy controls
6. Extension storage patterns (chrome.storage.sync vs local)
7. Content Security Policy compliance (no inline scripts)
8. Accessibility requirements (WCAG 2.1 AA)
9. Cross-browser testing strategy
10. Performance monitoring (memory usage, response times)
*/
```

### 2.2 Context7 Documentation Access
**IMPORTANT**: Before implementation, use context7 to fetch current documentation for all external APIs and frameworks referenced in the PRP:

```markdown
## Context7 Integration Requirements
- use context7 to fetch Groq API documentation for latest models and rate limits
- use context7 to get Claude API specifications for authentication and pricing
- use context7 for Web Speech API browser compatibility matrix  
- use context7 for Chrome Extension Manifest V3 security requirements
- use context7 for Content Security Policy compliance guidelines
- use context7 for accessibility standards (WCAG 2.1 AA) implementation
- use context7 for cross-browser extension development best practices
```

### 2.3 Task Breakdown with TODOs
Use TodoWrite tool to create implementation plan:

```markdown
## Implementation TODOs

### Extension Foundation Tasks
- [ ] Create manifest.json with Manifest V3 compliance
- [ ] Set up service worker (background script)
- [ ] Configure content script injection
- [ ] Define cross-context messaging structure
- [ ] Set up build system for multiple browsers

### TTS Core Implementation
- [ ] Implement Web Speech API wrapper service
- [ ] Create text selection detection and handling
- [ ] Build TTS overlay UI with accessibility
- [ ] Add voice selection and customization
- [ ] Handle speech synthesis errors and recovery
- [ ] Implement speech queue management

### AI Service Integration
- [ ] Set up Groq API client with rate limiting
- [ ] Configure Claude API fallback service
- [ ] Implement privacy consent management
- [ ] Add local explanation fallbacks
- [ ] Create secure API key storage
- [ ] Handle AI service errors gracefully

### Cross-Browser Compatibility
- [ ] Chrome extension optimization
- [ ] Firefox WebExtension configuration
- [ ] Safari extension format support
- [ ] Edge compatibility testing
- [ ] Browser API polyfill integration

### Testing & Validation
- [ ] Unit tests for TTS services
- [ ] Integration tests for AI communication
- [ ] Cross-browser E2E tests
- [ ] Accessibility compliance testing
- [ ] Performance benchmarking
- [ ] Security vulnerability scanning

### Privacy & Security
- [ ] Content Security Policy compliance (use context7 for current CSP guidelines)
- [ ] User consent management implementation (GDPR/CCPA compliance)
- [ ] API key encryption and secure storage patterns
- [ ] Request sanitization and validation (prevent XSS/injection)
- [ ] Cross-origin request security (CORS handling)
- [ ] Extension permission minimization (principle of least privilege)
- [ ] Data retention and deletion policies
- [ ] Privacy-first design patterns (explicit consent dialogs)
```

### 2.4 TTS Extension Pattern Identification
Review and document browser extension patterns to follow:
```javascript
// Document TTS extension patterns found in codebase
const ttsExtensionPatterns = {
  manifestVersion: "Manifest V3 with service worker",
  backgroundScript: "Service worker with message handling",
  contentScript: "Text selection and overlay management",
  crossContextComm: "chrome.runtime.sendMessage with correlation IDs",
  storage: "chrome.storage.sync for settings, .local for cache",
  ttsIntegration: "Web Speech API with cross-browser compatibility",
  aiServices: "Multi-provider (Groq + Claude) with fallbacks",
  testing: "Jest + Playwright for cross-browser E2E",
  errorHandling: "Global error boundary with sanitized logging",
  privacy: "Explicit consent dialogs and data minimization",
  accessibility: "WCAG 2.1 AA with keyboard navigation support",
  performance: "Memory monitoring and response time tracking"
};
```

---

## Phase 3: Execute TTS Extension Implementation 🚀

### 3.1 TTS Extension File Structure Creation
```bash
# Create core extension structure
mkdir -p src/background src/content src/popup src/options src/shared

# Background service worker files
touch src/background/service-worker.js
touch src/background/ai-service.js
touch src/background/message-handler.js

# Content script files
touch src/content/content-script.js
touch src/content/text-selector.js
touch src/content/tts-overlay.js
touch src/content/tts-controller.js

# Shared services
touch src/shared/tts-service.js
touch src/shared/storage-manager.js
touch src/shared/privacy-manager.js
touch src/shared/browser-compat.js
touch src/shared/error-handler.js

# Extension UI
touch src/popup/popup.html src/popup/popup.js src/popup/popup.css
touch src/options/options.html src/options/options.js src/options/options.css

# Testing structure
mkdir -p tests/unit tests/integration tests/e2e
touch tests/unit/tts-service.test.js
touch tests/integration/ai-service.test.js
touch tests/e2e/tts-workflow.spec.js

# Browser-specific builds
mkdir -p build manifests
touch manifests/chrome.json manifests/firefox.json manifests/safari.json
```

### 3.2 Progressive Implementation

#### Step 1: Extension Manifest & Configuration
```javascript
// Start with manifest.json (Manifest V3)
// manifests/chrome.json
{
  "manifest_version": 3,
  "name": "Intelligent TTS Extension",
  "version": "1.0.0",
  "permissions": ["storage", "activeTab", "scripting"],
  "background": {
    "service_worker": "background/service-worker.js"
  },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content/content-script.js"],
    "css": ["assets/overlay.css"]
  }],
  "action": {
    "default_popup": "popup/popup.html",
    "default_title": "TTS Extension"
  }
}
```

#### Step 2: Service Worker Foundation
```javascript
// Build service worker incrementally
// src/background/service-worker.js

// Extension lifecycle management
chrome.runtime.onStartup.addListener(() => {
  console.log('[TTS Extension] Service worker started');
  initializeExtension();
});

chrome.runtime.onInstalled.addListener((details) => {
  console.log('[TTS Extension] Extension installed:', details.reason);
  if (details.reason === 'install') {
    setupDefaultSettings();
  }
});

// Cross-context messaging
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender, sendResponse);
  return true; // Keep message channel open for async responses
});

// Initial functions (to be implemented)
function initializeExtension() {
  // Initialize AI services, load settings
}

function setupDefaultSettings() {
  // Set default TTS and AI preferences
}

function handleMessage(message, sender, sendResponse) {
  // Route messages to appropriate handlers
}
```

#### Step 3: Content Script & TTS Integration
```javascript
// src/content/content-script.js

// Initialize TTS functionality on page load
(function initializeTTSExtension() {
  // Check if extension context is valid
  if (!chrome.runtime?.id) {
    console.warn('[TTS Extension] Extension context invalidated');
    return;
  }

  // Initialize text selection handling
  const textSelector = new TextSelectionHandler();
  const ttsOverlay = new TTSOverlay();
  const ttsController = new TTSController();
  
  // Set up event listeners
  setupEventListeners();
  
  console.log('[TTS Extension] Content script initialized');
})();

function setupEventListeners() {
  // Text selection events
  document.addEventListener('mouseup', handleTextSelection);
  document.addEventListener('touchend', handleTextSelection);
  document.addEventListener('keyup', handleKeyboardSelection);
  
  // Extension cleanup on page unload
  window.addEventListener('beforeunload', cleanupExtension);
}
```

#### Step 4: TTS Service Implementation
**IMPORTANT**: use context7 to fetch Web Speech API browser compatibility data

```javascript
// src/shared/tts-service.js

class TTSService {
  constructor() {
    this.synthesis = window.speechSynthesis;
    this.voices = [];
    this.currentUtterance = null;
    this.isInitialized = false;
    this.supportedLanguages = ['en', 'es', 'fr', 'de', 'ur', 'ar', 'hi']; // 15+ languages
    
    this.initialize();
  }
  
  async initialize() {
    // Cross-browser compatibility check
    if (!this.synthesis) {
      throw new Error('Speech Synthesis not supported in this browser');
    }
    
    // Load available voices with retry logic
    await this.loadVoicesWithRetry();
    
    // Get user settings from chrome.storage
    const settings = await this.getSettingsFromStorage();
    this.applySettings(settings);
    
    this.isInitialized = true;
  }
  
  async loadVoicesWithRetry(maxRetries = 3) {
    // Chrome requires voice loading with retry logic
    for (let i = 0; i < maxRetries; i++) {
      this.voices = this.synthesis.getVoices();
      if (this.voices.length > 0) break;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  async speak(text, options = {}) {
    if (!this.isInitialized) {
      throw new Error('TTS service not initialized');
    }
    
    // Sanitize text input (security)
    const sanitizedText = this.sanitizeText(text);
    
    // Create and configure utterance
    const utterance = new SpeechSynthesisUtterance(sanitizedText);
    this.configureUtteranceForAccessibility(utterance, options);
    
    // Return promise for completion with error handling
    return new Promise((resolve, reject) => {
      utterance.onend = () => resolve({ success: true, duration: utterance.elapsedTime });
      utterance.onerror = (error) => {
        console.error('[TTS Service] Speech error:', error);
        reject(new Error(`Speech synthesis failed: ${error.error}`));
      };
      
      // Queue management for multiple requests
      this.synthesis.speak(utterance);
      this.currentUtterance = utterance;
    });
  }
  
  sanitizeText(text) {
    // Prevent XSS and sanitize input
    return text.replace(/<script[^>]*>.*?<\/script>/gi, '')
               .replace(/<[^>]+>/g, '')
               .trim();
  }
  
  configureUtteranceForAccessibility(utterance, options) {
    // WCAG 2.1 AA compliance settings
    utterance.rate = options.rate || 1.0; // Normal speed
    utterance.pitch = options.pitch || 1.0; // Normal pitch
    utterance.volume = options.volume || 0.8; // 80% volume
    
    // Language detection and voice selection
    const detectedLang = this.detectLanguage(utterance.text);
    const voice = this.selectBestVoice(detectedLang, options.voiceGender);
    if (voice) utterance.voice = voice;
  }
}
```

#### Step 5: AI Service Integration
**CRITICAL**: use context7 to fetch current Groq and Claude API documentation

```javascript
// src/background/ai-service.js

class AIExplanationService {
  constructor() {
    this.providers = {
      groq: { 
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        rateLimit: 100, // requests per hour (check context7 for current limits)
        model: 'mixtral-8x7b-32768' // use context7 for latest models
      },
      claude: { 
        endpoint: 'https://api.anthropic.com/v1/messages',
        rateLimit: 60, // requests per minute (check context7 for current limits)
        model: 'claude-3-haiku-20240307' // use context7 for latest models
      }
    };
    this.rateLimiters = this.initializeRateLimiters();
    this.privacyManager = new PrivacyManager();
  }
  
  async explainText(text, userConsent, language = 'en') {
    // GDPR/CCPA compliance - explicit consent required
    if (!userConsent || !await this.privacyManager.hasValidConsent()) {
      return this.getLocalFallback(text, language);
    }
    
    // Data minimization - sanitize and limit text length
    const sanitizedText = this.sanitizeAndLimitText(text, 500);
    
    // Try providers in order with comprehensive error handling
    const providers = ['groq', 'claude'];
    for (const provider of providers) {
      try {
        if (this.canMakeRequest(provider)) {
          const explanation = await this.requestExplanation(provider, sanitizedText, language);
          
          // Log successful API usage (anonymized)
          this.logAPIUsage(provider, 'success', sanitizedText.length);
          return explanation;
        }
      } catch (error) {
        console.warn(`[AI Service] ${provider} failed:`, error.message);
        this.logAPIUsage(provider, 'error', sanitizedText.length, error.message);
        continue;
      }
    }
    
    // All providers failed - return enhanced local fallback
    console.info('[AI Service] All providers failed, using local fallback');
    return this.getEnhancedLocalFallback(sanitizedText, language);
  }
  
  sanitizeAndLimitText(text, maxLength) {
    // Security: Remove potential injection attempts
    const sanitized = text.replace(/<script[^>]*>.*?<\/script>/gi, '')
                         .replace(/<[^>]+>/g, '')
                         .replace(/javascript:/gi, '')
                         .trim();
    
    // Privacy: Limit text length to reduce data exposure
    return sanitized.length > maxLength ? 
           sanitized.substring(0, maxLength) + '...' : sanitized;
  }
  
  async requestExplanation(provider, text, language) {
    const apiKey = await this.getSecureAPIKey(provider);
    if (!apiKey) {
      throw new Error(`No API key found for ${provider}`);
    }
    
    const request = this.buildProviderRequest(provider, text, language);
    const response = await this.makeSecureAPICall(provider, request, apiKey);
    
    return this.parseProviderResponse(provider, response, language);
  }
  
  async getSecureAPIKey(provider) {
    // Secure API key retrieval from chrome.storage with encryption
    const { [provider + '_api_key']: encryptedKey } = await chrome.storage.sync.get([provider + '_api_key']);
    return encryptedKey ? this.decryptAPIKey(encryptedKey) : null;
  }
  
  buildProviderRequest(provider, text, language) {
    const prompts = {
      en: `Provide a clear, concise explanation of the following text in simple terms: "${text}"`,
      es: `Proporciona una explicación clara y concisa del siguiente texto en términos simples: "${text}"`,
      fr: `Fournissez une explication claire et concise du texte suivant en termes simples: "${text}"`,
      // Add more languages as supported
    };
    
    const prompt = prompts[language] || prompts.en;
    
    if (provider === 'groq') {
      return {
        model: this.providers.groq.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.7
      };
    } else if (provider === 'claude') {
      return {
        model: this.providers.claude.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        system: 'You are a helpful assistant that explains text in simple, accessible language.'
      };
    }
  }
  
  getEnhancedLocalFallback(text, language) {
    // Enhanced local processing with basic NLP
    const fallbackMessages = {
      en: 'This text appears to discuss: ',
      es: 'Este texto parece tratar sobre: ',
      fr: 'Ce texte semble traiter de: ',
    };
    
    const prefix = fallbackMessages[language] || fallbackMessages.en;
    const keywords = this.extractKeywords(text, language);
    
    return {
      success: true,
      explanation: prefix + keywords.slice(0, 5).join(', '),
      source: 'local_fallback',
      confidence: 0.6
    };
  }
}
```

#### Step 6: Cross-Browser Testing Setup
```javascript
// tests/e2e/tts-workflow.spec.js
const { test, expect } = require('@playwright/test');

// Test across multiple browsers
['chromium', 'firefox', 'webkit'].forEach(browserName => {
  test.describe(`TTS Extension E2E - ${browserName}`, () => {
    test.use({ browserName });
    
    test('complete TTS workflow', async ({ page, context }) => {
      // Load extension and test TTS functionality
      await setupExtensionContext(context);
      await page.goto('https://example.com');
      
      // Test text selection and TTS activation
      await testTextSelectionAndTTS(page);
      
      // Test AI explanation feature
      await testAIExplanation(page);
      
      // Verify accessibility compliance
      await testAccessibilityFeatures(page);
    });
  });
});
```

### 3.3 Continuous Validation
After each major change:
```bash
# TypeScript check
npm run tsc --noEmit

# Lint check
npm run lint

# Test current implementation
npm test -- --watchAll=false
```

---

## Phase 4: Validate Implementation ✅

### 4.1 Run All Validation Commands
Execute each validation from the PRP:

```bash
# 1. TypeScript compilation
npm run tsc --noEmit
# If fails: Fix type errors, check imports

# 2. Linting
npm run lint --fix
# If fails: Apply auto-fixes, resolve remaining issues

# 3. Formatting
npm run format
# Auto-formats code to project standards

# 4. Unit Tests
npm test -- --coverage --watchAll=false
# If fails: Debug failing tests, check assertions

# 5. Build Verification
npm run build
# If fails: Check for compilation errors, missing dependencies
```

### 4.2 Error Resolution Workflow
For each failure:
1. **Identify** the specific error
2. **Reference** PRP's "Common Issues & Solutions"
3. **Search** codebase for similar error fixes
4. **Apply** fix
5. **Re-validate** specific command
6. **Repeat** until passing

### 4.3 TTS Extension-Specific Performance Validation
```bash
# Extension bundle size check (must be <50MB total)
npm run build:all  # Build for all browsers
du -sh build/chrome/ build/firefox/ build/safari/ build/edge/

# Memory usage monitoring
npm run test:memory
# Should use <50MB during operation

# TTS response time testing
npm run test:performance
# Overlay should appear within 300ms of text selection
# Speech should start within 500ms of activation

# AI explanation performance
npm run test:ai-performance
# Explanations should generate within 3 seconds
# Rate limiting should prevent API abuse

# Cross-browser extension validation
npm run validate:manifest:all
# Validates manifests for Chrome, Firefox, Safari, Edge

# Accessibility performance audit
npm run test:a11y:performance
# Screen reader compatibility test
# Keyboard navigation timing test

# Security scan
npm run security:scan
# Check for vulnerabilities in dependencies
# Validate Content Security Policy compliance
```

---

## Phase 5: Complete and Verify 🎯

### 5.1 Final Checklist
Review all items from PRP:
- [ ] All TypeScript types defined
- [ ] Component renders without errors
- [ ] All props properly typed
- [ ] State management implemented
- [ ] Error states handled
- [ ] Loading states implemented
- [ ] Tests passing with >80% coverage
- [ ] Accessibility requirements met
- [ ] Responsive design working
- [ ] Code follows existing patterns

### 5.2 Integration Testing
```bash
# Start development server
npm start

# Manual testing checklist:
- [ ] Component renders in app context
- [ ] User interactions work as expected
- [ ] No console errors or warnings
- [ ] Network requests successful
- [ ] State updates correctly
- [ ] Error boundaries catch errors
```

### 5.3 Documentation Update
```markdown
# Update relevant documentation
- [ ] Component README if needed
- [ ] Storybook stories if applicable
- [ ] API documentation
- [ ] Props documentation with examples
```

### 5.4 Final Validation Suite
```bash
# Run complete validation
npm run validate:all || (
  npm run tsc --noEmit &&
  npm run lint &&
  npm run test -- --coverage &&
  npm run build
)
```

---

## Phase 6: Reference and Iterate 🔄

### 6.1 Re-read PRP
```bash
# Review PRP again to ensure nothing missed
cat PRPs/$ARGUMENTS

# Check each section:
- [ ] Objective fully met
- [ ] All patterns followed
- [ ] All validations passing
- [ ] Success criteria achieved
```

### 6.2 TTS Extension Performance Review
- **Bundle size**: Extension packages within browser store limits?
- **Memory usage**: <50MB during TTS operation?
- **Response times**: Overlay <300ms, speech <500ms, AI explanations <3s?
- **Cross-browser compatibility**: All features work on Chrome 88+, Firefox 78+, Safari 14+, Edge 88+?
- **Accessibility performance**: Screen reader response times acceptable?
- **Test coverage**: >85% coverage with cross-browser E2E tests?
- **Security validation**: No vulnerabilities, CSP compliant?
- **Privacy compliance**: No data leakage, proper consent handling?

### 6.3 Code Quality Review
```typescript
// Self-review checklist
const codeQuality = {
  readable: "Can another dev understand this?",
  maintainable: "Easy to modify/extend?",
  testable: "Well-tested with good coverage?",
  performant: "Optimized where necessary?",
  accessible: "WCAG compliant?",
  documented: "Self-documenting with comments where needed?"
};
```

---

## Completion Report Template 📊

```markdown
## Implementation Complete: [Feature Name]

### Summary
- **PRP File**: $ARGUMENTS
- **Implementation Time**: X hours
- **Files Created/Modified**: Y files
- **Test Coverage**: Z%

### Validation Results
- ✅ TypeScript compilation: PASS
- ✅ Linting: PASS
- ✅ Tests: PASS (X tests)
- ✅ Build: PASS
- ✅ Coverage: X%

### Implementation Notes
- [Any deviations from PRP]
- [Challenges encountered]
- [Additional improvements made]

### Next Steps
- [ ] Code review
- [ ] Deploy to staging
- [ ] Performance monitoring
- [ ] User acceptance testing
```

---

## Error Recovery Patterns 🔧

### Common React/TypeScript Issues

| Error Type | Quick Fix | Detailed Solution |
|------------|-----------|-------------------|
| `Cannot find module` | Check imports and paths | Verify tsconfig paths, check case sensitivity |
| `Type 'X' is not assignable` | Fix type definitions | Review interface/type, use proper generics |
| `Hook called conditionally` | Move hook to top level | Ensure hooks not in conditions/loops |
| `Missing dependency` | Add to useEffect deps | Include all referenced values |
| `Test timeout` | Add async/await | Use waitFor, increase timeout |
| `Build fails` | Check for type errors | Run tsc separately, fix all errors |

### Recovery Commands
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clear cache
npm cache clean --force

# Reset TypeScript cache
rm -rf tsconfig.tsbuildinfo

# Fresh build
rm -rf build dist
npm run build
```

---

## Notes for Claude Code 📝

### Execution Priority
1. **Type Safety First**: Define all types before implementation
2. **Test Early**: Write tests as you implement
3. **Incremental Progress**: Commit working states frequently
4. **Validate Often**: Run checks after each component section

### When Stuck
1. Reference similar components in codebase
2. Check PRP's "Common Issues & Solutions"
3. Search for patterns in test files
4. Use web search for library-specific issues
5. Simplify to minimal working version, then enhance

### Success Indicators
- No TypeScript errors
- All tests passing
- Component renders without warnings
- Meets all PRP success criteria
- Follows established patterns

Remember: The goal is complete, working implementation that passes all validations and follows project conventions.