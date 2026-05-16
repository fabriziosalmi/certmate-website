/**
 * Features grid. Each item preserves the title + body copy from the
 * previous static index.html so search-engine snippets stay stable across
 * the migration. Where the old copy carried a specific provider count
 * ("Works with 22 DNS providers ..."), we use neutral wording so the
 * grid does not need to be touched every release.
 */

export interface Feature {
  icon: string;
  title: string;
  body: string;
}

export const features: Feature[] = [
  {
    icon: 'fa-sync-alt',
    title: 'Zero-Downtime Automation',
    body:
      'Certificates renew automatically 30 days before expiry with intelligent scheduling.',
  },
  {
    icon: 'fa-cloud',
    title: 'Multi-Cloud Support',
    body:
      'Works with a wide range of DNS providers including Cloudflare, AWS, Azure, GCP, Hetzner, Porkbun, GoDaddy, ArvanCloud, Infomaniak, ACME-DNS with multi-account support for enterprise environments.',
  },
  {
    icon: 'fa-rocket',
    title: 'Enterprise-Ready',
    body:
      'Docker, Kubernetes, REST API, and monitoring built-in for production use.',
  },
  {
    icon: 'fa-users',
    title: 'Multi-Account Support',
    body:
      'Manage multiple accounts per DNS provider for enterprise environments, staging/production separation, and multi-region deployments.',
  },
  {
    icon: 'fa-download',
    title: 'Simple Integration',
    body: 'One-URL certificate downloads for easy automation and deployment.',
  },
  {
    icon: 'fa-shield-alt',
    title: 'Security-First',
    body:
      'Role-based access control (RBAC), scoped API keys, rate limiting, and audit logging.',
  },
  {
    icon: 'fa-certificate',
    title: 'Multiple CA Support',
    body:
      "Let's Encrypt (free), DigiCert ACME with EAB, and Private CA for internal certificates.",
  },
  {
    icon: 'fa-cogs',
    title: 'REST API',
    body: 'Complete programmatic control with Swagger/OpenAPI documentation.',
  },
  {
    icon: 'fa-terminal',
    title: 'Auto-Deploy Hooks',
    body:
      'Run shell commands automatically after certificate creation or renewal for seamless deployment.',
  },
  {
    icon: 'fa-globe',
    title: 'Flexible Challenges',
    body:
      'DNS-01 challenge support with domain aliases and multi-master DNS configurations.',
  },
];
