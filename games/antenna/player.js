// YouTube IFrame Player API wrapper. One player instance, created lazily on
// first theater entry, reused for every video/playlist afterwards.
// Privacy-enhanced host: youtube-nocookie.com.

let apiPromise = null;

function ensureApi() {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve(window.YT);
      return;
    }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prev === 'function') prev();
      resolve(window.YT);
    };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(s);
  });
  return apiPromise;
}

/**
 * Create the player inside #<elementId>.
 * Handlers: onEnded(), onPaused(time), onPlaying(videoData), onTick(time) —
 * onTick fires every 5 s while playing (used for resume positions).
 */
export async function createPlayer(elementId, { onEnded, onPaused, onPlaying, onTick } = {}) {
  const YT = await ensureApi();
  let player = null;
  let tickTimer = null;

  function currentTime() {
    try {
      return player?.getCurrentTime?.() || 0;
    } catch {
      return 0;
    }
  }

  function stopTick() {
    clearInterval(tickTimer);
    tickTimer = null;
  }

  function startTick() {
    stopTick();
    tickTimer = setInterval(() => onTick?.(currentTime()), 5000);
  }

  await new Promise((resolve) => {
    player = new YT.Player(elementId, {
      host: 'https://www.youtube-nocookie.com',
      width: '100%',
      height: '100%',
      playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
      events: {
        onReady: resolve,
        onStateChange: (e) => {
          if (e.data === YT.PlayerState.ENDED) {
            stopTick();
            onEnded?.();
          } else if (e.data === YT.PlayerState.PAUSED) {
            stopTick();
            onPaused?.(currentTime());
          } else if (e.data === YT.PlayerState.PLAYING) {
            startTick();
            onPlaying?.(videoData());
          }
        },
      },
    });
  });

  function videoData() {
    try {
      const d = player.getVideoData() || {};
      return { videoId: d.video_id || '', title: d.title || '', author: d.author || '' };
    } catch {
      return { videoId: '', title: '', author: '' };
    }
  }

  return {
    loadVideo(videoId, startSeconds = 0) {
      player.loadVideoById({ videoId, startSeconds });
    },
    loadPlaylist(playlistId) {
      player.loadPlaylist({ listType: 'playlist', list: playlistId });
    },
    stop() {
      stopTick();
      try {
        player.stopVideo();
      } catch {
        // player may not be ready; nothing to stop
      }
    },
    currentTime,
    videoData,
    duration() {
      try {
        return player.getDuration() || 0;
      } catch {
        return 0;
      }
    },
  };
}
