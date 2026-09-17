/**
 * Fact gate for the site's prose.
 *
 * `src/data/site.ts` exists to be the single source of truth for the handful
 * of numbers that appear in more than one place — it says so in its own
 * docstring, and it was written after the site had advertised three different
 * versions in three files and disagreed with itself 24 vs 27 on the provider
 * count.
 *
 * A single source of truth that nothing enforces is a comment. This is the
 * enforcement: any page that states a provider count has to get it from
 * site.ts rather than typing a digit. When it was added, the Italian landing
 * page said "oltre 25 provider DNS" and both AWS deploy guides said "23 other
 * DNS providers", against a declared PROVIDER_COUNT of 27 — so the page that
 * a whole language's readers land on was the one that was wrong.
 *
 * Run: npm run check
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// fileURLToPath, not `.pathname`: the latter leaves percent-encoding in place
// (a checkout under a path with a space becomes `%20`) and yields a leading
// slash before the drive letter on Windows. Either way `join()` then builds a
// path that does not exist, and the script fails for a reason that has nothing
// to do with the facts it is checking.
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SRC = join(ROOT, 'src');
const SOURCE_OF_TRUTH = join(SRC, 'data', 'site.ts');

/** A digit adjacent to the word "provider", in any of the site's languages. */
const HARDCODED_COUNT =
  /\b\d{1,3}\+?\s*(?:altri\s+|other\s+|weitere\s+|otros\s+|autres\s+)?(?:DNS[- ]?)?(?:providers?|fornitori|proveedores?|Anbieter|fournisseurs?)\b/gi;

const EXTENSIONS = ['.astro', '.mdx', '.md', '.ts', '.tsx'];

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (EXTENSIONS.some((e) => full.endsWith(e))) out.push(full);
  }
  return out;
}

const problems = [];

for (const file of walk(SRC)) {
  // site.ts is where the number is allowed to be a literal — that is its job.
  if (file === SOURCE_OF_TRUTH) continue;

  const text = readFileSync(file, 'utf8');
  const lines = text.split('\n');

  lines.forEach((line, i) => {
    // A line that interpolates the constant is correct however it reads.
    if (line.includes('PROVIDER_COUNT')) return;
    // Ignore comments: they discuss the problem rather than commit it.
    const stripped = line.trim();
    if (stripped.startsWith('*') || stripped.startsWith('//') || stripped.startsWith('<!--')) return;

    const match = line.match(HARDCODED_COUNT);
    if (match) {
      problems.push(
        `${relative(ROOT, file)}:${i + 1}  "${match[0].trim()}" — ` +
          `use \`import { PROVIDER_COUNT } from '~/data/site'\`, or drop the number.`
      );
    }
  });
}

// The declared count must not overstate what the page actually renders: the
// docstring in site.ts promises it is the number of provider cards on the
// page, which is what makes it verifiable by a reader.
const siteText = readFileSync(SOURCE_OF_TRUTH, 'utf8');
const declared = Number(siteText.match(/PROVIDER_COUNT\s*=\s*(\d+)/)?.[1]);
const gridText = readFileSync(join(SRC, 'components', 'DnsProviders.astro'), 'utf8');
const rendered = (gridText.match(/name:\s*['"]/g) || []).length;

// Losing sight of either number is a failure, not a pass. Guarding the
// comparison with `Number.isFinite(declared) && rendered > 0` meant that
// renaming the constant, or restyling the provider grid so the cards stop
// matching, would make this check quietly stop checking while still printing
// "Fact check passed" — the exact failure mode this file was written to end.
if (!Number.isFinite(declared)) {
  problems.push(
    `src/data/site.ts  could not read PROVIDER_COUNT. If it was renamed or ` +
      `made dynamic, update this script — it cannot enforce what it cannot find.`
  );
}
if (rendered === 0) {
  problems.push(
    `src/components/DnsProviders.astro  no provider cards matched. The grid's ` +
      `shape changed; update the pattern here rather than leaving the count ` +
      `unverified.`
  );
}
if (Number.isFinite(declared) && rendered > 0 && declared > rendered) {
  problems.push(
    `src/data/site.ts  PROVIDER_COUNT is ${declared} but DnsProviders.astro ` +
      `renders ${rendered} cards. site.ts promises the count is what the page ` +
      `shows, so it must never be higher.`
  );
}

// Markdown in a field that is rendered as text.
//
// UpdateRow.astro prints `{u.description}`, and Astro escapes an expression
// rather than parsing it, so `**like this**` reaches the reader as asterisks.
// It did: certmate.org carried 20 literal `**` on its home page, ten emphasis
// pairs written across four What's New cards, from the day they were written
// until this check was added. Nothing was broken enough to notice, which is
// the whole problem with prose defects.
//
// The fix is to write the prose without the syntax, not to start parsing
// markdown here: these strings are authored in this repository and read by
// people, and a renderer would be a dependency and an escaping decision taken
// on for formatting nobody asked for.
// The documentation pages have to name what the grid names.
//
// This gate already pinned PROVIDER_COUNT to the provider grid, and its own
// docstring gives EfficientIP SOLIDserver as the example of what happens when
// a page a visitor scans to answer "do you support X?" falls behind. It then
// checked the home page and never the page called "DNS Providers": that page
// named 24 of the 29 providers in the grid, and the five it omitted were
// DuckDNS, deSEC, Scaleway, Akamai EdgeDNS and EfficientIP SOLIDserver. The
// same example, on a different page, for months.
//
// Names are matched loosely on purpose: the full name, or its longest word,
// anywhere in the page's text. A stricter match would fail on "Akamai EdgeDNS"
// being written as "EdgeDNS" in a sentence, and this is a check for absence,
// not for phrasing.
function pageText(relativePath) {
  return readFileSync(join(ROOT, relativePath), 'utf8')
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .toLowerCase();
}

function namesAbsentFrom(relativePath, names) {
  const text = pageText(relativePath);
  return names.filter((name) => {
    if (text.includes(name.toLowerCase())) return false;
    const longest = name.split(/\s+/).sort((a, b) => b.length - a.length)[0];
    return !text.includes(longest.toLowerCase());
  });
}

const gridNames = [...gridText.matchAll(/name:\s*'([^']+)'/g)].map((m) => m[1]);
const absentProviders = namesAbsentFrom('src/docs/dns-providers.html', gridNames);
if (gridNames.length === 0) {
  problems.push(
    'src/components/DnsProviders.astro  no provider names matched, so the ' +
      'documentation page cannot be checked against them.'
  );
} else if (absentProviders.length) {
  problems.push(
    `src/docs/dns-providers.html  does not name ${absentProviders.length} of ` +
      `the ${gridNames.length} providers the grid lists: ` +
      `${absentProviders.join(', ')}. That page is what a visitor reads to ` +
      `find out whether their provider is supported.`
  );
}

// The same question for storage backends. STORAGE_BACKEND_COUNT sat in
// site.ts declaring 6 and was read by nothing, while the storage page listed
// 5: the site said six in the comparison table and in the docs card, and five
// on the page about storage.
const STORAGE_BACKENDS = [
  'Local Filesystem',
  'Azure Key Vault',
  'AWS Secrets Manager',
  'HashiCorp Vault',
  'Infisical',
  'S3-compatible',
];
const declaredBackends = Number(siteText.match(/STORAGE_BACKEND_COUNT\s*=\s*(\d+)/)?.[1]);
if (declaredBackends !== STORAGE_BACKENDS.length) {
  problems.push(
    `src/data/site.ts  STORAGE_BACKEND_COUNT is ${declaredBackends} but ` +
      `check-facts.mjs knows ${STORAGE_BACKENDS.length} backends. One of the ` +
      `two is behind the app; scripts/check-against-app.mjs pins this list to ` +
      `modules/core/storage_backends.py.`
  );
}
const absentBackends = namesAbsentFrom('src/docs/storage-backends.html', STORAGE_BACKENDS);
if (absentBackends.length) {
  problems.push(
    `src/docs/storage-backends.html  does not name ${absentBackends.length} ` +
      `of the ${STORAGE_BACKENDS.length} storage backends: ` +
      `${absentBackends.join(', ')}.`
  );
}

// Prose files whose fields are printed as text rather than parsed.
const PLAIN_TEXT_PROSE = ['src/data/whats-new.ts'];
for (const relativePath of PLAIN_TEXT_PROSE) {
  const text = readFileSync(join(ROOT, relativePath), 'utf8');
  text.split('\n').forEach((line, index) => {
    if (/\*\*[^*]+\*\*/.test(line)) {
      problems.push(
        `${relativePath}:${index + 1}  markdown emphasis in a field rendered as ` +
          `plain text. UpdateRow.astro prints it with {u.description}, so the ` +
          `reader sees the asterisks. Write it without the syntax.`
      );
    }
  });
}

// --- the two locales carry the same keys ---------------------------------
//
// Localising the footer added 23 strings to each of `ui.en` and `ui.it`, and
// the English block landed one line too low: outside the `en` object, as a
// top-level property of `ui`. That is valid JavaScript, so `astro check`
// passed, the build passed and the SEO gate passed, while every English page
// rendered a footer with the colophon missing. Only reading the built page
// found it.
//
// A key present in one locale and absent from the other is either a
// translation nobody wrote or a key in the wrong place, and both render as
// nothing at all.
{
  const source = readFileSync(join(SRC, 'i18n.ts'), 'utf8');
  const body = source.slice(source.indexOf('export const ui'));
  const locales = {};
  for (const match of body.matchAll(/^  ([a-z]{2}): \{$/gm)) {
    const from = match.index + match[0].length;
    const to = body.indexOf('\n  },', from);
    locales[match[1]] = body.slice(from, to);
  }
  const names = Object.keys(locales);
  if (names.length < 2) {
    problems.push(
      `src/data i18n: found ${names.length} locale block(s) in i18n.ts; the `
        + `comparison below would pass by having nothing to compare`,
    );
  }
  const keysOf = (text) =>
    new Set([...text.matchAll(/^    ([A-Za-z][A-Za-z0-9]*):/gm)].map((m) => m[1]));
  const [first, ...rest] = names;
  for (const other of rest) {
    const a = keysOf(locales[first]);
    const b = keysOf(locales[other]);
    for (const key of a) {
      if (!b.has(key)) problems.push(`i18n: ui.${other} has no "${key}", which ui.${first} does`);
    }
    for (const key of b) {
      if (!a.has(key)) problems.push(`i18n: ui.${first} has no "${key}", which ui.${other} does`);
    }
  }
}

if (problems.length) {
  console.error('\nFact check failed:\n');
  for (const p of problems) console.error('  ' + p);
  console.error(
    `\n${problems.length} problem(s). See scripts/check-facts.mjs for why this gate exists.\n`
  );
  process.exit(1);
}

console.log(`Fact check passed (PROVIDER_COUNT=${declared}, ${rendered} cards rendered).`);
