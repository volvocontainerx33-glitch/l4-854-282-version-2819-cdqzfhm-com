(function() {
  var toggle = document.querySelector('[data-nav-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function() {
      panel.classList.toggle('is-open');
    });
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function setupFilters() {
    var blocks = document.querySelectorAll('[data-filter-block]');

    blocks.forEach(function(block) {
      var input = block.querySelector('[data-filter-input]');
      var year = block.querySelector('[data-filter-year]');
      var type = block.querySelector('[data-filter-type]');
      var category = block.querySelector('[data-filter-category]');
      var cards = Array.prototype.slice.call(block.querySelectorAll('[data-card]'));
      var count = block.querySelector('[data-result-count]');
      var empty = block.querySelector('[data-empty-state]');
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q') || '';

      if (input && query) {
        input.value = query;
      }

      function apply() {
        var q = normalize(input && input.value);
        var y = year ? normalize(year.value) : '';
        var t = type ? normalize(type.value) : '';
        var c = category ? normalize(category.value) : '';
        var visible = 0;

        cards.forEach(function(card) {
          var text = normalize(card.getAttribute('data-text'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var cardType = normalize(card.getAttribute('data-type'));
          var cardCategory = normalize(card.getAttribute('data-category'));
          var match = true;

          if (q && text.indexOf(q) === -1) {
            match = false;
          }

          if (y && cardYear !== y) {
            match = false;
          }

          if (t && cardType !== t) {
            match = false;
          }

          if (c && cardCategory !== c) {
            match = false;
          }

          card.style.display = match ? '' : 'none';
          if (match) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = visible + ' 部';
        }

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      [input, year, type, category].forEach(function(el) {
        if (el) {
          el.addEventListener('input', apply);
          el.addEventListener('change', apply);
        }
      });

      apply();
    });
  }

  setupFilters();
})();
