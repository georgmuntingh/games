// Settings: API key, CORS proxy, Shorts visibility, feed TTL, backup.
import { getState, update, exportJSON, importJSON } from '../storage.js';
import { clearCache } from '../feeds.js';
import { h, toast } from '../ui.js';

export const el = document.getElementById('view-settings');

let visible = false;

export function enter() {
  visible = true;
  render();
}

export function leave() {
  visible = false;
}

function field(labelText, control, hint) {
  return h('div', { class: 'field' }, h('label', {}, labelText), control, hint ? h('span', { class: 'hint' }, hint) : null);
}

function setSetting(key, value) {
  update((s) => {
    s.settings[key] = value;
  });
}

function downloadExport() {
  const blob = new Blob([exportJSON()], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = h('a', { href: url, download: `antenna-backup-${new Date().toISOString().slice(0, 10)}.json` });
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function importControl() {
  const fileInput = h('input', {
    type: 'file',
    accept: '.json,application/json',
    hidden: '',
    onchange: async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const incoming = JSON.parse(text);
        const counts = `${(incoming.channels || []).length} channels, ${(incoming.savedVideos || []).length} saved videos, ${(incoming.playlists || []).length} playlists, ${(incoming.queue || []).length} queued`;
        if (confirm(`Replace your current library with this backup?\n(${counts})`)) {
          importJSON(text);
          toast('Library restored');
          render();
        }
      } catch (err) {
        toast(`Import failed: ${err.message}`);
      }
      e.target.value = '';
    },
  });
  return h('span', {},
    fileInput,
    h('button', { class: 'quiet', type: 'button', onclick: () => fileInput.click() }, 'Import backup…'),
  );
}

function render() {
  if (!visible) return;
  const s = getState().settings;

  const apiKeyInput = h('input', {
    type: 'password',
    value: s.apiKey,
    placeholder: 'AIza…',
    autocomplete: 'off',
    onchange: (e) => setSetting('apiKey', e.target.value.trim()),
  });
  const proxyInput = h('input', {
    type: 'text',
    value: s.proxyTemplate,
    placeholder: 'https://my-proxy.example/?url={url}',
    onchange: (e) => setSetting('proxyTemplate', e.target.value.trim()),
  });
  const shortsBox = h('input', { type: 'checkbox', onchange: (e) => setSetting('showShorts', e.target.checked) });
  shortsBox.checked = s.showShorts;
  const ttlInput = h('input', {
    type: 'number',
    min: '1',
    value: String(s.feedTTLMinutes),
    style: 'width: 5rem;',
    onchange: (e) => setSetting('feedTTLMinutes', Math.max(1, Number(e.target.value) || 30)),
  });

  el.replaceChildren(
    h('div', { class: 'settings-form' },
      field('YouTube Data API key (optional)', apiKeyInput,
        'Unlocks Search, reliable feeds, and exact Shorts detection. Create a free key in Google Cloud Console (YouTube Data API v3). A search costs 100 of your 10,000 daily quota units. Stored only in this browser.'),
      field('Custom CORS proxy (optional)', proxyInput,
        'Without an API key, feeds are fetched through public CORS proxies. Put your own proxy here (with {url} placeholder) to be tried first.'),
      h('label', {}, shortsBox, ' Show Shorts in the feed'),
      field('Feed cache lifetime (minutes)', ttlInput,
        'Feeds newer than this are served from cache; Refresh in the Feed tab always re-fetches.'),
      h('h2', {}, 'Backup'),
      h('div', { class: 'toolbar' },
        h('button', { class: 'action', type: 'button', onclick: downloadExport }, 'Export library (JSON)'),
        importControl(),
        h('button', {
          class: 'quiet', type: 'button',
          onclick: () => { clearCache(); toast('Feed cache cleared'); },
        }, 'Clear feed cache'),
      ),
      h('p', { class: 'hint' },
        'Everything — subscriptions, queue, history, watched marks — lives in this browser\'s localStorage. Export before clearing site data or switching devices.'),
    ),
  );
}
