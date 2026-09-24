/**
 * The shipped documentation pages, and the metadata their HTML does not
 * carry.
 *
 * These pages were static HTML under public/, which meant no Astro template
 * ever touched them: measured on 0540ca2 they had no description, no
 * canonical, no Open Graph and no structured data, while every Astro-rendered
 * page had all four. They are now built by src/pages/docs/[slug].html.ts,
 * which splices a head built from this table into the page's own markup.
 *
 * `title` is the text of the title the page already carries, as text rather
 * than as HTML: the one page whose title contains an ampersand had it stored
 * encoded, and encoding it a second time on the way into a meta attribute
 * published "Backup &amp;amp; Recovery". Escaping belongs to the builder that
 * knows which context it is writing into, and to nobody else.
 *
 * The title itself is reproduced verbatim from the page that is already indexed. The
 * title is the strongest on-page signal there is, so it is not restyled here
 * as part of a metadata fix; that is a separate decision with a separate risk.
 *
 * `description` is written by hand, per page, and describes what the page
 * actually contains rather than what a documentation page of that name would
 * ideally contain. When this was written several pages were very short --
 * storage-backends held 79 words -- and a description that promises more than
 * the page delivers earns a visit that bounces, which is worse than no
 * description. When a page's body is rewritten, its description is rewritten
 * with it.
 */
export type DocPage = {
  /** File name without the extension, and the published URL: /docs/<slug>.html */
  slug: string;
  /** Verbatim from the page that is already indexed. Do not restyle here. */
  title: string;
  /** Hand written. What this page actually contains. */
  description: string;
};

export const DOC_PAGES: DocPage[] = [
  {
    slug: 'index',
    title: 'CertMate Documentation',
    description:
      'CertMate documentation: installation, DNS providers and CAs, the API, Docker, deploy hooks, webhooks, backups, discovery, domain health, MCP, troubleshooting.',
  },
  {
    slug: 'getting-started',
    title: 'Getting Started - CertMate Documentation',
    description:
      'Install CertMate with Docker Compose, or run it without Docker as a systemd service under gunicorn with a dedicated user.',
  },
  {
    slug: 'dns-providers',
    title: 'DNS Providers - CertMate Documentation',
    description:
      "Configure any of the DNS providers CertMate supports for the Let's Encrypt DNS-01 challenge, including multi-account setups for the major ones.",
  },
  {
    slug: 'api-reference',
    title: 'API Reference - CertMate Documentation',
    description:
      'The CertMate REST API: authentication, contract version, certificate, backup, storage, settings and activity endpoints, with curl examples.',
  },
  {
    slug: 'docker-deployment',
    title: 'Docker Deployment - CertMate Documentation',
    description:
      "Run CertMate in Docker: image tags, docker run and Compose, env vars that work and don't, localhost binding, volumes, backups, upgrades, health checks.",
  },
  {
    slug: 'backup-recovery',
    title: 'Backup & Recovery - CertMate Documentation',
    description:
      'CertMate backups: archive contents, CERTMATE_BACKUP_PASSPHRASE, 30-day retention, and create, list, upload and restore via the settings UI and API.',
  },
  {
    slug: 'storage-backends',
    title: 'Storage Backends - CertMate Documentation',
    description:
      "Where CertMate stores certificates and keys: local layout and CERTMATE_CERT_DIR, each remote backend's settings, Azure Key Vault modes, and migration.",
  },
  {
    slug: 'security',
    title: 'Security Best Practices - CertMate Documentation',
    description:
      'Security guidance for a production CertMate deployment: authentication, private key handling, network exposure and the audit trail.',
  },
  {
    slug: 'troubleshooting',
    title: 'Troubleshooting - CertMate Documentation',
    description:
      'Diagnose CertMate by symptom: startup failures, CA and DNS-01 refusals, rate limits, 401s, lockouts, missed renewals, deploy hooks.',
  },
  {
    slug: 'contributing',
    title: 'Contributing - CertMate Documentation',
    description:
      'Develop CertMate: setup, running the pytest suites, the lint, security, coverage and complexity gates CI enforces, and what a PR needs to merge.',
  },
  {
    slug: 'webhooks',
    title: 'Webhooks - CertMate Documentation',
    description:
      'CertMate generic webhooks: event list and filters, default JSON body, payload templates, auth options, HMAC signature check, retries, SSRF guard and API.',
  },
  {
    slug: 'deploy-hooks',
    title: 'Deploy Hooks - CertMate Documentation',
    description:
      'Deploy hooks: shell commands CertMate runs inside its container after a certificate is created, renewed or revoked, with windows and validation.',
  },
  {
    slug: 'ca-providers',
    title: 'CA Providers - CertMate Documentation',
    description:
      'The certificate authorities CertMate issues from over ACME, Sectigo included: setup, EAB, https directories, and why an unconfigured CA is refused.',
  },
  {
    slug: 'certificate-discovery',
    title: 'Certificate Discovery - CertMate Documentation',
    description:
      'Endpoint and CT-log discovery in CertMate: config keys and defaults, the deep TLS probe, SSRF guard, revocation checks, inventory fields and the API.',
  },
  {
    slug: 'csr-certificates',
    title: 'CSR-Only Certificates - CertMate Documentation',
    description:
      'Issue, renew and rotate certificates from a device CSR in CertMate: API and UI submission, refusals, stored files, and key rotation through reissue.',
  },
  {
    slug: 'mcp-server',
    title: 'MCP Server - CertMate Documentation',
    description:
      'Install and configure the CertMate MCP server: its tools, the API route and minimum role for each, token setup, agent keys and audit attribution.',
  },
  {
    slug: 'compliance',
    title: 'Compliance Evidence - CertMate Documentation',
    description:
      'Audit trail as evidence: actor attribution, SHA-256 hash chain, signed export, searchable log, SIEM sink, prune, and the limits for NIS2, AI Act, ISO 42001.',
  },
  {
    slug: 'domain-health',
    title: 'Domain Health - CertMate Documentation',
    description:
      'Domain registration expiry, SPF, DMARC, MX, blocklists, headers and old TLS: what each check reports, why unknown is not clean, and the resolver.',
  },
  {
    slug: 'client-certificates',
    title: 'Client Certificates - CertMate Documentation',
    description:
      "CertMate's private CA for mTLS client certificates: CA subject and reset, issuing, PFX download, renewal, revocation, CRL and deploy hooks on revoke.",
  },
  {
    slug: 'revocation',
    title: 'Revocation Checking - CertMate Documentation',
    description:
      'How CertMate checks whether a served certificate is revoked: OCSP first, CRL fallback, verified answers only, and why unavailable is never good.',
  },
  {
    slug: 'monitoring',
    title: 'Monitoring - CertMate Documentation',
    description:
      "CertMate's /health and /health/ready endpoints, the Prometheus metrics at /metrics, the eight shipped alert rules and the Grafana dashboard to import.",
  },
  {
    slug: 'dns-01-delegation',
    title: 'DNS-01 Delegation - CertMate Documentation',
    description:
      'Issue certificates for a domain whose DNS CertMate cannot write: CNAME _acme-challenge to an alias zone, set domain_alias, verify with dig and the API.',
  },
  {
    slug: 'cli-sdk',
    title: 'CLI and Python SDK - CertMate Documentation',
    description:
      'Install and configure the certmate CLI and certmate-sdk Python client: every command and method, the endpoint each calls, exit codes, errors and jobs.',
  },
  {
    slug: 'sso',
    title: 'Single Sign-On (OIDC) - CertMate Documentation',
    description:
      'Set up OpenID Connect SSO in CertMate: IdP redirect URI and discovery, role mapping from group claims, JIT users, email linking, and logout.',
  },
  {
    slug: 'custom-dns-script',
    title: 'Custom Script DNS Provider - CertMate Documentation',
    description:
      'Use a DNS service CertMate has no provider for: the hook script contract, path rules, propagation wait, apex plus wildcard, and a curl example.',
  },
  {
    slug: 'notifications',
    title: 'Notifications - CertMate Documentation',
    description:
      'Configure CertMate notifications: email, Slack, Discord, Telegram, ntfy, Gotify and generic webhooks, event filters, expiry warnings, weekly digest.',
  },
];

/**
 * The Italian documentation pages. Each is a translation of the English page
 * with the same slug, so the two declare each other as hreflang alternates.
 * A page belongs here only when its Italian text says what the English one
 * says: an alternate that differs in substance is not an alternate.
 */
export const DOC_PAGES_IT: DocPage[] = [
  {
    slug: 'docker-deployment',
    title: 'Deploy con Docker - Documentazione CertMate',
    description:
      'CertMate in Docker: tag, docker run e Compose, variabili che funzionano e no, bind su localhost, volumi, backup, aggiornamenti, health check.',
  },
  {
    slug: 'dns-providers',
    title: 'Provider DNS - Documentazione CertMate',
    description:
      'Configura i provider DNS che CertMate supporta per la challenge DNS-01 di ACME, anche con più account per provider.',
  },
  {
    slug: 'mcp-server',
    title: 'Server MCP - Documentazione CertMate',
    description:
      'Installare e configurare il server MCP di CertMate: strumenti, route API e ruolo minimo di ciascuno, token, chiavi agente e attribuzione audit.',
  },
  {
    slug: 'compliance',
    title: 'Evidenze di conformità - Documentazione CertMate',
    description:
      'Traccia di audit come evidenza: attribuzione, catena SHA-256, export firmato, ricerca, sink SIEM, potatura e limiti per NIS2, AI Act, ISO 42001.',
  },
  {
    slug: 'getting-started',
    title: 'Per iniziare - Documentazione CertMate',
    description:
      'Installa CertMate con Docker o come servizio systemd, completa il primo avvio, aggiungi un provider DNS ed emetti il primo certificato.',
  },
];

/** The published URL of a documentation page, absolute. */
export function docUrl(slug: string, site = 'https://www.certmate.org', locale: 'en' | 'it' = 'en'): string {
  const base = locale === 'it' ? `${site}/it/docs` : `${site}/docs`;
  // index.html is served at both /docs/ and /docs/index.html. The directory
  // form is the one advertised, so that is the canonical one.
  return slug === 'index' ? `${base}/` : `${base}/${slug}.html`;
}

/** hreflang alternates for a slug, or none when it exists in one language only. */
export function docAlternates(slug: string): { hreflang: string; href: string }[] {
  if (!DOC_PAGES_IT.some((page) => page.slug === slug)) return [];
  return [
    { hreflang: 'en', href: docUrl(slug) },
    { hreflang: 'it', href: docUrl(slug, undefined, 'it') },
    { hreflang: 'x-default', href: docUrl(slug) },
  ];
}

// A slug listed twice builds the same route twice, and the sitemap, the
// index and the build all accept it without a word: that is how a scripted
// rebuild once published every new page up to nineteen times over. Refuse
// it where the list is defined, so nothing downstream has to notice.
for (const [name, list] of [['DOC_PAGES', DOC_PAGES], ['DOC_PAGES_IT', DOC_PAGES_IT]] as const) {
  const seen = new Set<string>();
  for (const page of list) {
    if (seen.has(page.slug)) throw new Error(`src/data/docs.ts: ${name} lists '${page.slug}' twice`);
    seen.add(page.slug);
  }
}

/**
 * What the documentation index shows for each page. `blurb` may contain
 * {{PROVIDER_COUNT}}, filled in when the index is built. `tone` picks the
 * icon's colour class in styles.css.
 */
export type DocCard = { name: string; blurb: string; icon: string; tone: string };

export const DOC_CARDS: Record<string, DocCard> = {
  'getting-started': { name: 'Getting Started', blurb: 'Docker Compose quick start, or a systemd service without Docker', icon: 'fa6-solid:rocket', tone: 'getting-started' },
  'dns-providers': { name: 'DNS Providers', blurb: 'Configuration guides for all {{PROVIDER_COUNT}} supported DNS providers including multi-account setup', icon: 'fa6-solid:cloud', tone: 'dns-providers' },
  'api-reference': { name: 'API Reference', blurb: 'Complete REST API documentation with examples and authentication details', icon: 'fa6-solid:code', tone: 'api' },
  'docker-deployment': { name: 'Docker Deployment', blurb: 'Image tags, docker run and Compose, environment, volumes, upgrades and health checks', icon: 'fa6-brands:docker', tone: 'docker' },
  'storage-backends': { name: 'Storage Backends', blurb: 'Local layout, Azure Key Vault, AWS Secrets Manager, Vault, Infisical, S3, migration', icon: 'fa6-solid:database', tone: 'storage' },
  'backup-recovery': { name: 'Backup & Recovery', blurb: 'What a backup holds, the passphrase, retention, and restoring through the UI or API', icon: 'fa6-solid:floppy-disk', tone: 'backup' },
  'security': { name: 'Security Best Practices', blurb: 'Authentication, authorization, file permissions, and compliance guidelines', icon: 'fa6-solid:shield-halved', tone: 'security' },
  'troubleshooting': { name: 'Troubleshooting', blurb: 'From the symptom to the cause: startup, DNS-01, rate limits, 401s, renewals, hooks', icon: 'fa6-solid:wrench', tone: 'troubleshooting' },
  'webhooks': { name: 'Webhooks', blurb: 'Events, payload templates, authentication, HMAC signatures, retries and the API', icon: 'fa6-solid:plug', tone: 'api' },
  'deploy-hooks': { name: 'Deploy Hooks', blurb: 'Shell commands run after issue or renewal, with maintenance windows and history', icon: 'fa6-solid:terminal', tone: 'docker' },
  'ca-providers': { name: 'CA Providers', blurb: 'Supported ACME CAs, EAB, staging, Private CA setup, and choosing a CA per certificate', icon: 'fa6-solid:certificate', tone: 'security' },
  'certificate-discovery': { name: 'Certificate Discovery', blurb: 'Record certificates CertMate observes on hosts and in CT logs, and query the API', icon: 'fa6-solid:magnifying-glass', tone: 'dns-providers' },
  'csr-certificates': { name: 'CSR-Only Certificates', blurb: 'Certificates from a device CSR; the private key never reaches CertMate', icon: 'fa6-solid:file-signature', tone: 'storage' },
  'mcp-server': { name: 'MCP Server', blurb: 'Connect an AI assistant to CertMate: tools, roles, setup and audit', icon: 'fa6-solid:robot', tone: 'getting-started' },
  'domain-health': { name: 'Domain Health', blurb: 'Registration expiry, mail records, blocklists, headers and old TLS, with honest unknowns', icon: 'fa6-solid:heart-pulse', tone: 'troubleshooting' },
  'compliance': { name: 'Compliance Evidence', blurb: 'Audit trail evidence for NIS2, AI Act and ISO 42001, and its stated limits', icon: 'fa6-solid:scale-balanced', tone: 'backup' },
  'client-certificates': { name: 'Client Certificates', blurb: 'Private CA for mTLS and VPN: issue, download, renew and revoke client certificates', icon: 'fa6-solid:id-card', tone: 'security' },
  'revocation': { name: 'Revocation Checking', blurb: 'OCSP then CRL, verified answers only; what good, unknown and unavailable mean', icon: 'fa6-solid:ban', tone: 'troubleshooting' },
  'monitoring': { name: 'Monitoring', blurb: 'Health and readiness probes, Prometheus metrics, alert rules and a Grafana dashboard', icon: 'fa6-solid:chart-line', tone: 'api' },
  'dns-01-delegation': { name: 'DNS-01 Delegation', blurb: 'CNAME _acme-challenge into a zone CertMate can write, for DNS it cannot manage', icon: 'fa6-solid:share-nodes', tone: 'dns-providers' },
  'cli-sdk': { name: 'CLI and Python SDK', blurb: 'The certmate command and Python SDK: commands, endpoints, models, errors, jobs', icon: 'fa6-solid:keyboard', tone: 'getting-started' },
  'sso': { name: 'Single Sign-On (OIDC)', blurb: 'Sign in through an OIDC IdP, map its groups to roles, control provisioning', icon: 'fa6-solid:right-to-bracket', tone: 'security' },
  'custom-dns-script': { name: 'Custom Script DNS Provider', blurb: 'Bring your own DNS API: a script creates the TXT record, CertMate does the rest', icon: 'fa6-solid:code', tone: 'dns-providers' },
  'notifications': { name: 'Notifications', blurb: 'Email, Slack, Discord, Telegram, ntfy, Gotify and webhook alerts; weekly digest', icon: 'fa6-solid:bell', tone: 'backup' },
  'contributing': { name: 'Contributing', blurb: 'Dev setup, test commands, the CI gates a pull request must pass, merge rules', icon: 'fa6-solid:users', tone: 'contributing' },
};

/**
 * The documentation index's sections, in reading order. The index renders
 * them, and each page's previous and next links follow the same order, so a
 * reader who goes page by page reads what the index groups together.
 */
export const DOC_GROUPS: { title: string; slugs: string[] }[] = [
  { title: 'Get started', slugs: ['getting-started', 'docker-deployment'] },
  { title: 'DNS and certificate authorities', slugs: ['dns-providers', 'dns-01-delegation', 'custom-dns-script', 'ca-providers'] },
  { title: 'Certificates', slugs: ['csr-certificates', 'client-certificates', 'certificate-discovery', 'revocation', 'domain-health'] },
  { title: 'Running CertMate', slugs: ['storage-backends', 'backup-recovery', 'monitoring', 'notifications', 'troubleshooting'] },
  { title: 'Security and access', slugs: ['security', 'sso', 'compliance'] },
  { title: 'Integrations', slugs: ['api-reference', 'cli-sdk', 'webhooks', 'deploy-hooks', 'mcp-server'] },
  { title: 'Contributing', slugs: ['contributing'] },
];

/** Every page but the index, in DOC_GROUPS order. */
export const DOC_READING_ORDER: string[] = DOC_GROUPS.flatMap((g) => g.slugs);

// A page missing from the groups would be missing from the index, and one
// grouped twice would be carded twice. Refuse both here, with the card each
// grouped page needs.
{
  const published = new Set(DOC_PAGES.map((p) => p.slug).filter((s) => s !== 'index'));
  const grouped = new Set<string>();
  for (const slug of DOC_READING_ORDER) {
    if (grouped.has(slug)) throw new Error(`src/data/docs.ts: DOC_GROUPS lists '${slug}' twice`);
    if (!published.has(slug)) throw new Error(`src/data/docs.ts: DOC_GROUPS lists '${slug}', which is not in DOC_PAGES`);
    if (!DOC_CARDS[slug]) throw new Error(`src/data/docs.ts: '${slug}' has no entry in DOC_CARDS`);
    grouped.add(slug);
  }
  for (const slug of published) {
    if (!grouped.has(slug)) throw new Error(`src/data/docs.ts: '${slug}' is in DOC_PAGES but in no DOC_GROUPS section`);
  }
}
