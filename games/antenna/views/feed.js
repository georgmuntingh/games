// Subscriptions feed: chronological uploads from your channels. Start view.
import { getState } from '../storage.js';
import { getMergedFeed, refreshAll, lastRefreshed } from '../feeds.js';
import { h, videoCard, toast, fmtTimestamp } from '../ui.js';

export const el = document.getElementById('view-feed');

const filters = { categoryId: '', channelId: '', hideWatched: false, text: '' };
let visible = false;
let refreshing = false;

export function enter(params = {}) {
  visible = true;
  filters.channelId = params.channelId || '';
  render();
  // Warm stale caches on entry; TTL is respected inside refreshChannel.
  if (getState().channels.length) doRefresh(false);
}

export function leave() {
  visible = false;
}

async function doRefresh(force) {
  if (refreshing) return;
  refreshing = true;
  render();
  try {
    const { failed } = await refreshAll({ force });
    for (const f of failed.slice(0, 3)) toast(`Couldn't refresh ${f.title}: ${f.error}`);
    if (failed.length > 3) toast(`…and ${failed.length - 3} more channels failed`);
  } finally {
    refreshing = false;
    if (visible) render();
  }
}

function toolbar() {
  const s = getState();
  const categorySelect = h(
    'select',
    { 'aria-label': 'Category', onchange: (e) => { filters.categoryId = e.target.value; render(); } },
    h('option', { value: '' }, 'All categories'),
    s.categories.map((c) =>
      h('option', { value: c.id, selected: filters.categoryId === c.id ? '' : null }, c.name),
    ),
  );
  const hideWatchedBox = h('input', {
    type: 'checkbox',
    onchange: (e) => { filters.hideWatched = e.target.checked; render(); },
  });
  hideWatchedBox.checked = filters.hideWatched;
  const textInput = h('input', {
    type: 'search',
    placeholder: 'Filter by title…',
    value: filters.text,
    oninput: (e) => { filters.text = e.target.value; renderGrid(); },
  });
  const last = lastRefreshed();
  return h(
    'div',
    { class: 'toolbar' },
    s.categories.length ? categorySelect : null,
    h('label', {}, hideWatchedBox, 'Hide watched'),
    textInput,
    h(
      'button',
      { class: 'quiet', type: 'button', disabled: refreshing ? '' : null, onclick: () => doRefresh(true) },
      refreshing ? 'Refreshing…' : '↻ Refresh',
    ),
    h('span', { class: 'hint' }, last ? `Updated ${fmtTimestamp(last)}` : ''),
  );
}

let gridEl = null;

function renderGrid() {
  if (!gridEl) return;
  const videos = getMergedFeed(filters);
  gridEl.replaceChildren(
    ...(videos.length
      ? videos.map((v) => videoCard(v))
      : [h('p', { class: 'hint' },
          getState().channels.length
            ? 'Nothing here. Try Refresh, or loosen the filters.'
            : 'No subscriptions yet — add channels in the Library tab.')]),
  );
}

function render() {
  if (!visible) return;
  const s = getState();
  const parts = [];
  if (filters.channelId) {
    const channel = s.channels.find((c) => c.id === filters.channelId);
    parts.push(
      h(
        'p',
        {},
        h('a', { href: '#/feed', class: 'hint' }, '← All channels'),
        ' ',
        h('strong', {}, ` ${channel ? channel.title : filters.channelId}`),
      ),
    );
  }
  parts.push(toolbar());
  gridEl = h('div', { class: 'card-grid' });
  parts.push(gridEl);
  el.replaceChildren(...parts);
  renderGrid();
}

document.addEventListener('antenna:change', () => {
  if (visible) render();
});
