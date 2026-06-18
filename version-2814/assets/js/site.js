(function () {
    "use strict";

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function bindMenu() {
        var toggle = document.querySelector(".js-menu-toggle");
        var nav = document.getElementById("mobileNav");

        if (!toggle || !nav) {
            return;
        }

        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function bindSearch() {
        var modal = document.getElementById("searchModal");
        var input = document.getElementById("globalSearchInput");
        var results = document.getElementById("globalSearchResults");
        var openButtons = document.querySelectorAll(".js-search-open");
        var closeButtons = document.querySelectorAll(".js-search-close");
        var index = window.MOVIE_INDEX || [];

        if (!modal || !input || !results) {
            return;
        }

        function openModal() {
            modal.classList.add("is-open");
            modal.setAttribute("aria-hidden", "false");
            document.body.classList.add("modal-open");
            setTimeout(function () {
                input.focus();
            }, 40);
            renderResults(input.value);
        }

        function closeModal() {
            modal.classList.remove("is-open");
            modal.setAttribute("aria-hidden", "true");
            document.body.classList.remove("modal-open");
        }

        function buildResult(item) {
            var link = document.createElement("a");
            var image = document.createElement("img");
            var box = document.createElement("span");
            var title = document.createElement("strong");
            var line = document.createElement("span");
            var meta = document.createElement("em");

            link.className = "search-result-card";
            link.href = item.link;
            image.src = item.cover;
            image.alt = item.title;
            title.textContent = item.title;
            line.textContent = item.oneLine;
            meta.textContent = item.year + " · " + item.region + " · " + item.type;

            box.appendChild(title);
            box.appendChild(line);
            box.appendChild(meta);
            link.appendChild(image);
            link.appendChild(box);
            return link;
        }

        function renderResults(query) {
            var text = String(query || "").trim().toLowerCase();
            var matched = index;

            if (text) {
                matched = index.filter(function (item) {
                    return item.search.toLowerCase().indexOf(text) !== -1;
                });
            }

            results.innerHTML = "";

            matched.slice(0, 40).forEach(function (item) {
                results.appendChild(buildResult(item));
            });

            if (matched.length === 0) {
                var empty = document.createElement("div");
                empty.className = "empty-state";
                empty.textContent = "没有找到匹配影片";
                results.appendChild(empty);
            }
        }

        openButtons.forEach(function (button) {
            button.addEventListener("click", openModal);
        });

        closeButtons.forEach(function (button) {
            button.addEventListener("click", closeModal);
        });

        input.addEventListener("input", function () {
            renderResults(input.value);
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                closeModal();
            }
        });
    }

    function bindHero() {
        var hero = document.querySelector(".hero-carousel");

        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var previous = hero.querySelector(".js-hero-prev");
        var next = hero.querySelector(".js-hero-next");
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        }

        function move(step) {
            show(active + step);
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                move(1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (previous) {
            previous.addEventListener("click", function () {
                move(-1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                move(1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-slide")) || 0);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function bindPageFilter() {
        var input = document.querySelector(".js-page-filter");
        var sort = document.querySelector(".js-page-sort");
        var grid = document.querySelector(".js-card-grid");
        var empty = document.querySelector(".js-empty-state");

        if (!grid) {
            return;
        }

        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

        function apply() {
            var query = input ? input.value.trim().toLowerCase() : "";
            var visibleCount = 0;

            cards.forEach(function (card) {
                var haystack = (card.getAttribute("data-search") || "").toLowerCase();
                var visible = !query || haystack.indexOf(query) !== -1;
                card.hidden = !visible;
                if (visible) {
                    visibleCount += 1;
                }
            });

            if (empty) {
                empty.hidden = visibleCount !== 0;
            }
        }

        function applySort() {
            var value = sort ? sort.value : "default";
            var sorted = cards.slice();

            if (value === "year-desc") {
                sorted.sort(function (a, b) {
                    return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
                });
            }

            if (value === "year-asc") {
                sorted.sort(function (a, b) {
                    return Number(a.getAttribute("data-year")) - Number(b.getAttribute("data-year"));
                });
            }

            if (value === "title") {
                sorted.sort(function (a, b) {
                    return String(a.getAttribute("data-title")).localeCompare(String(b.getAttribute("data-title")), "zh-Hans-CN");
                });
            }

            sorted.forEach(function (card) {
                grid.appendChild(card);
            });

            cards = sorted;
            apply();
        }

        if (input) {
            input.addEventListener("input", apply);
        }

        if (sort) {
            sort.addEventListener("change", applySort);
        }
    }

    ready(function () {
        bindMenu();
        bindSearch();
        bindHero();
        bindPageFilter();
    });
}());

function initMoviePlayer(source) {
    "use strict";

    var shell = document.getElementById("moviePlayer");
    var video = document.getElementById("movieVideo");
    var overlay = document.getElementById("playerOverlay");
    var toggle = document.getElementById("playerToggle");
    var mute = document.getElementById("playerMute");
    var full = document.getElementById("playerFull");
    var message = document.getElementById("playerMessage");
    var attached = false;
    var hls = null;

    if (!shell || !video || !source) {
        return;
    }

    function showMessage() {
        if (message) {
            message.hidden = false;
        }
    }

    function attachSource() {
        if (attached) {
            return;
        }

        attached = true;

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }

                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                    return;
                }

                if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                    return;
                }

                showMessage();
            });
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return;
        }

        showMessage();
    }

    function play() {
        attachSource();
        video.play().then(function () {
            shell.classList.add("is-playing");
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            if (toggle) {
                toggle.textContent = "暂停";
            }
        }).catch(function () {
            showMessage();
        });
    }

    function pause() {
        video.pause();
        shell.classList.remove("is-playing");
        if (toggle) {
            toggle.textContent = "播放";
        }
    }

    function togglePlay() {
        if (video.paused) {
            play();
        } else {
            pause();
        }
    }

    if (overlay) {
        overlay.addEventListener("click", play);
    }

    if (toggle) {
        toggle.addEventListener("click", togglePlay);
    }

    video.addEventListener("click", togglePlay);
    video.addEventListener("play", function () {
        shell.classList.add("is-playing");
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        if (toggle) {
            toggle.textContent = "暂停";
        }
    });
    video.addEventListener("pause", function () {
        shell.classList.remove("is-playing");
        if (toggle) {
            toggle.textContent = "播放";
        }
    });

    if (mute) {
        mute.addEventListener("click", function () {
            video.muted = !video.muted;
            mute.textContent = video.muted ? "取消静音" : "静音";
        });
    }

    if (full) {
        full.addEventListener("click", function () {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else if (shell.requestFullscreen) {
                shell.requestFullscreen();
            }
        });
    }

    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
}
