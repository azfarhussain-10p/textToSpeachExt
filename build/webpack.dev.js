/**
 * Development Webpack Configuration
 * Optimized for development with hot reload and debugging
 */

const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  
  // Development optimizations
  optimization: {
    minimize: false,
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false
  },

  // Enhanced source maps for debugging
  devtool: 'eval-cheap-module-source-map',

  // Development-specific settings
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]
    }
  },

  // Watch options
  watchOptions: {
    ignored: /node_modules/,
    aggregateTimeout: 300,
    poll: 1000
  },

  // Development performance settings
  performance: {
    hints: false // Disable performance hints in development
  },

  // Stats for development
  stats: {
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false,
    timings: true,
    assets: true
  },

  // Development plugins
  plugins: [
    // Add development-specific plugins here if needed
  ],

  // Resolve configuration for development
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
      '@utils': path.resolve(__dirname, '../src/utils'),
      '@services': path.resolve(__dirname, '../src/services'),
      '@assets': path.resolve(__dirname, '../src/assets')
    },
    extensions: ['.js', '.json'],
    symlinks: false,
    cacheWithContext: false
  },

  // Development output
  output: {
    pathinfo: false, // Improve build performance
    chunkFilename: '[name].chunk.js',
    assetModuleFilename: 'assets/[name][ext]'
  }
});