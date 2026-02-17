const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Simple batch image optimizer using sharp
// Usage:
// 1. npm install sharp
// 2. node optimize_images.js

const IMAGES_DIR = path.join(__dirname, '..', 'images');
const OUT_DIR = path.join(__dirname, '..', 'assets', 'images');
const SIZES = [320, 640, 1024, 1600];

function ensureOut() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function processFile(file) {
  const ext = path.extname(file).toLowerCase();
  const base = path.basename(file, ext);
  const inPath = path.join(IMAGES_DIR, file);

  if (!['.jpg', '.jpeg', '.png', '.avif', '.webp'].includes(ext)) return;

  for (const w of SIZES) {
    const outWebP = path.join(OUT_DIR, `${base}-${w}.webp`);
    const outJpeg = path.join(OUT_DIR, `${base}-${w}.jpg`);

    try {
      await sharp(inPath)
        .resize({ width: w })
        .webp({ quality: 80 })
        .toFile(outWebP);

      await sharp(inPath)
        .resize({ width: w })
        .jpeg({ quality: 82 })
        .toFile(outJpeg);

      console.log(`Wrote ${outWebP} and ${outJpeg}`);
    } catch (err) {
      console.error('Error processing', inPath, err.message || err);
    }
  }
}

async function main() {
  ensureOut();
  const files = fs.readdirSync(IMAGES_DIR);
  for (const f of files) {
    await processFile(f);
  }
  console.log('Image optimization complete. Optimized files placed in assets/images/');
}

main().catch(err => console.error(err));
