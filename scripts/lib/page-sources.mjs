// Which files a published URL is built from.
//
// Two things need this answer and must not disagree about it: the sitemap,
// which dates every URL with <lastmod>, and the inventory, which reports what
// each page was built from. When the mapping lived in the inventory alone it
// went stale silently: moving the documentation out of public/ left every
// documentation row with source: null and nobody noticed, because a null
// column still prints.
//
// "Built from" here means the files that carry the page's own content and its
// head metadata, not every file it transitively imports. A layout edit touches
// all forty pages; dating all forty from it would make <lastmod> the date of
// the last commit to the repository, which is the same useless signal as
// stamping now(). The cost of the narrower rule is stated where it bites:
// a section index does not change date when an entry is added to the section.

import { execFileSync } from 'node:child_process';

const COLLECTIONS = new Set(['errors', 'deploy']);

/**
 * Repo-relative candidate sources for a site path, most specific first.
 * The caller keeps the ones git actually tracks.
 */
export function sourceCandidates(url) {
  const clean = url.replace(/^\/+|\/+$/g, '');
  const segments = clean ? clean.split('/') : [];

  // The documentation is built by src/pages/docs/[slug].html.ts from the
  // bodies in src/docs plus the titles and descriptions in src/data/docs.ts,
  // so a change to either one changes the page.
  if (segments[0] === 'docs') {
    const slug = segments[1] ? segments[1].replace(/\.html$/, '') : 'index';
    return [`src/docs/${slug}.html`, 'src/data/docs.ts'];
  }

  const locale = segments[0] === 'it' ? 'it' : 'en';
  const local = segments[0] === 'it' ? segments.slice(1) : segments;

  // A content collection entry: /errors/<slug>/ and /it/deploy/<slug>/.
  if (local.length === 2 && COLLECTIONS.has(local[0])) {
    return ['mdx', 'md'].map((ext) => `src/content/${local[0]}/${locale}/${local[1]}.${ext}`);
  }

  // A page route.
  const route = clean || 'index';
  return [`src/pages/${route}.astro`, `src/pages/${route}/index.astro`];
}

let tracked = null;

/** The set of files git tracks, read once. */
export function trackedFiles() {
  if (tracked === null) {
    tracked = new Set(
      execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split('\n').filter(Boolean),
    );
  }
  return tracked;
}

/** The tracked sources for a URL, in candidate order. Empty when none match. */
export function sourcesFor(url) {
  const files = trackedFiles();
  return sourceCandidates(url).filter((path) => files.has(path));
}

/**
 * True when this checkout cannot answer "when did this file last change".
 *
 * A shallow clone has one commit, so git log returns that commit's date for
 * every file: every page would claim the same modification date, which is
 * exactly the lie <lastmod> is supposed not to tell. Callers stop rather than
 * publish it. GitHub's checkout action is shallow by default, so this is the
 * normal state of a CI checkout, not a corner case.
 */
export function isShallowCheckout() {
  try {
    return execFileSync('git', ['rev-parse', '--is-shallow-repository'], { encoding: 'utf8' }).trim() === 'true';
  } catch {
    return true;
  }
}

const dates = new Map();

/** Committer date of the last commit touching a file, ISO 8601, or null. */
export function lastCommitDate(path) {
  if (!dates.has(path)) {
    let value = null;
    try {
      value = execFileSync('git', ['log', '-1', '--format=%cI', '--', path], { encoding: 'utf8' }).trim() || null;
    } catch {
      value = null;
    }
    dates.set(path, value);
  }
  return dates.get(path);
}

/** The most recent commit date across a URL's sources, or null. */
export function lastModifiedFor(url) {
  const stamps = sourcesFor(url).map(lastCommitDate).filter(Boolean).sort();
  return stamps.length ? stamps[stamps.length - 1] : null;
}
