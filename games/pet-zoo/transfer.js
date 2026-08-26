// Carrying a zoo between devices.
//
// Everything the game knows lives in one localStorage blob, which makes a second device a
// blank slate. This module turns that blob into something a grown-up can move by hand: a
// .json file to save and re-open, or a base64 code short enough to send in a message.
//
// Pure and synchronous — no DOM, no Date, no storage — so tests/ can drive the whole
// round trip, and so the one risky moment (reading a file somebody else's device wrote)
// is decided by code that has nothing else to do.
//
// What travels is *progress*: the pets, their schedules, the stats. Settings and the
// session do not. Language and play time are the grown-up's choices about the device in
// their hand, and a nap started on the tablet is not a fact about the laptop.

import { sanitizeZoo } from './shop.js';
import { subjectOf, tiersOf } from './subjects/index.js';
import { cleanMilestones, dayStamp, freshState, migrateItems, upgrade, VERSION } from './store.js';
import { normalize as normalizeCoins } from './wallet.js';

export const TRANSFER_APP = 'pet-zoo';
export const TRANSFER_FORMAT = 1;
export const CODE_PREFIX = 'petzoo1:';

/**
 * A refusal a parent can read. `key` is an i18n key, never a parser message — the person
 * holding the phone cannot act on "Unexpected token < in JSON at position 0".
 */
export class TransferError extends Error {
  constructor(key) {
    super(key);
    this.name = 'TransferError';
    this.key = key;
  }
}

/* ------------------------------------------------------------------ export */

/**
 * The travelling half of a save. Deliberately without `settings`, `session` — or `ink`.
 *
 * The first two are facts about the device in somebody's hand. The third is a fact about a
 * hand: what this child's fours look like, learned from their own corrections. Carrying it
 * to another child's device would make their reading worse, not better, and it costs
 * nothing to relearn.
 */
export function exportPayload(state, now) {
  return {
    app: TRANSFER_APP,
    format: TRANSFER_FORMAT,
    version: VERSION,
    exportedAt: now,
    createdAt: state.createdAt,
    lastPlayedAt: state.lastPlayedAt,
    reviewClock: state.reviewClock,
    tiers: state.tiers,
    // Also as the old scalar, so a device still running a single-subject build reads the
    // clock's progress out of this file instead of starting its tiers again from zero.
    tier: tiersOf(state).clock,
    coins: state.coins,
    // The yard travels with the zoo; the milestone latch travels so a device that receives a
    // save does not pay again for a week the child already banked on the device it came from.
    zooDecor: state.zooDecor,
    milestones: state.milestones,
    stats: state.stats,
    items: state.items,
  };
}

/** Indented, because the file is the copy a person might open to see it is really theirs. */
export const payloadToJson = (payload) => JSON.stringify(payload, null, 2);

export const exportFilename = (now) => `pet-zoo-${dayStamp(now)}.json`;

/* -------------------------------------------------------------------- code */

// btoa only speaks Latin-1, so the JSON goes through UTF-8 first — otherwise Blåbær and
// every Norwegian pet name a child has typed would throw on the way out.
const CHUNK = 0x8000;

function base64FromBytes(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

function bytesFromBase64(text) {
  const binary = atob(text);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function encodeCode(payload) {
  const bytes = new TextEncoder().encode(payloadToJson(payload));
  return CODE_PREFIX + base64FromBytes(bytes);
}

/* ------------------------------------------------------------------ import */

const isPlainObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Read a file's text or a pasted code — the caller does not have to know which it was
 * handed. Whitespace is stripped from a code before decoding, because a code that has
 * been through a chat app comes back wrapped across lines.
 */
export function parseTransfer(text) {
  const trimmed = String(text ?? '').trim();
  if (!trimmed) throw new TransferError('transfer.badFile');

  let json = trimmed;
  if (trimmed.startsWith(CODE_PREFIX)) {
    try {
      const body = trimmed.slice(CODE_PREFIX.length).replace(/\s+/g, '');
      json = new TextDecoder().decode(bytesFromBase64(body));
    } catch {
      throw new TransferError('transfer.badFile');
    }
  }

  let parsed;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new TransferError('transfer.badFile');
  }

  if (!isPlainObject(parsed)) throw new TransferError('transfer.badFile');
  if (parsed.app !== TRANSFER_APP) throw new TransferError('transfer.badApp');
  // A file from a future build may describe pets in a shape this one would misread.
  if (!(parsed.format <= TRANSFER_FORMAT)) throw new TransferError('transfer.badVersion');
  if (!isPlainObject(parsed.items)) throw new TransferError('transfer.badFile');

  return { ...parsed, items: cleanItems(parsed.items) };
}

/**
 * Keep the records that describe something this game actually teaches, and drop the rest.
 * One corrupt entry is not worth refusing a child their whole zoo, so this filters rather
 * than throws — and each subject checks the payload against the id it is filed under, so a
 * hand-edited file cannot smuggle a pet onto a time, or a sum, that does not exist.
 */
export function cleanItems(items) {
  const out = {};
  for (const [id, item] of Object.entries(items)) {
    if (!isPlainObject(item)) continue;
    const subject = subjectOf(id);
    if (!subject || !subject.valid(id, item)) continue;
    out[id] = item;
  }
  // The same reconstruction a local load does, so a save exported from a build that
  // predates forms arrives with its pets the size they had earned.
  return migrateItems(out);
}

export const petCount = (items) =>
  Object.values(items).filter((item) => item.hatchedAt !== null && item.hatchedAt !== undefined)
    .length;

/**
 * The imported progress on top of a clean slate, keeping this device's own settings and
 * leaving no session running — a save that arrives mid-nap should not put the child
 * straight to sleep on a device they have only just picked up.
 */
export function applyImport(state, payload, now) {
  const base = freshState(now);
  // Through the same upgrade a local save goes through, and for the same reason: a file
  // written before the maths subject was renamed files its progress and its paid milestones
  // under `add`, and reading it as-is would drop the progress and then pay for it again.
  const carried = upgrade(payload) ?? payload;
  return {
    ...base,
    createdAt: payload.createdAt ?? base.createdAt,
    lastPlayedAt: payload.lastPlayedAt ?? now,
    reviewClock: Number.isFinite(payload.reviewClock) ? payload.reviewClock : 0,
    // Reads either shape: a file from a single-subject build carries one `tier`, a current
    // one carries a tier per subject.
    tiers: tiersOf(carried),
    // A balance from a build that predates the shop, or from a hand-edited file, arrives as
    // nothing rather than as a fortune. What each pet owns rides along on the items.
    coins: normalizeCoins(payload.coins),
    zooDecor: sanitizeZoo(payload.zooDecor),
    milestones: cleanMilestones(carried.milestones),
    // A save that lists its milestones has had them read on the device it came from; one that
    // does not is from a build that predates them, and is left for the latch at boot.
    milestonesGrantedAt: Array.isArray(carried.milestones) ? now : 0,
    // A save that carries a balance was already paid its back pay on the device it came
    // from; one from a build that predates the shop has not been, and is left for the grant
    // at boot to pick up — otherwise moving an old zoo across would quietly cost the child
    // every coin their forty pets had earned.
    coinsGrantedAt: Number.isFinite(payload.coins) ? now : 0,
    stats: { ...base.stats, ...(isPlainObject(payload.stats) ? payload.stats : {}) },
    items: payload.items,
    settings: state.settings,
    session: base.session,
  };
}
