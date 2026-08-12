/**
 * Compare the site's facts with the application they describe.
 *
 * `check-facts.mjs` enforces that every page takes the provider count from
 * `site.ts` rather than typing a digit. It works, and it passed throughout the
 * period when the grid rendered 27 cards while the app supported 29 — because
 * it asks whether the site agrees with itself, and nothing asked whether it
 * agreed with CertMate.
 *
 * `site.ts` even wrote the licence for that down: "the number understates
 * rather than overstates, which is safe and verifiable". Safe, perhaps, but it
 * is how two providers — EfficientIP SOLIDserver and Custom Script — went
 * unlisted for months on the page a visitor scans to answer "do you support
 * X?".
 *
 * So this fetches the app's own list and compares. It needs the network, runs
 * weekly rather than on every build, and is deliberately not part of the
 * deploy gate: GitHub being unreachable must never stop the site shipping. A
 * finding here is news.
 *
 *   node scripts/check-against-app.mjs
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SITE_TS = join(ROOT, 'src', 'data', 'site.ts');

const RAW = 'https://raw.githubusercontent.com/fabriziosalmi/certmate/main';
const RELEASES = 'https://api.github.com/repos/fabriziosalmi/certmate/releases/latest';

/** The provider set the app validates against — its own authority on the list. */
const PROVIDERS_RE = /supported_providers\s*=\s*\{([^}]+)\}/s;

function fromSiteTs(name) {
  const text = readFileSync(SITE_TS, 'utf8');
  const match = text.match(new RegExp(`export const ${name} = '?([^';]+)'?;`));
  if (!match) {
    throw new Error(`site.ts no longer exports ${name} — this check has lost its subject`);
  }
  return match[1].trim();
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { 'user-agent': 'certmate-website-fact-check' },
  });
  if (!response.ok) {
    throw new Error(`${url} returned HTTP ${response.status}`);
  }
  return response.text();
}

const findings = [];

// --- provider count -------------------------------------------------------
const settings = await fetchText(`${RAW}/modules/core/settings.py`);
const providerBlock = settings.match(PROVIDERS_RE);
if (!providerBlock) {
  throw new Error(
    'could not find supported_providers in the app\'s settings.py. The shape ' +
    'changed; fix this script rather than letting it report success.',
  );
}
const appProviders = [...providerBlock[1].matchAll(/'([a-z0-9-]+)'/g)].map((m) => m[1]);
if (appProviders.length < 20) {
  throw new Error(`parsed only ${appProviders.length} providers — the regex is not matching`);
}

const declared = Number(fromSiteTs('PROVIDER_COUNT'));
if (declared !== appProviders.length) {
  findings.push(
    `PROVIDER_COUNT is ${declared}; the app supports ${appProviders.length}. ` +
    'Equal, not "at most" — understating is how EfficientIP SOLIDserver and ' +
    'Custom Script went unlisted.',
  );
}

// --- version --------------------------------------------------------------
try {
  const release = JSON.parse(await fetchText(RELEASES));
  const latest = String(release.tag_name || '').replace(/^v/, '');
  const shown = fromSiteTs('VERSION');
  if (latest && latest !== shown) {
    findings.push(`VERSION is ${shown}; the latest published release is ${latest}.`);
  }
} catch (error) {
  // The releases API is rate-limited for anonymous callers. A version we
  // cannot read is not a version we know to be wrong.
  console.log(`note: could not read the latest release (${error.message})`);
}

console.log(`checked the site against the app (${appProviders.length} providers upstream)`);
if (findings.length === 0) {
  console.log('no drift');
  process.exit(0);
}
for (const finding of findings) console.log(`  ${finding}`);
process.exit(1);
