/**
 * Common Webpack Configuration for TTS Extension
 * Shared settings across all browser builds
 */

const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: {
    'background/service-worker': './src/background/service-worker.js',
    'content/content-script': './src/content/content-script.js',
    'popup/popup': './src/popup/popup.js',
    'services/tts-service': './src/services/tts-service.js',
    'utils/browser-polyfill': './src/utils/browser-polyfill.js'
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
                },
                modules: false
              }]
            ],
            plugins: [
              '@babel/plugin-transform-class-properties',
              '@babel/plugin-transform-private-methods'
            ],
            cacheDirectory: true,
            cacheCompression: false
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1
            }
          },
          'postcss-loader'
        ]
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name][ext]'
        }
      },
      {
        test: /\.(mp3|wav|ogg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/sounds/[name][ext]'
        }
      }
    ]
  },

  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['**/*'],
      cleanStaleWebpackAssets: false
    }),
    
    new CopyPlugin({
      patterns: [
        // Copy HTML files
        {
          from: 'src/popup/popup.html',
          to: 'popup/popup.html'
        },
        {
          from: 'src/options/options.html',
          to: 'options/options.html'
        },
        
        // Copy CSS files
        {
          from: 'src/popup/popup.css',
          to: 'popup/popup.css'
        },
        {
          from: 'src/assets/styles/overlay.css',
          to: 'assets/styles/overlay.css'
        },
        
        // Copy assets
        {
          from: 'src/assets/icons',
          to: 'assets/icons',
          noErrorOnMissing: true
        },
        {
          from: 'src/assets/sounds',
          to: 'assets/sounds',
          noErrorOnMissing: true
        },
        
        // Copy localization files
        {
          from: 'src/_locales',
          to: '_locales',
          noErrorOnMissing: true
        }
      ]
    })
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
      '@utils': path.resolve(__dirname, '../src/utils'),
      '@services': path.resolve(__dirname, '../src/services')
    },
    extensions: ['.js', '.json']
  },

  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          enforce: true
        }
      }
    }
  },

  // Performance budgets
  performance: {
    hints: 'warning',
    maxEntrypointSize: 512000, // 500kb
    maxAssetSize: 256000 // 250kb
  },

  // Source maps for debugging
  devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'eval-source-map',

  // Output configuration
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].js',
    publicPath: '/',
    clean: true
  },

  // Stats configuration
  stats: {
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  }
};