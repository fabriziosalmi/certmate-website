# CertMate Website

Landing page and documentation site for [CertMate](https://github.com/fabriziosalmi/certmate), an open-source SSL certificate management system.

**Live site:** [www.certmate.org](https://www.certmate.org)

## Project Structure

```
certmate-website/
├── index.html                  Main landing page
├── _config.yml                 Jekyll / GitHub Pages configuration
├── CNAME                       Custom domain (www.certmate.org)
├── manifest.json               PWA manifest
├── sw.js                       Service worker for offline support
├── assets/
│   ├── styles.css              Stylesheet (CSS custom properties)
│   ├── script.js               Navigation, tabs, clipboard, animations
│   ├── certmate_logo.png       Logo
│   ├── favicon.svg             SVG favicon
│   └── favicon.ico             ICO favicon
└── docs/
    ├── index.html              Documentation hub
    ├── getting-started.html    Installation and setup
    ├── dns-providers.html      All 22 DNS provider guides
    ├── api-reference.html      REST API reference
    ├── docker-deployment.html  Docker deployment guide
    ├── storage-backends.html   Storage backend configuration
    ├── backup-recovery.html    Backup and restore procedures
    ├── security.html           Security best practices
    ├── troubleshooting.html    Common issues and solutions
    └── contributing.html       Contribution guidelines
```

## Local Development

Clone and serve locally:

```bash
git clone https://github.com/fabriziosalmi/certmate-website.git
cd certmate-website
python -m http.server 8080
```

Open `http://localhost:8080` in your browser.

## Deployment

The site is deployed via GitHub Pages from the `main` branch. Pushing to `main` triggers a build automatically.

Custom domain is configured through the `CNAME` file pointing to `www.certmate.org`.

## Technical Details

- **Stack:** Vanilla HTML, CSS, JavaScript (no build step, no framework)
- **Hosting:** GitHub Pages with Jekyll
- **Fonts:** Inter via Google Fonts
- **Icons:** Font Awesome 6.4.0 (CDN)
- **PWA:** Service worker with asset caching
- **SEO:** Open Graph, Twitter Cards, JSON-LD structured data, jekyll-sitemap

### Browser Support

Chrome 60+, Firefox 60+, Safari 12+, Edge 79+, iOS Safari 12+, Chrome Mobile 60+.

Requires CSS Grid, Flexbox, CSS Custom Properties, and Intersection Observer.

### Accessibility

WCAG 2.1 AA compliant. Keyboard navigation, skip-to-content link, ARIA attributes, focus indicators, reduced-motion support.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Test locally
4. Open a pull request

See [contributing.html](docs/contributing.html) for details.

## License

MIT License. See the [main CertMate project](https://github.com/fabriziosalmi/certmate) for full license text.

## Links

- [CertMate repository](https://github.com/fabriziosalmi/certmate)
- [Documentation](https://www.certmate.org/docs/)
- [Docker Hub](https://hub.docker.com/r/fabriziosalmi/certmate)
- [Issue tracker](https://github.com/fabriziosalmi/certmate-website/issues)
