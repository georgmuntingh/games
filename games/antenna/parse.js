// Pure parsers for The Antenna: no DOM writes, no network, no storage.
// Everything here is exercised by tests/test-antenna.js.

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const CHANNEL_ID = /^UC[A-Za-z0-9_-]{22}$/;
const PLAYLIST_ID = /^(?:PL|UU|FL|OL)[A-Za-z0-9_-]{10,}$/;

function tryUrl(str) {
  try {
    return new URL(str.includes('://') ? str : `https://${str}`);
  } catch {
    return null;
  }
}

function isYouTubeHost(host) {
  return /(^|\.)((youtube(-nocookie)?\.com)|youtu\.be)$/.test(host);
}

/** Extract a video ID from a pasted string (URL in any common form, or raw ID). */
export function parseVideoInput(str) {
  const s = str.trim();
  if (VIDEO_ID.test(s)) return s;
  const url = tryUrl(s);
  if (!url || !isYouTubeHost(url.hostname)) return null;
  if (url.hostname.endsWith('youtu.be')) {
    const id = url.pathname.slice(1).split('/')[0];
    return VIDEO_ID.test(id) ? id : null;
  }
  const v = url.searchParams.get('v');
  if (v && VIDEO_ID.test(v)) return v;
  const m = url.pathname.match(/^\/(?:shorts|embed|live|v)\/([A-Za-z0-9_-]{11})(?:\/|$)/);
  return m ? m[1] : null;
}

/** Extract a playlist ID from a pasted string (URL with ?list=, or raw ID). */
export function parsePlaylistInput(str) {
  const s = str.trim();
  if (PLAYLIST_ID.test(s)) return s;
  const url = tryUrl(s);
  if (!url || !isYouTubeHost(url.hostname)) return null;
  const list = url.searchParams.get('list');
  return list && PLAYLIST_ID.test(list) ? list : null;
}

/**
 * Classify a pasted channel reference.
 * Returns { kind: 'id' | 'handle' | 'user' | 'custom' | 'unknown', value }.
 * 'id' can be used directly; the rest need resolution (API or page scrape).
 */
export function parseChannelInput(str) {
  const s = str.trim();
  if (CHANNEL_ID.test(s)) return { kind: 'id', value: s };
  if (/^@[\w.-]+$/.test(s)) return { kind: 'handle', value: s.slice(1) };
  const url = tryUrl(s);
  if (!url || !isYouTubeHost(url.hostname)) return { kind: 'unknown', value: s };
  const feedId = url.searchParams.get('channel_id');
  if (feedId && CHANNEL_ID.test(feedId)) return { kind: 'id', value: feedId };
  const path = decodeURIComponent(url.pathname);
  let m = path.match(/^\/channel\/(UC[A-Za-z0-9_-]{22})(?:\/|$)/);
  if (m) return { kind: 'id', value: m[1] };
  m = path.match(/^\/@([^/]+)/);
  if (m) return { kind: 'handle', value: m[1] };
  m = path.match(/^\/user\/([^/]+)/);
  if (m) return { kind: 'user', value: m[1] };
  m = path.match(/^\/c\/([^/]+)/);
  if (m) return { kind: 'custom', value: m[1] };
  return { kind: 'unknown', value: s };
}

const ATOM_NS = 'http://www.w3.org/2005/Atom';
const YT_NS = 'http://www.youtube.com/xml/schemas/2015';
const MEDIA_NS = 'http://search.yahoo.com/mrss/';

function nsText(parent, ns, tag) {
  const el = parent.getElementsByTagNameNS(ns, tag)[0];
  return el ? el.textContent : '';
}

/**
 * Parse a YouTube channel RSS (Atom) feed.
 * Returns { channelId, channelTitle, videos: [{ videoId, title, publishedAt,
 * author, channelId, thumbnail, descriptionSnippet }] }.
 */
export function parseRss(xmlString) {
  const doc = new DOMParser().parseFromString(xmlString, 'text/xml');
  if (doc.querySelector('parsererror')) throw new Error('Invalid RSS XML');
  const feed = doc.documentElement;
  const channelId = nsText(feed, YT_NS, 'channelId');
  const channelTitle = nsText(feed, ATOM_NS, 'title');
  const videos = [];
  for (const entry of feed.getElementsByTagNameNS(ATOM_NS, 'entry')) {
    const videoId = nsText(entry, YT_NS, 'videoId');
    if (!videoId) continue;
    const media = entry.getElementsByTagNameNS(MEDIA_NS, 'group')[0];
    const thumbEl = media && media.getElementsByTagNameNS(MEDIA_NS, 'thumbnail')[0];
    videos.push({
      videoId,
      title: nsText(entry, ATOM_NS, 'title'),
      publishedAt: nsText(entry, ATOM_NS, 'published'),
      author: nsText(entry, ATOM_NS, 'name') || channelTitle,
      channelId,
      thumbnail:
        (thumbEl && thumbEl.getAttribute('url')) ||
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      descriptionSnippet: (media ? nsText(media, MEDIA_NS, 'description') : '').slice(0, 300),
    });
  }
  return { channelId, channelTitle, videos };
}

/**
 * Parse an OPML export (NewPipe/FreeTube/RSS readers).
 * Returns [{ id, title }] for outlines whose feed URL carries a channel_id.
 */
export function parseOpml(xmlString) {
  const doc = new DOMParser().parseFromString(xmlString, 'text/xml');
  if (doc.querySelector('parsererror')) throw new Error('Invalid OPML XML');
  const channels = [];
  for (const outline of doc.querySelectorAll('outline[xmlUrl]')) {
    const url = tryUrl(outline.getAttribute('xmlUrl'));
    const id = url && url.searchParams.get('channel_id');
    if (id && CHANNEL_ID.test(id)) {
      channels.push({
        id,
        title: outline.getAttribute('title') || outline.getAttribute('text') || id,
      });
    }
  }
  return channels;
}

/** Split one CSV line, honoring double-quoted fields with embedded commas/quotes. */
function splitCsvLine(line) {
  const fields = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      fields.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  fields.push(cur);
  return fields;
}

/**
 * Parse a Google Takeout subscriptions.csv
 * (header: Channel Id,Channel Url,Channel Title). Returns [{ id, title }].
 */
export function parseTakeoutCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  if (lines.length === 0) return [];
  const header = splitCsvLine(lines[0]).map((f) => f.trim().toLowerCase());
  const idCol = header.findIndex((h) => h === 'channel id');
  const titleCol = header.findIndex((h) => h === 'channel title');
  if (idCol === -1) throw new Error('Not a Takeout subscriptions.csv (no "Channel Id" column)');
  const channels = [];
  for (const line of lines.slice(1)) {
    const fields = splitCsvLine(line);
    const id = (fields[idCol] || '').trim();
    if (CHANNEL_ID.test(id)) {
      channels.push({ id, title: (fields[titleCol] || '').trim() || id });
    }
  }
  return channels;
}

/** Convert an ISO 8601 duration (PT1H2M3S) to seconds. */
export function isoDurationToSeconds(iso) {
  const m = /^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso || '');
  if (!m) return null;
  const [, d, h, min, s] = m.map((x) => parseInt(x, 10) || 0);
  return d * 86400 + h * 3600 + min * 60 + s;
}

const SHORTS_RE = /#shorts?\b/i;

/**
 * Heuristic Shorts detection: exact when a duration is known (API key path),
 * title/description tag matching otherwise (RSS has no duration).
 */
export function isShortVideo(video) {
  if (typeof video.durationSec === 'number') return video.durationSec <= 62;
  return SHORTS_RE.test(video.title || '') || SHORTS_RE.test(video.descriptionSnippet || '');
}
