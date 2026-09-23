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
      'CertMate documentation: installation, DNS providers and CAs, the API, Docker, deploy hooks, webhooks, backups, storage, discovery, MCP and troubleshooting.',
  },
  {
    slug: 'getting-started',
    title: 'Getting Started - CertMate Documentation',
    description:
      'Install CertMate with Docker or from source, complete the first-run setup, add a DNS provider and issue your first certificate.',
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
      'The CertMate REST API: bearer-token authentication, the certificate, backup, storage and settings endpoints, and a curl example for each.',
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
      'Where CertMate stores certificates and keys: local layout, the settings each remote backend needs, Azure Key Vault modes, fallback, and API migration.',
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
      'Diagnose CertMate by symptom: startup failures, DNS-01 errors, CA and API rate limits, 401s, lockouts, missed renewals, deploy hooks.',
  },
  {
    slug: 'contributing',
    title: 'Contributing - CertMate Documentation',
    description:
      'How to contribute to CertMate: fork and clone, set up a development environment, run the test suite, and what a pull request should carry.',
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
      'How CertMate deploy hooks work: hook fields, the Deploy settings tab and API, CERTMATE_* variables, maintenance windows, command validation, history.',
  },
  {
    slug: 'ca-providers',
    title: 'CA Providers - CertMate Documentation',
    description:
      'The CAs CertMate issues from over ACME: keys, directories, EAB rules, what the connection test checks, per-certificate choice, reissue and private roots.',
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
      'Issue and renew certificates from a device CSR in CertMate: API and UI submission, refusals, stored files, status fields, renewal, and deploy hooks.',
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
      'Audit trail as evidence: actor attribution, SHA-256 hash chain, Ed25519 signed export, SIEM sink, prune, and the limits for NIS2, AI Act, ISO 42001.',
  },
];

/** The published URL of a documentation page, absolute. */
export function docUrl(slug: string, site = 'https://www.certmate.org'): string {
  // index.html is served at both /docs/ and /docs/index.html. The directory
  // form is the one advertised, so that is the canonical one.
  return slug === 'index' ? `${site}/docs/` : `${site}/docs/${slug}.html`;
}
