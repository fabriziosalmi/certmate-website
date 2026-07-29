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
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// Single source of truth: parse the version + provider count straight out of
// src/data/site.ts. This standalone node script cannot `import` the TS module,
// but reading the two constants keeps the card from silently drifting behind a
// release (it once shipped v2.21.3 while the whole site said 2.24.0).
const siteTs = readFileSync(resolve(root, 'src/data/site.ts'), 'utf8');
const VERSION = siteTs.match(/VERSION\s*=\s*'([^']+)'/)?.[1];
const PROVIDER_COUNT = siteTs.match(/PROVIDER_COUNT\s*=\s*(\d+)/)?.[1];
if (!VERSION || !PROVIDER_COUNT) {
  throw new Error('build-og: could not parse VERSION / PROVIDER_COUNT from src/data/site.ts');
}

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
  <text x="80" y="370" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" font-size="38" font-weight="500" fill="#334155">Self-hosted TLS certificate management</text>

  <!-- Footer chips. Version + provider count are parsed from src/data/site.ts
       above, so this card can never drift behind a release again. -->
  <g font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" font-size="22" font-weight="600">
    <rect x="80"  y="460" width="120" height="44" rx="10" fill="#dbeafe"/>
    <text x="140" y="490" fill="#1d4ed8" text-anchor="middle">v${VERSION}</text>

    <rect x="216" y="460" width="100" height="44" rx="10" fill="#dbeafe"/>
    <text x="266" y="490" fill="#1d4ed8" text-anchor="middle">MIT</text>

    <rect x="332" y="460" width="240" height="44" rx="10" fill="#dbeafe"/>
    <text x="452" y="490" fill="#1d4ed8" text-anchor="middle">${PROVIDER_COUNT} DNS providers</text>

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
