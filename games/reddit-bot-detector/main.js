import { PROFILES, BY_DIFFICULTY, DIFFICULTIES } from './profiles.js';
import { emptyTally, record, metrics, formatPercent } from './scoring.js';

const ROUND_SIZE = 8; // profiles per round; tiers hold more, so rounds vary and seen-memory rotates them
const STORAGE_PREFIX = 'reddit-bot-detector-';
const HISTORY_KEY = `${STORAGE_PREFIX}history`;
const HISTORY_LIMIT = 10;

// ----- DOM handles -----
const startEl = document.getElementById('start');
const roundEl = document.getElementById('round');
const scorecardEl = document.getElementById('scorecard');

const difficultyListEl = document.getElementById('difficulty-list');
const historyEl = document.getElementById('history');

const progressEl = document.getElementById('progress');
const runningScoreEl = document.getElementById('running-score');
const profileEl = document.getElementById('profile');
const verdictEl = document.getElementById('verdict');
const voteHumanBtn = document.getElementById('vote-human');
const voteBotBtn = document.getElementById('vote-bot');

const revealEl = document.getElementById('reveal');
const revealBanner = document.getElementById('reveal-banner');
const revealOutcome = document.getElementById('reveal-outcome');
const revealTells = document.getElementById('reveal-tells');
const nextBtn = document.getElementById('next');

const metricsEl = document.getElementById('metrics');
const bestNoteEl = document.getElementById('best-note');
const playAgainBtn = document.getElementById('play-again');
const changeDifficultyBtn = document.getElementById('change-difficulty');

// ----- localStorage helpers (resilient to disabled storage) -----
function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — game still works, just not persisted */
  }
}

const bestKey = (difficulty) => `${STORAGE_PREFIX}best-${difficulty}`;
const seenKey = (difficulty) => `${STORAGE_PREFIX}seen-${difficulty}`;

// ----- round state -----
let state = null;

// ----- screen switching -----
function show(section) {
  for (const el of [startEl, roundEl, scorecardEl]) {
    el.hidden = el !== section;
  }
}

// ----- start screen -----
function renderStart() {
  difficultyListEl.innerHTML = '';
  for (const diff of DIFFICULTIES) {
    const best = readJSON(bestKey(diff.id), null);
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'difficulty-card';
    card.innerHTML = `
      <span class="diff-label">${diff.label}</span>
      <span class="diff-blurb">${diff.blurb}</span>
      <span class="diff-best">${
        best
          ? `Best: ${formatPercent(best.accuracy)} acc · F1 ${formatPercent(best.f1)}`
          : 'Not played yet'
      }</span>`;
    card.addEventListener('click', () => startRound(diff.id));
    difficultyListEl.appendChild(card);
  }
  renderHistory();
  show(startEl);
}

function renderHistory() {
  const history = readJSON(HISTORY_KEY, []);
  if (!history.length) {
    historyEl.innerHTML = '';
    return;
  }
  const rows = history
    .map(
      (h) =>
        `<li><span class="hist-diff">${h.difficulty}</span>
         <span>${formatPercent(h.accuracy)} acc · F1 ${formatPercent(h.f1)}</span>
         <span class="hist-date">${h.date}</span></li>`,
    )
    .join('');
  historyEl.innerHTML = `<h3>Recent rounds</h3><ul class="history-list">${rows}</ul>`;
}

// ----- round selection (prefer unseen profiles) -----
function pickRound(difficulty) {
  const pool = BY_DIFFICULTY[difficulty] ?? [];
  let seen = new Set(readJSON(seenKey(difficulty), []));

  let unseen = pool.filter((p) => !seen.has(p.id));
  if (unseen.length < Math.min(ROUND_SIZE, pool.length)) {
    // Pool exhausted — reset seen memory and start fresh.
    seen = new Set();
    unseen = [...pool];
  }

  const chosen = shuffle(unseen).slice(0, Math.min(ROUND_SIZE, pool.length));
  // Mark chosen as seen and persist.
  for (const p of chosen) seen.add(p.id);
  writeJSON(seenKey(difficulty), [...seen]);
  return shuffle(chosen);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ----- gameplay -----
function startRound(difficulty) {
  state = {
    difficulty,
    profiles: pickRound(difficulty),
    index: 0,
    tally: emptyTally(),
  };
  show(roundEl);
  renderProfile();
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderProfile() {
  const p = state.profiles[state.index];

  progressEl.textContent = `Account ${state.index + 1} of ${state.profiles.length}`;
  const { tp, fp, fn, tn } = state.tally;
  const answered = tp + fp + fn + tn;
  runningScoreEl.textContent = answered ? `${tp + tn}/${answered} correct` : '';

  const ageText = formatAge(p.accountAgeDays);
  const posts = p.samplePosts
    .map(
      (post) => `
      <li class="sample-post">
        <div class="sample-meta">
          <span class="sample-sub">${escapeHtml(post.subreddit)}</span>
          <span class="sample-age">${escapeHtml(post.age)} ago</span>
          <span class="sample-score">▲ ${escapeHtml(String(post.score))}</span>
        </div>
        <p class="sample-text">${escapeHtml(post.text)}</p>
      </li>`,
    )
    .join('');

  profileEl.innerHTML = `
    <header class="profile-head">
      <span class="username">${escapeHtml(p.username)}</span>
      ${p.bio ? `<span class="bio">${escapeHtml(p.bio)}</span>` : ''}
    </header>
    <dl class="stats-grid">
      <div><dt>Account age</dt><dd>${ageText}</dd></div>
      <div><dt>Cake day</dt><dd>${escapeHtml(p.cakeDay)}</dd></div>
      <div><dt>Post karma</dt><dd>${p.karma.post.toLocaleString()}</dd></div>
      <div><dt>Comment karma</dt><dd>${p.karma.comment.toLocaleString()}</dd></div>
    </dl>
    <div class="field">
      <span class="field-label">Active in</span>
      <span class="field-value">${p.subreddits.map((s) => `<code>${escapeHtml(s)}</code>`).join(' ')}</span>
    </div>
    <div class="field">
      <span class="field-label">Posting pattern</span>
      <span class="field-value">${escapeHtml(p.cadence)}</span>
    </div>
    <div class="field">
      <span class="field-label">Recent activity</span>
      <ul class="sample-list">${posts}</ul>
    </div>`;

  // Reset interaction state for this profile.
  revealEl.hidden = true;
  verdictEl.hidden = false;
  voteHumanBtn.disabled = false;
  voteBotBtn.disabled = false;
}

function formatAge(days) {
  if (days < 60) return `${days} days`;
  if (days < 730) return `${Math.round(days / 30)} months`;
  return `${(days / 365).toFixed(1)} years`;
}

function vote(predictedBot) {
  const p = state.profiles[state.index];
  const actualBot = p.label === 'bot';
  record(state.tally, predictedBot, actualBot);

  const correct = predictedBot === actualBot;
  voteHumanBtn.disabled = true;
  voteBotBtn.disabled = true;
  verdictEl.hidden = true;

  revealBanner.textContent = correct
    ? `✓ Correct — this was a ${p.label}.`
    : `✗ Wrong — this was a ${p.label}, you said ${predictedBot ? 'bot' : 'human'}.`;
  revealBanner.className = `reveal-banner ${correct ? 'correct' : 'incorrect'}`;
  revealOutcome.textContent = `Outcome: ${p.outcome}.`;
  revealTells.innerHTML = p.tells.map((t) => `<li>${escapeHtml(t)}</li>`).join('');

  nextBtn.textContent =
    state.index + 1 < state.profiles.length ? 'Next →' : 'See results →';
  revealEl.hidden = false;
  nextBtn.focus();
}

function next() {
  state.index += 1;
  if (state.index < state.profiles.length) {
    renderProfile();
  } else {
    finishRound();
  }
}

// ----- scorecard -----
function finishRound() {
  const { tp, fp, fn, tn } = state.tally;
  document.getElementById('cell-tp').textContent = tp;
  document.getElementById('cell-fp').textContent = fp;
  document.getElementById('cell-fn').textContent = fn;
  document.getElementById('cell-tn').textContent = tn;

  const m = metrics(state.tally);
  metricsEl.innerHTML = [
    ['Accuracy', m.accuracy],
    ['Precision', m.precision],
    ['Recall', m.recall],
    ['F1 score', m.f1],
  ]
    .map(
      ([name, val]) =>
        `<li><span class="metric-name">${name}</span><span class="metric-val">${formatPercent(
          val,
        )}</span></li>`,
    )
    .join('');

  // Persist best (by accuracy, tie-broken by F1) + append history.
  const best = readJSON(bestKey(state.difficulty), null);
  const isBest =
    !best ||
    (m.accuracy ?? 0) > (best.accuracy ?? 0) ||
    ((m.accuracy ?? 0) === (best.accuracy ?? 0) && (m.f1 ?? 0) > (best.f1 ?? 0));
  const date = new Date().toISOString().slice(0, 10);
  if (isBest) {
    writeJSON(bestKey(state.difficulty), {
      accuracy: m.accuracy,
      f1: m.f1,
      date,
    });
    bestNoteEl.textContent = '🏆 New best for this difficulty!';
  } else {
    bestNoteEl.textContent = best
      ? `Best so far: ${formatPercent(best.accuracy)} acc · F1 ${formatPercent(best.f1)}`
      : '';
  }

  const history = readJSON(HISTORY_KEY, []);
  history.unshift({
    difficulty: state.difficulty,
    accuracy: m.accuracy,
    f1: m.f1,
    date,
  });
  writeJSON(HISTORY_KEY, history.slice(0, HISTORY_LIMIT));

  show(scorecardEl);
}

// ----- wiring -----
voteHumanBtn.addEventListener('click', () => vote(false));
voteBotBtn.addEventListener('click', () => vote(true));
nextBtn.addEventListener('click', next);
playAgainBtn.addEventListener('click', () => startRound(state.difficulty));
changeDifficultyBtn.addEventListener('click', renderStart);

// Guard against an empty dataset.
if (!PROFILES.length) {
  startEl.innerHTML = '<p>No profiles available.</p>';
} else {
  renderStart();
}
