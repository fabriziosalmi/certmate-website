/**
 * Every file in src/docs-md/ is still byte-identical to the one it came from.
 *
 * The site and the application each carried their own documentation for the
 * same topics, and the two drifted. Measured before this started: the site's
 * API page was 1,613 words against 10,129 in `docs/api.md`, six of the fifteen
 * shared topics were substantially richer upstream, and nine topics existed
 * only here — with nothing in the application to check them against.
 *
 * So a page is migrated by copying its Markdown here and letting
 * src/pages/docs/[slug].html.ts render it. A copy is only safe when it is
 * mechanical, and this is what keeps it mechanical: byte equality, in both
 * directions. It fails when the application moved on AND when somebody edited
 * the copy, because those look the same from here and are both wrong.
 *
 * Like check-against-app.mjs, it needs the network, runs weekly rather than on
 * every build, and is deliberately not part of the deploy gate: GitHub being
 * unreachable must never stop the site shipping. Drift is normally impossible
 * anyway — the copy arrives by pull request from the application's own CI —
 * and this is the backstop for the hand edit that bypasses it.
 *
 *   node scripts/check-docs-sync.mjs
 */
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const LOCAL = join(ROOT, 'src', 'docs-md');
const RAW = 'https://raw.githubusercontent.com/fabriziosalmi/certmate/main/docs';

/** README.md here explains the rule; it is not a synced page. */
const NOT_A_PAGE = new Set(['README.md']);

const sha = (buffer) => createHash('sha256').update(buffer).digest('hex');

const pages = readdirSync(LOCAL)
  .filter((name) => name.endsWith('.md') && !NOT_A_PAGE.has(name))
  .sort();

if (pages.length === 0) {
  throw new Error(
    'src/docs-md/ holds no pages. Either nothing has been migrated yet and ' +
    'this check has lost its subject, or the directory moved.',
  );
}

const findings = [];

for (const name of pages) {
  const mine = readFileSync(join(LOCAL, name));
  const url = `${RAW}/${name}`;

  const response = await fetch(url, {
    headers: { 'user-agent': 'certmate-website-docs-sync' },
  });

  if (response.status === 404) {
    findings.push(
      `${name} is published here and no longer exists at ${url}. It was ` +
      'renamed or removed upstream; a page that is gone upstream must not ' +
      'keep answering here as though it were current.',
    );
    continue;
  }
  if (!response.ok) {
    // A page we cannot read is not a page we know to have drifted. Say so and
    // fail, rather than reporting agreement we did not establish.
    throw new Error(`${url} returned HTTP ${response.status}`);
  }

  const theirs = Buffer.from(await response.arrayBuffer());
  if (sha(mine) !== sha(theirs)) {
    findings.push(
      `${name} differs from ${url}: ${mine.length} bytes here, ` +
      `${theirs.length} upstream. Copy the upstream file over this one — ` +
      'nothing in src/docs-md/ is edited here.',
    );
  }
}

console.log(`checked ${pages.length} synced page(s) against the application`);
if (findings.length === 0) {
  console.log('in sync');
  process.exit(0);
}
for (const finding of findings) console.log(`  ${finding}`);
process.exit(1);
