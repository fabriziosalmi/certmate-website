/**
 * Auto-generated in-page Table of Contents for the doc pages.
 *
 * Why client-side: the doc pages in /docs/*.html are hand-edited static
 * HTML (migrated from the previous Jekyll build, preserved so deep
 * links keep resolving). Adding a build step that injects a TOC at
 * compile time would couple them to the Astro pipeline; a one-file
 * runtime script keeps them static.
 *
 * Behaviour:
 *   - Reads every <h2> + <h3> inside .doc-content.
 *   - Assigns a kebab-case id to any heading that does not already have
 *     one, so the anchor links resolve.
 *   - Renders a <nav role="doc-toc"> sticky to the right of the content
 *     on desktop (lg+); collapses to a top-of-page disclosure on
 *     smaller viewports.
 *   - Highlights the entry whose section is currently in view via an
 *     IntersectionObserver.
 *   - Silently no-ops on pages with fewer than two H2s — short pages
 *     do not need a TOC and a single-entry list looks weird.
 *
 * Anti-slop: the TOC carries no labels other than the heading text.
 * No "On this page" / "Quick links" / fluff sentinel — the heading
 * text is the label.
 */
(function () {
  'use strict';

  const root = document.querySelector('.doc-content');
  if (!root) return;

  const headings = Array.from(root.querySelectorAll('h2, h3'));
  // Skip the "Next Steps" tail link list — it is in the same .doc-content
  // but is conventionally the last block on every doc page, and putting
  // it in the TOC duplicates the cross-references at the foot.
  const filtered = headings.filter((h) => h.textContent.trim() !== 'Next Steps');

  // Only render TOC if there are at least 2 H2s — short single-section
  // pages do not benefit.
  const h2Count = filtered.filter((h) => h.tagName === 'H2').length;
  if (h2Count < 2) return;

  // Slugify: lowercase, keep alphanumerics + dashes, collapse whitespace.
  // Conservative on purpose — anchor stability beats prettiness here.
  function slugify(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80);
  }

  // Ensure every heading has a stable id so the TOC link → anchor jump
  // works. Existing ids are preserved.
  filtered.forEach((h) => {
    if (!h.id) {
      let candidate = slugify(h.textContent) || 'section';
      // Disambiguate collisions by suffixing -2, -3 etc.
      let id = candidate;
      let n = 2;
      while (document.getElementById(id)) {
        id = `${candidate}-${n}`;
        n += 1;
      }
      h.id = id;
    }
  });

  // Build the TOC markup.
  const nav = document.createElement('nav');
  nav.setAttribute('role', 'doc-toc');
  nav.setAttribute('aria-label', 'On this page');
  nav.className = 'doc-toc';

  const inner = document.createElement('div');
  inner.className = 'doc-toc-inner';

  const ol = document.createElement('ol');
  ol.className = 'doc-toc-list';

  filtered.forEach((h) => {
    const li = document.createElement('li');
    li.className = h.tagName === 'H3' ? 'doc-toc-item doc-toc-item-h3' : 'doc-toc-item';

    const a = document.createElement('a');
    a.href = `#${h.id}`;
    a.textContent = h.textContent.replace(/\s+/g, ' ').trim();
    a.className = 'doc-toc-link';
    li.appendChild(a);
    ol.appendChild(li);
  });

  inner.appendChild(ol);
  nav.appendChild(inner);

  // Mount: inject inside <main> so the sticky position can reference
  // the page's main column. We prefer <main id="main-content"> but
  // fall back to the .doc-content's parent if it is missing.
  const mountTarget = document.querySelector('main#main-content') || root.parentElement;
  if (!mountTarget) return;
  mountTarget.appendChild(nav);

  // Active-section highlight via IntersectionObserver. Marks the entry
  // whose section's heading is closest to the top of the viewport.
  const linkById = new Map();
  nav.querySelectorAll('a.doc-toc-link').forEach((a) => {
    linkById.set(a.getAttribute('href').slice(1), a);
  });

  let activeId = null;
  function setActive(id) {
    if (id === activeId) return;
    if (activeId) {
      linkById.get(activeId)?.classList.remove('is-active');
    }
    activeId = id;
    if (activeId) {
      linkById.get(activeId)?.classList.add('is-active');
    }
  }

  const io = new IntersectionObserver(
    (entries) => {
      // Pick the entry whose top is closest to the configured offset
      // (the rootMargin sets a band 96px under the top of the viewport).
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length) {
        setActive(visible[0].target.id);
      }
    },
    {
      rootMargin: '-96px 0px -60% 0px',
      threshold: 0,
    }
  );
  filtered.forEach((h) => io.observe(h));
})();
