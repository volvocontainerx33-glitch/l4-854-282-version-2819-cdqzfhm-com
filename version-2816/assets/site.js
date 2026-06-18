(function () {
  var header = document.querySelector('[data-site-header]');
  var toggle = document.querySelector('[data-mobile-toggle]');

  if (header && toggle) {
    toggle.addEventListener('click', function () {
      header.classList.toggle('nav-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
        slide.setAttribute('aria-hidden', slideIndex === current ? 'false' : 'true');
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (slides.length > 1) {
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
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      start();
    }

    show(0);
  });

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-search-input]');
    var genre = scope.querySelector('[data-genre-filter]');
    var region = scope.querySelector('[data-region-filter]');
    var year = scope.querySelector('[data-year-filter]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
    var empty = scope.querySelector('[data-empty-state]');

    function valueOf(select) {
      return select ? select.value.trim().toLowerCase() : '';
    }

    function filter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var genreValue = valueOf(genre);
      var regionValue = valueOf(region);
      var yearValue = valueOf(year);
      var shown = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-genre') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-tags') || '',
          card.getAttribute('data-year') || ''
        ].join(' ').toLowerCase();
        var passKeyword = !keyword || text.indexOf(keyword) !== -1;
        var passGenre = !genreValue || (card.getAttribute('data-genre') || '').toLowerCase().indexOf(genreValue) !== -1;
        var passRegion = !regionValue || (card.getAttribute('data-region') || '').toLowerCase().indexOf(regionValue) !== -1;
        var passYear = !yearValue || (card.getAttribute('data-year') || '').toLowerCase() === yearValue;
        var visible = passKeyword && passGenre && passRegion && passYear;
        card.style.display = visible ? '' : 'none';
        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', shown === 0);
      }
    }

    [input, genre, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filter);
        control.addEventListener('change', filter);
      }
    });
  });

  function startVideo(shell) {
    var video = shell.querySelector('video');
    if (!video) {
      return;
    }

    var source = video.getAttribute('data-src');
    if (!source) {
      return;
    }

    shell.classList.add('is-playing');
    video.controls = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.getAttribute('src')) {
        video.setAttribute('src', source);
      }
      video.play().catch(function () {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!video._hlsInstance) {
        var hls = new window.Hls({ enableWorker: true });
        video._hlsInstance = hls;
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.play().catch(function () {});
      }
      return;
    }

    if (!video.getAttribute('src')) {
      video.setAttribute('src', source);
    }
    video.play().catch(function () {});
  }

  document.querySelectorAll('[data-video-shell]').forEach(function (shell) {
    shell.querySelectorAll('[data-play-trigger]').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        startVideo(shell);
      });
    });
  });
})();
