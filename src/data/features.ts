/**
 * Features grid. Each item preserves the title + body copy from the
 * previous static index.html so search-engine snippets stay stable across
 * the migration.
 *
 * Icon names use the iconify collection prefix (`fa6-solid:` or
 * `fa6-brands:`) so the Icon component can resolve them at build time
 * without any runtime CSS / webfont. See astro.config.mjs for the
 * astro-icon integration that wires this up.
 */

export interface Feature {
  icon: string;
  title: string;
  body: string;
}

export const features: Feature[] = [
  {
    icon: 'fa6-solid:arrows-rotate',
    title: 'Zero-Downtime Automation',
    body:
      'Certificates renew automatically 30 days before expiry with intelligent scheduling.',
  },
  {
    icon: 'fa6-solid:cloud',
    title: 'Multi-Cloud Support',
    body:
      'Works with a wide range of DNS providers including Cloudflare, AWS, Azure, GCP, Hetzner, Porkbun, GoDaddy, ArvanCloud, Infomaniak, ACME-DNS with multi-account support for enterprise environments.',
  },
  {
    icon: 'fa6-solid:rocket',
    title: 'Enterprise-Ready',
    body:
      'Docker, Kubernetes, REST API, and monitoring built-in for production use.',
  },
  {
    icon: 'fa6-solid:users',
    title: 'Multi-Account Support',
    body:
      'Manage multiple accounts per DNS provider for enterprise environments, staging/production separation, and multi-region deployments.',
  },
  {
    icon: 'fa6-solid:download',
    title: 'Simple Integration',
    body: 'One-URL certificate downloads for easy automation and deployment.',
  },
  {
    icon: 'fa6-solid:shield-halved',
    title: 'Security-First',
    body:
      'Role-based access control (RBAC), scoped API keys with allowed_domains enforcement, per-IP rate limiting, audit logging, secrets masked at rest in backups, and an internal security audit pipeline that closed 11 findings (3 CRITICAL) in May 2026.',
  },
  {
    icon: 'fa6-solid:id-badge',
    title: 'OIDC / SSO',
    body:
      'Authorization Code + PKCE via Authlib, IdP-claim-based role mapping, JIT or link-by-email provisioning with mandatory `email_verified` gate, and a dedicated audit-logged settings endpoint. Tested against Keycloak, Authentik and Okta.',
  },
  {
    icon: 'fa6-solid:certificate',
    title: 'Multiple CA Support',
    body:
      "Let's Encrypt (free), DigiCert ACME with EAB, and Private CA for internal certificates.",
  },
  {
    icon: 'fa6-solid:gears',
    title: 'REST API',
    body: 'Complete programmatic control with Swagger/OpenAPI documentation.',
  },
  {
    icon: 'fa6-solid:terminal',
    title: 'Auto-Deploy Hooks',
    body:
      'Run shell commands automatically after certificate creation or renewal for seamless deployment.',
  },
  {
    icon: 'fa6-solid:globe',
    title: 'Flexible Challenges',
    body:
      'DNS-01 challenge support with domain aliases and multi-master DNS configurations.',
  },
  {
    icon: 'fa6-solid:robot',
    title: 'Model Context Protocol (MCP)',
    body:
      'Built-in Node.js MCP server providing tools for agentic AI assistants (like Claude, Gemini, etc.) to manage certificates and run diagnostics.',
  },
  {
    icon: 'fa6-solid:receipt',
    title: 'Agentic Audit Trail',
    body:
      'Every certificate action — including unattended scheduled renewals — is attributed to who or what acted (human, API token, or AI agent) and what triggered it, then written into a tamper-evident SHA-256 hash chain you can verify with a standalone tool. Sensitive tokens and keys are still redacted from logs.',
  },
  {
    icon: 'fa6-solid:ghost',
    title: 'Zombie Certificate Scanner',
    body:
      'Identifies and cleans up orphan ("zombie") certificates no longer tracked in the active Certbot configuration.',
  },
];
