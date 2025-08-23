## FEATURE: Intelligent Text-to-Speech Browser Extension with AI-Powered Explanation

A comprehensive, production-ready browser extension for Chrome, Edge, Firefox, and Safari (desktop and mobile) that enables users to:

1. **Text-to-Speech Conversion**: Select any text on any website and have it read aloud in multiple languages with customizable voices and accents
2. **Cross-Language Translation**: Listen to English text in Urdu, Arabic, Spanish, or any supported language
3. **AI-Powered Explanation**: Get detailed explanations of complex content using free AI models (Groq) and premium services (Claude) with real-time examples
4. **Smart Overlay Controls**: Intuitive popup with play, pause, stop, voice selection, and explanation features
5. **Universal Compatibility**: Works on articles, blogs, social media posts (LinkedIn, Facebook), and any web content

## EXAMPLES:

### Browser Extension Architecture Examples:
- **Manifest V3 Structure**: `examples/extension/manifest.json` - Modern extension configuration
- **Content Script Pattern**: `examples/extension/content-script.js` - Text selection and overlay injection
- **Background Service**: `examples/extension/background.js` - Cross-browser compatibility layer
- **Popup Interface**: `examples/extension/popup/` - Extension toolbar interface
- **Cross-Browser Compatibility**: `examples/extension/browser-polyfill.js` - Unified API wrapper

### Text-to-Speech Implementation Examples:
- **Web Speech API Integration**: `examples/tts/speech-synthesis.js` - Native browser TTS
- **Voice Selection UI**: `examples/tts/voice-picker.js` - Language and accent selection
- **Audio Controls**: `examples/tts/audio-controls.js` - Play, pause, stop functionality
- **Text Processing**: `examples/tts/text-processor.js` - Content sanitization and chunking

### AI Integration Examples:
- **Groq API Integration**: `examples/ai/groq-client.js` - Free AI model integration
- **Claude API Integration**: `examples/ai/claude-client.js` - Paid AI service integration
- **Context Analysis**: `examples/ai/content-analyzer.js` - Text understanding and explanation
- **Response Formatting**: `examples/ai/response-formatter.js` - User-friendly explanations

### UI/UX Implementation Examples:
- **Overlay Component**: `examples/ui/overlay.js` - Smart popup positioning
- **Text Selection Handler**: `examples/ui/selection-handler.js` - Robust text selection
- **Language Switcher**: `examples/ui/language-selector.js` - Multi-language interface
- **Responsive Design**: `examples/ui/responsive-overlay.css` - Mobile-friendly design

## DOCUMENTATION:

### Browser Extension APIs:
- **Chrome Extension API**: https://developer.chrome.com/docs/extensions/
- **Firefox WebExtensions**: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions
- **Safari Web Extensions**: https://developer.apple.com/documentation/safariservices/safari_web_extensions
- **Edge Extensions**: https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/
- **Browser Compatibility**: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Browser_support_for_JavaScript_APIs

### Text-to-Speech APIs:
- **Web Speech API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- **SpeechSynthesis Interface**: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
- **Cross-Browser TTS**: https://caniuse.com/speech-synthesis
- **Voice Selection Guide**: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice

### AI Integration:
- **Groq API Documentation**: https://console.groq.com/docs/quickstart
- **Claude API Documentation**: https://docs.anthropic.com/en/api/getting-started
- **Free AI Models List**: https://github.com/eugeneyan/open-llms
- **AI Safety Guidelines**: https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/be-clear-direct

### Development Tools:
- **Cursor IDE Configuration**: https://cursor.sh/settings
- **Context Engineering**: https://docs.anthropic.com/en/docs/claude-code
- **Extension Testing**: https://developer.chrome.com/docs/extensions/mv3/tut_debugging/
- **Cross-Browser Testing**: https://www.browserstack.com/guide/cross-browser-extension-testing

## OTHER CONSIDERATIONS:

### Critical Implementation Gotchas:
1. **Manifest V3 Migration**: Chrome extensions now require Manifest V3, which has stricter content security policies and different background script behavior
2. **Cross-Browser Compatibility**: Each browser has slight API differences that require polyfills or conditional code
3. **Content Security Policy**: Many websites block inline scripts and external resources, requiring careful CSP handling
4. **Text Selection Edge Cases**: Handle complex DOM structures, iframes, shadow DOM, and dynamically loaded content
5. **Voice Availability**: Not all languages/voices are available on all devices - need graceful fallbacks
6. **Rate Limiting**: AI APIs have rate limits - implement queuing and caching strategies
7. **Privacy Compliance**: Ensure no sensitive text is sent to AI services without user consent
8. **Mobile Browser Limitations**: Safari on iOS has limited extension support, requires different approach

### Performance Considerations:
- **Memory Management**: Extensions can consume significant memory if not optimized
- **Background Script Lifecycle**: Manifest V3 service workers have different lifecycle than persistent background scripts
- **Large Text Processing**: Split long articles into chunks to prevent API timeouts
- **Audio Buffer Management**: Prevent memory leaks from long audio sessions
- **DOM Manipulation**: Minimize DOM queries and cache selections for better performance

### Security Requirements:
- **Permission Minimization**: Request only necessary permissions to reduce user concerns
- **Content Script Isolation**: Prevent conflicts with website JavaScript
- **API Key Management**: Securely store and rotate AI API keys
- **User Data Protection**: Implement opt-in data collection and local storage preferences
- **XSS Prevention**: Sanitize all user inputs and dynamic content

### Development Workflow Integration:
- **Cursor IDE Setup**: Configure for TypeScript, ESLint, and extension-specific debugging
- **Context Engineering**: Structure prompts and documentation for AI assistance
- **Testing Strategy**: Unit tests for core functions, integration tests for browser APIs
- **Build Process**: Automated builds for multiple browsers with environment-specific configurations
- **Deployment Pipeline**: Automated submission to Chrome Web Store, Firefox Add-ons, etc.

### Accessibility & UX:
- **Keyboard Navigation**: Full keyboard accessibility for overlay controls
- **Screen Reader Compatibility**: Ensure extension works with assistive technologies
- **High Contrast Support**: Respect user's display preferences
- **Internationalization**: Support RTL languages and cultural text preferences
- **Mobile Touch Targets**: Ensure overlay controls are touch-friendly on mobile devices

### AI Model Integration Strategy:
- **Fallback Hierarchy**: Primary (Groq) → Secondary (Claude) → Local processing
- **Context Window Management**: Optimize prompts to stay within token limits
- **Response Quality**: Implement feedback mechanisms to improve explanations over time
- **Offline Functionality**: Basic TTS should work without internet connection
- **Cost Management**: Monitor and limit API usage to prevent unexpected charges