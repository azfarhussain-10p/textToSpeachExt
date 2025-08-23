# PRP: AI-Powered Voice Selection Feature

## Objective
Implement an intelligent voice selection feature for the TTS extension that automatically chooses optimal voices based on language detection and AI-powered content analysis, with seamless cross-browser compatibility and privacy-first AI integration.

## Context & References

### Files to Study
- `src/services/tts-service.js` - Current TTS implementation patterns
- `src/background/ai-service.js` - AI API integration structure
- `src/shared/storage-service.js` - Settings persistence patterns
- `src/content/overlay.js` - UI component structure
- `tests/unit/tts-service.test.js` - Testing patterns for TTS features

### External Documentation
**NOTE: Use context7 to fetch real-time documentation**
- **Groq API**: use context7 for current Groq API documentation on text analysis and language detection
- **Claude API**: use context7 for latest Claude API specifications for fallback voice recommendations  
- **Web Speech API**: use context7 for SpeechSynthesis voice enumeration and browser compatibility
- **Chrome Extension APIs**: use context7 for chrome.storage best practices and cross-browser compatibility
- **Language Detection**: use context7 for browser-native language detection APIs and fallback libraries

### Key Patterns to Follow
1. **Service Architecture**: Follow existing multi-provider AI service pattern (Groq → Claude → local fallback)
2. **Voice Management**: Extend current TTS service with voice selection logic
3. **Privacy First**: Implement consent management for AI-powered features
4. **Cross-Browser**: Handle voice availability differences across browsers
5. **Error Handling**: Graceful fallbacks when AI services are unavailable

## Implementation Plan

### Phase 1: Voice Detection & Management Service

#### Voice Service Extension
```javascript
// Extend existing TTS service
class VoiceSelectionService extends TTSService {
  constructor() {
    super();
    this.voiceCache = new Map();
    this.languageDetector = new LanguageDetector();
    this.aiRecommendationService = new AIRecommendationService();
  }

  /**
   * Get optimal voice for text content
   * @param {string} text - Text content to analyze
   * @param {Object} userPreferences - User voice preferences
   * @returns {Promise<SpeechSynthesisVoice>} Selected voice
   */
  async getOptimalVoice(text, userPreferences = {}) {
    // 1. Detect language from text
    const language = await this.languageDetector.detect(text);
    
    // 2. Get available voices for language
    const availableVoices = this.getVoicesForLanguage(language);
    
    // 3. Get AI recommendation (with user consent)
    const hasAIConsent = await this.checkAIConsent();
    let aiRecommendation = null;
    
    if (hasAIConsent) {
      // use context7 to get current Groq API specs for text complexity analysis
      aiRecommendation = await this.aiRecommendationService.recommendVoice(text, availableVoices);
    }
    
    // 4. Select best voice based on all factors
    return this.selectVoice(availableVoices, aiRecommendation, userPreferences);
  }
}
```

### Phase 2: AI Integration Service

#### AI Voice Recommendation
```javascript
// New AI service for voice recommendations
class AIRecommendationService {
  constructor() {
    this.providers = {
      groq: {
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        // use context7 to fetch current rate limits and models
      },
      claude: {
        endpoint: 'https://api.anthropic.com/v1/messages',
        // use context7 to get latest Claude API specifications
      }
    };
  }

  async recommendVoice(text, availableVoices) {
    // Analyze text characteristics using AI
    const textAnalysis = await this.analyzeText(text);
    
    // Match analysis to voice characteristics
    return this.matchVoiceToContent(textAnalysis, availableVoices);
  }

  async analyzeText(text) {
    const prompt = `Analyze this text for voice recommendation:
    Text: "${text}"
    
    Provide analysis for:
    1. Tone (formal/casual/technical/friendly)
    2. Complexity level (simple/moderate/complex)
    3. Emotional context (neutral/engaging/serious)
    4. Recommended voice characteristics (pitch, rate, formality)
    
    Respond in JSON format.`;

    // Try Groq first, then Claude
    // use context7 to get current API specifications for both services
    return await this.makeAIRequest(prompt);
  }
}
```

### Phase 3: Language Detection

#### Browser-Native Detection with Fallbacks
```javascript
// Language detection service
class LanguageDetector {
  constructor() {
    // use context7 to check current browser support for language detection APIs
    this.hasNativeSupport = this.checkNativeLanguageDetection();
    this.fallbackDetector = new FallbackLanguageDetector();
  }

  async detect(text) {
    if (this.hasNativeSupport) {
      try {
        // Use native browser language detection if available
        const detected = await this.nativeDetect(text);
        if (detected.confidence > 0.8) {
          return detected.language;
        }
      } catch (error) {
        console.warn('[LanguageDetector] Native detection failed:', error);
      }
    }

    // Fallback to pattern-based detection
    return this.fallbackDetector.detect(text);
  }

  checkNativeLanguageDetection() {
    // use context7 to check current browser API support
    return 'detectLanguage' in navigator || 'ml' in window;
  }
}
```

### Phase 4: UI Integration

#### Voice Selection Interface
```javascript
// Enhanced overlay with voice selection
class VoiceSelectionOverlay extends TTSOverlay {
  constructor() {
    super();
    this.voiceService = new VoiceSelectionService();
    this.currentVoices = [];
    this.selectedVoice = null;
  }

  async show(selectedText, mouseX, mouseY) {
    // Get optimal voice recommendation
    this.selectedVoice = await this.voiceService.getOptimalVoice(selectedText);
    this.currentVoices = await this.voiceService.getVoicesForText(selectedText);
    
    // Update UI with voice options
    this.updateVoiceOptions();
    
    // Call parent show method
    super.show(selectedText, mouseX, mouseY);
  }

  getOverlayHTML() {
    return `
      <div class="tts-overlay-content">
        <!-- Existing TTS controls -->
        ${super.getOverlayHTML()}
        
        <!-- Voice selection dropdown -->
        <div class="voice-selection-container">
          <select class="voice-selector" aria-label="Select voice">
            <!-- Populated dynamically -->
          </select>
          <button class="voice-preview" aria-label="Preview voice">
            <svg class="voice-icon"><!-- Speaker icon --></svg>
          </button>
        </div>
        
        <!-- AI recommendation indicator -->
        <div class="ai-recommendation" data-recommended="true">
          <span class="ai-badge">AI Recommended</span>
        </div>
      </div>
    `;
  }
}
```

### Phase 5: Settings & Persistence

#### Voice Preferences Management
```javascript
// Settings service for voice preferences
class VoicePreferencesService {
  constructor() {
    this.storageKey = 'voicePreferences';
    // use context7 for chrome.storage best practices
  }

  async savePreference(language, voiceName, rating) {
    const preferences = await this.getPreferences();
    
    if (!preferences[language]) {
      preferences[language] = {};
    }
    
    preferences[language][voiceName] = {
      rating,
      lastUsed: Date.now(),
      useCount: (preferences[language][voiceName]?.useCount || 0) + 1
    };

    await chrome.storage.sync.set({ [this.storageKey]: preferences });
  }

  async getPreferredVoice(language) {
    const preferences = await this.getPreferences();
    const languagePrefs = preferences[language];
    
    if (!languagePrefs) return null;
    
    // Find highest rated voice that's still available
    return Object.entries(languagePrefs)
      .sort(([,a], [,b]) => b.rating - a.rating)
      .find(([voiceName]) => this.isVoiceAvailable(voiceName))?.[0];
  }
}
```

## Implementation Requirements

### AI Service Integration
- **Groq API**: use context7 to fetch current Groq API documentation for text analysis capabilities, authentication, models, and rate limits
- **Claude API**: use context7 to get latest Claude API specifications for message format, voice recommendation prompts, and pricing
- **Fallback Strategy**: Reference both APIs using context7 for service comparison and failover logic

### Browser API Requirements  
- **Speech Synthesis**: use context7 for Web Speech API browser compatibility matrix and voice enumeration differences
- **Extension APIs**: use context7 for Chrome Extension Manifest V3 requirements and service worker limitations
- **Storage APIs**: use context7 for chrome.storage best practices, sync vs local storage, and quota limitations
- **Language Detection**: use context7 for browser-native language detection API availability and fallback options

### Security & Privacy
- **CSP Requirements**: use context7 for current Content Security Policy guidelines affecting AI API calls
- **Permission Model**: use context7 for extension permission best practices and user consent patterns
- **Data Handling**: use context7 for privacy-compliant text analysis and data retention policies

### Cross-Browser Compatibility
- **Voice Availability**: use context7 for voice differences across Chrome, Firefox, Safari, and Edge
- **API Variations**: use context7 for browser extension API differences and polyfill requirements
- **Performance**: use context7 for browser-specific performance considerations and optimization techniques

## Testing Strategy

### Unit Tests
- Voice selection algorithm accuracy
- AI recommendation service with mocked API responses  
- Language detection with various text samples
- Settings persistence and retrieval
- Error handling for unavailable voices

### Integration Tests
- End-to-end voice selection workflow
- AI service fallback behavior
- Cross-browser voice compatibility
- Settings synchronization across browser sessions

### E2E Tests
- User interaction with voice selection interface
- AI recommendation acceptance/rejection flows
- Performance testing with large text samples
- Accessibility testing with screen readers

## Success Criteria
- [ ] Voice selection accuracy >90% for supported languages
- [ ] AI recommendation response time <2 seconds
- [ ] Zero voice loading failures with proper fallbacks
- [ ] Full keyboard navigation support
- [ ] Cross-browser compatibility verified on Chrome 88+, Firefox 78+, Safari 14+, Edge 88+
- [ ] Privacy compliance with explicit consent for AI features
- [ ] Memory usage stays within TTS extension limits (<50MB)

## Validation Commands
```bash
# Development
npm run dev:chrome        # Test in Chrome development environment
npm run dev:firefox       # Test in Firefox development environment

# Testing
npm run test:unit         # Unit tests for voice selection logic
npm run test:integration  # AI service integration tests  
npm run test:e2e:all      # Cross-browser E2E tests

# Code Quality
npm run lint              # ESLint validation
npm run typecheck         # TypeScript validation (if applicable)
npm run validate          # Full code quality check
```

## Notes for Implementation
- Start with language detection and basic voice enumeration
- Implement AI service integration with proper error handling
- Add UI components incrementally with accessibility focus
- Test cross-browser compatibility early and often
- Ensure privacy compliance throughout development
- Use existing TTS service patterns and error handling approaches
- Follow extension security best practices for API key management

---

**Context7 Integration Points Summary:**
1. Groq API documentation and specifications
2. Claude API current capabilities and pricing
3. Web Speech API browser compatibility matrix
4. Chrome Extension Manifest V3 requirements
5. Language detection API availability
6. Privacy and security compliance guidelines