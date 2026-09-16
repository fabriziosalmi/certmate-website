/**
 * Re-derive src/data/error-codes.json from upstream and diff it.
 *
 * The offline gate (check-error-codes.mjs) can only ask "is this code in the
 * table". This asks the question the table exists to answer: "is the table
 * still what the source says". It downloads Chromium's error list and the two
 * Mozilla files, looks up every entry, and fails on any symbol that has
 * vanished or whose user-visible message has been reworded.
 *
 * Deliberately NOT part of `npm run build`. A build that reaches the network
 * fails for reasons that have nothing to do with the commit in front of it,
 * and an upstream rewording is not a reason to block a deploy. Run it when
 * adding a code, and on a schedule if this section grows.
 *
 * Run: npm run verify:error-codes
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const TABLE = join(ROOT, 'src', 'data', 'error-codes.json');

const SOURCES = {
  chromium: 'https://raw.githubusercontent.com/chromium/chromium/main/net/base/net_error_list.h',
  nssHeader: 'https://raw.githubusercontent.com/nss-dev/nss/master/lib/ssl/sslerr.h',
  firefoxStrings:
    'https://raw.githubusercontent.com/mozilla/gecko-dev/master/security/manager/locales/en-US/chrome/pipnss/nsserrors.properties',
};

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} answered ${response.status}`);
  const text = await response.text();
  // A redirect to an HTML error page is still a 200. A source file this small
  // is the sign that we downloaded something else entirely.
  if (text.length < 2000) throw new Error(`${url} returned ${text.length} bytes, which is not the file`);
  return text;
}

const [chromium, nssHeader, firefoxStrings] = await Promise.all([
  fetchText(SOURCES.chromium),
  fetchText(SOURCES.nssHeader),
  fetchText(SOURCES.firefoxStrings),
]);

const verified = JSON.parse(readFileSync(TABLE, 'utf8'));
const problems = [];
const rewritten = [];

for (const entry of verified) {
  const { symbol } = entry;
  if (entry.source.startsWith('chromium/')) {
    const short = symbol.replace(/^ERR_/, '');
    const line = chromium.split('\n').find((l) => l.startsWith(`NET_ERROR(${short},`))?.trim();
    if (!line) {
      problems.push(`${symbol}: no longer defined in Chromium's net_error_list.h`);
      rewritten.push(entry);
      continue;
    }
    if (line !== entry.evidence) {
      problems.push(`${symbol}: Chromium now says "${line}", the table says "${entry.evidence}"`);
    }
    rewritten.push({ ...entry, evidence: line });
    continue;
  }

  const propLine = firefoxStrings.split('\n').find((l) => l.startsWith(`${symbol}=`));
  if (!propLine) {
    problems.push(`${symbol}: no longer a user-visible string in Firefox`);
    rewritten.push(entry);
    continue;
  }
  const message = propLine.slice(symbol.length + 1).trim();
  if (!message) {
    problems.push(`${symbol}: present in Firefox's string table with an empty message`);
  } else if (message !== entry.evidence) {
    problems.push(`${symbol}: Firefox now says "${message}", the table says "${entry.evidence}"`);
  }
  if (symbol.startsWith('SSL_ERROR_') && !nssHeader.includes(symbol)) {
    problems.push(`${symbol}: absent from NSS lib/ssl/sslerr.h`);
  }
  rewritten.push({ ...entry, evidence: message || entry.evidence });
}

if (process.argv.includes('--write')) {
  writeFileSync(TABLE, JSON.stringify(rewritten, null, 2) + '\n');
  console.log(`Rewrote ${TABLE} from source.`);
}

if (problems.length) {
  console.error(`\nverify-error-codes: ${problems.length} entr(ies) no longer match upstream\n`);
  for (const p of problems) console.error(`  - ${p}`);
  console.error('\nRe-run with --write to adopt the current upstream text, after reading it.\n');
  process.exit(1);
}
console.log(`verify-error-codes: all ${verified.length} entries still match upstream`);
