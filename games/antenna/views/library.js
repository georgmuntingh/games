// Library: add content, subscriptions + categories, saved videos, playlists,
// watch-later queue, and bulk import (Takeout CSV / OPML).
import { getState, update } from '../storage.js';
import { parseVideoInput, parsePlaylistInput, parseChannelInput, parseTakeoutCsv, parseOpml } from '../parse.js';
import { noembed, scrapeChannelId } from '../net.js';
import { refreshChannel } from '../feeds.js';
import * as api from '../api.js';
import { h, videoCard, toast, saveToLibrary } from '../ui.js';

export const el = document.getElementById('view-library');

let visible = false;

export function enter() {
  visible = true;
  render();
}

export function leave() {
  visible = false;
}

// --- adding content -----------------------------------------------------

async function resolveChannelRef(parsed) {
  const { apiKey } = getState().settings;
  if (parsed.kind === 'id') return { id: parsed.value, title: parsed.value };
  if (apiKey && (parsed.kind === 'handle' || parsed.kind === 'user')) {
    return api.resolveChannel(parsed, apiKey);
  }
  const path =
    parsed.kind === 'handle' ? `/@${parsed.value}`
    : parsed.kind === 'user' ? `/user/${parsed.value}`
    : `/c/${parsed.value}`;
  return scrapeChannelId(path);
}

function addChannel(id, title) {
  const s = getState();
  if (s.channels.some((c) => c.id === id)) return false;
  update((st) => {
    st.channels.push({ id, title: title || id, categoryId: null, addedAt: Date.now() });
  });
  return true;
}

async function handleAdd(input) {
  const raw = input.trim();
  if (!raw) return;

  const videoId = parseVideoInput(raw);
  if (videoId) {
    const { apiKey } = getState().settings;
    let meta = { videoId, title: `Video ${videoId}`, author: '' };
    try {
      meta = apiKey
        ? await api.videoMeta(videoId, apiKey)
        : await (async () => {
            const d = await noembed(`https://www.youtube.com/watch?v=${videoId}`);
            return { videoId, title: d.title, author: d.author_name };
          })();
    } catch {
      toast('Saved without title (metadata lookup failed)');
    }
    saveToLibrary(meta);
    return;
  }

  const playlistId = parsePlaylistInput(raw);
  if (playlistId) {
    if (getState().playlists.some((p) => p.playlistId === playlistId)) {
      toast('Playlist already in library');
      return;
    }
    let title = `Playlist ${playlistId}`;
    let author = '';
    try {
      const d = await noembed(`https://www.youtube.com/playlist?list=${playlistId}`);
      title = d.title || title;
      author = d.author_name || '';
    } catch {
      // keep placeholder title
    }
    update((s) => {
      s.playlists.unshift({ playlistId, title, author, addedAt: Date.now() });
    });
    toast('Playlist added');
    return;
  }

  const parsed = parseChannelInput(raw);
  if (parsed.kind !== 'unknown') {
    toast('Looking up channel…');
    try {
      const { id, title } = await resolveChannelRef(parsed);
      if (!addChannel(id, title)) {
        toast('Already subscribed');
        return;
      }
      toast(`Subscribed: ${title || id}`);
      // Warm the cache; the RSS feed title also fixes placeholder names.
      refreshChannel(id, { force: true }).catch(() => {});
    } catch (err) {
      toast(`Couldn't resolve channel: ${err.message}`);
    }
    return;
  }

  toast('Not a recognizable YouTube video, playlist, or channel');
}

function bulkAdd(channels) {
  let added = 0;
  update((s) => {
    for (const { id, title } of channels) {
      if (!s.channels.some((c) => c.id === id)) {
        s.channels.push({ id, title, categoryId: null, addedAt: Date.now() });
        added++;
      }
    }
  });
  toast(`Added ${added} channel${added === 1 ? '' : 's'}, skipped ${channels.length - added}`);
}

function importFileButton(label, accept, parseFn) {
  const fileInput = h('input', {
    type: 'file',
    accept,
    hidden: '',
    onchange: async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const channels = parseFn(await file.text());
        if (!channels.length) toast('No channels found in that file');
        else bulkAdd(channels);
      } catch (err) {
        toast(`Import failed: ${err.message}`);
      }
      e.target.value = '';
    },
  });
  return h(
    'span',
    {},
    fileInput,
    h('button', { class: 'quiet', type: 'button', onclick: () => fileInput.click() }, label),
  );
}

// --- sections -------------------------------------------------------------

function addSection() {
  const input = h('input', {
    type: 'text',
    placeholder: 'Paste a video, playlist, or channel URL (or @handle / UC… id)',
    style: 'flex:1; min-width: 16rem;',
    onkeydown: (e) => {
      if (e.key === 'Enter') submit();
    },
  });
  async function submit() {
    const value = input.value;
    input.value = '';
    await handleAdd(value);
  }
  return [
    h('h2', {}, 'Add'),
    h('div', { class: 'toolbar' },
      input,
      h('button', { class: 'action', type: 'button', onclick: submit }, 'Add'),
      importFileButton('Import Takeout CSV', '.csv,text/csv', parseTakeoutCsv),
      importFileButton('Import OPML', '.opml,.xml,text/xml', parseOpml),
    ),
    h('p', { class: 'hint' },
      'Bulk import: Google Takeout gives a subscriptions.csv; NewPipe/FreeTube export OPML.'),
  ];
}

function queueSection() {
  const s = getState();
  if (!s.queue.length) return [h('h2', {}, 'Queue'), h('p', { class: 'hint' }, 'Queue a video with “+ Queue” on any card. It plays continuously, in order.')];
  const rows = s.queue.map((q, i) =>
    h(
      'li',
      {},
      h('span', { class: 'grow' }, h('a', { href: `#/watch/${q.videoId}` }, q.title), q.author ? h('span', { class: 'hint' }, ` — ${q.author}`) : null),
      h('button', {
        class: 'quiet', type: 'button', title: 'Move up', disabled: i === 0 ? '' : null,
        onclick: () => update((st) => { [st.queue[i - 1], st.queue[i]] = [st.queue[i], st.queue[i - 1]]; }),
      }, '▲'),
      h('button', {
        class: 'quiet', type: 'button', title: 'Move down', disabled: i === s.queue.length - 1 ? '' : null,
        onclick: () => update((st) => { [st.queue[i], st.queue[i + 1]] = [st.queue[i + 1], st.queue[i]]; }),
      }, '▼'),
      h('button', {
        class: 'quiet', type: 'button', title: 'Remove',
        onclick: () => update((st) => { st.queue.splice(i, 1); }),
      }, '✕'),
    ),
  );
  return [
    h('div', { class: 'toolbar', style: 'margin-bottom:0' },
      h('h2', {}, `Queue (${s.queue.length})`),
      h('button', { class: 'action', type: 'button', onclick: () => { location.hash = `#/watch/${s.queue[0].videoId}`; } }, '▶ Play queue'),
    ),
    h('ul', { class: 'row-list' }, rows),
  ];
}

function categoryOptions(selectedId) {
  return [
    h('option', { value: '' }, '(no category)'),
    getState().categories.map((c) =>
      h('option', { value: c.id, selected: c.id === selectedId ? '' : null }, c.name),
    ),
  ];
}

function channelsSection() {
  const s = getState();
  const nameInput = h('input', { type: 'text', placeholder: 'New category name' });
  const addCategory = () => {
    const name = nameInput.value.trim();
    if (!name) return;
    nameInput.value = '';
    update((st) => {
      st.categories.push({ id: crypto.randomUUID(), name });
    });
  };
  const categoryRows = s.categories.map((c) =>
    h(
      'li',
      {},
      h('span', { class: 'grow' }, c.name),
      h('button', {
        class: 'quiet', type: 'button',
        onclick: () => {
          const name = prompt('Rename category', c.name);
          if (name && name.trim()) update((st) => { st.categories.find((x) => x.id === c.id).name = name.trim(); });
        },
      }, 'Rename'),
      h('button', {
        class: 'danger', type: 'button',
        onclick: () => update((st) => {
          st.categories = st.categories.filter((x) => x.id !== c.id);
          for (const ch of st.channels) if (ch.categoryId === c.id) ch.categoryId = null;
        }),
      }, 'Delete'),
    ),
  );
  const channelRows = s.channels
    .slice()
    .sort((a, b) => a.title.localeCompare(b.title))
    .map((c) =>
      h(
        'li',
        {},
        h('span', { class: 'grow' }, h('a', { href: `#/channel/${c.id}` }, c.title)),
        h('select', {
          'aria-label': `Category for ${c.title}`,
          onchange: (e) => update((st) => { st.channels.find((x) => x.id === c.id).categoryId = e.target.value || null; }),
        }, categoryOptions(c.categoryId)),
        h('button', {
          class: 'danger', type: 'button',
          onclick: () => {
            if (confirm(`Unsubscribe from ${c.title}?`)) {
              update((st) => { st.channels = st.channels.filter((x) => x.id !== c.id); });
            }
          },
        }, 'Unsubscribe'),
      ),
    );
  return [
    h('h2', {}, `Subscriptions (${s.channels.length})`),
    s.channels.length ? h('ul', { class: 'row-list' }, channelRows) : h('p', { class: 'hint' }, 'No channels yet.'),
    h('h2', {}, 'Categories'),
    h('div', { class: 'toolbar' }, nameInput, h('button', { class: 'quiet', type: 'button', onclick: addCategory }, 'Add category')),
    s.categories.length ? h('ul', { class: 'row-list' }, categoryRows) : null,
  ];
}

function savedSection() {
  const s = getState();
  const cards = s.savedVideos.map((v) =>
    videoCard(v, {
      showSave: false,
      extraActions: [
        h('button', {
          class: 'danger', type: 'button',
          onclick: () => update((st) => { st.savedVideos = st.savedVideos.filter((x) => x.videoId !== v.videoId); }),
        }, 'Remove'),
      ],
    }),
  );
  return [
    h('h2', {}, `Saved videos (${s.savedVideos.length})`),
    s.savedVideos.length ? h('div', { class: 'card-grid' }, cards) : h('p', { class: 'hint' }, 'Paste a video URL above to save it here.'),
  ];
}

function playlistsSection() {
  const s = getState();
  const rows = s.playlists.map((p) =>
    h(
      'li',
      {},
      h('span', { class: 'grow' },
        h('a', { href: `#/playlist/${p.playlistId}` }, p.title),
        p.author ? h('span', { class: 'hint' }, ` — ${p.author}`) : null),
      h('button', {
        class: 'danger', type: 'button',
        onclick: () => update((st) => { st.playlists = st.playlists.filter((x) => x.playlistId !== p.playlistId); }),
      }, 'Remove'),
    ),
  );
  return [
    h('h2', {}, `Playlists (${s.playlists.length})`),
    s.playlists.length ? h('ul', { class: 'row-list' }, rows) : h('p', { class: 'hint' }, 'Paste a playlist URL above to keep it here. Playlists play natively — no API key needed.'),
  ];
}

function render() {
  if (!visible) return;
  el.replaceChildren(
    ...addSection(),
    ...queueSection(),
    ...savedSection(),
    ...playlistsSection(),
    ...channelsSection(),
  );
}

document.addEventListener('antenna:change', () => {
  if (visible) render();
});
