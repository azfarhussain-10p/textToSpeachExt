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

// Keep the original createElement but spy on it
const originalCreateElement = global.document.createElement.bind(document);
global.document.createElement = jest.fn((tagName) => {
  const element = originalCreateElement(tagName);

  // Mock key DOM methods while preserving their functionality
  const originalAppendChild = element.appendChild.bind(element);
  const originalRemoveChild = element.removeChild.bind(element);
  const originalSetAttribute = element.setAttribute.bind(element);
  const originalAddEventListener = element.addEventListener.bind(element);

  element.appendChild = jest.fn((child) => {
    try {
      return originalAppendChild(child);
    } catch {
      // If appendChild fails, just mock it
      if (child) child.parentNode = element;
      return child;
    }
  });

  element.removeChild = jest.fn((child) => {
    try {
      return originalRemoveChild(child);
    } catch {
      // If removeChild fails, just mock it
      if (child) child.parentNode = null;
      return child;
    }
  });

  element.setAttribute = jest.fn((name, value) => {
    try {
      return originalSetAttribute(name, value);
    } catch {
      // If setAttribute fails, just mock it
      element.getAttribute = element.getAttribute || jest.fn(() => value);
    }
  });

  element.addEventListener = jest.fn((event, handler, options) => {
    try {
      return originalAddEventListener(event, handler, options);
    } catch {
      // If addEventListener fails, just mock it
    }
  });

  // Add additional mocked methods
  if (!element.replaceChild) {
    element.replaceChild = jest.fn((newChild, oldChild) => {
      if (newChild) newChild.parentNode = element;
      if (oldChild) oldChild.parentNode = null;
      return oldChild;
    });
  }

  if (!element.normalize) {
    element.normalize = jest.fn();
  }

  return element;
});

// Keep the original createTextNode but spy on it
const originalCreateTextNode = global.document.createTextNode.bind(document);
global.document.createTextNode = jest.fn((text) => {
  try {
    return originalCreateTextNode(text);
  } catch {
    // Fallback mock if createTextNode fails
    return {
      nodeType: 3,
      textContent: text,
      parentNode: null,
      remove: jest.fn()
    };
  }
});

// Mock getElementById to allow style injection and tracking
const originalGetElementById = global.document.getElementById.bind(document);
global.document.getElementById = jest.fn((id) => {
  // Try to get the actual element first
  const element = originalGetElementById(id);
  if (element) {
    return element;
  }

  // For style injection, return null initially to allow injection
  // But the test should find it after injection
  if (id === 'tts-highlighter-styles') {
    return originalGetElementById(id); // Return actual element if it exists
  }

  return null;
});

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