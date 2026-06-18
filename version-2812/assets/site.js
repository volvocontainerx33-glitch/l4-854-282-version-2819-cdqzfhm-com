(function () {
    var header = document.querySelector('.site-header');
    var toggle = document.querySelector('.mobile-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    if (header) {
        window.addEventListener('scroll', function () {
            header.classList.toggle('is-scrolled', window.scrollY > 8);
        }, { passive: true });
    }

    document.querySelectorAll('.hero').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('.hero-prev');
        var next = hero.querySelector('.hero-next');
        var index = 0;
        var timer = null;

        function show(target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    document.querySelectorAll('.filter-panel').forEach(function (panel) {
        var target = document.querySelector(panel.getAttribute('data-target'));
        if (!target) {
            return;
        }
        var input = panel.querySelector('.movie-search');
        var select = panel.querySelector('.movie-select');
        var empty = document.querySelector(panel.getAttribute('data-empty'));
        var cards = Array.prototype.slice.call(target.querySelectorAll('.movie-card'));

        function apply() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var type = select ? select.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-keywords')
                ].join(' ').toLowerCase();
                var cardType = card.getAttribute('data-type') || '';
                var matchedQuery = !query || text.indexOf(query) !== -1;
                var matchedType = !type || cardType === type;
                var matched = matchedQuery && matchedType;
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        if (input) {
            input.addEventListener('input', apply);
        }
        if (select) {
            select.addEventListener('change', apply);
        }
        apply();
    });

    document.querySelectorAll('.player-wrap').forEach(function (wrap) {
        var video = wrap.querySelector('video');
        var button = wrap.querySelector('.player-overlay');
        var stream = window.__playback || '';
        var ready = false;
        var hlsInstance = null;

        function reveal() {
            if (button) {
                button.classList.add('is-hidden');
            }
            if (video) {
                video.setAttribute('controls', 'controls');
            }
        }

        function begin() {
            if (!video || !stream) {
                return;
            }

            reveal();

            if (!ready) {
                ready = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                    var nativePlay = video.play();
                    if (nativePlay && nativePlay.catch) {
                        nativePlay.catch(function () {
                            if (button) {
                                button.classList.remove('is-hidden');
                            }
                        });
                    }
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        var parsedPlay = video.play();
                        if (parsedPlay && parsedPlay.catch) {
                            parsedPlay.catch(function () {
                                if (button) {
                                    button.classList.remove('is-hidden');
                                }
                            });
                        }
                    });
                    return;
                }

                video.src = stream;
            }

            var playPromise = video.play();
            if (playPromise && playPromise.catch) {
                playPromise.catch(function () {
                    if (button) {
                        button.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (button) {
            button.addEventListener('click', begin);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    begin();
                }
            });
            video.addEventListener('play', reveal);
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
