/**
 * "What's New" cards. Listed newest-first. The previous static index.html
 * kept v2.0 / v2.0.1 as the headline cards; we now lead with v2.8.0 (the
 * current release) and keep enough history for context without padding
 * the page.
 *
 * Each item maps to one card. Badge variants:
 *   - 'milestone' (highlighted v2.x release)
 *   - 'security'  (CVE / hardening / audit)
 *   - 'fix'       (bug fix release)
 *   - 'feature'   (feature delivery)
 */

export type UpdateBadge = 'milestone' | 'security' | 'fix' | 'feature';

export interface UpdateCard {
  badge: UpdateBadge;
  badgeLabel: string;
  icon: string;
  title: string;
  description: string;
  date: string;
  highlight?: boolean;
  href?: string;
}

export const updates: UpdateCard[] = [
  {
    badge: 'fix',
    badgeLabel: 'v2.8.3',
    icon: 'fa6-solid:wrench',
    title: 'v2.8.3 — Azure sub-delegated DNS alias fix',
    description:
      'Hotfix for Azure DNS-01 alias mode against a sub-delegated validation zone (e.g. acme-validation.example.com delegated under example.com): issuance failed because Lexicon resolves the hosted zone with tldextract, which collapses any name back to the registered domain. CertMate now sets resolve_zone_name so Lexicon resolves the real zone via a dnspython SOA lookup from the full alias FQDN. Upgrade recommended if you use Azure DNS alias mode with a delegated validation zone.',
    date: 'May 2026',
    highlight: true,
    href: 'https://github.com/fabriziosalmi/certmate/releases/tag/v2.8.3',
  },
  {
    badge: 'milestone',
    badgeLabel: 'v2.8.2',
    icon: 'fa6-solid:shield-halved',
    title: 'v2.8.2 — Security Audit Hardening & UI/UX Audit Response',
    description:
      'A comprehensive security and UI audit response bringing logical hardening to the backend. Features audit logging for storage updates, migrations, Azure Key Vault backfills, and DNS provider changes. Hardens backups with path traversal validation, aligns backup pruning/timing to UTC. Incorporates 60+ UI/UX fixes including dark mode visibility improvements, ARIA accessibility, focus trapping/restores, and spinner loading safeguards.',
    date: 'May 2026',
    highlight: true,
    href: 'https://github.com/fabriziosalmi/certmate/releases/tag/v2.8.2',
  },
  {
    badge: 'feature',
    badgeLabel: 'v2.8.1',
    icon: 'fa6-solid:robot',
    title: 'v2.8.1 — Log Sanitizer, Zombie Certificate Scanner & MCP Server',
    description:
      'Features a Log Sanitizer to automatically redact API tokens, private keys, and PEM blocks. Adds a multi-threaded Zombie Certificate Scanner to identify and clean up orphan certificates. Introduces the CertMate MCP (Model Context Protocol) Server for integrating agentic AI assistants. Adds a Diagnostics Snapshot with a UI copy/clipboard helper.',
    date: 'May 2026',
    highlight: true,
    href: 'https://github.com/fabriziosalmi/certmate/releases/tag/v2.8.1',
  },
  {
    badge: 'milestone',
    badgeLabel: 'v2.8.0',
    icon: 'fa6-solid:file-shield',
    title: 'v2.8.0 — certificate formats, SSO user management & faster listing',
    description:
      'Encrypted Windows .pfx (PKCS#12) export written on every issuance/renewal with a stable fingerprint for polling; PKCS#1/SEC1 private-key download for legacy stacks (`?key_format=pkcs1`); `CERTMATE_CHAIN_PATH` (intermediates only) exposed to deploy hooks. SSO user-management hardening: IdP-linked accounts are badged, can\'t take a local password, and the sole remaining admin can no longer be deleted or disabled. Certificate listing replaces the per-row openssl subprocess with in-process parsing plus a cached info read, and routine backups now skip certbot scratch while keeping renewal lineage.',
    date: 'May 2026',
    highlight: true,
    href: 'https://github.com/fabriziosalmi/certmate/releases/tag/v2.8.0',
  },
  {
    badge: 'milestone',
    badgeLabel: 'v2.7.0',
    icon: 'fa6-solid:id-badge',
    title: 'v2.7.0 — OIDC / SSO authentication',
    description:
      'Authorization Code + PKCE via Authlib, IdP-claim-based role mapping (case-insensitive, first-match-wins), JIT or link-by-email provisioning with mandatory `email_verified` gate against account-takeover via self-service-signup IdPs. Dedicated audit-logged settings endpoint kept separate from the bulk settings POST so a scoped key cannot mutate OIDC config. Concurrency-safe JIT path routed through the settings RLock.',
    date: 'May 2026',
    highlight: true,
    href: 'https://github.com/fabriziosalmi/certmate/releases/tag/v2.7.0',
  },
  {
    badge: 'security',
    badgeLabel: 'Audit',
    icon: 'fa6-solid:shield-halved',
    title: 'Internal security audit — 11 findings closed in one day',
    description:
      'Four-angle audit on authz/scope coverage, secrets handling, path traversal completeness and shell injection. Closed: backup ZIP plaintext credentials (mask-by-default + admin opt-in for full DR, chmod 0600), settings-mutating routes that destroyed credentials on round-trip POST, path traversal at the WRITE boundary on `/api/certificates/create`, client-cert API role + private-key gating, certbot stderr leak on credential-file parse errors, acme-dns shared-secret masking, settings GET cross-tenant domain disclosure. ~115 regression tests added.',
    date: 'May 2026',
    highlight: true,
    href: 'https://github.com/fabriziosalmi/certmate/pulls?q=is%3Apr+is%3Amerged+label%3Aaudit',
  },
  {
    badge: 'feature',
    badgeLabel: 'v2.6.x',
    icon: 'fa6-solid:network-wired',
    title: 'v2.6.x — Azure Key Vault + nested-subdomain wildcards + storage hot-reload',
    description:
      'Native Azure Key Vault Certificate-object storage mode (AKS / App Service / Front Door consume it directly). Wildcard cert issuance for nested subdomains against the parent hosted zone, with per-provider zone discovery (Azure today, registry-keyed for future providers). Storage backend hot-reloads when `certificate_storage` changes — no restart required. Configurable cert key shape (RSA 2048/3072/4096 or ECDSA P-256/P-384).',
    date: 'May 2026',
    href: 'https://github.com/fabriziosalmi/certmate/releases',
  },
  {
    badge: 'fix',
    badgeLabel: 'v2.6.9',
    icon: 'fa6-solid:wrench',
    title: 'v2.6.9 — Azure DNS sp_* keys + zoneN mapping',
    description:
      '`certbot-dns-azure` 2.x expects `dns_azure_sp_client_id` / `dns_azure_sp_client_secret` and parses subscription + resource group out of `dns_azure_zoneN` lines. The previous bare-key format was silently ignored by the plugin and aborted with "No authentication methods have been configured for Azure DNS" before any DNS challenge could run.',
    date: 'May 2026',
    href: 'https://github.com/fabriziosalmi/certmate/releases/tag/v2.6.9',
  },
  {
    badge: 'milestone',
    badgeLabel: 'v2.5.x',
    icon: 'fa6-solid:star',
    title: 'v2.5.x — UI rewrite + multi-audit response',
    description:
      'Full template sweep (51 fixes across all templates), standardized modal macro with Esc/backdrop/focus-trap, accessibility passes, deploy-hook parameter-expansion bypass closed, metadata RMW race fixed, corrupt-metadata quarantine, scheduler /health surfacing. +160 unit tests on previously-uncovered crypto-critical modules (Private CA, CSR handler, OCSP/CRL, storage backends).',
    date: 'May 2026',
    href: 'https://github.com/fabriziosalmi/certmate/releases',
  },
  {
    badge: 'feature',
    badgeLabel: 'Feature',
    icon: 'fa6-solid:certificate',
    title: 'Client Certificates Management',
    description:
      'Complete client certificate lifecycle with OCSP responder, CRL distribution, batch CSV import (up to 100 identities per call), audit logging, and per-file role gating — viewers pull cert/chain/csr, operators pull privkey, admins revoke.',
    date: 'January 2026',
  },
  {
    badge: 'security',
    badgeLabel: 'Security',
    icon: 'fa6-solid:key',
    title: 'Scoped API Keys + RBAC',
    description:
      'Three-tier role model (admin / operator / viewer) plus scoped API keys with allowed_domains enforcement. Bearer-token rotation, audit log for sensitive setting changes, per-IP rate limiting on auth endpoints.',
    date: 'December 2025',
  },
];
