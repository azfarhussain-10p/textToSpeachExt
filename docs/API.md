# 📚 API Documentation - Intelligent TTS Extension

Complete API reference for developers working with the Intelligent Text-to-Speech Browser Extension.

## 📋 Table of Contents
- [Core Services API](#core-services-api)
- [TTS Service](#tts-service)
- [AI Service](#ai-service)
- [Text Highlighter](#text-highlighter)
- [Storage Service](#storage-service)
- [Browser Detection](#browser-detection)
- [Rate Limiter](#rate-limiter)
- [Content Sanitizer](#content-sanitizer)
- [Extension Messages](#extension-messages)
- [Configuration](#configuration)

## 🎤 Core Services API

### TTS Service

**File**: `src/services/tts-service.js`

#### Class: TTSService

```javascript
class TTSService {
  constructor()
  
  // Core TTS Methods
  async speak(text: string, options?: TTSOptions): Promise<void>
  pause(): void
  resume(): void
  stop(): void
  
  // Voice Management
  getVoices(): SpeechSynthesisVoice[]
  getDefaultVoice(language?: string): SpeechSynthesisVoice
  
  // Settings
  setDefaultSettings(settings: TTSSettings): void
  getSettings(): TTSSettings
  
  // Event Callbacks
  setWordBoundaryCallback(callback: Function): void
  setSentenceBoundaryCallback(callback: Function): void
  
  // State Management
  isSpeaking(): boolean
  isPaused(): boolean
  
  // Cleanup
  destroy(): void
}
```

#### Types

```typescript
interface TTSOptions {
  voice?: string;           // Voice name or 'default'
  rate?: number;           // 0.1 to 10 (default: 1.0)
  pitch?: number;          // 0 to 2 (default: 1.0)
  volume?: number;         // 0 to 1 (default: 1.0)
  language?: string;       // Language code (e.g., 'en-US')
}

interface TTSSettings {
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
  enabled: boolean;
}

interface BoundaryEvent {
  charIndex: number;
  name: 'word' | 'sentence';
  text: string;
  event: SpeechSynthesisEvent;
}
```

#### Usage Examples

```javascript
// Initialize TTS Service
const ttsService = new TTSService();
await ttsService.initialize();

// Basic text-to-speech
await ttsService.speak('Hello world');

// Advanced speech with options
await ttsService.speak('Hello world', {
  voice: 'Google US English',
  rate: 1.2,
  pitch: 1.1,
  volume: 0.8,
  language: 'en-US'
});

// Set up word boundary callback for highlighting
ttsService.setWordBoundaryCallback((event) => {
  console.log('Word at index:', event.charIndex);
  highlighter.highlightWordAt(event.charIndex, event.text);
});

// Voice selection
const voices = ttsService.getVoices();
const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
```

### AI Service

**File**: `src/services/ai-service.js`

#### Class: AIService

```javascript
class AIService {
  constructor()
  
  // Core AI Methods
  async explainText(text: string, options?: ExplainOptions): Promise<ExplanationResult>
  async generateSummary(text: string, options?: SummaryOptions): Promise<SummaryResult>
  
  // Provider Management
  setProvider(provider: 'groq' | 'claude'): void
  getAvailableProviders(): string[]
  testProviderConnection(provider: string): Promise<boolean>
  
  // Rate Limiting
  canMakeRequest(provider?: string): boolean
  getRateLimitStatus(provider: string): RateLimitStatus
  
  // Settings
  updateApiKey(provider: string, apiKey: string): Promise<void>
  removeApiKey(provider: string): Promise<void>
  
  // Privacy
  async checkUserConsent(): Promise<boolean>
  async requestConsent(): Promise<boolean>
}
```

#### Types

```typescript
interface ExplainOptions {
  level?: 'simple' | 'intermediate' | 'advanced';
  context?: string;
  examples?: boolean;
  provider?: 'groq' | 'claude' | 'auto';
}

interface ExplanationResult {
  explanation: string;
  examples: string[];
  complexity: string;
  readingTime: number;
  provider: string;
  cached: boolean;
}

interface RateLimitStatus {
  remaining: number;
  resetTime: number;
  provider: string;
}
```

#### Usage Examples

```javascript
// Initialize AI Service
const aiService = new AIService();
await aiService.initialize();

// Get explanation
const result = await aiService.explainText(
  'Quantum entanglement is a quantum mechanical phenomenon...',
  {
    level: 'simple',
    context: 'physics education',
    examples: true
  }
);

console.log(result.explanation);
console.log(result.examples);

// Check rate limits
if (aiService.canMakeRequest('groq')) {
  const explanation = await aiService.explainText(text);
}

// Handle user consent
const hasConsent = await aiService.checkUserConsent();
if (!hasConsent) {
  const granted = await aiService.requestConsent();
  if (!granted) {
    // Fallback to local explanation
  }
}
```

### Text Highlighter

**File**: `src/utils/text-highlighter.js`

#### Class: TextHighlighter

```javascript
class TextHighlighter {
  constructor()
  
  // Highlighting Control
  initializeHighlighting(element: Element, text: string): void
  highlightWordAt(charIndex: number, text: string): void
  highlightSentenceAt(charIndex: number, text: string): void
  
  // Style Management
  injectStyles(): void
  updateSettings(settings: HighlightSettings): void
  
  // Cleanup
  clearWordHighlights(): void
  cleanup(): void
  
  // State
  isActive(): boolean
}
```

#### Types

```typescript
interface HighlightSettings {
  highlightClass?: string;
  sentenceHighlightClass?: string;
  wordColor?: string;
  sentenceColor?: string;
}

interface WordBoundaries {
  start: number;
  end: number;
  word: string;
}
```

#### Usage Examples

```javascript
// Initialize text highlighter
const highlighter = new TextHighlighter();

// Set up highlighting for TTS
const textElement = document.getElementById('text-content');
highlighter.initializeHighlighting(textElement, fullText);

// Highlight word during speech
ttsService.setWordBoundaryCallback((event) => {
  highlighter.highlightWordAt(event.charIndex, fullText);
});

// Cleanup when done
ttsService.addEventListener('end', () => {
  highlighter.cleanup();
});
```

### Storage Service

**File**: `src/services/storage-service.js`

#### Class: StorageService

```javascript
class StorageService {
  constructor()
  
  // Storage Operations
  async get(keys: string | string[]): Promise<{[key: string]: any}>
  async set(items: {[key: string]: any}): Promise<void>
  async remove(keys: string | string[]): Promise<void>
  async clear(): Promise<void>
  
  // Settings Management
  async getSettings(): Promise<ExtensionSettings>
  async saveSettings(settings: Partial<ExtensionSettings>): Promise<void>
  
  // Privacy
  async getUserConsent(type: string): Promise<boolean>
  async setUserConsent(type: string, granted: boolean): Promise<void>
  
  // API Keys
  async getApiKey(provider: string): Promise<string | null>
  async setApiKey(provider: string, key: string): Promise<void>
  async removeApiKey(provider: string): Promise<void>
}
```

#### Types

```typescript
interface ExtensionSettings {
  tts: TTSSettings;
  ai: AISettings;
  privacy: PrivacySettings;
  ui: UISettings;
}

interface PrivacySettings {
  aiConsent: boolean;
  analyticsConsent: boolean;
  debugConsent: boolean;
}
```

#### Usage Examples

```javascript
// Initialize storage service
const storage = new StorageService();

// Get user settings
const settings = await storage.getSettings();

// Save TTS preferences
await storage.saveSettings({
  tts: {
    voice: 'Google US English',
    rate: 1.2,
    pitch: 1.0,
    volume: 1.0
  }
});

// Manage API keys
await storage.setApiKey('groq', 'gsk_...');
const groqKey = await storage.getApiKey('groq');

// Privacy consent
const hasConsent = await storage.getUserConsent('ai');
```

## 🔧 Utility APIs

### Browser Detection

**File**: `src/utils/browser-detection.js`

```javascript
class BrowserDetection {
  static getBrowser(): BrowserInfo
  static isChrome(): boolean
  static isFirefox(): boolean
  static isSafari(): boolean
  static isEdge(): boolean
  static isMobile(): boolean
  static getVersion(): string
  static supportsFeature(feature: string): boolean
}
```

### Rate Limiter

**File**: `src/utils/rate-limiter.js`

```javascript
class RateLimiter {
  constructor(maxRequests: number, windowMs: number)
  
  canMakeRequest(): boolean
  recordRequest(): void
  getStatus(): RateLimitStatus
  reset(): void
}
```

### Content Sanitizer

**File**: `src/utils/content-sanitizer.js`

```javascript
class ContentSanitizer {
  static sanitizeHTML(html: string): string
  static sanitizeText(text: string): string
  static stripTags(html: string): string
  static escapeHTML(text: string): string
  static validateInput(input: any, rules: ValidationRules): ValidationResult
}
```

## 📨 Extension Messages

### Message Types

```typescript
// Content Script to Background
interface MessageToBackground {
  type: 'TTS_SPEAK' | 'AI_EXPLAIN' | 'GET_SETTINGS' | 'SAVE_SETTINGS';
  data?: any;
  tabId?: number;
}

// Background to Content Script
interface MessageToContent {
  type: 'SETTINGS_UPDATED' | 'TTS_STATUS' | 'ERROR';
  data?: any;
}

// Overlay Communication
interface OverlayMessage {
  type: 'INIT_OVERLAY' | 'CLOSE_OVERLAY' | 'OVERLAY_RESIZE';
  data?: {
    text?: string;
    options?: any;
    height?: number;
    width?: number;
  };
}
```

### Usage Examples

```javascript
// Send message to background
chrome.runtime.sendMessage({
  type: 'TTS_SPEAK',
  data: {
    text: 'Hello world',
    options: { rate: 1.2 }
  }
});

// Listen for messages in content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'SETTINGS_UPDATED':
      updateUISettings(message.data);
      break;
    case 'TTS_STATUS':
      updateTTSControls(message.data);
      break;
  }
});
```

## ⚙️ Configuration

### Environment Variables

```bash
# AI Service Configuration
GROQ_API_KEY=your_groq_api_key_here
CLAUDE_API_KEY=your_claude_api_key_here

# Development Settings
NODE_ENV=development
DEBUG_MODE=true
ANALYTICS_ENABLED=false

# Extension Settings
DEFAULT_LANGUAGE=en-US
DEFAULT_RATE=1.0
SELECTION_THRESHOLD=10
```

### Manifest Permissions

```json
{
  "permissions": [
    "storage",
    "activeTab"
  ],
  "optional_permissions": [
    "https://api.groq.com/*",
    "https://api.anthropic.com/*"
  ]
}
```

## 🔗 Integration Examples

### Complete TTS Integration

```javascript
// Initialize all services
const ttsService = new TTSService();
const highlighter = new TextHighlighter();
const storage = new StorageService();

// Load user settings
const settings = await storage.getSettings();
ttsService.setDefaultSettings(settings.tts);

// Set up text highlighting
const textElement = document.getElementById('content');
highlighter.initializeHighlighting(textElement, fullText);

// Configure callbacks
ttsService.setWordBoundaryCallback((event) => {
  highlighter.highlightWordAt(event.charIndex, fullText);
});

// Start speech
await ttsService.speak(selectedText, settings.tts);
```

### AI Explanation Integration

```javascript
// Initialize AI service
const aiService = new AIService();

// Check user consent
const hasConsent = await aiService.checkUserConsent();
if (!hasConsent) {
  const granted = await aiService.requestConsent();
  if (!granted) {
    return; // User declined
  }
}

// Get explanation
try {
  const result = await aiService.explainText(complexText, {
    level: 'simple',
    context: 'educational',
    examples: true
  });
  
  displayExplanation(result);
  
  // Optionally speak the explanation
  await ttsService.speak(result.explanation);
} catch (error) {
  console.error('AI explanation failed:', error);
  // Fallback to local explanation
}
```

## 🚨 Error Handling

### Error Types

```typescript
class TTSError extends Error {
  constructor(message: string, code: string)
}

class AIServiceError extends Error {
  constructor(message: string, provider: string, code?: string)
}

class StorageError extends Error {
  constructor(message: string, operation: string)
}
```

### Error Handling Examples

```javascript
// TTS Error Handling
try {
  await ttsService.speak(text);
} catch (error) {
  if (error instanceof TTSError) {
    console.error('TTS Error:', error.message);
    // Show user-friendly message
    showError('Speech synthesis is not available in this browser');
  }
}

// AI Service Error Handling
try {
  const result = await aiService.explainText(text);
} catch (error) {
  if (error instanceof AIServiceError) {
    console.error('AI Error:', error.provider, error.message);
    // Try fallback provider or local explanation
    const fallbackResult = await getFallbackExplanation(text);
  }
}
```

## 📊 Performance Monitoring

### Performance APIs

```javascript
// Performance monitoring
const performanceMonitor = new PerformanceMonitor();

performanceMonitor.startTimer('overlay-display');
// ... show overlay
const overlayTime = performanceMonitor.endTimer('overlay-display');

performanceMonitor.monitorMemoryUsage();
const memoryInfo = performanceMonitor.getMemoryReport();
```

## 🧪 Testing APIs

### Test Utilities

```javascript
// Mock browser APIs for testing
const mockChrome = createMockChrome();
global.chrome = mockChrome;

// Mock TTS service
const mockTTS = createMockTTSService();
mockTTS.speak.mockResolvedValue();

// Test helpers
const testUtils = {
  createMockText: () => 'Test text for TTS',
  simulateTextSelection: () => { /* ... */ },
  waitForOverlay: () => new Promise(resolve => setTimeout(resolve, 100))
};
```

---

This API documentation provides comprehensive reference for developers working with the Intelligent TTS Extension codebase. All APIs are designed to be secure, performant, and accessible.

For implementation examples, see `docs/implementation-examples.md`.
For development setup, see `docs/development-guide.md`.