// Lightweight manual i18n. EN is the default locale and lives at the root
// (no prefix); other locales live under /<locale>/. Pages emit hreflang
// alternates so each market's variant ranks correctly.

export const SITE = 'https://www.certmate.org';
export const LOCALES = ['en', 'it'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

/** Map a locale-relative path (e.g. "/errors/foo") to its URL path. */
export function localizedPath(locale: Locale, path: string): string {
  const clean = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  return locale === DEFAULT_LOCALE ? clean || '/' : `/${locale}${clean || ''}`;
}

/** Build hreflang alternates (incl. x-default) for a locale-relative path. */
export function alternatesFor(path: string) {
  const alts = LOCALES.map((l) => ({
    hreflang: l,
    href: SITE + localizedPath(l, path),
  }));
  alts.push({ hreflang: 'x-default', href: SITE + localizedPath(DEFAULT_LOCALE, path) });
  return alts;
}

export const ui = {
  en: {
    locale: 'en',
    home: 'Home',
    errors: 'SSL Errors',
    errorsTitle: 'SSL / TLS error reference',
    errorsIntro:
      'Plain-English explanations and copy-paste fixes for the SSL/TLS errors browsers and clients throw — plus how to stop them recurring with automated certificate management.',
    deploy: 'Deploy Guides',
    deployTitle: 'Deploy TLS certificates',
    deployIntro:
      'Step-by-step guides to install and auto-renew TLS certificates on the platforms you actually run — Nginx, Docker, Kubernetes and AWS.',
    compare: 'Compare',
    backHome: 'CertMate',
    onThisPage: 'On this page',
    commonCauses: 'Common causes',
    howToFix: 'How to fix it',
    prevent: 'Prevent it from recurring',
    relatedErrors: 'Related errors',
    affectedBrowsers: 'Seen in',
    updated: 'Updated',
    automateCta: 'Stop firefighting certificates',
    automateBody:
      'CertMate issues, renews and deploys TLS certificates automatically across 24 DNS providers — open source, self-hosted, with a REST API.',
    automateBtn: 'Get CertMate (open source)',
    docsBtn: 'Read the docs',
  },
  it: {
    locale: 'it',
    home: 'Home',
    errors: 'Errori SSL',
    errorsTitle: 'Riferimento errori SSL / TLS',
    errorsIntro:
      'Spiegazioni chiare e soluzioni pronte da copiare per gli errori SSL/TLS che browser e client restituiscono — e come evitarli per sempre con la gestione automatica dei certificati.',
    deploy: 'Guide al deploy',
    deployTitle: 'Deploy dei certificati TLS',
    deployIntro:
      'Guide passo-passo per installare e rinnovare automaticamente i certificati TLS sulle piattaforme che usi davvero — Nginx, Docker, Kubernetes e AWS.',
    compare: 'Confronto',
    backHome: 'CertMate',
    onThisPage: 'In questa pagina',
    commonCauses: 'Cause comuni',
    howToFix: 'Come risolverlo',
    prevent: 'Evitare che si ripresenti',
    relatedErrors: 'Errori correlati',
    affectedBrowsers: 'Visto su',
    updated: 'Aggiornato',
    automateCta: 'Basta rincorrere i certificati',
    automateBody:
      'CertMate emette, rinnova e fa il deploy dei certificati TLS in automatico su 24 provider DNS — open source, self-hosted, con API REST.',
    automateBtn: 'Scarica CertMate (open source)',
    docsBtn: 'Leggi la documentazione',
  },
} as const;
