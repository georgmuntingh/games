/**
 * Dropbox, spoken directly from the browser.
 *
 * This exists because a phone cannot open a folder. `showDirectoryPicker` is desktop-only —
 * no mobile browser implements it — and the Dropbox app on Android streams files rather than
 * keeping a folder on disk, so there would be nothing to point it at even if it did. The way
 * to the same `.md` files from a phone is Dropbox's own HTTP API.
 *
 * Five endpoints and an OAuth dance, hand-written rather than pulled from the SDK: the SDK is
 * a large dependency for a static page that needs list, download, upload, delete and a
 * cursor. Like `llm.js`, this file knows nothing about tasks — it moves bytes and text, and
 * `storage.js` decides what they mean.
 *
 * Two things about the API are load-bearing upstream:
 *
 *   - `files/upload` in `update` mode takes the `rev` the caller last saw and *refuses* the
 *     write if the file has moved on. That is the same guard `storage.js` performs against a
 *     local folder's mtime, except that here it is one atomic operation on the server rather
 *     than a check followed by a write.
 *   - Writes to one account contend on a namespace lock, so uploads are issued one at a time.
 *     Reads do not contend and are fetched a few at once.
 *
 * The app key is not a secret — it identifies the app, and PKCE is what proves the exchange
 * came from the same browser that started it — but it is per-installation, so it is entered
 * in Settings and kept in localStorage next to the OpenRouter key rather than baked in here.
 */

const AUTHORIZE = 'https://www.dropbox.com/oauth2/authorize';
const TOKEN = 'https://api.dropboxapi.com/oauth2/token';
const RPC = 'https://api.dropboxapi.com/2';
const CONTENT = 'https://content.dropboxapi.com/2';

const KEY_STORAGE = 'tasks.dropbox.appKey';
const REFRESH_STORAGE = 'tasks.dropbox.refresh';
const ACCOUNT_STORAGE = 'tasks.dropbox.account';
/** Session, not local: these belong to one redirect and must not outlive it. */
const VERIFIER_SESSION = 'tasks.dropbox.verifier';
const STATE_SESSION = 'tasks.dropbox.state';

/* -------------------------------------------------------------- settings */

export const getAppKey = () => localStorage.getItem(KEY_STORAGE) || '';
export const setAppKey = (key) =>
  key ? localStorage.setItem(KEY_STORAGE, key) : localStorage.removeItem(KEY_STORAGE);

const getRefreshToken = () => localStorage.getItem(REFRESH_STORAGE) || '';
export const getAccountName = () => localStorage.getItem(ACCOUNT_STORAGE) || '';

/** True when this browser has been authorised and can act without a trip to Dropbox. */
export const isConnected = () => Boolean(getAppKey() && getRefreshToken());

/** Forget the grant. The app itself stays authorised until it is unlinked at dropbox.com. */
export function signOut() {
  localStorage.removeItem(REFRESH_STORAGE);
  localStorage.removeItem(ACCOUNT_STORAGE);
  access = null;
}

/* ------------------------------------------------------------------ PKCE */

const base64url = (bytes) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

const randomString = () => base64url(crypto.getRandomValues(new Uint8Array(48)));

async function challengeFor(verifier) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return base64url(new Uint8Array(digest));
}

/**
 * The URL to send the browser to, having remembered what will be needed on the way back.
 *
 * `token_access_type=offline` is what makes the exchange return a refresh token: without it
 * the grant would last four hours and the phone would be reconnecting every morning.
 */
export async function authoriseUrl(redirectUri) {
  const appKey = getAppKey();
  if (!appKey) throw new Error('Add your Dropbox app key first.');
  const verifier = randomString();
  const state = randomString();
  sessionStorage.setItem(VERIFIER_SESSION, verifier);
  sessionStorage.setItem(STATE_SESSION, state);
  const params = new URLSearchParams({
    client_id: appKey,
    response_type: 'code',
    code_challenge: await challengeFor(verifier),
    code_challenge_method: 'S256',
    redirect_uri: redirectUri,
    token_access_type: 'offline',
    state,
  });
  return `${AUTHORIZE}?${params}`;
}

/** The authorisation code Dropbox sent us back with, or null if this is an ordinary load. */
export function pendingCode(search = globalThis.location?.search ?? '') {
  const params = new URLSearchParams(search);
  const code = params.get('code');
  if (!code) return null;
  // The state we planted is what tells our own redirect from somebody else's link.
  if (params.get('state') !== sessionStorage.getItem(STATE_SESSION)) return null;
  return code;
}

/** Whether Dropbox redirected back with a refusal rather than a code. */
export const authError = (search = globalThis.location?.search ?? '') =>
  new URLSearchParams(search).get('error_description') ||
  new URLSearchParams(search).get('error');

async function postForm(url, fields) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(fields),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error_description || payload.error_summary || `Dropbox said ${response.status}.`);
  }
  return payload;
}

/** Trade the code for tokens. One-shot: the verifier is spent here whatever the outcome. */
export async function exchangeCode(code, redirectUri) {
  const verifier = sessionStorage.getItem(VERIFIER_SESSION);
  sessionStorage.removeItem(VERIFIER_SESSION);
  sessionStorage.removeItem(STATE_SESSION);
  if (!verifier) throw new Error('That sign-in did not start in this tab.');
  const payload = await postForm(TOKEN, {
    grant_type: 'authorization_code',
    code,
    code_verifier: verifier,
    client_id: getAppKey(),
    redirect_uri: redirectUri,
  });
  if (!payload.refresh_token) throw new Error('Dropbox returned no refresh token.');
  localStorage.setItem(REFRESH_STORAGE, payload.refresh_token);
  access = { token: payload.access_token, expires: Date.now() + (payload.expires_in ?? 0) * 1000 };
  return payload;
}

/* ----------------------------------------------------------------- calls */

/** The short-lived access token, held in memory only. */
let access = null;

async function token() {
  if (access && access.expires - 60_000 > Date.now()) return access.token;
  const refresh = getRefreshToken();
  if (!refresh) throw new Error('Not connected to Dropbox.');
  const payload = await postForm(TOKEN, {
    grant_type: 'refresh_token',
    refresh_token: refresh,
    client_id: getAppKey(),
  });
  access = { token: payload.access_token, expires: Date.now() + (payload.expires_in ?? 0) * 1000 };
  return access.token;
}

/**
 * An error carrying what Dropbox said about it, so callers can tell a conflict — which is
 * ordinary, and the whole point of the `rev` guard — from a failure.
 */
export class DropboxError extends Error {
  constructor(status, payload) {
    const summary = typeof payload === 'string' ? payload : (payload?.error_summary ?? '');
    super(summary || `Dropbox said ${status}.`);
    this.name = 'DropboxError';
    this.status = status;
    this.summary = summary;
  }
}

/** A write refused because the file had moved on since we read it. */
export const isConflict = (error) => error instanceof DropboxError && /conflict/.test(error.summary);
/** Nothing there — a delete that has already happened, or a file taken elsewhere. */
export const isMissing = (error) =>
  error instanceof DropboxError && /not_found/.test(error.summary);

/**
 * JSON as an HTTP header value.
 *
 * `Dropbox-API-Arg` carries the arguments of the content endpoints, and a header may not hold
 * anything above 0x7E. Task filenames are slugged down to ASCII, but the whole point of this
 * app is that it round-trips notes somebody else wrote, whose names are not.
 */
export const headerSafe = (value) =>
  JSON.stringify(value).replace(
    /[\u007f-\uffff]/g,
    (character) => `\\u${character.charCodeAt(0).toString(16).padStart(4, '0')}`
  );

const RETRY_STATUSES = new Set([429, 500, 502, 503, 504]);
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * One call, retried once if Dropbox asked us to slow down.
 *
 * 429 is `Retry-After` seconds and means either the app is going too fast or another writer
 * holds the namespace lock. Both clear on their own, and a second failure is worth reporting
 * rather than hiding behind a longer wait.
 */
async function call(url, { headers = {}, body = null, retried = false } = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { ...headers, Authorization: `Bearer ${await token()}` },
    body,
  });
  if (response.ok) return response;
  if (RETRY_STATUSES.has(response.status) && !retried) {
    await wait(Math.max(1, Number(response.headers.get('Retry-After')) || 1) * 1000);
    return call(url, { headers, body, retried: true });
  }
  const text = await response.text().catch(() => '');
  let payload = text;
  try {
    payload = JSON.parse(text);
  } catch {
    /* Dropbox answers errors in plain text sometimes; the status still says enough */
  }
  throw new DropboxError(response.status, payload);
}

async function rpc(endpoint, args) {
  const response = await call(`${RPC}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  return response.json();
}

/** Who we are connected as, remembered so the settings line can say so without a call. */
export async function fetchAccountName() {
  const account = await rpc('/users/get_current_account', null);
  const name = account?.email || account?.name?.display_name || 'Dropbox';
  localStorage.setItem(ACCOUNT_STORAGE, name);
  return name;
}

/**
 * Everything in the app folder, and a cursor for asking what changed later.
 *
 * The root of an app-folder-scoped app is the empty string, and it is the only place this can
 * reach: the grant does not extend to the rest of the Dropbox.
 */
export async function listAll() {
  let page = await rpc('/files/list_folder', { path: '', recursive: true });
  const entries = [...page.entries];
  while (page.has_more) {
    page = await rpc('/files/list_folder/continue', { cursor: page.cursor });
    entries.push(...page.entries);
  }
  return { entries, cursor: page.cursor };
}

/**
 * What has changed since that cursor — usually nothing, in one cheap request.
 * Deleted files come back as `deleted` entries, so an empty list really does mean untouched.
 */
export async function listSince(cursor) {
  let page = await rpc('/files/list_folder/continue', { cursor });
  const entries = [...page.entries];
  while (page.has_more) {
    page = await rpc('/files/list_folder/continue', { cursor: page.cursor });
    entries.push(...page.entries);
  }
  return { entries, cursor: page.cursor };
}

export async function download(path) {
  const response = await call(`${CONTENT}/files/download`, {
    headers: { 'Dropbox-API-Arg': headerSafe({ path: `/${path}` }) },
  });
  return response.text();
}

/**
 * Write a file, and say what we believe about it.
 *
 * `rev` present means "overwrite only if this is still the file I read"; absent means "create
 * this, and fail if anything is already there". `autorename` stays off in both cases: a
 * silently renamed file would be a save the user believes they made, sitting under a name
 * nothing will ever look for.
 */
export async function upload(path, text, rev = null) {
  const response = await call(`${CONTENT}/files/upload`, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Dropbox-API-Arg': headerSafe({
        path: `/${path}`,
        mode: rev ? { '.tag': 'update', update: rev } : 'add',
        autorename: false,
        mute: true,
      }),
    },
    body: text,
  });
  return response.json();
}

/** Delete, but only if the file is still the revision we last saw. */
export const remove = (path, rev) =>
  rpc('/files/delete_v2', { path: `/${path}`, parent_rev: rev ?? undefined });
