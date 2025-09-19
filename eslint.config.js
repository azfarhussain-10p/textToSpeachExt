import js from '@eslint/js';

export default [
  js.configs.recommended,

  // Global ignores configuration
  {
    ignores: ['eslint.config.js']
  },

  // Node.js scripts and config files configuration
  {
    files: ['scripts/**/*.js', '*.config.js', 'babel.config.js', 'webpack.config.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        // Node.js globals
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'off', // Allow console in scripts
      'prefer-const': 'error',
      'no-var': 'error'
    }
  },

  // Browser extension source files
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',

        // DOM constructors
        Option: 'readonly',
        Image: 'readonly',
        Event: 'readonly',
        CustomEvent: 'readonly',

        // DOM APIs
        requestAnimationFrame: 'readonly',
        confirm: 'readonly',

        // CommonJS (for extension files)
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',

        // Web APIs
        fetch: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',

        // Extension APIs
        chrome: 'readonly',
        browser: 'readonly',
        safari: 'readonly',

        // Background script globals
        importScripts: 'readonly',
        handleMessage: 'readonly', // From background-shared.js

        // Extension service globals (loaded via script tags)
        TTSService: 'readonly',
        AIService: 'readonly',
        GroqClient: 'readonly',
        ClaudeClient: 'readonly',
        TextHighlighter: 'readonly',
        RateLimiter: 'readonly',
        RateLimiterFactory: 'readonly',
        StorageService: 'readonly',
        BrowserDetection: 'readonly',

        // Speech APIs
        speechSynthesis: 'readonly',
        SpeechSynthesisUtterance: 'readonly',
        webkitSpeechSynthesis: 'readonly'
      }
    },
    rules: {
      // Security rules
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',

      // Prevent innerHTML usage (our custom security rule)
      'no-restricted-properties': [
        'error',
        {
          object: '*',
          property: 'innerHTML',
          message: 'innerHTML usage is not allowed. Use safe DOM methods from content-sanitizer instead.'
        }
      ],

      // Best practices
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',

      // Code quality
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'no-trailing-spaces': 'error',
      'no-multiple-empty-lines': ['error', { max: 2 }],
      'indent': ['error', 2],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'semi': ['error', 'always']
    }
  },

  // Service Worker specific configuration
  {
    files: ['src/background/service-worker.js'],
    languageOptions: {
      globals: {
        self: 'readonly',
        importScripts: 'readonly',
        ServiceWorkerGlobalScope: 'readonly',
        WorkerGlobalScope: 'readonly'
      }
    }
  },

  // Test files configuration
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        // CommonJS (for test requires)
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',

        // Jest globals
        describe: 'readonly',
        test: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',

        // Node.js test globals
        global: 'readonly',
        process: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',

        // Browser globals for tests (JSDOM environment)
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        location: 'readonly',
        speechSynthesis: 'readonly',
        SpeechSynthesisUtterance: 'readonly',

        // Extension APIs for testing
        chrome: 'readonly',
        browser: 'readonly',

        // Service classes for tests
        TTSService: 'readonly',
        AIService: 'readonly',
        TextHighlighter: 'readonly',
        RateLimiter: 'readonly',
        RateLimiterFactory: 'readonly',
        StorageService: 'readonly',
        BrowserDetection: 'readonly',

        // Mock classes from test setup
        MockSpeechSynthesisUtterance: 'readonly',

        // Test utility globals
        testUtils: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'off' // Allow console in tests
    }
  }
];