/**
 * Integration Test Setup
 * Setup utilities and mocks for integration testing
 */

// Mock browser extension APIs
global.chrome = {
  storage: {
    sync: {
      get: jest.fn().mockImplementation((keys, callback) => {
        const mockData = {
          ttsSettings: {
            voice: 'default',
            rate: 1.0,
            pitch: 1.0,
            volume: 1.0,
            enabled: true
          },
          aiSettings: {
            enabled: false,
            preferredProvider: 'groq',
            groqApiKey: '',
            claudeApiKey: ''
          }
        };

        if (typeof keys === 'function') {
          // callback-first pattern
          keys(mockData);
        } else {
          // keys array pattern
          const result = {};
          if (Array.isArray(keys)) {
            keys.forEach(key => {
              if (mockData[key]) {result[key] = mockData[key];}
            });
          } else {
            result[keys] = mockData[keys];
          }
          callback(result);
        }
      }),
      set: jest.fn().mockImplementation((data, callback) => {
        callback && callback();
      }),
      remove: jest.fn().mockImplementation((keys, callback) => {
        callback && callback();
      }),
      clear: jest.fn().mockImplementation((callback) => {
        callback && callback();
      })
    },
    local: {
      get: jest.fn().mockImplementation((keys, callback) => {
        callback({});
      }),
      set: jest.fn().mockImplementation((data, callback) => {
        callback && callback();
      }),
      remove: jest.fn().mockImplementation((keys, callback) => {
        callback && callback();
      }),
      clear: jest.fn().mockImplementation((callback) => {
        callback && callback();
      })
    }
  },
  runtime: {
    lastError: null,
    getURL: jest.fn().mockImplementation((path) => `chrome-extension://test-id/${path}`),
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    }
  },
  tabs: {
    query: jest.fn(),
    sendMessage: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  },
  contextMenus: {
    create: jest.fn(),
    removeAll: jest.fn()
  },
  notifications: {
    create: jest.fn(),
    clear: jest.fn()
  }
};

// Mock browser APIs (Firefox)
global.browser = global.chrome;

// Mock Web Speech API
class MockSpeechSynthesisUtterance {
  constructor(text) {
    this.text = text;
    this.voice = null;
    this.volume = 1;
    this.rate = 1;
    this.pitch = 1;
    this.lang = 'en-US';

    this.onstart = null;
    this.onend = null;
    this.onerror = null;
    this.onpause = null;
    this.onresume = null;
    this.onboundary = null;
  }

  // Simulate events for testing
  _triggerEvent(eventType, eventData = {}) {
    const handler = this[`on${eventType}`];
    if (handler && typeof handler === 'function') {
      handler({ type: eventType, ...eventData });
    }
  }
}

class MockSpeechSynthesis {
  constructor() {
    this.speaking = false;
    this.pending = false;
    this.paused = false;
    this.voices = [
      { name: 'Test Voice 1', lang: 'en-US', default: true, localService: true },
      { name: 'Test Voice 2', lang: 'en-GB', default: false, localService: true },
      { name: 'Test Voice 3', lang: 'es-ES', default: false, localService: true }
    ];
    this.onvoiceschanged = null;
    this.currentUtterance = null;
  }

  speak(utterance) {
    this.speaking = true;
    this.currentUtterance = utterance;

    // Simulate async speech start
    setTimeout(() => {
      if (utterance.onstart) {utterance.onstart({ type: 'start' });}

      // Simulate speech events
      setTimeout(() => {
        if (utterance.onboundary) {
          utterance.onboundary({ type: 'boundary', name: 'word', charIndex: 0 });
        }
      }, 100);

      // Simulate speech end
      setTimeout(() => {
        this.speaking = false;
        this.currentUtterance = null;
        if (utterance.onend) {utterance.onend({ type: 'end' });}
      }, 500);
    }, 10);
  }

  cancel() {
    this.speaking = false;
    this.pending = false;
    if (this.currentUtterance && this.currentUtterance.onend) {
      this.currentUtterance.onend({ type: 'end' });
    }
    this.currentUtterance = null;
  }

  pause() {
    if (this.speaking) {
      this.paused = true;
      if (this.currentUtterance && this.currentUtterance.onpause) {
        this.currentUtterance.onpause({ type: 'pause' });
      }
    }
  }

  resume() {
    if (this.paused) {
      this.paused = false;
      if (this.currentUtterance && this.currentUtterance.onresume) {
        this.currentUtterance.onresume({ type: 'resume' });
      }
    }
  }

  getVoices() {
    return this.voices;
  }
}

global.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;
global.speechSynthesis = new MockSpeechSynthesis();

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock DOM APIs
Object.defineProperty(document, 'createElement', {
  value: jest.fn().mockImplementation((tagName) => {
    const element = {
      tagName: tagName.toUpperCase(),
      innerHTML: '',
      textContent: '',
      className: '',
      classList: {
        add: jest.fn(),
        remove: jest.fn(),
        contains: jest.fn().mockReturnValue(false),
        toggle: jest.fn()
      },
      style: {},
      appendChild: jest.fn(),
      removeChild: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      setAttribute: jest.fn(),
      getAttribute: jest.fn(),
      hasAttribute: jest.fn().mockReturnValue(false),
      removeAttribute: jest.fn(),
      dispatchEvent: jest.fn(),
      click: jest.fn(),
      focus: jest.fn(),
      blur: jest.fn()
    };

    // Special handling for select elements
    if (tagName.toLowerCase() === 'select') {
      element.options = [];
      element.selectedIndex = -1;
      element.value = '';
    }

    // Special handling for option elements
    if (tagName.toLowerCase() === 'option') {
      element.selected = false;
      element.value = '';
    }

    return element;
  })
});

// Mock console methods to reduce noise during tests
global.console.debug = jest.fn();
global.console.info = jest.fn();

// Utility functions for integration tests
global.testUtils = {
  // Wait for async operations to complete
  waitFor: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms)),

  // Mock successful API response
  mockApiSuccess: (data) => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(data)
    });
  },

  // Mock API error response
  mockApiError: (status = 500, message = 'Server error') => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status,
      statusText: message,
      json: () => Promise.resolve({ error: { message } })
    });
  },

  // Mock network error
  mockNetworkError: (message = 'Network error') => {
    global.fetch.mockRejectedValueOnce(new Error(message));
  },

  // Reset all mocks
  resetMocks: () => {
    global.fetch.mockClear();
    Object.values(global.chrome.storage.sync).forEach(fn => fn.mockClear());
    Object.values(global.chrome.storage.local).forEach(fn => fn.mockClear());
    global.speechSynthesis.speaking = false;
    global.speechSynthesis.paused = false;
    global.speechSynthesis.pending = false;
    global.speechSynthesis.currentUtterance = null;
  },

  // Simulate TTS events
  triggerTTSEvent: (utterance, eventType, eventData = {}) => {
    if (utterance._triggerEvent) {
      utterance._triggerEvent(eventType, eventData);
    }
  }
};

// Clean up before each test
beforeEach(() => {
  global.testUtils.resetMocks();
  global.console.debug.mockClear();
  global.console.info.mockClear();
});