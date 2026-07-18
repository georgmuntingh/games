// Deliberate YouTube search. Only available with a Data API key; results
// emphasize curating (subscribe / save / queue) over instant watching.
import { getState, update } from '../storage.js';
import * as api from '../api.js';
import { h, videoCard, toast } from '../ui.js';
import { refreshChannel } from '../feeds.js';

export const el = document.getElementById('view-search');

let visible = false;
let lastQuery = '';
let lastResults = null;
let searching = false;

export function enter() {
  visible = true;
  render();
}

export function leave() {
  visible = false;
}

const SORT_OPTIONS = [
  ['date', 'Newest first'],
  ['relevance', 'Relevance'],
  ['viewCount', 'Most viewed'],
  ['rating', 'Highest rated'],
  ['title', 'Title A–Z'],
];

const PERIOD_OPTIONS = [
  ['', 'Any time'],
  ['day', 'Today'],
  ['week', 'This week'],
  ['month', 'This month'],
  ['year', 'This year'],
];

async function doSearch(query) {
  const { apiKey, searchOrder, searchPeriod } = getState().settings;
  searching = true;
  render();
  try {
    lastQuery = query;
    lastResults = await api.search(query, {
      order: searchOrder || 'date',
      publishedAfter: api.publishedAfterForPeriod(searchPeriod),
      apiKey,
    });
  } catch (err) {
    lastResults = null;
    toast(`Search failed: ${err.message}`);
  } finally {
    searching = false;
    render();
  }
}

function subscribeButton(channel) {
  const subscribed = getState().channels.some((c) => c.id === channel.id);
  return h('button', {
    class: subscribed ? 'quiet' : 'action',
    type: 'button',
    disabled: subscribed ? '' : null,
    onclick: () => {
      update((s) => {
        if (!s.channels.some((c) => c.id === channel.id)) {
          s.channels.push({ id: channel.id, title: channel.title, categoryId: null, addedAt: Date.now() });
        }
      });
      toast(`Subscribed: ${channel.title}`);
      refreshChannel(channel.id, { force: true }).catch(() => {});
    },
  }, subscribed ? 'Subscribed ✓' : 'Subscribe');
}

function results() {
  if (searching) return [h('p', { class: 'hint' }, 'Searching…')];
  if (!lastResults) return [];
  const { videos, channels } = lastResults;
  const out = [];
  if (channels.length) {
    out.push(
      h('h2', {}, 'Channels'),
      h('ul', { class: 'row-list' },
        channels.map((c) =>
          h('li', {},
            h('span', { class: 'grow' }, h('strong', {}, c.title), ' ', h('span', { class: 'hint' }, c.description.slice(0, 120))),
            subscribeButton(c),
          ),
        ),
      ),
    );
  }
  out.push(
    h('h2', {}, `Videos (${videos.length})`),
    videos.length
      ? h('div', { class: 'card-grid' }, videos.map((v) => videoCard(v)))
      : h('p', { class: 'hint' }, `No video results for “${lastQuery}”.`),
  );
  return out;
}

function render() {
  if (!visible) return;
  if (!getState().settings.apiKey) {
    el.replaceChildren(
      h('p', { class: 'hint' },
        'Search needs a YouTube Data API key — set one in ',
        h('a', { href: '#/settings' }, 'Settings'),
        '. Everything else works without it.'),
    );
    return;
  }
  const input = h('input', {
    type: 'search',
    placeholder: 'Search YouTube…',
    value: lastQuery,
    style: 'flex:1; min-width: 14rem;',
    onkeydown: (e) => { if (e.key === 'Enter') submit(); },
  });
  function submit() {
    const q = input.value.trim();
    if (q) doSearch(q);
  }
  // Changing sort or period re-runs the current search right away.
  function settingSelect(key, options, label) {
    const value = getState().settings[key];
    return h(
      'select',
      {
        'aria-label': label,
        onchange: (e) => {
          update((s) => { s.settings[key] = e.target.value; });
          if (lastQuery) doSearch(lastQuery);
        },
      },
      options.map(([v, text]) => h('option', { value: v, selected: v === value ? '' : null }, text)),
    );
  }
  el.replaceChildren(
    h('div', { class: 'toolbar' },
      input,
      settingSelect('searchOrder', SORT_OPTIONS, 'Sort results by'),
      settingSelect('searchPeriod', PERIOD_OPTIONS, 'Uploaded within'),
      h('button', { class: 'action', type: 'button', onclick: submit }, 'Search'),
    ),
    h('p', { class: 'hint' }, 'Tip: prefer Subscribe / Save over instant watching — curate first, watch on your own time.'),
    ...results(),
  );
}
