// The micro-session frame. Pure: `now` is always injected, nothing here reads the clock
// or the DOM, so tests/ can fast-forward a whole afternoon in a millisecond.
//
// The shape of a session is the ADHD accommodation: short, ended on a win, and followed
// by a break that a page refresh cannot skip.

export const PLAY_MINUTES_DEFAULT = 5;
export const PLAY_MINUTES_MIN = 2;
export const PLAY_MINUTES_MAX = 15;

// The soft stop keeps its share of the session however long a grown-up makes it: three
// minutes of five, the shape the game was tuned at. A fixed three-minute soft stop inside
// a twelve-minute session would end almost every session on its first correct answer.
export const SOFT_STOP_RATIO = 0.6;
export const QUESTIONS_PER_MINUTE = 5;
export const NAP_MS = 2 * 60 * 1000;
// A session left open for longer than this was abandoned, not paused: coming back the
// next morning should not drop the child straight into a nap.
export const STALE_SESSION_MS = 30 * 60 * 1000;

const clamp = (n, lo, hi) => Math.min(Math.max(n, lo), hi);

/**
 * Turn the one number a grown-up sets — minutes of play — into the three limits the
 * session actually runs on. Out-of-range and nonsense values are pulled back into the
 * allowed span rather than rejected, so a hand-edited save can never produce a session
 * with no end.
 */
export function limitsFor(playMinutes) {
  const raw = Math.round(Number(playMinutes));
  const minutes = clamp(Number.isFinite(raw) ? raw : PLAY_MINUTES_DEFAULT, PLAY_MINUTES_MIN, PLAY_MINUTES_MAX);
  const hardMs = minutes * 60 * 1000;
  return {
    minutes,
    hardMs,
    softMs: Math.round(hardMs * SOFT_STOP_RATIO),
    maxQuestions: minutes * QUESTIONS_PER_MINUTE,
  };
}

export const DEFAULT_LIMITS = limitsFor(PLAY_MINUTES_DEFAULT);

export function startSession(now) {
  return { startedAt: now, answered: 0, correct: 0, napUntil: 0 };
}

export const elapsed = (session, now) => Math.max(0, now - (session?.startedAt ?? now));

/**
 * Why this session should end, checked after each answer:
 *   'count' — the question cap
 *   'hard'  — five minutes, wherever we are
 *   'soft'  — past three minutes and they just got one right, so we stop on a high note
 * The soft stop is deliberately the *last* check: a child who is struggling at 3:30 gets
 * to keep trying until they land one, or until the hard cap rescues them.
 */
export function shouldEnd(session, { now, correct, limits = DEFAULT_LIMITS }) {
  if (session.answered >= limits.maxQuestions) return 'count';
  if (elapsed(session, now) >= limits.hardMs) return 'hard';
  if (correct && elapsed(session, now) >= limits.softMs) return 'soft';
  return null;
}

/** The hard cap also applies to a session nobody is answering — checked on a timer. */
export const capReached = (session, now, limits = DEFAULT_LIMITS) =>
  elapsed(session, now) >= limits.hardMs;

/** True for a session that is running or has run over — as opposed to never started. */
export const isRunning = (session) => Boolean(session?.startedAt);

export const isStale = (session, now) => elapsed(session, now) >= STALE_SESSION_MS;

export const beginNap = (session, now) => ({ ...session, napUntil: now + NAP_MS });

export const isNapping = (session, now) => Boolean(session?.napUntil) && now < session.napUntil;

export const napRemaining = (session, now) =>
  Math.max(0, (session?.napUntil ?? 0) - now);

/** 0 at the start of a session, 1 at the hard cap — drives the sky's slide into dusk. */
export const dayProgress = (session, now, limits = DEFAULT_LIMITS) =>
  Math.min(1, elapsed(session, now) / limits.hardMs);

export function formatCountdown(ms) {
  const total = Math.ceil(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}
