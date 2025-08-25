/**
 * Generate proper PNG icons using Sharp
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const iconSizes = [16, 32, 48, 128];
const iconsDir = path.join(__dirname, '..', 'src', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

async function createIcon(size) {
    try {
        // Create an SVG icon as a string
        const svgIcon = `
            <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#1E40AF;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <rect width="${size}" height="${size}" rx="${size/8}" fill="url(#grad)" stroke="#FFFFFF" stroke-width="1"/>
                <circle cx="${size/2}" cy="${size/2}" r="${size/4}" fill="#FFFFFF" opacity="0.9"/>
                <path d="M${size/2-size/8} ${size/2} L${size/2+size/16} ${size/2-size/8} L${size/2+size/16} ${size/2+size/8} Z" fill="#1E40AF"/>
            </svg>
        `;

        // Convert SVG to PNG using Sharp
        await sharp(Buffer.from(svgIcon))
            .png()
            .resize(size, size)
            .toFile(path.join(iconsDir, `icon${size}.png`));
        
        console.log(`✓ Created ${size}x${size} PNG icon`);
    } catch (error) {
        console.error(`✗ Failed to create ${size}x${size} icon:`, error.message);
    }
}

async function generateAllIcons() {
    console.log('Generating proper PNG icons with Sharp...');
    
    for (const size of iconSizes) {
        await createIcon(size);
    }
    
    console.log('Icon generation complete!');
}

generateAllIcons().catch(console.error);