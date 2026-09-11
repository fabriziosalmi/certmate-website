// Where a page's social card lives.
//
// The path is derived from the URL rather than listed in a table, so a page
// cannot be added without getting a card: scripts/build-og.mjs walks the built
// output, reads the og:image each page asked for, and renders exactly that
// file. A card nobody asks for is never drawn, and a card a page asks for and
// does not get fails the build in scripts/check-seo.mjs.

export const OG_DIRECTORY = '/assets/og';

/** Filename-safe name for a site path: '/' is home, '/it/deploy/aws/' is it-deploy-aws. */
export function ogImageName(pathname: string): string {
  const clean = pathname.replace(/^\/+|\/+$/g, '').replace(/\.html$/, '');
  if (!clean) return 'home';
  return clean.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
}

/** Absolute URL of the social card for a site path. */
export function ogImageFor(pathname: string, site = 'https://www.certmate.org'): string {
  return `${site}${OG_DIRECTORY}/${ogImageName(pathname)}.png`;
}
