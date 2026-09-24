/**
 * The site header's behaviour on the documentation pages, the theme toggle
 * and the phone menu, with the same logic as the script in
 * src/components/Navbar.astro, which these static pages do not bundle; and a
 * copy button on each code block.
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

  // A copy button on every code block. The wrapper takes the block's place
  // at the same size, so adding it does not move the page.
  var it = document.documentElement.lang === 'it';
  var label = it ? 'Copia' : 'Copy';
  var done = it ? 'Copiato' : 'Copied';
  var aria = it ? 'Copia il codice' : 'Copy code to clipboard';
  if (navigator.clipboard) {
    document.querySelectorAll('.doc-content pre').forEach(function (pre) {
      var wrap = document.createElement('div');
      wrap.className = 'doc-code';
      pre.parentNode.insertBefore(wrap, pre);
      wrap.appendChild(pre);
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'code-copy';
      button.textContent = label;
      button.setAttribute('aria-label', aria);
      button.addEventListener('click', function () {
        navigator.clipboard.writeText(pre.innerText.replace(/\n$/, '')).then(function () {
          button.textContent = done;
          setTimeout(function () { button.textContent = label; }, 1500);
        }, function () {
          // Clipboard refused (permissions, insecure context): the text is
          // still there to select by hand, and the label stays as it was.
        });
      });
      wrap.appendChild(button);
    });
  }

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
