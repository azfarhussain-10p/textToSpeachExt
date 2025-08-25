/**
 * Jest Setup for Intelligent TTS Extension Tests
 */

// Mock Chrome Extension APIs
global.chrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    },
    getManifest: jest.fn(() => ({
      version: '1.0.0',
      name: 'Intelligent TTS Extension'
    })),
    getURL: jest.fn((path) => `chrome-extension://test-id/${path}`)
  },
  
  storage: {
    sync: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn()
    },
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn()
    },
    onChanged: {
      addListener: jest.fn()
    }
  },
  
  contextMenus: {
    create: jest.fn(),
    removeAll: jest.fn(),
    onClicked: {
      addListener: jest.fn()
    }
  },
  
  tabs: {
    query: jest.fn(),
    sendMessage: jest.fn(),
    create: jest.fn()
  },
  
  scripting: {
    executeScript: jest.fn(),
    insertCSS: jest.fn()
  }
};

// Mock Web Speech API
global.speechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  getVoices: jest.fn(() => []),
  speaking: false,
  paused: false,
  pending: false,
  addEventListener: jest.fn()
};

global.SpeechSynthesisUtterance = jest.fn().mockImplementation((text) => ({
  text,
  voice: null,
  volume: 1,
  rate: 1,
  pitch: 1,
  lang: 'en-US',
  onstart: null,
  onend: null,
  onerror: null,
  onpause: null,
  onresume: null,
  onmark: null,
  onboundary: null
}));

// Mock DOM methods
Object.defineProperty(window, 'getSelection', {
  writable: true,
  value: jest.fn(() => ({
    toString: () => 'selected text',
    getRangeAt: () => ({
      getBoundingClientRect: () => ({
        left: 100,
        top: 100,
        width: 200,
        height: 20
      }),
      commonAncestorContainer: document.createElement('div'),
      startOffset: 0,
      endOffset: 13
    }),
    rangeCount: 1,
    removeAllRanges: jest.fn(),
    addRange: jest.fn()
  }))
});

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve('')
  })
);

// Mock console methods in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn()
};

// Custom matchers
expect.extend({
  toBeAccessible(received) {
    const hasAriaLabel = received.hasAttribute('aria-label');
    const hasRole = received.hasAttribute('role');
    const hasTabIndex = received.hasAttribute('tabindex');
    const isButton = received.tagName === 'BUTTON';
    const isInput = received.tagName === 'INPUT';
    
    const isAccessible = hasAriaLabel || hasRole || (isButton || isInput);
    
    if (isAccessible) {
      return {
        message: () => `expected element to not be accessible`,
        pass: true
      };
    } else {
      return {
        message: () => `expected element to be accessible (have aria-label, role, or be interactive element)`,
        pass: false
      };
    }
  },

  toHaveHighContrast(received) {
    const computedStyle = window.getComputedStyle(received);
    const backgroundColor = computedStyle.backgroundColor;
    const color = computedStyle.color;
    
    // Simple contrast check - in real implementation would calculate luminance
    const hasContrast = backgroundColor !== color;
    
    if (hasContrast) {
      return {
        message: () => `expected element to not have sufficient contrast`,
        pass: true
      };
    } else {
      return {
        message: () => `expected element to have sufficient color contrast`,
        pass: false
      };
    }
  }
});

// Test utilities
global.testUtils = {
  createMockElement: (tag = 'div', attributes = {}) => {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    return element;
  },
  
  createMockSelection: (text = 'test selection') => ({
    toString: () => text,
    getRangeAt: () => ({
      getBoundingClientRect: () => ({
        left: 100,
        top: 100,
        width: text.length * 8,
        height: 20
      }),
      commonAncestorContainer: document.createElement('div'),
      startOffset: 0,
      endOffset: text.length
    }),
    rangeCount: 1
  }),
  
  simulateKeyPress: (element, key, options = {}) => {
    const event = new KeyboardEvent('keydown', {
      key,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      ...options
    });
    element.dispatchEvent(event);
  },
  
  waitFor: (condition, timeout = 1000) => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const check = () => {
        if (condition()) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Timeout waiting for condition'));
        } else {
          setTimeout(check, 50);
        }
      };
      
      check();
    });
  }
};

// Setup DOM
document.body.innerHTML = '<div id="test-container"></div>';

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  
  // Reset DOM
  document.body.innerHTML = '<div id="test-container"></div>';
  
  // Reset speech synthesis mocks
  global.speechSynthesis.speaking = false;
  global.speechSynthesis.paused = false;
  global.speechSynthesis.pending = false;
});