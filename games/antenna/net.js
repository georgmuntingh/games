// Network helpers. YouTube's RSS feeds and channel pages have no CORS
// headers, so keyless fetches go through a public CORS proxy chain.
import { getState } from './storage.js';

const DEFAULT_PROXIES = [
  'https://corsproxy.io/?url={url}',
  'https://api.allorigins.win/raw?url={url}',
  'https://api.codetabs.com/v1/proxy?quest={url}',
];

// Remember which proxy worked last so a dead one is only probed once per session.
let workingProxy = null;

function proxyChain() {
  const custom = (getState().settings.proxyTemplate || '').trim();
  const chain = custom.includes('{url}') ? [custom, ...DEFAULT_PROXIES] : [...DEFAULT_PROXIES];
  if (workingProxy && chain.includes(workingProxy)) {
    chain.splice(chain.indexOf(workingProxy), 1);
    chain.unshift(workingProxy);
  }
  return chain;
}

async function fetchWithTimeout(url, timeoutMs) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** Fetch a cross-origin URL as text via the proxy chain. */
export async function proxyFetch(url, { timeoutMs = 10000 } = {}) {
  let lastErr = null;
  for (const template of proxyChain()) {
    try {
      const res = await fetchWithTimeout(template.replace('{url}', encodeURIComponent(url)), timeoutMs);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      workingProxy = template;
      return text;
    } catch (err) {
      lastErr = err;
    }
  }
  throw new Error(`All proxies failed (${lastErr?.message || lastErr})`);
}

/** Video/playlist metadata without an API key. noembed.com is CORS-enabled. */
export async function noembed(youtubeUrl, { timeoutMs = 8000 } = {}) {
  const res = await fetchWithTimeout(
    `https://noembed.com/embed?url=${encodeURIComponent(youtubeUrl)}`,
    timeoutMs,
  );
  if (!res.ok) throw new Error(`noembed HTTP ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data; // { title, author_name, ... }
}

/**
 * Keyless channel resolution: fetch the channel page through the proxy and
 * pull the UC… ID out of the page source. Works for /@handle, /user/, /c/.
 */
export async function scrapeChannelId(path) {
  const html = await proxyFetch(`https://www.youtube.com${path}`);
  const m =
    html.match(/"channelId":"(UC[A-Za-z0-9_-]{22})"/) ||
    html.match(/"externalId":"(UC[A-Za-z0-9_-]{22})"/) ||
    html.match(/youtube\.com\/channel\/(UC[A-Za-z0-9_-]{22})"/);
  if (!m) throw new Error('Could not find a channel ID on that page');
  const title = html.match(/<meta property="og:title" content="([^"]*)"/)?.[1] || '';
  return { id: m[1], title };
}
