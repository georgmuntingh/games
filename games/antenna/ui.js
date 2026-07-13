// Small DOM helpers shared by the views.
import { getState, update } from './storage.js';
import { isShortVideo } from './parse.js';

/** h('button', { class: 'action', onclick: fn }, 'Save') */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null) continue;
    if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2), value);
    } else if (key === 'dataset') {
      Object.assign(el.dataset, value);
    } else {
      el.setAttribute(key, value);
    }
  }
  for (const child of children.flat(Infinity)) {
    if (child == null) continue;
    el.append(child.nodeType ? child : document.createTextNode(child));
  }
  return el;
}

export function toast(message) {
  const root = document.getElementById('toast-root');
  const el = h('div', { class: 'toast' }, message);
  root.append(el);
  setTimeout(() => el.remove(), 4000);
}

export function fmtDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const days = (Date.now() - d.getTime()) / 86400000;
  if (days < 1) return 'today';
  if (days < 2) return 'yesterday';
  if (days < 30) return `${Math.floor(days)} days ago`;
  return d.toLocaleDateString();
}

export function fmtDuration(sec) {
  if (sec == null) return '';
  const hrs = Math.floor(sec / 3600);
  const min = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const mm = hrs ? String(min).padStart(2, '0') : String(min);
  return `${hrs ? `${hrs}:` : ''}${mm}:${String(s).padStart(2, '0')}`;
}

export function fmtTimestamp(ms) {
  const d = new Date(ms);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

export function addToQueue(video) {
  const { videoId, title, author, thumbnail } = video;
  update((s) => {
    if (!s.queue.some((q) => q.videoId === videoId)) {
      s.queue.push({
        videoId,
        title: title || videoId,
        author: author || '',
        thumbnail: thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      });
    }
  });
  toast('Added to queue');
}

export function saveToLibrary(video) {
  update((s) => {
    if (!s.savedVideos.some((v) => v.videoId === video.videoId)) {
      s.savedVideos.unshift({
        videoId: video.videoId,
        title: video.title || video.videoId,
        author: video.author || '',
        channelId: video.channelId || '',
        thumbnail: video.thumbnail || `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`,
        durationSec: video.durationSec ?? null,
        addedAt: Date.now(),
      });
    }
  });
  toast('Saved to library');
}

export function createLocalPlaylist(name) {
  const playlist = { id: crypto.randomUUID(), name, items: [], createdAt: Date.now() };
  update((s) => {
    s.localPlaylists.push(playlist);
  });
  return playlist.id;
}

export function addToLocalPlaylist(playlistId, video) {
  const { videoId, title, author, thumbnail } = video;
  let name = '';
  let added = false;
  update((s) => {
    const p = s.localPlaylists.find((x) => x.id === playlistId);
    if (!p) return;
    name = p.name;
    if (!p.items.some((it) => it.videoId === videoId)) {
      p.items.push({
        videoId,
        title: title || videoId,
        author: author || '',
        thumbnail: thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      });
      added = true;
    }
  });
  if (name) toast(added ? `Added to ${name}` : `Already in ${name}`);
}

let openMenu = null;

function closePlaylistMenu() {
  if (!openMenu) return;
  openMenu.remove();
  openMenu = null;
  document.removeEventListener('click', onOutsideClick, true);
  document.removeEventListener('keydown', onMenuKeydown, true);
  window.removeEventListener('scroll', closePlaylistMenu, true);
}

function onOutsideClick(e) {
  if (openMenu && !openMenu.contains(e.target)) closePlaylistMenu();
}

function onMenuKeydown(e) {
  if (e.key === 'Escape') {
    e.stopPropagation(); // don't also leave the theater
    closePlaylistMenu();
  }
}

/** "+ Playlist" popup: pick a local playlist (or create one) for this video. */
export function openPlaylistMenu(video, anchorEl) {
  closePlaylistMenu();
  const items = getState().localPlaylists.map((p) =>
    h('button', {
      type: 'button',
      class: 'popup-item',
      onclick: () => {
        addToLocalPlaylist(p.id, video);
        closePlaylistMenu();
      },
    }, `${p.name} (${p.items.length})`),
  );
  const menu = h(
    'div',
    { class: 'popup-menu', role: 'menu' },
    items.length ? items : h('span', { class: 'popup-empty hint' }, 'No playlists yet'),
    h('button', {
      type: 'button',
      class: 'popup-item popup-new',
      onclick: () => {
        const name = prompt('New playlist name');
        if (name && name.trim()) addToLocalPlaylist(createLocalPlaylist(name.trim()), video);
        closePlaylistMenu();
      },
    }, '+ New playlist…'),
  );
  // Fixed positioning from the button; cards clip overflow so the menu
  // lives on document.body instead.
  const rect = anchorEl.getBoundingClientRect();
  menu.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - 228))}px`;
  menu.style.top = `${rect.bottom + 4}px`;
  document.body.append(menu);
  openMenu = menu;
  setTimeout(() => {
    document.addEventListener('click', onOutsideClick, true);
    document.addEventListener('keydown', onMenuKeydown, true);
    window.addEventListener('scroll', closePlaylistMenu, true);
  });
}

/**
 * A video card for the feed/library/search grids.
 * opts: { showSave, showPlaylist, showChannelLink, extraActions: [element] }
 */
export function videoCard(video, opts = {}) {
  const s = getState();
  const watched = Boolean(s.watched[video.videoId]);
  const watchHref = `#/watch/${video.videoId}`;
  const thumbnail = video.thumbnail || `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`;

  const badges = [];
  if (video.durationSec != null) badges.push(h('span', { class: 'badge' }, fmtDuration(video.durationSec)));
  else if (isShortVideo(video)) badges.push(h('span', { class: 'badge' }, 'Short'));
  if (watched) badges.push(h('span', { class: 'badge' }, '✓ watched'));

  const subParts = [];
  if (video.author) {
    subParts.push(
      video.channelId && opts.showChannelLink !== false
        ? h('a', { href: `#/channel/${video.channelId}` }, video.author)
        : video.author,
    );
  }
  if (video.publishedAt) subParts.push(subParts.length ? ' · ' : '', fmtDate(video.publishedAt));

  const actions = [
    h('button', { class: 'quiet', type: 'button', onclick: () => addToQueue(video) }, '+ Queue'),
  ];
  if (opts.showPlaylist !== false) {
    actions.push(
      h('button', {
        class: 'quiet',
        type: 'button',
        onclick: (e) => openPlaylistMenu(video, e.currentTarget),
      }, '+ Playlist'),
    );
  }
  if (opts.showSave !== false && !s.savedVideos.some((v) => v.videoId === video.videoId)) {
    actions.push(
      h('button', { class: 'quiet', type: 'button', onclick: () => saveToLibrary(video) }, 'Save'),
    );
  }
  if (opts.extraActions) actions.push(...opts.extraActions);

  return h(
    'article',
    { class: `video-card${watched ? ' watched' : ''}` },
    h(
      'a',
      { class: 'thumb', href: watchHref, 'aria-label': `Watch: ${video.title}` },
      h('img', { src: thumbnail, alt: '', loading: 'lazy' }),
      badges.length ? h('span', { class: 'badges' }, badges) : null,
    ),
    h(
      'div',
      { class: 'body' },
      h('a', { class: 'title', href: watchHref }, video.title || video.videoId),
      h('div', { class: 'sub' }, subParts),
      h('div', { class: 'actions' }, actions),
    ),
  );
}
