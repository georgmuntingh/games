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
  FORM_COUNT,
  FORM_THRESHOLDS,
  formFor,
  RELEARN_DELAY,
  review,
} from '../srs.js';
import {
  beginNap,
  capReached,
  dayProgress,
  DEFAULT_LIMITS,
  formatCountdown,
  isNapping,
  isRunning,
  isStale,
  limitsFor,
  napRemaining,
  NAP_MS,
  PLAY_MINUTES_DEFAULT,
  PLAY_MINUTES_MAX,
  PLAY_MINUTES_MIN,
  QUESTIONS_PER_MINUTE,
  shouldEnd,
  SOFT_STOP_RATIO,
  startSession,
  STALE_SESSION_MS,
} from '../session.js';
import {
  clear,
  createSaver,
  freshState,
  load,
  migrateItems,
  STORAGE_KEY,
  touchDay,
  VERSION,
  write,
} from '../store.js';
import {
  anatomyFor,
  appearanceFor,
  appearanceOf,
  defaultName,
  isCrowned,
  LOUD_FAMILIES,
  MARKING_IDS,
  moodOf,
  petName,
  petSvg,
  speciesAppearance,
  speciesFor,
  SPECIES,
  timesOfSpecies,
  TRAIT_STRIDE,
  validLoudFor,
} from '../pets.js';
import {
  ACCESSORIES,
  ANATOMY,
  BODIES,
  BROWS,
  EYES,
  EYEWEAR,
  FACIAL,
  HAIR,
  HAIR_CROWN,
  MARKINGS,
  SIGNATURES,
  stageOf,
  TEXTURES,
  TOPPER_CROWN,
  TOPPERS,
} from '../pet-parts.js';
import {
  DEFAULT_LANGUAGE,
  hourWord,
  isLanguage,
  LANGUAGES,
  languageKeys,
  NAMES,
  spokenTime,
  translator,
} from '../i18n.js';

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

describe('clock — ids');

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

const FIVE = limitsFor(5);

test('the default play time is still the three-and-five the game was tuned at', () => {
  assertEqual(DEFAULT_LIMITS.minutes, PLAY_MINUTES_DEFAULT);
  assertEqual(DEFAULT_LIMITS.hardMs, 5 * 60 * 1000);
  assertEqual(DEFAULT_LIMITS.softMs, 3 * 60 * 1000, 'the soft stop lands on three minutes');
});

test('a fresh session runs on and ends nothing', () => {
  const s = startSession(0);
  assertEqual(shouldEnd({ ...s, answered: 3 }, { now: 30000, correct: true, limits: FIVE }), null);
});

test('past the soft stop the session ends on the next correct answer — a win, not a cut-off', () => {
  const s = { ...startSession(0), answered: 8 };
  assertEqual(shouldEnd(s, { now: FIVE.softMs + 1000, correct: true, limits: FIVE }), 'soft');
  assertEqual(
    shouldEnd(s, { now: FIVE.softMs + 1000, correct: false, limits: FIVE }),
    null,
    'a child who is struggling keeps trying'
  );
});

test('the hard cap ends it however it is going', () => {
  const s = { ...startSession(0), answered: 8 };
  assertEqual(shouldEnd(s, { now: FIVE.hardMs, correct: false, limits: FIVE }), 'hard');
  assert(capReached(s, FIVE.hardMs, FIVE));
  assert(!capReached(s, FIVE.hardMs - 1, FIVE));
});

test('the question cap catches a fast session before the clock does', () => {
  const s = { ...startSession(0), answered: FIVE.maxQuestions };
  assertEqual(shouldEnd(s, { now: 10000, correct: true, limits: FIVE }), 'count');
});

test('the sky darkens from nothing to full over the hard cap', () => {
  const s = startSession(0);
  assertEqual(dayProgress(s, 0, FIVE), 0);
  assertClose(dayProgress(s, FIVE.hardMs / 2, FIVE), 0.5);
  assertEqual(dayProgress(s, FIVE.hardMs * 3, FIVE), 1, 'and never past full');
});

test('every session call falls back to the default limits when given none', () => {
  const s = { ...startSession(0), answered: 0 };
  assertEqual(shouldEnd(s, { now: DEFAULT_LIMITS.hardMs, correct: false }), 'hard');
  assert(capReached(s, DEFAULT_LIMITS.hardMs));
  assertEqual(dayProgress(s, DEFAULT_LIMITS.hardMs), 1);
});

describe('session — the adjustable play time');

test('the play time sets all three limits together', () => {
  const ten = limitsFor(10);
  assertEqual(ten.minutes, 10);
  assertEqual(ten.hardMs, 10 * 60 * 1000);
  assertEqual(ten.softMs, Math.round(ten.hardMs * SOFT_STOP_RATIO));
  assertEqual(ten.maxQuestions, 10 * QUESTIONS_PER_MINUTE);
});

test('the soft stop keeps its share, so a long session is not ended by its first win', () => {
  for (const minutes of [2, 3, 5, 10, 15]) {
    const l = limitsFor(minutes);
    assertClose(l.softMs / l.hardMs, SOFT_STOP_RATIO, 1e-6, `${minutes} minutes`);
    assert(l.softMs < l.hardMs, 'and always lands before the hard cap');
  }
});

test('a longer play time really does allow a longer session', () => {
  const s = { ...startSession(0), answered: 5 };
  const at4min = { now: 4 * 60 * 1000, correct: false };
  assertEqual(shouldEnd(s, { ...at4min, limits: limitsFor(3) }), 'hard', 'three minutes is up');
  assertEqual(shouldEnd(s, { ...at4min, limits: limitsFor(10) }), null, 'ten minutes is not');
});

test('an out-of-range or nonsense play time is pulled back into the allowed span', () => {
  assertEqual(limitsFor(0).minutes, PLAY_MINUTES_MIN, 'zero would be no session at all');
  assertEqual(limitsFor(-5).minutes, PLAY_MINUTES_MIN);
  assertEqual(limitsFor(999).minutes, PLAY_MINUTES_MAX, 'the cap can be loosened, never removed');
  assertEqual(limitsFor(NaN).minutes, PLAY_MINUTES_DEFAULT);
  assertEqual(limitsFor(undefined).minutes, PLAY_MINUTES_DEFAULT);
  assertEqual(limitsFor('7').minutes, 7, 'a slider hands over a string');
  assertEqual(limitsFor(4.4).minutes, 4, 'and fractions round');
});

test('there is no play time that produces a session without an end', () => {
  for (const value of [0, 1, 2, 15, 99, -1, NaN, null, 'nonsense']) {
    const l = limitsFor(value);
    assert(l.hardMs > 0 && Number.isFinite(l.hardMs), `hard cap for ${value}`);
    assert(l.maxQuestions > 0, `question cap for ${value}`);
    assert(
      l.minutes >= PLAY_MINUTES_MIN && l.minutes <= PLAY_MINUTES_MAX,
      `${value} landed outside the allowed span`
    );
  }
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
  assert(!isStale(s, DEFAULT_LIMITS.softMs), 'a live session is not stale');
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
  assertEqual(defaultName(4, 15, 'nb'), defaultName(4, 15, 'nb'));
  assert(SPECIES[speciesFor(4, 15)], 'and it is a species that exists');
});

test('a pet is named in the language the child is playing in', () => {
  const nb = defaultName(4, 15, 'nb');
  const en = defaultName(4, 15, 'en');
  assert(NAMES.nb.includes(nb), 'the Norwegian name comes from the Norwegian pool');
  assert(NAMES.en.includes(en), 'and the English one from the English pool');
  assertEqual(defaultName(4, 15), nb, 'Norwegian is the default');
});

test('an unknown language still yields a name rather than nothing', () => {
  assert(NAMES.nb.includes(defaultName(4, 15, 'zz')));
});

test('every one of the 144 times has a real species', () => {
  for (const { h, m } of ALL_ITEMS) {
    assert(SPECIES[speciesFor(h, m)], `no species for ${timeId(h, m)}`);
  }
});

test('no two pets of the same species share a name', () => {
  // Different species may reuse a name — they look nothing alike. Two identically-named
  // pets of the *same* species, sitting next to each other in the zoo, is the confusing
  // case, and the name pool is walked from a per-species offset to prevent it.
  for (const lang of ['nb', 'en']) {
    for (const id of Object.keys(SPECIES)) {
      const names = timesOfSpecies(id).map((time) => {
        const { h, m } = parseTimeId(time);
        return defaultName(h, m, lang);
      });
      assertEqual(new Set(names).size, names.length, `${id} repeats a name in ${lang}`);
    }
  }
});

test('the name pool is large enough for the biggest species', () => {
  const biggest = Math.max(...Object.keys(SPECIES).map((id) => timesOfSpecies(id).length));
  for (const lang of ['nb', 'en']) {
    assert(NAMES[lang].length > biggest, `${lang} has too few names for ${biggest} pets`);
  }
});

test('a renamed pet keeps its own name in every language', () => {
  const item = { ...seed(), name: null };
  assertEqual(petName(item, 'nb'), defaultName(4, 15, 'nb'));
  assertEqual(petName(item, 'en'), defaultName(4, 15, 'en'), 'an unnamed pet follows the language');
  const named = { ...item, name: 'Waffle' };
  assertEqual(petName(named, 'nb'), 'Waffle');
  assertEqual(petName(named, 'en'), 'Waffle', 'a name the child chose is never overwritten');
});

test('mood follows the schedule — hungry when due, happy when not', () => {
  const pet = { ...graduated(), hatchedAt: 1 };
  assertEqual(moodOf({ ...pet, dueAt: 100 }, 50), 'happy');
  assertEqual(moodOf({ ...pet, dueAt: 100 }, 200), 'hungry');
  assertEqual(moodOf({ ...pet, phase: 'learning', lapses: 1 }, 200), 'droopy');
  assertEqual(moodOf({ ...pet, dueAt: 100 }, 200, { napping: true }), 'sleep', 'everyone sleeps');
  assertEqual(moodOf({ ...seed(), hatchedAt: null }, 0), 'content', 'an egg has no mood');
});

/* ---------------------------------------------------------------- i18n */

describe('i18n — the string tables');

test('Norwegian is the default language', () => {
  assertEqual(DEFAULT_LANGUAGE, 'nb');
  assertEqual(translator(undefined).lang, 'nb');
});

test('both languages are offered, each naming itself in its own words', () => {
  assertEqual(LANGUAGES.length, 2);
  assertEqual(LANGUAGES.find((l) => l.id === 'nb').label, 'Norsk');
  assertEqual(LANGUAGES.find((l) => l.id === 'en').label, 'English');
  assert(isLanguage('nb') && isLanguage('en'));
  assert(!isLanguage('de') && !isLanguage(''), 'and nothing else is accepted');
});

test('neither language is missing a string the other has', () => {
  const nb = new Set(languageKeys('nb'));
  const en = new Set(languageKeys('en'));
  const missingFromEn = [...nb].filter((k) => !en.has(k));
  const missingFromNb = [...en].filter((k) => !nb.has(k));
  assertEqual(missingFromEn.join(', '), '', 'keys absent from English');
  assertEqual(missingFromNb.join(', '), '', 'keys absent from Norwegian');
  assert(nb.size > 40, 'and the tables are actually populated');
});

test('no string is left untranslated — every Norwegian value differs from the English', () => {
  const t = { nb: translator('nb'), en: translator('en') };
  // Bar the handful that are the same word in both, or carry only placeholders.
  const shared = new Set(['unlock.copy']);
  const identical = languageKeys('nb').filter(
    (key) => !shared.has(key) && t.nb(key) === t.en(key)
  );
  assertEqual(identical.join(', '), '', 'these were never translated');
});

test('placeholders are filled, and an unknown one is left alone rather than blanked', () => {
  const t = translator('en');
  assertEqual(t('button.feed', { name: 'Waffle' }), 'Feed Waffle!');
  assertEqual(t('button.feed'), 'Feed {name}!', 'nothing to fill leaves the template visible');
});

test('an unknown key falls back rather than rendering as a raw key', () => {
  assertEqual(translator('en')('no.such.key'), 'no.such.key', 'and is at worst inert');
});

test('an unknown language falls back to the default without throwing', () => {
  const t = translator('de');
  assertEqual(t.lang, DEFAULT_LANGUAGE);
  assertEqual(t('nap.title'), translator('nb')('nap.title'));
});

test('every tier has a name and a blurb in both languages', () => {
  for (const lang of ['nb', 'en']) {
    const t = translator(lang);
    for (const tier of TIERS) {
      assert(t(`tier.${tier.id}.name`) !== `tier.${tier.id}.name`, `${lang} tier ${tier.id} name`);
      assert(t(`tier.${tier.id}.blurb`) !== `tier.${tier.id}.blurb`, `${lang} tier ${tier.id} blurb`);
    }
  }
});

describe('i18n — telling the time in English');

test('English says the hour, then counts past and to it', () => {
  assertEqual(spokenTime('en', 4, 0), "four o'clock");
  assertEqual(spokenTime('en', 4, 15), 'quarter past four');
  assertEqual(spokenTime('en', 4, 30), 'half past four');
  assertEqual(spokenTime('en', 4, 45), 'quarter to five', 'past the half hour counts to the next');
  assertEqual(spokenTime('en', 12, 55), 'five to one', 'twelve rolls over to one');
});

describe('i18n — telling the time in Norwegian');

// Norwegian counts the half hour forwards: "halv fem" is 4:30, not 5:30. A child taught
// the English shape here would name the wrong hour for a third of the dial, so these are
// spelled out one by one rather than generated.
test('the whole Norwegian hour reads correctly, minute by minute', () => {
  const expected = {
    0: 'klokka fire',
    5: 'fem over fire',
    10: 'ti over fire',
    15: 'kvart over fire',
    20: 'ti på halv fem',
    25: 'fem på halv fem',
    30: 'halv fem',
    35: 'fem over halv fem',
    40: 'ti over halv fem',
    45: 'kvart på fem',
    50: 'ti på fem',
    55: 'fem på fem',
  };
  for (const [m, phrase] of Object.entries(expected)) {
    assertEqual(spokenTime('nb', 4, Number(m)), phrase, `4:${m}`);
  }
});

test('"halv" names the hour it is heading for, not the one it has left', () => {
  assertEqual(spokenTime('nb', 4, 30), 'halv fem', 'half past four is halv fem');
  assertEqual(spokenTime('nb', 5, 30), 'halv seks');
  assertEqual(spokenTime('nb', 12, 30), 'halv ett', 'and twelve heads for one, not thirteen');
});

test('the hours either side of twelve wrap the Norwegian way too', () => {
  assertEqual(spokenTime('nb', 11, 45), 'kvart på tolv');
  assertEqual(spokenTime('nb', 12, 45), 'kvart på ett');
  assertEqual(spokenTime('nb', 12, 20), 'ti på halv ett');
  assertEqual(spokenTime('nb', 12, 0), 'klokka tolv');
});

test('every one of the 144 times can be said aloud in both languages', () => {
  for (const lang of ['nb', 'en']) {
    for (const { h, m } of ALL_ITEMS) {
      const said = spokenTime(lang, h, m);
      assert(said && !said.includes('undefined') && !said.includes('{'), `${lang} ${timeId(h, m)}: ${said}`);
    }
  }
});

test('the hour is spelled out in both languages, and never as a zero', () => {
  assertEqual(hourWord('en', 4), 'four');
  assertEqual(hourWord('nb', 4), 'fire');
  assertEqual(hourWord('nb', 1), 'ett', 'one o\'clock is "ett", not "en"');
  assertEqual(hourWord('nb', 12), 'tolv');
  assertEqual(hourWord('nb', 13), 'ett', 'thirteen wraps round the dial');
  assertEqual(hourWord('nb', 0), 'tolv', 'and zero is twelve, never blank');
});

describe('i18n — settings storage');

test('a save from before these settings existed gets the defaults', () => {
  const storage = fakeStorage();
  const old = freshState(0);
  delete old.settings.language;
  delete old.settings.playMinutes;
  storage.setItem(STORAGE_KEY, JSON.stringify(old));
  const back = load(0, storage);
  assertEqual(back.settings.language, DEFAULT_LANGUAGE);
  assertEqual(back.settings.playMinutes, PLAY_MINUTES_DEFAULT);
});

test('a chosen language and play time survive a reload', () => {
  const storage = fakeStorage();
  const state = freshState(0);
  state.settings.language = 'en';
  state.settings.playMinutes = 8;
  write(state, storage);
  const back = load(0, storage);
  assertEqual(back.settings.language, 'en');
  assertEqual(back.settings.playMinutes, 8);
  assertEqual(limitsFor(back.settings.playMinutes).hardMs, 8 * 60 * 1000);
});

test('a hand-edited play time cannot remove the break', () => {
  const storage = fakeStorage();
  const state = freshState(0);
  state.settings.playMinutes = 99999;
  write(state, storage);
  assertEqual(limitsFor(load(0, storage).settings.playMinutes).minutes, PLAY_MINUTES_MAX);
});

/* --------------------------------------------------------- appearance */

const MOODS = ['content', 'happy', 'hungry', 'droopy', 'sleep'];
const LOUD_KEYS = LOUD_FAMILIES.map(([key]) => key);
const appearanceKey = (a) =>
  [a.species, a.eyewear, a.hair, a.facialHair, a.markings, a.accessory].join('|');
const loudKey = (a) => LOUD_KEYS.map((k) => a[k]).join('|');
const loudCount = (a) => LOUD_KEYS.filter((k) => a[k] !== 'none').length;

describe('pets — the species look different from each other');

test('no two species can be told apart by colour alone', () => {
  // The bug this guards: sixteen palettes sharing one face. Every pair must differ in at
  // least two of the drawn features, so colour is never the only distinguisher.
  const ids = Object.keys(SPECIES);
  const shape = ['body', 'texture', 'topper', 'eyes', 'brows'];
  for (let i = 0; i < ids.length; i += 1) {
    for (let j = i + 1; j < ids.length; j += 1) {
      const differences = shape.filter((k) => SPECIES[ids[i]][k] !== SPECIES[ids[j]][k]);
      assert(
        differences.length >= 2,
        `${ids[i]} and ${ids[j]} differ only in ${differences.join(', ') || 'colour'}`
      );
    }
  }
});

test('every species names parts that actually exist', () => {
  for (const [id, spec] of Object.entries(SPECIES)) {
    assert(BODIES[spec.body], `${id} body ${spec.body}`);
    assert(TEXTURES[spec.texture], `${id} texture ${spec.texture}`);
    assert(TOPPERS[spec.topper], `${id} topper ${spec.topper}`);
    assert(EYES[spec.eyes], `${id} eyes ${spec.eyes}`);
    assert(BROWS[spec.brows], `${id} brows ${spec.brows}`);
  }
});

describe('pets — every one of the 144 is distinct');

test('all 144 times produce 144 different-looking pets', () => {
  const seen = new Map();
  for (const { h, m } of ALL_ITEMS) {
    const key = appearanceKey(appearanceFor(h, m));
    const clash = seen.get(key);
    assert(!clash, `${timeId(h, m)} looks identical to ${clash}`);
    seen.set(key, timeId(h, m));
  }
  assertEqual(seen.size, 144);
});

test('within a species, no two pets share a loud pattern', () => {
  // The strong form of the guarantee: two pets never differ by a freckle alone — the
  // difference is always one of the big, legible features.
  for (const id of Object.keys(SPECIES)) {
    const patterns = timesOfSpecies(id).map((time) => {
      const { h, m } = parseTimeId(time);
      return loudKey(appearanceFor(h, m));
    });
    assertEqual(new Set(patterns).size, patterns.length, `${id} repeats a loud pattern`);
  }
});

test('the stride is coprime with both valid-list lengths, or the bijection collapses', () => {
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  assertEqual(gcd(TRAIT_STRIDE, validLoudFor('mochi').length), 1, 'free species');
  assertEqual(gcd(TRAIT_STRIDE, validLoudFor('glim').length), 1, 'crowned species');
});

test('every species has far more valid combinations than it has pets', () => {
  for (const id of Object.keys(SPECIES)) {
    const pets = timesOfSpecies(id).length;
    assert(
      validLoudFor(id).length > pets,
      `${id} has ${pets} pets but only ${validLoudFor(id).length} combinations`
    );
  }
});

test('the species map covers all 144 times and loses none', () => {
  const total = Object.keys(SPECIES).reduce((n, id) => n + timesOfSpecies(id).length, 0);
  assertEqual(total, 144);
});

describe('pets — the combinations stay wearable');

test('no pet carries more than two loud traits', () => {
  for (const { h, m } of ALL_ITEMS) {
    const a = appearanceFor(h, m);
    assert(loudCount(a) <= 2, `${timeId(h, m)} wears ${loudCount(a)} loud traits`);
  }
});

test('no pet grows a topknot on a crown that is already occupied', () => {
  for (const { h, m } of ALL_ITEMS) {
    const a = appearanceFor(h, m);
    assert(
      !(TOPPER_CROWN.has(a.topper) && HAIR_CROWN.has(a.hair)),
      `${timeId(h, m)}: ${a.topper} and ${a.hair} both want the crown`
    );
  }
});

test('a crowned species is offered only the hair that clears its crown', () => {
  assert(isCrowned('glim'), 'glim has a horn');
  assert(!isCrowned('mochi'), 'mochi has ears');
  for (const combo of validLoudFor('glim')) {
    assert(!HAIR_CROWN.has(combo.hair), `crowned list offers ${combo.hair}`);
  }
});

test('every trait the generator emits exists in the parts library', () => {
  // Catches a typo silently rendering a blank pet, which no visual check would flag
  // reliably across 144 of them.
  for (const { h, m } of ALL_ITEMS) {
    const a = appearanceFor(h, m);
    assert(EYEWEAR[a.eyewear], `${timeId(h, m)} eyewear ${a.eyewear}`);
    assert(HAIR[a.hair], `${timeId(h, m)} hair ${a.hair}`);
    assert(FACIAL[a.facialHair], `${timeId(h, m)} facialHair ${a.facialHair}`);
    assert(MARKINGS[a.markings], `${timeId(h, m)} markings ${a.markings}`);
    assert(ACCESSORIES[a.accessory], `${timeId(h, m)} accessory ${a.accessory}`);
  }
});

test('all six markings get used across the zoo', () => {
  const used = new Set(ALL_ITEMS.map(({ h, m }) => appearanceFor(h, m).markings));
  assertEqual(used.size, MARKING_IDS.length, 'some marking is never drawn');
});

describe('pets — appearance is stable and renders');

test('appearanceFor is deterministic and does not mutate anything', () => {
  const first = appearanceFor(4, 15);
  const second = appearanceFor(4, 15);
  assertEqual(appearanceKey(first), appearanceKey(second));
  first.eyewear = 'tampered';
  assertEqual(appearanceFor(4, 15).eyewear, second.eyewear, 'the returned object is a copy');
});

test('a species drawn plain wears none of the individual traits', () => {
  const plain = speciesAppearance('mochi');
  assertEqual(loudCount(plain), 0);
  assertEqual(plain.markings, 'none');
});

test('every species renders in every mood, with nothing left unfilled', () => {
  for (const id of Object.keys(SPECIES)) {
    for (const mood of MOODS) {
      const svg = petSvg(id, { mood });
      assert(svg.length > 400, `${id}/${mood} rendered almost nothing`);
      assert(!svg.includes('undefined'), `${id}/${mood} contains undefined`);
      assert(!svg.includes('NaN'), `${id}/${mood} contains NaN`);
      assert(!/\$\{/.test(svg), `${id}/${mood} has an unfilled template hole`);
    }
  }
});

test('every one of the 144 pets renders in every mood', () => {
  for (const { h, m } of ALL_ITEMS) {
    const appearance = appearanceFor(h, m);
    for (const mood of MOODS) {
      const svg = petSvg(appearance, { mood });
      assert(!svg.includes('undefined') && !svg.includes('NaN'), `${timeId(h, m)}/${mood}`);
    }
  }
});

test('an unknown species or trait falls back rather than rendering blank', () => {
  const svg = petSvg({ ...speciesAppearance('mochi'), eyes: 'nope', eyewear: 'nope', hair: 'nope' });
  assert(svg.length > 400 && !svg.includes('undefined'));
  assertEqual(speciesAppearance('nope').species, 'mochi');
});

test('the blink hook survives on every eye style', () => {
  // style.css animates `.pet-eye`; an eye style that dropped the class would stop blinking.
  for (const id of Object.keys(SPECIES)) {
    assert(petSvg(id, { mood: 'content' }).includes('class="pet-eye"'), `${id} lost its blink hook`);
  }
});

/* ----------------------------------------------------------- evolution */

describe('evolution — earning a form');

test('a form is earned by feeding, and an egg has no form at all', () => {
  assertEqual(formFor(0), 0, 'nothing fed yet');
  assertEqual(formFor(FORM_THRESHOLDS[0]), 1);
  assertEqual(formFor(FORM_THRESHOLDS[1]), 2);
  assertEqual(formFor(FORM_THRESHOLDS[2]), 3);
  assertEqual(formFor(999), FORM_COUNT, 'and it stops at the final form');
});

test('form never decreases as feeds accumulate', () => {
  let previous = 0;
  for (let feeds = 0; feeds <= 40; feeds += 1) {
    const form = formFor(feeds);
    assert(form >= previous, `form fell at ${feeds} feeds`);
    previous = form;
  }
});

test('hatching is not reported as an evolution', () => {
  let item = seed();
  for (let i = 1; i <= GRADUATION_STREAK; i += 1) {
    const r = review(item, { correct: true, ms: 3000, reviewClock: i, now: 0 });
    item = r.item;
    if (r.events.hatched) assertEqual(r.events.evolved, 0, 'the hatch is its own beat');
  }
  assertEqual(formFor(item.feeds), 1, 'a freshly hatched pet is a baby');
});

test('the evolution event fires exactly once per form, at the right feed', () => {
  let item = seed();
  let clock = 0;
  const fired = [];
  for (let i = 0; i < 12; i += 1) {
    clock += 1;
    const r = review(item, { correct: true, ms: 3000, reviewClock: clock, now: 0 });
    item = r.item;
    if (r.events.evolved) fired.push([item.feeds, r.events.evolved]);
  }
  assertEqual(JSON.stringify(fired), JSON.stringify([[FORM_THRESHOLDS[1], 2], [FORM_THRESHOLDS[2], 3]]));
});

describe('evolution — a form is never taken away');

test('a lapse resets reps but never costs a form', () => {
  // The trap this guards: `reps` is reset to 0 by a lapse, so a form derived from it
  // would de-evolve a pet the moment a child forgot a time — turning a design decision
  // that was explicitly ruled out into a bug.
  let item = seed();
  let clock = 0;
  while (formFor(item.feeds) < FORM_COUNT) {
    clock += 1;
    item = review(item, { correct: true, ms: 3000, reviewClock: clock, now: 0 }).item;
  }
  assertEqual(formFor(item.feeds), FORM_COUNT);

  const lapsed = review(item, { correct: false, ms: 9000, reviewClock: ++clock, now: 0 });
  assertEqual(lapsed.item.reps, 0, 'reps really is reset');
  assertEqual(formFor(lapsed.item.feeds), FORM_COUNT, 'and the form survives it');
  assertEqual(lapsed.item.feeds, item.feeds, 'feeds never goes backwards');
});

test('the pet a lapsed child sees is still the grown-up one', () => {
  // The data-level test above is not enough on its own: the form could still be read off
  // the wrong field at render time. This asserts the guarantee where the child meets it.
  let item = seed();
  let clock = 0;
  while (formFor(item.feeds) < FORM_COUNT) {
    clock += 1;
    item = review(item, { correct: true, ms: 3000, reviewClock: clock, now: 0 }).item;
  }
  const before = appearanceOf(item);
  const lapsed = review(item, { correct: false, ms: 9000, reviewClock: ++clock, now: 0 }).item;
  const after = appearanceOf(lapsed);
  assertEqual(after.form, FORM_COUNT, 'the drawn form dropped after a lapse');
  assertEqual(after.signature, before.signature, 'it lost its grown-up crown');
  assertEqual(after.anatomy.join(), before.anatomy.join(), 'it lost anatomy it had grown');
});

test('feeds only ever rises, across a long mixed run of right and wrong answers', () => {
  let item = seed();
  let clock = 0;
  let previous = 0;
  for (let i = 0; i < 60; i += 1) {
    clock += 1;
    const correct = i % 3 !== 2; // a miss every third answer
    item = review(item, { correct, ms: 4000, reviewClock: clock, now: i * DAY_MS }).item;
    assert(item.feeds >= previous, `feeds fell at step ${i}`);
    previous = item.feeds;
  }
});

describe('evolution — how a form is drawn');

test('pets get bigger and their faces get proportionally smaller', () => {
  for (let form = 2; form <= FORM_COUNT; form += 1) {
    assert(stageOf(form).scale > stageOf(form - 1).scale, `form ${form} is not bigger`);
    assert(stageOf(form).face < stageOf(form - 1).face, `form ${form}'s face is not smaller`);
    assert(stageOf(form).faceY < stageOf(form - 1).faceY, `form ${form}'s face does not ride higher`);
  }
});

test('anatomy accumulates and is never lost on the way up', () => {
  for (const id of Object.keys(SPECIES)) {
    const [one, two, three] = [1, 2, 3].map((f) => anatomyFor(id, f));
    assertEqual(one.length, 0, `${id} baby has grown nothing yet`);
    assertEqual(two.length, 1);
    assertEqual(three.length, 2);
    assertEqual(three.slice(0, 1).join(), two.join(), `${id} lost a part when it grew`);
  }
});

test('every species grows along its own line and ends on its own signature', () => {
  const signatures = new Set();
  for (const [id, spec] of Object.entries(SPECIES)) {
    assertEqual(spec.grows.length, 2, `${id} declares the wrong number of stages`);
    assert(spec.grows[0] !== spec.grows[1], `${id} grows the same part twice`);
    assert(SIGNATURES[spec.signature], `${id} signature ${spec.signature} does not exist`);
    signatures.add(spec.signature);
  }
  assertEqual(signatures.size, Object.keys(SPECIES).length, 'two species share a signature');
});

test('no anatomy part is shared by more than three species at the same form', () => {
  // Sixteen species all sprouting one crest is the "everything evolves the same way"
  // failure, one level up from the shared faces.
  for (const slot of [0, 1]) {
    const counts = {};
    for (const spec of Object.values(SPECIES)) {
      counts[spec.grows[slot]] = (counts[spec.grows[slot]] ?? 0) + 1;
    }
    for (const [part, n] of Object.entries(counts)) {
      assert(n <= 3, `${n} species share ${part} at stage ${slot + 2}`);
    }
  }
});

test('every anatomy id a species names exists in the parts library', () => {
  for (const [id, spec] of Object.entries(SPECIES)) {
    for (const part of spec.grows) assert(ANATOMY[part], `${id} names missing anatomy ${part}`);
  }
});

test('the final form replaces the topper; earlier forms keep it', () => {
  assertEqual(speciesAppearance('glim', 1).signature, null);
  assertEqual(speciesAppearance('glim', 2).signature, null);
  assertEqual(speciesAppearance('glim', FORM_COUNT).signature, SPECIES.glim.signature);
});

test('individual traits carry up unchanged through every form', () => {
  // The child's pet has to stay recognisably theirs through the transformation.
  for (const { h, m } of ALL_ITEMS.slice(0, 40)) {
    const base = appearanceFor(h, m, 1);
    for (const form of [2, 3]) {
      const grown = appearanceFor(h, m, form);
      for (const key of LOUD_KEYS.concat('markings')) {
        assertEqual(grown[key], base[key], `${timeId(h, m)} lost its ${key} at form ${form}`);
      }
    }
  }
});

test('all 144 pets stay distinct at every form', () => {
  for (const form of [1, 2, 3]) {
    const seen = new Set();
    for (const { h, m } of ALL_ITEMS) seen.add(appearanceKey(appearanceFor(h, m, form)));
    assertEqual(seen.size, 144, `form ${form} has lookalikes`);
  }
});

test('every species renders in every form and every mood', () => {
  for (const id of Object.keys(SPECIES)) {
    for (const form of [1, 2, 3]) {
      for (const mood of MOODS) {
        const svg = petSvg(speciesAppearance(id, form), { mood });
        assert(svg.length > 400, `${id} form ${form} ${mood} rendered almost nothing`);
        assert(!svg.includes('undefined'), `${id} form ${form} ${mood}: undefined`);
        assert(!svg.includes('NaN'), `${id} form ${form} ${mood}: NaN`);
        assert(!/\$\{/.test(svg), `${id} form ${form} ${mood}: unfilled template`);
      }
    }
  }
});

test('an out-of-range form is clamped rather than rendering nothing', () => {
  assertEqual(speciesAppearance('mochi', 0).form, 1);
  assertEqual(speciesAppearance('mochi', 99).form, FORM_COUNT);
  assert(petSvg(speciesAppearance('mochi', 99)).length > 400);
});

test('appearanceOf reads the form straight off the item', () => {
  const at = (feeds) => appearanceOf({ ...seed(), feeds });
  assertEqual(at(0).form, 1, 'an unhatched item still draws as a baby');
  assertEqual(at(FORM_THRESHOLDS[1]).form, 2);
  assertEqual(at(FORM_THRESHOLDS[2]).form, 3);
});

describe('evolution — saves written before forms existed');

test('an old pet loads at the form it had already earned', () => {
  const migrated = migrateItems({
    '4:15': { h: 4, m: 15, reps: 4, hatchedAt: 123 },
    '1:00': { h: 1, m: 0, reps: 0, hatchedAt: null },
    '2:00': { h: 2, m: 0, reps: 0, hatchedAt: 99 },
  });
  assertEqual(formFor(migrated['4:15'].feeds), 2, 'a well-known time keeps its progress');
  assertEqual(formFor(migrated['1:00'].feeds), 0, 'an egg is still an egg');
  assertEqual(formFor(migrated['2:00'].feeds), 1, 'hatched but lapsed is a baby');
});

test('migration leaves an already-migrated item completely alone', () => {
  const item = { h: 4, m: 15, reps: 0, feeds: 5, hatchedAt: 1 };
  assertEqual(migrateItems({ '4:15': item })['4:15'], item, 'it was needlessly rewritten');
});

test('migration survives a missing or empty item map', () => {
  assertEqual(Object.keys(migrateItems(undefined)).length, 0);
  assertEqual(Object.keys(migrateItems({})).length, 0);
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
