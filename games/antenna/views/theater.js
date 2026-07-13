// Theater: the watch page. Owns the single YouTube player, resume positions,
// watched marking, and the end-of-video takeover (end card / queue advance)
// that keeps YouTube's related-videos wall out of sight.
import { getState, update, recordPosition, clearPosition, markWatched, flush } from '../storage.js';
import { createPlayer } from '../player.js';
import { findCachedVideo } from '../feeds.js';
import { openPlaylistMenu } from '../ui.js';

export const el = document.getElementById('view-theater');

const titleEl = document.getElementById('theater-title');
const authorEl = document.getElementById('theater-author');
const endCard = document.getElementById('end-card');
const upNext = document.getElementById('up-next');
const upNextTitle = document.getElementById('un-title');
const upNextCountdown = document.getElementById('un-countdown');
const prevBtn = document.getElementById('th-prev');
const nextBtn = document.getElementById('th-next');

let playerPromise = null; // created once, reused for every video
let current = null; // { videoId, playlistId, localPlaylistId, index, title, author }
let countdownTimer = null;
let pendingNext = null;
let lastTime = 0; // latest known playback position, for synchronous saves

function savePosition(t) {
  lastTime = t;
  if (current?.videoId) recordPosition(current.videoId, t);
}

function ensurePlayer() {
  playerPromise ??= createPlayer('player', {
    onPlaying: handlePlaying,
    onPaused: savePosition,
    onTick: savePosition,
    onEnded: handleEnded,
  });
  return playerPromise;
}

function lookupMeta(videoId) {
  const s = getState();
  return (
    s.savedVideos.find((v) => v.videoId === videoId) ||
    s.queue.find((v) => v.videoId === videoId) ||
    findCachedVideo(videoId) ||
    s.history.find((v) => v.videoId === videoId) ||
    null
  );
}

function setMeta(title, author) {
  titleEl.textContent = title || '';
  const parts = [author || ''];
  if (current?.localPlaylistId) {
    const p = getState().localPlaylists.find((x) => x.id === current.localPlaylistId);
    if (p) parts.push(`${p.name} · ${current.index + 1}/${p.items.length}`);
  }
  authorEl.textContent = parts.filter(Boolean).join(' — ');
}

/** The local playlist being played, or null. */
function currentLocalPlaylist() {
  if (!current?.localPlaylistId) return null;
  return getState().localPlaylists.find((x) => x.id === current.localPlaylistId) || null;
}

function hideOverlays() {
  clearInterval(countdownTimer);
  countdownTimer = null;
  pendingNext = null;
  endCard.hidden = true;
  upNext.hidden = true;
}

function updateNavButtons() {
  // A local playlist context takes priority over queue membership.
  const localList = currentLocalPlaylist();
  if (localList) {
    const i = current.index;
    prevBtn.hidden = !(i > 0);
    nextBtn.hidden = !(i < localList.items.length - 1);
    prevBtn.textContent = '⏮ Previous';
    nextBtn.textContent = 'Next ⏭';
    prevBtn.onclick = i > 0 ? () => { location.hash = `#/local/${localList.id}/${i - 1}`; } : null;
    nextBtn.onclick =
      i < localList.items.length - 1
        ? () => { location.hash = `#/local/${localList.id}/${i + 1}`; }
        : null;
    return;
  }
  const s = getState();
  const idx = current?.videoId ? s.queue.findIndex((q) => q.videoId === current.videoId) : -1;
  prevBtn.hidden = !(idx > 0);
  nextBtn.hidden = !(idx !== -1 && idx < s.queue.length - 1);
  prevBtn.textContent = '⏮ Previous in queue';
  nextBtn.textContent = 'Next in queue ⏭';
  prevBtn.onclick = idx > 0 ? () => { location.hash = `#/watch/${s.queue[idx - 1].videoId}`; } : null;
  nextBtn.onclick =
    idx !== -1 && idx < s.queue.length - 1
      ? () => { location.hash = `#/watch/${s.queue[idx + 1].videoId}`; }
      : null;
}

function handlePlaying(data) {
  hideOverlays();
  if (!current) return;
  // In playlist mode the player advances by itself: track the item change,
  // marking the finished one as watched.
  if (current.playlistId && data.videoId && data.videoId !== current.videoId) {
    if (current.videoId) {
      markWatched(current);
      clearPosition(current.videoId);
    }
    current.videoId = data.videoId;
  }
  if (data.title) {
    current.title = data.title;
    current.author = data.author || current.author;
    setMeta(current.title, current.author);
  }
  updateNavButtons();
}

function showEndCard() {
  const hasQueue = getState().queue.length > 0;
  document.getElementById('ec-next').hidden = !hasQueue;
  endCard.hidden = false;
}

function showUpNext(title, targetHash) {
  pendingNext = targetHash;
  upNextTitle.textContent = title;
  let remaining = 5;
  upNextCountdown.textContent = `Playing in ${remaining}…`;
  upNext.hidden = false;
  countdownTimer = setInterval(() => {
    remaining -= 1;
    if (remaining <= 0) playPendingNext();
    else upNextCountdown.textContent = `Playing in ${remaining}…`;
  }, 1000);
}

function playPendingNext() {
  const target = pendingNext;
  hideOverlays();
  if (target) location.hash = target;
}

function handleEnded() {
  if (!current?.videoId) return;
  markWatched(current);
  clearPosition(current.videoId);

  // Local playlist playback: advance by index; items are never consumed.
  const localList = currentLocalPlaylist();
  if (localList) {
    const next = localList.items[current.index + 1];
    if (next) {
      showUpNext(next.title, `#/local/${localList.id}/${current.index + 1}`);
      return;
    }
    showEndCard();
    return;
  }

  const s = getState();
  const idx = s.queue.findIndex((q) => q.videoId === current.videoId);
  if (idx !== -1) {
    const next = s.queue[idx + 1] || null;
    update((st) => {
      st.queue.splice(idx, 1); // watched = done with watch-later
    });
    if (next) {
      showUpNext(next.title, `#/watch/${next.videoId}`);
      return;
    }
  }
  showEndCard();
}

export async function enter(params = {}) {
  hideOverlays();

  // Resolve the playback context and show metadata immediately; only then
  // await the player (its API script can be slow to arrive).
  let load = null;

  if (params.playlistId) {
    const known = getState().playlists.find((p) => p.playlistId === params.playlistId);
    current = { videoId: '', playlistId: params.playlistId, title: known?.title || 'Playlist', author: known?.author || '' };
    load = (p) => p.loadPlaylist(params.playlistId);
  } else if (params.localPlaylistId) {
    const list = getState().localPlaylists.find((p) => p.id === params.localPlaylistId);
    const item = list?.items[params.index];
    if (!item) {
      location.hash = '#/library';
      return;
    }
    current = {
      videoId: item.videoId,
      playlistId: '',
      localPlaylistId: list.id,
      index: params.index,
      title: item.title,
      author: item.author,
    };
    const pos = getState().positions[item.videoId]?.t || 0;
    load = (p) => p.loadVideo(item.videoId, pos > 5 ? pos : 0);
  } else {
    const videoId = params.videoId;
    if (!videoId) {
      location.hash = '#/feed';
      return;
    }
    // Same plain video re-routed (e.g. hashchange noise): keep playing.
    if (current?.videoId === videoId && !current.playlistId && !current.localPlaylistId) return;
    const meta = lookupMeta(videoId);
    current = { videoId, playlistId: '', title: meta?.title || 'Loading…', author: meta?.author || '' };
    const pos = getState().positions[videoId]?.t || 0;
    const dur = meta?.durationSec;
    const start = pos > 5 && (dur == null || pos < dur - 10) ? pos : 0;
    load = (p) => p.loadVideo(videoId, start);
  }

  setMeta(current.title, current.author);
  updateNavButtons();
  const player = await ensurePlayer();
  load(player);
}

export function leave() {
  hideOverlays();
  const videoId = current?.videoId;
  current = null;
  lastTime = 0;
  if (playerPromise) {
    playerPromise.then((p) => {
      const t = p.currentTime();
      if (videoId && t > 5) recordPosition(videoId, t);
      p.stop();
    });
  }
}

// Persist the position even on tab close / app switch mid-video. Must be
// synchronous, so it uses the last tick time rather than asking the player.
window.addEventListener('pagehide', () => {
  if (current?.videoId && lastTime > 5) recordPosition(current.videoId, lastTime);
  flush();
});

document.getElementById('ec-replay').addEventListener('click', async () => {
  if (!current?.videoId) return;
  hideOverlays();
  (await ensurePlayer()).loadVideo(current.videoId, 0);
});

document.getElementById('ec-next').addEventListener('click', () => {
  const next = getState().queue[0];
  hideOverlays();
  if (next) location.hash = `#/watch/${next.videoId}`;
});

document.getElementById('ec-back').addEventListener('click', () => {
  window.history.back();
});

document.getElementById('un-play').addEventListener('click', playPendingNext);

document.getElementById('un-cancel').addEventListener('click', () => {
  hideOverlays();
  showEndCard();
});

document.getElementById('th-save-playlist').addEventListener('click', (e) => {
  if (!current?.videoId) return;
  openPlaylistMenu(
    {
      videoId: current.videoId,
      title: current.title,
      author: current.author,
      thumbnail: `https://i.ytimg.com/vi/${current.videoId}/hqdefault.jpg`,
    },
    e.currentTarget,
  );
});

document.addEventListener('antenna:change', () => {
  if (!el.hidden && current) updateNavButtons();
});
