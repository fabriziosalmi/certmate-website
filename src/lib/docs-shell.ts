// The header and footer of the static documentation pages, rendered at build
// time from the same entries as the Astro pages' Navbar and Footer
// (src/data/nav.ts).
//
// The documentation pages are hand-written HTML that the endpoints in
// src/pages/docs and src/pages/it/docs publish at their indexed URLs. Each one
// carried its own four-link navbar and a dark one-line footer: no menu on a
// phone, no theme, no language switch, and nothing linking the error or deploy
// pages. Each page now holds a SITE_HEADER and a SITE_FOOTER marker, which the
// endpoints replace with what this module returns. It is styled by the "Site
// shell" section of public/assets/styles.css, since these pages do not load
// the Tailwind bundle.

import solid from '@iconify-json/fa6-solid/icons.json';
import brands from '@iconify-json/fa6-brands/icons.json';
import {
  FOOTER_BLURB,
  FOOTER_COLUMNS,
  FOOTER_CREDITS,
  FOOTER_SOCIAL,
  NAV_EXTERNAL,
  NAV_LINKS,
  isCurrentSection,
  navLabel,
  type NavLocale,
} from '~/data/nav';

type IconSet = { icons: Record<string, { body: string; width?: number; height?: number }>; width?: number; height?: number };

/** An inline SVG from the same icon sets astro-icon uses. */
export function svgIcon(name: string, cls = 'site-icon'): string {
  const [prefix, key] = name.split(':');
  const set = (prefix === 'fa6-brands' ? brands : solid) as IconSet;
  const icon = set.icons[key];
  if (!icon) throw new Error(`docs-shell: no icon ${name}`);
  const w = icon.width ?? set.width ?? 512;
  const h = icon.height ?? set.height ?? 512;
  return `<svg class="${cls}" viewBox="0 0 ${w} ${h}" width="1em" height="1em" aria-hidden="true" focusable="false">${icon.body}</svg>`;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/**
 * Applies the stored theme before first paint, as BaseLayout does, so a
 * reader who chose dark on the home does not get a white flash here.
 */
export const THEME_INIT = `<script>(()=>{try{const s=localStorage.getItem('theme');const d=s?s==='dark':matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark')}catch(_){/* storage blocked: follow the system */}})();</script>`;

export function renderHeader(opts: { locale: NavLocale; pathname: string; altHref?: string }): string {
  const { locale, pathname } = opts;
  const t = (k: Parameters<typeof navLabel>[1]) => esc(navLabel(locale, k));
  const other: NavLocale = locale === 'en' ? 'it' : 'en';
  const altHref = opts.altHref ?? (other === 'en' ? '/' : '/it/');
  const current = (href: string) => (isCurrentSection(href, pathname) ? ' aria-current="page"' : '');

  const internal = NAV_LINKS.map((l) => {
    const href = l.href[locale];
    return `<li><a class="site-nav-link" href="${href}"${current(href)}>${t(l.key)}</a></li>`;
  }).join('');
  const external = NAV_EXTERNAL.map((l) => {
    const icon = l.icon ? svgIcon(l.icon) : '';
    const arrow = l.icon ? '' : svgIcon('fa6-solid:arrow-up-right-from-square', 'site-icon site-icon-ext');
    return `<li><a class="site-nav-link" href="${l.href}" target="_blank" rel="noopener noreferrer">${icon}${t(l.key)}${arrow}<span class="sr-only">${t('newTab')}</span></a></li>`;
  }).join('');

  return `<nav class="site-nav" aria-label="${t('mainNav')}">
  <div class="site-nav-bar">
    <a class="site-nav-brand" href="${locale === 'en' ? '/' : '/it/'}" aria-label="${t('home')}"><img src="/assets/certmate_logo.png" alt="" width="40" height="40"><span>CertMate</span></a>
    <ul class="site-nav-links">${internal}<li class="site-nav-sep" aria-hidden="true"></li>${external}</ul>
    <div class="site-nav-controls">
      <a class="site-nav-control site-nav-lang" href="${altHref}" hreflang="${other}" lang="${other}" aria-label="${other === 'it' ? 'Italiano' : 'English'}">${other.toUpperCase()}</a>
      <button class="site-nav-control" type="button" data-theme-toggle aria-label="${t('theme')}">${svgIcon('fa6-solid:moon', 'site-icon only-light')}${svgIcon('fa6-solid:sun', 'site-icon only-dark')}</button>
      <button class="site-nav-control site-nav-burger" type="button" id="nav-hamburger" aria-label="${t('menu')}" aria-expanded="false" aria-controls="nav-menu-mobile">${svgIcon('fa6-solid:bars', 'site-icon when-closed')}${svgIcon('fa6-solid:xmark', 'site-icon when-open')}</button>
    </div>
  </div>
  <div class="site-nav-mobile" id="nav-menu-mobile" hidden>
    <ul>${internal}<li class="site-nav-rule" aria-hidden="true"></li>${external}</ul>
  </div>
</nav>`;
}

export function renderFooter(): string {
  const year = new Date().getFullYear();
  const social = FOOTER_SOCIAL.map(
    (s) => `<a class="site-footer-social" href="${s.href}" target="_blank" rel="noopener noreferrer" aria-label="${esc(s.label)}">${svgIcon(s.icon)}</a>`,
  ).join('');
  const columns = FOOTER_COLUMNS.map((col) => {
    const links = col.links
      .map((l) =>
        l.external
          ? `<li><a href="${l.href}" target="_blank" rel="noopener noreferrer">${esc(l.label)}<span class="sr-only"> (opens in new tab)</span></a></li>`
          : `<li><a href="${l.href}"${l.hreflang ? ` hreflang="${l.hreflang}" lang="${l.hreflang}"` : ''}>${esc(l.label)}</a></li>`,
      )
      .join('');
    return `<div><h2>${esc(col.title)}</h2><ul>${links}</ul></div>`;
  }).join('');
  const { author, contributors } = FOOTER_CREDITS;
  return `<footer class="site-footer">
  <div class="site-footer-inner">
    <div class="site-footer-grid">
      <div>
        <div class="site-footer-brand"><img src="/assets/certmate_logo.png" alt="" width="36" height="36" loading="lazy"><span>CertMate</span></div>
        <p class="site-footer-blurb">${esc(FOOTER_BLURB)}</p>
        <div class="site-footer-socials">${social}</div>
      </div>
      ${columns}
    </div>
    <div class="site-footer-bottom">
      <p>&copy; ${year} CertMate. Licensed under MIT License.</p>
      <p>Built by <a class="site-footer-credit" href="${author.href}" target="_blank" rel="noopener noreferrer">${esc(author.label)}</a> and <a class="site-footer-credit" href="${contributors.href}" target="_blank" rel="noopener noreferrer">${esc(contributors.label)}</a>.</p>
    </div>
  </div>
</footer>`;
}

/**
 * Replaces the page's SITE_HEADER and SITE_FOOTER markers with the site's
 * header and footer, and adds the theme script to the head and the shell
 * script to the body. Each marker must be found exactly once: a page that
 * lost one, or has two, fails the build instead of shipping with two headers
 * or none.
 */
const TOC_LABEL: Record<NavLocale, string> = { en: 'On this page', it: 'In questa pagina' };
// The closing link list every page ends with; the TOC leaves it out, since it
// repeats the cross-references at the foot.
const TOC_TAIL = new Set(['Next Steps', 'Prossimi passi']);

// The same slug public/docs/toc.js computed in the browser until now, so every
// anchor already linked from elsewhere keeps resolving.
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

// A heading's text as the browser's textContent would give it, near enough for
// slugify: tags dropped, entities dropped (slugify drops what they decode to).
function headingText(inner: string): string {
  return inner.replace(/<[^>]+>/g, '').replace(/&[#a-z0-9]+;/gi, '').replace(/\s+/g, ' ').trim();
}

/**
 * The page's table of contents, built from the h2 and h3 of .doc-content at
 * build time. It used to be built by toc.js after load, which meant nothing on
 * a phone: the list was display:none below 1388px. Now there are two copies of
 * the same list, a fixed column beside the text where the viewport has room
 * for it and an "On this page" disclosure at the top of the text where it has
 * not, both in the HTML so neither moves the page when a script runs. Headings
 * without an id get the one toc.js used to give them.
 */
export function addToc(html: string, locale: NavLocale): string {
  const start = html.search(/<section class="doc-content[^"]*">/);
  if (start === -1) return html;
  const end = html.indexOf('</section>', start);
  const section = html.slice(start, end);
  const taken = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  const entries: { level: number; id: string; text: string }[] = [];

  const withIds = section.replace(/<h([23])(\s[^>]*)?>([\s\S]*?)<\/h\1>/g, (whole, level: string, attrs = '', inner: string) => {
    const text = headingText(inner);
    if (TOC_TAIL.has(text)) return whole;
    const existing = attrs.match(/\sid="([^"]+)"/);
    let id = existing?.[1];
    if (!id) {
      const base = slugify(text) || 'section';
      id = base;
      for (let n = 2; taken.has(id); n += 1) id = `${base}-${n}`;
      taken.add(id);
    }
    entries.push({ level: Number(level), id, text });
    return existing ? whole : `<h${level} id="${id}"${attrs}>${inner}</h${level}>`;
  });

  if (entries.filter((e) => e.level === 2).length < 2) return html.slice(0, start) + withIds + html.slice(end);

  const list = entries
    .map((e) => `<li class="doc-toc-item${e.level === 3 ? ' doc-toc-item-h3' : ''}"><a class="doc-toc-link" href="#${e.id}">${esc(e.text)}</a></li>`)
    .join('');
  const wide = /doc-content-wide/.test(html.slice(start, start + 80)) ? ' doc-toc-wide' : '';
  const aside = `<nav class="doc-toc${wide}" aria-label="${TOC_LABEL[locale]}"><div class="doc-toc-inner"><ol class="doc-toc-list">${list}</ol></div></nav>\n        `;
  const details = `<details class="doc-toc-mobile${wide}"><summary>${TOC_LABEL[locale]}</summary><ol class="doc-toc-list">${list}</ol></details>`;
  const opened = withIds.replace(/^(<section class="doc-content[^"]*">)/, `$1\n            ${details}`);
  return html.slice(0, start) + aside + opened + html.slice(end);
}

const PAGER_LABEL: Record<NavLocale, { nav: string; prev: string; next: string }> = {
  en: { nav: 'Documentation pages', prev: 'Previous', next: 'Next' },
  it: { nav: 'Pagine della documentazione', prev: 'Precedente', next: 'Successiva' },
};

export type PagerLink = { href: string; title: string };

/** Previous and next links, in the index's reading order, at the foot of main. */
export function renderPager(locale: NavLocale, prev?: PagerLink, next?: PagerLink): string {
  if (!prev && !next) return '';
  const l = PAGER_LABEL[locale];
  const cell = (link: PagerLink | undefined, dir: 'prev' | 'next') =>
    link
      ? `<a class="doc-pager-link doc-pager-${dir}" href="${link.href}" rel="${dir}"><span class="doc-pager-label">${dir === 'prev' ? svgIcon('fa6-solid:arrow-left') : ''}${l[dir]}${dir === 'next' ? svgIcon('fa6-solid:arrow-right') : ''}</span><span class="doc-pager-title">${esc(link.title)}</span></a>`
      : '<span></span>';
  return `<nav class="doc-pager" aria-label="${l.nav}">${cell(prev, 'prev')}${cell(next, 'next')}</nav>`;
}

export function applyShell(
  html: string,
  opts: { locale: NavLocale; pathname: string; altHref?: string; source: string; prev?: PagerLink; next?: PagerLink },
): string {
  const swap = (input: string, re: RegExp, replacement: string, what: string) => {
    const matches = input.match(new RegExp(re.source, 'g'));
    if (!matches || matches.length !== 1) {
      throw new Error(`docs-shell: ${opts.source} has ${matches?.length ?? 0} ${what} blocks, expected exactly 1`);
    }
    return input.replace(re, () => replacement);
  };
  let out = html;
  out = swap(out, /<!-- SITE_HEADER:[^>]*-->/, renderHeader(opts), 'SITE_HEADER');
  out = swap(out, /<!-- SITE_FOOTER:[^>]*-->/, renderFooter(), 'SITE_FOOTER');
  out = swap(out, /<\/head>/, `    ${THEME_INIT}\n</head>`, '</head>');
  out = swap(out, /<\/body>/, `    <script src="/docs/shell.js" defer></script>\n</body>`, '</body>');
  out = addToc(out, opts.locale);
  const pager = renderPager(opts.locale, opts.prev, opts.next);
  if (pager) out = swap(out, /<\/main>/, `    ${pager}\n    </main>`, '</main>');
  return out;
}

/**
 * The documentation index's sections and cards, from DOC_GROUPS and DOC_CARDS
 * in src/data/docs.ts. It replaces the DOCS_INDEX marker in src/docs/index.html.
 * The index used to be one hand-written grid of 25 cards with no headings,
 * 9,000px tall on a phone; the same pages are now in seven titled sections,
 * and a page cannot be added to the site without a place in one of them.
 */
export function renderDocsIndex(
  groups: { title: string; slugs: string[] }[],
  cards: Record<string, { name: string; blurb: string; icon: string; tone: string }>,
): string {
  const id = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const sections = groups
    .map((g) => {
      const items = g.slugs
        .map((slug) => {
          const c = cards[slug];
          return `<a href="${slug}.html" class="docs-card">
                        <div class="docs-card-icon ${c.tone}">${svgIcon(c.icon)}</div>
                        <h3>${esc(c.name)}</h3>
                        <p>${esc(c.blurb)}</p>
                        <span class="docs-card-arrow">${svgIcon('fa6-solid:arrow-right')}</span>
                    </a>`;
        })
        .join('\n                    ');
      return `<section class="docs-group" aria-labelledby="${id(g.title)}">
                <h2 class="docs-group-title" id="${id(g.title)}">${esc(g.title)}</h2>
                <div class="docs-grid">
                    ${items}
                </div>
            </section>`;
    })
    .join('\n            ');
  return `<section class="docs-section">
        <div class="container">
            ${sections}
        </div>
    </section>`;
}
