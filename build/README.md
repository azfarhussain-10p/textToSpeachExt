# Build Configuration

This directory contains browser-specific webpack configurations for the TTS extension.

## Files

- `webpack.chrome.js` - Chrome/Edge-specific build configuration
- `webpack.firefox.js` - Firefox-specific build configuration  
- `webpack.safari.js` - Safari-specific build configuration

## Usage

Build commands are defined in the main `package.json`:

```bash
# Development builds (with watch mode)
npm run dev:chrome    # Chrome development build
npm run dev:firefox   # Firefox development build
npm run dev:safari    # Safari development build

# Production builds
npm run build:chrome  # Chrome production build
npm run build:firefox # Firefox production build
npm run build:safari  # Safari production build
npm run build:all     # Build for all browsers
```

## Output

Built extensions are output to:
- `dist/chrome/` - Chrome extension
- `dist/firefox/` - Firefox extension
- `dist/safari/` - Safari extension

## Icon Requirements

**Note**: The current build uses placeholder SVG files for icons. In production, you should:

1. Convert `src/assets/icons/icon.svg` to PNG files at different sizes:
   - 16x16px for `icon16.png`
   - 32x32px for `icon32.png`
   - 48x48px for `icon48.png`
   - 128x128px for `icon128.png`

2. Use tools like `imagemin` or online converters to optimize the PNG files.

## Browser-Specific Features

Each webpack config targets different JavaScript compatibility levels:
- **Chrome/Edge**: ES2020 (modern features supported)
- **Firefox**: ES2018 (good compatibility)
- **Safari**: ES2017 (most conservative for older Safari versions)