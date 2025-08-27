/**
 * Prettier Configuration for TTS Extension
 * Code formatting rules for consistent style
 */

module.exports = {
  // Basic options
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  
  // JSX options
  jsxSingleQuote: true,
  jsxBracketSameLine: false,
  
  // Trailing commas
  trailingComma: 'none',
  
  // Spacing
  bracketSpacing: true,
  arrowParens: 'always',
  
  // Range formatting
  rangeStart: 0,
  rangeEnd: Infinity,
  
  // Parser options
  requirePragma: false,
  insertPragma: false,
  proseWrap: 'preserve',
  
  // HTML options
  htmlWhitespaceSensitivity: 'css',
  
  // End of line
  endOfLine: 'lf',
  
  // Embedded language formatting
  embeddedLanguageFormatting: 'auto',
  
  // Override for specific file types
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80
      }
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always'
      }
    },
    {
      files: ['*.css', '*.scss'],
      options: {
        singleQuote: false
      }
    }
  ]
};