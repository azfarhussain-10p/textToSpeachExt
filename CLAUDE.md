# Security audits
npm run audit                  # Dependency vulnerability scan
npm run csp:validate          # Content Security Policy validation

# Extension store validation
npm run validate:chrome       # Chrome Web Store requirements
npm run validate:firefox      # Firefox Add-ons requirements
npm run validate:safari       # Safari Extensions requirements
```

### Continuous Integration Pipeline

```yaml
# .github/workflows/ci.yml
name: Extension CI/CD Pipeline

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run test:unit
      - run: npm run build:all
      
  cross-browser-test:
    needs: test
    strategy:
      matrix:
        browser: [chrome, firefox]
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:e2e:${{ matrix.browser }}
```

## 🚨 Critical Error Handling

### Extension Error Recovery

```javascript
// Robust error handling for extension context
class ExtensionErrorHandler {
  constructor() {
    this.setupGlobalErrorHandlers();
  }

  setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError('Unhandled Promise Rejection', event.reason);
      event.preventDefault();
    });

    // Handle general JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError('JavaScript Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });
  }

  logError(type, details) {
    // Log to extension console and storage
    console.error(`[TTS Extension] ${type}:`, details);
    
    // Store error for debugging (with user consent)
    this.storeErrorForDebugging(type, details);
  }

  async storeErrorForDebugging(type, details) {
    try {
      const settings = await browser.storage.sync.get(['debugMode']);
      if (settings.debugMode) {
        const errorLog = {
          type,
          details,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        };
        
        // Store in local storage (limit to last 50 errors)
        const { errors = [] } = await browser.storage.local.get(['errors']);
        errors.push(errorLog);
        if (errors.length > 50) errors.shift();
        
        await browser.storage.local.set({ errors });
      }
    } catch (err) {
      console.error('Failed to store error log:', err);
    }
  }
}
```

### Graceful Degradation

```javascript
// Graceful degradation for core features
class FeatureManager {
  constructor() {
    this.features = {
      tts: this.checkTTSSupport(),
      ai: this.checkAIConnectivity(),
      storage: this.checkStorageSupport()
    };
  }

  checkTTSSupport() {
    return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  }

  async checkAIConnectivity() {
    try {
      // Simple connectivity check
      const response = await fetch('https://api.groq.com/health', {
        method: 'HEAD',
        timeout: 5000
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  checkStorageSupport() {
    return typeof browser !== 'undefined' && browser.storage;
  }

  getAvailableFeatures() {
    return Object.entries(this.features)
      .filter(([, available]) => available)
      .map(([feature]) => feature);
  }
}
```

## 📚 Documentation Standards

### Code Documentation

```javascript
/**
 * Text-to-Speech Service for browser extension
 * 
 * Handles speech synthesis across different browsers with fallback support.
 * Supports multiple languages, voice selection, and playback controls.
 * 
 * @example
 * ```javascript
 * const tts = new TTSService();
 * await tts.speak('Hello world', { language: 'en-US', rate: 1.2 });
 * ```
 */
class TTSService {
  /**
   * Initialize TTS service with browser compatibility checks
   * 
   * @throws {Error} When speech synthesis is not supported
   */
  constructor() {
    if (!this.checkBrowserSupport()) {
      throw new Error('Speech synthesis not supported in this browser');
    }
    // Implementation...
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
   * @throws {Error} When text exceeds length limit or voice not found
   * 
   * @example
   * ```javascript
   * // Basic usage
   * await tts.speak('Hello world');
   * 
   * // With options
   * await tts.speak('مرحبا بالعالم', {
   *   language: 'ar-SA',
   *   rate: 0.8,
   *   pitch: 1.2
   * });
   * ```
   */
  async speak(text, options = {}) {
    // Implementation with comprehensive error handling
  }
}
```

### API Documentation

```markdown
# Extension API Documentation

## Content Script API

### Text Selection Events

The extension automatically detects text selection and provides an overlay interface.

#### Event Flow:
1. User selects text on webpage
2. Extension validates selection (minimum 10 characters)
3. Overlay appears near selection
4. User can interact with TTS controls

#### Configuration:
```javascript
{
  "selectionThreshold": 10,        // Minimum characters to show overlay
  "overlayDelay": 300,            // Delay before showing overlay (ms)
  "autoHideDelay": 10000          // Auto-hide overlay after inactivity (ms)
}
```

### TTS Controls

#### play()
Starts text-to-speech for selected text.

#### pause()
Pauses current speech. Can be resumed with resume().

#### stop()
Stops current speech and resets playback position.

#### setVoice(voiceId)
Changes the current voice for speech synthesis.

### AI Explanation

#### explainText(text, context)
Requests AI explanation of selected text.

**Parameters:**
- `text` (string): Selected text to explain
- `context` (object): Additional context about the source

**Returns:** Promise resolving to explanation object

```javascript
{
  explanation: "Simple explanation of the text...",
  examples: ["Example 1", "Example 2"],
  complexity: "intermediate",
  readingTime: 45
}
```
```

## 🔄 Development Workflow

### Context Engineering with Cursor IDE

```json
// .cursor/settings.json - Cursor IDE configuration
{
  "ai.contextFiles": [
    "CLAUDE.md",
    "INITIAL.md",
    "PRPs/**/*.md"
  ],
  "ai.enabledLanguages": ["javascript", "typescript", "json", "css", "html"],
  "ai.customPrompts": {
    "extension-debug": "Debug this browser extension code. Focus on cross-browser compatibility and Manifest V3 requirements.",
    "tts-optimize": "Optimize this text-to-speech code for performance and memory usage.",
    "ai-integration": "Review this AI service integration for privacy and error handling."
  }
}
```

### Git Workflow for Extension Development

```bash
# Feature branch strategy
git checkout -b feature/tts-overlay-ui
git checkout -b feature/ai-explanation-service
git checkout -b fix/firefox-compatibility

# Commit message conventions
git commit -m "feat(tts): add multi-language voice selection"
git commit -m "fix(overlay): resolve positioning on mobile Safari"
git commit -m "docs(api): update TTS service documentation"

# Pre-commit hooks
npm run pre-commit  # Runs lint, test, and type checking
```

## 🌐 Internationalization & Accessibility

### Multi-Language Support

```javascript
// i18n implementation for extension UI
class I18nManager {
  constructor() {
    this.locale = browser.i18n.getUILanguage();
    this.messages = {};
    this.loadMessages();
  }

  async loadMessages() {
    const localeData = await fetch(browser.runtime.getURL(`_locales/${this.locale}/messages.json`));
    this.messages = await localeData.json();
  }

  getMessage(key, substitutions = []) {
    const message = this.messages[key];
    if (!message) return key;
    
    let text = message.message;
    substitutions.forEach((sub, index) => {
      text = text.replace(`$${index + 1}`, sub);
    });
    
    return text;
  }
}

// Usage in overlay
const i18n = new I18nManager();
playButton.textContent = i18n.getMessage('play_button');
pauseButton.textContent = i18n.getMessage('pause_button');
```

### Accessibility Features

```javascript
// ARIA and keyboard support
class AccessibleOverlay {
  constructor() {
    this.setupKeyboardNavigation();
    this.setupScreenReaderSupport();
  }

  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      if (!this.isVisible) return;
      
      switch (e.key) {
        case 'Escape':
          this.hide();
          break;
        case 'Space':
          e.preventDefault();
          this.togglePlayPause();
          break;
        case 'Tab':
          this.focusNextControl();
          break;
      }
    });
  }

  setupScreenReaderSupport() {
    this.overlay.setAttribute('role', 'dialog');
    this.overlay.setAttribute('aria-label', 'Text-to-Speech Controls');
    this.overlay.setAttribute('aria-live', 'polite');
    
    // Announce status changes
    this.announceStatus = (message) => {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'assertive');
      announcement.className = 'sr-only';
      announcement.textContent = message;
      document.body.appendChild(announcement);
      
      setTimeout(() => document.body.removeChild(announcement), 1000);
    };
  }
}
```

## 🔍 Debug & Monitoring

### Extension Debugging

```javascript
// Debug utilities for development
class ExtensionDebugger {
  constructor() {
    this.enabled = process.env.NODE_ENV === 'development';
  }

  log(category, message, data = {}) {
    if (!this.enabled) return;
    
    console.group(`[TTS-Extension] ${category}`);
    console.log(message);
    if (Object.keys(data).length > 0) {
      console.table(data);
    }
    console.groupEnd();
  }

  logTTSEvent(event, details) {
    this.log('TTS', `Event: ${event}`, details);
  }

  logAIRequest(provider, text, response) {
    this.log('AI', `Request to ${provider}`, {
      textLength: text.length,
      responseLength: response.length,
      timestamp: new Date().toISOString()
    });
  }

  exportLogs() {
    // Export debug logs for support
    const logs = this.getLogs();
    const blob = new Blob([JSON.stringify(logs, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tts-extension-logs-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }
}
```

### Performance Monitoring

```javascript
// Performance tracking for optimization
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
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
  }

  reportMetric(label, value) {
    // Send metrics to analytics (with user consent)
    if (this.hasAnalyticsConsent()) {
      // Simple metric collection
      console.log(`Performance: ${label} took ${value.toFixed(2)}ms`);
    }
  }

  measureTTSPerformance() {
    return {
      voiceLoadTime: this.measureVoiceLoading(),
      speechStartDelay: this.measureSpeechStart(),
      overlayRenderTime: this.measureOverlayRender()
    };
  }
}
```

## 📦 Build & Deployment

### Multi-Browser Build Configuration

```javascript
// webpack.config.js - Multi-browser build setup
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const { EnvironmentPlugin } = require('webpack');

module.exports = (env, argv) => {
  const browser = env.browser || 'chrome';
  const mode = argv.mode || 'development';

  return {
    entry: {
      'background': './src/background/service-worker.js',
      'content': './src/content/content-script.js',
      'popup': './src/popup/popup.js'
    },
    
    output: {
      path: path.resolve(__dirname, `dist/${browser}`),
      filename: '[name].js'
    },

    plugins: [
      new EnvironmentPlugin({
        BROWSER: browser,
        NODE_ENV: mode,
        GROQ_API_KEY: process.env.GROQ_API_KEY,
        CLAUDE_API_KEY: process.env.CLAUDE_API_KEY
      }),
      
      new CopyPlugin({
        patterns: [
          {
            from: `src/manifest.${browser}.json`,
            to: 'manifest.json'
          },
          {
            from: 'src/assets',
            to: 'assets'
          },
          {
            from: 'src/_locales',
            to: '_locales'
          }
        ]
      })
    ]
  };
};
```

### Deployment Scripts

```json
{
  "scripts": {
    "build:chrome": "webpack --env browser=chrome --mode=production",
    "build:firefox": "webpack --env browser=firefox --mode=production",
    "build:safari": "webpack --env browser=safari --mode=production",
    "build:all": "npm run build:chrome && npm run build:firefox && npm run build:safari",
    
    "package:chrome": "cd dist/chrome && zip -r ../../chrome-extension.zip .",
    "package:firefox": "cd dist/firefox && zip -r ../../firefox-addon.zip .",
    "package:safari": "xcrun safari-web-extension-converter dist/safari --app-name 'TTS Extension'",
    
    "publish:chrome": "webstore upload --source chrome-extension.zip --extension-id $CHROME_EXTENSION_ID",
    "publish:firefox": "web-ext sign --source-dir dist/firefox --api-key $FIREFOX_API_KEY --api-secret $FIREFOX_API_SECRET"
  }
}
```

## ⚠️ Critical Implementation Notes

### **NEVER IGNORE These Requirements**

1. **Manifest V3 Compliance**: All new Chrome extensions must use Manifest V3. No exceptions.

2. **Content Security Policy**: Never use `eval()`, inline scripts, or external resources in content scripts.

3. **Privacy First**: Always get user consent before sending data to AI services. Implement local fallbacks.

4. **Cross-Browser Testing**: Test on Chrome, Firefox, Safari, and Edge before each release.

5. **Memory Management**: Extensions can be killed by browsers if they use too much memory. Implement cleanup.

6. **Rate Limiting**: AI APIs have limits. Implement queuing and fallback strategies.

7. **Mobile Considerations**: Touch targets, overlay positioning, and performance are critical on mobile.

8. **Accessibility**: Screen readers, keyboard navigation, and high contrast support are required.

## 🚀 Success Metrics

### Key Performance Indicators

- **Functionality**: TTS works on 95% of websites
- **Performance**: Overlay appears within 300ms of selection
- **Compatibility**: Works on Chrome, Firefox, Safari, Edge
- **User Experience**: Less than 2 clicks to start speech
- **AI Integration**: Explanations generated within 3 seconds
- **Privacy**: Zero user data collected without explicit consent
- **Accessibility**: Full keyboard and screen reader support

### Quality Gates Checklist

- [ ] All unit tests pass (>85% coverage)
- [ ] E2E tests pass on all target browsers
- [ ] Memory usage stays under 50MB
- [ ] No CSP violations
- [ ] AI fallbacks work when APIs are down
- [ ] Overlay positioning works on mobile
- [ ] Keyboard navigation is fully functional
- [ ] Screen reader announces all actions
- [ ] Extension loads in under 1 second
- [ ] Privacy policy covers all data usage

---

*This document is the definitive guide for building the Text-to-Speech Browser Extension. Update it as new patterns and requirements emerge during development.*