/**
 * Icon Generation Script for TTS Extension
 * Creates placeholder icons using Canvas API (Node.js with canvas package)
 * Or generates SVG-based icons for development
 */

const fs = require('fs');
const path = require('path');

// SVG icon template
const createSVGIcon = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background circle -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="#667eea" stroke="#5a6fd8" stroke-width="2"/>
  
  <!-- Speaker icon -->
  <g transform="translate(${size/4}, ${size/4})">
    <!-- Speaker base -->
    <rect x="2" y="${size/8}" width="${size/8}" height="${size/4}" fill="white" rx="1"/>
    <!-- Speaker cone -->
    <polygon points="2,${size/8} ${size/4},4 ${size/4},${size*3/8} 2,${size*3/8}" fill="white"/>
    <!-- Sound waves -->
    <path d="M ${size/3} ${size/6} Q ${size/2.2} ${size/8} ${size/2.2} ${size/4} Q ${size/2.2} ${size*3/8} ${size/3} ${size*5/12}" 
          stroke="white" stroke-width="1.5" fill="none"/>
    <path d="M ${size/2.5} ${size/5} Q ${size/1.8} ${size/7} ${size/1.8} ${size/4} Q ${size/1.8} ${size*3/8} ${size/2.5} ${size*2/5}" 
          stroke="white" stroke-width="1" fill="none"/>
  </g>
  
  <!-- AI indicator dot -->
  <circle cx="${size - 6}" cy="6" r="3" fill="#28a745"/>
</svg>`;

// Create icons directory
const iconsDir = path.join(__dirname, '..', 'src', 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG icons for different sizes
const sizes = [16, 32, 48, 128];

sizes.forEach(size => {
    const svgContent = createSVGIcon(size);
    const svgPath = path.join(iconsDir, `icon${size}.svg`);
    fs.writeFileSync(svgPath, svgContent);
    console.log(`Created icon${size}.svg`);
});

// Create a simple PNG fallback using ASCII art for development
const createSimplePNG = (size) => {
    // This is a very basic placeholder - in production you'd use a proper image library
    const canvas = `
    <!-- Placeholder for icon${size}.png -->
    <!-- Use a tool like GIMP, Photoshop, or online converter to create PNG from SVG -->
    `;
    return canvas;
};

// Create placeholder instructions
const readmePath = path.join(iconsDir, 'README.md');
const readmeContent = `# TTS Extension Icons

## Development Icons
SVG icons have been generated for development. For production, convert these to PNG format.

### Conversion Instructions:
1. Use an online SVG to PNG converter (e.g., https://cloudconvert.com/svg-to-png)
2. Convert each SVG file to PNG with the corresponding size
3. Replace the SVG files with PNG files

### Icon Sizes:
- icon16.png - 16x16 pixels (toolbar)
- icon32.png - 32x32 pixels (Windows taskbar)
- icon48.png - 48x48 pixels (extension management page)
- icon128.png - 128x128 pixels (Chrome Web Store)

### Design Guidelines:
- Use the TTS extension brand colors (#667eea primary, #28a745 accent)
- Include speaker/audio visual elements
- Ensure icons are clear at small sizes
- Follow browser extension icon guidelines
`;

fs.writeFileSync(readmePath, readmeContent);
console.log('Created README.md with icon instructions');

console.log('\n✅ Icon generation complete!');
console.log('📁 Icons created in:', iconsDir);
console.log('🔄 For production, convert SVG files to PNG format');