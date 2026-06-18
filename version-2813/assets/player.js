(function () {
    function initMoviePlayer(sourceUrl) {
        var box = document.querySelector('[data-player]');
        if (!box) {
            return;
        }
        var video = box.querySelector('video');
        var cover = box.querySelector('[data-cover-layer]');
        var playButton = box.querySelector('[data-play-button]');
        var hlsInstance = null;
        var ready = false;

        function attachSource() {
            if (!video || ready) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
            ready = true;
        }

        function startPlayback() {
            attachSource();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            if (video) {
                var result = video.play();
                if (result && typeof result.catch === 'function') {
                    result.catch(function () {
                        if (cover) {
                            cover.classList.remove('is-hidden');
                        }
                    });
                }
            }
        }

        function pauseToggle() {
            if (!video) {
                return;
            }
            if (video.paused) {
                startPlayback();
            } else {
                video.pause();
            }
        }

        if (playButton) {
            playButton.addEventListener('click', startPlayback);
        }
        if (cover) {
            cover.addEventListener('click', startPlayback);
        }
        if (video) {
            video.addEventListener('click', pauseToggle);
            video.addEventListener('play', function () {
                if (cover) {
                    cover.classList.add('is-hidden');
                }
            });
            video.addEventListener('ended', function () {
                if (cover) {
                    cover.classList.remove('is-hidden');
                }
            });
        }
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
})();
