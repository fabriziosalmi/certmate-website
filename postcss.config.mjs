// Tailwind 3 as a PostCSS plugin, which Vite runs on every CSS file.
//
// This used to be the @astrojs/tailwind integration, which adds exactly these
// two plugins. That integration declares astro ^3 || ^4 || ^5 and will not
// support Astro 6 or later (#35), so it stood between the site and the Astro
// releases that fix its open advisories. The base styles were never applied by
// the integration (applyBaseStyles: false): src/styles/global.css carries the
// @tailwind directives itself, so nothing else changes. Tailwind 4 is its own
// migration (#35, and fabriziosalmi/certmate#544 for the app).
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
