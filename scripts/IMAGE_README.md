Image optimization helper

This repository includes `scripts/optimize_images.js` — a small Node.js script that batch-processes files in the `images/` folder and writes optimized variants to `assets/images/`.

How it works

- Reads all files from `images/`.
- For each JPG/PNG/AVIF/WebP file, generates multiple widths: 320, 640, 1024, 1600.
- Produces both WebP and JPEG outputs for each size (files named `{basename}-{width}.webp` and `{basename}-{width}.jpg`).

Prerequisites

- Node.js installed
- Install `sharp` in the project root or `scripts/` folder:

```bash
cd scripts
npm init -y
npm install sharp
```

Run

```bash
node optimize_images.js
```

Notes

- The script will create `assets/images/` if it does not exist.
- Adjust `SIZES` in `optimize_images.js` if you need different breakpoints.
- After generating images, update your HTML to reference the new responsive files (the script does not modify HTML).
