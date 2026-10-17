// The free tools at tools.certmate.org that an error page can send a reader
// to, to check the certificate in front of them before reading further. Only
// the ones that answer a certificate question are here: a protocol or cipher
// error has nothing a certificate tool can show. Each runs in the browser and
// uploads nothing, which is what makes it safe to suggest for a live key.
export const TOOLS_SITE = 'https://tools.certmate.org';

export const TOOLS = {
  'chain-builder': {
    en: 'Rebuild and verify the chain',
    it: 'Ricostruisci e verifica la catena',
  },
  'certificate-decoder': {
    en: 'Decode the certificate',
    it: 'Decodifica il certificato',
  },
  'hostname-validator': {
    en: 'Check which names it covers',
    it: 'Controlla quali nomi copre',
  },
  'key-matcher': {
    en: 'Check the key matches the certificate',
    it: 'Verifica che la chiave corrisponda al certificato',
  },
  'renewal-calculator': {
    en: 'When to renew, and readiness for 47-day certificates',
    it: 'Quando rinnovare, e la prontezza per i certificati da 47 giorni',
  },
} as const;

export type ToolSlug = keyof typeof TOOLS;
export const TOOL_SLUGS = Object.keys(TOOLS) as [ToolSlug, ...ToolSlug[]];

export function toolUrl(lang: 'en' | 'it', slug: ToolSlug): string {
  return `${TOOLS_SITE}/${lang === 'it' ? 'it/' : ''}${slug}/`;
}
