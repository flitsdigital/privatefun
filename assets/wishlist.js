(function () {
  'use strict';
  var KEY = 'pf_wishlist_v1';

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (e) { return []; }
  }
  function write(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
    document.dispatchEvent(new CustomEvent('wishlist:change', { detail: { list: list } }));
  }
  function has(list, id) { return list.some(function (i) { return String(i.id) === String(id); }); }

  function toggle(item) {
    var list = read();
    if (has(list, item.id)) {
      list = list.filter(function (i) { return String(i.id) !== String(item.id); });
    } else {
      list.unshift(item);
    }
    write(list);
    return has(list, item.id);
  }

  function itemFromButton(btn) {
    return {
      id: btn.getAttribute('data-wl-id'),
      handle: btn.getAttribute('data-wl-handle'),
      title: btn.getAttribute('data-wl-title'),
      url: btn.getAttribute('data-wl-url'),
      image: btn.getAttribute('data-wl-image'),
      price: btn.getAttribute('data-wl-price')
    };
  }

  function syncButtons() {
    var list = read();
    document.querySelectorAll('[data-wishlist-toggle]').forEach(function (btn) {
      var active = has(list, btn.getAttribute('data-wl-id'));
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      btn.setAttribute('aria-label', active ? 'Verwijder uit favorieten' : 'Bewaar als favoriet');
      btn.setAttribute('title', active ? 'Verwijder uit favorieten' : 'Bewaar als favoriet');
      var lbl = btn.querySelector('[data-wl-text]');
      if (lbl) lbl.textContent = active ? 'Bewaard als favoriet' : 'Bewaar als favoriet';
    });
  }

  function updateCount() {
    var n = read().length;
    document.querySelectorAll('[data-wishlist-count]').forEach(function (el) {
      el.textContent = n;
      el.hidden = n === 0;
      el.style.display = n === 0 ? 'none' : '';
    });
  }

  function renderPage() {
    var root = document.querySelector('[data-wishlist-page]');
    if (!root) return;
    var grid = root.querySelector('[data-wishlist-grid]');
    var empty = root.querySelector('[data-wishlist-empty]');
    var countEl = root.querySelector('[data-wishlist-page-count]');
    var list = read();
    if (countEl) countEl.textContent = list.length === 1 ? '1 favoriet' : list.length + ' favorieten';
    if (!grid) return;
    if (!list.length) {
      grid.innerHTML = '';
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;
    var dbg = root.querySelector('[data-wishlist-debug]');
    if (dbg && /[?&]wldebug=1/.test(location.search)) {
      dbg.style.display = 'block';
      dbg.textContent = 'debug — opslag: ' + list.length + ' item(s)' +
        (list.length ? ' (' + list.map(function (x) { return (x.title || x.id); }).join(', ') + ')' : '');
    }
    grid.innerHTML = list.map(function (i) {
      var img = i.image
        ? '<img src="' + i.image + '" alt="' + (i.title || '') + '" loading="lazy">'
        : '<div class="wl-card__noimg"></div>';
      return '' +
        '<div class="wl-card" data-wl-card="' + i.id + '">' +
          '<button type="button" class="wl-card__remove" data-wishlist-remove="' + i.id + '" aria-label="Verwijder uit favorieten">&times;</button>' +
          '<a class="wl-card__media" href="' + i.url + '">' + img + '</a>' +
          '<a class="wl-card__title" href="' + i.url + '">' + (i.title || '') + '</a>' +
          '<div class="wl-card__price">' + (i.price || '') + '</div>' +
        '</div>';
    }).join('');
  }

  document.addEventListener('click', function (e) {
    var toggleBtn = e.target.closest('[data-wishlist-toggle]');
    if (toggleBtn) {
      e.preventDefault();
      e.stopPropagation();
      toggle(itemFromButton(toggleBtn));
      syncButtons();
      updateCount();
      renderPage();
      return;
    }
    var rm = e.target.closest('[data-wishlist-remove]');
    if (rm) {
      e.preventDefault();
      var id = rm.getAttribute('data-wishlist-remove');
      write(read().filter(function (i) { return String(i.id) !== String(id); }));
      syncButtons(); updateCount(); renderPage();
    }
  });

  document.addEventListener('wishlist:change', function () { updateCount(); });

  function init() { syncButtons(); updateCount(); renderPage(); }
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
  // Horizon rehydrates sections on navigation; re-sync on those events too.
  document.addEventListener('shopify:section:load', init);
  window.addEventListener('pageshow', init);

  window.PFWishlist = { read: read, toggle: toggle, sync: init };
})();
