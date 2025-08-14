name: "Text-to-Speech Browser Extension with AI-Powered Explanations"
description: |

## Purpose
Build a production-ready, cross-browser Text-to-Speech extension that enables users to listen to any web content in multiple languages with AI-powered explanations. This comprehensive implementation demonstrates advanced context engineering for complex browser extension development with modern web APIs and AI integration.

## Core Principles
1. **Context is King**: Include ALL necessary browser extension patterns, TTS APIs, and AI integration examples
2. **Validation Loops**: Provide executable tests for cross-browser compatibility and functionality
3. **Information Dense**: Use proven extension development patterns and modern web standards
4. **Progressive Success**: Start with core TTS, validate, then enhance with AI features

---

## Goal
Create a comprehensive browser extension that transforms web reading by providing intelligent text-to-speech with multi-language support and AI-powered content explanations. The extension should work seamlessly across Chrome, Firefox, Safari, and Edge with mobile optimization.

## Why
- **Accessibility**: Makes web content accessible to visually impaired users and those with reading difficulties
- **Learning Enhancement**: Helps users understand complex content through AI explanations and examples
- **Multi-language Support**: Breaks language barriers by providing TTS in user's preferred language
- **Universal Compatibility**: Works on any website, article, blog, or social media post

## What
A browser extension with intelligent text selection overlay that provides:
- Text-to-Speech in 15+ languages with voice customization
- AI-powered explanations of complex content with real-world examples
- Smart overlay UI with play, pause, stop, and explanation controls
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- Mobile-responsive design with touch-friendly controls

### Success Criteria
- [ ] Text selection triggers overlay within 300ms
- [ ] TTS works on 95% of websites
- [ ] Supports 15+ languages with voice selection
- [ ] AI explanations generated within 3 seconds
- [ ] Works across all target browsers
- [ ] Mobile-optimized overlay and controls
- [ ] Full accessibility compliance (WCAG 2.1 AA)

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- url: https://developer.chrome.com/docs/extensions/mv3/
  why: Manifest V3 requirements and modern extension patterns
  
- url: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
  why: Web Speech API for text-to-speech functionality
  
- url: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions
  why: Cross-browser WebExtensions API compatibility
  
- url: https://developer.apple.com/documentation/safariservices/safari_web_extensions
  why: Safari Web Extensions specific requirements
  
- url: https://console.groq.com/docs/quickstart
  why: Groq API integration for free AI explanations
  
- url: https://docs.anthropic.com/en/api/getting-started
  why: Claude API integration for advanced AI features
  
- url: https://web.dev/articles/csp
  why: Content Security Policy requirements for extensions
  
- file: CLAUDE.md
  why: Comprehensive extension development patterns and best practices
  
- file: INITIAL.md
  why: Complete feature requirements and implementation guidelines

- url: https://github.com/mozilla/webextension-polyfill
  why: Cross-browser API compatibility layer
  
- url: https://developers.google.com/web/fundamentals/accessibility
  why: Web accessibility guidelines for inclusive design
```

### Confidence Score: 9/10

High confidence due to:
- Comprehensive browser extension patterns and examples
- Well-documented Web Speech API and AI integrations  
- Proven cross-browser compatibility strategies
- Detailed testing approach with multiple validation levels
- Clear security and privacy guidelines

Minor uncertainty around Safari iOS limitations and mobile browser extension support, but fallback strategies are documented.