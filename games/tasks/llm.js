/**
 * OpenRouter client, called directly from the browser with the user's own key.
 *
 * The key is stored on the user's machine (localStorage) and sent only to OpenRouter.
 * Nothing here ever runs at build time, so no key touches the repository.
 */

const BASE = 'https://openrouter.ai/api/v1';
const KEY_STORAGE = 'tasks.openrouter.key';
const MODEL_STORAGE = 'tasks.openrouter.model';

export const DEFAULT_MODEL = 'google/gemini-2.0-flash-001';

/* -------------------------------------------------------------- settings */

export const getKey = () => localStorage.getItem(KEY_STORAGE) || '';
export const setKey = (key) =>
  key ? localStorage.setItem(KEY_STORAGE, key) : localStorage.removeItem(KEY_STORAGE);
export const getModel = () => localStorage.getItem(MODEL_STORAGE) || DEFAULT_MODEL;
export const setModel = (model) => localStorage.setItem(MODEL_STORAGE, model || DEFAULT_MODEL);

/* ---------------------------------------------------------------- models */

/** Price per million prompt tokens, or null when OpenRouter reports none. */
function promptPrice(model) {
  const raw = Number(model?.pricing?.prompt);
  return Number.isFinite(raw) ? raw * 1e6 : null;
}

export function formatPrice(pricePerMillion) {
  if (pricePerMillion == null) return '';
  if (pricePerMillion === 0) return 'free';
  if (pricePerMillion < 1) return `$${pricePerMillion.toFixed(3)}/M`;
  return `$${pricePerMillion.toFixed(2)}/M`;
}

/**
 * The model catalogue, cheapest first. This endpoint needs no authentication, so the
 * dropdown can be populated before the user has entered a key.
 */
export async function fetchModels() {
  const response = await fetch(`${BASE}/models`);
  if (!response.ok) throw new Error(`OpenRouter models request failed (${response.status})`);
  const payload = await response.json();
  return (payload?.data ?? [])
    .filter((m) => m?.id && (m.architecture?.output_modalities ?? ['text']).includes('text'))
    .map((m) => ({
      id: m.id,
      name: m.name || m.id,
      price: promptPrice(m),
      context: m.context_length ?? null,
    }))
    .filter((m) => m.price != null)
    .sort((a, b) => a.price - b.price || a.id.localeCompare(b.id));
}

/* ------------------------------------------------------------ completion */

/** Send a chat completion and return the assistant's message text. */
export async function complete(messages, { key, model, signal } = {}) {
  if (!key) throw new Error('No OpenRouter API key set. Add one under Settings.');

  const response = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    signal,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': location.origin,
      'X-Title': 'Tasks',
    },
    body: JSON.stringify({
      model: model || DEFAULT_MODEL,
      messages,
      temperature: 0.4,
      max_tokens: 900,
    }),
  });

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      detail = body?.error?.message || detail;
    } catch {
      /* keep the status-code message */
    }
    throw new Error(`OpenRouter: ${detail}`);
  }

  const payload = await response.json();
  if (payload?.error) throw new Error(`OpenRouter: ${payload.error.message ?? 'unknown error'}`);
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) throw new Error('OpenRouter returned an empty response.');
  return content;
}

/**
 * Run one assistant action end to end: build messages, call the model, parse the
 * result into reviewable suggestions. Parse failures carry the raw text so the panel
 * can show what actually came back.
 */
export async function runAction(action, { project, tasks, task, signal } = {}) {
  const response = await complete(action.messages(project, tasks, task), {
    key: getKey(),
    model: getModel(),
    signal,
  });
  try {
    return { suggestions: action.parse(response), raw: response };
  } catch (error) {
    error.raw = error.raw ?? response;
    throw error;
  }
}
