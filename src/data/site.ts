/**
 * Single source of truth for facts that appear in more than one place on the
 * site — the current app version and the supported-provider count. Every
 * component that states these MUST import from here so they can never drift
 * again (the site previously advertised v2.16.1 / v2.19.1 / v2.8.3 in three
 * different files and disagreed 24 vs 27 on the provider count).
 *
 * Rules:
 *   - VERSION tracks the latest published CertMate release tag.
 *   - PROVIDER_COUNT is the number of provider cards rendered by
 *     DnsProviders.astro AND the number the app supports. Those must be equal.
 *     This used to say the count may understate the app "which is safe and
 *     verifiable" — and understating is exactly how EfficientIP SOLIDserver
 *     and Custom Script went unlisted for months on the page a visitor scans
 *     to answer "do you support X?". check-facts.mjs pins it to the cards;
 *     scripts/check-against-app.mjs pins it to the app, weekly.
 */

/** Latest published CertMate release. Bump on every release. */
export const VERSION = '2.26.0';

/** Provider cards rendered in DnsProviders.astro (keep in sync with that grid). */
export const PROVIDER_COUNT = 29;

/** Certificate-storage backends the app ships (see modules/api/models.py). */
export const STORAGE_BACKEND_COUNT = 6;

export const GITHUB = 'https://github.com/fabriziosalmi/certmate';
export const RELEASES_URL = `${GITHUB}/releases`;

/** URL for a specific release tag's notes. */
export const releaseTag = (tag: string): string => `${RELEASES_URL}/tag/${tag}`;

/** GitHub Security tab (advisories / private vulnerability reporting). */
export const SECURITY_URL = `${GITHUB}/security`;
export const NEW_ADVISORY_URL = `${GITHUB}/security/advisories/new`;
