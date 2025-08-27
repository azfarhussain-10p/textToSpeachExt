/**
 * Babel Configuration for TTS Extension
 * JavaScript transpilation for browser compatibility
 */

module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        chrome: '88',
        firefox: '78',
        safari: '14',
        edge: '88'
      },
      modules: false, // Let webpack handle modules
      useBuiltIns: 'usage',
      corejs: 3,
      bugfixes: true,
      browserslistEnv: process.env.NODE_ENV
    }]
  ],
  
  plugins: [
    // Dynamic imports for code splitting
    '@babel/plugin-syntax-dynamic-import'
  ],

  // Environment-specific configurations
  env: {
    development: {
      plugins: [
        // Development-only plugins
      ]
    },
    production: {
      plugins: [
        // Production optimizations - removed console transform for now
      ]
    },
    test: {
      presets: [
        ['@babel/preset-env', {
          targets: {
            node: 'current'
          },
          modules: 'commonjs' // Use CommonJS for Jest
        }]
      ]
    }
  },

  // Ignore node_modules except for ES6 modules
  ignore: [
    'node_modules/**'
  ],

  // Source maps
  sourceMaps: process.env.NODE_ENV !== 'production'
};