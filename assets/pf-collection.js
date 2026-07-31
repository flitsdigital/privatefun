/* Privatefun — collectiepagina: OF-logica voor tagfilters, "naar volgende pagina"-knop
   en de opmaak van de filter-vinkjes. */
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
          var grid = list && list.querySelector('.product-grid');
          if (!grid) return;
          if (!donor) donor = list;
          grid.querySelectorAll('.product-grid__item').forEach(function (item) {
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
          // De samengevoegde lijst is compleet; paginering hoort er niet bij.
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

  /* ---------- 2. "Naar volgende pagina" met resterend aantal pagina's ---------- */
  function addNextPageButton() {
    var root = results();
    if (!root) return;
    if (root.getAttribute('data-pf-merged')) return;

    var nav = root.querySelector('.pagination');
    if (!nav || root.querySelector('.pf-next-page')) return;

    var grid = root.querySelector('.product-grid');
    var total = parseInt((grid && grid.getAttribute('data-last-page')) || '0', 10);
    var current = parseInt(nav.getAttribute('data-current_page') || '1', 10);
    if (!total || total < 2) return;

    var arrows = nav.querySelectorAll('a.pagination__link--arrow');
    var next = arrows.length ? arrows[arrows.length - 1] : null;
    // De laatste pijl is alleen "volgende" als hij niet ook de vorige-pijl is.
    if (next && current > 1 && arrows.length === 1 && current === total) next = null;

    var left = total - current;
    var box = document.createElement('div');
    box.className = 'pf-next-page';

    if (next) {
      var btn = document.createElement('a');
      btn.className = 'pf-next-page__btn';
      btn.href = next.getAttribute('href');
      btn.innerHTML =
        'Naar volgende pagina' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
      box.appendChild(btn);
    }

    var meta = document.createElement('p');
    meta.className = 'pf-next-page__meta';
    meta.textContent =
      'Pagina ' + current + ' van ' + total +
      (left > 0 ? ' · nog ' + left + (left > 1 ? " pagina's" : ' pagina') : '');
    box.appendChild(meta);

    nav.parentNode.insertBefore(box, nav);
  }

<<<<<<< HEAD
  /* ---------- 3. Filter-vinkjes in huisstijl ----------
     Het thema zet de rand van het vakje met een regel die via CSS niet te overrulen is,
     dus zetten we het vakje hier rechtstreeks (inline, important). */
=======
  /* ---------- 3. Filter-vinkjes in huisstijl ---------- */
>>>>>>> e247a877a8c29ca299aca2d3587b2b8a6c33c1cf
  function styleCheckboxes() {
    document.querySelectorAll('.facets .checkbox').forEach(function (box) {
      var input = box.querySelector('.checkbox__input');
      var mark = box.querySelector('svg.icon-checkmark');
      if (!input || !mark) return;

      input.style.setProperty('opacity', '0', 'important');
      input.style.setProperty('border', '0', 'important');
      input.style.setProperty('background', 'transparent', 'important');

      // Het vakje van het thema verbergen en ons eigen vakje ernaast zetten: op de svg
      // van het thema blijft de randkleur door themaregels overschreven worden.
      mark.style.setProperty('display', 'none', 'important');

      var custom = box.querySelector('.pf-cb');
      if (!custom) {
        custom = document.createElement('span');
        custom.className = 'pf-cb';
        custom.setAttribute('aria-hidden', 'true');
        custom.innerHTML =
          '<svg viewBox="0 0 20 20" width="12" height="12"><path d="M4.5 10.4l3.4 3.4 7.6-7.6" fill="none" ' +
          'stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        mark.parentNode.insertBefore(custom, mark);
      }

      var on = input.checked;
      custom.style.cssText =
        'display:inline-flex;align-items:center;justify-content:center;flex:none;' +
        'width:18px;height:18px;border-radius:4px;box-sizing:border-box;' +
        'transition:background-color .16s ease, box-shadow .16s ease;';
      custom.style.setProperty('background-color', on ? '#ce9d27' : '#ffffff', 'important');
      custom.style.setProperty(
        'box-shadow',
        'inset 0 0 0 1.5px ' + (on ? '#ce9d27' : 'rgba(26,26,26,0.32)'),
        'important'
      );
      var tick = custom.querySelector('svg');
      if (tick) tick.style.setProperty('opacity', on ? '1' : '0', 'important');

      if (!box.dataset.pfCb) {
        box.dataset.pfCb = '1';
        box.addEventListener('mouseenter', function () {
          if (!input.checked) {
            custom.style.setProperty('box-shadow', 'inset 0 0 0 1.5px #ce9d27', 'important');
          }
        });
        box.addEventListener('mouseleave', function () {
          if (!input.checked) {
            custom.style.setProperty('box-shadow', 'inset 0 0 0 1.5px rgba(26,26,26,0.32)', 'important');
          }
        });
        input.addEventListener('change', function () { styleCheckboxes(); });
      }
    });
  }

  function run() {
    styleCheckboxes();
    if (!results()) return;
    mergeFilters();
    addNextPageButton();
  }

  var timer;
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(run, 80);
  }

  schedule();
  document.addEventListener('DOMContentLoaded', schedule);
  window.addEventListener('popstate', schedule);
  window.addEventListener('pageshow', schedule);

  // facets.js vervangt de sectie-DOM bij elke filterklik; dan opnieuw toepassen.
  if (typeof MutationObserver !== 'undefined') {
    var observer = new MutationObserver(function () {
      if (!merging) schedule();
    });
    try {
      observer.observe(document.getElementById('MainContent') || document.body, {
        childList: true,
        subtree: true,
      });
    } catch (e) {}
  }
})();
