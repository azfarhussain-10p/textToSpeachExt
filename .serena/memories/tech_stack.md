# Technology Stack & Architecture

## Core Technologies
- **Frontend**: Vanilla JavaScript (ES2022), CSS3, HTML5
- **Build System**: Webpack 5 with multi-browser configuration
- **APIs**: Web Speech API, Chrome Extension APIs, WebExtensions API
- **AI Integration**: Groq API (free), Claude API (paid), OpenAI compatibility
- **Testing**: Jest (unit), Puppeteer (E2E), WebDriver (cross-browser)
- **Development**: ESLint, Prettier, TypeScript definitions

## Extension Architecture

### Core Components Structure
```
src/
├── background/          # Extension background service worker
│   ├── service-worker.js       # Main background script (Manifest V3)
│   ├── permissions-manager.js  # Runtime permission handling
│   └── api-coordinator.js     # AI API management
│
├── content/            # Content scripts injected into web pages
│   ├── content-script.js      # Main content script entry point
│   ├── text-selector.js       # Handles text selection events
│   ├── overlay-manager.js     # Manages overlay UI lifecycle
│   └── dom-utils.js           # DOM manipulation utilities
│
├── services/           # Core business logic
│   ├── tts-service.js         # Text-to-speech functionality
│   ├── ai-service.js          # AI explanation integration
│   ├── language-service.js    # Multi-language support
│   └── storage-service.js     # Extension storage management
│
├── ui/                 # User interface components
│   ├── overlay/              # TTS control overlay
│   ├── popup/               # Extension toolbar popup
│   ├── settings/            # Settings page
│   └── components/          # Reusable UI components
│
└── utils/              # Shared utilities
    ├── browser-polyfill.js   # Cross-browser API compatibility
    ├── error-handler.js      # Global error handling
    └── performance-monitor.js # Performance tracking
```

## Build System
- **Multi-browser builds**: Separate webpack configs for Chrome, Firefox, Safari
- **Environment-specific configurations**: Development vs Production builds
- **Asset optimization**: Image compression, code minification, tree shaking
- **Source maps**: Available in development mode

## Dependencies
- **Runtime**: webextension-polyfill (cross-browser compatibility)
- **Development**: Full modern JavaScript toolchain with TypeScript support
- **Testing**: Comprehensive testing setup with Jest, Puppeteer, and cross-browser testing
- **Build Tools**: Webpack with plugins for extension-specific optimizations