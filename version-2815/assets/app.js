import { H as Hls } from './hls-dru42stk.js';

const ready = (callback) => {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
        return;
    }
    callback();
};

ready(() => {
    initMenu();
    initHero();
    initLocalFilters();
    initRankingFilter();
    initSearchFromQuery();
    initPlayers();
});

function initMenu() {
    const button = document.querySelector('[data-menu-toggle]');
    const nav = document.getElementById('siteNav');
    if (!button || !nav) {
        return;
    }

    button.addEventListener('click', () => {
        nav.classList.toggle('is-open');
    });
}

function initHero() {
    const hero = document.querySelector('[data-hero]');
    if (!hero) {
        return;
    }

    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const previous = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    const show = (nextIndex) => {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === index);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === index);
        });
    };

    const start = () => {
        stop();
        timer = window.setInterval(() => show(index + 1), 5200);
    };

    const stop = () => {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    };

    previous?.addEventListener('click', () => {
        show(index - 1);
        start();
    });

    next?.addEventListener('click', () => {
        show(index + 1);
        start();
    });

    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            show(Number(dot.dataset.heroDot || 0));
            start();
        });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
}

function normalize(value) {
    return String(value || '').trim().toLowerCase();
}

function initLocalFilters() {
    const grids = Array.from(document.querySelectorAll('[data-filter-grid]'));
    if (!grids.length) {
        return;
    }

    const textInputs = Array.from(document.querySelectorAll('[data-local-filter]'));
    const yearInputs = Array.from(document.querySelectorAll('[data-year-filter]'));
    const typeInputs = Array.from(document.querySelectorAll('[data-type-filter]'));
    const regionInputs = Array.from(document.querySelectorAll('[data-region-filter]'));
    const resultNote = document.querySelector('[data-result-note]');

    const applyFilters = () => {
        const query = normalize(textInputs.map((input) => input.value).find(Boolean));
        const year = normalize(yearInputs.map((input) => input.value).find(Boolean));
        const type = normalize(typeInputs.map((input) => input.value).find(Boolean));
        const region = normalize(regionInputs.map((input) => input.value).find(Boolean));
        let visibleCount = 0;

        grids.forEach((grid) => {
            const cards = Array.from(grid.querySelectorAll('.movie-card'));
            cards.forEach((card) => {
                const haystack = normalize(card.dataset.search);
                const cardYear = normalize(card.dataset.year);
                const cardType = normalize(card.dataset.type);
                const cardRegion = normalize(card.dataset.region);

                const matchesQuery = !query || haystack.includes(query);
                const matchesYear = !year || cardYear === year;
                const matchesType = !type || cardType.includes(type) || haystack.includes(type);
                const matchesRegion = !region || cardRegion === region;
                const visible = matchesQuery && matchesYear && matchesType && matchesRegion;

                card.classList.toggle('is-hidden', !visible);
                if (visible) {
                    visibleCount += 1;
                }
            });
        });

        if (resultNote) {
            resultNote.textContent = `当前显示 ${visibleCount} 部影片`;
        }
    };

    [...textInputs, ...yearInputs, ...typeInputs, ...regionInputs].forEach((input) => {
        input.addEventListener('input', applyFilters);
        input.addEventListener('change', applyFilters);
    });

    applyFilters();
}

function initRankingFilter() {
    const input = document.querySelector('[data-ranking-filter]');
    const list = document.querySelector('[data-ranking-list]');
    if (!input || !list) {
        return;
    }

    input.addEventListener('input', () => {
        const query = normalize(input.value);
        Array.from(list.querySelectorAll('.ranking-item')).forEach((item) => {
            const haystack = normalize(item.dataset.search);
            item.classList.toggle('is-hidden', query && !haystack.includes(query));
        });
    });
}

function initSearchFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    if (!query) {
        return;
    }

    const input = document.querySelector('[data-query-input]');
    if (input) {
        input.value = query;
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }
}

function initPlayers() {
    const players = Array.from(document.querySelectorAll('[data-player]'));
    players.forEach((player) => {
        const video = player.querySelector('video');
        const startButton = player.querySelector('[data-player-start]');
        const status = player.querySelector('[data-player-status]');
        if (!video || !startButton) {
            return;
        }

        let initialized = false;
        let hls = null;

        const setStatus = (message) => {
            if (status) {
                status.textContent = message;
            }
        };

        const playVideo = async () => {
            try {
                await video.play();
                player.classList.add('is-playing');
            } catch (error) {
                setStatus('浏览器阻止了自动播放，请再次点击播放。');
            }
        };

        const initialize = () => {
            if (initialized) {
                playVideo();
                return;
            }

            initialized = true;
            const source = video.dataset.src;
            if (!source) {
                setStatus('未找到播放源。');
                return;
            }

            video.controls = true;
            setStatus('正在加载播放内容...');

            if (Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });

                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    setStatus('播放源加载完成。');
                    playVideo();
                });
                hls.on(Hls.Events.ERROR, (event, data) => {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        setStatus('网络错误，正在重试加载。');
                        hls.startLoad();
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        setStatus('媒体错误，正在尝试恢复。');
                        hls.recoverMediaError();
                    } else {
                        setStatus('当前浏览器无法播放此视频源。');
                        hls.destroy();
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.addEventListener('loadedmetadata', playVideo, { once: true });
            } else {
                setStatus('您的浏览器不支持 HLS 视频播放。');
            }
        };

        startButton.addEventListener('click', initialize);
        video.addEventListener('click', () => {
            if (!initialized) {
                initialize();
            }
        });
        window.addEventListener('pagehide', () => {
            if (hls) {
                hls.destroy();
            }
        });
    });
}
