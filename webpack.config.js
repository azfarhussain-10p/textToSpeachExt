/**
 * Webpack Configuration for TTS Extension
 * Builds the extension for multiple browsers with proper optimization
 */

const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

// Get target browser from environment
const TARGET_BROWSER = process.env.TARGET_BROWSER || 'chrome';
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';

console.log(`🔧 Building for ${TARGET_BROWSER} (${NODE_ENV})`);

module.exports = {
  mode: NODE_ENV,
  
  // Entry points for different parts of the extension
  entry: {
    // Background scripts
    'background/service-worker': './src/background/service-worker.js',
    'background/background': './src/background/background.js',
    
    // Content script
    'content/content-script': './src/content/content-script.js',
    
    // Popup
    'popup/popup': './src/popup/popup.js',
    
    // Overlay
    'overlay/overlay': './src/overlay/overlay.js'
  },
  
  output: {
    path: path.resolve(__dirname, `dist/${TARGET_BROWSER}`),
    filename: '[name].js',
    clean: true
  },
  
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: {
                  chrome: '88',
                  firefox: '78',
                  safari: '14',
                  edge: '88'
                }
              }]
            ]
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name][ext]'
        }
      }
    ]
  },
  
  plugins: [
    // Clean dist directory
    new CleanWebpackPlugin(),
    
    // Copy static files
    new CopyWebpackPlugin({
      patterns: [
        // Copy browser-specific manifest
        {
          from: `src/manifest/${TARGET_BROWSER}/manifest.json`,
          to: 'manifest.json'
        },
        
        // Copy HTML files
        {
          from: 'src/popup/popup.html',
          to: 'popup/popup.html'
        },
        {
          from: 'src/overlay/overlay.html',
          to: 'overlay/overlay.html'
        },
        
        // Copy CSS files
        {
          from: 'src/popup/popup.css',
          to: 'popup/popup.css'
        },
        {
          from: 'src/overlay/overlay.css',
          to: 'overlay/overlay.css'
        },
        {
          from: 'src/content/content-styles.css',
          to: 'content/content-styles.css'
        },
        
        // Copy service files for direct import in HTML
        {
          from: 'src/services/',
          to: 'services/'
        },
        {
          from: 'src/utils/',
          to: 'utils/'
        },
        
        // Copy assets
        {
          from: 'src/assets/',
          to: 'assets/',
          globOptions: {
            ignore: ['**/*.svg'] // SVG icons will be processed separately
          }
        },
        
        // Copy and rename icon for different sizes (placeholder)
        {
          from: 'src/assets/icons/icon.svg',
          to: 'assets/icons/icon16.png',
          // Note: In production, you'd convert SVG to PNG at different sizes
          // For now, we'll use SVG as placeholder
        },
        {
          from: 'src/assets/icons/icon.svg',
          to: 'assets/icons/icon32.png'
        },
        {
          from: 'src/assets/icons/icon.svg',
          to: 'assets/icons/icon48.png'
        },
        {
          from: 'src/assets/icons/icon.svg',
          to: 'assets/icons/icon128.png'
        }
      ]
    })
  ],
  
  // Development configuration
  devtool: IS_PRODUCTION ? false : 'cheap-module-source-map',
  
  optimization: {
    minimize: IS_PRODUCTION,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // Shared utilities
        shared: {
          name: 'shared',
          chunks: 'all',
          minChunks: 2,
          priority: 10
        }
      }
    }
  },
  
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@utils': path.resolve(__dirname, 'src/utils')
    }
  },
  
  // Webpack dev server (not needed for extension but included for completeness)
  devServer: {
    contentBase: path.resolve(__dirname, `dist/${TARGET_BROWSER}`),
    port: 3000,
    hot: false,
    inline: false
  },
  
  // Performance hints
  performance: {
    hints: IS_PRODUCTION ? 'warning' : false,
    maxAssetSize: 500000, // 500kb
    maxEntrypointSize: 500000
  }
};