import {
  advanceMinuteTo,
  angleOf,
  angularDistance,
  grade,
  hourAngle,
  inferHour,
  minuteAngle,
  minuteDelta,
  norm360,
  parseTimeId,
  pickHand,
  pointOnFace,
  snapMinute,
  spokenTime,
  timeId,
} from '../clock.js';
import {
  ALL_ITEMS,
  LAST_TIER,
  TIERS,
  tierItems,
  tierMastery,
  tierOfMinute,
  unlockedTier,
  unseenItems,
} from '../curriculum.js';
import {
  applyEase,
  createItem,
  DAY_MS,
  EASE_MAX,
  EASE_MIN,
  GRADUATION_STREAK,
  LEARNING_STEPS,
  MAX_INTERVAL_DAYS,
  MAX_LEARNING,
  nextInterval,
  nextItem,
  qualityOf,
  refreshTier,
  RELEARN_DELAY,
  review,
} from '../srs.js';
import {
  beginNap,
  capReached,
  dayProgress,
  formatCountdown,
  HARD_CAP_MS,
  isNapping,
  isRunning,
  isStale,
  MAX_QUESTIONS,
  napRemaining,
  NAP_MS,
  shouldEnd,
  SOFT_STOP_MS,
  startSession,
  STALE_SESSION_MS,
} from '../session.js';
import { clear, createSaver, freshState, load, STORAGE_KEY, touchDay, VERSION, write } from '../store.js';
import { defaultName, moodOf, petName, speciesFor, SPECIES } from '../pets.js';

/* ------------------------------------------------------------- harness */

const groups = [];
let group = null;

function describe(name) {
  group = { name, tests: [] };
  groups.push(group);
}

function test(name, fn) {
  group.tests.push({ name, fn });
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'assertion failed');
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message || 'mismatch'}: expected ${expected}, got ${actual}`);
  }
}

function assertClose(actual, expected, tol = 1e-6, message) {
  if (Math.abs(actual - expected) > tol) {
    throw new Error(`${message || 'mismatch'}: expected ${expected}, got ${actual}`);
  }
}

/* --------------------------------------------------------------- clock */

describe('clock — angles');

test('the minute hand turns 6° a minute and comes back round at the hour', () => {
  assertEqual(minuteAngle(0), 0);
  assertEqual(minuteAngle(15), 90);
  assertEqual(minuteAngle(30), 180);
  assertEqual(minuteAngle(45), 270);
  assertEqual(minuteAngle(60), 0, 'sixty minutes is a full turn');
});

test('the hour hand is coupled to the minutes — at 4:15 it has left the 4', () => {
  assertEqual(hourAngle(4, 0), 120);
  assertEqual(hourAngle(4, 15), 127.5, 'a quarter of the 30° hour sector');
  assertEqual(hourAngle(4, 30), 135);
  assertEqual(hourAngle(12, 0), 0, 'twelve sits at the top, not at 360');
  assert(hourAngle(4, 55) < hourAngle(5, 0), 'the hand never overtakes its own hour');
});

test('angleOf inverts pointOnFace for every five-minute heading', () => {
  for (let deg = 0; deg < 360; deg += 30) {
    const p = pointOnFace(0, 0, 100, deg);
    assertClose(angleOf(p.x, p.y), deg, 1e-9, `heading ${deg}`);
  }
});

test('every one of the 144 times round-trips through its hand angles', () => {
  for (const { h, m } of ALL_ITEMS) {
    const p = pointOnFace(0, 0, 100, minuteAngle(m));
    assertEqual(snapMinute(angleOf(p.x, p.y)), m, `minutes of ${timeId(h, m)}`);
    const q = pointOnFace(0, 0, 100, hourAngle(h, m));
    assertEqual(inferHour(angleOf(q.x, q.y), m), h, `hour of ${timeId(h, m)}`);
  }
});

test('angularDistance takes the short way round', () => {
  assertEqual(angularDistance(350, 10), 20);
  assertEqual(angularDistance(10, 350), 20);
  assertEqual(angularDistance(0, 180), 180);
});

describe('clock — snapping');

test('snapMinute lands on the nearest five-minute tick', () => {
  assertEqual(snapMinute(0), 0);
  assertEqual(snapMinute(30), 5);
  assertEqual(snapMinute(92), 15, 'just past the 3');
  assertEqual(snapMinute(88), 15, 'just short of the 3');
});

test('rounding (not flooring) makes the last tick before the hour reachable', () => {
  assertEqual(snapMinute(359), 0, 'a hair short of the top is :00, not :55');
  assertEqual(snapMinute(345), 0, 'exactly halfway rounds up to the top');
  assertEqual(snapMinute(344), 55, 'a degree earlier is still :55');
});

test('snapMinute normalises angles from any number of turns', () => {
  assertEqual(snapMinute(-30), 55);
  assertEqual(snapMinute(720 + 90), 15);
});

test('inferHour subtracts the minutes first, so the hand never jumps backwards', () => {
  // At :55 the real hour hand sits 27.5° into the sector, almost on the next numeral.
  // Dragging to just short of the 5 must still read as four o'clock.
  assertEqual(inferHour(hourAngle(4, 55), 55), 4);
  assertEqual(inferHour(147, 55), 4, 'a whisker below the 5');
  assertEqual(inferHour(hourAngle(5, 55), 55), 5);
  assertEqual(inferHour(0, 0), 12, 'the top of the face is twelve, not zero');
});

test('inferHour reads every hour correctly at every five-minute offset', () => {
  for (let m = 0; m < 60; m += 5) {
    for (let h = 1; h <= 12; h += 1) {
      assertEqual(inferHour(hourAngle(h, m), m), h, `hour ${h} at :${m}`);
    }
  }
});

describe('clock — the hands are geared together');

test('minuteDelta takes the short way round the face', () => {
  assertEqual(minuteDelta(10, 15), 5);
  assertEqual(minuteDelta(15, 10), -5);
  assertEqual(minuteDelta(55, 0), 5, 'across the top is five minutes forward');
  assertEqual(minuteDelta(0, 55), -5, 'and five minutes back the other way');
});

test('an ordinary minute step leaves the hour alone', () => {
  const next = advanceMinuteTo({ h: 4, m: 10 }, 15);
  assertEqual(next.h, 4);
  assertEqual(next.m, 15);
});

test('sweeping the minute hand forward past the 12 carries the hour', () => {
  const next = advanceMinuteTo({ h: 4, m: 55 }, 0);
  assertEqual(next.h, 5, 'four fifty-five plus five minutes is five o\'clock');
  assertEqual(next.m, 0);
});

test('sweeping it back past the 12 borrows from the hour', () => {
  const next = advanceMinuteTo({ h: 5, m: 0 }, 55);
  assertEqual(next.h, 4, 'five o\'clock minus five minutes is four fifty-five');
  assertEqual(next.m, 55);
});

test('the carry wraps round the top of the dial in both directions', () => {
  assertEqual(advanceMinuteTo({ h: 12, m: 55 }, 0).h, 1, 'twelve carries to one, not to thirteen');
  assertEqual(advanceMinuteTo({ h: 1, m: 0 }, 55).h, 12, 'one borrows back to twelve, not to zero');
});

test('the hour hand crosses the boundary by one tick, never snapping backwards', () => {
  // The bug this guards: holding the hour still across the top made the hand jump back
  // 27.5° — all the way to the numeral it had spent a full turn creeping away from.
  const before = { h: 4, m: 55 };
  const after = advanceMinuteTo(before, 0);
  const step = hourAngle(after.h, after.m) - hourAngle(before.h, before.m);
  assertClose(step, 2.5, 1e-9, 'the same half-degree-per-minute as every other tick');
  assert(step > 0, 'forward motion of the minute hand never moves the hour hand back');
});

test('a full turn of the minute hand advances exactly one hour', () => {
  let time = { h: 4, m: 0 };
  for (let i = 0; i < 12; i += 1) {
    time = advanceMinuteTo(time, (time.m + 5) % 60);
  }
  assertEqual(time.h, 5, 'twelve five-minute steps is one hour on');
  assertEqual(time.m, 0);
});

test('winding the minute hand backwards a full turn undoes it exactly', () => {
  let time = { h: 4, m: 0 };
  for (let i = 0; i < 12; i += 1) {
    time = advanceMinuteTo(time, (time.m + 55) % 60);
  }
  assertEqual(time.h, 3);
  assertEqual(time.m, 0);
});

test('winding forward twelve hours returns to the same face', () => {
  let time = { h: 4, m: 0 };
  for (let i = 0; i < 12 * 12; i += 1) {
    time = advanceMinuteTo(time, (time.m + 5) % 60);
  }
  assertEqual(time.h, 4, 'the hour never falls off the end of the dial');
  assertEqual(time.m, 0);
});

test('advanceMinuteTo does not mutate the time it was given', () => {
  const time = { h: 4, m: 55 };
  advanceMinuteTo(time, 0);
  assertEqual(time.h, 4);
  assertEqual(time.m, 55);
});

describe('clock — grabbing a hand');

test('radius alone decides near the pin and near the rim', () => {
  const face = { radius: 180, hourDeg: 0, minuteDeg: 90 };
  assertEqual(pickHand({ dx: 0, dy: -10, ...face }), null, 'dead centre grabs nothing');
  assertEqual(pickHand({ dx: 0, dy: -60, ...face }), 'hour');
  assertEqual(pickHand({ dx: 0, dy: -160, ...face }), 'minute');
  assertEqual(pickHand({ dx: 0, dy: -260, ...face }), null, 'outside the face');
});

test('in the overlap ring the nearer hand wins', () => {
  const face = { radius: 180, hourDeg: 0, minuteDeg: 180 };
  const r = 180 * 0.63; // between the two bands
  assertEqual(pickHand({ dx: 0, dy: -r, ...face }), 'hour', 'pointing at the hour hand');
  assertEqual(pickHand({ dx: 0, dy: r, ...face }), 'minute', 'pointing at the minute hand');
});

describe('clock — grading');

test('both hands right is correct', () => {
  const g = grade({ h: 4, m: 15 }, { h: 4, m: 15 });
  assertEqual(g.verdict, 'correct');
  assert(g.correct);
  assert(!g.nearMiss);
});

test('the classic 3:15-for-4:15 is named as an hour mistake', () => {
  const g = grade({ h: 4, m: 15 }, { h: 3, m: 15 });
  assertEqual(g.verdict, 'hourOff');
  assertEqual(g.hourDelta, 1);
  assert(g.nearMiss, 'one hour out deserves "so close"');
});

test('a wrong minute with the right hour is a minute mistake', () => {
  const g = grade({ h: 4, m: 15 }, { h: 4, m: 20 });
  assertEqual(g.verdict, 'minuteOff');
  assertEqual(g.minuteDelta, 5);
  assert(g.nearMiss);
});

test('a wild guess is neither correct nor a near miss', () => {
  const g = grade({ h: 4, m: 15 }, { h: 9, m: 40 });
  assertEqual(g.verdict, 'both');
  assert(!g.nearMiss);
});

test('minute distance wraps round the top of the face', () => {
  assertEqual(grade({ h: 1, m: 0 }, { h: 1, m: 55 }).minuteDelta, 5);
  assertEqual(grade({ h: 1, m: 0 }, { h: 1, m: 30 }).minuteDelta, 30);
});

test('hour distance wraps too, so 12 and 1 are one apart', () => {
  assertEqual(grade({ h: 12, m: 0 }, { h: 1, m: 0 }).hourDelta, 1);
  assertEqual(grade({ h: 12, m: 0 }, { h: 12, m: 0 }).hourDelta, 0);
});

describe('clock — words and ids');

test('times are spoken the way a person says them', () => {
  assertEqual(spokenTime(4, 0), "four o'clock");
  assertEqual(spokenTime(4, 15), 'quarter past four');
  assertEqual(spokenTime(4, 30), 'half past four');
  assertEqual(spokenTime(4, 45), 'quarter to five', 'past the half hour counts to the next hour');
  assertEqual(spokenTime(12, 55), 'five to one', 'twelve rolls over to one');
});

test('time ids pad the minutes and parse back', () => {
  assertEqual(timeId(4, 5), '4:05');
  const parsed = parseTimeId('4:05');
  assertEqual(parsed.h, 4);
  assertEqual(parsed.m, 5);
});

test('norm360 folds any angle into one turn', () => {
  assertEqual(norm360(-90), 270);
  assertEqual(norm360(450), 90);
});

/* ---------------------------------------------------------- curriculum */

describe('curriculum');

test('the four tiers hold 12, 12, 24 and 96 times', () => {
  assertEqual(tierItems(0).length, 12);
  assertEqual(tierItems(1).length, 12);
  assertEqual(tierItems(2).length, 24);
  assertEqual(tierItems(3).length, 96);
  assertEqual(ALL_ITEMS.length, 144, 'twelve hours by twelve five-minute marks');
});

test('every five-minute value belongs to exactly one tier', () => {
  const seen = new Set();
  for (const tier of TIERS) {
    for (const m of tier.minutes) {
      assert(!seen.has(m), `minute ${m} appears twice`);
      seen.add(m);
      assertEqual(tierOfMinute(m), tier.id);
    }
  }
  assertEqual(seen.size, 12);
});

test('a tier opens at 80% mastery of the one below, not before', () => {
  const items = {};
  const graduate = (n) => {
    for (const t of tierItems(0).slice(0, n)) {
      items[t.id] = { ...createItem({ ...t, species: 'mochi' }), phase: 'graduated' };
    }
  };
  graduate(9); // 9/12 = 75%
  assertEqual(unlockedTier(items), 0, 'three quarters is not enough');
  assertClose(tierMastery(items, 0), 0.75);
  graduate(10); // 10/12 = 83%
  assertEqual(unlockedTier(items), 1);
});

test('unlocking never runs past the last tier', () => {
  const items = {};
  for (const t of ALL_ITEMS) {
    items[t.id] = { ...createItem({ ...t, species: 'mochi' }), phase: 'graduated' };
  }
  assertEqual(unlockedTier(items), LAST_TIER);
});

test('unseenItems only offers times from the unlocked tiers, in teaching order', () => {
  const first = unseenItems({}, 0);
  assertEqual(first.length, 12);
  assertEqual(first[0].id, '1:00');
  assert(
    unseenItems({}, 1).every((t) => t.tier <= 1),
    'nothing from a locked tier'
  );
});

/* ----------------------------------------------------------------- srs */

describe('srs — answer quality');

test('quality falls with hesitation and reversals, and is zero when wrong', () => {
  assertEqual(qualityOf({ correct: true, ms: 3000, reversals: 0 }), 5);
  assertEqual(qualityOf({ correct: true, ms: 12000, reversals: 0 }), 4);
  assertEqual(qualityOf({ correct: true, ms: 3000, reversals: 1 }), 4);
  assertEqual(qualityOf({ correct: true, ms: 25000, reversals: 0 }), 3);
  assertEqual(qualityOf({ correct: true, ms: 3000, reversals: 2 }), 3, 'waggling the hand about');
  assertEqual(qualityOf({ correct: false, ms: 1000, reversals: 0 }), 0);
});

test('ease rises on a confident answer and is clamped at both ends', () => {
  assert(applyEase(2.5, 5) > 2.5);
  assert(applyEase(2.5, 3) < 2.5);
  assertEqual(applyEase(EASE_MAX, 5), EASE_MAX, 'cannot get easier than the ceiling');
  assertEqual(applyEase(EASE_MIN, 0), EASE_MIN, 'cannot get harder than the floor');
});

test('intervals grow 1, 3, then by the ease factor, capped at 60 days', () => {
  assertEqual(nextInterval(1, 0, 2.5), 1);
  assertEqual(nextInterval(2, 1, 2.5), 3);
  assertEqual(nextInterval(3, 3, 2.5), 8);
  assertEqual(nextInterval(9, 40, 2.5), MAX_INTERVAL_DAYS, 'the cap holds');
});

describe('srs — learning steps');

const seed = () => createItem({ h: 4, m: 15, species: 'fizz', reviewClock: 0 });

test('a new time is due straight away', () => {
  const item = seed();
  assertEqual(item.phase, 'learning');
  assertEqual(item.dueStep, 1);
  assertEqual(item.hatchedAt, null, 'it arrives as an egg');
});

test('each correct answer pushes the time further down the queue', () => {
  let item = seed();
  item = review(item, { correct: true, ms: 3000, reviewClock: 1, now: 0 }).item;
  assertEqual(item.dueStep, 1 + LEARNING_STEPS[1], 'back in three questions');
  item = review(item, { correct: true, ms: 3000, reviewClock: 4, now: 0 }).item;
  assertEqual(item.dueStep, 4 + LEARNING_STEPS[2], 'then in eight');
});

test('three in a row graduates the time and hatches its egg', () => {
  let item = seed();
  let events;
  for (let i = 1; i <= GRADUATION_STREAK; i += 1) {
    ({ item, events } = review(item, { correct: true, ms: 3000, reviewClock: i, now: 5000 }));
  }
  assertEqual(item.phase, 'graduated');
  assert(events.graduated && events.hatched, 'graduating is what hatching means');
  assertEqual(item.hatchedAt, 5000);
  assertEqual(item.intervalDays, 1);
  assertEqual(item.dueAt, 5000 + DAY_MS);
  assertEqual(item.dueStep, null, 'it has left the question-counted queue');
});

test('a time only hatches once, however often it is reviewed', () => {
  let item = seed();
  for (let i = 1; i <= 6; i += 1) {
    const r = review(item, { correct: true, ms: 3000, reviewClock: i, now: 5000 });
    item = r.item;
    if (i > GRADUATION_STREAK) assert(!r.events.hatched, `hatched twice at review ${i}`);
  }
});

test('a wrong answer resets the streak and brings the time straight back', () => {
  let item = seed();
  item = review(item, { correct: true, ms: 3000, reviewClock: 1, now: 0 }).item;
  item = review(item, { correct: false, ms: 9000, reviewClock: 2, now: 0 }).item;
  assertEqual(item.correctStreak, 0);
  assertEqual(item.step, 0);
  assertEqual(item.dueStep, 2 + RELEARN_DELAY, 'the question after next, not the very next');
  assertEqual(item.lapses, 0, 'missing a time you never knew is not a lapse');
});

describe('srs — graduated reviews');

const graduated = () => {
  let item = seed();
  for (let i = 1; i <= GRADUATION_STREAK; i += 1) {
    item = review(item, { correct: true, ms: 3000, reviewClock: i, now: 0 }).item;
  }
  return item;
};

test('a graduated time stretches out in days, not questions', () => {
  let item = graduated();
  const r = review(item, { correct: true, ms: 3000, reviewClock: 20, now: DAY_MS });
  item = r.item;
  assertEqual(item.reps, 2);
  assertEqual(item.intervalDays, 3);
  assertEqual(item.dueAt, DAY_MS + 3 * DAY_MS);
  assert(item.ease > 2.5, 'a confident answer makes it easier');
});

test('a lapse drops the time back into the learning queue and costs ease', () => {
  const before = graduated();
  const { item, events } = review(before, { correct: false, ms: 9000, reviewClock: 30, now: 0 });
  assert(events.lapsed);
  assertEqual(item.phase, 'learning');
  assertEqual(item.lapses, 1);
  assertEqual(item.reps, 0);
  assertEqual(item.dueAt, 0);
  assertClose(item.ease, before.ease - 0.2, 1e-9);
  assertEqual(item.dueStep, 30 + RELEARN_DELAY);
  assertEqual(item.hatchedAt, before.hatchedAt, 'the pet is never taken away');
});

test('review never mutates the item it was given', () => {
  const item = seed();
  const snapshot = JSON.stringify(item);
  review(item, { correct: true, ms: 1000, reviewClock: 1, now: 0 });
  assertEqual(JSON.stringify(item), snapshot);
});

describe('srs — choosing the next question');

const stateWith = (items, extra = {}) => ({ reviewClock: 0, tier: 0, items, ...extra });

test('an overdue learning time beats everything else', () => {
  const items = {
    '1:00': { ...seed(), h: 1, m: 0, dueStep: 1 },
    '2:00': { ...seed(), h: 2, m: 0, dueStep: 99 },
  };
  assertEqual(nextItem(stateWith(items), { now: 0 }), '1:00');
});

test('the longest-overdue learning time comes first', () => {
  const items = {
    '1:00': { ...seed(), dueStep: 3 },
    '2:00': { ...seed(), dueStep: 1 },
  };
  assertEqual(nextItem(stateWith(items, { reviewClock: 9 }), { now: 0 }), '2:00');
});

test('with nothing due, a hungry pet is fed before a new egg is laid', () => {
  const items = { '1:00': { ...graduated(), dueAt: 10 } };
  assertEqual(nextItem(stateWith(items, { reviewClock: 5 }), { now: 1000 }), '1:00');
});

test('a new time is introduced only while fewer than seven are being learned', () => {
  const items = {};
  for (const t of tierItems(0).slice(0, MAX_LEARNING)) {
    items[t.id] = { ...seed(), h: t.h, m: t.m, dueStep: 9999 };
  }
  const picked = nextItem(stateWith(items, { reviewClock: 5 }), { now: 0 });
  assert(items[picked], 'a full learning queue introduces nothing new');

  delete items[tierItems(0)[0].id]; // back down to six
  const fresh = nextItem(stateWith(items, { reviewClock: 5 }), { now: 0 });
  assertEqual(fresh, '1:00', 'room again, so the next unseen time arrives');
});

test('new times are drawn only from the unlocked tiers', () => {
  const picked = nextItem(stateWith({}, { tier: 0 }), { now: 0 });
  assertEqual(tierOfMinute(parseTimeId(picked).m), 0);
});

test('the time just answered is never asked twice in a row', () => {
  const items = {
    '1:00': { ...seed(), dueStep: 1 },
    '2:00': { ...seed(), dueStep: 1 },
  };
  assertEqual(nextItem(stateWith(items, { reviewClock: 5 }), { now: 0, exclude: '1:00' }), '2:00');
});

test('with only one time in the whole zoo, it is asked again rather than nothing', () => {
  const items = { '1:00': { ...seed(), dueStep: 1 } };
  const state = stateWith(items, { reviewClock: 5, tier: 0 });
  // Every other tier-0 time is unseen, so a new one is offered rather than a repeat.
  const picked = nextItem(state, { now: 0, exclude: '1:00' });
  assert(picked && picked !== '1:00', 'there is always something to ask');
});

test('refreshTier reports the moment a tier opens and never closes one again', () => {
  const items = {};
  for (const t of tierItems(0)) {
    items[t.id] = { ...seed(), h: t.h, m: t.m, phase: 'graduated' };
  }
  const opened = refreshTier({ tier: 0, items });
  assertEqual(opened.tier, 1);
  assert(opened.unlocked);
  assert(!refreshTier({ tier: 1, items }).unlocked, 'only the transition counts');
  assertEqual(refreshTier({ tier: 3, items: {} }).tier, 3, 'a tier never locks again');
});

/* ------------------------------------------------------------- session */

describe('session — the caps');

test('a fresh session runs on and ends nothing', () => {
  const s = startSession(0);
  assertEqual(shouldEnd({ ...s, answered: 3 }, { now: 30000, correct: true }), null);
});

test('past three minutes the session ends on the next correct answer — a win, not a cut-off', () => {
  const s = { ...startSession(0), answered: 8 };
  assertEqual(shouldEnd(s, { now: SOFT_STOP_MS + 1000, correct: true }), 'soft');
  assertEqual(
    shouldEnd(s, { now: SOFT_STOP_MS + 1000, correct: false }),
    null,
    'a child who is struggling keeps trying'
  );
});

test('five minutes ends it however it is going', () => {
  const s = { ...startSession(0), answered: 8 };
  assertEqual(shouldEnd(s, { now: HARD_CAP_MS, correct: false }), 'hard');
  assert(capReached(s, HARD_CAP_MS));
  assert(!capReached(s, HARD_CAP_MS - 1));
});

test('the question cap catches a fast session before the clock does', () => {
  const s = { ...startSession(0), answered: MAX_QUESTIONS };
  assertEqual(shouldEnd(s, { now: 10000, correct: true }), 'count');
});

test('the sky darkens from nothing to full over the hard cap', () => {
  const s = startSession(0);
  assertEqual(dayProgress(s, 0), 0);
  assertClose(dayProgress(s, HARD_CAP_MS / 2), 0.5);
  assertEqual(dayProgress(s, HARD_CAP_MS * 3), 1, 'and never past full');
});

describe('session — the nap');

test('the nap runs for two minutes from when it starts', () => {
  const napped = beginNap(startSession(0), 1000);
  assert(isNapping(napped, 1000));
  assert(isNapping(napped, 1000 + NAP_MS - 1));
  assert(!isNapping(napped, 1000 + NAP_MS), 'and then it is over');
  assertEqual(napRemaining(napped, 1000), NAP_MS);
  assertEqual(napRemaining(napped, 9e12), 0, 'never counts below zero');
});

test('the nap is stored as a wall-clock deadline, so a reload cannot skip it', () => {
  const napped = beginNap(startSession(0), 1000);
  const reloaded = JSON.parse(JSON.stringify(napped));
  assert(isNapping(reloaded, 1000 + NAP_MS / 2), 'still asleep after a page refresh');
});

test('a session in progress is resumable; one left overnight is not', () => {
  assert(!isRunning(startSession(0)), 'startedAt 0 means not yet begun');
  assert(isRunning(startSession(5000)));
  const s = startSession(0);
  assert(!isStale(s, SOFT_STOP_MS), 'a live session is not stale');
  assert(isStale(s, STALE_SESSION_MS), 'half an hour later it has been abandoned');
});

test('the countdown reads as minutes and seconds', () => {
  assertEqual(formatCountdown(NAP_MS), '2:00');
  assertEqual(formatCountdown(95000), '1:35');
  assertEqual(formatCountdown(0), '0:00');
});

/* --------------------------------------------------------------- store */

describe('store');

// These touch the real key the game uses, so they put back whatever was there.
function withStorage(fn) {
  const saved = localStorage.getItem(STORAGE_KEY);
  try {
    fn();
  } finally {
    if (saved === null) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, saved);
  }
}

const fakeStorage = () => ({
  data: {},
  getItem(k) {
    return this.data[k] ?? null;
  },
  setItem(k, v) {
    this.data[k] = String(v);
  },
  removeItem(k) {
    delete this.data[k];
  },
});

test('a fresh state has no items, no tier progress and no session', () => {
  const s = freshState(1000);
  assertEqual(s.version, VERSION);
  assertEqual(Object.keys(s.items).length, 0);
  assertEqual(s.tier, 0);
  assertEqual(s.reviewClock, 0);
  assert(!isRunning(s.session));
});

test('state round-trips through storage', () => {
  const storage = fakeStorage();
  const state = freshState(1000);
  state.items['4:15'] = seed();
  state.reviewClock = 7;
  write(state, storage);
  const back = load(2000, storage);
  assertEqual(back.reviewClock, 7);
  assertEqual(back.items['4:15'].species, 'fizz');
});

test('an unknown version is discarded rather than half-read', () => {
  const storage = fakeStorage();
  storage.setItem(STORAGE_KEY, JSON.stringify({ version: 99, reviewClock: 500, items: {} }));
  assertEqual(load(0, storage).reviewClock, 0);
});

test('a corrupt blob loads as a fresh zoo instead of throwing', () => {
  const storage = fakeStorage();
  storage.setItem(STORAGE_KEY, '{not json at all');
  assertEqual(load(0, storage).reviewClock, 0);
  storage.setItem(STORAGE_KEY, JSON.stringify({ version: VERSION, items: 'nonsense' }));
  assertEqual(load(0, storage).reviewClock, 0);
});

test('missing settings are filled in from the defaults', () => {
  const storage = fakeStorage();
  storage.setItem(STORAGE_KEY, JSON.stringify({ ...freshState(0), settings: { sound: false } }));
  const back = load(0, storage);
  assertEqual(back.settings.sound, false, 'what was stored wins');
  assertEqual(back.settings.haptics, true, 'what was missing is defaulted');
});

test('a storage that refuses to write is survivable', () => {
  const blocked = {
    getItem() {
      return null;
    },
    setItem() {
      throw new Error('QuotaExceededError');
    },
    removeItem() {
      throw new Error('blocked');
    },
  };
  assertEqual(write(freshState(0), blocked), false, 'it reports the failure');
  clear(blocked); // must not throw
  assertEqual(load(0, blocked).version, VERSION);
});

test('the saver coalesces a burst of writes into one', () => {
  const storage = fakeStorage();
  const saver = createSaver(storage);
  saver.save({ ...freshState(0), reviewClock: 1 });
  saver.save({ ...freshState(0), reviewClock: 2 });
  saver.save({ ...freshState(0), reviewClock: 3 });
  assertEqual(storage.getItem(STORAGE_KEY), null, 'nothing written yet');
  saver.flush();
  assertEqual(JSON.parse(storage.getItem(STORAGE_KEY)).reviewClock, 3, 'only the last one lands');
});

test('the real storage key is readable and restored', () => {
  withStorage(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...freshState(0), reviewClock: 42 }));
    assertEqual(load(0).reviewClock, 42);
  });
});

test('touchDay records a day once and keeps the list bounded', () => {
  let state = freshState(0);
  state = touchDay(state, Date.UTC(2026, 7, 22));
  state = touchDay(state, Date.UTC(2026, 7, 22, 23));
  assertEqual(state.stats.daysPlayed.length, 1, 'the same day is not counted twice');
  state = touchDay(state, Date.UTC(2026, 7, 23));
  assertEqual(state.stats.daysPlayed.length, 2);
  assertEqual(state.stats.daysPlayed[1], '2026-08-23');
});

/* ---------------------------------------------------------------- pets */

describe('pets');

test('a time always maps to the same creature and the same name', () => {
  assertEqual(speciesFor(4, 15), speciesFor(4, 15));
  assertEqual(defaultName(4, 15), defaultName(4, 15));
  assert(SPECIES[speciesFor(4, 15)], 'and it is a species that exists');
});

test('every one of the 144 times has a real species', () => {
  for (const { h, m } of ALL_ITEMS) {
    assert(SPECIES[speciesFor(h, m)], `no species for ${timeId(h, m)}`);
  }
});

test('a renamed pet keeps its new name', () => {
  const item = { ...seed(), name: null };
  assertEqual(petName(item), defaultName(4, 15));
  assertEqual(petName({ ...item, name: 'Waffle' }), 'Waffle');
});

test('mood follows the schedule — hungry when due, happy when not', () => {
  const pet = { ...graduated(), hatchedAt: 1 };
  assertEqual(moodOf({ ...pet, dueAt: 100 }, 50), 'happy');
  assertEqual(moodOf({ ...pet, dueAt: 100 }, 200), 'hungry');
  assertEqual(moodOf({ ...pet, phase: 'learning', lapses: 1 }, 200), 'droopy');
  assertEqual(moodOf({ ...pet, dueAt: 100 }, 200, { napping: true }), 'sleep', 'everyone sleeps');
  assertEqual(moodOf({ ...seed(), hatchedAt: null }, 0), 'content', 'an egg has no mood');
});

/* -------------------------------------------------------- run and report */

const out = document.getElementById('out');
const summary = document.getElementById('summary');
let passed = 0;
let failed = 0;

for (const g of groups) {
  const heading = document.createElement('h2');
  heading.textContent = g.name;
  out.appendChild(heading);
  for (const t of g.tests) {
    const row = document.createElement('div');
    try {
      t.fn();
      row.className = 'pass';
      row.textContent = `✓ ${t.name}`;
      passed += 1;
    } catch (error) {
      row.className = 'fail';
      row.textContent = `✗ ${t.name} — ${error.message}`;
      failed += 1;
    }
    out.appendChild(row);
  }
}

summary.textContent = failed
  ? `${failed} failing, ${passed} passing`
  : `All ${passed} tests passing`;
summary.className = failed ? 'fail' : 'pass';
