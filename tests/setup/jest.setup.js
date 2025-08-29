/**
 * Jest Setup File
 * Global test environment configuration
 */

// Mock Web Extensions API
global.chrome = {
  storage: {
    sync: {
      get: jest.fn().mockResolvedValue({}),
      set: jest.fn().mockResolvedValue(),
      remove: jest.fn().mockResolvedValue(),
      clear: jest.fn().mockResolvedValue()
    },
    local: {
      get: jest.fn().mockResolvedValue({}),
      set: jest.fn().mockResolvedValue(),
      remove: jest.fn().mockResolvedValue(),
      clear: jest.fn().mockResolvedValue()
    }
  },
  
  tabs: {
    query: jest.fn().mockResolvedValue([]),
    sendMessage: jest.fn().mockResolvedValue(),
    create: jest.fn().mockResolvedValue()
  },
  
  runtime: {
    sendMessage: jest.fn().mockResolvedValue(),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    },
    lastError: null
  },
  
  notifications: {
    create: jest.fn().mockResolvedValue(),
    clear: jest.fn().mockResolvedValue()
  }
};

// Mock Firefox browser API
global.browser = global.chrome;

// Mock Web Speech API
global.speechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  getVoices: jest.fn().mockReturnValue([
    {
      name: 'English (US)',
      lang: 'en-US',
      default: true,
      localService: true,
      voiceURI: 'english'
    }
  ]),
  speaking: false,
  paused: false,
  pending: false
};

global.SpeechSynthesisUtterance = class MockSpeechSynthesisUtterance {
  constructor(text) {
    this.text = text;
    this.voice = null;
    this.volume = 1;
    this.rate = 1;
    this.pitch = 1;
    this.lang = 'en-US';
    
    // Event handlers
    this.onstart = null;
    this.onend = null;
    this.onerror = null;
    this.onpause = null;
    this.onresume = null;
    this.onmark = null;
    this.onboundary = null;
  }
};

// Mock DOM methods
global.document.createElement = jest.fn((tagName) => ({
  tagName: tagName.toUpperCase(),
  className: '',
  textContent: '',
  innerHTML: '',
  style: {},
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  appendChild: jest.fn(),
  removeChild: jest.fn(),
  querySelector: jest.fn(),
  querySelectorAll: jest.fn().mockReturnValue([]),
  setAttribute: jest.fn(),
  getAttribute: jest.fn(),
  remove: jest.fn(),
  click: jest.fn()
}));

// Mock fetch API
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  status: 200,
  json: jest.fn().mockResolvedValue({}),
  text: jest.fn().mockResolvedValue(''),
  headers: new Map()
});

// Mock console methods in test environment
if (process.env.NODE_ENV === 'test') {
  global.console = {
    ...console,
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  };
}

// Custom matchers
expect.extend({
  toBeValidExtensionMessage(received) {
    const pass = received && 
                 typeof received === 'object' && 
                 typeof received.type === 'string';
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid extension message`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid extension message with type property`,
        pass: false
      };
    }
  }
});

// Test utilities
global.testUtils = {
  // Create mock Chrome extension environment
  mockExtensionEnvironment: () => {
    global.chrome.storage.sync.get.mockClear();
    global.chrome.storage.sync.set.mockClear();
    global.chrome.tabs.query.mockClear();
    global.chrome.runtime.sendMessage.mockClear();
  },
  
  // Create mock speech synthesis
  mockSpeechSynthesis: () => {
    global.speechSynthesis.speak.mockClear();
    global.speechSynthesis.cancel.mockClear();
    global.speechSynthesis.getVoices.mockClear();
  },
  
  // Create mock DOM element
  mockDOMElement: (tagName = 'div', props = {}) => ({
    tagName: tagName.toUpperCase(),
    className: props.className || '',
    textContent: props.textContent || '',
    style: props.style || {},
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    appendChild: jest.fn(),
    removeChild: jest.fn(),
    ...props
  }),
  
  // Wait for async operations
  waitFor: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms))
};

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  global.testUtils.mockExtensionEnvironment();
  global.testUtils.mockSpeechSynthesis();
});