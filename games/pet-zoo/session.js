// The micro-session frame. Pure: `now` is always injected, nothing here reads the clock
// or the DOM, so tests/ can fast-forward a whole afternoon in a millisecond.
//
// The shape of a session is the ADHD accommodation: short, ended on a win, and followed
// by a break that a page refresh cannot skip.

export const SOFT_STOP_MS = 3 * 60 * 1000; // after this, stop at the next correct answer
export const HARD_CAP_MS = 5 * 60 * 1000; // after this, stop regardless
export const MAX_QUESTIONS = 24; // catches the fast-fingered case before the clock does
export const NAP_MS = 2 * 60 * 1000;
// A session left open for longer than this was abandoned, not paused: coming back the
// next morning should not drop the child straight into a nap.
export const STALE_SESSION_MS = 30 * 60 * 1000;

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
export function shouldEnd(session, { now, correct }) {
  if (session.answered >= MAX_QUESTIONS) return 'count';
  if (elapsed(session, now) >= HARD_CAP_MS) return 'hard';
  if (correct && elapsed(session, now) >= SOFT_STOP_MS) return 'soft';
  return null;
}

/** The hard cap also applies to a session nobody is answering — checked on a timer. */
export const capReached = (session, now) => elapsed(session, now) >= HARD_CAP_MS;

/** True for a session that is running or has run over — as opposed to never started. */
export const isRunning = (session) => Boolean(session?.startedAt);

export const isStale = (session, now) => elapsed(session, now) >= STALE_SESSION_MS;

export const beginNap = (session, now) => ({ ...session, napUntil: now + NAP_MS });

export const isNapping = (session, now) => Boolean(session?.napUntil) && now < session.napUntil;

export const napRemaining = (session, now) =>
  Math.max(0, (session?.napUntil ?? 0) - now);

/** 0 at the start of a session, 1 at the hard cap — drives the sky's slide into dusk. */
export const dayProgress = (session, now) =>
  Math.min(1, elapsed(session, now) / HARD_CAP_MS);

export function formatCountdown(ms) {
  const total = Math.ceil(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}
