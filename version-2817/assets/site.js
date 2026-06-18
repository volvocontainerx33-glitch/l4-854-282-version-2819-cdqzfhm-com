(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-main-nav]");

        if (!toggle || !nav) {
            return;
        }

        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");

        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
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
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var nextIndex = Number(dot.getAttribute("data-hero-dot") || 0);
                show(nextIndex);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function setupFiltering() {
        var input = document.querySelector("[data-filter-input]");
        var grid = document.querySelector("[data-filter-grid]");
        var count = document.querySelector("[data-filter-count]");
        var select = document.querySelector("[data-category-select]");

        if (!input || !grid) {
            return;
        }

        var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-search]"));
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";

        if (initialQuery) {
            input.value = initialQuery;
        }

        function applyFilter() {
            var query = input.value.trim().toLowerCase();
            var selectedCategory = select ? select.value : "";
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = (card.getAttribute("data-search") || "").toLowerCase();
                var category = card.getAttribute("data-category") || "";
                var matchesText = !query || haystack.indexOf(query) !== -1;
                var matchesCategory = !selectedCategory || category === selectedCategory;
                var shouldShow = matchesText && matchesCategory;

                card.classList.toggle("is-hidden", !shouldShow);

                if (shouldShow) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = visible + " 部影片";
            }
        }

        input.addEventListener("input", applyFilter);

        if (select) {
            select.addEventListener("change", applyFilter);
        }

        applyFilter();
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll(".player-card[data-video]"));

        players.forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-play-button]");
            var status = player.querySelector("[data-player-status]");
            var source = player.getAttribute("data-video");
            var initialized = false;
            var hlsInstance = null;

            if (!video || !button || !source) {
                return;
            }

            function setStatus(message) {
                if (status) {
                    status.textContent = message;
                }
            }

            function attachSource() {
                if (initialized) {
                    return;
                }

                initialized = true;
                setStatus("正在加载播放源...");

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });

                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);

                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setStatus("播放源已就绪");
                    });

                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setStatus("播放加载失败，请稍后重试");
                        }
                    });
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    setStatus("播放源已就绪");
                } else {
                    setStatus("当前浏览器不支持 HLS 播放");
                }
            }

            function playVideo() {
                attachSource();

                var playPromise = video.play();

                if (playPromise && typeof playPromise.then === "function") {
                    playPromise.then(function () {
                        player.classList.add("is-playing");
                        setStatus("正在播放");
                    }).catch(function () {
                        setStatus("请再次点击播放按钮开始播放");
                    });
                } else {
                    player.classList.add("is-playing");
                    setStatus("正在播放");
                }
            }

            button.addEventListener("click", playVideo);
            video.addEventListener("play", function () {
                player.classList.add("is-playing");
                setStatus("正在播放");
            });
            video.addEventListener("pause", function () {
                setStatus("已暂停");
            });
            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupFiltering();
        setupPlayers();
    });
}());
