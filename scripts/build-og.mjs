#!/usr/bin/env node
/**
 * Build the OG / social-share image (1200×630, public/assets/og.png).
 *
 * Why this exists as a script rather than an Astro endpoint: the
 * deployment target is GitHub Pages — static output only. Running this
 * locally and committing the resulting PNG gives a stable artefact
 * indexed by every social platform's cache. Re-run when the visual
 * identity changes (logo, primary colour, tagline).
 *
 * Usage: `node scripts/build-og.mjs` (no args).
 */
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const LOGO = resolve(root, 'public/assets/certmate_logo.png');
const OUT = resolve(root, 'public/assets/og.png');

const W = 1200;
const H = 630;

// Read the logo and resize to fit the card. Sharp returns the buffer so
// we can composite it on top of the SVG background.
const logo = await sharp(LOGO).resize(160, 160).png().toBuffer();

// The card uses a gradient background that matches the hero — the same
// blue→cyan tones — plus a soft radial accent in the top-right. Text is
// rendered as SVG so we don't need a font file on disk; the platform's
// rendering of the system stack is consistent enough for a single image
// regenerated on demand.
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#eff6ff"/>
      <stop offset="60%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#ecfeff"/>
    </linearGradient>
    <radialGradient id="accent" cx="85%" cy="15%" r="50%">
      <stop offset="0%" stop-color="#2563eb" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#2563eb" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#accent)"/>
  <rect x="0" y="${H - 8}" width="${W}" height="8" fill="#2563eb"/>

  <!-- Headline -->
  <text x="80" y="290" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" font-size="84" font-weight="800" fill="#0f172a">CertMate</text>
  <text x="80" y="370" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" font-size="38" font-weight="500" fill="#334155">Open-source SSL certificate management</text>

  <!-- Footer chips -->
  <g font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" font-size="22" font-weight="600">
    <rect x="80"  y="460" width="120" height="44" rx="10" fill="#dbeafe"/>
    <text x="140" y="490" fill="#1d4ed8" text-anchor="middle">v2.7.0</text>

    <rect x="216" y="460" width="100" height="44" rx="10" fill="#dbeafe"/>
    <text x="266" y="490" fill="#1d4ed8" text-anchor="middle">MIT</text>

    <rect x="332" y="460" width="240" height="44" rx="10" fill="#dbeafe"/>
    <text x="452" y="490" fill="#1d4ed8" text-anchor="middle">22+ DNS providers</text>

    <rect x="588" y="460" width="140" height="44" rx="10" fill="#dbeafe"/>
    <text x="658" y="490" fill="#1d4ed8" text-anchor="middle">OIDC / SSO</text>

    <rect x="744" y="460" width="180" height="44" rx="10" fill="#dbeafe"/>
    <text x="834" y="490" fill="#1d4ed8" text-anchor="middle">REST API</text>
  </g>

  <text x="80" y="580" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" font-size="20" font-weight="500" fill="#64748b">certmate.org · github.com/fabriziosalmi/certmate</text>
</svg>`;

await sharp(Buffer.from(svg))
  .composite([{ input: logo, top: 80, left: 80 }])
  .png({ compressionLevel: 9, quality: 90 })
  .toFile(OUT);

console.log(`Wrote ${OUT} (1200×630)`);
