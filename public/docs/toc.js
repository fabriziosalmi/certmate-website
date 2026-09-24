/**
 * Highlights the table-of-contents entry for the section in view.
 *
 * The list itself is in the HTML: src/lib/docs-shell.ts builds it at build
 * time from the page's h2 and h3, with the ids this script used to assign in
 * the browser. All that is left to do here is follow the reader.
 */
(function () {
  'use strict';

  const nav = document.querySelector('nav.doc-toc');
  if (!nav || !('IntersectionObserver' in window)) return;

  const linkById = new Map();
  nav.querySelectorAll('a.doc-toc-link').forEach((a) => {
    linkById.set(decodeURIComponent(a.getAttribute('href').slice(1)), a);
  });

  let activeId = null;
  function setActive(id) {
    if (id === activeId) return;
    if (activeId) linkById.get(activeId)?.classList.remove('is-active');
    activeId = id;
    if (activeId) linkById.get(activeId)?.classList.add('is-active');
  }

  // The band starts 96px under the top of the viewport, below the sticky
  // header, and ends at 40% of its height.
  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length) setActive(visible[0].target.id);
    },
    { rootMargin: '-96px 0px -60% 0px', threshold: 0 },
  );
  linkById.forEach((_, id) => {
    const heading = document.getElementById(id);
    if (heading) io.observe(heading);
  });
})();
