# Production Ready Prompt for Browser Extension Template - Text-to-Speech Extension Standards

## Metadata
```yaml
template_version: "1.0.0"
ai_optimization: "claude-4-compatible"
methodology: "test-driven-development"
architecture: "browser-extension-mvc"
extension_type: "text-to-speech"
manifest_version: "v3"
compliance: ["manifest-v3", "csp", "privacy-focused", "accessibility", "cross-browser"]
last_updated: "2024-08-21"
maintainer: "development-team"
```

## Purpose
Browser extension template optimized for AI agents to implement production-ready text-to-speech features with Manifest V3 compliance, cross-browser compatibility, and privacy-first design. Designed for iterative refinement and autonomous quality assurance for extension development success.

## Core Principles
1. **Manifest V3 First**: All features must comply with Manifest V3 requirements
2. **Privacy by Design**: No data collection without explicit user consent
3. **Cross-Browser Compatibility**: Support Chrome, Firefox, Safari, Edge
4. **Content Security Policy**: Strict CSP compliance with no inline scripts
5. **Performance Conscious**: Minimal memory footprint and fast load times
6. **Accessibility Compliant**: WCAG 2.1 AA standards with screen reader support
7. **Text-to-Speech Focused**: Optimized for TTS functionality and AI integration
8. **Test-Driven Development**: Comprehensive testing including cross-browser tests
9. **Context Completeness**: All necessary information for autonomous implementation
10. **Extension Store Ready**: Prepared for submission to browser extension stores

---

## 📋 TTS Extension Feature Definition

### Goal Statement
**[SMART Goal]**: [Specific TTS feature with measurable success criteria, achievable with current browser APIs, relevant to user accessibility needs, time-bound implementation]

**Business Context**: [How this TTS feature improves web accessibility, user engagement, or content consumption]

**Technical Scope**: [Browser extension boundaries, supported websites, AI service integrations, voice synthesis capabilities]

### Why (TTS Feature Justification)
- **Accessibility Value**: [Impact on users with reading difficulties, visual impairments, or learning differences]
- **User Experience**: [Enhanced content consumption, multitasking capabilities, language learning support]
- **Market Opportunity**: [Growing demand for audio content, accessibility compliance requirements]
- **Technology Advantage**: [Leveraging modern Web Speech API, AI explanations, cross-browser compatibility]
- **Privacy Leadership**: [User-controlled data, transparent AI usage, local processing where possible]

### What (TTS Functional Requirements)
**Primary TTS Features**:
- Text selection and speech synthesis with natural voices
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- Voice customization (rate, pitch, volume, language selection)
- Accessibility compliance (keyboard navigation, screen reader support)

**AI-Enhanced Features**:
- Intelligent text explanations using Groq/Claude APIs
- Context-aware content processing
- Multi-language support with appropriate voice matching
- Privacy-first AI integration with explicit user consent

**Secondary Features**:
- Text highlighting during speech playback
- Speech queue management for multiple selections
- Offline functionality for core TTS features
- Extension settings import/export

**Non-Functional Requirements**:
- **Performance**: Overlay appears within 300ms, TTS starts within 500ms
- **Security**: Manifest V3 compliance, CSP adherence, no inline scripts
- **Accessibility**: WCAG 2.1 AA compliance, full keyboard navigation
- **Reliability**: Works on 95% of websites, graceful error handling
- **Privacy**: No data collection without consent, secure API key storage

### Success Criteria & KPIs
**Technical Metrics**:
- [ ] **Performance**: Overlay response time < 300ms (95th percentile)
- [ ] **Cross-Browser**: Compatible with Chrome 88+, Firefox 78+, Safari 14+, Edge 88+
- [ ] **Security**: Zero CSP violations, Manifest V3 compliant
- [ ] **Quality**: Test coverage > 85%, cross-browser E2E tests passing
- [ ] **Accessibility**: WCAG 2.1 AA compliance, keyboard navigation score 100%

**User Experience Metrics**:
- [ ] **Usability**: Less than 2 clicks to start TTS, intuitive overlay design
- [ ] **Reliability**: TTS success rate > 95% across supported browsers
- [ ] **AI Integration**: Explanation generation within 3 seconds
- [ ] **Memory Efficiency**: Extension memory usage < 50MB during active use
- [ ] **Voice Quality**: Support for 15+ languages with appropriate voice selection

---

## 📚 Comprehensive Context Repository

### Required Documentation & References
```yaml
# CRITICAL READING - Include in context window
security:
  - url: [OWASP Top 10 2023]
    sections: [Relevant security patterns for this feature]
    critical: [Authentication/authorization requirements]
    note: "use context7 to fetch latest security guidelines"
  
  - file: [security/policies/data-protection.md]
    why: [PII handling and encryption standards]

architecture:
  - file: [docs/architecture/clean-architecture.md]
    why: [Dependency injection and layer separation patterns]
  
  - url: [12factor.net]
    sections: [Config, dependencies, backing services]
    note: "use context7 to get current best practices"

api_design:
  - file: [docs/api/rest-standards.md]
    why: [HTTP status codes, error formats, versioning]
  
  - url: [OpenAPI 3.1 Specification]
    sections: [Schema definition and validation]
    note: "use context7 for latest API specification patterns"

ai_services:
  - provider: "Groq API Documentation" 
    sections: [Authentication, rate limits, request/response formats]
    note: "use context7 to fetch current Groq API docs and pricing"
    critical: [Free tier limitations, model availability]
  
  - provider: "Claude API Documentation"
    sections: [Authentication, message format, rate limits]
    note: "use context7 to get latest Claude API specifications"
    critical: [Pricing, model capabilities, content policies]

browser_apis:
  - spec: "Web Speech API"
    sections: [SpeechSynthesis, SpeechSynthesisUtterance]
    note: "use context7 for browser compatibility and limitations"
    critical: [Cross-browser differences, voice availability]
    
  - spec: "Chrome Extension APIs"
    sections: [chrome.storage, chrome.runtime, content scripts]
    note: "use context7 for Manifest V3 requirements and migration guide"
    critical: [Service worker limitations, CSP requirements]

testing:
  - file: [docs/testing/test-pyramid.md]
    why: [Unit, integration, e2e test strategies]
  
  - url: [Testing Best Practices Guide]
    sections: [Mocking, fixtures, test data management]

observability:
  - file: [docs/observability/logging-standards.md]
    why: [Structured logging, correlation IDs, PII redaction]
  
  - file: [docs/observability/metrics-naming.md]
    why: [Prometheus naming conventions and cardinality]

performance:
  - file: [docs/performance/optimization-guide.md]
    why: [Caching strategies, database optimization]
  
  - url: [Google Web Vitals]
    sections: [Core performance metrics and thresholds]

accessibility:
  - url: [WCAG 2.1 Guidelines]
    sections: [Relevant to UI components being built]
  
  - file: [docs/accessibility/component-standards.md]
    why: [Existing patterns and ARIA implementations]

compliance:
  - file: [docs/compliance/gdpr-requirements.md]
    why: [Data processing and consent management]
  
  - file: [docs/compliance/audit-trail.md]
    why: [Required logging for compliance verification]
```

### Current System Architecture
```bash
# EXECUTE: tree -I '__pycache__|*.pyc|node_modules|.git' -L 3
# Paste complete output here for AI context

```

### Target Architecture with New Components
```bash
# Browser Extension Architecture (Manifest V3)

src/
├── background/               # Service Worker (Manifest V3)
│   ├── service-worker.js    # Main background script
│   ├── ai-service.js        # AI API integration
│   ├── storage-service.js   # Settings and data management
│   └── message-handler.js   # Cross-context communication
├── content/                 # Content Scripts
│   ├── content-script.js    # Main content script
│   ├── text-selector.js     # Text selection handling
│   ├── overlay-ui.js        # TTS overlay interface
│   └── tts-controller.js    # Speech synthesis control
├── popup/                   # Extension Popup
│   ├── popup.html          # Popup interface
│   ├── popup.js            # Popup logic
│   ├── popup.css           # Popup styling
│   └── settings-ui.js      # Settings management
├── options/                 # Options Page
│   ├── options.html        # Settings page
│   ├── options.js          # Settings logic
│   └── options.css         # Settings styling
├── assets/                  # Static Assets
│   ├── icons/              # Extension icons
│   ├── images/             # UI images
│   └── sounds/             # Audio feedback
├── shared/                  # Shared Utilities
│   ├── utils.js            # Common utilities
│   ├── constants.js        # Configuration constants
│   ├── error-handler.js    # Error management
│   └── logger.js           # Debug logging
└── _locales/               # Internationalization
    ├── en/messages.json    # English strings
    ├── ur/messages.json    # Urdu strings
    └── ar/messages.json    # Arabic strings

# NEW FILES FOR THIS FEATURE:
src/content/[feature-name]-overlay.js        # Feature-specific UI overlay
src/background/[feature-name]-service.js     # Background service logic
src/shared/[feature-name]-utils.js           # Shared feature utilities
tests/unit/[feature-name].test.js            # Unit tests
tests/e2e/[feature-name].spec.js             # Cross-browser E2E tests
```

### Critical Codebase Knowledge & Extension Constraints
```javascript
// MANIFEST V3 GOTCHAS
// CRITICAL: No inline scripts allowed - all scripts must be in separate files
// BAD: <script>inline code</script>
// GOOD: <script src="script.js"></script>

// CRITICAL: Use chrome.storage instead of localStorage for persistence
import { StorageService } from '../shared/storage-service.js';
const storage = new StorageService();
await storage.set('userSettings', settings);

// SERVICE WORKER PATTERNS
// CRITICAL: Background scripts are service workers in Manifest V3
// GOTCHA: Service workers can be terminated - use chrome.storage for persistence
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle cross-context messaging
  if (message.type === 'TTS_REQUEST') {
    handleTTSRequest(message.data).then(sendResponse);
    return true; // Keep message channel open for async response
  }
});

// CONTENT SCRIPT COMMUNICATION
// CRITICAL: Content scripts communicate via message passing
const response = await chrome.runtime.sendMessage({
  type: 'AI_EXPLANATION_REQUEST',
  text: selectedText,
  context: pageContext
});

// CSP COMPLIANCE
// CRITICAL: No eval(), no inline event handlers, no external scripts
// BAD: onclick="handler()" or eval(code)
// GOOD: addEventListener and separate script files
element.addEventListener('click', handleClick);

// ERROR HANDLING
// CRITICAL: Handle extension context invalidation
try {
  await chrome.runtime.sendMessage(message);
} catch (error) {
  if (error.message.includes('Extension context invalidated')) {
    // Extension was reloaded/disabled
    window.location.reload();
  }
}

// TTS API CONSTRAINTS
// CRITICAL: speechSynthesis can be paused by browser - implement recovery
const utterance = new SpeechSynthesisUtterance(text);
utterance.onend = () => { /* cleanup */ };
utterance.onerror = (event) => { 
  console.error('TTS Error:', event.error);
  // Implement fallback or retry logic
};

// CROSS-BROWSER COMPATIBILITY
// GOTCHA: Use browser.* API with polyfill or chrome.* with fallback
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// MEMORY MANAGEMENT
// CRITICAL: Clean up listeners and references to prevent memory leaks
class OverlayManager {
  constructor() {
    this.cleanup = [];
  }
  
  destroy() {
    this.cleanup.forEach(fn => fn());
    this.cleanup = [];
  }
}

// PRIVACY COMPLIANCE
// CRITICAL: Get explicit consent before sending data to external APIs
const hasConsent = await storage.get('aiServiceConsent');
if (hasConsent) {
  // Send to AI service
} else {
  // Show consent dialog
}

// PERFORMANCE
// CRITICAL: Use requestIdleCallback for non-critical operations
requestIdleCallback(() => {
  // Perform background processing
});
```

---

## 🏗️ Implementation Blueprint

### Data Models and Structure
Create the core data models to ensure type safety and consistency:

```python
# Examples: 
# - ORM models
# - Pydantic models  
# - Pydantic schemas
# - Pydantic validators

# Domain Entity Example:
@dataclass(frozen=True)  # Immutable entities
class FeatureEntity:
    """Core business entity representing [feature concept]
    
    Business Rules:
    - [Rule 1: e.g., Name must be unique within organization]
    - [Rule 2: e.g., Cannot be deleted if has active dependencies]
    """
    id: UUID
    name: str
    status: FeatureStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    def __post_init__(self):
        """Domain validation - enforce business rules"""
        if not self.name or len(self.name.strip()) == 0:
            raise ValueError("Feature name cannot be empty")
```

### Implementation Task List
List of tasks to be completed to fulfill the PRP in order:

```yaml
Task 1: Domain Layer Setup
  CREATE src/domain/entities/[feature_name].py:
    - Define core business entity with validation
    - Implement business rules and invariants
    - Add value objects and enums
  
  CREATE src/domain/repositories/[feature_name]_repository.py:
    - Define repository interface (abstract base class)
    - Specify data access contract methods
    - Document expected behaviors

Task 2: Application Layer Implementation  
  CREATE src/application/services/[feature_name]_service.py:
    - Implement use case orchestration
    - Add business logic coordination
    - Handle cross-cutting concerns
  
  CREATE src/application/commands/[feature_name]_commands.py:
    - Define CQRS command handlers
    - Add input validation and sanitization
    - Implement error handling patterns

Task 3: Infrastructure Layer
  CREATE src/infrastructure/repositories/[feature_name]_impl.py:
    - Implement repository interface
    - Add database mapping logic
    - Include connection pool management
  
  CREATE migrations/versions/[timestamp]_create_[feature_name]_table.py:
    - Define database schema
    - Add proper indexes and constraints
    - Include rollback procedures

Task 4: Presentation Layer
  CREATE src/presentation/api/v1/[feature_name]_routes.py:
    - Implement REST API endpoints
    - Add request/response DTOs
    - Include authentication/authorization
  
  CREATE src/presentation/api/v1/schemas/[feature_name]_schemas.py:
    - Define Pydantic request/response models
    - Add validation rules and constraints
    - Include API documentation strings

Task 5: Testing Implementation
  CREATE tests/unit/domain/test_[feature_name].py:
    - Unit tests for domain entities
    - Business rule validation tests
    - Edge case and error scenario tests
  
  CREATE tests/integration/test_[feature_name]_api.py:
    - API endpoint integration tests
    - Database interaction tests
    - End-to-end workflow tests
```

### Per Task Pseudocode
```python
# Task 1 - Domain Entity Pseudocode
class FeatureEntity:
    # PATTERN: Immutable entities with business validation
    def __post_init__(self):
        # CRITICAL: Validate all business rules
        validate_business_rules(self)
    
    def business_method(self) -> 'FeatureEntity':
        # PATTERN: Return new instance for immutability
        # GOTCHA: Always validate state transitions
        if not self.can_perform_action():
            raise BusinessError("Action not allowed in current state")
        return replace(self, new_state=calculated_state)

# Task 2 - Application Service Pseudocode  
async def create_feature(self, request: CreateRequest) -> FeatureEntity:
    # PATTERN: Always validate input first (see src/validators.py)
    validated = await validate_input(request)
    
    # PATTERN: Check business rules before creation
    await self._check_uniqueness_constraint(validated.name)
    
    # PATTERN: Use domain factory method
    feature = FeatureEntity.create(validated.name, validated.properties)
    
    # PATTERN: Persist through repository abstraction
    saved_feature = await self._repository.save(feature)
    
    # PATTERN: Emit domain events for side effects
    await self._event_publisher.publish(FeatureCreatedEvent(saved_feature))
    
    return saved_feature

# Task 3 - Infrastructure Repository Pseudocode
async def save(self, entity: FeatureEntity) -> FeatureEntity:
    # PATTERN: Use connection pooling (see src/db/pool.py)
    async with get_connection() as conn:
        # CRITICAL: Use parameterized queries to prevent SQL injection
        query = "INSERT INTO features (id, name, status) VALUES ($1, $2, $3)"
        await conn.execute(query, entity.id, entity.name, entity.status.value)
        
        # PATTERN: Return updated entity with database-generated fields
        return entity.with_timestamps(created_at=datetime.utcnow())

# Task 4 - API Endpoint Pseudocode
@router.post("/", response_model=FeatureResponse)
@rate_limit(requests=10, window=60)  # CRITICAL: Rate limiting
async def create_feature(
    request: FeatureCreateRequest,
    current_user: User = Depends(get_current_user)  # CRITICAL: Authentication
):
    try:
        # PATTERN: Input validation through Pydantic
        validated_request = FeatureCreateRequest.validate(request)
        
        # PATTERN: Use application service for business logic
        feature = await feature_service.create_feature(
            validated_request, 
            current_user.id
        )
        
        # PATTERN: Convert to response DTO
        return FeatureResponse.from_entity(feature)
        
    except BusinessError as e:
        # PATTERN: Standardized error response
        raise HTTPException(status_code=409, detail=str(e))
```

### Integration Points
```yaml
DATABASE:
  migration: "Add table 'features' with proper constraints and indexes"
  indexes: 
    - "CREATE INDEX idx_features_status ON features(status)"
    - "CREATE INDEX idx_features_created_at ON features(created_at)"
  constraints:
    - "UNIQUE constraint on (name, organization_id)"
    - "CHECK constraint on status enum values"

CONFIGURATION:
  add_to: "config/settings.py"
  pattern: "FEATURE_CACHE_TTL = int(os.getenv('FEATURE_CACHE_TTL', '300'))"
  environment_variables:
    - "FEATURE_RATE_LIMIT_REQUESTS=100"
    - "FEATURE_RATE_LIMIT_WINDOW=3600"

API_ROUTES:
  add_to: "src/api/routes.py"  
  pattern: "router.include_router(feature_router, prefix='/api/v1/features')"
  versioning: "All new endpoints must use /api/v1/ prefix"

MONITORING:
  metrics:
    - "features_created_total (counter)"
    - "feature_operation_duration_seconds (histogram)"
  alerts:
    - "Feature creation rate > 1000/hour"
    - "Feature operation P95 latency > 500ms"

SECURITY:
  authentication: "All endpoints require valid JWT token"
  authorization: "Role-based access control using @require_role decorator"
  rate_limiting: "Apply rate limiting to all public endpoints"
```

---

## 🧪 Comprehensive Testing Strategy

### Level 1: Unit Tests (Component & Service Layer)
```javascript
// tests/unit/content/test-tts-controller.test.js
describe('TTSController', () => {
  let ttsController;
  let mockSpeechSynthesis;
  
  beforeEach(() => {
    // Mock browser APIs
    mockSpeechSynthesis = {
      speak: jest.fn(),
      cancel: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      getVoices: jest.fn(() => [])
    };
    
    global.speechSynthesis = mockSpeechSynthesis;
    ttsController = new TTSController();
  });
  
  test('should create valid TTS utterance', () => {
    // Given
    const text = 'Hello world';
    const options = { rate: 1.0, pitch: 1.0, voice: null };
    
    // When
    const utterance = ttsController.createUtterance(text, options);
    
    // Then
    expect(utterance.text).toBe('Hello world');
    expect(utterance.rate).toBe(1.0);
    expect(utterance.pitch).toBe(1.0);
  });
  
  test('should validate text input', () => {
    // Given - empty text
    const emptyText = '';
    
    // When/Then
    expect(() => {
      ttsController.createUtterance(emptyText);
    }).toThrow('Text cannot be empty');
  });
  
  test('should handle speech synthesis errors', async () => {
    // Given
    const mockUtterance = { onerror: null };
    jest.spyOn(window, 'SpeechSynthesisUtterance').mockReturnValue(mockUtterance);
    
    // When
    await ttsController.speak('test text');
    
    // Simulate error
    mockUtterance.onerror({ error: 'network-error' });
    
    // Then
    expect(ttsController.getLastError()).toBe('network-error');
  });
});

// tests/unit/background/test-ai-service.test.js  
describe('AIService', () => {
  let aiService;
  let mockFetch;
  
  beforeEach(() => {
    mockFetch = jest.fn();
    global.fetch = mockFetch;
    aiService = new AIService();
  });
  
  test('should explain text successfully', async () => {
    // Given
    const text = 'Complex technical text';
    const mockResponse = {
      explanation: 'Simple explanation',
      examples: ['Example 1'],
      complexity: 'intermediate'
    };
    
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });
    
    // When
    const result = await aiService.explainText(text);
    
    // Then
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/explain'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining(text)
      })
    );
    expect(result.explanation).toBe('Simple explanation');
  });
  
  test('should handle API failures gracefully', async () => {
    // Given
    mockFetch.mockRejectedValue(new Error('Network error'));
    
    // When/Then
    await expect(aiService.explainText('test')).rejects.toThrow('AI service unavailable');
  });
```

### Level 2: Integration Tests (Extension Context)
```javascript
// tests/integration/test-extension-messaging.test.js
describe('Extension Integration', () => {
  let extension;
  
  beforeEach(async () => {
    // Load extension in test environment
    extension = await loadExtension('./dist/test');
  });
  
  afterEach(async () => {
    await extension.unload();
  });
  
  test('should handle content-background messaging', async () => {
    // Given
    const mockTab = await extension.newTab('http://example.com');
    
    // When - content script sends message to background
    const response = await mockTab.evaluate(() => {
      return chrome.runtime.sendMessage({
        type: 'TTS_REQUEST',
        text: 'Hello world',
        options: { rate: 1.0 }
      });
    });
    
    // Then
    expect(response.success).toBe(true);
    expect(response.utteranceId).toBeDefined();
  });
  
  test('should persist settings across sessions', async () => {
    // Given
    const settings = { rate: 1.5, pitch: 1.2, language: 'en-US' };
    
    // When
    await extension.storage.set('ttsSettings', settings);
    await extension.restart(); // Simulate extension restart
    const retrievedSettings = await extension.storage.get('ttsSettings');
    
    // Then
    expect(retrievedSettings).toEqual(settings);
  });
  
  test('should handle AI service integration', async () => {
    // Given
    const mockAIResponse = {
      explanation: 'Test explanation',
      examples: ['Example'],
      complexity: 'simple'
    };
    
    // Mock AI service
    extension.mockAPI('/api/explain', mockAIResponse);
    
    // When
    const response = await extension.background.explainText('Complex text');
    
    // Then
    expect(response.explanation).toBe('Test explanation');
  });
  
  test('should validate content script injection', async () => {
    // Given
    const testPage = await extension.newTab('https://example.com');
    
    // When
    const isInjected = await testPage.evaluate(() => {
      return typeof window.ttsExtension !== 'undefined';
    });
    
    // Then
    expect(isInjected).toBe(true);
  });
});
```

### Level 3: Security Tests
```javascript
// tests/security/test-extension-security.test.js
describe('Extension Security', () => {
  
  test('should prevent XSS in content script', async () => {
    // Given - malicious content on page
    const maliciousHTML = `<div data-text="<script>alert('xss')</script>">Test</div>`;
    const testPage = await extension.newTab(`data:text/html,${maliciousHTML}`);
    
    // When - extension processes the content
    const processedText = await testPage.evaluate(() => {
      const element = document.querySelector('[data-text]');
      return window.ttsExtension.extractText(element);
    });
    
    // Then - should sanitize HTML
    expect(processedText).not.toContain('<script>');
    expect(processedText).not.toContain('alert(');
  });
  
  test('should validate API inputs', async () => {
    // Given - malicious AI request
    const maliciousPayload = {
      text: '<script>eval()</script>',
      context: '"; DROP TABLE users; --'
    };
    
    // When
    const response = await extension.background.sendToAI(maliciousPayload);
    
    // Then - should sanitize or reject
    expect(response.error).toBeDefined();
    expect(response.error).toContain('Invalid input');
  });
  
  test('should enforce CSP compliance', async () => {
    // Given
    const testPage = await extension.newTab('https://example.com');
    
    // When - try to execute inline script
    const cspViolation = await testPage.evaluate(() => {
      try {
        eval('console.log("CSP violation")');
        return false;
      } catch (e) {
        return e.name === 'EvalError';
      }
    });
    
    // Then - should block inline scripts
    expect(cspViolation).toBe(true);
  });
  
  test('should protect against data exfiltration', async () => {
    // Given
    const sensitiveData = 'user-password-123';
    const testPage = await extension.newTab('https://malicious-site.com');
    
    // When - malicious site tries to access extension data
    const canAccessData = await testPage.evaluate(() => {
      try {
        // Try to access extension storage
        return chrome.storage !== undefined;
      } catch (e) {
        return false;
      }
    });
    
    // Then - should be isolated
    expect(canAccessData).toBe(false);
  });
});
```

### Level 4: Performance Tests
```javascript
// tests/performance/test-extension-performance.test.js
describe('Extension Performance', () => {
  
  test('should load extension quickly', async () => {
    // Given
    const startTime = performance.now();
    
    // When
    const extension = await loadExtension('./dist');
    await extension.waitForReady();
    
    const loadTime = performance.now() - startTime;
    
    // Then - should load within 1 second
    expect(loadTime).toBeLessThan(1000);
  });
  
  test('should handle large text efficiently', async () => {
    // Given - 10KB of text
    const largeText = 'Lorem ipsum '.repeat(1000);
    const startTime = performance.now();
    
    // When
    const result = await extension.background.processText(largeText);
    const processingTime = performance.now() - startTime;
    
    // Then - should process within 500ms
    expect(processingTime).toBeLessThan(500);
    expect(result.success).toBe(true);
  });
  
  test('should limit memory usage', async () => {
    // Given
    const initialMemory = await extension.getMemoryUsage();
    
    // When - process multiple requests
    for (let i = 0; i < 100; i++) {
      await extension.background.processText(`Test text ${i}`);
    }
    
    const finalMemory = await extension.getMemoryUsage();
    const memoryIncrease = finalMemory - initialMemory;
    
    // Then - should not exceed 50MB increase
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
  });
  
  test('should handle concurrent TTS requests', async () => {
    // Given
    const concurrentRequests = 10;
    const startTime = performance.now();
    
    // When - make concurrent TTS requests
    const promises = Array.from({ length: concurrentRequests }, (_, i) => 
      extension.content.speak(`Concurrent test ${i}`)
    );
    
    const results = await Promise.all(promises);
    const totalTime = performance.now() - startTime;
    
    // Then
    expect(results.every(r => r.success)).toBe(true);
    expect(totalTime).toBeLessThan(3000); // Within 3 seconds
  });
});
```

### Level 5: Cross-Browser E2E Tests
```javascript
// tests/e2e/test-tts-workflow.spec.js
const { test, expect } = require('@playwright/test');

['chromium', 'firefox', 'webkit'].forEach(browserName => {
  test.describe(`TTS Extension E2E - ${browserName}`, () => {
    test.use({ browserName });
    
    test('complete TTS workflow', async ({ page, context }) => {
      // Given - load extension and navigate to test page
      await context.addInitScript(() => {
        // Mock extension APIs for testing
        window.chrome = {
          runtime: {
            sendMessage: (msg) => Promise.resolve({ success: true }),
            onMessage: { addListener: () => {} }
          },
          storage: {
            sync: {
              get: (keys) => Promise.resolve({}),
              set: (data) => Promise.resolve()
            }
          }
        };
      });
      
      await page.goto('https://example.com');
      
      // When - select text and trigger TTS
      await page.setContent(`
        <div id="test-content">
          This is a test paragraph for text-to-speech functionality.
          The extension should detect this text selection and provide TTS controls.
        </div>
      `);
      
      // Select text
      await page.locator('#test-content').selectText();
      
      // Verify overlay appears
      await expect(page.locator('[data-tts-overlay]')).toBeVisible();
      
      // Click play button
      await page.locator('[data-tts-play]').click();
      
      // Then - verify TTS is initiated
      const ttsStatus = await page.evaluate(() => {
        return window.speechSynthesis.speaking;
      });
      
      expect(ttsStatus).toBe(true);
    });
    
    test('AI explanation workflow', async ({ page, context }) => {
      // Given
      await page.goto('https://example.com');
      await page.setContent(`
        <div id="technical-content">
          Quantum entanglement is a physical phenomenon that occurs when 
          pairs or groups of particles interact in ways such that the 
          quantum state of each particle cannot be described independently.
        </div>
      `);
      
      // When - request explanation
      await page.locator('#technical-content').selectText();
      await page.locator('[data-tts-explain]').click();
      
      // Then - verify explanation appears
      await expect(page.locator('[data-explanation-popup]')).toBeVisible();
      
      const explanationText = await page.locator('[data-explanation-content]').textContent();
      expect(explanationText).toContain('simple');
    });
    
    test('settings persistence', async ({ page, context }) => {
      // Given - open extension settings
      await page.goto('chrome-extension://test/options.html');
      
      // When - change settings
      await page.locator('[data-setting-rate]').fill('1.5');
      await page.locator('[data-setting-pitch]').fill('1.2');
      await page.locator('[data-save-settings]').click();
      
      // Reload page
      await page.reload();
      
      // Then - verify settings persisted
      const rate = await page.locator('[data-setting-rate]').inputValue();
      const pitch = await page.locator('[data-setting-pitch]').inputValue();
      
      expect(rate).toBe('1.5');
      expect(pitch).toBe('1.2');
    });
    
    test('accessibility compliance', async ({ page }) => {
      // Given
      await page.goto('https://example.com');
      
      // When - navigate using keyboard only
      await page.keyboard.press('Tab'); // Focus first element
      await page.keyboard.press('Enter'); // Activate TTS
      
      // Then - verify keyboard navigation works
      const focusedElement = await page.evaluate(() => 
        document.activeElement.getAttribute('data-tts-control')
      );
      
      expect(focusedElement).not.toBeNull();
      
      // Verify ARIA labels
      const playButton = page.locator('[data-tts-play]');
      await expect(playButton).toHaveAttribute('aria-label', 'Play text-to-speech');
    });
  });
});
```

---

## 🔒 Security & Compliance Framework

### Browser Extension Security Checklist
- [ ] **Manifest V3 Compliance**: All security requirements met
- [ ] **Content Security Policy**: Strict CSP with no unsafe-eval/unsafe-inline
- [ ] **Input Sanitization**: All user content sanitized to prevent XSS
- [ ] **Permission Minimization**: Only necessary permissions requested
- [ ] **Cross-Origin Isolation**: Proper origin validation for AI APIs
- [ ] **Data Privacy**: No data collection without explicit consent
- [ ] **Secrets Management**: API keys stored securely, not in code
- [ ] **Extension Isolation**: Proper isolation between content/background scripts
- [ ] **Host Permissions**: Minimal host permissions, specific domains only
- [ ] **Dependency Scanning**: No vulnerabilities in dependencies

### Compliance Validation
```javascript
// Extension compliance testing framework
class ExtensionComplianceTests {
  /**
   * Test privacy compliance for browser extensions
   */
  testPrivacyCompliance() {
    // Test data minimization - only collect necessary data
    const collectedData = extension.getCollectedData();
    expect(collectedData).toEqual(['userSettings', 'errorLogs']);
    
    // Test consent management
    const hasConsentDialog = extension.hasConsentDialog();
    expect(hasConsentDialog).toBe(true);
    
    // Test data deletion capability
    const canDeleteData = extension.canDeleteUserData();
    expect(canDeleteData).toBe(true);
  }
  
  testAccessibilityCompliance() {
    // Test WCAG 2.1 AA compliance
    
    // Keyboard navigation
    const keyboardAccessible = extension.testKeyboardNavigation();
    expect(keyboardAccessible).toBe(true);
    
    // Screen reader compatibility
    const hasAriaLabels = extension.testAriaLabels();
    expect(hasAriaLabels).toBe(true);
    
    // Color contrast ratios
    const contrastRatio = extension.getColorContrast();
    expect(contrastRatio).toBeGreaterThan(4.5); // WCAG AA requirement
  }
  
  testStoreCompliance() {
    // Chrome Web Store compliance
    const chromeCompliant = extension.validateChromeStoreRequirements();
    expect(chromeCompliant.manifestV3).toBe(true);
    expect(chromeCompliant.permissions).toBeLessThan(5); // Minimal permissions
    
    // Firefox Add-ons compliance
    const firefoxCompliant = extension.validateFirefoxRequirements();
    expect(firefoxCompliant.privacyPolicy).toBe(true);
    expect(firefoxCompliant.noEval).toBe(true);
  }
```

---

## 📊 Observability & Monitoring

### Performance Monitoring for TTS Extensions
**IMPORTANT**: use context7 to get current browser performance APIs and monitoring best practices for extensions

### Logging Implementation
```python
# Structured logging with security compliance
import structlog

logger = structlog.get_logger(__name__)

async def create_feature_with_logging(name: str, user_id: str) -> FeatureEntity:
    """Example of proper logging in business logic"""
    logger.info(
        "Feature creation started",
        user_id=user_id,
        feature_name=name,  # Safe to log
        action="create_feature_start",
        correlation_id=get_correlation_id()
    )
    
    try:
        feature = await feature_service.create_feature(name, user_id)
        
        logger.info(
            "Feature creation completed",
            user_id=user_id,
            feature_id=str(feature.id),
            action="create_feature_success",
            correlation_id=get_correlation_id()
        )
        
        return feature
        
    except BusinessError as e:
        logger.warning(
            "Feature creation failed - business rule violation",
            user_id=user_id,
            error=str(e),
            action="create_feature_business_error",
            correlation_id=get_correlation_id()
        )
        raise
    except Exception as e:
        logger.error(
            "Feature creation failed - unexpected error",
            user_id=user_id,
            error=str(e),
            error_type=type(e).__name__,
            action="create_feature_error",
            correlation_id=get_correlation_id(),
            exc_info=True
        )
        raise
```

### Metrics Collection
```python
# Prometheus metrics for monitoring
from prometheus_client import Counter, Histogram, Gauge

# Business metrics
FEATURES_CREATED_TOTAL = Counter(
    'features_created_total',
    'Total features created',
    ['organization_id', 'user_role']
)

# Performance metrics  
FEATURE_OPERATION_DURATION = Histogram(
    'feature_operation_duration_seconds',
    'Time spent on feature operations',
    ['operation', 'status']
)

# System metrics
ACTIVE_FEATURES_GAUGE = Gauge(
    'active_features_total',
    'Number of active features'
)

# Usage with decorator
def track_metrics(operation: str):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            start_time = time.time()
            status = "success"
            
            try:
                result = await func(*args, **kwargs)
                FEATURES_CREATED_TOTAL.labels(
                    organization_id=kwargs.get('org_id', 'unknown'),
                    user_role=kwargs.get('role', 'unknown')
                ).inc()
                return result
            except Exception as e:
                status = "error"
                raise
            finally:
                duration = time.time() - start_time
                FEATURE_OPERATION_DURATION.labels(
                    operation=operation,
                    status=status
                ).observe(duration)
        
        return wrapper
    return decorator
```

---

## 🎯 TTS Extension Implementation Checklist

### Pre-Implementation Requirements
**CRITICAL - Review Before Starting**:

- [ ] **Context7 Documentation Access**: Ensure context7 tool is available for real-time API documentation
- [ ] **Browser Compatibility Matrix**: use context7 for current Web Speech API support across browsers
- [ ] **Manifest V3 Requirements**: use context7 for latest Chrome extension guidelines and requirements
- [ ] **AI Service Documentation**: use context7 for current Groq API and Claude API specifications
- [ ] **Accessibility Guidelines**: use context7 for WCAG 2.1 AA requirements and testing tools
- [ ] **Privacy Regulations**: use context7 for current data privacy laws and browser extension compliance

### Context7 Integration Points
**IMPORTANT**: The following areas MUST use context7 for current documentation:

```markdown
## AI Service Integration
**Groq API**: use context7 to fetch current Groq API documentation for:
- Authentication methods and API key format
- Rate limiting (currently 100 requests/hour for free tier)
- Model availability (llama3-8b-8192, mixtral-8x7b-32768, etc.)
- Request/response format and error handling
- Pricing and usage quotas

**Claude API**: use context7 to get latest Claude API specifications for:
- Authentication and API key management
- Message format and conversation structure
- Rate limits and pricing tiers
- Model capabilities (Claude-3-haiku, Claude-3-sonnet)
- Content policies and safety guidelines

## Browser Extension APIs
**Chrome Extension APIs**: use context7 for Manifest V3 requirements:
- Service worker limitations and best practices
- chrome.storage API quotas and sync limitations
- Content script injection patterns
- Cross-origin request policies
- CSP requirements and security restrictions

**Web Speech API**: use context7 for browser compatibility:
- speechSynthesis availability across browsers
- Voice availability and language support
- Platform-specific voice characteristics
- Browser-specific rate and pitch limitations
- Error handling patterns

## Cross-Browser Compatibility
**Firefox Extensions**: use context7 for WebExtension standards:
- manifest.json differences from Chrome
- Browser API polyfill requirements
- Firefox-specific voice handling
- AMO submission requirements

**Safari Extensions**: use context7 for Safari-specific requirements:
- Safari extension format and conversion
- macOS/iOS voice integration
- Safari-specific permissions and limitations
- App Store submission process
```

### Implementation Phases

#### Phase 1: Foundation & Core TTS (Week 1)
```javascript
// Essential Files to Create
- src/manifest.json              // Manifest V3 configuration
- src/background/service-worker.js // Background service worker
- src/content/content-script.js  // Content script for text selection
- src/shared/tts-service.js      // Web Speech API wrapper
- src/content/tts-overlay.js     // TTS control overlay

// Key Implementation Points
✅ Manifest V3 compliance with proper permissions
✅ Service worker message handling
✅ Text selection detection and sanitization  
✅ Basic TTS functionality with error handling
✅ Responsive overlay with accessibility support
```

#### Phase 2: AI Integration & Privacy (Week 2)  
```javascript
// AI Service Files
- src/background/ai-service.js   // Multi-provider AI integration
- src/shared/privacy-manager.js  // Consent management
- src/shared/rate-limiter.js     // API rate limiting

// Privacy & Security Implementation
✅ Explicit consent dialogs for AI services
✅ API key secure storage (chrome.storage + encryption)
✅ Rate limiting for Groq (100/hr) and Claude (60/min)
✅ Request sanitization and response validation
✅ Local fallback when AI services unavailable
```

#### Phase 3: Cross-Browser & Testing (Week 3)
```javascript
// Cross-Browser Support
- build/webpack.chrome.js        // Chrome-specific build
- build/webpack.firefox.js       // Firefox WebExtension build  
- build/webpack.safari.js        // Safari extension build
- src/shared/browser-compat.js   // Browser compatibility layer

// Testing Implementation
✅ Unit tests for all TTS functionality
✅ Integration tests for AI service communication
✅ Cross-browser E2E tests (Playwright)
✅ Accessibility compliance tests
✅ Performance benchmark tests
```

#### Phase 4: Polish & Store Submission (Week 4)
```javascript
// Store Preparation
- assets/icons/                  // Icon sets for all stores
- docs/privacy-policy.md         // Privacy policy documentation
- docs/store-listings/           // Store submission materials

// Final Quality Gates
✅ All compliance tests passing
✅ Performance metrics within targets
✅ Accessibility audit complete
✅ Security audit and penetration testing
✅ Store submission packages prepared
```

### Testing Strategy Summary

#### Automated Testing Pipeline
```bash
# Unit Tests (>85% coverage required)
npm run test:unit
npm run test:unit:coverage

# Integration Tests  
npm run test:integration
npm run test:tts           # TTS-specific functionality
npm run test:ai            # AI service integration

# Cross-Browser E2E Tests
npm run test:e2e:chrome
npm run test:e2e:firefox  
npm run test:e2e:safari
npm run test:e2e:all

# Compliance & Security Tests
npm run test:accessibility # WCAG 2.1 AA compliance
npm run test:security     # CSP, XSS, data validation
npm run test:performance  # Memory, response times
npm run validate:manifest # Extension store requirements
```

#### Manual Testing Checklist
- [ ] **Text Selection**: Works on various websites (news, blogs, docs, PDFs)
- [ ] **Voice Quality**: Natural speech across different languages and voices
- [ ] **Overlay UX**: Intuitive positioning, keyboard navigation, touch support
- [ ] **AI Explanations**: Accurate, helpful, appropriate response times
- [ ] **Error Handling**: Graceful failures, helpful error messages
- [ ] **Accessibility**: Screen reader compatibility, keyboard-only navigation
- [ ] **Performance**: No memory leaks, fast startup, responsive interactions

### Success Validation

#### Technical Success Criteria
```javascript
// Performance Benchmarks
const successMetrics = {
  overlayShowTime: '<300ms',      // Overlay appears quickly
  ttsStartDelay: '<500ms',        // Speech begins promptly
  aiResponseTime: '<3000ms',      // AI explanations generate fast
  memoryUsage: '<50MB',           // Efficient memory utilization
  crossBrowserSupport: '4/4',     // All target browsers work
  testCoverage: '>85%',           // Comprehensive test coverage
  wcagCompliance: 'AA',           // Full accessibility compliance
  storeApproval: '4/4'            // Approved on all extension stores
};
```

#### User Experience Validation
- **Usability**: New users can start TTS in under 2 clicks
- **Reliability**: TTS works on 95% of websites without issues
- **Accessibility**: Users with disabilities can fully access all features
- **Privacy**: Users understand and control their data usage
- **Performance**: Extension doesn't slow down browsing experience

### Post-Launch Monitoring

#### Key Metrics to Track
```javascript
// User Engagement
- Daily active users
- TTS usage frequency
- AI explanation requests
- Settings customization rates

// Technical Performance  
- Error rates by browser
- API response times
- Memory usage patterns
- Extension load times

// Business Impact
- User retention rates
- Accessibility feedback
- Store ratings/reviews
- Support ticket volume
```

### Emergency Response Plan

#### Common Issues & Solutions
1. **Web Speech API Fails**: Fallback to system voices, show clear error message
2. **AI Service Downtime**: Switch to alternative provider or local fallback
3. **CSP Violations**: Review and fix inline script usage, update manifest
4. **Cross-Browser Issues**: Browser-specific fixes, feature detection
5. **Performance Problems**: Memory optimization, code splitting, lazy loading

#### Rollback Strategy
- Maintain previous stable version in stores
- Feature flags for gradual rollout
- Quick disable mechanism for problematic features
- Clear communication channels with users

---

## 📚 Final Notes for AI Implementation

This template provides the complete framework for implementing production-ready TTS browser extensions with AI integration. Key success factors:

1. **Context7 Usage**: Always use context7 for current API documentation and browser compatibility
2. **Privacy First**: Implement explicit consent and transparent data practices
3. **Accessibility Focus**: WCAG 2.1 AA compliance is mandatory, not optional  
4. **Cross-Browser Testing**: Test on all target browsers throughout development
5. **Performance Monitoring**: Track metrics from day one to catch issues early
6. **Security Compliance**: Manifest V3, CSP, and secure coding practices
7. **User Experience**: Simple, intuitive interface with powerful functionality
8. **Quality Assurance**: Comprehensive testing strategy with automated validation

**Remember**: This is a complete, self-contained template. Following this structure will result in a production-ready TTS browser extension that meets all technical, security, accessibility, and business requirements.

**Important**: Every section marked with "use context7" requires real-time documentation lookup to ensure current, accurate implementation details.