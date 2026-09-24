/**
 * Re-derive src/data/error-codes.json from upstream and diff it.
 *
 * The offline gate (check-error-codes.mjs) can only ask "is this code in the
 * table". This asks the question the table exists to answer: "is the table
 * still what the source says". It downloads Chromium's error list, the two
 * Mozilla files and the client sources (OpenSSL, CPython, Node.js, Go, the
 * JDK), looks up every entry, and fails on any symbol that has vanished or
 * whose user-visible message has been reworded.
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

/**
 * Clients other than browsers. The key is an entry's `source`; the entry's
 * `evidence` must be one whole line of that file (trimmed), the line must
 * contain the entry's `code`, and the entry's `symbol` must sit on that line
 * or within the three lines above it, so the message is tied to the constant
 * the table says produces it.
 */
const CLIENT_SOURCES = {
  'openssl/crypto/x509/x509_txt.c':
    'https://raw.githubusercontent.com/openssl/openssl/master/crypto/x509/x509_txt.c',
  'cpython/Modules/_ssl_data_300.h':
    'https://raw.githubusercontent.com/python/cpython/main/Modules/_ssl_data_300.h',
  'node/deps/ncrypto/ncrypto.cc':
    'https://raw.githubusercontent.com/nodejs/node/main/deps/ncrypto/ncrypto.cc',
  'go/src/crypto/x509/verify.go':
    'https://raw.githubusercontent.com/golang/go/master/src/crypto/x509/verify.go',
  'jdk/src/java.base/share/classes/sun/security/validator/PKIXValidator.java':
    'https://raw.githubusercontent.com/openjdk/jdk/master/src/java.base/share/classes/sun/security/validator/PKIXValidator.java',
};

/**
 * The OpenSSL entries say curl, Python, Node.js and s_client print these
 * messages. That is only true while each of them passes the verify result
 * through X509_verify_cert_error_string(), so each relay line is checked too.
 */
const RELAYS = {
  'openssl/crypto/x509/x509_txt.c': [
    {
      who: 'curl',
      url: 'https://raw.githubusercontent.com/curl/curl/master/lib/vtls/openssl.c',
      line: 'failf(data, "SSL certificate problem: %s",',
    },
    {
      who: 'Python ssl',
      url: 'https://raw.githubusercontent.com/python/cpython/main/Modules/_ssl.c',
      line: 'verify_str = X509_verify_cert_error_string(verify_code);',
    },
    {
      who: 'Node.js tls',
      url: 'https://raw.githubusercontent.com/nodejs/node/main/deps/ncrypto/ncrypto.cc',
      line: 'return X509_verify_cert_error_string(err);',
    },
    {
      who: 'openssl s_client',
      url: 'https://raw.githubusercontent.com/openssl/openssl/master/apps/lib/s_cb.c',
      line: 'BIO_printf(bio_err, "verify error:num=%d:%s\\n", err,',
    },
  ],
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

// Every client file an entry names, plus every relay file, fetched once.
const clientUrls = new Set();
for (const entry of verified) {
  if (entry.source in CLIENT_SOURCES) {
    clientUrls.add(CLIENT_SOURCES[entry.source]);
    for (const relay of RELAYS[entry.source] ?? []) clientUrls.add(relay.url);
  }
}
const clientText = new Map(
  await Promise.all([...clientUrls].map(async (url) => [url, await fetchText(url)])),
);
const linesOf = (url) => clientText.get(url).split('\n').map((l) => l.trim());

const relaysChecked = new Set();
for (const [source, relays] of Object.entries(RELAYS)) {
  if (!verified.some((e) => e.source === source)) continue;
  for (const relay of relays) {
    if (relaysChecked.has(relay.url + relay.line)) continue;
    relaysChecked.add(relay.url + relay.line);
    if (!linesOf(relay.url).includes(relay.line)) {
      problems.push(`${source}: ${relay.who} no longer prints the OpenSSL message the same way (${relay.url} lacks "${relay.line}")`);
    }
  }
}

for (const entry of verified) {
  const { symbol } = entry;
  if (entry.source in CLIENT_SOURCES) {
    const lines = linesOf(CLIENT_SOURCES[entry.source]);
    const at = lines.indexOf(entry.evidence);
    if (at === -1) {
      problems.push(`${entry.code}: the line "${entry.evidence}" is no longer in ${entry.source}`);
    } else {
      if (!entry.evidence.includes(entry.code)) {
        problems.push(`${entry.code}: the evidence line does not contain the code itself`);
      }
      const window = lines.slice(Math.max(0, at - 3), at + 1).join('\n');
      const bare = symbol.replace(/^X509_V_ERR_/, '');
      if (!window.includes(symbol) && !window.includes(`CASE(${bare})`)) {
        problems.push(`${entry.code}: ${symbol} is no longer next to "${entry.evidence}" in ${entry.source}`);
      }
    }
    rewritten.push(entry);
    continue;
  }
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
