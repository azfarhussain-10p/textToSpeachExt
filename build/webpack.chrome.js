/**
 * Chrome-Specific Webpack Configuration
 * Optimized for Manifest V3 and Chrome Web Store requirements
 */

const path = require('path');
const { merge } = require('webpack-merge');
const CopyPlugin = require('copy-webpack-plugin');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  name: 'chrome',
  
  output: {
    path: path.resolve(__dirname, '../dist/chrome')
  },

  plugins: [
    new CopyPlugin({
      patterns: [
        // Chrome-specific manifest
        {
          from: path.resolve(__dirname, '../src/manifest.json'),
          to: 'manifest.json',
          transform(content) {
            const manifest = JSON.parse(content.toString());
            
            // Chrome-specific optimizations
            manifest.manifest_version = 3;
            manifest.minimum_chrome_version = '88';
            
            // Ensure service worker is properly configured
            if (manifest.background) {
              manifest.background.service_worker = 'background/service-worker.js';
              manifest.background.type = 'module';
              delete manifest.background.scripts; // Remove if exists from V2
            }
            
            // Chrome-specific permissions
            if (!manifest.permissions.includes('scripting')) {
              manifest.permissions.push('scripting');
            }
            
            // Action API (not browserAction)
            if (manifest.browser_action) {
              manifest.action = manifest.browser_action;
              delete manifest.browser_action;
            }
            
            // Chrome-specific CSP
            manifest.content_security_policy = {
              extension_pages: "script-src 'self'; object-src 'self'"
            };
            
            return JSON.stringify(manifest, null, 2);
          }
        }
      ]
    })
  ],

  // Chrome-specific optimizations
  optimization: {
    minimize: process.env.NODE_ENV === 'production',
    usedExports: true,
    sideEffects: false,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },

  // Chrome extension specific settings
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
      '@utils': path.resolve(__dirname, '../src/utils'),
      '@services': path.resolve(__dirname, '../src/services')
    },
    extensions: ['.js', '.json'],
    fallback: {
      // Chrome extensions don't need Node.js polyfills
      fs: false,
      path: false,
      crypto: false
    }
  },

  // Chrome-specific build settings
  target: 'web',
  
  mode: process.env.NODE_ENV || 'development',

  // Chrome Web Store size limits
  performance: {
    hints: 'error',
    maxEntrypointSize: 400000, // 400kb
    maxAssetSize: 200000 // 200kb
  }
});