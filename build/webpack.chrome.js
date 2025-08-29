/**
 * Chrome-specific Webpack Configuration
 * Optimized for Manifest V3 and Chrome Web Store requirements
 */

const { merge } = require('webpack-merge');
const baseConfig = require('../webpack.config.js');

// Set Chrome as target browser
process.env.TARGET_BROWSER = 'chrome';

module.exports = merge(baseConfig, {
  // Ensure production devtool for extensions
  devtool: process.env.NODE_ENV === 'production' ? false : 'cheap-module-source-map',
  
  // Chrome-specific optimizations
  optimization: {
    usedExports: true,
    sideEffects: false,
    minimize: process.env.NODE_ENV === 'production',
    
    // Chrome Web Store size limits
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      maxSize: 244000, // Chrome Web Store limit
      cacheGroups: {
        // Vendor libraries
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 20
        },
        
        // Services (shared across background/content)
        services: {
          test: /[\\/]src[\\/]services[\\/]/,
          name: 'services',
          chunks: 'all',
          priority: 15,
          minChunks: 2
        }
      }
    }
  },
  
  // Chrome extension specific settings
  resolve: {
    fallback: {
      // Chrome extensions don't need Node.js polyfills
      fs: false,
      path: false,
      crypto: false
    }
  },
  
  // Chrome Web Store compliance
  performance: {
    hints: 'warning',
    maxAssetSize: 200000, // 200kb recommended for Chrome
    maxEntrypointSize: 200000
  },
  
  // Chrome supports ES2020+ features
  target: ['web', 'es2020']
});