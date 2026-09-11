/* Privatefun — collectiepagina: OF-logica voor tagfilters en het vasthouden van de scrollpositie. */
(function () {
  'use strict';

  var TAG = 'filter.p.tag';

  function results() {
    return document.querySelector('results-list');
  }

  /* ---------- 1. Meerdere tagfilters = OF in plaats van EN ----------
     Shopify combineert meerdere filter.p.tag-waarden server-side met EN: een product moet
     dan alle gekozen tags hebben, wat vrijwel altijd 0 resultaten oplevert. We halen daarom
     per tag de pagina op en voegen de grids samen, ontdubbeld op product-id. */
  var merging = false;

  function selectedTags() {
    try {
      return new URL(location.href).searchParams.getAll(TAG);
    } catch (e) {
      return [];
    }
  }

  function pageForTag(tag) {
    var url = new URL(location.href);
    url.searchParams.delete(TAG);
    url.searchParams.append(TAG, tag);
    url.searchParams.delete('page');
    return fetch(url.toString(), { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.text() : ''; })
      .catch(function () { return ''; });
  }

  function mergeFilters() {
    var root = results();
    if (!root) return;

    var tags = selectedTags();
    if (tags.length < 2) {
      root.removeAttribute('data-pf-merged');
      return;
    }

    var key = tags.slice().sort().join('||');
    if (merging || root.getAttribute('data-pf-merged') === key) return;
    merging = true;

    Promise.all(tags.map(pageForTag))
      .then(function (pages) {
        var items = [];
        var seen = Object.create(null);
        var donor = null;

        pages.forEach(function (html) {
          if (!html) return;
          var doc = new DOMParser().parseFromString(html, 'text/html');
          var list = doc.querySelector('results-list');
          var found = list && list.querySelector('.product-grid');
          if (!found) return;
          if (!donor) donor = list;
          found.querySelectorAll('.product-grid__item').forEach(function (item) {
            var id = item.getAttribute('data-product-id') || item.id;
            if (!id || seen[id]) return;
            seen[id] = true;
            items.push(item);
          });
        });

        var grid = root.querySelector('.product-grid');
        if (!grid && donor) {
          // De server gaf "geen producten": vervang die lege staat door een echte grid.
          var current = root.querySelector('#ResultsList');
          var replacement = donor.querySelector('#ResultsList');
          if (current && replacement) {
            current.replaceWith(document.importNode(replacement, true));
            grid = root.querySelector('.product-grid');
          }
        }

        if (grid) {
          grid.innerHTML = '';
          items.forEach(function (item) { grid.appendChild(document.importNode(item, true)); });
          var empty = root.querySelector('.main-collection-grid__empty');
          if (empty) empty.remove();
          root.querySelectorAll('.pagination, .pf-next-page').forEach(function (el) {
            el.style.display = 'none';
          });
        }

        document.querySelectorAll('.products-count-wrapper [role="status"]').forEach(function (el) {
          el.textContent = items.length === 1 ? '1 artikel' : items.length + ' artikelen';
        });

        root.setAttribute('data-pf-merged', key);
        merging = false;
      })
      .catch(function () { merging = false; });
  }

  /* ---------- 2. Blijf staan waar je stond bij het aanklikken van een filter ----------
     Bij een filterklik vervangt het thema de sectie-DOM en verspringt de pagina naar
     beneden. We onthouden de scrollpositie en zetten die ruim een seconde lang terug,
     tenzij de bezoeker zelf gaat scrollen. */
  var scrollGuardTimer = null;

  function scrollContainer() {
    if (window.matchMedia('(min-width: 990px)').matches) {
      return document.querySelector('.page-wrapper') || document.scrollingElement || document.documentElement;
    }
    return document.scrollingElement || document.documentElement;
  }

  function stopScrollGuard() {
    if (scrollGuardTimer) {
      clearInterval(scrollGuardTimer);
      scrollGuardTimer = null;
    }
  }

  ['wheel', 'touchstart', 'keydown'].forEach(function (name) {
    window.addEventListener(name, stopScrollGuard, { passive: true, capture: true });
  });

  document.addEventListener(
    'click',
    function (event) {
      var target = event.target;
      if (!target || !target.closest) return;
      if (!target.closest('.facets, .facets-block-wrapper')) return;
      // Echte links (bv. "wis alle filters") gewoon hun gang laten gaan.
      if (target.closest('a[href]')) return;

      var top = scrollContainer().scrollTop;
      stopScrollGuard();

      var ticks = 0;
      scrollGuardTimer = setInterval(function () {
        var el = scrollContainer();
        if (Math.abs(el.scrollTop - top) > 2) {
          el.scrollTo({ top: top, behavior: 'instant' });
        }
        if (++ticks > 24) stopScrollGuard();
      }, 50);
    },
    true
  );

  mergeFilters();
  document.addEventListener('DOMContentLoaded', mergeFilters);
  window.addEventListener('pageshow', mergeFilters);
  // facets.js meldt elke filterklik via deze events; event.promise lost op zodra de nieuwe DOM staat.
  function afterRender(event) {
    Promise.resolve(event.promise).then(mergeFilters, function () {});
  }
  document.addEventListener('shopify:collection:update', afterRender);
  document.addEventListener('shopify:search:update', afterRender);
})();
