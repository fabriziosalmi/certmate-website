// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import icon from 'astro-icon';
// The documentation pages are published by src/pages/docs/[slug].html.ts,
// which is an endpoint rather than a page route; the sitemap integration
// discovers pages, so it does not see them. They are listed from the same
// table the endpoint builds them from, so the two cannot disagree -- the
// previous version read the directory they used to live in, and emptying
// that directory silently dropped ten URLs from the sitemap.
import { DOC_PAGES, docUrl } from './src/data/docs.ts';
// Dating each URL from the file it is built from, rather than from now().
// See scripts/lib/page-sources.mjs for what "built from" means here.
import { isShallowCheckout, lastModifiedFor } from './scripts/lib/page-sources.mjs';

const SITE = 'https://www.certmate.org';

// Google treats <lastmod> as a signal only while it stays consistent with the
// page, so a date that is wrong is worse than a date that is absent. A shallow
// checkout cannot tell one file's history from another's: git log answers with
// the single commit it has, for every path. Stop instead of publishing forty
// pages that all claim to have changed on the same day.
if (isShallowCheckout()) {
  throw new Error(
    'astro.config: this is a shallow checkout, so the sitemap cannot date pages from their sources.\n' +
      'Clone without --depth, or set fetch-depth: 0 on actions/checkout.',
  );
}

// https://astro.build/config
export default defineConfig({
  site: 'https://www.certmate.org',
  integrations: [
    tailwind({ applyBaseStyles: false }),
    // customPages: the shipped documentation is built by an endpoint, which
    // the integration does not discover. docUrl() gives the index page as
    // /docs/ rather than /docs/index.html, so the sitemap advertises one URL
    // for it instead of the second of two that both answer 200.
    sitemap({
      customPages: DOC_PAGES.map((page) => docUrl(page.slug)),
      // lastmod comes from git, not from the clock: two builds of an unchanged
      // checkout produce the same sitemap, and a page's date moves only when
      // its own source moves. A URL whose source cannot be identified gets no
      // lastmod at all; scripts/check-seo.mjs counts those and fails if any
      // appear, so a new kind of route cannot quietly lose its date.
      serialize(item) {
        const path = item.url.startsWith(SITE) ? item.url.slice(SITE.length) : item.url;
        const lastmod = lastModifiedFor(path);
        if (lastmod) item.lastmod = lastmod;
        return item;
      },
    }),
    mdx(),
    // astro-icon inlines an SVG for every <Icon name="fa6-solid:X" />
    // call at build time. Only the icons we use end up in the output
    // — drops the entire Font Awesome CDN dependency (76 KB of
    // render-blocking CSS + 200 KB+ of woff2 across solid + brands
    // weights). Two collections cover everything the site needs:
    // fa6-solid for UI icons, fa6-brands for vendor logos.
    icon({
      include: {
        'fa6-solid': ['*'],
        'fa6-brands': ['*'],
      },
    }),
  ],
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    build: {
      cssMinify: 'esbuild',
    },
  },
});
