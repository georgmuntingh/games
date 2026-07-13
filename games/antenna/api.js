// YouTube Data API v3 client. Only used when settings.apiKey is set — the
// Data API is CORS-enabled, so these calls go direct (no proxy).
import { isoDurationToSeconds } from './parse.js';

const BASE = 'https://www.googleapis.com/youtube/v3';

async function apiGet(endpoint, params, apiKey) {
  const q = new URLSearchParams({ ...params, key: apiKey });
  const res = await fetch(`${BASE}/${endpoint}?${q}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || `API error (HTTP ${res.status})`);
  return data;
}

/** Resolve a parsed channel reference ({kind, value}) to { id, title }. */
export async function resolveChannel(parsed, apiKey) {
  const params = { part: 'snippet' };
  if (parsed.kind === 'id') params.id = parsed.value;
  else if (parsed.kind === 'handle') params.forHandle = parsed.value;
  else if (parsed.kind === 'user') params.forUsername = parsed.value;
  else return null; // legacy /c/ URLs have no API lookup — caller falls back to scraping
  const data = await apiGet('channels', params, apiKey);
  const item = data.items?.[0];
  if (!item) throw new Error('Channel not found');
  return { id: item.id, title: item.snippet.title };
}

/** Latest uploads via the channel's UU… uploads playlist (1 quota unit). */
export async function uploadsFor(channelId, apiKey) {
  const data = await apiGet(
    'playlistItems',
    { part: 'snippet', playlistId: `UU${channelId.slice(2)}`, maxResults: '20' },
    apiKey,
  );
  return (data.items || []).map((it) => {
    const sn = it.snippet;
    const videoId = sn.resourceId?.videoId;
    return {
      videoId,
      title: sn.title,
      publishedAt: sn.publishedAt,
      author: sn.channelTitle,
      channelId,
      thumbnail: sn.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      descriptionSnippet: (sn.description || '').slice(0, 300),
    };
  });
}

/** Durations for up to 50 IDs per call. Returns { videoId: seconds }. */
export async function durations(videoIds, apiKey) {
  const out = {};
  for (let i = 0; i < videoIds.length; i += 50) {
    const data = await apiGet(
      'videos',
      { part: 'contentDetails', id: videoIds.slice(i, i + 50).join(','), maxResults: '50' },
      apiKey,
    );
    for (const it of data.items || []) {
      out[it.id] = isoDurationToSeconds(it.contentDetails?.duration);
    }
  }
  return out;
}

/** One video's metadata (for pasted URLs when a key is available). */
export async function videoMeta(videoId, apiKey) {
  const data = await apiGet(
    'videos',
    { part: 'snippet,contentDetails', id: videoId },
    apiKey,
  );
  const it = data.items?.[0];
  if (!it) throw new Error('Video not found');
  return {
    videoId,
    title: it.snippet.title,
    author: it.snippet.channelTitle,
    channelId: it.snippet.channelId,
    thumbnail: it.snippet.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    durationSec: isoDurationToSeconds(it.contentDetails?.duration),
  };
}

/**
 * Plain search (100 quota units!). Returns { videos, channels }.
 * order: '' for relevance, 'date' for newest first.
 */
export async function search(query, { order = '', apiKey }) {
  const params = {
    part: 'snippet',
    q: query,
    type: 'video,channel',
    maxResults: '20',
    safeSearch: 'none',
  };
  if (order) params.order = order;
  const data = await apiGet('search', params, apiKey);
  const videos = [];
  const channels = [];
  for (const it of data.items || []) {
    const sn = it.snippet;
    if (it.id?.videoId) {
      videos.push({
        videoId: it.id.videoId,
        title: sn.title,
        author: sn.channelTitle,
        channelId: sn.channelId,
        publishedAt: sn.publishedAt,
        thumbnail: sn.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${it.id.videoId}/hqdefault.jpg`,
        descriptionSnippet: (sn.description || '').slice(0, 300),
      });
    } else if (it.id?.channelId) {
      channels.push({ id: it.id.channelId, title: sn.title, description: sn.description || '' });
    }
  }
  // One cheap follow-up call so Shorts can be tagged by real duration.
  if (videos.length) {
    try {
      const d = await durations(videos.map((v) => v.videoId), apiKey);
      for (const v of videos) if (d[v.videoId] != null) v.durationSec = d[v.videoId];
    } catch {
      // durations are cosmetic here; keep the results
    }
  }
  return { videos, channels };
}
