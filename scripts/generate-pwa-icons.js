/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, @typescript-eslint/no-unused-vars */
// Generate PWA icons from SVG
// This script requires sharp: npm install --save-dev sharp

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('Error: sharp is not installed. Please run: npm install --save-dev sharp');
  process.exit(1);
}

const publicDir = path.join(__dirname, '..', 'public');
const iconSvg = path.join(publicDir, 'icon.svg');

// Read SVG
const svgBuffer = fs.readFileSync(iconSvg);

// Generate icons
const sizes = [
  { size: 192, filename: 'icon-192.png' },
  { size: 512, filename: 'icon-512.png' },
];

async function generateIcons() {
  console.log('Generating PWA icons...');
  
  for (const { size, filename } of sizes) {
    try {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(publicDir, filename));
      console.log(`✓ Generated ${filename} (${size}x${size})`);
    } catch (error) {
      console.error(`✗ Failed to generate ${filename}:`, error.message);
    }
  }
  
  console.log('Done!');
}

generateIcons().catch(console.error);

