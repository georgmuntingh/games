/**
 * The ask dialog: a freeform question about the project, answered in prose.
 *
 * The user picks which blocks of context travel with the question, so nothing is sent that
 * they did not choose and the size is on screen before they commit. The answer is read,
 * not applied: this dialog never touches the board.
 *
 * Binds static markup in index.html, like `panel.js`. Context assembly is `exporter.js`,
 * the network is `llm.js`.
 */

import { marked } from 'marked';
import { CONTEXT_BLOCKS, buildContext, contextSections, countWords } from './exporter.js';
import { askMessages } from './prompts.js';
import * as llm from './llm.js';

const $ = (id) => document.getElementById(id);

const BLOCK_STORAGE = 'tasks.ask.blocks';
/** Restored after the button has briefly said it copied. */
const COPY_LABEL = '⧉ Copy context';
const DEFAULT_BLOCKS = ['goal', 'tasks'];

/** Same neutralising the project goal gets: this markdown is not trusted markup. */
const renderMarkdown = (text) => marked.parse(String(text ?? '').replace(/</g, '&lt;'));

function readBlocks() {
  try {
    const stored = JSON.parse(localStorage.getItem(BLOCK_STORAGE) ?? 'null');
    if (Array.isArray(stored)) return stored.filter((id) => CONTEXT_BLOCKS.some((b) => b.id === id));
  } catch {
    /* fall through to the defaults */
  }
  return [...DEFAULT_BLOCKS];
}

const writeBlocks = (blocks) => localStorage.setItem(BLOCK_STORAGE, JSON.stringify([...blocks]));

/** "1,240 words" reads better than a raw count once a project has any size to it. */
const words = (count) => `${count.toLocaleString()} word${count === 1 ? '' : 's'}`;

export function createAsk({ getState, onStatus, openSettings } = {}) {
  const root = $('ask');
  const els = {
    blocks: $('ask-blocks'),
    size: $('ask-size'),
    copy: $('ask-copy-context'),
    warning: $('ask-warning'),
    thread: $('ask-thread'),
    form: $('ask-form'),
    question: $('ask-question'),
    send: $('ask-send'),
    stop: $('ask-stop'),
    fresh: $('ask-new'),
    status: $('ask-status'),
  };

  let chosen = new Set(readBlocks());
  /** The exchange so far, oldest first. Lives for as long as the dialog stays open. */
  let thread = [];
  /** The brief that went out with turn 1 — what the model is actually reasoning over. */
  let sentBrief = '';
  let controller = null;

  const sources = () => {
    const state = getState?.() ?? {};
    return { ...state, now: Date.now() };
  };

  const currentBrief = () => buildContext(chosen, sources());

  /**
   * A thread is only coherent while the model's brief still matches the board. Comparing the
   * assembled text rather than the tick boxes means an edit made behind the dialog counts too.
   */
  const stale = () => thread.length > 0 && currentBrief() !== sentBrief;

  /**
   * What the first user message would say if the question were sent now.
   *
   * Assembled the same way `askMessages` assembles it, so what lands on the clipboard is
   * what the model would be handed, character for character — the point of the button being
   * to ask the same thing somewhere else and get a comparable answer.
   */
  const clipboardText = () => {
    const brief = currentBrief();
    const question = els.question.value.trim();
    if (!brief) return question;
    return question ? `${brief}\n---\n${question}` : brief;
  };

  async function copyContext() {
    const text = clipboardText();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      // The status bar is behind the dialog's backdrop, so the button has to answer for
      // itself; the bar gets the message too, for when the dialog is closed afterwards.
      els.copy.textContent = '✓ Copied';
      setTimeout(() => {
        els.copy.textContent = COPY_LABEL;
      }, 1500);
      onStatus?.('Context copied — paste it into another model.');
    } catch (error) {
      onStatus?.(`Could not copy: ${error.message}`, true);
    }
  }

  function setBusy(busy) {
    els.send.disabled = busy;
    els.stop.hidden = !busy;
    els.question.readOnly = busy;
    els.blocks.querySelectorAll('input').forEach((input) => {
      input.disabled = busy || input.dataset.unavailable === 'true';
    });
  }

  function renderBlocks() {
    const state = sources();
    const sections = contextSections(state);
    els.blocks.textContent = '';
    let total = 0;

    for (const block of CONTEXT_BLOCKS) {
      const body = sections[block.id] ?? '';
      const count = countWords(body);
      // Nothing to send is not the same as not chosen, and the row has to say which.
      const unavailable = !body.trim();
      if (unavailable) chosen.delete(block.id);
      const on = chosen.has(block.id);
      if (on) total += count;

      const li = document.createElement('li');
      if (unavailable) li.className = 'unavailable';

      const label = document.createElement('label');
      label.className = 'check';

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = on;
      input.disabled = unavailable;
      input.dataset.unavailable = String(unavailable);
      input.addEventListener('change', () => {
        if (input.checked) chosen.add(block.id);
        else chosen.delete(block.id);
        writeBlocks(chosen);
        renderBlocks();
      });

      const text = document.createElement('span');
      // Naming the task makes it obvious which one is about to be sent, since the
      // selection lives behind the dialog and is easy to misremember.
      text.textContent =
        block.needs === 'task' && state.task ? `${block.label}: “${state.task.title}”` : block.label;

      const size = document.createElement('span');
      size.className = 'ask-count muted small';
      size.textContent = unavailable
        ? block.needs === 'task'
          ? 'no task selected'
          : 'nothing to send'
        : words(count);

      label.append(input, text, size);
      label.title = block.hint;
      li.append(label);
      els.blocks.append(li);
    }

    els.size.textContent = total
      ? `${words(total)} will be sent with your question.`
      : 'Nothing selected — the model will see only your question.';
    els.warning.hidden = !stale();
    els.copy.disabled = !clipboardText();
  }

  function renderThread() {
    els.thread.textContent = '';
    for (const turn of thread) {
      els.thread.append(turnElement(turn));
    }
    els.fresh.hidden = thread.length === 0;
    els.thread.hidden = thread.length === 0;
  }

  function turnElement(turn) {
    const li = document.createElement('li');
    li.className = `ask-turn ask-${turn.role}`;

    const body = document.createElement('div');
    body.className = 'ask-body';
    // The question is the user's own words: shown as text, never parsed as markup.
    if (turn.role === 'user') body.textContent = turn.content;
    else body.innerHTML = renderMarkdown(turn.content);
    li.append(body);

    if (turn.role === 'assistant' && turn.content) {
      const copy = document.createElement('button');
      copy.type = 'button';
      copy.className = 'icon ask-copy';
      copy.textContent = '⧉';
      copy.title = 'Copy this answer';
      copy.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(turn.content);
          onStatus?.('Answer copied.');
        } catch (error) {
          onStatus?.(`Could not copy: ${error.message}`, true);
        }
      });
      li.append(copy);
    }
    return li;
  }

  function newConversation() {
    controller?.abort();
    thread = [];
    sentBrief = '';
    els.status.textContent = '';
    renderThread();
    renderBlocks();
  }

  /**
   * Roll back an exchange that never happened. Both turns go, so the model is never handed
   * two questions in a row, and the question comes back to the box rather than being lost.
   */
  function abandon(question, message) {
    thread.splice(-2, 2);
    els.question.value = question;
    els.status.textContent = message;
  }

  async function ask(question) {
    if (!llm.getKey()) {
      openSettings?.();
      onStatus?.('Add an OpenRouter key to use the assistant.', true);
      return;
    }

    // A changed brief means the exchange so far was about a different project state.
    if (stale()) {
      thread = [];
      sentBrief = '';
    }
    // The brief is built once per conversation and reused for every follow-up.
    if (thread.length === 0) sentBrief = currentBrief();
    const brief = sentBrief;

    thread.push({ role: 'user', content: question });
    const answer = { role: 'assistant', content: '' };
    thread.push(answer);
    renderThread();
    renderBlocks();

    const live = els.thread.lastElementChild;
    const body = live.querySelector('.ask-body');
    live.classList.add('streaming');
    els.status.textContent = `Asking ${llm.getModel()}…`;
    setBusy(true);

    controller = new AbortController();
    try {
      const text = await llm.stream(askMessages(brief, thread.slice(0, -1)), {
        key: llm.getKey(),
        model: llm.getModel(),
        signal: controller.signal,
        onDelta: (_delta, whole) => {
          answer.content = whole;
          body.innerHTML = renderMarkdown(whole);
          els.thread.scrollTop = els.thread.scrollHeight;
        },
      });
      answer.content = text;
      // Stopped before a single word arrived: there is no exchange to keep.
      if (!text.trim()) abandon(question, 'Stopped before the answer started.');
      else els.status.textContent = controller.signal.aborted ? 'Stopped.' : '';
    } catch (error) {
      abandon(question, error.message);
    } finally {
      controller = null;
      setBusy(false);
      renderThread();
      renderBlocks();
      els.question.focus();
    }
  }

  els.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const question = els.question.value.trim();
    if (!question) return;
    els.question.value = '';
    ask(question);
  });

  // Enter sends, Shift+Enter breaks the line: a question is usually one line, not a document.
  els.question.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      els.form.requestSubmit();
    }
  });

  els.stop.addEventListener('click', () => controller?.abort());
  els.fresh.addEventListener('click', newConversation);
  els.copy.addEventListener('click', copyContext);
  // The question travels with the context, so an empty box and a typed one are not the
  // same copy — and with no blocks ticked, the box is the only thing there is to copy.
  els.question.addEventListener('input', () => {
    els.copy.disabled = !clipboardText();
  });
  // Leaving the dialog ends the conversation; the picker state is what persists.
  root.addEventListener('close', () => {
    controller?.abort();
    thread = [];
    sentBrief = '';
  });

  return {
    open() {
      const { task } = sources();
      // Opening with a task in hand is a strong signal the question is about that task.
      if (task) chosen.add('task');
      writeBlocks(chosen);
      renderThread();
      els.copy.textContent = COPY_LABEL;
      renderBlocks();
      els.status.textContent = '';
      if (!root.open) root.showModal();
      els.question.focus();
    },
    close: () => root.close(),
  };
}
