import sharp from "sharp";
import type { Marketplace } from "@prisma/client";
import { formatPrice } from "./utils";
import { getMarketplaceMeta } from "./categories";

export type SocialFormat = "square" | "story" | "landscape";

export interface ImageGeneratorParams {
  productImage: string;
  title: string;
  originalPrice: number;
  currentPrice: number;
  discountPercent: number;
  marketplace: Marketplace | string;
  /** gradiente da categoria [topo, base] */
  gradient?: [string, string];
  format?: SocialFormat;
  siteName?: string;
}

const DIMENSIONS: Record<SocialFormat, { w: number; h: number }> = {
  square: { w: 1080, h: 1080 },
  story: { w: 1080, h: 1920 },
  landscape: { w: 1200, h: 630 },
};

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!,
  );
}

/** Quebra o título em até 2 linhas para caber na arte. */
function wrapTitle(title: string, maxChars = 28): string[] {
  const words = title.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > maxChars) {
      if (cur) lines.push(cur.trim());
      cur = w;
    } else cur = (cur + " " + w).trim();
    if (lines.length === 2) break;
  }
  if (cur && lines.length < 2) lines.push(cur.trim());
  if (lines.length === 2 && words.join(" ").length > lines.join(" ").length) {
    lines[1] = lines[1].slice(0, maxChars - 1) + "…";
  }
  return lines.slice(0, 2);
}

async function fetchImageBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Imagem do produto indisponível: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/**
 * Gera a arte de divulgação da oferta e devolve o buffer PNG.
 * Layout: gradiente da categoria, imagem do produto centralizada em card branco,
 * badge de desconto, faixa inferior com preços e marca do site.
 */
export async function generateOfferImage(params: ImageGeneratorParams): Promise<Buffer> {
  const {
    productImage,
    title,
    originalPrice,
    currentPrice,
    discountPercent,
    marketplace,
    gradient = ["#FF5A1F", "#7C2D12"],
    format = "square",
    siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "busqueioferta",
  } = params;

  const { w, h } = DIMENSIONS[format];
  const marketLabel = getMarketplaceMeta(marketplace as Marketplace)?.label ?? String(marketplace);

  const titleLines = wrapTitle(title);
  const cardSize = Math.round(Math.min(w, h) * 0.62);
  const cardX = Math.round((w - cardSize) / 2);
  const cardY = Math.round(h * 0.14);
  const footerY = cardY + cardSize + Math.round(h * 0.03);

  const productPng = await sharp(await fetchImageBuffer(productImage))
    .resize(cardSize - 60, cardSize - 60, { fit: "inside", background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .flatten({ background: "#ffffff" })
    .png()
    .toBuffer();
  const productMeta = await sharp(productPng).metadata();
  const pw = productMeta.width ?? cardSize - 60;
  const ph = productMeta.height ?? cardSize - 60;

  const background = Buffer.from(`
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${gradient[0]}"/>
          <stop offset="100%" stop-color="${gradient[1]}"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="18" flood-opacity="0.35"/>
        </filter>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#bg)"/>

      <!-- topo: marca + marketplace -->
      <text x="${w / 2}" y="${h * 0.08}" text-anchor="middle" font-family="Arial, sans-serif"
        font-size="46" font-weight="800" fill="#ffffff">${escapeXml(siteName)}</text>
      <text x="${w / 2}" y="${h * 0.115}" text-anchor="middle" font-family="Arial, sans-serif"
        font-size="28" font-weight="600" fill="#ffffff" opacity="0.85">${escapeXml(marketLabel)}</text>

      <!-- card branco do produto -->
      <rect x="${cardX}" y="${cardY}" width="${cardSize}" height="${cardSize}" rx="32"
        fill="#ffffff" filter="url(#shadow)"/>

      <!-- badge de desconto -->
      <g>
        <circle cx="${cardX + cardSize - 20}" cy="${cardY + 20}" r="86" fill="#E11D48"/>
        <text x="${cardX + cardSize - 20}" y="${cardY + 8}" text-anchor="middle"
          font-family="Arial, sans-serif" font-size="64" font-weight="900" fill="#ffffff">-${Math.round(discountPercent)}%</text>
        <text x="${cardX + cardSize - 20}" y="${cardY + 52}" text-anchor="middle"
          font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="#ffffff">OFF</text>
      </g>

      <!-- título -->
      ${titleLines
        .map(
          (line, i) =>
            `<text x="${w / 2}" y="${footerY + 70 + i * 56}" text-anchor="middle" font-family="Arial, sans-serif" font-size="46" font-weight="700" fill="#ffffff">${escapeXml(line)}</text>`,
        )
        .join("")}

      <!-- preços -->
      <text x="${w / 2}" y="${footerY + 70 + titleLines.length * 56 + 60}" text-anchor="middle"
        font-family="Arial, sans-serif" font-size="40" font-weight="500" fill="#ffffff" opacity="0.8"
        text-decoration="line-through">${escapeXml(formatPrice(originalPrice))}</text>
      <text x="${w / 2}" y="${footerY + 70 + titleLines.length * 56 + 130}" text-anchor="middle"
        font-family="Arial, sans-serif" font-size="92" font-weight="900" fill="#FFE600">${escapeXml(formatPrice(currentPrice))}</text>
    </svg>`);

  return sharp(background)
    .composite([
      {
        input: productPng,
        left: Math.round(cardX + (cardSize - pw) / 2),
        top: Math.round(cardY + (cardSize - ph) / 2),
      },
    ])
    .png()
    .toBuffer();
}
