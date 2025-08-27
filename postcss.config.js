/**
 * PostCSS Configuration for TTS Extension
 * CSS processing and optimization
 */

module.exports = {
  plugins: [
    require('autoprefixer')({
      overrideBrowserslist: [
        'Chrome >= 88',
        'Firefox >= 78',
        'Safari >= 14',
        'Edge >= 88'
      ]
    }),
    
    // CSS optimization for production
    ...(process.env.NODE_ENV === 'production' ? [
      require('cssnano')({
        preset: ['default', {
          discardComments: {
            removeAll: true
          },
          normalizeWhitespace: true,
          colormin: true,
          convertValues: true,
          discardDuplicates: true,
          discardEmpty: true,
          mergeRules: true,
          minifySelectors: true,
          reduceIdents: false, // Keep for browser extension compatibility
          zindex: false // Don't optimize z-index for extension overlay
        }]
      })
    ] : [])
  ]
};