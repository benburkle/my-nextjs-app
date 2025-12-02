import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import toIco from 'to-ico';

// ICO format supports: 16, 32, 48, and 256 (stored as PNG)
// We'll generate all sizes for PNG files, but use standard ICO sizes for the ICO file
const sizes = [256, 48, 32, 16];
const icoSizes = [16, 32, 48, 256]; // Standard ICO sizes
const yellowColor = '#F9D45B'; // Yellow color for background

async function generateFavicon() {
  const logoPath = join(process.cwd(), 'public', 'logo.png');
  const outputDir = join(process.cwd(), 'public');

  try {
    // Read the logo image
    const logoBuffer = readFileSync(logoPath);

    // Generate each size and collect buffers for ICO
    const iconBuffers: Buffer[] = [];
    const iconSizes: number[] = [];
    const iconMap = new Map<number, Buffer>();

    for (const size of sizes) {
      const padding = Math.round(size * 0.15); // 15% padding like in the Logo component
      const iconSize = size - padding * 2;

      // Create a yellow circle background
      const circleSvg = `
        <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
          <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${yellowColor}"/>
        </svg>
      `;

      // Resize logo (keep it black, no filter)
      const resizedLogo = await sharp(logoBuffer)
        .resize(iconSize, iconSize, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .toBuffer();

      // Create the final image with yellow circle background and black logo
      const finalImage = await sharp(Buffer.from(circleSvg))
        .resize(size, size)
        .composite([
          {
            input: resizedLogo,
            top: padding,
            left: padding,
            blend: 'over',
          },
        ])
        .png()
        .toBuffer();

      // Save individual PNG files
      const filename = `favicon-${size}x${size}.png`;
      writeFileSync(join(outputDir, filename), finalImage);
      console.log(`Generated ${filename}`);

      // Store in map for ICO generation
      iconMap.set(size, finalImage);
    }

    // Create ICO file with standard ICO sizes (in order: 16, 32, 48, 256)
    for (const size of icoSizes) {
      if (iconMap.has(size)) {
        iconBuffers.push(iconMap.get(size)!);
        iconSizes.push(size);
      }
    }

    // Create a single ICO file with all sizes
    const icoBuffer = await toIco(iconBuffers);

    writeFileSync(join(outputDir, 'favicon.ico'), icoBuffer);
    console.log('Generated favicon.ico (multi-resolution with all sizes)');

    console.log('All favicons generated successfully!');
  } catch (error) {
    console.error('Error generating favicons:', error);
    process.exit(1);
  }
}

generateFavicon();
