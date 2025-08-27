# 🛠️ Development Guide - TTS Extension

Complete development reference for the Intelligent Text-to-Speech Browser Extension project.

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Development Environment Setup](#development-environment-setup)
- [Available Scripts](#available-scripts)
- [Testing Strategy](#testing-strategy)
- [Build & Deployment](#build--deployment)
- [Environment Configuration](#environment-configuration)
- [Development Workflows](#development-workflows)

## Prerequisites

### System Requirements
- **Node.js**: >=18.0.0
- **npm**: >=8.0.0
- **Git**: Latest version
- **VSCode**: Recommended with extensions

### Recommended VSCode Extensions
- ESLint
- Prettier
- JavaScript/TypeScript Language Support
- Extension Development Tools
- GitLens

## Development Environment Setup

### Initial Setup
```bash
# Clone the repository
git clone https://github.com/azfarhussain-10p/textToSpeachExt.git
cd textToSpeachExt

# Initialize development environment
npm run setup              # Installs dependencies and creates .env

# Verify setup
npm run validate           # Check linting, formatting, types
```

### Environment Configuration
Create `.env` file with required API keys:
```bash
# AI Service API Keys (NEVER commit these)
GROQ_API_KEY=your_groq_api_key_here
CLAUDE_API_KEY=your_claude_api_key_here

# Store Publishing (for CI/CD)
CHROME_EXTENSION_ID=your_chrome_extension_id
FIREFOX_API_KEY=your_firefox_api_key
FIREFOX_API_SECRET=your_firefox_api_secret

# Development
NODE_ENV=development
EXTENSION_ENV=development

# Analytics (optional)
ANALYTICS_ID=your_analytics_id
```

## Available Scripts

### Development Commands

#### Starting Development Servers
```bash
# Chrome Development
npm run dev               # Default: Chrome development build
npm run dev:chrome        # Chrome-specific development
npm run watch             # Alias for dev:chrome

# Other Browsers
npm run dev:firefox       # Firefox-specific development  
npm run dev:safari        # Safari-specific development
npm run dev:edge          # Edge development (uses Chrome config)
```

#### Development Features
- **Live Reload**: Automatic extension reload on code changes
- **Source Maps**: Debug original TypeScript/ES6 code
- **Hot Module Replacement**: Instant updates for CSS/UI changes
- **Cross-Browser**: Separate builds optimized for each browser

### Building Commands

#### Production Builds
```bash
# Build All Browsers
npm run build             # Build all browsers
npm run build:all         # Same as build

# Individual Browser Builds
npm run build:chrome      # Chrome production build
npm run build:firefox     # Firefox production build
npm run build:safari      # Safari production build
npm run build:edge        # Edge production build

# Utilities
npm run clean             # Clean dist directory
```

#### Build Features
- **Code Splitting**: Optimized bundles for each browser
- **Minification**: Compressed JavaScript and CSS
- **Asset Optimization**: Optimized images and icons
- **Manifest Generation**: Browser-specific manifest files

### Testing Commands

#### Unit Testing
```bash
npm test                  # Run unit + integration tests
npm run test:unit         # Jest unit tests only
npm run test:unit:watch   # Watch mode for unit tests
npm run test:unit:coverage # Coverage report (>85% required)
```

#### Integration Testing
```bash
npm run test:integration  # Integration tests
npm run test:tts          # TTS-specific tests
npm run test:ai           # AI service tests
```

#### End-to-End Testing
```bash
npm run test:e2e          # End-to-end tests (Chrome)
npm run test:e2e:chrome   # Chrome E2E tests
npm run test:e2e:firefox  # Firefox E2E tests  
npm run test:e2e:safari   # Safari E2E tests
npm run test:e2e:all      # All browsers E2E
```

#### Specialized Testing
```bash
npm run test:cross-browser # Cross-browser compatibility tests
npm run test:performance  # Performance benchmarks
npm run test:accessibility # A11y compliance tests (WCAG 2.1 AA)
```

### Code Quality Commands

#### Linting & Formatting
```bash
npm run lint              # ESLint + TypeScript check
npm run lint:fix          # Auto-fix linting issues
npm run format            # Prettier formatting
npm run format:check      # Check formatting without changes
npm run typecheck         # TypeScript validation
npm run validate          # lint + format + typecheck
npm run pre-commit        # Full validation + tests
```

#### Security & Auditing
```bash
npm run audit             # npm audit + fix
npm run audit:security    # Security-focused audit
```

### Extension Validation Commands

#### Manifest & Store Requirements
```bash
npm run validate:manifest # Web-ext manifest validation
npm run validate:csp      # Content Security Policy check
npm run validate:permissions # Permission validation
npm run validate:icons    # Icon requirements check
```

#### Browser Store Validation
- **Chrome Web Store**: Validates Manifest V3 compliance
- **Firefox Add-ons**: Checks AMO requirements
- **Safari**: Validates Safari extension requirements

### Extension Loading Commands

#### Development Testing
```bash
npm run load:chrome       # Load in Chrome for testing
npm run load:firefox      # Load in Firefox for testing  
npm run load:safari       # Convert and load in Safari
```

#### Loading Process
1. Builds development version
2. Opens browser extension management page
3. Loads unpacked extension
4. Provides reload instructions

### Analysis & Optimization Commands

#### Bundle Analysis
```bash
npm run analyze           # Bundle analyzer for all browsers
npm run analyze:chrome    # Chrome-specific bundle analysis
npm run analyze:firefox   # Firefox-specific bundle analysis
```

#### Performance Analysis
- **Bundle Size**: Tracks JavaScript/CSS bundle sizes
- **Code Splitting**: Identifies optimization opportunities
- **Dependency Analysis**: Shows third-party library usage

### Documentation Commands

#### Documentation Generation
```bash
npm run docs              # Generate and serve docs
npm run docs:generate     # JSDoc generation
npm run docs:serve        # Serve docs on localhost:8080
```

### Packaging & Release Commands

#### Packaging for Stores
```bash
npm run package           # Package all browsers
npm run package:chrome    # Chrome Web Store package
npm run package:firefox   # Firefox Add-on package
npm run package:safari    # Safari extension package
```

#### Release Management
```bash
npm run release           # Build + test + package
npm run release:patch     # Patch version release (1.0.0 → 1.0.1)
npm run release:minor     # Minor version release (1.0.0 → 1.1.0)
npm run release:major     # Major version release (1.0.0 → 2.0.0)
```

#### Publishing to Stores
```bash
npm run publish:chrome    # Publish to Chrome Web Store
npm run publish:firefox   # Publish to Firefox Add-ons
npm run publish:all       # Publish to all stores
```

## Testing Strategy

### Testing Framework Stack
- **Unit Tests**: Jest with jsdom
- **Integration Tests**: Jest with browser APIs mocked
- **E2E Tests**: Playwright for cross-browser testing
- **Performance Tests**: Custom performance monitoring
- **Accessibility Tests**: axe-core integration

### Test Structure
```
tests/
├── unit/                     # Unit tests (Jest)
│   ├── services/             # TTS, AI, i18n services
│   ├── utils/                # Utility functions
│   └── components/           # UI components
├── integration/              # Integration tests
│   ├── tts-ai-integration/   # TTS + AI workflow
│   ├── storage-sync/         # Settings synchronization
│   └── cross-browser-apis/   # Browser API compatibility
├── e2e/                      # End-to-end tests
│   ├── chrome/               # Chrome-specific tests
│   ├── firefox/              # Firefox-specific tests
│   └── safari/               # Safari-specific tests
├── performance/              # Performance tests
│   ├── overlay-performance/  # UI response times
│   ├── memory-usage/         # Memory leak detection
│   └── api-response-times/   # API performance
└── accessibility/            # A11y tests
    ├── keyboard-navigation/  # Keyboard accessibility
    ├── screen-reader/        # Screen reader compatibility
    └── high-contrast/        # High contrast mode
```

### Coverage Requirements
- **Unit Tests**: >85% code coverage
- **Integration Tests**: Critical user flows
- **E2E Tests**: All browsers, key user scenarios
- **Performance Tests**: <300ms overlay, <50MB memory
- **Accessibility Tests**: WCAG 2.1 AA compliance

## Build & Deployment

### Build System Configuration
The build system uses separate webpack configurations for optimal browser support:

```
build/
├── webpack.common.js     # Shared configuration
├── webpack.chrome.js     # Chrome-specific optimizations
├── webpack.firefox.js    # Firefox-specific optimizations
└── webpack.safari.js     # Safari-specific optimizations
```

### Browser-Specific Builds
Each browser has unique requirements and optimizations:

#### Chrome/Edge (Manifest V3)
- Service Worker background scripts
- Action API (not browserAction)
- Stricter Content Security Policy
- Web Accessible Resources

#### Firefox (Manifest V2/V3 Hybrid)
- Background scripts (not Service Worker)
- browserAction API
- Different permission model
- Add-on signing requirements

#### Safari
- Safari Extension format conversion
- Different API namespaces
- macOS-specific permissions
- App Store requirements

### Deployment Pipeline
```bash
# Development Deployment
npm run dev:chrome        # Local development
npm run test:e2e:chrome   # E2E validation
npm run load:chrome       # Manual testing

# Staging Deployment  
npm run build:chrome      # Production build
npm run test:e2e:all      # Cross-browser validation
npm run package:chrome    # Store package

# Production Deployment
npm run release:patch     # Version bump + full pipeline
npm run publish:chrome    # Submit to Chrome Web Store
```

## Development Workflows

### Feature Development Workflow
1. **Setup**: `npm run dev:chrome`
2. **Code**: Implement feature with live reload
3. **Test**: `npm run test:unit` + `npm run test:e2e:chrome`
4. **Validate**: `npm run validate`
5. **Cross-Browser**: `npm run test:e2e:all`

### Bug Fix Workflow
1. **Reproduce**: Create failing test case
2. **Fix**: Implement fix with `npm run dev`
3. **Verify**: `npm run test` + manual testing
4. **Validate**: `npm run validate`

### Release Workflow
1. **Pre-Release**: `npm run validate` + `npm run test:e2e:all`
2. **Build**: `npm run build:all`
3. **Package**: `npm run package:all`
4. **Version**: `npm run release:patch|minor|major`
5. **Deploy**: `npm run publish:all`

### Performance Optimization Workflow
1. **Analyze**: `npm run analyze`
2. **Profile**: `npm run test:performance`
3. **Optimize**: Code improvements
4. **Validate**: Performance tests pass
5. **Monitor**: Production performance metrics

## Environment-Specific Notes

### Chrome Development
- Enable "Developer mode" in chrome://extensions/
- Use "Load unpacked" for development builds
- Check console for Content Security Policy errors
- Test with different Chrome versions

### Firefox Development
- Use about:debugging for temporary add-on loading
- Different error reporting than Chrome
- Test with Firefox Developer Edition
- Validate with web-ext tool

### Safari Development
- Requires macOS for development
- Use Safari Technology Preview
- Convert extension format with Xcode
- Test on both macOS and iOS Safari

### Cross-Browser Testing
- Test keyboard navigation on all browsers
- Verify TTS voice availability varies by OS
- Check API compatibility (Manifest V2 vs V3)
- Validate performance across browsers

## Common Development Issues

### Build Issues
- **Node Version**: Ensure Node.js >=18.0.0
- **Dependencies**: Run `npm ci` for clean install
- **Cache**: Clear with `npm run clean`

### Browser Loading Issues
- **Permissions**: Check manifest permissions
- **CSP Violations**: Review Content Security Policy
- **Hot Reload**: Restart dev server if broken

### Testing Issues
- **Timeout**: Increase test timeouts for slower machines
- **Mocking**: Ensure browser APIs are properly mocked
- **Cross-Browser**: Different behavior across browsers

For additional help, check the [Implementation Examples](implementation-examples.md) and [Project Structure](project-structure.md) documentation.