// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.certmate.org',
  integrations: [
    tailwind({ applyBaseStyles: false }),
    sitemap(),
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
