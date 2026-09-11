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
