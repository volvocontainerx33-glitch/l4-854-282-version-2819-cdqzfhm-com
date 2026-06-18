(function () {
    function setMobileMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', menu.classList.contains('is-open') ? 'true' : 'false');
        });
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setFilters() {
        var panels = document.querySelectorAll('[data-filter-panel]');
        panels.forEach(function (panel) {
            var scope = panel.closest('[data-filter-scope]') || document;
            var input = panel.querySelector('[data-search-input]');
            var year = panel.querySelector('[data-filter-year]');
            var region = panel.querySelector('[data-filter-region]');
            var genre = panel.querySelector('[data-filter-genre]');
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
            var empty = scope.querySelector('[data-empty]');

            function apply() {
                var keyword = normalize(input && input.value);
                var yearValue = normalize(year && year.value);
                var regionValue = normalize(region && region.value);
                var genreValue = normalize(genre && genre.value);
                var visible = 0;
                cards.forEach(function (card) {
                    var text = normalize([
                        card.dataset.title,
                        card.dataset.year,
                        card.dataset.region,
                        card.dataset.genre,
                        card.dataset.tags
                    ].join(' '));
                    var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchYear = !yearValue || normalize(card.dataset.year) === yearValue;
                    var matchRegion = !regionValue || normalize(card.dataset.region) === regionValue;
                    var matchGenre = !genreValue || normalize(card.dataset.genre).indexOf(genreValue) !== -1;
                    var show = matchKeyword && matchYear && matchRegion && matchGenre;
                    card.hidden = !show;
                    if (show) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            [input, year, region, genre].forEach(function (node) {
                if (node) {
                    node.addEventListener('input', apply);
                    node.addEventListener('change', apply);
                }
            });
            apply();
        });
    }

    function setHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === active);
            });
        }

        function advance(step) {
            show(active + step);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                advance(1);
            }, 5600);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                advance(-1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                advance(1);
                restart();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                restart();
            });
        });
        show(0);
        restart();
    }

    document.addEventListener('DOMContentLoaded', function () {
        setMobileMenu();
        setFilters();
        setHero();
    });
})();
