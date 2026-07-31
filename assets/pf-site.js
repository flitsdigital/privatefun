/* Privatefun — kleine gedragsaanpassingen die op elke pagina gelden:
   1. FAQ-antwoorden schuiven rustig open en dicht.
   2. De reviewcarrousel bladert oneindig door (van laatste terug naar eerste). */
(function () {
  'use strict';

  /* ---------- 1. FAQ: eenvoudige uitschuif-animatie ---------- */
  function initFaq() {
    document.querySelectorAll('details[class*="__item"]').forEach(function (item) {
      if (item.dataset.pfFaq) return;
      var summary = item.querySelector('summary');
      var answer = item.querySelector(':scope > div');
      if (!summary || !answer || typeof answer.animate !== 'function') return;
      item.dataset.pfFaq = '1';

      summary.addEventListener('click', function (event) {
        event.preventDefault();
        if (item.dataset.pfBusy) return;
        item.dataset.pfBusy = '1';

        var finish = function () {
          answer.style.height = '';
          answer.style.overflow = '';
          delete item.dataset.pfBusy;
        };

        if (item.open) {
          var current = answer.scrollHeight;
          answer.style.overflow = 'hidden';
          var closing = answer.animate(
            [{ height: current + 'px', opacity: 1 }, { height: '0px', opacity: 0 }],
            { duration: 220, easing: 'cubic-bezier(.4,0,.2,1)' }
          );
          closing.onfinish = function () {
            item.open = false;
            finish();
          };
        } else {
          item.open = true;
          var target = answer.scrollHeight;
          answer.style.overflow = 'hidden';
          var opening = answer.animate(
            [{ height: '0px', opacity: 0 }, { height: target + 'px', opacity: 1 }],
            { duration: 260, easing: 'cubic-bezier(.4,0,.2,1)' }
          );
          opening.onfinish = finish;
        }
      });
    });
  }

  /* ---------- 2. Reviews: oneindig doorbladeren ---------- */
  function initReviewLoop() {
    document.querySelectorAll('[data-rv-next], [data-rv-prev]').forEach(function (button) {
      if (button.dataset.pfLoop) return;
      button.dataset.pfLoop = '1';

      var section = button.closest('.shopify-section') || document;
      var track = section.querySelector('[class*="__track"]');
      if (!track) return;

      var enable = function () {
        if (button.disabled) {
          button.disabled = false;
          button.removeAttribute('disabled');
        }
      };
      enable();

      // De sectie zet de knoppen zelf weer op uitgeschakeld aan begin/eind.
      if (typeof MutationObserver !== 'undefined') {
        new MutationObserver(enable).observe(button, { attributes: true, attributeFilter: ['disabled'] });
      }

      // In de capture-fase, zodat we vóór de eigen handler van de sectie zitten.
      button.addEventListener(
        'click',
        function (event) {
          var max = track.scrollWidth - track.clientWidth;
          if (max <= 0) return;
          var isNext = button.hasAttribute('data-rv-next');

          if (isNext && track.scrollLeft >= max - 8) {
            event.preventDefault();
            event.stopImmediatePropagation();
            track.scrollTo({ left: 0, behavior: 'smooth' });
          } else if (!isNext && track.scrollLeft <= 8) {
            event.preventDefault();
            event.stopImmediatePropagation();
            track.scrollTo({ left: max, behavior: 'smooth' });
          }
        },
        true
      );
    });
  }

  /* ---------- 3. Aanmeldknop nieuwsbrief: wit, goud bij hover (zoals de zoekknop) ---------- */
  function styleNewsletterButton() {
    document.querySelectorAll('footer form button[type="submit"]').forEach(function (button) {
      if (button.dataset.pfNl) return;
      button.dataset.pfNl = '1';

      var rest = function () {
        button.style.setProperty('background-color', '#ece9e2', 'important');
        button.style.setProperty('color', '#1a1a1a', 'important');
      };
      var hover = function () {
        button.style.setProperty('background-color', '#ce9d27', 'important');
        button.style.setProperty('color', '#0b0b0b', 'important');
      };

      button.style.setProperty('transition', 'background-color .18s ease, color .18s ease', 'important');
      button.style.setProperty('opacity', '1', 'important');
      rest();
      button.addEventListener('mouseenter', hover);
      button.addEventListener('focus', hover);
      button.addEventListener('mouseleave', rest);
      button.addEventListener('blur', rest);
    });
  }

  function run() {
    initFaq();
    initReviewLoop();
    styleNewsletterButton();
  }

  if (document.readyState !== 'loading') run();
  else document.addEventListener('DOMContentLoaded', run);
  document.addEventListener('shopify:section:load', run);
  window.addEventListener('pageshow', run);
})();
