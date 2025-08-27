/**
 * Jest Setup File
 * Global test setup and configuration for TTS Extension tests
 */

// Extend Jest matchers with custom matchers
import 'jest-dom/extend-expect';

// Global test timeout
jest.setTimeout(10000);

// Mock console methods for cleaner test output
const originalConsole = global.console;

beforeEach(() => {
  // Suppress console.log, console.warn in tests unless VERBOSE is set
  if (!process.env.VERBOSE) {
    global.console = {
      ...originalConsole,
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      info: jest.fn()
    };
  }
});

afterEach(() => {
  // Restore console after each test
  global.console = originalConsole;
  
  // Clear all mocks
  jest.clearAllMocks();
  
  // Reset modules
  jest.resetModules();
});

// Global test utilities
global.testUtils = {
  /**
   * Create a mock Chrome extension API
   */
  createMockChromeAPI: () => ({
    runtime: {
      id: 'test-extension-id',
      getManifest: jest.fn(() => ({
        version: '1.0.0',
        manifest_version: 3,
        name: 'Test Extension'
      })),
      getURL: jest.fn((path) => `chrome-extension://test-id/${path}`),
      sendMessage: jest.fn(),
      onMessage: {
        addListener: jest.fn(),
        removeListener: jest.fn(),
        hasListener: jest.fn()
      },
      onInstalled: {
        addListener: jest.fn(),
        removeListener: jest.fn()
      },
      onStartup: {
        addListener: jest.fn(),
        removeListener: jest.fn()
      },
      lastError: null
    },
    
    storage: {
      sync: {
        get: jest.fn(),
        set: jest.fn(),
        remove: jest.fn(),
        clear: jest.fn(),
        getBytesInUse: jest.fn()
      },
      local: {
        get: jest.fn(),
        set: jest.fn(),
        remove: jest.fn(),
        clear: jest.fn(),
        getBytesInUse: jest.fn()
      },
      onChanged: {
        addListener: jest.fn(),
        removeListener: jest.fn()
      }
    },
    
    tabs: {
      query: jest.fn(),
      get: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      sendMessage: jest.fn(),
      onActivated: {
        addListener: jest.fn(),
        removeListener: jest.fn()
      },
      onUpdated: {
        addListener: jest.fn(),
        removeListener: jest.fn()
      }
    },
    
    action: {
      onClicked: {
        addListener: jest.fn(),
        removeListener: jest.fn()
      },
      setTitle: jest.fn(),
      setIcon: jest.fn(),
      setBadgeText: jest.fn(),
      setBadgeBackgroundColor: jest.fn()
    },
    
    contextMenus: {
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      removeAll: jest.fn(),
      onClicked: {
        addListener: jest.fn(),
        removeListener: jest.fn()
      }
    },
    
    scripting: {
      executeScript: jest.fn(),
      insertCSS: jest.fn(),
      removeCSS: jest.fn()
    }
  }),

  /**
   * Create a mock Speech Synthesis API
   */
  createMockSpeechAPI: () => {
    const mockUtterance = {
      text: '',
      rate: 1,
      pitch: 1,
      volume: 1,
      lang: 'en-US',
      voice: null,
      onstart: null,
      onend: null,
      onerror: null,
      onpause: null,
      onresume: null,
      onboundary: null
    };

    const mockVoice = {
      name: 'Test Voice',
      lang: 'en-US',
      localService: true,
      default: true,
      voiceURI: 'test-voice'
    };

    return {
      speechSynthesis: {
        speak: jest.fn(),
        cancel: jest.fn(),
        pause: jest.fn(),
        resume: jest.fn(),
        getVoices: jest.fn(() => [mockVoice]),
        speaking: false,
        paused: false,
        pending: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        onvoiceschanged: null
      },
      SpeechSynthesisUtterance: jest.fn(() => mockUtterance),
      mockUtterance,
      mockVoice
    };
  },

  /**
   * Create a mock DOM environment
   */
  createMockDOM: () => {
    const mockElement = {
      style: {},
      classList: {
        add: jest.fn(),
        remove: jest.fn(),
        contains: jest.fn(),
        toggle: jest.fn()
      },
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      appendChild: jest.fn(),
      removeChild: jest.fn(),
      querySelector: jest.fn(),
      querySelectorAll: jest.fn(() => []),
      getAttribute: jest.fn(),
      setAttribute: jest.fn(),
      innerHTML: '',
      textContent: '',
      contains: jest.fn()
    };

    return {
      document: {
        createElement: jest.fn(() => mockElement),
        getElementById: jest.fn(() => mockElement),
        querySelector: jest.fn(() => mockElement),
        querySelectorAll: jest.fn(() => [mockElement]),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        body: mockElement,
        head: mockElement,
        readyState: 'complete',
        title: 'Test Page'
      },
      window: {
        location: {
          href: 'https://test.example.com',
          hostname: 'test.example.com'
        },
        getSelection: jest.fn(() => ({
          toString: jest.fn(() => 'selected text'),
          removeAllRanges: jest.fn(),
          getRangeAt: jest.fn(() => ({
            getBoundingClientRect: jest.fn(() => ({
              left: 100,
              top: 100,
              right: 200,
              bottom: 120
            }))
          }))
        })),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        innerWidth: 1024,
        innerHeight: 768
      },
      mockElement
    };
  },

  /**
   * Create a test delay
   */
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Mock fetch for API testing
   */
  createMockFetch: (responses = {}) => {
    return jest.fn((url) => {
      const response = responses[url] || { ok: true, json: () => Promise.resolve({}) };
      return Promise.resolve({
        ok: response.ok || true,
        status: response.status || 200,
        json: () => Promise.resolve(response.data || {}),
        text: () => Promise.resolve(response.text || ''),
        ...response
      });
    });
  },

  /**
   * Assert that a function was called with expected arguments
   */
  expectCalledWith: (mockFn, ...expectedArgs) => {
    expect(mockFn).toHaveBeenCalledWith(...expectedArgs);
  },

  /**
   * Assert that an element has expected CSS classes
   */
  expectHasClasses: (element, ...classes) => {
    classes.forEach(className => {
      expect(element.classList.contains(className)).toBe(true);
    });
  },

  /**
   * Create mock settings for testing
   */
  createMockSettings: () => ({
    ttsSettings: {
      voice: null,
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      language: 'en-US'
    },
    aiSettings: {
      provider: 'groq',
      enableExplanations: true,
      explanationLength: 'medium'
    },
    uiSettings: {
      theme: 'auto',
      overlayPosition: 'bottom-right',
      keyboardShortcuts: true
    },
    privacySettings: {
      aiExplanationsConsent: false,
      dataCollection: false,
      analytics: false
    }
  })
};

// Setup global mocks
beforeAll(() => {
  // Mock browser APIs globally
  const mockChrome = global.testUtils.createMockChromeAPI();
  global.chrome = mockChrome;
  
  const mockSpeech = global.testUtils.createMockSpeechAPI();
  global.speechSynthesis = mockSpeech.speechSynthesis;
  global.SpeechSynthesisUtterance = mockSpeech.SpeechSynthesisUtterance;
  
  const mockDOM = global.testUtils.createMockDOM();
  global.document = mockDOM.document;
  global.window = mockDOM.window;
  
  // Mock fetch
  global.fetch = global.testUtils.createMockFetch();
  
  // Mock console methods
  global.console.debug = jest.fn();
});

// Cleanup after all tests
afterAll(() => {
  // Clean up any global state
  jest.restoreAllMocks();
});