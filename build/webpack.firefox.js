/**
 * Firefox-specific Webpack Configuration
 * Optimized for Firefox Add-ons and AMO requirements
 */

const { merge } = require('webpack-merge');
const baseConfig = require('../webpack.config.js');

// Set Firefox as target browser
process.env.TARGET_BROWSER = 'firefox';

module.exports = merge(baseConfig, {
  // Firefox-specific optimizations
  optimization: {
    // Firefox AMO prefers readable code for review
    minimize: process.env.NODE_ENV === 'production' ? true : false,
    
    splitChunks: {
      chunks: 'all',
      minSize: 10000,
      maxSize: 1000000, // Firefox is more lenient with size
      cacheGroups: {
        // Keep services together for Firefox
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  },
  
  // Firefox extension specific settings
  resolve: {
    fallback: {
      // Disable Node.js polyfills for Firefox extensions
      buffer: false,
      stream: false,
      crypto: false,
      fs: false,
      path: false
    }
  },
  
  // Firefox Add-on store preferences
  performance: {
    hints: 'warning',
    maxAssetSize: 500000, // Firefox is more lenient
    maxEntrypointSize: 500000
  },
  
  // Firefox compatibility (ES2018 for broader support)
  target: ['web', 'es2018'],
  
  // Firefox prefers source maps for review (but no eval)
  devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'cheap-module-source-map'
});