/**
 * The site header's behaviour on the documentation pages: the theme toggle
 * and the phone menu. The same logic as the script in
 * src/components/Navbar.astro, which these static pages do not bundle.
 */
(function () {
  'use strict';

  document.querySelectorAll('[data-theme-toggle]').forEach(function (toggle) {
    toggle.addEventListener('click', function () {
      var next = document.documentElement.classList.toggle('dark') ? 'dark' : 'light';
      try {
        localStorage.setItem('theme', next);
      } catch (_) {
        // Storage blocked: the theme flips for this page, it is just not remembered.
      }
    });
  });

  var burger = document.getElementById('nav-hamburger');
  var mobile = document.getElementById('nav-menu-mobile');
  if (!burger || !mobile) return;
  function setOpen(open) {
    mobile.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
  }
  burger.addEventListener('click', function () {
    setOpen(burger.getAttribute('aria-expanded') !== 'true');
  });
  mobile.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () { setOpen(false); });
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      burger.focus();
    }
  });
})();
