(function () {
  function bindMobileMenu() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function bindHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function bindFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var scope = panel.closest('section') || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search-card]'));
      var search = panel.querySelector('[data-search-input]');
      var region = panel.querySelector('[data-region-filter]');
      var year = panel.querySelector('[data-year-filter]');
      var type = panel.querySelector('[data-type-filter]');
      var reset = panel.querySelector('[data-filter-reset]');
      var empty = scope.querySelector('[data-empty-state]');

      function valueOf(input) {
        return input ? input.value.trim().toLowerCase() : '';
      }

      function apply() {
        var keyword = valueOf(search);
        var selectedRegion = valueOf(region);
        var selectedYear = valueOf(year);
        var selectedType = valueOf(type);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.dataset.title || '',
            card.dataset.region || '',
            card.dataset.year || '',
            card.dataset.type || '',
            card.dataset.tags || '',
            card.dataset.category || ''
          ].join(' ').toLowerCase();
          var matched = true;
          if (keyword && haystack.indexOf(keyword) === -1) {
            matched = false;
          }
          if (selectedRegion && (card.dataset.region || '').toLowerCase() !== selectedRegion) {
            matched = false;
          }
          if (selectedYear && (card.dataset.year || '').toLowerCase() !== selectedYear) {
            matched = false;
          }
          if (selectedType && (card.dataset.type || '').toLowerCase() !== selectedType) {
            matched = false;
          }
          card.classList.toggle('hidden-card', !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      [search, region, year, type].forEach(function (input) {
        if (input) {
          input.addEventListener('input', apply);
          input.addEventListener('change', apply);
        }
      });
      if (reset) {
        reset.addEventListener('click', function () {
          [search, region, year, type].forEach(function (input) {
            if (input) {
              input.value = '';
            }
          });
          apply();
        });
      }
      apply();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindMobileMenu();
    bindHero();
    bindFilters();
  });
})();
