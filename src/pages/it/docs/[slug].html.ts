/**
 * The Italian documentation pages, built exactly as the English ones in
 * src/pages/docs/[slug].html.ts, from src/docs/it/*.html and DOC_PAGES_IT.
 * Each declares the English page with the same slug as its hreflang pair.
 */
import type { APIRoute } from 'astro';
import { DOC_PAGES_IT, DOC_READING_ORDER, docAlternates, docUrl, type DocPage } from '../../../data/docs';
import { ogImageFor } from '~/lib/og';
import { buildHead } from '../../../lib/seo';
import { applyShell } from '~/lib/docs-shell';
import { PROVIDER_COUNT } from '../../../data/site';

// ?raw through Vite rather than readFileSync: the html becomes a build input,
// so editing one in `astro dev` reloads the page instead of serving a stale
// copy from the first request.
const SOURCES = import.meta.glob('../../../docs/it/*.html', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;


export function getStaticPaths() {
  return DOC_PAGES_IT.map((page) => ({ params: { slug: page.slug }, props: { page } }));
}

function breadcrumb(page: DocPage) {
  const items = [
    { name: 'CertMate', url: 'https://www.certmate.org/' },
    { name: 'Documentazione', url: 'https://www.certmate.org/docs/' },
  ];
  if (page.slug !== 'index') {
    items.push({ name: page.title.split(' - ')[0], url: docUrl(page.slug, undefined, 'it') });
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// Previous and next among the Italian pages, in the English index's reading
// order; each title is the Italian page's own.
function neighbours(slug: string) {
  const order = DOC_READING_ORDER.filter((s) => DOC_PAGES_IT.some((p) => p.slug === s));
  const i = order.indexOf(slug);
  if (i === -1) return {};
  const link = (s: string | undefined) => {
    const page = s && DOC_PAGES_IT.find((p) => p.slug === s);
    return page ? { href: `${page.slug}.html`, title: page.title.split(' - ')[0] } : undefined;
  };
  return { prev: link(order[i - 1]), next: link(order[i + 1]) };
}

export const GET: APIRoute = ({ props }) => {
  const page = props.page as DocPage;
  const source = SOURCES[`../../../docs/it/${page.slug}.html`];
  if (source === undefined) {
    // A page listed in DOC_PAGES with no file is a broken build, not a 404 to
    // discover in production.
    throw new Error(`src/docs/it/${page.slug}.html is missing but is listed in DOC_PAGES_IT`);
  }

  const head = buildHead({
    title: page.title,
    description: page.description,
    canonical: docUrl(page.slug, undefined, 'it'),
    // Each documentation page gets its own card, drawn from its own title.
    ogImage: ogImageFor(new URL(docUrl(page.slug, undefined, 'it')).pathname),
    // Breadcrumb is in Google's current rich-result gallery. No page-level
    // type there fits a documentation page: FAQPage and HowTo were retired,
    // and Article is documented as a news, sports or blog article. Nothing
    // further is claimed, because a type that yields no rich result and
    // describes the page inaccurately is markup for its own sake.
    jsonLd: [breadcrumb(page)],
    alternates: docAlternates(page.slug),
  });

  // The provider count is stated in prose on two of these pages and had
  // drifted to 22 and 28 against a declared 29. src/data/site.ts is the one
  // place that number lives; the token is how these pages read it.
  const body = source.replace(/\{\{PROVIDER_COUNT\}\}/g, String(PROVIDER_COUNT));

  // The site's header and footer replace the page's own; see docs-shell.ts.
  const html = applyShell(body.replace('</head>', `    ${head}\n</head>`), {
    locale: 'it',
    pathname: new URL(docUrl(page.slug, undefined, 'it')).pathname,
    altHref: new URL(docUrl(page.slug)).pathname,
    source: `src/docs/it/${page.slug}.html`,
    ...neighbours(page.slug),
  });
  return new Response(html, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
};
