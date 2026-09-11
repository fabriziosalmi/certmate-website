/**
 * The head gate, read from dist/ after the build.
 *
 * Every defect asserted here was present on 0540ca2 and is recorded in
 * seo/findings.md with the command that measured it. The point of the gate is
 * that each one can only come back through a failing build.
 *
 * It reads the built output rather than the sources. A test that reads
 * src/layouts/BaseLayout.astro proves the layout intends to emit a canonical;
 * only dist/ says whether the ten pages that never went through a layout have
 * one. That difference is the whole reason this file exists.
 *
 * Run: npm run build (via postbuild), or node scripts/check-seo.mjs
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { load } from 'cheerio';
// The same URL-to-source mapping the sitemap dates pages with.
import { lastModifiedFor } from './lib/page-sources.mjs';

const DIST = 'dist';
const SKIP_DIRS = new Set(['pagefind', '_astro', 'assets', 'vendor']);
const problems = [];
const SITE = 'https://www.certmate.org';
// og:image -> the page that claimed it, so a card shared by two pages is named.
const ogImages = new Map();

if (!existsSync(DIST)) {
  console.error('dist/ does not exist. Run `astro build` first.');
  process.exit(1);
}

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) out.push(...walk(path));
    } else if (entry.name.endsWith('.html')) out.push(path);
  }
  return out;
}

const files = walk(DIST).sort();
if (files.length < 30) {
  problems.push(
    `only ${files.length} built pages found; this gate passes vacuously on an ` +
      `empty or partial build, so that is a failure rather than a pass`,
  );
}

const sitemapPath = join(DIST, 'sitemap-0.xml');
const sitemapLocs = new Set(
  existsSync(sitemapPath)
    ? [...readFileSync(sitemapPath, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
    : [],
);
if (sitemapLocs.size === 0) problems.push('the sitemap has no <loc> entries');

// Every URL whose source git knows about carries that source's date, and the
// dates are not all the same one.
//
// The expectation is the mapping in scripts/lib/page-sources.mjs rather than
// "all of them": a page created and not yet committed has no history, and
// failing the build on it would stop anyone building a page they are still
// writing. What this catches is the case that matters, a route shape the
// mapping does not know about, which is how the documentation rows silently
// lost their source once already.
//
// Identical dates across the whole sitemap mean the dates came from the clock
// or from a shallow checkout rather than from each page's own history. Google
// reads lastmod only while it stays consistent with the page, so a uniform
// date is worse than none.
if (existsSync(sitemapPath)) {
  const sitemapXml = readFileSync(sitemapPath, 'utf8');
  for (const [, entry] of sitemapXml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = (entry.match(/<loc>([^<]+)<\/loc>/) || [])[1];
    if (!loc) continue;
    const dated = /<lastmod>/.test(entry);
    const known = lastModifiedFor(loc.startsWith(SITE) ? loc.slice(SITE.length) : loc) !== null;
    if (known && !dated) {
      problems.push(`${loc} has no <lastmod> although git knows when its source changed`);
    }
    if (!known && dated) {
      problems.push(`${loc} has a <lastmod> but no committed source it could come from`);
    }
  }
  const stamps = new Set([...sitemapXml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1]));
  if (sitemapLocs.size > 1 && stamps.size === 1) {
    problems.push(
      `every dated sitemap entry claims the same lastmod (${[...stamps][0]}), which means the date ` +
        'came from the clock or from a shallow checkout, not from the pages',
    );
  }
}

for (const file of files) {
  const rel = relative(DIST, file);
  const $ = load(readFileSync(file, 'utf8'));
  const at = (what) => `${rel}: ${what}`;

  const description = $('meta[name="description"]').attr('content');
  if (!description) problems.push(at('no meta description'));

  const canonical = $('link[rel="canonical"]').attr('href');
  if (!canonical) {
    problems.push(at('no rel=canonical'));
  } else {
    // The canonical and the sitemap must name the same URL for the same page.
    // Google: "Don't specify different URLs as canonical for the same page
    // using different canonicalization techniques".
    if (!sitemapLocs.has(canonical)) {
      problems.push(at(`canonical ${canonical} is not a <loc> in the sitemap`));
    }
    // /foo 301s to /foo/ on GitHub Pages, so a canonical without the slash
    // points at a redirect. Paths ending in a file extension are files.
    const last = canonical.slice(canonical.lastIndexOf('/') + 1);
    if (!canonical.endsWith('/') && !last.includes('.')) {
      problems.push(at(`canonical ${canonical} has no trailing slash and will redirect`));
    }
  }

  const ogImage = $('meta[property="og:image"]').attr('content') || $('meta[name="og:image"]').attr('content');
  if (!ogImage) {
    problems.push(at('no og:image'));
  } else if (ogImage.startsWith(SITE)) {
    // The card a page asks for has to be in the build. scripts/build-og.mjs
    // draws exactly what the pages declare, so a page whose card is missing
    // means the generator did not run and the deploy would ship a social
    // preview that 404s. The tag is present either way, so only the output
    // shows it.
    const card = join(DIST, ogImage.slice(SITE.length).replace(/^\//, ''));
    if (!existsSync(card)) problems.push(at(`og:image ${ogImage} is not in the build`));
    const claimed = ogImages.get(ogImage);
    if (claimed) problems.push(at(`og:image is shared with ${claimed}; each page has its own card`));
    else ogImages.set(ogImage, relative(DIST, file));
  }

  // The card tags are documented with name=; property= is the Open Graph
  // spelling and is a fallback parsers may or may not honour.
  if ($('meta[property="twitter:card"]').length && !$('meta[name="twitter:card"]').length) {
    problems.push(at('twitter:card uses property= instead of name='));
  }

  if ($('meta[name="keywords"]').length) {
    problems.push(at('meta keywords is back; no search engine has used it in over a decade'));
  }

  // An hreflang annotation that is not reciprocated is ignored by Google, and
  // one pointing at a redirect is a URL it has to resolve for you.
  for (const el of $('link[rel="alternate"][hreflang]').toArray()) {
    const href = $(el).attr('href') || '';
    const tail = href.slice(href.lastIndexOf('/') + 1);
    if (!href.endsWith('/') && !tail.includes('.')) {
      problems.push(at(`hreflang ${$(el).attr('hreflang')} points at ${href}, which redirects`));
    }
  }

  // Every media file a page points at must be in the build.
  //
  // The content schema also checks this, and on its own it is not enough:
  // Astro caches collection validation, so deleting a video without touching
  // the page that declares it re-uses the cached entry and the schema never
  // runs. Measured, not assumed -- the first version of scripts/check-media.mjs
  // removed a poster and the build passed. This check reads the output, so it
  // cannot be skipped by a cache.
  const referenced = new Set();
  for (const el of $('video source, track, img, a[download]').toArray()) {
    const value = $(el).attr('src') || $(el).attr('href') || '';
    if (value.startsWith('/media/')) referenced.add(value);
  }
  for (const el of $('video[poster]').toArray()) {
    const value = $(el).attr('poster') || '';
    if (value.startsWith('/media/')) referenced.add(value);
  }
  for (const value of referenced) {
    if (!existsSync(join(DIST, value))) {
      problems.push(at(`references ${value}, which is not in the build`));
    }
  }

  for (const el of $('script[type="application/ld+json"]').toArray()) {
    try {
      JSON.parse($(el).text());
    } catch (error) {
      problems.push(at(`structured data does not parse: ${error.message}`));
    }
  }
}

if (problems.length) {
  console.error('\nSEO gate failed:\n');
  for (const problem of problems) console.error('  ' + problem);
  console.error(`\n${problems.length} problem(s). See seo/findings.md for what each one costs.\n`);
  process.exit(1);
}

console.log(`SEO gate passed (${files.length} built pages checked).`);
