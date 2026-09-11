#!/usr/bin/env node
/**
 * Draw the social card each built page asked for (1200x630).
 *
 * Every page in the output carries an og:image. This walks dist/, reads the
 * og:image each page declared and the <title> it shows, and renders that exact
 * file. Pages are not listed here: a page that exists gets a card, a card no
 * page asked for is never drawn, and a card a page asked for and did not get
 * is caught by scripts/check-seo.mjs, which reads the same output.
 *
 * The site used to ship one image for all forty pages, so every share of an
 * error page or a deployment guide showed the product's front-door card.
 *
 * Run after `astro build` and before the SEO gate. Nothing is committed: the
 * cards are build output, deterministic given the same sources, so the URL a
 * social platform caches stays stable while the picture behind it follows the
 * page.
 *
 * Usage: node scripts/build-og.mjs [--dist dist]
 */
import sharp from 'sharp';
import { readdirSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, relative } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const distIndex = process.argv.indexOf('--dist');
const DIST = resolve(root, distIndex === -1 ? 'dist' : process.argv[distIndex + 1]);

// Single source of truth: the version and provider count come out of
// src/data/site.ts. This standalone node script cannot import the TS module,
// but reading the two constants keeps the card from silently drifting behind a
// release (it once shipped v2.21.3 while the whole site said 2.24.0).
const siteTs = readFileSync(resolve(root, 'src/data/site.ts'), 'utf8');
const VERSION = siteTs.match(/VERSION\s*=\s*'([^']+)'/)?.[1];
const PROVIDER_COUNT = siteTs.match(/PROVIDER_COUNT\s*=\s*(\d+)/)?.[1];
if (!VERSION || !PROVIDER_COUNT) {
  throw new Error('build-og: could not parse VERSION / PROVIDER_COUNT from src/data/site.ts');
}

const LOGO = resolve(root, 'public/assets/certmate_logo.png');
const W = 1200;
const H = 630;
const SKIP_DIRS = new Set(['pagefind', '_astro', 'assets', 'vendor']);

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) out.push(...walk(path));
    } else if (entry.name.endsWith('.html')) {
      out.push(path);
    }
  }
  return out;
}

function attribute(html, selector) {
  const match = html.match(selector);
  return match ? match[1] : null;
}

function decode(text) {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Break a headline into lines that fit the card, and pick a size that fits.
 *
 * There is no text measurement here and no font metrics. The renderer is
 * whatever fontconfig hands librsvg, which differs between a laptop and a CI
 * runner, so an exact width is not available at all: what is used is a
 * conservative average advance of 0.6em for a heavy weight, and a headline is
 * shrunk until it fits in at most three lines. The first version assumed
 * 0.42em and the longest title ran off the right edge of the card, which is
 * why the ratio is stated here rather than left implicit.
 *
 * A word longer than a line (an error code such as
 * ERR_SSL_VERSION_OR_CIPHER_MISMATCH is one word and wider than the card) is
 * split rather than allowed to overflow.
 */
// Estimated width of a heavy-weight glyph, as a fraction of the font size.
// A single average is not good enough: counting characters treated
// ERR_SSL_VERSION_OR_CIPHER_MISMATCH like lower-case prose and the first
// version pushed it past the right margin. Capitals and digits are close to
// 0.72em, lower case to 0.55em, and a handful of glyphs are much narrower.
const TEXT_WIDTH = W - 160; // the 80px margin on both sides
const NARROW = new Set([...'ijlt.,:;!|\'’ ()[]-']);
const WIDE = new Set([...'MW@%']);

function glyphWidth(character) {
  if (NARROW.has(character)) return 0.3;
  if (WIDE.has(character)) return 0.92;
  if (character >= 'A' && character <= 'Z') return 0.72;
  if (character >= '0' && character <= '9') return 0.64;
  return 0.56;
}

/** Estimated rendered width of a string, in pixels, at a font size. */
function textWidth(text, size) {
  let total = 0;
  for (const character of text) total += glyphWidth(character);
  return total * size;
}

/**
 * Break a headline into lines that fit the card width.
 *
 * There is no real text measurement here: the renderer is whatever fontconfig
 * hands librsvg, which differs between a laptop and a CI runner, so an exact
 * width is not available at all. The estimate above is deliberately generous,
 * and a headline is shrunk until it fits in at most three lines.
 *
 * A word wider than a line (an error code such as
 * ERR_SSL_VERSION_OR_CIPHER_MISMATCH is one word and wider than the card) is
 * split rather than allowed to overflow.
 */
function wrap(text, size, maxLines) {
  const words = [];
  for (const word of text.split(/\s+/).filter(Boolean)) {
    if (textWidth(word, size) <= TEXT_WIDTH) {
      words.push(word);
      continue;
    }
    let piece = '';
    for (const character of word) {
      if (textWidth(piece + character, size) > TEXT_WIDTH) {
        words.push(piece);
        piece = character;
      } else {
        piece += character;
      }
    }
    if (piece) words.push(piece);
  }

  const lines = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (textWidth(candidate, size) <= TEXT_WIDTH) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  kept[maxLines - 1] = `${kept[maxLines - 1].replace(/[\s.,;:]+$/, '')}...`;
  return kept;
}

// The headline occupies one band of the card, between the logo row above it
// and the chips below. Both edges are hard: the first version let a two line
// headline start at y=234 and its ascenders ran through the logo.
const BAND_TOP = 250;
const BAND_BOTTOM = 444;
const LINE_HEIGHT = 1.15;

/** The largest size in the scale whose headline fits the band, in width and height. */
function fit(text) {
  for (const size of [80, 66, 54, 46]) {
    const lines = wrap(text, size, 3);
    const fitsWidth = lines.every((line) => textWidth(line, size) <= TEXT_WIDTH);
    const fitsHeight = lines.length * size * LINE_HEIGHT <= BAND_BOTTOM - BAND_TOP;
    if (fitsWidth && fitsHeight) return { size, lines };
  }
  return { size: 46, lines: wrap(text, 46, 3) };
}

/**
 * The headline, without the site name the <title> appends.
 *
 * Every title ends in the site name so a browser tab and a search result say
 * which site they came from. A card already says so twice, in the logo and in
 * the footer, so repeating it there only costs headline room.
 */
function headline(title) {
  return title.replace(/\s*[·|\-–]\s*CertMate\s*$/, '').trim() || title;
}

// The section a page belongs to, shown above the headline so a shared link
// says what kind of page it is before anyone reads the title.
function eyebrow(url) {
  const segments = url.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  const italian = segments[0] === 'it';
  const local = italian ? segments.slice(1) : segments;
  const section = {
    errors: italian ? 'Errori SSL' : 'SSL errors',
    deploy: italian ? 'Installazione' : 'Deployment',
    docs: 'Documentation',
    privacy: italian ? 'Informativa' : 'Privacy',
    security: italian ? 'Sicurezza' : 'Security',
  }[local[0]];
  if (!section) return italian ? 'certmate.org - Italiano' : 'certmate.org';
  return italian ? `${section} - Italiano` : section;
}

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";

function card(title, section, logo) {
  const { size, lines } = fit(headline(title));
  // Baseline of the first line: the block is centred in its band, and the
  // baseline sits below the top of the line box by roughly the cap height.
  const slack = BAND_BOTTOM - BAND_TOP - lines.length * size * LINE_HEIGHT;
  const top = BAND_TOP + slack / 2 + size * 0.85;

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

  <text x="212" y="132" font-family="${FONT}" font-size="26" font-weight="700" fill="#2563eb" letter-spacing="2">${escapeXml(section.toUpperCase())}</text>

  <g font-family="${FONT}" font-size="${size}" font-weight="800" fill="#0f172a">
${lines.map((line, index) => `    <text x="80" y="${Math.round(top + index * size * 1.15)}">${escapeXml(line)}</text>`).join('\n')}
  </g>

  <g font-family="${FONT}" font-size="22" font-weight="600">
    <rect x="80"  y="460" width="120" height="44" rx="10" fill="#dbeafe"/>
    <text x="140" y="490" fill="#1d4ed8" text-anchor="middle">v${VERSION}</text>

    <rect x="216" y="460" width="100" height="44" rx="10" fill="#dbeafe"/>
    <text x="266" y="490" fill="#1d4ed8" text-anchor="middle">MIT</text>

    <rect x="332" y="460" width="240" height="44" rx="10" fill="#dbeafe"/>
    <text x="452" y="490" fill="#1d4ed8" text-anchor="middle">${PROVIDER_COUNT} DNS providers</text>

    <rect x="588" y="460" width="140" height="44" rx="10" fill="#dbeafe"/>
    <text x="658" y="490" fill="#1d4ed8" text-anchor="middle">OIDC / SSO</text>
  </g>

  <text x="80" y="580" font-family="${FONT}" font-size="20" font-weight="500" fill="#64748b">certmate.org - github.com/fabriziosalmi/certmate</text>
</svg>`;

  return sharp(Buffer.from(svg))
    .composite([{ input: logo, top: 56, left: 80 }])
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();
}

const SITE = 'https://www.certmate.org';
const logo = await sharp(LOGO).resize(112, 112).png().toBuffer();

// url -> {file, title}, keyed by the card each page asked for. Two pages may
// legitimately share a card only if they are the same page under two paths;
// anything else is a collision in the naming rule and stops the build, because
// the second page would silently get the first one's headline.
const wanted = new Map();
for (const file of walk(DIST)) {
  const html = readFileSync(file, 'utf8');
  const og = attribute(html, /<meta\s+property="og:image"\s+content="([^"]+)"/);
  const url = '/' + relative(DIST, file).split('\\').join('/').replace(/index\.html$/, '');
  if (!og) throw new Error(`build-og: ${url} declares no og:image`);
  if (!og.startsWith(SITE)) continue; // an off-site card is somebody else's to draw
  const target = og.slice(SITE.length);
  const title = decode((html.match(/<title>([\s\S]*?)<\/title>/) || [, ''])[1]).trim();
  if (!title) throw new Error(`build-og: ${url} has no <title> to put on its card`);
  const existing = wanted.get(target);
  if (existing && existing.title !== title) {
    throw new Error(`build-og: ${url} and ${existing.url} both want ${target} with different titles`);
  }
  wanted.set(target, { url, title });
}

let drawn = 0;
for (const [target, { url, title }] of [...wanted].sort()) {
  const out = join(DIST, target.replace(/^\//, ''));
  mkdirSync(dirname(out), { recursive: true });
  // Written as returned: piping the buffer back through sharp would re-encode
  // it with the default settings and drop the palette, which cost 1.8 MB
  // across the forty cards the first time this was measured.
  writeFileSync(out, await card(title, eyebrow(url), logo));
  drawn += 1;
}

console.log(`Wrote ${drawn} social cards (1200x630) into ${relative(root, DIST)}`);
