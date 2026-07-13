// Locally stored watch history. Nothing here is ever sent anywhere.
import { getState, update } from '../storage.js';
import { h, fmtTimestamp } from '../ui.js';

export const el = document.getElementById('view-history');

let visible = false;

export function enter() {
  visible = true;
  render();
}

export function leave() {
  visible = false;
}

function render() {
  if (!visible) return;
  const s = getState();
  if (!s.history.length) {
    el.replaceChildren(h('p', { class: 'hint' }, 'Nothing watched yet. History is stored only in this browser.'));
    return;
  }
  el.replaceChildren(
    h('div', { class: 'toolbar' },
      h('h2', {}, `History (${s.history.length})`),
      h('button', {
        class: 'danger', type: 'button',
        onclick: () => {
          if (confirm('Clear your entire local watch history? (Watched marks stay.)')) {
            update((st) => { st.history = []; });
          }
        },
      }, 'Clear history'),
    ),
    h('ul', { class: 'row-list' },
      s.history.map((entry) =>
        h('li', {},
          h('span', { class: 'grow' },
            h('a', { href: `#/watch/${entry.videoId}` }, entry.title),
            entry.author ? h('span', { class: 'hint' }, ` — ${entry.author}`) : null),
          h('span', { class: 'hint' }, fmtTimestamp(entry.watchedAt)),
        ),
      ),
    ),
  );
}

document.addEventListener('antenna:change', () => {
  if (visible) render();
});
