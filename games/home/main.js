// The whole page: a dot that, when woken, becomes a one-line launcher.
//
// Typing a shortcut key from links.js navigates to that link; a key followed by
// text fills the link's %s placeholder; anything that looks like a URL is
// opened directly; everything else falls through to a web search. There is no
// dropdown and no history — the single hint line under the field is the only
// feedback the page ever gives.

import { LINKS, SEARCH } from './links.js';

const dot = document.getElementById('dot');
const launcher = document.getElementById('launcher');
const input = document.getElementById('q');
const hint = document.getElementById('hint');

function findLink(key) {
  const exact = LINKS.find((link) => link.keys.includes(key));
  if (exact) return exact;
  const prefixed = LINKS.filter((link) =>
    link.keys.some((k) => k.startsWith(key)),
  );
  return prefixed.length === 1 ? prefixed[0] : null;
}

function expand(url, rest) {
  if (!url.includes('%s')) return url;
  // A templated link with no argument: fall back to the site itself.
  if (!rest) return new URL(url).origin;
  return url.replace('%s', encodeURIComponent(rest));
}

function looksLikeUrl(text) {
  if (/\s/.test(text)) return false;
  return /^https?:\/\//i.test(text) || /^[\w-]+(\.[\w-]+)+([/?#]|$)/.test(text);
}

function resolve(text) {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const spaceAt = trimmed.search(/\s/);
  const key = (
    spaceAt === -1 ? trimmed : trimmed.slice(0, spaceAt)
  ).toLowerCase();
  const rest = spaceAt === -1 ? '' : trimmed.slice(spaceAt + 1).trim();

  const link = findLink(key);
  if (link) return { label: link.label, url: expand(link.url, rest) };

  if (looksLikeUrl(trimmed)) {
    const url = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    return { label: 'open', url };
  }

  return {
    label: 'search',
    url: SEARCH.replace('%s', encodeURIComponent(trimmed)),
  };
}

function updateHint() {
  const match = resolve(input.value);
  hint.textContent = match ? match.label : '';
}

function wake(seed = '') {
  dot.hidden = true;
  launcher.hidden = false;
  input.value = seed;
  input.focus();
  updateHint();
}

function sleep() {
  launcher.hidden = true;
  input.value = '';
  hint.textContent = '';
  dot.hidden = false;
}

dot.addEventListener('click', () => wake());

input.addEventListener('input', updateHint);

input.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    sleep();
  }
});

input.addEventListener('blur', () => {
  if (!input.value) sleep();
});

launcher.addEventListener('submit', (event) => {
  event.preventDefault();
  const match = resolve(input.value);
  if (match) location.assign(match.url);
});

// Any bare printable keystroke wakes the launcher and becomes its first
// character. Modified keys are left alone so Cmd/Ctrl+L, Cmd+T and friends
// still reach the browser.
window.addEventListener('keydown', (event) => {
  if (!launcher.hidden) return;
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.key.length !== 1) return;
  event.preventDefault();
  wake(event.key);
});

// Coming back via the back button restores the page from the bfcache with the
// launcher still open; the page should always greet you as a bare dot.
window.addEventListener('pageshow', sleep);
