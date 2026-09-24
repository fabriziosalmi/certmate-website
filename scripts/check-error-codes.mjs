/**
 * Every error code this site publishes or cites has to exist.
 *
 * The section is worth writing because someone pastes a code into a search box
 * and lands here. That only works if the code is one their software actually
 * emitted. A page for a plausible-looking symbol no implementation produces is
 * worse than no page: it is a promise the reader's problem is addressed when
 * it is not, and it is the exact shape of content this project's own SEO
 * findings rule out.
 *
 * This is not hypothetical. The section was expanded from a working document
 * listing 88 SSL/TLS error codes. Checked against NSS and Chromium, 20 of the
 * 88 existed. The whole `TLS_ERROR_*` family (36 entries) is emitted by
 * nothing: they are the RFC 8446 alert descriptions with a prefix bolted on.
 * A further 32 were near-misses in a fabricated naming pattern:
 * `SSL_ERROR_RX_ALERT_UNKNOWN_CA` looks exactly like an NSS symbol, and the
 * real one is `SSL_ERROR_UNKNOWN_CA_ALERT`. Nothing about reading them tells
 * you which is which. Only the source does.
 *
 * So the table in src/data/error-codes.json is not a list someone typed. Every
 * entry carries the upstream file it came from and the line or user-visible
 * message copied out of it, and `npm run verify:error-codes` re-downloads
 * those sources and diffs them. This gate is the offline half: it refuses any
 * code on a page that is not in the table.
 *
 * The table covers clients as well as browsers: OpenSSL's messages (as curl,
 * Python and Node.js print them), Python's reason codes, Node.js `err.code`
 * values, Go's `x509: ...` errors and Java's PKIX failure. Their codes do not
 * share the browsers' naming, so each has its own recognisable shape below.
 *
 * Two further rules, both from defects this section already had:
 *
 * - A cited code must be in the table too, not just a page's own code. Before
 *   this gate ran, three pages sent readers to `SEC_ERROR_EXPIRED_CERTIFICATE`,
 *   `SSL_ERROR_BAD_CERT_DOMAIN` and `SSL_ERROR_NO_CYPHER_OVERLAP` as "related
 *   errors" and none of the three had a page. A citation is a promise as much
 *   as a heading is.
 *
 * - Every page exists in both languages. An English-only page silently drops
 *   its hreflang pair, and the Italian index goes quiet about an error the
 *   English index lists.
 *
 * Run: npm run check (part of the build)
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CONTENT = join(ROOT, 'src', 'content', 'errors');
const TABLE = join(ROOT, 'src', 'data', 'error-codes.json');

const verified = JSON.parse(readFileSync(TABLE, 'utf8'));

/**
 * What a page may name. Browser codes are only ever cited in the form the
 * browser displays (`NET::ERR_CERT_DATE_INVALID`, not the bare Chromium
 * symbol). A client entry is a message or code a library prints, and its
 * `symbol` is a different, equally real constant the reader may meet in the
 * library's docs or source (`X509_V_ERR_SELF_SIGNED_CERT_IN_CHAIN`), so for
 * those the symbol counts as the entry too.
 */
const isBrowser = (e) => /^(chromium|gecko|nss)\//.test(e.source);
const aliases = new Map();
for (const e of verified) {
  aliases.set(e.code, e.code);
  if (!isBrowser(e) && e.symbol !== e.code) aliases.set(e.symbol, e.code);
}
const known = new Set(verified.map((e) => e.code));

/**
 * Client codes that are sentences rather than symbols. Libraries print them
 * with detail after them (Go appends the rejected authority, Java appends the
 * underlying exception), so a code span that starts with one of these is a
 * citation of it.
 */
const sentences = verified.filter((e) => !isBrowser(e) && /\s/.test(e.code)).map((e) => e.code);

/** The verified code a code span names, or undefined. */
function resolve(span) {
  if (aliases.has(span)) return aliases.get(span);
  return sentences.find((code) => span.startsWith(code));
}

/**
 * Anything shaped like an error symbol, in backticks.
 *
 * Backticks matter: prose says "the certificate authority is invalid" all the
 * time, and only a code span is a claim about a literal symbol. The `NET::`
 * prefix is optional because Chrome prints it and the site follows Chrome.
 */
const CODE_SPAN = /`((?:NET::)?(?:ERR|SEC_ERROR|SSL_ERROR|TLS_ERROR|MOZILLA_PKIX_ERROR)_[A-Z0-9_]+)`/g;

/**
 * The same, for clients. Each alternative is a shape that only an error
 * identifier has, so a match that is not in the table is a claim the table
 * cannot vouch for:
 *
 * - OpenSSL constants: `X509_V_ERR_*`, `SSL_R_*`.
 * - Node.js `err.code` values, which are the X509_V_ERR_ names without the
 *   prefix (`UNABLE_TO_VERIFY_LEAF_SIGNATURE`, `CERT_HAS_EXPIRED`, ...), and
 *   OpenSSL reason names as Python prints them (`CERTIFICATE_VERIFY_FAILED`).
 * - Go's messages, which all start `x509: `.
 * - Java's `PKIX path building failed...`.
 * - OpenSSL's messages as curl (`SSL certificate problem: ...`) and Python
 *   (`certificate verify failed: ...`) wrap them: the part after the colon
 *   must be a verified OpenSSL message.
 *
 * A bare lowercase OpenSSL message has no shape of its own, so it is only
 * recognised when it is in the table (see resolve()).
 */
const CLIENT_SPAN = new RegExp(
  '`('
    + '(?:X509_V_ERR|SSL_R)_[A-Z0-9_]+'
    + '|(?:UNABLE_TO|DEPTH_ZERO|SELF_SIGNED|CERT|CERTIFICATE|CRL|HOSTNAME|INVALID_CA|PATH_LENGTH)_[A-Z0-9_]+'
    + '|x509: [^`]+'
    + '|PKIX path building failed[^`]*'
    + ')`',
  'g',
);
/**
 * Wrappers a client prints around another library's code. Whatever sits in
 * the wrapper's slot has to be verified too, wherever in a code span the
 * wrapper appears:
 *
 * - Python: `[SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed:
 *   unable to get local issuer certificate (_ssl.c:1000)`
 * - curl: `SSL certificate problem: unable to get local issuer certificate`
 */
const PYTHON_REASON = /\[SSL: ([A-Z0-9_]+)\]/g;
const WRAPPED_MESSAGE = /(?:SSL certificate problem|certificate verify failed): (.+?)(?: \(_ssl\.c:\d+\))?$/;

/** Every code a page's body names: [what the page wrote, verified code or undefined]. */
function citations(text) {
  const found = [];
  for (const [, span] of text.matchAll(CODE_SPAN)) found.push([span, known.has(span) ? span : undefined]);
  for (const [, span] of text.matchAll(CLIENT_SPAN)) found.push([span, resolve(span)]);
  for (const [, span] of text.matchAll(/`([^`\n]+)`/g)) {
    for (const [, reason] of span.matchAll(PYTHON_REASON)) found.push([reason, resolve(reason)]);
    const wrapped = span.match(WRAPPED_MESSAGE)?.[1];
    if (wrapped) found.push([wrapped, resolve(wrapped)]);
    // Any other code span that is a verified client code or alias.
    const code = resolve(span);
    if (code) found.push([span, code]);
  }
  return found;
}

const problems = [];
const locales = readdirSync(CONTENT).filter((d) => !d.startsWith('.'));
const slugsByLocale = new Map();

for (const locale of locales) {
  const dir = join(CONTENT, locale);
  const slugs = new Set();
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.mdx'))) {
    const relative = `src/content/errors/${locale}/${file}`;
    slugs.add(file.replace(/\.mdx$/, ''));
    const text = readFileSync(join(dir, file), 'utf8');

    // The page's own code, from frontmatter. This is the one the page ranks
    // for, so it is the one that most needs to be real.
    const declared = text.match(/^errorCode:\s*"([^"]+)"/m)?.[1];
    if (!declared) {
      problems.push(`${relative}: no errorCode in frontmatter`);
    } else if (!known.has(declared)) {
      problems.push(
        `${relative}: errorCode ${declared} is not in src/data/error-codes.json. `
          + `Either it does not exist upstream, or it exists and the table has not been `
          + `extended. Run "npm run verify:error-codes" to find out which, and never `
          + `add an entry by hand.`,
      );
    }

    // Every code the body cites.
    for (const [cited, code] of citations(text)) {
      if (code) continue;
      problems.push(
        `${relative}: cites ${cited}, which is not a verified code. `
          + `A reader who follows that name searches for something no implementation emits.`,
      );
    }
  }
  slugsByLocale.set(locale, slugs);
}

// Both languages carry the same pages.
const [first, ...rest] = locales;
for (const other of rest) {
  for (const slug of slugsByLocale.get(first)) {
    if (!slugsByLocale.get(other).has(slug)) {
      problems.push(`src/content/errors/${other}/${slug}.mdx is missing (${first} has it)`);
    }
  }
  for (const slug of slugsByLocale.get(other)) {
    if (!slugsByLocale.get(first).has(slug)) {
      problems.push(`src/content/errors/${first}/${slug}.mdx is missing (${other} has it)`);
    }
  }
}

// An entry nobody uses is a table drifting away from the site.
const used = new Set();
for (const locale of locales) {
  for (const file of readdirSync(join(CONTENT, locale)).filter((f) => f.endsWith('.mdx'))) {
    const text = readFileSync(join(CONTENT, locale, file), 'utf8');
    const declared = text.match(/^errorCode:\s*"([^"]+)"/m)?.[1];
    if (declared) used.add(declared);
    for (const [, code] of citations(text)) if (code) used.add(code);
  }
}
for (const entry of verified) {
  if (!used.has(entry.code)) {
    problems.push(
      `src/data/error-codes.json lists ${entry.code}, and no page uses or cites it. `
        + `The table exists to vouch for what the site publishes, not to be a copy of NSS.`,
    );
  }
}

if (problems.length) {
  console.error(`\ncheck-error-codes: ${problems.length} problem(s)\n`);
  for (const p of problems) console.error(`  - ${p}`);
  console.error('');
  process.exit(1);
}
console.log(`check-error-codes: ${used.size} codes used across ${locales.length} locales, all verified`);
