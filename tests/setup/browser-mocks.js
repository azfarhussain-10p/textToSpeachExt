/**
 * Browser API Mocks
 * Mock implementations of browser extension and web APIs for testing
 */

// Mock Chrome Extension API
global.chrome = {
  runtime: {
    id: 'test-extension-id',
    getManifest: jest.fn(() => ({
      version: '1.0.0',
      manifest_version: 3,
      name: 'Intelligent TTS Extension'
    })),
    getURL: jest.fn((path) => `chrome-extension://test-extension-id/${path}`),
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
      hasListener: jest.fn(() => false)
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
      get: jest.fn(() => Promise.resolve({})),
      set: jest.fn(() => Promise.resolve()),
      remove: jest.fn(() => Promise.resolve()),
      clear: jest.fn(() => Promise.resolve()),
      getBytesInUse: jest.fn(() => Promise.resolve(0))
    },
    local: {
      get: jest.fn(() => Promise.resolve({})),
      set: jest.fn(() => Promise.resolve()),
      remove: jest.fn(() => Promise.resolve()),
      clear: jest.fn(() => Promise.resolve()),
      getBytesInUse: jest.fn(() => Promise.resolve(0))
    },
    onChanged: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    }
  },
  
  tabs: {
    query: jest.fn(() => Promise.resolve([{ id: 1, active: true }])),
    get: jest.fn(() => Promise.resolve({ id: 1, url: 'https://example.com' })),
    create: jest.fn(() => Promise.resolve({ id: 2 })),
    update: jest.fn(() => Promise.resolve({ id: 1 })),
    remove: jest.fn(() => Promise.resolve()),
    sendMessage: jest.fn(() => Promise.resolve({ success: true })),
    onActivated: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    },
    onUpdated: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    },
    executeScript: jest.fn(() => Promise.resolve())
  },
  
  action: {
    onClicked: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    },
    setTitle: jest.fn(() => Promise.resolve()),
    setIcon: jest.fn(() => Promise.resolve()),
    setBadgeText: jest.fn(() => Promise.resolve()),
    setBadgeBackgroundColor: jest.fn(() => Promise.resolve()),
    enable: jest.fn(),
    disable: jest.fn()
  },
  
  contextMenus: {
    create: jest.fn(() => 'menu-id'),
    update: jest.fn(() => Promise.resolve()),
    remove: jest.fn(() => Promise.resolve()),
    removeAll: jest.fn(() => Promise.resolve()),
    onClicked: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    }
  },
  
  scripting: {
    executeScript: jest.fn(() => Promise.resolve([{ result: true }])),
    insertCSS: jest.fn(() => Promise.resolve()),
    removeCSS: jest.fn(() => Promise.resolve())
  },
  
  permissions: {
    contains: jest.fn(() => Promise.resolve(true)),
    getAll: jest.fn(() => Promise.resolve({ permissions: [], origins: [] })),
    request: jest.fn(() => Promise.resolve(true)),
    remove: jest.fn(() => Promise.resolve(true)),
    onAdded: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    },
    onRemoved: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    }
  }
};

// Mock Firefox Browser API (for compatibility)
global.browser = global.chrome;

// Mock Web Speech API
const mockVoices = [
  {
    name: 'English (US) Female',
    lang: 'en-US',
    localService: true,
    default: true,
    voiceURI: 'en-US-female'
  },
  {
    name: 'English (UK) Male', 
    lang: 'en-GB',
    localService: true,
    default: false,
    voiceURI: 'en-GB-male'
  },
  {
    name: 'Spanish (Spain)',
    lang: 'es-ES',
    localService: false,
    default: false,
    voiceURI: 'es-ES-female'
  }
];

global.speechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  getVoices: jest.fn(() => mockVoices),
  speaking: false,
  paused: false,
  pending: false,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  onvoiceschanged: null
};

global.SpeechSynthesisUtterance = jest.fn().mockImplementation((text) => {
  const utterance = {
    text: text || '',
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
  
  // Mock event triggering
  utterance._triggerEvent = (eventType, eventData = {}) => {
    if (utterance[eventType] && typeof utterance[eventType] === 'function') {
      utterance[eventType](eventData);
    }
  };
  
  return utterance;
});

// Mock DOM APIs
const createMockElement = (tagName = 'div') => ({
  tagName: tagName.toUpperCase(),
  id: '',
  className: '',
  innerHTML: '',
  textContent: '',
  style: {},
  dataset: {},
  attributes: {},
  classList: {
    add: jest.fn(),
    remove: jest.fn(),
    contains: jest.fn(() => false),
    toggle: jest.fn()
  },
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  appendChild: jest.fn(),
  removeChild: jest.fn(),
  insertBefore: jest.fn(),
  querySelector: jest.fn(),
  querySelectorAll: jest.fn(() => []),
  getElementsByTagName: jest.fn(() => []),
  getElementsByClassName: jest.fn(() => []),
  getElementById: jest.fn(),
  getAttribute: jest.fn(),
  setAttribute: jest.fn(),
  removeAttribute: jest.fn(),
  hasAttribute: jest.fn(() => false),
  getBoundingClientRect: jest.fn(() => ({
    x: 0, y: 0, width: 100, height: 20,
    top: 0, left: 0, bottom: 20, right: 100
  })),
  scrollIntoView: jest.fn(),
  focus: jest.fn(),
  blur: jest.fn(),
  click: jest.fn(),
  contains: jest.fn(() => false),
  parentNode: null,
  parentElement: null,
  children: [],
  childNodes: [],
  firstChild: null,
  lastChild: null,
  nextSibling: null,
  previousSibling: null
});

global.document = {
  createElement: jest.fn((tagName) => createMockElement(tagName)),
  createTextNode: jest.fn((text) => ({ nodeValue: text, textContent: text })),
  getElementById: jest.fn(() => createMockElement()),
  querySelector: jest.fn(() => createMockElement()),
  querySelectorAll: jest.fn(() => []),
  getElementsByTagName: jest.fn(() => []),
  getElementsByClassName: jest.fn(() => []),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
  createEvent: jest.fn(() => ({
    initEvent: jest.fn(),
    preventDefault: jest.fn(),
    stopPropagation: jest.fn()
  })),
  readyState: 'complete',
  title: 'Test Page',
  URL: 'https://test.example.com',
  domain: 'test.example.com',
  body: createMockElement('body'),
  head: createMockElement('head'),
  documentElement: createMockElement('html')
};

// Mock window.getSelection
global.window = {
  location: {
    href: 'https://test.example.com',
    hostname: 'test.example.com',
    pathname: '/test',
    search: '',
    hash: ''
  },
  getSelection: jest.fn(() => ({
    toString: jest.fn(() => ''),
    removeAllRanges: jest.fn(),
    addRange: jest.fn(),
    getRangeAt: jest.fn(() => ({
      getBoundingClientRect: jest.fn(() => ({
        x: 100, y: 100, width: 200, height: 20,
        top: 100, left: 100, bottom: 120, right: 300
      })),
      cloneContents: jest.fn(),
      deleteContents: jest.fn(),
      extractContents: jest.fn(),
      insertNode: jest.fn(),
      selectNode: jest.fn(),
      selectNodeContents: jest.fn(),
      setStart: jest.fn(),
      setEnd: jest.fn()
    })),
    rangeCount: 0,
    anchorNode: null,
    anchorOffset: 0,
    focusNode: null,
    focusOffset: 0,
    isCollapsed: true,
    type: 'None'
  })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
  innerWidth: 1024,
  innerHeight: 768,
  scrollX: 0,
  scrollY: 0,
  devicePixelRatio: 1,
  setTimeout: global.setTimeout,
  setInterval: global.setInterval,
  clearTimeout: global.clearTimeout,
  clearInterval: global.clearInterval,
  requestAnimationFrame: jest.fn((cb) => setTimeout(cb, 16)),
  cancelAnimationFrame: jest.fn()
};

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    headers: new Map()
  })
);

// Mock URL constructor
global.URL = jest.fn().mockImplementation((url) => ({
  href: url,
  origin: 'https://test.example.com',
  protocol: 'https:',
  hostname: 'test.example.com',
  port: '',
  pathname: '/test',
  search: '',
  hash: ''
}));

// Mock Blob constructor
global.Blob = jest.fn().mockImplementation((parts, options) => ({
  size: parts ? parts.join('').length : 0,
  type: options?.type || '',
  slice: jest.fn(),
  stream: jest.fn(),
  text: jest.fn(() => Promise.resolve(parts ? parts.join('') : '')),
  arrayBuffer: jest.fn(() => Promise.resolve(new ArrayBuffer(0)))
}));

// Mock File constructor
global.File = jest.fn().mockImplementation((parts, name, options) => ({
  ...global.Blob(parts, options),
  name,
  lastModified: Date.now()
}));

// Mock FileReader
global.FileReader = jest.fn().mockImplementation(() => ({
  readAsText: jest.fn(),
  readAsDataURL: jest.fn(),
  readAsArrayBuffer: jest.fn(),
  onload: null,
  onerror: null,
  onprogress: null,
  result: null,
  error: null,
  readyState: 0
}));

// Mock MutationObserver
global.MutationObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  takeRecords: jest.fn(() => [])
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  takeRecords: jest.fn(() => [])
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Suppress console messages in tests unless VERBOSE is set
if (!process.env.VERBOSE) {
  global.console = {
    ...console,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    info: jest.fn()
  };
}