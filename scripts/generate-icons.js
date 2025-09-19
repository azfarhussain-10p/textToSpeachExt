#!/usr/bin/env node

/**
 * Icon Generation Script for Intelligent TTS Extension
 * Converts the SVG icon to multiple PNG sizes required by browser extensions
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SVG_PATH = path.join(__dirname, '..', 'src', 'assets', 'icons', 'icon.svg');
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'assets', 'icons');

// Required icon sizes for browser extensions
const SIZES = [16, 32, 48, 128];

async function generateIcons() {
  console.log('🎨 Generating PNG icons from SVG...');

  // Check if SVG exists
  if (!fs.existsSync(SVG_PATH)) {
    console.error('❌ SVG icon not found:', SVG_PATH);
    process.exit(1);
  }

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  try {
    // Read the SVG file
    const svgBuffer = fs.readFileSync(SVG_PATH);

    // Generate each required size
    for (const size of SIZES) {
      const outputPath = path.join(OUTPUT_DIR, `icon${size}.png`);

      await sharp(svgBuffer)
        .resize(size, size)
        .png({
          quality: 100,
          compressionLevel: 9,
          adaptiveFiltering: true
        })
        .toFile(outputPath);

      console.log(`✅ Generated: icon${size}.png (${size}x${size})`);
    }

    console.log('🎉 All icon files generated successfully!');
    console.log('\nGenerated files:');
    SIZES.forEach(size => {
      console.log(`  - src/assets/icons/icon${size}.png`);
    });

  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  generateIcons().catch(console.error);
}

module.exports = { generateIcons };