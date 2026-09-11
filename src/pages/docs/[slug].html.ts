/**
 * The ten shipped documentation pages, published at the URLs they already
 * have.
 *
 * Why an endpoint and not a page. The site builds with Astro's `directory`
 * format, so a page route named `getting-started.html` publishes the
 * directory /docs/getting-started.html/ and GitHub Pages answers the
 * already-indexed /docs/getting-started.html with a 301 into it. Measured on
 * this repository before choosing: both a static route and a dynamic route
 * with a dotted slug produce a directory. An endpoint with an explicit
 * extension publishes the literal file, so every indexed URL keeps answering
 * 200 at the same address.
 *
 * Why the body is spliced rather than re-authored. These pages are indexed.
 * Re-authoring them as MDX would change the rendered markup -- class names,
 * heading structure, whitespace -- on pages whose ranking is the thing being
 * protected. The body here is byte-for-byte what it was under public/docs/;
 * only the head gains the tags it never had. scripts/check-seo.mjs asserts
 * that, comparing each built body against its source.
 */
import type { APIRoute } from 'astro';
import { DOC_PAGES, docUrl, type DocPage } from '../../data/docs';
import { ogImageFor } from '~/lib/og';
import { buildHead } from '../../lib/seo';
import { PROVIDER_COUNT } from '../../data/site';

// ?raw through Vite rather than readFileSync: the html becomes a build input,
// so editing one in `astro dev` reloads the page instead of serving a stale
// copy from the first request.
const SOURCES = import.meta.glob('../../docs/*.html', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;


export function getStaticPaths() {
  return DOC_PAGES.map((page) => ({ params: { slug: page.slug }, props: { page } }));
}

function breadcrumb(page: DocPage) {
  const items = [
    { name: 'CertMate', url: 'https://www.certmate.org/' },
    { name: 'Documentation', url: 'https://www.certmate.org/docs/' },
  ];
  if (page.slug !== 'index') {
    items.push({ name: page.title.split(' - ')[0], url: docUrl(page.slug) });
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

export const GET: APIRoute = ({ props }) => {
  const page = props.page as DocPage;
  const source = SOURCES[`../../docs/${page.slug}.html`];
  if (source === undefined) {
    // A page listed in DOC_PAGES with no file is a broken build, not a 404 to
    // discover in production.
    throw new Error(`src/docs/${page.slug}.html is missing but is listed in src/data/docs.ts`);
  }

  const head = buildHead({
    title: page.title,
    description: page.description,
    canonical: docUrl(page.slug),
    // Each documentation page gets its own card, drawn from its own title.
    ogImage: ogImageFor(new URL(docUrl(page.slug)).pathname),
    // Breadcrumb is in Google's current rich-result gallery. No page-level
    // type there fits a documentation page: FAQPage and HowTo were retired,
    // and Article is documented as a news, sports or blog article. Nothing
    // further is claimed, because a type that yields no rich result and
    // describes the page inaccurately is markup for its own sake.
    jsonLd: [breadcrumb(page)],
  });

  // The provider count is stated in prose on two of these pages and had
  // drifted to 22 and 28 against a declared 29. src/data/site.ts is the one
  // place that number lives; the token is how these pages read it.
  const body = source.replace(/\{\{PROVIDER_COUNT\}\}/g, String(PROVIDER_COUNT));

  const html = body.replace('</head>', `    ${head}\n</head>`);
  return new Response(html, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
};
