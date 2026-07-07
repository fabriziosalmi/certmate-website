/**
 * Single source of truth for facts that appear in more than one place on the
 * site — the current app version and the supported-provider count. Every
 * component that states these MUST import from here so they can never drift
 * again (the site previously advertised v2.16.1 / v2.19.1 / v2.8.3 in three
 * different files and disagreed 24 vs 27 on the provider count).
 *
 * Rules:
 *   - VERSION tracks the latest published CertMate release tag.
 *   - PROVIDER_COUNT is the number of provider cards actually rendered by
 *     DnsProviders.astro. It is deliberately the count we can point at on the
 *     page. The app repo supports at least this many DNS providers
 *     (modules/core/utils.py::_DNS_PROVIDER_CREDENTIALS lists more), so the
 *     number understates rather than overstates — safe and verifiable.
 */

/** Latest published CertMate release. Bump on every release. */
export const VERSION = '2.21.3';

/** Provider cards rendered in DnsProviders.astro (keep in sync with that grid). */
export const PROVIDER_COUNT = 27;

/** Certificate-storage backends the app ships (see modules/api/models.py). */
export const STORAGE_BACKEND_COUNT = 6;

export const GITHUB = 'https://github.com/fabriziosalmi/certmate';
export const RELEASES_URL = `${GITHUB}/releases`;

/** URL for a specific release tag's notes. */
export const releaseTag = (tag: string): string => `${RELEASES_URL}/tag/${tag}`;

/** GitHub Security tab (advisories / private vulnerability reporting). */
export const SECURITY_URL = `${GITHUB}/security`;
export const NEW_ADVISORY_URL = `${GITHUB}/security/advisories/new`;
