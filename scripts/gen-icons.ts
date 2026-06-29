/**
 * Gera os ícones do app (PWA + favicon) a partir do logo, com Sharp.
 *   npx tsx scripts/gen-icons.ts
 * Saída em /public: icon-192.png, icon-512.png, apple-icon.png, favicon.png
 */
import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const svg = `
<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FF8A3D"/>
      <stop offset="55%" stop-color="#FF5A1F"/>
      <stop offset="100%" stop-color="#E11D48"/>
    </linearGradient>
    <radialGradient id="hi" cx="32%" cy="22%" r="60%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="40" height="40" rx="9" fill="url(#g)"/>
  <rect width="40" height="40" rx="9" fill="url(#hi)"/>
  <g transform="translate(11.5 8) scale(0.74)" fill="#ffffff">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </g>
</svg>`;

const out = path.join(process.cwd(), "public");
const sizes: [string, number][] = [
  ["icon-192.png", 192],
  ["icon-512.png", 512],
  ["apple-icon.png", 180],
  ["favicon.png", 48],
];

async function main() {
  for (const [name, size] of sizes) {
    const buf = await sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
    await writeFile(path.join(out, name), buf);
    console.log(`✓ ${name} (${size}px)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
