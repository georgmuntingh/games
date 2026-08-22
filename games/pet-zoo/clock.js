// Clock geometry, snapping and grading. Pure: no DOM, no Date, no state — every
// function takes numbers and returns numbers, which is what makes tests/ possible.
//
// Angles are degrees measured clockwise from 12 o'clock, so a point on the face is
// (cx + r·sin θ, cy − r·cos θ) and the inverse is atan2(dx, −dy).

export const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
export const MINUTE_STEP = 5; // the child never has to be more precise than this
export const STEP_DEG = MINUTE_STEP * 6; // 30° between snap points

export const norm360 = (deg) => ((deg % 360) + 360) % 360;

const mod = (n, m) => ((n % m) + m) % m;

/** Where the minute hand points for m minutes past. 6° per minute. */
export const minuteAngle = (m) => norm360(m * 6);

/**
 * Where the hour hand points at h:m — 30° per hour *plus* half a degree per minute.
 * The +m/2 term is the whole pedagogical point: at 4:15 the little hand has already
 * left the 4, which is exactly the fact children get wrong.
 */
export const hourAngle = (h, m) => norm360(mod(h, 12) * 30 + m * 0.5);

/** Angle of a vector from the clock centre, in the same clockwise-from-12 frame. */
export const angleOf = (dx, dy) => norm360((Math.atan2(dx, -dy) * 180) / Math.PI);

/** A point at radius r along a face angle — for laying out hands, ticks and numerals. */
export function pointOnFace(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) };
}

/** Shortest angle between two headings, 0..180. */
export function angularDistance(a, b) {
  const d = Math.abs(norm360(a) - norm360(b));
  return d > 180 ? 360 - d : d;
}

/**
 * Snap a dragged minute hand to the nearest 5-minute tick. Rounding (not flooring) is
 * what makes 359° land on :00 rather than :55 — flooring would make the last tick before
 * the top of the hour impossible to reach without overshooting.
 */
export const snapMinute = (deg) => mod(Math.round(norm360(deg) / STEP_DEG) * MINUTE_STEP, 60);

/**
 * Read an hour off a dragged hour hand. The minute contribution is subtracted *before*
 * snapping, so at :55 — where the real hand sits almost on the next numeral — dragging
 * to just short of that numeral still means the earlier hour, and the hand doesn't jump
 * backwards when it re-renders.
 */
export function inferHour(deg, m) {
  const h = mod(Math.round((norm360(deg) - m * 0.5) / 30), 12);
  return h === 0 ? 12 : h;
}

/**
 * Which hand did a pointer at (dx, dy) from the centre mean to grab? Radius decides it
 * outright near the middle and near the rim; in the ambiguous ring the closer hand wins.
 * `radius` is the face radius in the same units as dx/dy.
 */
export function pickHand({ dx, dy, radius, hourDeg, minuteDeg }) {
  const r = Math.hypot(dx, dy) / radius;
  if (r < 0.18 || r > 1.15) return null; // dead centre, or outside the face
  if (r < 0.55) return 'hour';
  if (r > 0.72) return 'minute';
  const deg = angleOf(dx, dy);
  return angularDistance(deg, hourDeg) <= angularDistance(deg, minuteDeg) ? 'hour' : 'minute';
}

export const timeId = (h, m) => `${h}:${String(m).padStart(2, '0')}`;

export function parseTimeId(id) {
  const [h, m] = String(id).split(':').map(Number);
  return { h, m };
}

export const formatTime = (h, m) => timeId(h, m);

/**
 * Signed shortest distance in minutes, so a drag across the top of the face reads as a
 * few minutes forward rather than a 55-minute leap backwards. A drag samples often
 * enough that consecutive positions are always within half a turn of each other.
 */
export function minuteDelta(from, to) {
  let d = (to - from) % 60;
  if (d > 30) d -= 60;
  if (d < -30) d += 60;
  return d;
}

/**
 * Move the minute hand to `next` and carry the hour with it. On a real clock the two
 * hands are geared together: sweeping the minute hand forward past the 12 pulls the hour
 * hand into the next hour, and sweeping it back past the 12 drags the hour hand into the
 * previous one. Holding the hour still across that boundary would snap the hour hand
 * backwards to the numeral it had just spent a whole turn creeping away from.
 */
export function advanceMinuteTo({ h, m }, next) {
  const delta = minuteDelta(m, next);
  const travelled = m + delta;
  let hour = h;
  if (travelled >= 60) hour = (h % 12) + 1;
  else if (travelled < 0) hour = h === 1 ? 12 : h - 1;
  return { h: hour, m: next, delta };
}

/** Circular distance in minutes, 0..30. */
function minuteDistance(a, b) {
  const d = Math.abs(a - b) % 60;
  return d > 30 ? 60 - d : d;
}

/** Circular distance in hours, 0..6. */
function hourDistance(a, b) {
  const d = Math.abs(mod(a, 12) - mod(b, 12)) % 12;
  return d > 6 ? 12 - d : d;
}

/**
 * Compare the child's answer to the target and name the mistake, so the correction
 * animation can narrate it instead of just flashing "wrong".
 *   correct   — both hands right
 *   hourOff   — minutes right, wrong hour (the classic 3:15 for 4:15)
 *   minuteOff — hour right, wrong minutes
 *   both      — neither
 * `nearMiss` marks answers that are one tick and/or one hour away: worth a "so close!"
 * rather than the same copy as a wild guess.
 */
export function grade(target, answer) {
  const hourOk = mod(target.h, 12) === mod(answer.h, 12);
  const minuteOk = target.m === answer.m;
  const minuteDelta = minuteDistance(target.m, answer.m);
  const hourDelta = hourDistance(target.h, answer.h);
  let verdict;
  if (hourOk && minuteOk) verdict = 'correct';
  else if (minuteOk) verdict = 'hourOff';
  else if (hourOk) verdict = 'minuteOff';
  else verdict = 'both';
  return {
    verdict,
    correct: verdict === 'correct',
    nearMiss: verdict !== 'correct' && minuteDelta <= MINUTE_STEP && hourDelta <= 1,
    minuteDelta,
    hourDelta,
  };
}
