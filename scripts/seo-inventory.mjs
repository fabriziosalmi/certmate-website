#!/usr/bin/env node
// Inventory of every page this site publishes, read from dist/ rather than
// from the sources that produce it.
//
// Reading the sources would describe the site somebody meant to build. A
// crawler sees the built HTML, so that is what this measures: the <head> a
// page actually carries, the structured data actually emitted, and the text
// actually present once script, style and chrome are removed.
//
// Deterministic on purpose: rows are sorted, object keys are ordered, and the
// "last changed" column comes from git rather than from filesystem mtimes,
// which a fresh checkout rewrites. Running it twice must produce byte
// identical output, which is what tests/inventory-is-deterministic asserts.
//
// Usage: node scripts/seo-inventory.mjs [--out seo/inventory.json]

import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { load } from 'cheerio';

const DIST = 'dist';
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

// The built file back to the thing a person edits. Ordered by specificity:
// the first candidate that exists in git wins.
function sourceCandidates(url) {
  const clean = url.replace(/^\/|\/$/g, '');
  const segments = clean ? clean.split('/') : [];
  const out = [];
  if (url.startsWith('/docs/')) {
    out.push(join('public', clean || 'docs/index.html'));
    if (!clean.endsWith('.html')) out.push(join('public', clean, 'index.html'));
    return out;
  }
  // A content collection route: /errors/<slug>/ and /it/errors/<slug>/.
  const localed = segments[0] === 'it' ? segments.slice(1) : segments;
  const locale = segments[0] === 'it' ? 'it' : 'en';
  if (localed.length === 2) {
    for (const ext of ['mdx', 'md']) {
      out.push(join('src/content', localed[0], locale, `${localed[1]}.${ext}`));
    }
  }
  // A plain page route.
  out.push(join('src/pages', clean || 'index', 'index.astro'));
  out.push(join('src/pages', `${clean || 'index'}.astro`));
  out.push(join('src/pages', clean, 'index.astro'));
  return out;
}

let tracked = null;
function isTracked(path) {
  if (tracked === null) {
    tracked = new Set(
      execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split('\n').filter(Boolean),
    );
  }
  return tracked.has(path.split('\\').join('/'));
}

function lastChanged(path) {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', path], { encoding: 'utf8' }).trim();
    return out || null;
  } catch {
    return null;
  }
}

function inventory() {
  return walk(DIST).map((file) => {
    const html = readFileSync(file, 'utf8');
    const $ = load(html);
    const url = '/' + relative(DIST, file).split('\\').join('/').replace(/index\.html$/, '');

    const types = [];
    for (const el of $('script[type="application/ld+json"]').toArray()) {
      try {
        const parsed = JSON.parse($(el).text());
        for (const node of Array.isArray(parsed) ? parsed : [parsed]) {
          if (node && node['@type']) types.push(node['@type']);
        }
      } catch {
        types.push('UNPARSEABLE');
      }
    }

    const meta = (name) =>
      $(`meta[name="${name}"]`).attr('content') || $(`meta[property="${name}"]`).attr('content') || null;
    // Which attribute carries the card tags matters: the X documentation
    // specifies name=, and property= is an Open Graph spelling.
    const twitterAttr = $('meta[name="twitter:card"]').length
      ? 'name'
      : $('meta[property="twitter:card"]').length
        ? 'property'
        : null;

    const $text = load(html);
    $text('script, style, noscript, nav, footer, svg').remove();
    const words = ($text('body').text().match(/\S+/g) || []).length;

    const source = sourceCandidates(url).find(isTracked) || null;

    return {
      url,
      builtFrom: relative(DIST, file).split('\\').join('/'),
      source,
      sourceLastChanged: source ? lastChanged(source) : null,
      title: $('title').first().text().trim() || null,
      description: meta('description'),
      canonical: $('link[rel="canonical"]').attr('href') || null,
      ogImage: meta('og:image'),
      twitterCard: meta('twitter:card'),
      twitterCardAttribute: twitterAttr,
      hreflang: $('link[rel="alternate"][hreflang]')
        .toArray()
        .map((el) => $(el).attr('hreflang'))
        .sort(),
      keywords: meta('keywords'),
      jsonLdTypes: types.sort(),
      words,
    };
  }).sort((a, b) => a.url.localeCompare(b.url));
}

const outIndex = process.argv.indexOf('--out');
const out = outIndex === -1 ? 'seo/inventory.json' : process.argv[outIndex + 1];
const rows = inventory();
writeFileSync(out, JSON.stringify(rows, null, 2) + '\n');
console.log(`${rows.length} pages -> ${out}`);
