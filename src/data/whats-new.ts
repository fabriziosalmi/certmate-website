/**
 * "What's New" cards. Listed newest-first. The previous static index.html
 * kept v2.0 / v2.0.1 as the headline cards; we now lead with v2.5.3 (the
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
    badge: 'milestone',
    badgeLabel: 'v2.5.3',
    icon: 'fa-star',
    title: 'v2.5.3 — Multi-audit response + draconian coverage push',
    description:
      'Twenty-one atomic commits across security, performance, UI hardening, docs and tests. Real fixes: deploy-hook parameter-expansion bypass, metadata RMW race, scheduler /health surfacing, corrupt-metadata quarantine. +160 unit tests on previously-uncovered crypto-critical modules (Private CA, CSR handler, OCSP/CRL, storage backends).',
    date: 'May 2026',
    highlight: true,
    href: 'https://github.com/fabriziosalmi/certmate/releases/tag/v2.5.3',
  },
  {
    badge: 'fix',
    badgeLabel: 'v2.5.2',
    icon: 'fa-wrench',
    title: 'v2.5.2 — Renewal stall + table column width + web-auth response',
    description:
      'Drop the certbot random-sleep stall on the renewal endpoint, give the dashboard Domain column a width floor, redirect browsers to /login instead of returning JSON 401.',
    date: 'May 2026',
    href: 'https://github.com/fabriziosalmi/certmate/releases/tag/v2.5.2',
  },
  {
    badge: 'feature',
    badgeLabel: 'v2.5.0',
    icon: 'fa-paint-brush',
    title: 'v2.5.0 — UI rewrite (51 fixes across templates)',
    description:
      'Focused sweep of every template: Alpine root repair, standardized modal macro (Esc/backdrop/focus-trap), component-class scaffold in input.css, dashboard mobile card meta, debug surface gating, accessibility passes (skip-to-content, aria-current, aria-expanded), and a help-page rewrite focused on self-service diagnosis.',
    date: 'May 2026',
    href: 'https://github.com/fabriziosalmi/certmate/releases/tag/v2.5.0',
  },
  {
    badge: 'feature',
    badgeLabel: 'Feature',
    icon: 'fa-network-wired',
    title: 'Multi-Account DNS & Domain Alias',
    description:
      'Multi-account support per DNS provider and domain alias capabilities for advanced DNS challenges (CNAME delegation across zones).',
    date: 'January 2026',
  },
  {
    badge: 'feature',
    badgeLabel: 'Feature',
    icon: 'fa-certificate',
    title: 'Client Certificates Management',
    description:
      'Complete client certificate lifecycle with OCSP responder, CRL distribution, batch CSV import, and audit logging.',
    date: 'January 2026',
  },
  {
    badge: 'security',
    badgeLabel: 'Security',
    icon: 'fa-shield-alt',
    title: 'Scoped API Keys + RBAC',
    description:
      'Three-tier role model (admin / operator / viewer) plus scoped API keys with allowed_domains enforcement. Bearer-token rotation, audit log for sensitive setting changes.',
    date: 'December 2025',
  },
];
