(function () {
  function initMoviePlayer(source) {
    var video = document.getElementById('moviePlayer');
    var overlay = document.querySelector('[data-play-overlay]');
    var startButton = document.querySelector('[data-start-play]');
    var connected = false;
    var hls = null;

    if (!video || !source) {
      return;
    }

    function connect() {
      if (connected) {
        return;
      }
      connected = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }
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
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          }
        });
        return;
      }
      video.src = source;
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    function playVideo() {
      connect();
      hideOverlay();
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          window.setTimeout(function () {
            video.play().catch(function () {});
          }, 220);
        });
      }
    }

    function toggleVideo() {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    }

    connect();

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }
    if (startButton) {
      startButton.addEventListener('click', function (event) {
        event.stopPropagation();
        playVideo();
      });
    }
    video.addEventListener('click', toggleVideo);
    video.addEventListener('play', hideOverlay);
    video.addEventListener('ended', function () {
      if (overlay) {
        overlay.classList.remove('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
