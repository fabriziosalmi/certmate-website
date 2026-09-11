/**
 * The head tags a page needs to be understood by something other than a
 * person reading it.
 *
 * This exists because the site had two answers to the same question. The
 * Astro-rendered pages built their head in BaseLayout; the ten static
 * documentation pages built nothing, and so carried no description, no
 * canonical, no Open Graph and no structured data at all. One builder, used
 * by both, is the only arrangement where fixing something fixes it once.
 *
 * Returned as a string rather than as a component because the documentation
 * pages are assembled by an endpoint (src/pages/docs/[slug].html.ts): their
 * URLs end in .html, and an Astro page route under the site's `directory`
 * build format would publish /docs/getting-started.html/ instead, turning
 * every already-indexed URL into a redirect.
 */

/** Escape a value going into a double-quoted HTML attribute. */
export function attr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export type HeadInput = {
  title: string;
  description: string;
  /** Absolute, and the exact URL the page is published at, trailing slash included. */
  canonical: string;
  ogImage: string;
  ogType?: string;
  /** Serialised JSON-LD objects, already stringified. */
  jsonLd?: unknown[];
};

/**
 * The card tags use name=, not property=.
 *
 * Open Graph defines property=; the X card tags are documented with name=.
 * The rest of this site emits the card tags with property=, which most
 * parsers accept as a fallback but which is not what either specification
 * says. New markup follows the specifications.
 */
export function buildHead(input: HeadInput): string {
  const { title, description, canonical, ogImage, ogType = 'article', jsonLd = [] } = input;
  const lines = [
    `<meta name="description" content="${attr(description)}">`,
    `<link rel="canonical" href="${attr(canonical)}">`,
    `<meta property="og:type" content="${attr(ogType)}">`,
    `<meta property="og:site_name" content="CertMate">`,
    `<meta property="og:url" content="${attr(canonical)}">`,
    `<meta property="og:title" content="${attr(title)}">`,
    `<meta property="og:description" content="${attr(description)}">`,
    `<meta property="og:image" content="${attr(ogImage)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${attr(title)}">`,
    `<meta name="twitter:description" content="${attr(description)}">`,
    `<meta name="twitter:image" content="${attr(ogImage)}">`,
  ];
  for (const node of jsonLd) {
    // </script> inside a JSON string would close this element early.
    const json = JSON.stringify(node).replace(/</g, '\\u003c');
    lines.push(`<script type="application/ld+json">${json}</script>`);
  }
  return lines.join('\n    ');
}
