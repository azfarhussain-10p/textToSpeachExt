/**
 * Safari-specific Webpack Configuration
 * Optimized for Safari Web Extensions and App Store requirements
 */

const { merge } = require('webpack-merge');
const baseConfig = require('../webpack.config.js');

// Set Safari as target browser
process.env.TARGET_BROWSER = 'safari';

module.exports = merge(baseConfig, {
  // Safari-specific optimizations
  optimization: {
    // Safari Web Extensions prefer minimal optimization
    minimize: process.env.NODE_ENV === 'production' ? true : false,
    
    splitChunks: {
      chunks: 'all',
      minSize: 5000,
      maxSize: 2000000, // Safari is most lenient with size
      cacheGroups: {
        // Single bundle approach works better for Safari
        default: {
          minChunks: 1,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  },
  
  // Safari extension specific settings
  resolve: {
    fallback: {
      // Disable Node.js polyfills for Safari extensions
      crypto: false,
      stream: false,
      buffer: false,
      util: false,
      fs: false,
      path: false
    }
  },
  
  // Safari App Store preferences
  performance: {
    hints: 'warning',
    maxAssetSize: 1000000, // Safari is most lenient
    maxEntrypointSize: 1000000
  },
  
  // Safari requires conservative ES compatibility
  target: ['web', 'es2017'],
  
  // Safari debugging support (no eval for CSP compliance)
  devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'cheap-module-source-map'
});