// The site header's entries, in one place. Navbar.astro renders them on every
// Astro page, and src/lib/docs-shell.ts renders the same entries into the
// static documentation pages, so the two cannot drift apart again.

export type NavLocale = 'en' | 'it';

type Key =
  | 'docs'
  | 'errors'
  | 'deploy'
  | 'changelog'
  | 'security'
  | 'demo'
  | 'github'
  | 'mainNav'
  | 'home'
  | 'theme'
  | 'menu'
  | 'newTab';

const LABELS: Record<NavLocale, Record<Key, string>> = {
  en: {
    docs: 'Docs',
    errors: 'SSL Errors',
    deploy: 'Deploy Guides',
    changelog: 'Changelog',
    security: 'Security',
    demo: 'Live demo',
    github: 'GitHub',
    mainNav: 'Main navigation',
    home: 'CertMate home',
    theme: 'Toggle color theme',
    menu: 'Toggle navigation menu',
    newTab: '(opens in new tab)',
  },
  it: {
    docs: 'Documentazione',
    errors: 'Errori SSL',
    deploy: 'Guide al deploy',
    changelog: 'Changelog',
    security: 'Sicurezza',
    demo: 'Demo',
    github: 'GitHub',
    mainNav: 'Navigazione principale',
    home: 'CertMate, home in italiano',
    theme: 'Cambia tema chiaro o scuro',
    menu: 'Apri o chiudi il menu',
    newTab: '(si apre in una nuova scheda)',
  },
};

export function navLabel(locale: NavLocale, key: Key): string {
  return LABELS[locale][key];
}

// Pages of this site. Changelog and Security exist only in English, so both
// locales point at the same page. The documentation is in English apart from
// five pages, which the Italian home lists under #documentazione.
export const NAV_LINKS: { key: Key; href: Record<NavLocale, string> }[] = [
  { key: 'docs', href: { en: '/docs/', it: '/it/#documentazione' } },
  { key: 'errors', href: { en: '/errors/', it: '/it/errors/' } },
  { key: 'deploy', href: { en: '/deploy/', it: '/it/deploy/' } },
  { key: 'changelog', href: { en: '/changelog/', it: '/changelog/' } },
  { key: 'security', href: { en: '/security/', it: '/security/' } },
];

// Leaving the site. The agent and the tools are listed in the footer and in
// the home's Ecosystem section; the header keeps the two a first-time visitor
// looks for.
export const NAV_EXTERNAL: { key: Key; href: string; icon?: string }[] = [
  { key: 'demo', href: 'https://demo.certmate.org' },
  { key: 'github', href: 'https://github.com/fabriziosalmi/certmate', icon: 'fa6-brands:github' },
];

/** Whether href names the section `pathname` is in. Anchored links never do. */
export function isCurrentSection(href: string, pathname: string): boolean {
  if (href.includes('#') || href === '/' || href === '/it/') return false;
  return pathname.startsWith(href);
}
