(function() {
  window.initPlayer = function(source) {
    var video = document.querySelector('.movie-player');
    var cover = document.querySelector('.player-cover');
    var button = document.querySelector('.player-play');
    var started = false;

    function attach() {
      if (!video || started) {
        return;
      }

      started = true;

      if (cover) {
        cover.classList.add('is-hidden');
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      video.controls = true;
      var attempt = video.play();

      if (attempt && attempt.catch) {
        attempt.catch(function() {});
      }
    }

    if (button) {
      button.addEventListener('click', attach);
    }

    if (cover) {
      cover.addEventListener('click', attach);
    }

    if (video) {
      video.addEventListener('click', function() {
        if (!started) {
          attach();
        }
      });
    }
  };
})();
