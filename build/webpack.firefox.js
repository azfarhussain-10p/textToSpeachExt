const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env, argv) => {
    const isDevelopment = argv.mode === 'development';
    const isProduction = argv.mode === 'production';

    return {
        entry: {
            'background/service-worker': './src/background/service-worker.js',
            'content/content-script': './src/content/content-script.js',
            'popup/popup': './src/popup/popup.js',
            'options/options': './src/options/options.js'
        },

        output: {
            path: path.resolve(__dirname, '../dist/firefox'),
            filename: '[name].js',
            clean: true
        },

        mode: isDevelopment ? 'development' : 'production',
        
        devtool: isDevelopment ? 'cheap-module-source-map' : false,

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
                                        firefox: '78'
                                    },
                                    modules: false
                                }]
                            ],
                            plugins: [
                                // Firefox-specific transformations
                                '@babel/plugin-transform-modules-commonjs'
                            ]
                        }
                    }
                },
                {
                    test: /\.css$/,
                    use: [
                        isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
                        'css-loader'
                    ]
                },
                {
                    test: /\.(png|jpg|jpeg|gif|svg|ico)$/,
                    type: 'asset/resource',
                    generator: {
                        filename: 'icons/[name][ext]'
                    }
                },
                {
                    test: /\.(woff|woff2|eot|ttf|otf)$/,
                    type: 'asset/resource',
                    generator: {
                        filename: 'fonts/[name][ext]'
                    }
                },
                {
                    test: /\.html$/,
                    use: 'html-loader'
                }
            ]
        },

        plugins: [
            new CleanWebpackPlugin(),
            
            new CopyPlugin({
                patterns: [
                    // Manifest (Firefox-specific)
                    {
                        from: 'src/manifest.firefox.json',
                        to: 'manifest.json'
                    },
                    // HTML files
                    {
                        from: 'src/popup/popup.html',
                        to: 'popup/popup.html'
                    },
                    {
                        from: 'src/options/options.html',
                        to: 'options/options.html'
                    },
                    // CSS files
                    {
                        from: 'src/styles/',
                        to: 'styles/',
                        globOptions: {
                            ignore: ['**/*.scss', '**/*.sass']
                        }
                    },
                    // Icons
                    {
                        from: 'src/icons/',
                        to: 'icons/',
                        noErrorOnMissing: true
                    },
                    // Web accessible resources
                    {
                        from: 'src/components/overlay.html',
                        to: 'components/overlay.html',
                        noErrorOnMissing: true
                    },
                    // Locales
                    {
                        from: 'src/_locales/',
                        to: '_locales/',
                        noErrorOnMissing: true
                    }
                ]
            }),

            ...(isProduction ? [
                new MiniCssExtractPlugin({
                    filename: 'styles/[name].css'
                })
            ] : [])
        ],

        optimization: {
            minimize: isProduction,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        compress: {
                            drop_console: isProduction,
                            drop_debugger: true
                        },
                        mangle: true,
                        format: {
                            comments: false
                        }
                    },
                    extractComments: false
                })
            ],
            
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

        resolve: {
            extensions: ['.js', '.json'],
            alias: {
                '@': path.resolve(__dirname, '../src'),
                '@services': path.resolve(__dirname, '../src/services'),
                '@components': path.resolve(__dirname, '../src/components'),
                '@utils': path.resolve(__dirname, '../src/utils'),
                '@styles': path.resolve(__dirname, '../src/styles')
            }
        },

        stats: {
            assets: true,
            colors: true,
            errors: true,
            errorDetails: true,
            hash: false,
            timings: true,
            warnings: true
        },

        performance: {
            hints: isProduction ? 'warning' : false,
            maxEntrypointSize: 512000,
            maxAssetSize: 512000
        },

        // Firefox-specific configurations
        externals: {
            // Use Firefox's built-in browser API
            'webextension-polyfill': 'browser'
        }
    };
};