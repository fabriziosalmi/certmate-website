/**
 * The ten shipped documentation pages, and the metadata their HTML does not
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
 * ideally contain. Several of these pages are very short -- storage-backends
 * holds 79 words -- and a description that promises more than the page
 * delivers earns a visit that bounces, which is worse than no description.
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
      'The CertMate documentation: installing and issuing a first certificate, configuring DNS providers, the REST API, Docker deployment, backups, storage backends, security and troubleshooting.',
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
      'Run CertMate as a container: docker run and docker compose, the environment file, and the amd64, arm64 and armv7 images.',
  },
  {
    slug: 'backup-recovery',
    title: 'Backup & Recovery - CertMate Documentation',
    description:
      'CertMate takes atomic backups of settings and certificates together. The two API calls that create a backup and restore one.',
  },
  {
    slug: 'storage-backends',
    title: 'Storage Backends - CertMate Documentation',
    description:
      'Where CertMate keeps certificates and secrets: the local filesystem by default, or Azure Key Vault, AWS Secrets Manager, HashiCorp Vault or Infisical.',
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
      "What to check when a DNS validation fails, a Let's Encrypt rate limit is hit, or the certificate directory has the wrong permissions.",
  },
  {
    slug: 'contributing',
    title: 'Contributing - CertMate Documentation',
    description:
      'How to contribute to CertMate: fork and clone, set up a development environment, run the test suite, and what a pull request should carry.',
  },
];

/** The published URL of a documentation page, absolute. */
export function docUrl(slug: string, site = 'https://www.certmate.org'): string {
  // index.html is served at both /docs/ and /docs/index.html. The directory
  // form is the one advertised, so that is the canonical one.
  return slug === 'index' ? `${site}/docs/` : `${site}/docs/${slug}.html`;
}
