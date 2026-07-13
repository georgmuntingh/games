// The Antenna: a distraction-free YouTube wrapper. You choose what to watch —
// pasted videos, chronological channel feeds, playlists — nothing is pushed.
import { flush } from './storage.js';
import * as feed from './views/feed.js';
import * as library from './views/library.js';
import * as search from './views/search.js';
import * as historyView from './views/history.js';
import * as settings from './views/settings.js';
import * as theater from './views/theater.js';

const views = { feed, library, search, history: historyView, settings, theater };

function parseHash() {
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const [name, arg] = parts;
  if (name === 'watch' && arg) return { view: 'theater', params: { videoId: arg } };
  if (name === 'playlist' && arg) return { view: 'theater', params: { playlistId: arg } };
  if (name === 'channel' && arg) return { view: 'feed', params: { channelId: arg } };
  if (views[name]) return { view: name, params: {} };
  return { view: 'feed', params: {} };
}

let currentName = null;

function route() {
  const { view, params } = parseHash();
  if (currentName && currentName !== view) views[currentName].leave?.();
  currentName = view;
  for (const [name, mod] of Object.entries(views)) mod.el.hidden = name !== view;
  document.querySelectorAll('.tabs a').forEach((a) => {
    if (a.dataset.view === view) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  views[view].enter?.(params);
}

window.addEventListener('hashchange', route);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && currentName === 'theater') window.history.back();
});

window.addEventListener('pagehide', flush);

route();
