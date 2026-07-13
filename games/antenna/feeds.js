// Feed orchestration: refresh subscribed channels (RSS via proxy, or Data API
// when a key is set), cache with a TTL, and assemble the merged feed.
import { getState, update, loadCache, saveCache, clearCacheStorage } from './storage.js';
import { proxyFetch } from './net.js';
import { parseRss, isShortVideo } from './parse.js';
import * as api from './api.js';

let cache = loadCache();

function ttlMs() {
  const min = Number(getState().settings.feedTTLMinutes) || 30;
  return Math.max(1, min) * 60 * 1000;
}

export function channelFetchedAt(channelId) {
  return cache.channels[channelId]?.fetchedAt || 0;
}

/** Oldest fetch time across subscriptions — shown as "last updated". */
export function lastRefreshed() {
  const times = getState().channels.map((c) => channelFetchedAt(c.id)).filter(Boolean);
  return times.length ? Math.min(...times) : 0;
}

export function clearCache() {
  cache = { version: 1, channels: {} };
  clearCacheStorage();
}

async function fetchChannelVideos(channelId) {
  const { apiKey } = getState().settings;
  if (apiKey) {
    const videos = await api.uploadsFor(channelId, apiKey);
    const need = videos.filter((v) => v.durationSec == null).map((v) => v.videoId);
    if (need.length) {
      const d = await api.durations(need, apiKey);
      for (const v of videos) if (d[v.videoId] != null) v.durationSec = d[v.videoId];
    }
    return { videos, channelTitle: videos[0]?.author || '' };
  }
  const xml = await proxyFetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
  const parsed = parseRss(xml);
  return { videos: parsed.videos, channelTitle: parsed.channelTitle };
}

export async function refreshChannel(channelId, { force = false } = {}) {
  const entry = cache.channels[channelId];
  if (!force && entry && Date.now() - entry.fetchedAt < ttlMs()) return entry;
  const { videos, channelTitle } = await fetchChannelVideos(channelId);
  cache.channels[channelId] = { fetchedAt: Date.now(), videos };
  saveCache(cache);
  if (channelTitle) {
    const known = getState().channels.find((c) => c.id === channelId);
    if (known && known.title !== channelTitle) {
      update((s) => {
        const c = s.channels.find((x) => x.id === channelId);
        if (c) c.title = channelTitle;
      });
    }
  }
  return cache.channels[channelId];
}

/**
 * Refresh all subscriptions. One failing channel doesn't kill the rest.
 * Returns { ok, failed: [{ channelId, title, error }] }.
 */
export async function refreshAll({ force = false } = {}) {
  const channels = getState().channels;
  const results = await Promise.allSettled(
    channels.map((c) => refreshChannel(c.id, { force })),
  );
  const failed = [];
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      failed.push({
        channelId: channels[i].id,
        title: channels[i].title,
        error: r.reason?.message || String(r.reason),
      });
    }
  });
  return { ok: channels.length - failed.length, failed };
}

/**
 * The merged, filtered, chronologically sorted feed.
 * Options: categoryId (only that category), channelId (only that channel),
 * hideWatched, text (local title/author filter).
 */
export function getMergedFeed({ categoryId = '', channelId = '', hideWatched = false, text = '' } = {}) {
  const s = getState();
  let channels = s.channels;
  if (channelId) channels = channels.filter((c) => c.id === channelId);
  else if (categoryId) channels = channels.filter((c) => c.categoryId === categoryId);
  const needle = text.trim().toLowerCase();
  const out = [];
  for (const c of channels) {
    for (const v of cache.channels[c.id]?.videos || []) {
      if (!s.settings.showShorts && isShortVideo(v)) continue;
      if (hideWatched && s.watched[v.videoId]) continue;
      if (
        needle &&
        !(v.title || '').toLowerCase().includes(needle) &&
        !(v.author || '').toLowerCase().includes(needle)
      ) {
        continue;
      }
      out.push(v);
    }
  }
  out.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  return out;
}

/** Look up a cached video by ID (used by theater for metadata). */
export function findCachedVideo(videoId) {
  for (const entry of Object.values(cache.channels)) {
    const v = entry.videos.find((x) => x.videoId === videoId);
    if (v) return v;
  }
  return null;
}
