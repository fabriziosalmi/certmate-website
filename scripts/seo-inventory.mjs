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

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { load } from 'cheerio';
// Shared with the sitemap so the two cannot disagree about what a page is
// built from. This mapping used to live here alone, and when the documentation
// moved out of public/ it kept pointing at the old directory: every
// documentation row reported source: null and the run still looked healthy.
import { lastCommitDate, sourcesFor } from './lib/page-sources.mjs';

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

    // Several files can hold one page (a documentation body plus the table
    // that titles it); the first is reported and the newest date wins.
    const sources = sourcesFor(url);
    const source = sources[0] || null;
    const changed = sources.map(lastCommitDate).filter(Boolean).sort();

    return {
      url,
      builtFrom: relative(DIST, file).split('\\').join('/'),
      source,
      sourceLastChanged: changed.length ? changed[changed.length - 1] : null,
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
