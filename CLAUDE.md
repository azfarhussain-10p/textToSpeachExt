# 🔊 Intelligent Text-to-Speech Browser Extension - Development Guide

A comprehensive development guide for the **Intelligent TTS Extension** project. This document serves as the definitive reference for implementing, testing, and deploying a production-ready, cross-browser Text-to-Speech extension with AI-powered explanations.

> **Project**: `intelligent-tts-extension` v1.0.0-beta.1  
> **Author**: Azfar Hussain (azfarhussain.10p@gmail.com)  
> **Status**: Planning Phase - Ready for Implementation  
> **Repository**: [textToSpeachExt](https://github.com/azfarhussain-10p/textToSpeachExt)

## 🎯 Project Overview

### Core Features to Implement
- **Universal TTS**: Select any text on any website and listen with natural voices
- **AI Explanations**: Get intelligent explanations using Groq (free) and Claude API
- **Cross-Browser**: Chrome, Firefox, Safari, Edge support with Manifest V3
- **Multilingual**: 15+ languages including English, Urdu, Arabic, Spanish, French, German, Hindi
- **Accessibility**: Full WCAG 2.1 AA compliance with keyboard navigation and screen reader support
- **Mobile Ready**: Touch-optimized overlay with responsive design

### Browser Compatibility Targets
```json
{
  "browserslist": [
    "Chrome >= 88",
    "Firefox >= 78", 
    "Safari >= 14",
    "Edge >= 88"
  ]
}
```

## 🚨 Critical Implementation Requirements

### **NEVER IGNORE These Rules**

1. **Manifest V3 Only**: Chrome extensions MUST use Manifest V3. No exceptions.
2. **No eval()**: Content Security Policy blocks eval() - use alternatives
3. **Privacy First**: Get explicit user consent before sending data to AI APIs
4. **Cross-Browser Testing**: Test on Chrome, Firefox, Safari, Edge before release
5. **Memory Management**: Clean up event listeners, timeouts, intervals
6. **Rate Limiting**: Implement throttling for Groq (100/hr) and Claude (60/min) APIs
7. **Accessibility**: Full keyboard navigation and screen reader support
8. **Security**: Never hardcode API keys - use environment variables or storage

### Content Security Policy Compliance
```javascript
// ❌ NEVER DO THIS
eval('some code');
innerHTML = '<script>alert("xss")</script>';
onclick="handleClick()";

// ✅ DO THIS INSTEAD
new Function('some code')();
textContent = 'safe content';
element.addEventListener('click', handleClick);
```

### API Key Security
```javascript
// ❌ NEVER HARDCODE KEYS
const GROQ_API_KEY = 'gsk_1234567890abcdef'; // BLOCKED BY HOOKS

// ✅ USE ENVIRONMENT OR STORAGE
const apiKey = process.env.GROQ_API_KEY;
// OR
const { groqApiKey } = await chrome.storage.sync.get(['groqApiKey']);
```

## 🛠️ Quick Setup

### Prerequisites
- **Node.js**: >=18.0.0
- **npm**: >=8.0.0
- **Git**: Latest version
- **VSCode**: Recommended with extensions

### Installation
```bash
# Clone the repository
git clone https://github.com/azfarhussain-10p/textToSpeachExt.git
cd textToSpeachExt

# Initialize development environment
npm run setup              # Installs dependencies and creates .env

# Start development
npm run dev               # Default: Chrome development build
npm run dev:firefox       # Firefox development build
npm run dev:safari        # Safari development build
```

## 📚 Documentation Structure

This project uses a modular documentation approach for better performance and organization:

### Core Documentation Files

1. **[Development Guide](docs/development-guide.md)** - Complete development reference
   - All npm commands and scripts
   - Testing strategies and frameworks
   - Build system configuration
   - Environment setup and deployment

2. **[Implementation Examples](docs/implementation-examples.md)** - Code patterns and examples
   - TTS Service implementation with browser compatibility
   - AI Integration (Groq/Claude APIs) with fallbacks
   - UI/UX components (overlay, settings, accessibility)
   - Security, privacy, and performance monitoring

3. **[Project Structure](docs/project-structure.md)** - Architecture and planning
   - Complete directory structure and file organization
   - Implementation roadmap and development phases
   - Quality gates checklist and success metrics
   - Architecture decisions and patterns

## 🏆 Success Metrics & Quality Gates

### Key Performance Indicators
- **Functionality**: TTS works on 95% of websites
- **Performance**: Overlay appears within 300ms of selection
- **Memory**: <50MB usage during operation
- **Compatibility**: Works on Chrome 88+, Firefox 78+, Safari 14+, Edge 88+
- **User Experience**: Less than 2 clicks to start speech
- **AI Integration**: Explanations generated within 3 seconds
- **Privacy**: Zero user data collected without explicit consent
- **Accessibility**: Full keyboard and screen reader support

### Pre-Release Quality Gates
```bash
# Essential checks before any release
npm run validate          # lint + format + typecheck
npm run test              # Full test suite
npm run test:e2e:all      # Cross-browser E2E tests
npm run test:accessibility # WCAG 2.1 AA compliance
npm run build:all         # Production builds all browsers
npm run validate:manifest # Extension store validation
```

## 🎯 Current Development Priority

### Phase 1: Foundation (Current Focus)
- [ ] Set up basic project structure (`src/` directory) 
- [ ] Create Manifest V3 files for each browser
- [ ] Implement core TTS service with cross-browser compatibility
- [ ] Create contextual overlay UI with accessibility support
- [ ] Set up webpack build system for multi-browser builds

### Implementation Status
- **Project Configuration**: ✅ Complete (package.json, docs structure)
- **Source Code**: ❌ **Needs Implementation** (src/ directory missing)
- **Testing Framework**: ❌ **Needs Implementation** (test files missing)  
- **Build System**: ❌ **Needs Implementation** (webpack configs missing)

## 📝 Development Notes

### Essential Development Commands
```bash
# Development
npm run dev               # Chrome development with watch
npm run dev:firefox       # Firefox development
npm run dev:safari        # Safari development

# Testing  
npm run test              # Run all tests
npm run test:unit:coverage # Unit test coverage (>85% required)
npm run test:e2e:all      # E2E tests all browsers

# Building & Validation
npm run build:all         # Build for all browsers
npm run validate          # Code quality checks
npm run package:all       # Package for browser stores
```

For complete command reference and detailed setup instructions, see [Development Guide](docs/development-guide.md).

### Getting Help
- **Development Setup**: Check `docs/development-guide.md`
- **Implementation Patterns**: Reference `docs/implementation-examples.md`
- **Architecture Questions**: Review `docs/project-structure.md`

---

**Remember**: This is a privacy-first, accessibility-focused, cross-browser extension. Every implementation decision should prioritize user security, performance, and inclusivity.