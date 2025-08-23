# 🏗️ Project Structure - TTS Extension

Complete architecture and planning documentation for the Intelligent Text-to-Speech Browser Extension.

## 📋 Table of Contents
- [Directory Structure](#directory-structure)
- [Architecture Overview](#architecture-overview)
- [Implementation Roadmap](#implementation-roadmap)
- [Quality Gates Checklist](#quality-gates-checklist)
- [Success Metrics](#success-metrics)
- [Browser-Specific Configurations](#browser-specific-configurations)

## 📁 Directory Structure

### Complete Project Layout (To Be Implemented)
```
textToSpeachExt/
├── src/                          # Main source code
│   ├── background/               # Background script (Service Worker)
│   │   ├── service-worker.js     # Main background service
│   │   ├── ai-service.js         # AI API integrations
│   │   └── storage-manager.js    # Settings and data management
│   ├── content/                  # Content scripts
│   │   ├── content-script.js     # Main content script
│   │   ├── text-selector.js      # Text selection handler
│   │   ├── overlay.js            # TTS overlay UI
│   │   └── tts-controller.js     # Speech synthesis controller
│   ├── popup/                    # Extension popup
│   │   ├── popup.html            # Popup interface
│   │   ├── popup.js              # Popup logic
│   │   └── popup.css             # Popup styling
│   ├── options/                  # Settings page
│   │   ├── options.html          # Settings interface
│   │   ├── options.js            # Settings logic
│   │   └── options.css           # Settings styling
│   ├── services/                 # Shared services
│   │   ├── tts-service.js        # Text-to-speech service
│   │   ├── ai-explanation.js     # AI explanation service
│   │   ├── i18n-service.js       # Internationalization
│   │   └── analytics.js          # Privacy-first analytics
│   ├── utils/                    # Utility functions
│   │   ├── browser-compat.js     # Cross-browser compatibility
│   │   ├── error-handler.js      # Global error handling
│   │   ├── performance.js        # Performance monitoring
│   │   └── accessibility.js      # A11y utilities
│   ├── assets/                   # Static assets
│   │   ├── icons/                # Extension icons
│   │   │   ├── icon-16.png       # 16x16 favicon
│   │   │   ├── icon-48.png       # 48x48 extension list
│   │   │   ├── icon-128.png      # 128x128 Chrome Web Store
│   │   │   └── icon.svg          # Scalable vector icon
│   │   ├── sounds/               # Audio files
│   │   │   ├── notification.mp3  # Success notification
│   │   │   └── error.mp3         # Error notification
│   │   └── styles/               # Global CSS
│   │       ├── variables.css     # CSS custom properties
│   │       ├── base.css          # Base styles
│   │       └── themes.css        # Dark/light theme support
│   ├── _locales/                 # Internationalization
│   │   ├── en/messages.json      # English translations
│   │   ├── ur/messages.json      # Urdu translations
│   │   ├── ar/messages.json      # Arabic translations
│   │   ├── es/messages.json      # Spanish translations
│   │   ├── fr/messages.json      # French translations
│   │   ├── de/messages.json      # German translations
│   │   ├── hi/messages.json      # Hindi translations
│   │   ├── pt/messages.json      # Portuguese translations
│   │   ├── it/messages.json      # Italian translations
│   │   ├── ja/messages.json      # Japanese translations
│   │   ├── ko/messages.json      # Korean translations
│   │   ├── zh/messages.json      # Chinese translations
│   │   ├── ru/messages.json      # Russian translations
│   │   ├── tr/messages.json      # Turkish translations
│   │   └── nl/messages.json      # Dutch translations
│   ├── manifest.chrome.json      # Chrome Manifest V3
│   ├── manifest.firefox.json     # Firefox Manifest
│   └── manifest.safari.json      # Safari Manifest
├── build/                        # Build configuration
│   ├── webpack.chrome.js         # Chrome build config
│   ├── webpack.firefox.js        # Firefox build config
│   ├── webpack.safari.js         # Safari build config
│   └── webpack.common.js         # Shared config
├── tests/                        # Test files
│   ├── unit/                     # Unit tests
│   │   ├── services/             # Service layer tests
│   │   │   ├── tts-service.test.js
│   │   │   ├── ai-explanation.test.js
│   │   │   └── i18n-service.test.js
│   │   ├── utils/                # Utility function tests
│   │   │   ├── browser-compat.test.js
│   │   │   └── error-handler.test.js
│   │   └── components/           # Component tests
│   │       ├── overlay.test.js
│   │       └── settings.test.js
│   ├── integration/              # Integration tests
│   │   ├── tts-ai-integration.test.js
│   │   ├── storage-sync.test.js
│   │   └── cross-browser-apis.test.js
│   ├── e2e/                      # End-to-end tests
│   │   ├── chrome/               # Chrome E2E tests
│   │   │   ├── text-selection.e2e.js
│   │   │   ├── tts-playback.e2e.js
│   │   │   └── ai-explanation.e2e.js
│   │   ├── firefox/              # Firefox E2E tests
│   │   │   └── firefox-specific.e2e.js
│   │   └── safari/               # Safari E2E tests
│   │       └── safari-specific.e2e.js
│   ├── performance/              # Performance tests
│   │   ├── overlay-performance.test.js
│   │   ├── memory-usage.test.js
│   │   └── api-response-times.test.js
│   └── accessibility/            # Accessibility tests
│       ├── keyboard-navigation.test.js
│       ├── screen-reader.test.js
│       └── high-contrast.test.js
├── scripts/                      # Development scripts
│   ├── setup-dev-environment.js  # Setup automation
│   ├── validate-csp.js           # CSP validation
│   ├── validate-permissions.js   # Permission checker
│   ├── validate-icons.js         # Icon validator
│   └── load-extension.js         # Extension loader
├── docs/                         # Documentation
│   ├── development-guide.md      # Development commands & setup
│   ├── implementation-examples.md # Code patterns & examples
│   ├── project-structure.md      # This file
│   └── api/                      # API documentation
│       ├── tts-service.md        # TTS service API
│       ├── ai-service.md         # AI service API
│       └── storage.md            # Storage schema
├── releases/                     # Packaged releases
│   ├── chrome/                   # Chrome Web Store packages
│   ├── firefox/                  # Firefox Add-on packages
│   └── safari/                   # Safari extension packages
├── .claude/                      # Claude Code configuration
│   ├── hooks/                    # Development hooks
│   └── settings.local.json       # Local Claude settings
├── .env                          # Environment configuration (tracked)
├── .gitignore                    # Git ignore rules
├── .eslintrc.js                  # ESLint configuration
├── .prettierrc                   # Prettier configuration
├── babel.config.js               # Babel configuration
├── jest.config.js                # Jest test configuration
├── playwright.config.js          # Playwright E2E configuration
├── package.json                  # Project configuration
├── package-lock.json             # Dependency lock file
├── tsconfig.json                 # TypeScript configuration
├── CLAUDE.md                     # Main development guide
└── README.md                     # Project overview
```

## 🏛️ Architecture Overview

### Component Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    Browser Context                       │
├─────────────────────────────────────────────────────────┤
│  Content Scripts                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ Text        │  │ TTS         │  │ Overlay     │    │
│  │ Selector    │  │ Controller  │  │ UI          │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
├─────────────────────────────────────────────────────────┤
│  Extension Context                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ Background  │  │ Popup       │  │ Options     │    │
│  │ Service     │  │ Interface   │  │ Page        │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
├─────────────────────────────────────────────────────────┤
│  Core Services                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ TTS         │  │ AI          │  │ i18n        │    │
│  │ Service     │  │ Service     │  │ Service     │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
├─────────────────────────────────────────────────────────┤
│  Utilities & Infrastructure                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ Browser     │  │ Error       │  │ Performance │    │
│  │ Compat      │  │ Handler     │  │ Monitor     │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Data Flow Architecture
```
User Text Selection
        ↓
Text Selector (Content Script)
        ↓
TTS Controller (Content Script)
        ↓
Background Service Worker
        ↓
┌─────────────────┐    ┌─────────────────┐
│   TTS Service   │    │   AI Service    │
│                 │    │                 │
│ • Voice Loading │    │ • Groq API      │
│ • Speech Synth  │    │ • Claude API    │
│ • Rate Control  │    │ • Rate Limiting │
└─────────────────┘    └─────────────────┘
        ↓                      ↓
    Speech Output         AI Explanation
        ↓                      ↓
    Overlay UI (Content Script)
```

### Storage Architecture
```
Chrome Storage Sync (User Settings)
├── userPreferences
│   ├── defaultVoice: string
│   ├── speechRate: number (0.1-10)
│   ├── speechPitch: number (0-2)
│   ├── defaultLanguage: string
│   └── autoPlay: boolean
├── privacyConsent
│   ├── aiConsent: boolean
│   ├── analyticsConsent: boolean
│   └── consentTimestamp: number
└── apiKeys
    ├── groqApiKey: string (encrypted)
    └── claudeApiKey: string (encrypted)

Chrome Storage Local (Performance Data)
├── performanceMetrics
│   ├── overlayResponseTime: number[]
│   ├── ttsStartDelay: number[]
│   └── memoryUsage: number[]
├── errorLogs
│   ├── timestamp: number
│   ├── type: string
│   └── details: object (sanitized)
└── cache
    ├── voicesCache: object[]
    └── aiExplanationsCache: Map
```

## 🎯 Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
**Status**: 🔄 Ready to Start

#### Week 1: Project Setup
- [ ] **Set up basic project structure** (`src/` directory)
  - Create directory structure as outlined above
  - Initialize TypeScript/JavaScript configuration
  - Set up linting and formatting rules

- [ ] **Create browser manifest files**
  - Chrome Manifest V3 with required permissions
  - Firefox manifest with compatibility shims
  - Safari manifest with conversion scripts

- [ ] **Set up webpack build system**
  - Common configuration for shared logic
  - Browser-specific optimizations
  - Development and production modes

#### Week 2: Core Services
- [ ] **Implement basic TTS service**
  - Cross-browser speech synthesis wrapper
  - Voice loading and selection
  - Rate and pitch control

- [ ] **Create simple overlay UI**
  - Basic HTML/CSS overlay component
  - Positioning logic near text selection
  - Accessibility attributes and keyboard support

### Phase 2: Core Features (Weeks 3-4)
**Status**: ⏳ Pending Phase 1

#### Week 3: Advanced TTS
- [ ] **Complete TTS functionality with voice selection**
  - Multi-language voice support
  - Browser-specific optimizations
  - Memory management and cleanup

- [ ] **Implement text selection detection**
  - Mouse selection events
  - Keyboard selection support
  - Touch selection for mobile

#### Week 4: UI/UX Polish
- [ ] **Add overlay positioning and responsiveness**
  - Viewport boundary detection
  - Mobile-optimized touch targets
  - Animation and transition effects

- [ ] **Create settings page**
  - Voice preference management
  - Language selection interface
  - Accessibility options

- [ ] **Add basic error handling**
  - Graceful failure modes
  - User-friendly error messages
  - Recovery mechanisms

### Phase 3: AI Integration (Weeks 5-6)
**Status**: ⏳ Pending Phase 2

#### Week 5: AI Services
- [ ] **Implement Groq API integration**
  - Rate limiting (100 requests/hour)
  - Error handling and retries
  - Response caching

- [ ] **Add Claude API fallback**
  - Secondary service integration
  - Provider switching logic
  - Cost optimization strategies

#### Week 6: Privacy & Consent
- [ ] **Create consent management system**
  - Privacy-first design
  - Granular consent controls
  - Data retention policies

- [ ] **Add rate limiting and caching**
  - Request throttling
  - Intelligent caching strategies
  - Performance optimizations

- [ ] **Implement privacy controls**
  - Data deletion capabilities
  - Consent withdrawal
  - Audit logging

### Phase 4: Polish & Testing (Weeks 7-8)
**Status**: ⏳ Pending Phase 3

#### Week 7: Testing & Quality
- [ ] **Comprehensive testing suite**
  - Unit tests (>85% coverage)
  - Integration test scenarios
  - Performance benchmarking

- [ ] **Accessibility improvements**
  - WCAG 2.1 AA compliance
  - Screen reader optimization
  - High contrast mode support

#### Week 8: Performance & Cross-Browser
- [ ] **Performance optimization**
  - Bundle size optimization
  - Memory usage reduction
  - Response time improvements

- [ ] **Cross-browser testing**
  - Chrome, Firefox, Safari, Edge testing
  - Compatibility issue resolution
  - Performance validation across browsers

- [ ] **Documentation completion**
  - API documentation
  - User guides
  - Developer documentation

### Phase 5: Launch (Week 9)
**Status**: ⏳ Pending Phase 4

#### Pre-Launch Validation
- [ ] **Final testing and validation**
  - Complete quality gates checklist
  - Security audit and penetration testing
  - Performance validation

- [ ] **Store submission preparation**
  - Chrome Web Store listing
  - Firefox Add-ons metadata
  - Safari App Store Connect

#### Launch Execution
- [ ] **Marketing materials**
  - Screenshots and promotional images
  - Feature highlight videos
  - Press kit preparation

- [ ] **Launch on browser stores**
  - Chrome Web Store submission
  - Firefox Add-ons publication
  - Safari extension distribution

## 🏆 Quality Gates Checklist

### Pre-Release Validation Requirements
Before any release, ensure ALL items are completed:

#### Code Quality Gates
- [ ] **Unit Tests**: >85% coverage
  ```bash
  npm run test:unit:coverage
  ```

- [ ] **Integration Tests**: All critical paths tested
  ```bash
  npm run test:integration
  ```

- [ ] **E2E Tests**: Pass on all target browsers
  ```bash
  npm run test:e2e:all
  ```

- [ ] **Linting**: No ESLint errors or warnings
  ```bash
  npm run lint
  ```

- [ ] **Type Checking**: No TypeScript errors
  ```bash
  npm run typecheck
  ```

#### Performance Gates
- [ ] **Memory Usage**: <50MB during operation
  ```bash
  npm run test:performance
  ```

- [ ] **Overlay Response**: <300ms appearance time
- [ ] **TTS Start Delay**: <500ms from trigger
- [ ] **AI Response**: <3 seconds for explanations

#### Security Gates
- [ ] **CSP Compliance**: No Content Security Policy violations
  ```bash
  npm run validate:csp
  ```

- [ ] **API Key Security**: No hardcoded credentials
- [ ] **Permission Audit**: Minimal required permissions
  ```bash
  npm run validate:permissions
  ```

#### Accessibility Gates
- [ ] **WCAG 2.1 AA Compliance**: All accessibility tests pass
  ```bash
  npm run test:accessibility
  ```

- [ ] **Keyboard Navigation**: Full keyboard accessibility
- [ ] **Screen Reader**: Compatible with NVDA, JAWS, VoiceOver
- [ ] **High Contrast**: Supports high contrast mode

#### Cross-Browser Gates
- [ ] **Chrome 88+**: Full functionality verified
- [ ] **Firefox 78+**: All features working
- [ ] **Safari 14+**: macOS and iOS compatibility
- [ ] **Edge 88+**: Chromium Edge support

#### Store Requirements Gates
- [ ] **Manifest Validation**: Valid for each browser store
  ```bash
  npm run validate:manifest
  ```

- [ ] **Icon Requirements**: All required icon sizes present
  ```bash
  npm run validate:icons
  ```

- [ ] **Store Policies**: Compliant with all store guidelines
- [ ] **Privacy Policy**: Comprehensive privacy documentation

#### Build & Deployment Gates
- [ ] **Production Builds**: Clean builds for all browsers
  ```bash
  npm run build:all
  ```

- [ ] **Package Validation**: Store-ready packages created
  ```bash
  npm run package:all
  ```

- [ ] **Version Consistency**: All manifests have matching versions
- [ ] **Release Notes**: Complete changelog documentation

## 🎯 Success Metrics

### Key Performance Indicators
Track these metrics to ensure project success:

#### Functionality Metrics
- **Website Compatibility**: TTS works on ≥95% of websites
- **Voice Availability**: Support for ≥10 languages
- **Error Rate**: <1% TTS failures
- **API Reliability**: >99% uptime for AI services

#### Performance Metrics  
- **Overlay Response Time**: <300ms from text selection
- **TTS Start Delay**: <500ms from button click
- **Memory Usage**: <50MB during active use
- **Bundle Size**: <2MB total extension size

#### User Experience Metrics
- **Click-to-Speech**: ≤2 clicks to start TTS
- **AI Response Time**: <3 seconds for explanations
- **Mobile Usability**: Touch-optimized interface
- **Accessibility Score**: 100% on automated tools

#### Quality Metrics
- **Test Coverage**: >85% unit test coverage
- **Bug Density**: <0.1 bugs per KLOC
- **Security Score**: Zero critical vulnerabilities
- **Performance Score**: >90 on Lighthouse

#### Adoption Metrics
- **Browser Support**: Chrome, Firefox, Safari, Edge
- **Language Coverage**: 15+ supported languages
- **Store Ratings**: >4.5 stars average
- **Privacy Compliance**: 100% GDPR compliance

### Monitoring & Analytics
Implement privacy-first analytics to track:

- Extension usage patterns (with consent)
- Performance metrics collection
- Error reporting and diagnostics
- Feature adoption rates
- User satisfaction surveys

All analytics must:
- Require explicit user consent
- Allow data deletion
- Provide transparency reports
- Follow privacy-by-design principles

## 🌐 Browser-Specific Configurations

### Chrome Configuration
```json
// manifest.chrome.json
{
  "manifest_version": 3,
  "name": "Intelligent TTS Extension",
  "version": "1.0.0",
  "description": "Transform web text into speech with AI explanations",
  "permissions": ["storage", "activeTab"],
  "background": {
    "service_worker": "background/service-worker.js"
  },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content/content-script.js"]
  }],
  "action": {
    "default_popup": "popup/popup.html"
  }
}
```

### Firefox Configuration
```json
// manifest.firefox.json
{
  "manifest_version": 2,
  "name": "Intelligent TTS Extension",
  "version": "1.0.0",
  "description": "Transform web text into speech with AI explanations",
  "permissions": ["storage", "activeTab"],
  "background": {
    "scripts": ["background/background.js"],
    "persistent": false
  },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content/content-script.js"]
  }],
  "browser_action": {
    "default_popup": "popup/popup.html"
  }
}
```

### Safari Configuration
```json
// manifest.safari.json
{
  "manifest_version": 2,
  "name": "Intelligent TTS Extension",
  "version": "1.0.0",
  "description": "Transform web text into speech with AI explanations",
  "permissions": ["storage", "activeTab"],
  "background": {
    "scripts": ["background/background.js"],
    "persistent": false
  },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content/content-script.js"]
  }],
  "browser_action": {
    "default_popup": "popup/popup.html"
  }
}
```

---

This project structure provides a comprehensive foundation for building a production-ready, cross-browser Text-to-Speech extension with AI integration, accessibility focus, and privacy-first design.