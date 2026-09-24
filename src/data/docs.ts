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
];

/** The published URL of a documentation page, absolute. */
export function docUrl(slug: string, site = 'https://www.certmate.org'): string {
  // index.html is served at both /docs/ and /docs/index.html. The directory
  // form is the one advertised, so that is the canonical one.
  return slug === 'index' ? `${site}/docs/` : `${site}/docs/${slug}.html`;
}
