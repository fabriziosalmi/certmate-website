# CertMate Website

Landing page and documentation site for [CertMate](https://github.com/fabriziosalmi/certmate), an open-source SSL certificate management system.

**Live site:** [www.certmate.org](https://www.certmate.org)

## Project Structure

```
certmate-website/
├── astro.config.mjs               Astro configuration (sitemap, tailwind, mdx)
├── tailwind.config.mjs            Tailwind theme (CertMate palette, dark mode)
├── package.json                   Node dependencies
├── src/
│   ├── pages/
│   │   └── index.astro            Home page (Hero → WhatsNew → Features → ...)
│   ├── layouts/
│   │   └── BaseLayout.astro       SEO meta, JSON-LD, dark-mode FOUC guard
│   ├── components/
│   │   ├── Navbar.astro           Sticky nav with theme toggle + mobile menu
│   │   ├── Hero.astro             Headline + stats + terminal demo
│   │   ├── WhatsNew.astro         Release timeline (data in src/data/whats-new.ts)
│   │   ├── Features.astro         Why-choose-CertMate grid
│   │   ├── Community.astro        HN / Reddit / GitHub / Docker Hub cards
│   │   ├── DnsProviders.astro     Provider sample grid
│   │   ├── Enterprise.astro       Multi-account use cases + curl example
│   │   ├── Installation.astro     Docker / Python / Kubernetes tabs
│   │   ├── Api.astro              REST endpoint sample + curl recipe
│   │   ├── Cta.astro              Mid-page conversion band
│   │   ├── Docs.astro             Documentation links grid
│   │   └── Footer.astro           Brand, link columns, copyright
│   ├── data/
│   │   ├── whats-new.ts           Release timeline data
│   │   └── features.ts            Features grid data
│   └── styles/
│       └── global.css             Tailwind layer overrides + components
├── public/
│   ├── CNAME                      Custom domain (www.certmate.org)
│   ├── manifest.json              PWA manifest
│   ├── sw.js                      Service worker
│   ├── assets/                    Images, favicons, legacy JS / CSS
│   └── docs/                      Static documentation HTML
└── .github/workflows/deploy.yml   Build + deploy to GitHub Pages
```

## Local Development

Requires Node 20+ and npm.

```bash
git clone https://github.com/fabriziosalmi/certmate-website.git
cd certmate-website
npm install
npm run dev          # dev server with HMR on http://localhost:4321
npm run build        # production build into ./dist
npm run preview      # serve the production build locally
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the
Astro site (`npm run build`) and deploys the static output (`./dist`) to
GitHub Pages via the official `actions/deploy-pages@v4` flow. The first
deploy after the migration requires switching GitHub Pages settings from
"Deploy from a branch" to "GitHub Actions" in the repo settings.

The custom domain `www.certmate.org` is configured via the `public/CNAME`
file (copied verbatim into the build output).

## Technical Details

- **Stack:** [Astro 5](https://astro.build), [Tailwind CSS 3](https://tailwindcss.com), TypeScript
- **Hosting:** GitHub Pages (deployed via Actions, not Jekyll)
- **Fonts:** Inter + JetBrains Mono via Google Fonts
- **Icons:** Font Awesome 6.4.0 (CDN)
- **PWA:** Service worker with asset caching
- **SEO:** Open Graph, Twitter Cards, JSON-LD structured data, `@astrojs/sitemap`
- **Dark mode:** Class-based, persisted in `localStorage`, FOUC-prevented inline script in BaseLayout
- **Accessibility:** Skip-to-content link, ARIA attributes, focus indicators, semantic landmarks

### Browser Support

Modern evergreen browsers (Chrome / Firefox / Safari / Edge). The dark-mode toggle and tab interactions use standard DOM APIs available since 2018.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Run `npm run build` locally to confirm a green build
4. Open a pull request

See [contributing.html](public/docs/contributing.html) for details.

## License

MIT License. See the [main CertMate project](https://github.com/fabriziosalmi/certmate) for full license text.

## Links

- [CertMate repository](https://github.com/fabriziosalmi/certmate)
- [Documentation](https://www.certmate.org/docs/)
- [Docker Hub](https://hub.docker.com/r/fabriziosalmi/certmate)
- [Issue tracker](https://github.com/fabriziosalmi/certmate-website/issues)
