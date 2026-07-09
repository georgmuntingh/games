// Background music: streams the Eggerland Mystery 2 (MSX) Stage Theme
// directly from its source URL at runtime — the file is referenced, not
// bundled. Browsers block autoplay, so playback begins on the first user
// gesture (see music.start() calls in main.js) and follows the Sound toggle.
// If the host is unreachable or blocks hotlinking, play() rejects and the
// game continues silently.

const TRACK_URL =
  'https://nu.vgmtreasurechest.com/soundtracks/eggerland-mystery-2-msx-gamerip-1986/vxbqywmv/02%20Stage%20Theme.mp3';

let el = null;
let started = false;
let muted = false;

function element() {
  if (!el) {
    el = new Audio(TRACK_URL);
    el.loop = true;
    el.volume = 0.4;
    el.preload = 'none';
  }
  return el;
}

export const music = {
  // Begin playback; safe to call on every gesture (idempotent).
  start() {
    started = true;
    if (!muted) element().play().catch(() => {});
  },
  setMuted(value) {
    muted = Boolean(value);
    if (muted) el?.pause();
    else if (started) element().play().catch(() => {});
  },
};
