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

if (problems.length) {
  console.error('\nFact check failed:\n');
  for (const p of problems) console.error('  ' + p);
  console.error(
    `\n${problems.length} problem(s). See scripts/check-facts.mjs for why this gate exists.\n`
  );
  process.exit(1);
}

console.log(`Fact check passed (PROVIDER_COUNT=${declared}, ${rendered} cards rendered).`);
