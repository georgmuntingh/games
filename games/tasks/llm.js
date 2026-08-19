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

/** Headers every call shares. The referer and title are what OpenRouter shows in its logs. */
const headersFor = (key) => ({
  Authorization: `Bearer ${key}`,
  'Content-Type': 'application/json',
  'HTTP-Referer': location.origin,
  'X-Title': 'Tasks',
});

/** Pull the useful part out of a failed response, falling back to the status code. */
async function failureDetail(response) {
  try {
    const body = await response.json();
    return body?.error?.message || `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status}`;
  }
}

/**
 * Send a chat completion and return the assistant's message text.
 *
 * The defaults are the structured actions' settings: short, low-temperature answers that
 * have to parse as JSON. Freeform asks pass their own, since prose needs the room.
 */
export async function complete(messages, { key, model, signal, maxTokens = 900, temperature = 0.4 } = {}) {
  if (!key) throw new Error('No OpenRouter API key set. Add one under Settings.');

  const response = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    signal,
    headers: headersFor(key),
    body: JSON.stringify({
      model: model || DEFAULT_MODEL,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) throw new Error(`OpenRouter: ${await failureDetail(response)}`);

  const payload = await response.json();
  if (payload?.error) throw new Error(`OpenRouter: ${payload.error.message ?? 'unknown error'}`);
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) throw new Error('OpenRouter returned an empty response.');
  return content;
}

/* ---------------------------------------------------------- streaming */

/**
 * Decodes an SSE body into content fragments.
 *
 * Split out from the network so it can be tested directly: chunks arrive at whatever
 * boundaries the socket chose, so a JSON payload is routinely cut in half and has to be
 * held until the rest of its line turns up.
 */
export function createSseReader(onDelta) {
  let buffer = '';
  let done = false;

  const handleLine = (line) => {
    const trimmed = line.trim();
    // Comments keep the connection warm — OpenRouter sends ": OPENROUTER PROCESSING".
    if (!trimmed || trimmed.startsWith(':')) return;
    if (!trimmed.startsWith('data:')) return;
    const payload = trimmed.slice(5).trim();
    if (payload === '[DONE]') {
      done = true;
      return;
    }
    let parsed;
    try {
      parsed = JSON.parse(payload);
    } catch {
      // A frame we cannot read is not worth failing the whole answer over.
      return;
    }
    // An error can arrive mid-stream, after the response headers said 200.
    if (parsed?.error) throw new Error(`OpenRouter: ${parsed.error.message ?? 'unknown error'}`);
    const delta = parsed?.choices?.[0]?.delta?.content;
    if (delta) onDelta?.(delta);
  };

  return {
    /** Feed one decoded chunk; complete lines are dispatched, the remainder is kept. */
    push(text) {
      buffer += text;
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) handleLine(line);
    },
    /** Flush whatever the last chunk left behind. */
    end() {
      if (buffer) {
        handleLine(buffer);
        buffer = '';
      }
    },
    get finished() {
      return done;
    },
  };
}

/**
 * Stream a chat completion, reporting each fragment as it lands and resolving to the whole
 * answer. Aborting via `signal` is not an error here: the caller keeps what arrived.
 */
export async function stream(
  messages,
  { key, model, signal, maxTokens = 2000, temperature = 0.7, onDelta } = {}
) {
  if (!key) throw new Error('No OpenRouter API key set. Add one under Settings.');

  const response = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    signal,
    headers: headersFor(key),
    body: JSON.stringify({
      model: model || DEFAULT_MODEL,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    }),
  });

  if (!response.ok) throw new Error(`OpenRouter: ${await failureDetail(response)}`);
  if (!response.body) throw new Error('OpenRouter returned no response body.');

  let text = '';
  const reader = createSseReader((delta) => {
    text += delta;
    onDelta?.(delta, text);
  });

  const body = response.body.getReader();
  const decoder = new TextDecoder();
  try {
    for (;;) {
      const { value, done } = await body.read();
      if (done) break;
      reader.push(decoder.decode(value, { stream: true }));
      if (reader.finished) break;
    }
    reader.end();
  } catch (error) {
    // A deliberate Stop leaves the caller holding a partial answer, which is the point.
    if (error?.name === 'AbortError') return text;
    throw error;
  } finally {
    body.cancel().catch(() => {});
  }

  if (!text) throw new Error('OpenRouter returned an empty response.');
  return text;
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
