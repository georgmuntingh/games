import {
  advanceMinuteTo,
  angleOf,
  angularDistance,
  grade,
  HOURS,
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
  crackFor,
  CRACK_STAGES,
  GRADUATION_STREAK,
  HATCH_STREAK,
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
  upgrade,
  VERSION,
  write,
} from '../store.js';
import * as clockSubject from '../subjects/clock.js';
import {
  interleave,
  refreshTiers,
  SUBJECT_IDS,
  subjectIdOf,
  tiersOf,
  totalItemCount,
  unseenItems as unseenAcrossSubjects,
} from '../subjects/index.js';
import {
  applyImport,
  cleanItems,
  CODE_PREFIX,
  encodeCode,
  exportFilename,
  exportPayload,
  parseTransfer,
  payloadToJson,
  petCount,
  TRANSFER_APP,
  TRANSFER_FORMAT,
  TransferError,
} from '../transfer.js';
import {
  anatomyFor,
  appearanceFor,
  appearanceOf,
  defaultName,
  EGG_CRACK_MAX,
  eggSvg,
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
  traitIndexFor,
  validLoudFor,
} from '../pets.js';
import {
  BALL_R,
  backdropSpotFor,
  BIOME_IDS,
  biomeOfSpecies,
  CENTRE_KEEP,
  furnitureFor,
  furnitureSpotsFor,
  habitatFor,
  habitatOf,
  habitatSvg,
  homeSpotFor,
  LAYOUTS,
  lightingFor,
  mix,
  NEST_KEEP,
  nextWanderTarget,
  paletteFor,
  sceneryY,
  stepBall,
} from '../habitat.js';
import {
  BACKDROP,
  BACKDROP_HALF_WIDTH,
  BACKDROP_IDS,
  BACKDROP_MAX_HEIGHT,
  BACKDROP_SCALE,
  FAR_REACH,
  FURNITURE,
  FURNITURE_HALF_WIDTH,
  FURNITURE_IDS,
  HORIZON,
  orbPoint,
  PET_SIZE,
  phaseOfHour,
  PHASE_IDS,
  ROAM,
  rndFrom,
  SAFE,
  SCENERY_IDS,
  TREAT_IDS,
  VIEW,
  WALK_Y,
  YARD_PIECES,
  YARD_PIECE_IDS,
} from '../habitat-parts.js';
import {
  buy,
  buyZoo,
  CATALOG,
  countIn,
  HOME_CATALOG,
  isFull,
  isOwned,
  isUnlocked,
  itemById as shopItemById,
  MAX_DECOR,
  MAX_ZOO_DECOR,
  sanitizeDecor,
  sanitizeZoo,
  sell,
  sellZoo,
  SLOT_CAPS,
  slotOf,
  ZOO_CATALOG,
  zooIsFull,
  zooOwns,
} from '../shop.js';
import { yardPalette, yardPiecesFor, YARD_SLOTS, yardSvg } from '../yard.js';
import {
  canAfford,
  DAY_COINS,
  DAY_STREAK_COINS,
  dayBonusFor,
  earn,
  EVOLVE_COINS,
  HATCH_COINS,
  normalize,
  payoutFor,
  coinsForMilestone,
  MASTERY_COINS,
  milestonesReached,
  retroGrant,
  SESSION_COINS,
  settleMilestones,
  SPECIES_COINS,
  spend,
  streakDays,
  TIER_COINS,
  WEEK_STREAK_COINS,
} from '../wallet.js';
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

test('four in a row graduates the time and hatches its egg', () => {
  let item = seed();
  let events;
  for (let i = 1; i < HATCH_STREAK; i += 1) {
    ({ item, events } = review(item, { correct: true, ms: 3000, reviewClock: i, now: 5000 }));
    assert(!events.hatched, `hatched early, on answer ${i}`);
    assertEqual(item.phase, 'learning', 'an egg stays in learning until it hatches');
  }
  ({ item, events } = review(item, {
    correct: true,
    ms: 3000,
    reviewClock: HATCH_STREAK,
    now: 5000,
  }));
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
    if (i > HATCH_STREAK) assert(!r.events.hatched, `hatched twice at review ${i}`);
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

describe('srs — the egg cracking open');

test('a crack is earned on every answer but the first, and the last lands before hatching', () => {
  assertEqual(crackFor(0), 0, 'a fresh egg is smooth');
  assertEqual(crackFor(1), 0, 'one answer in, still smooth — a crack has to mean something');
  assertEqual(crackFor(2), 1);
  assertEqual(crackFor(3), CRACK_STAGES, 'the last crack is the answer before hatching');
  assertEqual(crackFor(HATCH_STREAK), CRACK_STAGES, 'and it never goes past the last one');
  assertEqual(crackFor(99), CRACK_STAGES);
});

test('an egg breaks one stage at a time on its way to hatching', () => {
  let item = seed();
  const seen = [];
  for (let i = 1; i <= HATCH_STREAK; i += 1) {
    const r = review(item, { correct: true, ms: 3000, reviewClock: i, now: 5000 });
    item = r.item;
    seen.push(r.events.cracked);
  }
  assertEqual(seen.join(','), '0,1,2,0', 'smooth, one crack, two cracks, then the hatch');
  assertEqual(item.cracks, CRACK_STAGES);
});

test('a wrong answer restarts the run to hatching but never un-breaks the shell', () => {
  let item = seed();
  item = review(item, { correct: true, ms: 3000, reviewClock: 1, now: 0 }).item;
  item = review(item, { correct: true, ms: 3000, reviewClock: 2, now: 0 }).item;
  item = review(item, { correct: true, ms: 3000, reviewClock: 3, now: 0 }).item;
  assertEqual(item.cracks, 2, 'three right in a row is two cracks');

  item = review(item, { correct: false, ms: 9000, reviewClock: 4, now: 0 }).item;
  assertEqual(item.correctStreak, 0, 'the run to hatching starts again');
  assertEqual(item.cracks, 2, 'but a shell that has broken stays broken');
  assertEqual(item.hatchedAt, null, 'and it is still an egg');

  const r = review(item, { correct: true, ms: 3000, reviewClock: 5, now: 0 });
  assertEqual(r.events.cracked, 0, 'a crack already earned is not re-announced');
  assertEqual(r.item.cracks, 2);
});

test('the crack event fires only on the way up, and never after hatching', () => {
  let item = seed();
  for (let i = 1; i <= HATCH_STREAK; i += 1) {
    item = review(item, { correct: true, ms: 3000, reviewClock: i, now: 5000 }).item;
  }
  assert(item.hatchedAt !== null, 'it hatched');
  for (let i = 1; i <= 4; i += 1) {
    const r = review(item, { correct: true, ms: 3000, reviewClock: 10 + i, now: DAY_MS * i });
    item = r.item;
    assertEqual(r.events.cracked, 0, `a hatched pet cracked again at review ${i}`);
  }
});

test('a lapsed pet re-graduates at the usual bar, not the hatching one', () => {
  let item = graduated();
  item = review(item, { correct: false, ms: 9000, reviewClock: 20, now: DAY_MS }).item;
  assertEqual(item.phase, 'learning', 'a miss sends a graduated pet back to learning');
  assertEqual(item.lapses, 1);

  let events;
  for (let i = 1; i <= GRADUATION_STREAK; i += 1) {
    ({ item, events } = review(item, {
      correct: true,
      ms: 3000,
      reviewClock: 20 + i,
      now: DAY_MS,
    }));
  }
  assertEqual(item.phase, 'graduated', 'three is enough for a pet that already exists');
  assert(events.graduated, 'it graduated again');
  assert(!events.hatched, 'and it did not hatch a second time');
});

describe('srs — graduated reviews');

const graduated = () => {
  let item = seed();
  for (let i = 1; i <= HATCH_STREAK; i += 1) {
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
  assertEqual(s.tiers.clock, 0);
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
  const shared = new Set(['unlock.copy', 'coins.earned', 'shop.statue']);
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
  for (let i = 1; i <= HATCH_STREAK; i += 1) {
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

describe('the egg art');

test('the shell shows exactly as many cracks as it has earned', () => {
  const count = (markup) => (markup.match(/class="egg-crack /g) ?? []).length;
  assertEqual(count(eggSvg('mochi')), 0, 'a fresh egg is smooth');
  assertEqual(count(eggSvg('mochi', { cracks: 0 })), 0);
  assertEqual(count(eggSvg('mochi', { cracks: 1 })), 1);
  assertEqual(count(eggSvg('mochi', { cracks: 2 })), 2);
  assertEqual(count(eggSvg('mochi', { cracks: EGG_CRACK_MAX })), EGG_CRACK_MAX);
  assertEqual(count(eggSvg('mochi', { cracks: 99 })), EGG_CRACK_MAX, 'and never more than that');
  assertEqual(count(eggSvg('mochi', { cracks: -3 })), 0, 'nor fewer than none');
});

test('every crack level is reachable from a stored egg', () => {
  assert(CRACK_STAGES < EGG_CRACK_MAX, 'the last crack belongs to the hatch, not to the save');
  for (let cracks = 0; cracks <= CRACK_STAGES; cracks += 1) {
    assert(
      eggSvg('mochi', { cracks }).includes(`egg-cracks-${cracks}`),
      `level ${cracks} does not label itself`
    );
  }
});

test('cracks are drawn in a fixed order, so a second egg breaks the way the first did', () => {
  const two = eggSvg('mochi', { cracks: 2 });
  assert(two.includes('egg-crack-1') && two.includes('egg-crack-2'));
  assert(!two.includes('egg-crack-3'), 'the hatch-only fracture is not shown early');
  assert(eggSvg('fizz', { cracks: 1 }).includes('egg-crack-1'), 'the first crack is always first');
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
  const item = { subject: 'clock', h: 4, m: 15, reps: 0, feeds: 5, cracks: 2, decor: [], hatchedAt: 1 };
  assertEqual(migrateItems({ '4:15': item })['4:15'], item, 'it was needlessly rewritten');
});

test('an egg from a save written before the shell could break comes back part-broken', () => {
  const migrated = migrateItems({
    '4:15': { h: 4, m: 15, reps: 0, correctStreak: 3, hatchedAt: null },
    '1:00': { h: 1, m: 0, reps: 0, correctStreak: 1, hatchedAt: null },
    '2:00': { h: 2, m: 0, reps: 0, hatchedAt: null },
  });
  assertEqual(migrated['4:15'].cracks, CRACK_STAGES, 'an egg one answer away looks it');
  assertEqual(migrated['1:00'].cracks, 0, 'one answer in is still a smooth shell');
  assertEqual(migrated['2:00'].cracks, 0, 'and a streak that was never written is none');
});

test('migration backfills a missing crack count without touching one that is already there', () => {
  const migrated = migrateItems({
    '4:15': { h: 4, m: 15, feeds: 2, cracks: 1, correctStreak: 3, hatchedAt: null },
  });
  assertEqual(migrated['4:15'].cracks, 1, 'the stored count wins over the derived one');
});

test('migration survives a missing or empty item map', () => {
  assertEqual(Object.keys(migrateItems(undefined)).length, 0);
  assertEqual(Object.keys(migrateItems({})).length, 0);
});

describe('transfer — what crosses between devices');

/** A save with a little of everything in it: a hatched pet, a stat line, a tier. */
function playedState(now = 1000) {
  const state = freshState(now);
  state.items['4:15'] = {
    ...createItem({ h: 4, m: 15, species: 'fizz', reviewClock: 0 }),
    phase: 'graduated',
    feeds: 4,
    reps: 3,
    hatchedAt: now,
    name: 'Blåbær',
  };
  state.items['9:30'] = {
    ...createItem({ h: 9, m: 30, species: 'fizz', reviewClock: 0 }),
    correctStreak: 3,
    cracks: 2,
  };
  state.reviewClock = 12;
  state.tiers = { ...state.tiers, clock: 2 };
  state.stats = { totalAnswered: 40, totalCorrect: 31, streak: 2, bestStreak: 9, daysPlayed: ['2026-08-20'] };
  return state;
}

/** What a second device looks like: empty, and set up the way its grown-up likes it. */
function receivingState(now = 5000) {
  const state = freshState(now);
  state.settings = { ...state.settings, language: 'en', playMinutes: 12, showDigital: true };
  return state;
}

test('an exported payload carries the pets, the schedule clock, the tier and the stats', () => {
  const payload = exportPayload(playedState(), 2000);
  assertEqual(payload.app, TRANSFER_APP);
  assertEqual(payload.format, TRANSFER_FORMAT);
  assertEqual(payload.reviewClock, 12);
  assertEqual(payload.tiers.clock, 2);
  assertEqual(payload.tier, 2, 'the old scalar travels too, for a device still on one subject');
  assertEqual(payload.stats.bestStreak, 9);
  assertEqual(payload.items['4:15'].feeds, 4);
});

test('an exported payload carries neither settings nor the session', () => {
  const payload = exportPayload(playedState(), 2000);
  assert(!('settings' in payload), 'settings travelled');
  assert(!('session' in payload), 'the session travelled');
});

test('progress survives the round trip through a file', () => {
  const from = playedState();
  const json = payloadToJson(exportPayload(from, 2000));
  const landed = applyImport(receivingState(), parseTransfer(json), 5000);
  assertEqual(landed.reviewClock, 12);
  assertEqual(landed.tiers.clock, 2);
  assertEqual(landed.stats.totalAnswered, 40);
  assertEqual(Object.keys(landed.items).length, 2);
  assertEqual(landed.items['4:15'].feeds, 4);
  assertEqual(landed.items['4:15'].phase, 'graduated');
  assertEqual(landed.items['9:30'].cracks, 2, 'a half-broken egg arrives half-broken');
});

test('a code round trip keeps a Norwegian pet name intact', () => {
  const code = encodeCode(exportPayload(playedState(), 2000));
  assert(code.startsWith(CODE_PREFIX), 'the code is not labelled');
  const landed = applyImport(receivingState(), parseTransfer(code), 5000);
  assertEqual(landed.items['4:15'].name, 'Blåbær');
});

test('a code survives being wrapped across lines by a chat app', () => {
  const code = encodeCode(exportPayload(playedState(), 2000));
  const mangled = `${code.slice(0, 40)}\n  ${code.slice(40, 90)}\n${code.slice(90)}  `;
  assertEqual(parseTransfer(mangled).reviewClock, 12);
});

test('importing keeps the receiving device’s own settings', () => {
  const payload = parseTransfer(payloadToJson(exportPayload(playedState(), 2000)));
  const landed = applyImport(receivingState(), payload, 5000);
  assertEqual(landed.settings.language, 'en');
  assertEqual(landed.settings.playMinutes, 12);
  assertEqual(landed.settings.showDigital, true);
});

test('importing leaves no session and no nap running', () => {
  const from = playedState();
  from.session = beginNap(startSession(1000), 1000);
  const payload = parseTransfer(payloadToJson(exportPayload(from, 2000)));
  const landed = applyImport(receivingState(), payload, 5000);
  assert(!isRunning(landed.session), 'a session came across');
  assert(!isNapping(landed.session, 5000), 'a nap came across');
});

test('a file from another game, a truncated code and a future format are all refused', () => {
  const bad = [
    ['{"app":"something-else","format":1,"items":{}}', 'transfer.badApp'],
    [`{"app":"pet-zoo","format":${TRANSFER_FORMAT + 1},"items":{}}`, 'transfer.badVersion'],
    ['{not json at all', 'transfer.badFile'],
    [`${CODE_PREFIX}!!!not base64!!!`, 'transfer.badFile'],
    ['', 'transfer.badFile'],
    ['{"app":"pet-zoo","format":1}', 'transfer.badFile'],
  ];
  for (const [text, key] of bad) {
    let caught = null;
    try {
      parseTransfer(text);
    } catch (error) {
      caught = error;
    }
    assert(caught instanceof TransferError, `${text.slice(0, 20)} was accepted`);
    assertEqual(caught.key, key, `wrong reason for ${text.slice(0, 20)}`);
  }
});

test('a refused import is reported as a key a grown-up can be shown, not a parser message', () => {
  const keys = languageKeys('nb');
  for (const key of ['transfer.badFile', 'transfer.badApp', 'transfer.badVersion']) {
    assert(keys.includes(key), `${key} has no translation`);
  }
});

test('a bogus record is dropped and its neighbours survive', () => {
  const cleaned = cleanItems({
    '4:15': { h: 4, m: 15, feeds: 1 },
    '4:07': { h: 4, m: 7, feeds: 1 }, // not on a five-minute tick
    '13:00': { h: 13, m: 0, feeds: 1 }, // no such hour on the face
    '9:30': { h: 4, m: 15, feeds: 1 }, // the id disagrees with the record
    '2:00': 'not an object',
  });
  assertEqual(Object.keys(cleaned).join(','), '4:15');
});

test('a save written before forms existed arrives with its pets the size they earned', () => {
  const cleaned = cleanItems({ '4:15': { h: 4, m: 15, reps: 5, hatchedAt: 1 } });
  assertEqual(cleaned['4:15'].feeds, 5);
});

test('the pet count reports hatched pets, not eggs', () => {
  assertEqual(petCount(playedState().items), 1);
});

test('the export filename names the day it was written', () => {
  assertEqual(exportFilename(Date.UTC(2026, 7, 22)), 'pet-zoo-2026-08-22.json');
});

describe('settings — the digital time can be turned off');

test('a fresh zoo shows no digits', () => {
  assertEqual(freshState(0).settings.showDigital, false);
});

test('a save written before the setting existed loads with the digits off', () => {
  const storage = fakeStorage();
  storage.setItem(
    STORAGE_KEY,
    JSON.stringify({ version: VERSION, items: {}, settings: { language: 'en', playMinutes: 7 } })
  );
  const back = load(0, storage);
  assertEqual(back.settings.showDigital, false);
  assertEqual(back.settings.playMinutes, 7, 'the settings it did have were lost');
});

test('the teach lines have somewhere to put a spoken time', () => {
  // main.js substitutes the phrase into {time} when the digits are off, so a translation
  // that dropped the placeholder would silently lose the answer from the correction.
  for (const lang of ['en', 'nb']) {
    const t = translator(lang);
    for (const key of ['teach.both', 'teach.hourJustLeft']) {
      assert(t(key, {}).length > 0, `${lang} ${key} is empty`);
      assert(t(key).includes('{time}'), `${lang} ${key} lost its {time}`);
    }
  }
});

test('no spoken phrase contains a digit, in either language', () => {
  // The property that makes "digits off" mean anything: a phrase like "kvart over 4"
  // would put the numeral straight back on screen.
  for (const lang of ['en', 'nb']) {
    for (const h of HOURS) {
      for (let m = 0; m < 60; m += 5) {
        const said = spokenTime(lang, h, m);
        assert(!/[0-9]/.test(said), `${lang} ${timeId(h, m)}: ${said}`);
      }
    }
  }
});

/* -------------------------------------------------------- run and report */

/* ------------------------------------------------------------- habitats */

describe('habitats — every pet gets a home of its own');

const EVERY_HABITAT = ALL_ITEMS.map((item) => habitatFor(item.h, item.m));

test('all 144 times produce a habitat, and no two of them are the same picture', () => {
  const drawings = new Set(
    EVERY_HABITAT.map((h) => habitatSvg(h, { uid: `u${h.id.replace(':', '')}` }))
  );
  assertEqual(EVERY_HABITAT.length, 144, 'one habitat per curriculum time');
  assertEqual(drawings.size, 144, 'every habitat draws differently');
});

test('nothing renders a NaN, an undefined or an empty scene', () => {
  for (const h of EVERY_HABITAT) {
    const svg = habitatSvg(h, { uid: 'u', label: 'home' });
    assert(!svg.includes('NaN'), `${h.id} drew a NaN`);
    assert(!svg.includes('undefined'), `${h.id} drew an undefined`);
    assert(svg.length > 1500, `${h.id} drew almost nothing`);
  }
});

test('a habitat is generated, never stored — the same time always gives the same home', () => {
  const once = habitatSvg(habitatFor(4, 15), { uid: 'u' });
  const twice = habitatSvg(habitatFor(4, 15), { uid: 'u' });
  assertEqual(once, twice, 'habitats must be deterministic');
});

test('two pets of the same species share a biome but not a home', () => {
  const byBiome = new Map();
  for (const h of EVERY_HABITAT) {
    assertEqual(h.biome, biomeOfSpecies(h.species), `${h.id} left its species' biome`);
    if (!byBiome.has(h.species)) byBiome.set(h.species, new Set());
    byBiome.get(h.species).add(habitatSvg(h, { uid: 'u' }));
  }
  for (const [species, drawings] of byBiome) {
    const times = timesOfSpecies(species).length;
    if (times > 1) assert(drawings.size > 1, `every ${species} lives in an identical home`);
  }
});

test('all eight biomes are somebody’s home, and every phase of day happens', () => {
  const biomes = new Set(EVERY_HABITAT.map((h) => h.biome));
  const phases = new Set(EVERY_HABITAT.map((h) => h.light.phase));
  assertEqual(biomes.size, BIOME_IDS.length, 'some biome is never used');
  assertEqual(phases.size, PHASE_IDS.length, 'some time of day never happens');
});

test('night is the exception rather than the rule', () => {
  const nights = EVERY_HABITAT.filter((h) => h.light.night).length;
  // A straight coin flip on am/pm would put nine hours in twenty-four under stars; the
  // weighting in lightingFor exists to keep night special *and* to keep the zoo readable.
  assert(nights > 0, 'no pet ever lives at night');
  assert(nights < 144 * 0.3, `${nights} of 144 habitats are dark — too many`);
});

describe('habitats — everything a child must reach survives the crop');

test('the props, the treats and the pet’s spot all stay inside the safe box', () => {
  for (const h of EVERY_HABITAT) {
    for (const [name, prop] of Object.entries(h.props)) {
      assert(prop.x >= SAFE.x0 && prop.x <= SAFE.x1, `${h.id} put its ${name} outside the safe box`);
    }
    for (const spot of h.props.larder.spots) {
      assert(spot.x >= SAFE.x0 && spot.x <= SAFE.x1, `${h.id} hung a treat outside the safe box`);
    }
    assert(h.home.x >= ROAM.x0 && h.home.x <= ROAM.x1, `${h.id} idles outside its own roam band`);
  }
});

test('a pet standing at either end of the roam band still fits inside the crop', () => {
  const half = PET_SIZE / 2;
  assert(ROAM.x0 - half >= SAFE.x0 - 1, 'a pet at the left end loses an ear to the crop');
  assert(ROAM.x1 + half <= SAFE.x1 + 1, 'a pet at the right end loses an ear to the crop');
});

test('the nest leaves room for a whole pet, because a pet sleeps in it', () => {
  for (const h of EVERY_HABITAT) {
    assert(
      h.props.nest.x >= NEST_KEEP.x0 && h.props.nest.x <= NEST_KEEP.x1,
      `${h.id} would crop a pet asleep in its nest`
    );
  }
});

test('the middle of the field is left clear, so the pet never stands on its own ball', () => {
  for (const layout of LAYOUTS) {
    for (const x of [layout.nest, layout.larder, layout.ball]) {
      assert(x <= CENTRE_KEEP.x0 || x >= CENTRE_KEEP.x1, `a layout put a prop at ${x}, in the centre`);
    }
  }
  for (const h of EVERY_HABITAT) {
    const clearance = Math.min(
      ...[h.props.nest.x, h.props.larder.x, h.props.ball.x].map((x) => Math.abs(x - h.home.x))
    );
    assert(clearance >= 16, `${h.id} idles ${clearance} units from a prop`);
  }
});

test('the ball always rests somewhere the pet can actually walk to', () => {
  for (const h of EVERY_HABITAT) {
    assert(
      h.props.ball.x >= ROAM.x0 + BALL_R && h.props.ball.x <= ROAM.x1 - BALL_R,
      `${h.id} rests its ball out of reach`
    );
  }
});

test('homeSpotFor keeps its distance from all three props', () => {
  const roam = { x0: 62, x1: 138 };
  const layout = { nest: 126, larder: 52, ball: 78 };
  const home = homeSpotFor(layout, roam);
  assert(home >= roam.x0 && home <= roam.x1, 'the home spot left the roam band');
  for (const x of Object.values(layout)) {
    assert(Math.abs(home - x) >= 16, `the home spot landed ${Math.abs(home - x)} from a prop`);
  }
});

test('bigger scenery is nearer, and nearer scenery is drawn in front of the pet', () => {
  assert(sceneryY(0.55) < sceneryY(1.0), 'a small piece must sit further back');
  assert(sceneryY(0.6) < WALK_Y, 'a far piece must be behind the pet');
  assert(sceneryY(1.28) > WALK_Y, 'a near piece must be in front of the pet');
  for (const h of EVERY_HABITAT) {
    for (const piece of h.scenery) {
      assertEqual(piece.y, sceneryY(piece.scale), `${h.id} placed a piece off its own depth rule`);
      assert(SCENERY_IDS.includes(piece.id), `${h.id} asked for scenery that does not exist`);
    }
  }
});

describe('habitats — the light says when this pet’s day happens');

test('a pet’s am-or-pm is decided once and never wobbles', () => {
  for (const item of ALL_ITEMS) {
    const a = lightingFor(item.h, item.m);
    const b = lightingFor(item.h, item.m);
    assertEqual(a.hour24, b.hour24, `${item.id} changed its hour between calls`);
    assertEqual(a.hour24 % 12, item.h % 12, `${item.id} lights an hour that is not its own`);
  }
});

test('both halves of the day are used', () => {
  const morning = ALL_ITEMS.filter((i) => !lightingFor(i.h, i.m).pm).length;
  assert(morning > 0 && morning < ALL_ITEMS.length, 'every pet ended up in the same half of the day');
});

test('the six phases split the clock without a gap', () => {
  for (let hour = 0; hour < 24; hour += 1) {
    assert(PHASE_IDS.includes(phaseOfHour(hour)), `hour ${hour} has no phase`);
  }
  assertEqual(phaseOfHour(12), 'noon');
  assertEqual(phaseOfHour(0), 'night');
  assertEqual(phaseOfHour(23), 'night');
  assertEqual(phaseOfHour(6), 'dawn');
  assertEqual(phaseOfHour(24), phaseOfHour(0), 'the day must wrap');
});

test('the sun climbs to noon and comes back down, and never sets behind the crop', () => {
  assert(orbPoint(12).y < orbPoint(7).y, 'midday should be the highest point of the day');
  assert(orbPoint(12).y < orbPoint(18).y, 'the afternoon should be lower than midday');
  assert(orbPoint(7).x < orbPoint(17).x, 'the sun should travel one way across the sky');
  for (let hour = 0; hour < 24; hour += 1) {
    const orb = orbPoint(hour);
    assert(orb.x >= SAFE.x0 && orb.x <= SAFE.x1, `the light at ${hour}:00 sits outside the safe box`);
    assert(orb.y > 0 && orb.y < HORIZON, `the light at ${hour}:00 is not in the sky`);
  }
});

test('the horizon is always visible, whatever the biome and the hour did to the colours', () => {
  const lum = (hex) => {
    const v = parseInt(hex.slice(1), 16);
    return ((v >> 16) & 255) * 0.3 + ((v >> 8) & 255) * 0.6 + (v & 255) * 0.1;
  };
  for (const h of EVERY_HABITAT) {
    const gap = lum(h.palette.ground[0]) - lum(h.palette.groundRim);
    assert(gap > 20, `${h.id} draws a horizon rim only ${Math.round(gap)} apart from its ground`);
    assert(habitatSvg(h, { uid: 'u' }).includes(h.palette.groundRim), `${h.id} never draws its rim`);
  }
});

test('a night habitat is lit, not blacked out', () => {
  const night = EVERY_HABITAT.find((h) => h.light.night);
  const noon = EVERY_HABITAT.find((h) => h.light.phase === 'noon');
  const brightness = (hex) => {
    const v = parseInt(hex.slice(1), 16);
    return ((v >> 16) & 255) * 0.3 + ((v >> 8) & 255) * 0.6 + (v & 255) * 0.1;
  };
  assert(brightness(night.palette.ground[0]) > 60, 'a night ground is too dark to see a pet on');
  assert(
    brightness(night.palette.ground[0]) < brightness(noon.palette.ground[0]),
    'night should still read as darker than noon'
  );
});

describe('habitats — colour');

test('mixing is a straight blend, and the ends are the colours themselves', () => {
  assertEqual(mix('#000000', '#ffffff', 0), '#000000');
  assertEqual(mix('#000000', '#ffffff', 1), '#ffffff');
  assertEqual(mix('#000000', '#ffffff', 0.5), '#808080');
  assertEqual(mix('#000000', '#ffffff', 9), '#ffffff', 'a blend past the end clamps');
  assertEqual(mix('#fff', '#fff', 0.5), '#ffffff', 'short hex is understood');
});

test('a habitat is tinted toward the pet that lives in it', () => {
  const mochi = paletteFor('mochi', 'meadow', 'noon');
  const waddle = paletteFor('waddle', 'meadow', 'noon');
  assert(mochi.bloom !== waddle.bloom, 'two species share a meadow but not its flowers');
  assertEqual(mochi.ballA, SPECIES.mochi.palette[2], 'the ball takes the pet’s accent');
});

test('every palette entry is a real colour', () => {
  for (const h of EVERY_HABITAT) {
    for (const [key, value] of Object.entries(h.palette)) {
      for (const hex of [].concat(value)) {
        assert(/^#[0-9a-f]{6}$/.test(hex), `${h.id} palette.${key} is ${hex}`);
      }
    }
  }
});

describe('habitats — the ball obeys the world');

const BOUNDS = { x0: 62, x1: 138, floor: WALK_Y - BALL_R, ceiling: 10 };
const settle = (ball, steps = 4000) => {
  let b = ball;
  for (let i = 0; i < steps && !b.resting; i += 1) b = stepBall(b, 1 / 60, BOUNDS);
  return b;
};

test('a ball thrown upward comes back down', () => {
  let b = { x: 100, y: 60, vx: 0, vy: -200, resting: false };
  let highest = b.y;
  for (let i = 0; i < 60; i += 1) {
    b = stepBall(b, 1 / 60, BOUNDS);
    highest = Math.min(highest, b.y);
  }
  assert(highest < 60, 'it should have gone up');
  assert(b.y > highest, 'and it should be coming back down');
});

test('every bounce is smaller than the one before it', () => {
  let b = { x: 100, y: BOUNDS.floor - 40, vx: 0, vy: 0, resting: false };
  const impacts = [];
  for (let i = 0; i < 900 && !b.resting; i += 1) {
    b = stepBall(b, 1 / 60, BOUNDS);
    if (b.bounce > 0) impacts.push(b.bounce);
  }
  assert(impacts.length >= 2, 'it should bounce more than once');
  for (let i = 1; i < impacts.length; i += 1) {
    assert(impacts[i] < impacts[i - 1], 'a bounce came back bigger than it landed');
  }
});

test('however hard it is thrown, it settles and it never leaves the field', () => {
  for (const vx of [-900, -340, -40, 0, 40, 340, 900]) {
    for (const vy of [-900, -200, 0, 200, 900]) {
      let b = { x: 100, y: 60, vx, vy, resting: false };
      for (let i = 0; i < 4000; i += 1) {
        b = stepBall(b, 1 / 60, BOUNDS);
        assert(b.x >= BOUNDS.x0 && b.x <= BOUNDS.x1, `a ball at ${vx},${vy} escaped sideways`);
        assert(b.y <= BOUNDS.floor + 0.001, `a ball at ${vx},${vy} fell through the ground`);
        assert(b.y >= BOUNDS.ceiling - 0.001, `a ball at ${vx},${vy} flew off the top`);
        if (b.resting) break;
      }
      assert(b.resting, `a ball thrown at ${vx},${vy} never came to rest`);
      assertClose(b.y, BOUNDS.floor, 0.001, 'a ball at rest should be on the ground');
    }
  }
});

test('a resting ball stays where it was left', () => {
  const b = { x: 90, y: BOUNDS.floor, vx: 0, vy: 0, resting: true };
  const after = stepBall(b, 1 / 60, BOUNDS);
  assertEqual(after.x, 90);
  assertEqual(after.y, BOUNDS.floor);
});

test('a tab left in the background does not teleport the ball through the floor', () => {
  const b = { x: 100, y: 20, vx: 0, vy: 400, resting: false };
  // Ten seconds of frozen time arriving as one frame: dt is clamped, so this is a step.
  const after = stepBall(b, 10, BOUNDS);
  assert(after.y <= BOUNDS.floor, 'a huge dt punched the ball through the ground');
  assertEqual(settle(after).resting, true, 'and it still settles afterwards');
});

describe('habitats — pottering about');

test('a wander target is always somewhere the pet can stand', () => {
  const rnd = rndFrom(7);
  let at = 100;
  for (let i = 0; i < 500; i += 1) {
    at = nextWanderTarget(at, ROAM, rnd);
    assert(at >= ROAM.x0 && at <= ROAM.x1, `the pet was sent to ${at}`);
  }
});

test('a pet at the edge is sent back inward rather than pacing the boundary', () => {
  const rnd = rndFrom(3);
  assert(nextWanderTarget(ROAM.x0, ROAM, rnd) > ROAM.x0, 'stuck against the left edge');
  assert(nextWanderTarget(ROAM.x1, ROAM, rnd) < ROAM.x1, 'stuck against the right edge');
});

test('the same seed always walks the same route', () => {
  const walk = (seed) => {
    const rnd = rndFrom(seed);
    let at = 100;
    return Array.from({ length: 8 }, () => (at = nextWanderTarget(at, ROAM, rnd)));
  };
  assertEqual(walk(11).join(), walk(11).join(), 'the injected rng is not deterministic');
  assert(walk(11).join() !== walk(12).join(), 'two seeds should walk differently');
});

describe('habitats — modifiable later, stored never');

test('a plain pet gets the generated habitat and stores nothing', () => {
  const item = createItem({ h: 4, m: 15, species: 'fizz', reviewClock: 0 });
  assertEqual(item.habitat, undefined, 'a fresh pet must not carry a habitat');
  assertEqual(
    habitatSvg(habitatOf(item), { uid: 'u' }),
    habitatSvg(habitatFor(4, 15), { uid: 'u' }),
    'a pet with no override should look exactly like its generated home'
  );
});

test('a stored override wins over the generated habitat, one field at a time', () => {
  const item = { ...createItem({ h: 4, m: 15, species: 'fizz', reviewClock: 0 }) };
  const base = habitatFor(4, 15);
  item.habitat = { biome: 'snowfield', palette: { ballA: '#123456' } };
  const merged = habitatOf(item);
  assertEqual(merged.biome, 'snowfield', 'the override should choose the biome');
  assertEqual(merged.palette.ballA, '#123456', 'the override should choose the colour');
  assertEqual(merged.palette.leaf, base.palette.leaf, 'and leave the rest of the palette alone');
  assertEqual(merged.props.nest.x, base.props.nest.x, 'and leave the props alone');
});

test('rubbish in an override cannot break a habitat', () => {
  const item = createItem({ h: 4, m: 15, species: 'fizz', reviewClock: 0 });
  for (const junk of [null, 'meadow', 42, []]) {
    const drawn = habitatSvg(habitatOf({ ...item, habitat: junk }), { uid: 'u' });
    assert(drawn.length > 1500 && !drawn.includes('undefined'), `an override of ${junk} broke the scene`);
  }
});

test('an override travels between devices, because cleanItems passes item fields through', () => {
  const state = playedState();
  state.items['4:15'].habitat = { biome: 'cloudtop' };
  const payload = parseTransfer(payloadToJson(exportPayload(state, 2000)));
  assertEqual(payload.items['4:15'].habitat.biome, 'cloudtop', 'the habitat did not survive the trip');
  const landed = applyImport(receivingState(), payload, 6000);
  assertEqual(habitatOf(landed.items['4:15']).biome, 'cloudtop', 'the imported pet lost its home');
});

describe('habitats — the pieces the scene is built from');

test('every biome asks only for scenery and treats that exist', () => {
  for (const h of EVERY_HABITAT) {
    assert(TREAT_IDS.includes(h.props.larder.treat), `${h.id} grows a treat that does not exist`);
    assertEqual(h.props.larder.spots.length, 3, `${h.id} has the wrong number of treats`);
  }
});

test('a habitat varies along the same trait index that varies its pet', () => {
  // Appearance, name and habitat all walk the same index, so the pet and its home change
  // together rather than drifting apart.
  const times = timesOfSpecies('bubs');
  assert(times.length > 1, 'this test needs a species with several pets');
  const seen = new Set();
  for (const id of times) {
    const [h, m] = id.split(':').map(Number);
    assertEqual(traitIndexFor(h, m), times.indexOf(id), `${id} has the wrong trait index`);
    seen.add(JSON.stringify(habitatFor(h, m).scenery));
  }
  assert(seen.size > 1, 'every Bubs was given the same arrangement');
});

describe('coins — what looking after the zoo pays');

test('a correct answer on its own pays nothing', () => {
  assertEqual(payoutFor({ hatched: false, evolved: 0 }), 0, 'answers must not mint coins');
  assertEqual(payoutFor({}), 0);
  assertEqual(payoutFor(null), 0, 'and a missing event bag is not a payday');
});

test('hatching, growing and opening a tier are what pay', () => {
  assertEqual(payoutFor({ hatched: true }), HATCH_COINS);
  assertEqual(payoutFor({ evolved: 2 }), EVOLVE_COINS[2]);
  assertEqual(payoutFor({ evolved: 3 }), EVOLVE_COINS[3]);
  assert(EVOLVE_COINS[3] > EVOLVE_COINS[2], 'the rarer form is worth more');
  assert(TIER_COINS > HATCH_COINS, 'and a whole tier is worth more than one pet');
});

test('a form the game does not have pays nothing rather than NaN', () => {
  assertEqual(payoutFor({ evolved: 9 }), 0);
});

test('the day bonus is paid once, and doubled for a day that follows yesterday', () => {
  assertEqual(dayBonusFor(['2026-08-23', '2026-08-24'], '2026-08-24'), DAY_STREAK_COINS);
  assertEqual(dayBonusFor(['2026-08-01', '2026-08-24'], '2026-08-24'), DAY_COINS, 'a gap is not a streak');
  assertEqual(dayBonusFor(['2026-08-24'], '2026-08-24'), DAY_COINS, 'the very first day still pays');
  assertEqual(dayBonusFor(['2026-08-23'], '2026-08-24'), 0, 'today has not been recorded yet');
  assertEqual(dayBonusFor([], '2026-08-24'), 0);
});

test('the day bonus survives the turn of a month and of a year', () => {
  assertEqual(dayBonusFor(['2026-07-31', '2026-08-01'], '2026-08-01'), DAY_STREAK_COINS);
  assertEqual(dayBonusFor(['2025-12-31', '2026-01-01'], '2026-01-01'), DAY_STREAK_COINS);
});

test('a purse is whole, never negative, and never NaN', () => {
  assertEqual(normalize(-5), 0);
  assertEqual(normalize(7.8), 7);
  assertEqual(normalize('nonsense'), 0, 'a hand-edited save cannot make a fortune');
  assertEqual(normalize(undefined), 0);
  assertEqual(earn(10, 6), 16);
  assertEqual(earn(-4, 6), 6);
});

test('spending refuses rather than overdraws', () => {
  assertEqual(spend(100, 45), 55);
  assertEqual(spend(30, 45), 30, 'a caller that forgot to check cannot go below zero');
  assertEqual(spend(45, 45), 0, 'and exactly enough is enough');
  assert(canAfford(45, 45) && !canAfford(44, 45));
});

describe('coins — a zoo that predates the shop opens with something in it');

test('back pay covers every pet already hatched and every form already earned', () => {
  const items = {
    '1:00': { hatchedAt: 1, feeds: 5 }, // form 3: both evolutions
    '2:00': { hatchedAt: 1, feeds: 3 }, // form 2: one evolution
    '3:00': { hatchedAt: 1, feeds: 1 }, // hatched, no evolutions yet
    '4:00': { hatchedAt: null, feeds: 0 }, // still an egg, and eggs do not pay
  };
  const expected =
    3 * HATCH_COINS + EVOLVE_COINS[2] + EVOLVE_COINS[3] + EVOLVE_COINS[2] + 2 * TIER_COINS;
  assertEqual(retroGrant(items, 2), expected);
});

test('an empty zoo is granted nothing at all', () => {
  assertEqual(retroGrant({}, 0), 0);
  assertEqual(retroGrant(undefined, 0), 0);
});

test('back pay is a pure function of the save, so running it twice cannot pay twice', () => {
  const items = { '1:00': { hatchedAt: 1, feeds: 5 } };
  assertEqual(retroGrant(items, 1), retroGrant(items, 1), 'the walk must not mutate the zoo');
  assertEqual(JSON.stringify(items), '{"1:00":{"hatchedAt":1,"feeds":5}}');
});

describe('the shop — locking, owning and the two-slot cap');

test('every catalogue entry is priced, tiered and drawable', () => {
  assert(CATALOG.length > 0);
  // Each shelf is drawn from its own map, and a piece is only ever looked up in the one its
  // scope and slot say it belongs to — so a piece filed under the wrong one is a blank card.
  const drawnBy = {
    zoo: YARD_PIECE_IDS,
    ground: FURNITURE_IDS,
    backdrop: BACKDROP_IDS,
  };
  for (const entry of CATALOG) {
    assert(entry.price > 0, `${entry.id} is free`);
    assert(entry.tier >= 0 && entry.tier <= LAST_TIER, `${entry.id} sits outside the curriculum`);
    assert(['home', 'zoo'].includes(entry.scope), `${entry.id} belongs to no shelf`);
    const ids = drawnBy[entry.scope === 'zoo' ? 'zoo' : entry.slot];
    assert(ids && ids.includes(entry.id), `${entry.id} has nothing to draw`);
    // Width is a ground-slot idea: it decides which of the two side bands a piece takes.
    // Nothing competes for room on the hill line or in the yard, so nothing declares one.
    if (entry.scope === 'home' && entry.slot === 'ground') {
      assert(['wide', 'narrow'].includes(entry.band), `${entry.id} has no width`);
    }
  }
});

test('every shelf has something on it, from the very first tier', () => {
  for (const shelf of [HOME_CATALOG, ZOO_CATALOG]) {
    assert(shelf.length > 0, 'a tab with an empty grid is a dead end');
    assert(shelf.some((entry) => entry.tier === 0), 'a shelf must not open entirely locked');
  }
  for (const slot of Object.keys(SLOT_CAPS)) {
    assert(
      HOME_CATALOG.some((entry) => entry.slot === slot && entry.tier === 0),
      `nothing fits the ${slot} slot at tier 0`
    );
  }
});

test('something is buyable from the very first tier', () => {
  assert(CATALOG.some((entry) => entry.tier === 0), 'the shop must not open empty');
});

test('a piece unlocks at its own tier and stays unlocked above it', () => {
  const house = shopItemById.get('house');
  assert(!isUnlocked('house', house.tier - 1), 'it was open too early');
  assert(isUnlocked('house', house.tier));
  assert(isUnlocked('house', LAST_TIER), 'and it must not close again');
  assert(!isUnlocked('no-such-thing', LAST_TIER), 'and nothing unknown is ever unlocked');
});

test('buying adds one piece, and the same piece cannot be bought twice', () => {
  const pet = { decor: [] };
  const one = buy(pet, 'house');
  assertEqual(one.decor.join(), 'house');
  assertEqual(buy(one, 'house').decor.join(), 'house', 'it was bought twice');
  assertEqual(pet.decor.length, 0, 'and the pet handed in was mutated');
});

test('a full home refuses a further purchase rather than dropping what is there', () => {
  let pet = { decor: [] };
  for (const entry of CATALOG.slice(0, MAX_DECOR)) pet = buy(pet, entry.id);
  assert(isFull(pet));
  const refused = buy(pet, CATALOG[MAX_DECOR].id);
  assertEqual(refused.decor.length, MAX_DECOR, 'the cap was exceeded');
  assertEqual(refused.decor.join(), pet.decor.join(), 'and something already owned was lost');
});

test('selling gives the piece back and leaves the others where they were', () => {
  const pet = buy(buy({ decor: [] }, 'flowerbed'), 'lantern');
  const after = sell(pet, 'flowerbed');
  assertEqual(after.decor.join(), 'lantern');
  assert(!isOwned(after, 'flowerbed') && isOwned(after, 'lantern'));
  assertEqual(sell(after, 'flowerbed').decor.join(), 'lantern', 'selling it twice invented a coin');
});

test('a piece sold back returns exactly what it cost — experimenting is free', () => {
  for (const entry of CATALOG) {
    const bought = spend(500, entry.price);
    assertEqual(earn(bought, entry.price), 500, `${entry.id} costs something to try`);
  }
});

test('only ids this build can draw ever reach a habitat', () => {
  assertEqual(sanitizeDecor(['house', 'bogus', 'house', 'lantern']).join(), 'house,lantern');
  assertEqual(sanitizeDecor('house').length, 0, 'a string is not a list of pieces');
  assertEqual(sanitizeDecor(null).length, 0);
  // Every id there is, filtered down to one full habitat: two on the ground, one on the hill.
  const everything = sanitizeDecor(CATALOG.map((e) => e.id));
  assertEqual(everything.filter((id) => slotOf(id) === 'ground').length, MAX_DECOR);
  assertEqual(everything.filter((id) => slotOf(id) === 'backdrop').length, SLOT_CAPS.backdrop);
  assertEqual(everything.length, MAX_DECOR + SLOT_CAPS.backdrop, 'the cap holds on load too');
  assertEqual(
    sanitizeDecor(['house', 'fountain', 'lantern']).join(),
    'house,lantern',
    'a yard piece is the wrong scale for a habitat and must never reach one'
  );
});

describe('the shop — what a purchase puts in a habitat');

test('every habitat has room for a full set, clear of everything the pet uses', () => {
  for (const layout of LAYOUTS) {
    const spots = furnitureSpotsFor(layout);
    assertEqual(spots.length, MAX_DECOR, 'a layout cannot hold a full home');
    const busy = [layout.nest, layout.larder, layout.ball, homeSpotFor(layout, ROAM)];
    for (const x of spots) {
      for (const b of busy) {
        assert(Math.abs(x - b) >= 12, `a piece at ${x} crowds something the pet needs at ${b}`);
      }
      assert(x < CENTRE_KEEP.x0 || x > CENTRE_KEEP.x1, 'the middle belongs to the pet');
    }
    assert(Math.abs(spots[0] - spots[1]) >= 24, 'two pieces would read as one');
  }
});

test('a bought piece is wholly inside the crop, however wide it is', () => {
  for (const item of ALL_ITEMS) {
    for (const f of habitatOf({ ...item, decor: ['house', 'windmill'] }).furniture) {
      assert(f.x - FURNITURE_HALF_WIDTH >= SAFE.x0, `${item.id} loses the left of a piece`);
      assert(f.x + FURNITURE_HALF_WIDTH <= SAFE.x1, `${item.id} loses the right of a piece`);
      assertEqual(f.y, WALK_Y, 'furniture must stand on the same ground as the pet');
    }
  }
});

test('a pet with nothing bought has an empty home, and 144 of them still cost no bytes', () => {
  for (const item of ALL_ITEMS) {
    assertEqual(habitatOf(item).furniture.length, 0, `${item.id} was given something free`);
  }
});

test('the same pet lays its home out the same way every time', () => {
  const item = { h: 4, m: 15, decor: ['flowerbed'] };
  assertEqual(JSON.stringify(habitatOf(item).furniture), JSON.stringify(habitatOf(item).furniture));
  // Buying a second piece must not move the first one.
  const one = habitatOf(item).furniture[0];
  const two = habitatOf({ ...item, decor: ['flowerbed', 'lantern'] }).furniture[0];
  assertEqual(two.x, one.x, 'the first piece moved when a second arrived');
});

test('a junk id in a save is dropped rather than drawn', () => {
  const furniture = habitatOf({ h: 4, m: 15, decor: ['bogus', 'pond'] }).furniture;
  assertEqual(furniture.length, 1);
  assertEqual(furniture[0].id, 'pond');
});

test('every piece draws, in every palette, without a hole in it', () => {
  for (const habitat of [habitatFor(12, 0), habitatFor(11, 30), habitatFor(3, 45)]) {
    for (const id of FURNITURE_IDS) {
      const markup = FURNITURE[id](habitat.palette);
      assert(markup.length > 0, `${id} draws nothing`);
      assert(!markup.includes('undefined'), `${id} asks for a colour the palette has not got`);
    }
  }
});

test('a habitat with furniture in it actually renders it', () => {
  const svg = habitatSvg(habitatOf({ h: 4, m: 15, decor: ['house', 'lantern'] }), { label: 'x' });
  assertEqual((svg.match(/hab-furniture/g) ?? []).length, 2);
  assert(!svg.includes('undefined'));
});

describe('the shop — the slot on the hill line');

test('a backdrop piece fits alongside a full pair on the ground', () => {
  let pet = { decor: [] };
  for (const id of ['house', 'lantern', 'pond']) pet = buy(pet, id);
  assertEqual(pet.decor.join(), 'house,lantern', 'the ground cap gave way');
  pet = buy(pet, 'farTower');
  assertEqual(pet.decor.join(), 'house,lantern,farTower', 'the hill line has room of its own');
  // And it is full at one: the horizon is a single readable band.
  const refused = buy(pet, 'farMill');
  assertEqual(refused.decor.join(), pet.decor.join(), 'a second far piece got in');
});

test('each slot is counted and reported on its own', () => {
  const pet = { decor: ['house', 'farTower'] };
  assertEqual(countIn(pet, 'ground'), 1);
  assertEqual(countIn(pet, 'backdrop'), 1);
  assert(!isFull(pet, 'ground'), 'one of two is not full');
  assert(isFull(pet, 'backdrop'), 'one of one is');
  assertEqual(slotOf('house'), 'ground');
  assertEqual(slotOf('farTower'), 'backdrop');
  assertEqual(slotOf('bogus'), 'ground', 'an unknown id is capped somewhere rather than nowhere');
});

test('selling a far piece frees the hill line and nothing else', () => {
  const pet = { decor: ['house', 'lantern', 'farTower'] };
  const after = sell(pet, 'farTower');
  assertEqual(after.decor.join(), 'house,lantern');
  assert(!isFull(after, 'backdrop'), 'the slot did not come back');
  assert(isFull(after, 'ground'), 'selling one thing emptied another slot');
});

test('every habitat has a far spot, whole, clear of the ground pieces and out of the middle', () => {
  for (const layout of LAYOUTS) {
    const ground = furnitureSpotsFor(layout);
    const x = backdropSpotFor(layout, ground);
    assert(x - BACKDROP_HALF_WIDTH >= SAFE.x0, `a far piece at ${x} loses its left side`);
    assert(x + BACKDROP_HALF_WIDTH <= SAFE.x1, `a far piece at ${x} loses its right side`);
    assert(x < CENTRE_KEEP.x0 || x > CENTRE_KEEP.x1, 'the middle belongs to the pet');
    for (const g of ground) {
      assert(Math.abs(g - x) >= 12, `a far piece at ${x} stands right behind one at ${g}`);
    }
  }
});

test('a far piece stands on the horizon, drawn small, and only when it was bought', () => {
  for (const item of ALL_ITEMS) {
    assertEqual(habitatOf(item).backdrop, null, `${item.id} was given a skyline free`);
    const bought = habitatOf({ ...item, decor: ['farTower'] }).backdrop;
    assertEqual(bought.id, 'farTower');
    assertEqual(bought.y, HORIZON, 'a far piece must sit on the hill line');
    assert(bought.scale < 1, 'distance is carried by the scale as well as the colour');
  }
});

test('the two slots do not move each other', () => {
  const item = { h: 4, m: 15, decor: ['farTower'] };
  const alone = habitatOf(item).backdrop;
  const crowded = habitatOf({ ...item, decor: ['house', 'lantern', 'farTower'] });
  assertEqual(crowded.backdrop.x, alone.x, 'buying furniture moved the skyline');
  const ground = habitatOf({ h: 4, m: 15, decor: ['house', 'lantern'] }).furniture;
  assertEqual(
    JSON.stringify(crowded.furniture),
    JSON.stringify(ground),
    'buying a far piece moved the furniture'
  );
});

test('a far piece is cropped no worse than the hills it stands among', () => {
  // A short landscape window keeps only about ten units above the horizon, so nothing up there
  // is guaranteed whole. What must hold is that a piece the child *paid for* is never the one
  // thing on screen that is cut off: it has to stay inside the reach the biome's own far
  // scenery already has, which is what the crop was tuned around in the first place.
  for (const id of BACKDROP_IDS) {
    const markup = BACKDROP[id](habitatFor(12, 0).palette);
    const highest = Math.min(
      0,
      ...[...markup.matchAll(/-?\d+(?:\.\d+)?/g)].map(Number).filter((v) => v < 0)
    );
    assert(
      Math.abs(highest) <= BACKDROP_MAX_HEIGHT,
      `${id} is drawn ${Math.abs(highest)} tall, over the ${BACKDROP_MAX_HEIGHT} a far piece may be`
    );
    assert(
      Math.abs(highest) * BACKDROP_SCALE <= FAR_REACH,
      `${id} stands ${Math.abs(highest) * BACKDROP_SCALE} above the horizon, past the ${FAR_REACH} the hills reach`
    );
  }
});

test('every far piece draws, in every palette, without a hole in it', () => {
  for (const habitat of [habitatFor(12, 0), habitatFor(11, 30), habitatFor(3, 45)]) {
    for (const id of BACKDROP_IDS) {
      const markup = BACKDROP[id](habitat.palette);
      assert(markup.length > 0, `${id} draws nothing`);
      assert(!markup.includes('undefined'), `${id} asks for a colour the palette has not got`);
    }
  }
});

test('a habitat with a far piece in it actually renders it, once', () => {
  const svg = habitatSvg(habitatOf({ h: 4, m: 15, decor: ['house', 'farTower'] }), { label: 'x' });
  assertEqual((svg.match(/hab-backdrop/g) ?? []).length, 1);
  assertEqual((svg.match(/hab-furniture/g) ?? []).length, 1);
  assert(!svg.includes('undefined'));
  // Behind the ground, so the crest and the grass overlap its base and it reads as distance.
  assert(svg.indexOf('hab-backdrop') < svg.indexOf('hab-ground'), 'the far piece is in front');
});

describe('the shop — the zoo yard');

test('the yard holds three pieces, in the order they were bought', () => {
  let yard = [];
  for (const id of ['fountain', 'bunting', 'signpost']) yard = buyZoo(yard, id);
  assertEqual(yard.join(), 'fountain,bunting,signpost');
  assert(zooIsFull(yard), 'three is the yard full');
  assertEqual(buyZoo(yard, 'statue').join(), yard.join(), 'a fourth piece got in');
  assertEqual(buyZoo(yard, 'fountain').join(), yard.join(), 'it was bought twice');
  assertEqual(yard.length, MAX_ZOO_DECOR);
});

test('the yard refuses what belongs in a habitat, and does not mutate what it was handed', () => {
  const yard = ['fountain'];
  assertEqual(buyZoo(yard, 'house').join(), 'fountain', 'a habitat piece got into the yard');
  assertEqual(buyZoo(yard, 'bogus').join(), 'fountain');
  assertEqual(yard.length, 1, 'the list handed in was mutated');
  assert(zooOwns(yard, 'fountain'));
  assert(!zooOwns(yard, 'statue'));
});

test('selling from the yard gives the slot back and cannot be done twice', () => {
  const yard = ['fountain', 'bunting'];
  const after = sellZoo(yard, 'fountain');
  assertEqual(after.join(), 'bunting');
  assertEqual(sellZoo(after, 'fountain').join(), 'bunting', 'selling it twice invented a coin');
});

test('only ids this build can draw ever reach the yard', () => {
  assertEqual(sanitizeZoo(['fountain', 'bogus', 'fountain', 'statue']).join(), 'fountain,statue');
  assertEqual(sanitizeZoo(['house', 'farTower']).length, 0, 'a habitat piece is the wrong scale');
  assertEqual(sanitizeZoo('fountain').length, 0, 'a string is not a list of pieces');
  assertEqual(sanitizeZoo(null).length, 0);
  assertEqual(sanitizeZoo(CATALOG.map((e) => e.id)).length, MAX_ZOO_DECOR, 'the cap holds on load');
});

test('every yard slot is inside the box, and far enough apart for the widest piece', () => {
  assertEqual(YARD_SLOTS.length, MAX_ZOO_DECOR, 'a slot without a piece, or a piece without one');
  for (const x of YARD_SLOTS) {
    assert(x - 24 >= 0 && x + 24 <= VIEW.w, `a piece at ${x} would run off the yard`);
  }
  for (let i = 1; i < YARD_SLOTS.length; i += 1) {
    assert(YARD_SLOTS[i] - YARD_SLOTS[i - 1] >= 48, 'two pieces would read as one');
  }
});

test('yard pieces take their slots in order, and buying a second does not move the first', () => {
  const one = yardPiecesFor(['fountain']);
  const two = yardPiecesFor(['fountain', 'statue']);
  assertEqual(one[0].x, two[0].x, 'the first piece moved when a second arrived');
  assertEqual(two[1].x, YARD_SLOTS[1]);
  assertEqual(one[0].y, WALK_Y, 'the yard stands on the same ground a habitat does');
});

test('every yard piece draws, at every hour, without a hole in it', () => {
  for (const hour of [0, 6, 12, 18, 23]) {
    const c = yardPalette(phaseOfHour(hour));
    for (const id of YARD_PIECE_IDS) {
      const markup = YARD_PIECES[id](c);
      assert(markup.length > 0, `${id} draws nothing`);
      assert(!markup.includes('undefined'), `${id} asks for a colour the palette has not got`);
    }
  }
});

test('an empty yard still draws — the place a fountain would go is worth seeing', () => {
  const empty = yardSvg([], { hour24: 12, label: 'zoo' });
  assert(empty.includes('<svg'), 'a child with nothing bought gets a gap');
  assertEqual((empty.match(/yard-piece"/g) ?? []).length, 0);
  assert(!empty.includes('undefined'));
});

test('a yard with pieces in it renders each of them once, at every hour', () => {
  for (const hour of [0, 9, 15, 22]) {
    const svg = yardSvg(['fountain', 'bunting', 'bogus'], { hour24: hour, label: 'zoo' });
    assertEqual((svg.match(/yard-piece"/g) ?? []).length, 2, `${hour}:00 drew the junk id`);
    assert(!svg.includes('undefined'), `${hour}:00 asks for a colour that is not there`);
  }
});

describe('coins — the long game');

test('a run of days is counted from the end, and a gap ends it', () => {
  assertEqual(streakDays([]), 0);
  assertEqual(streakDays(null), 0);
  assertEqual(streakDays(['2026-08-20', '2026-08-21', '2026-08-22']), 3);
  assertEqual(streakDays(['2026-08-01', '2026-08-21', '2026-08-22']), 2, 'a gap must end the run');
  assertEqual(streakDays(['2026-02-28', '2026-03-01']), 2, 'and it has to know the calendar');
});

test('a week of days in a row pays, and a second week pays again', () => {
  const days = (n) =>
    Array.from({ length: n }, (_, i) => new Date(Date.UTC(2026, 7, 1 + i)).toISOString().slice(0, 10));
  assertEqual(milestonesReached({}, { daysPlayed: days(6) }).join(), '', 'six days is not a week');
  assertEqual(milestonesReached({}, { daysPlayed: days(7) }).join(), 'week:1');
  assertEqual(milestonesReached({}, { daysPlayed: days(14) }).join(), 'week:1,week:2');
});

test('a tier pays again when the last of it is finished, over and above its unlock', () => {
  const items = {};
  const tier0 = tierItems(0);
  for (const item of tier0.slice(0, tier0.length - 1)) items[item.id] = { phase: 'graduated' };
  assert(!milestonesReached(items, {}).includes('mastery:0'), 'nearly is not finished');
  items[tier0[tier0.length - 1].id] = { phase: 'graduated' };
  assert(milestonesReached(items, {}).includes('mastery:0'), 'the last one paid nothing');
  assert(MASTERY_COINS > TIER_COINS, 'the stragglers must be worth more than the opening');
});

test('a species pays only once every one of its pets has hatched', () => {
  const items = {};
  const times = timesOfSpecies('mochi');
  for (const id of times.slice(0, times.length - 1)) items[id] = { hatchedAt: 1 };
  assertEqual(milestonesReached(items, {}).join(), '', 'an incomplete species paid');
  items[times[times.length - 1]] = { hatchedAt: 1 };
  assertEqual(milestonesReached(items, {}).join(), 'species:mochi');
  // An egg is not a pet: a time that has been seen but never hatched does not complete a set.
  const eggs = { ...items, [times[0]]: { hatchedAt: null } };
  assertEqual(milestonesReached(eggs, {}).join(), '', 'an unhatched egg completed a species');
});

test('what one milestone is worth, and that an unknown one is worth nothing', () => {
  assertEqual(coinsForMilestone('mastery:2'), MASTERY_COINS);
  assertEqual(coinsForMilestone('week:9'), WEEK_STREAK_COINS);
  assertEqual(coinsForMilestone('species:pip'), SPECIES_COINS);
  assertEqual(coinsForMilestone('trebuchet:1'), 0, 'a future build must not mint coins here');
  assertEqual(coinsForMilestone(undefined), 0);
});

test('a milestone is paid exactly once, however many times it is settled', () => {
  const items = {};
  for (const id of timesOfSpecies('mochi')) items[id] = { hatchedAt: 1 };
  const stats = { daysPlayed: ['2026-08-01'] };

  const first = settleMilestones(items, stats, []);
  assertEqual(first.ids.join(), 'species:mochi');
  assertEqual(first.coins, SPECIES_COINS);

  const again = settleMilestones(items, stats, first.ids);
  assertEqual(again.coins, 0, 'the same milestone paid twice');
  assertEqual(again.ids.length, 0);
});

test('a zoo that has already reached one can have it recorded without being paid for it', () => {
  // What the latch at boot does: read what is true, hand over no coins. A six-week zoo meeting
  // this build must not be handed a fortune for history it earned before the rules existed.
  const items = {};
  for (const id of timesOfSpecies('mochi')) items[id] = { hatchedAt: 1 };
  const awarded = milestonesReached(items, {});
  assertEqual(awarded.join(), 'species:mochi');
  assertEqual(settleMilestones(items, {}, awarded).coins, 0, 'the latch leaked');
});

test('a zoo starting today has nothing latched away from it', () => {
  assertEqual(milestonesReached({}, freshState(1000).stats).join(), '', 'a new zoo was written off');
});

describe('the shop — what a save has to remember');

test('a fresh zoo starts with an empty purse and no back pay yet paid', () => {
  const state = freshState(1000);
  assertEqual(state.coins, 0);
  assertEqual(state.coinsGrantedAt, 0, 'the latch must start open');
});

test('a save from before the shop backfills an empty home rather than being rejected', () => {
  const migrated = migrateItems({ '4:15': { h: 4, m: 15, reps: 2, feeds: 3, cracks: 2 } });
  assertEqual(JSON.stringify(migrated['4:15'].decor), '[]');
});

test('a hand-edited balance is pulled back to something sane on load', () => {
  withStorage((storage) => {
    const state = { ...freshState(1000), coins: -999 };
    write(state, storage);
    assertEqual(load(2000, storage).coins, 0, 'a negative balance came back');
    write({ ...freshState(1000), coins: 'lots' }, storage);
    assertEqual(load(2000, storage).coins, 0, 'a nonsense balance came back');
    write({ ...freshState(1000), coins: 61.7 }, storage);
    assertEqual(load(2000, storage).coins, 61, 'a fractional coin came back');
  });
});

test('a purse and what each pet owns both survive a save and a reload', () => {
  withStorage((storage) => {
    const state = {
      ...freshState(1000),
      coins: 137,
      items: { '4:15': { h: 4, m: 15, feeds: 1, cracks: 2, decor: ['house'], hatchedAt: 1 } },
    };
    write(state, storage);
    const back = load(2000, storage);
    assertEqual(back.coins, 137);
    assertEqual(back.items['4:15'].decor.join(), 'house');
  });
});

test('a fresh zoo starts with an empty yard and no milestone history yet read', () => {
  const state = freshState(1000);
  assertEqual(state.zooDecor.length, 0);
  assertEqual(state.milestones.length, 0);
  assertEqual(state.milestonesGrantedAt, 0, 'the latch must start open');
});

test('the yard and the milestone latch survive a save and a reload', () => {
  withStorage((storage) => {
    write(
      {
        ...freshState(1000),
        zooDecor: ['fountain', 'bunting'],
        milestones: ['week:1', 'species:mochi'],
        milestonesGrantedAt: 1000,
      },
      storage
    );
    const back = load(2000, storage);
    assertEqual(back.zooDecor.join(), 'fountain,bunting');
    assertEqual(back.milestones.join(), 'week:1,species:mochi');
    assertEqual(back.milestonesGrantedAt, 1000, 'the latch came back open');
  });
});

test('a hand-edited yard and a hand-edited latch are both pulled back to something sane', () => {
  withStorage((storage) => {
    write(
      { ...freshState(1000), zooDecor: ['fountain', 'trebuchet', 'house'], milestones: ['ok', 7, null] },
      storage
    );
    const back = load(2000, storage);
    assertEqual(back.zooDecor.join(), 'fountain', 'a piece this build cannot draw reached the yard');
    assertEqual(back.milestones.join(), 'ok', 'a milestone that is not an id got in');
    write({ ...freshState(1000), zooDecor: 'fountain', milestones: 'week:1' }, storage);
    const junk = load(2000, storage);
    assertEqual(junk.zooDecor.length, 0, 'a string is not a yard');
    assertEqual(junk.milestones.length, 0, 'a string is not a list of milestones');
  });
});

test('a save written by the build before this one loads with everything it had intact', () => {
  withStorage((storage) => {
    // Exactly the shape the shipped shop wrote: v1, a balance, its back pay already paid, two
    // ground pieces — and no idea that a yard or a milestone was ever going to exist.
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: VERSION,
        tier: 2,
        coins: 210,
        coinsGrantedAt: 500,
        settings: { language: 'nb' },
        stats: { totalAnswered: 40, totalCorrect: 33, streak: 3, bestStreak: 9, daysPlayed: [] },
        items: { '4:15': { h: 4, m: 15, feeds: 3, cracks: 2, decor: ['house', 'lantern'], hatchedAt: 1 } },
      })
    );
    const back = load(2000, storage);
    assertEqual(back.coins, 210, 'an existing purse was emptied by the upgrade');
    assertEqual(back.tier, 2);
    assertEqual(back.items['4:15'].decor.join(), 'house,lantern', 'bought furniture was lost');
    assertEqual(back.settings.language, 'nb');
    assertEqual(back.zooDecor.length, 0, 'a yard was invented');
    assertEqual(back.milestones.length, 0);
    // And the milestone latch is still open, so the history is read — not paid for — at boot.
    assertEqual(back.milestonesGrantedAt, 0, 'the history would never be read');
  });
});

describe('the shop — coins cross between devices');

test('the yard and the milestone latch travel with the zoo', () => {
  const state = {
    ...freshState(1000),
    coins: 90,
    zooDecor: ['fountain', 'signpost'],
    milestones: ['week:2'],
    items: { '4:15': { h: 4, m: 15, feeds: 1, cracks: 0, decor: ['farTower'], hatchedAt: 1 } },
  };
  const arrived = applyImport(freshState(5000), exportPayload(state, 2000), 5000);
  assertEqual(arrived.zooDecor.join(), 'fountain,signpost');
  assertEqual(arrived.items['4:15'].decor.join(), 'farTower', 'the hill line did not travel');
  assertEqual(arrived.milestones.join(), 'week:2');
  // A save that lists its milestones has had them read already, so the receiving device must
  // not read them again — that is what would pay a second time for the same week.
  assertEqual(arrived.milestonesGrantedAt, 5000, 'the latch arrived open');
});

test('a save from before the yard arrives with the latch still open', () => {
  const payload = exportPayload(freshState(1000), 2000);
  delete payload.milestones;
  delete payload.zooDecor;
  const arrived = applyImport(freshState(5000), payload, 5000);
  assertEqual(arrived.zooDecor.length, 0);
  assertEqual(arrived.milestonesGrantedAt, 0, 'its history would never be read');
});

test('a hand-edited file cannot smuggle a piece into the yard', () => {
  const payload = exportPayload(freshState(1000), 2000);
  payload.zooDecor = ['fountain', 'trebuchet', 'house'];
  payload.milestones = ['week:1', 42];
  const arrived = applyImport(freshState(5000), payload, 5000);
  assertEqual(arrived.zooDecor.join(), 'fountain');
  assertEqual(arrived.milestones.join(), 'week:1');
});

test('a balance and the furniture travel with the zoo', () => {
  const state = {
    ...freshState(1000),
    coins: 88,
    items: { '4:15': { h: 4, m: 15, feeds: 1, cracks: 2, decor: ['house'], hatchedAt: 1 } },
  };
  const payload = exportPayload(state, 2000);
  assertEqual(payload.coins, 88, 'a balance left behind is a balance lost');
  const arrived = applyImport(freshState(3000), JSON.parse(payloadToJson(payload)), 3000);
  assertEqual(arrived.coins, 88);
  assertEqual(arrived.items['4:15'].decor.join(), 'house');
});

test('a save that already carries a balance is not paid its back pay twice', () => {
  const payload = { ...exportPayload({ ...freshState(1000), coins: 40 }, 2000) };
  assertEqual(applyImport(freshState(3000), payload, 3000).coinsGrantedAt, 3000, 'the latch must be down');
});

test('a save from before the shop arrives with its back pay still owing', () => {
  const payload = exportPayload(freshState(1000), 2000);
  delete payload.coins;
  const arrived = applyImport(freshState(3000), payload, 3000);
  assertEqual(arrived.coins, 0);
  assertEqual(arrived.coinsGrantedAt, 0, 'an old zoo would have lost every coin it had earned');
});

test('a hand-edited file cannot import a fortune or a piece this build cannot draw', () => {
  const payload = exportPayload(freshState(1000), 2000);
  payload.coins = -1;
  assertEqual(applyImport(freshState(3000), payload, 3000).coins, 0);
  const smuggled = cleanItems({
    '4:15': { h: 4, m: 15, feeds: 1, cracks: 2, decor: ['house', 'trebuchet'], hatchedAt: 1 },
  });
  assertEqual(smuggled['4:15'].decor.join(), 'house');
});


/* ------------------------------------------------------------------ subjects */

describe('subjects — one zoo, more than one thing to learn');

test('an id is claimed by exactly the subject that owns it', () => {
  assertEqual(subjectIdOf('4:15'), 'clock');
  assertEqual(subjectIdOf('12:55'), 'clock');
  assertEqual(subjectIdOf('add:3+5'), null, 'a subject this build lacks claims nothing');
  assertEqual(subjectIdOf('nonsense'), null);
  assertEqual(subjectIdOf(undefined), null, 'and a missing id does not throw');
});

test('the clock refuses ids that merely look like times', () => {
  assert(clockSubject.owns('9:05'), '9:05 is a time');
  assert(!clockSubject.owns('13:00'), 'there is no thirteen on this face');
  assert(!clockSubject.owns('0:30'), 'nor a zero');
  assert(!clockSubject.owns('4:5'), 'nor an unpadded minute');
  assert(!clockSubject.owns('add:4:15'), 'and a prefix is not a time');
});

test('a tier map is read from either the new shape or the old scalar', () => {
  assertEqual(tiersOf({ tiers: { clock: 3 } }).clock, 3, 'the current shape');
  assertEqual(tiersOf({ tier: 2 }).clock, 2, 'a save written before subjects existed');
  assertEqual(tiersOf({}).clock, 0, 'and a state carrying neither');
  assertEqual(tiersOf(null).clock, 0, 'and no state at all');
});

test('a hand-edited tier cannot unlock material by being absurd', () => {
  assertEqual(tiersOf({ tiers: { clock: -5 } }).clock, 0, 'negative is floored');
  assertEqual(tiersOf({ tiers: { clock: 1.7 } }).clock, 1, 'fractional is truncated');
  assertEqual(tiersOf({ tiers: { clock: 'lots' } }).clock, 0, 'and nonsense is nothing');
  assertEqual(tiersOf({ tiers: { chemistry: 9 } }).clock, 0, 'a subject we lack is ignored');
});

test('new material is interleaved between subjects, not concatenated', () => {
  assertEqual(interleave([['a', 'b', 'c'], [1, 2]]).join(), 'a,1,b,2,c');
  assertEqual(interleave([[], [1, 2]]).join(), '1,2', 'a subject with nothing left drops out');
  assertEqual(interleave([]).length, 0);
});

test('unseen material stops at the tier a subject has unlocked', () => {
  const heads = unseenAcrossSubjects({}, { clock: 0 });
  assert(heads.length > 0, 'a fresh zoo has everything to learn');
  assert(heads.every((entry) => entry.tier === 0), 'and nothing above the unlocked tier');
  assert(heads.every((entry) => entry.subject === 'clock'), 'each one knows its subject');
});

test('a seen item is never offered as new again', () => {
  const first = unseenAcrossSubjects({}, { clock: 0 })[0];
  const after = unseenAcrossSubjects({ [first.id]: { phase: 'learning' } }, { clock: 0 });
  assert(!after.some((entry) => entry.id === first.id), 'it came back around');
});

test('the zoo counts every subject it teaches', () => {
  const total = SUBJECT_IDS.reduce((sum, id) => sum + (id === 'clock' ? 144 : 0), 0);
  assertEqual(totalItemCount(), total, 'the hardcoded 144 is gone, not merely moved');
});

test('a tier opens for one subject without opening another', () => {
  const items = {};
  for (const entry of unseenAcrossSubjects({}, { clock: 0 })) {
    items[entry.id] = { subject: 'clock', phase: 'graduated' };
  }
  const { tiers, unlocked } = refreshTiers({ items, tiers: { clock: 0 } });
  assertEqual(tiers.clock, 1, 'finishing tier 0 opens tier 1');
  assertEqual(unlocked.join(), 'clock', 'and names the subject that moved');
});

test('a tier already earned is never taken back', () => {
  const { tiers, unlocked } = refreshTiers({ items: {}, tiers: { clock: 3 } });
  assertEqual(tiers.clock, 3, 'an empty zoo does not demote a save');
  assertEqual(unlocked.length, 0, 'and standing still is not an unlock');
});

/* ------------------------------------------------- saves across a schema change */

describe('saves — upgraded, never discarded');

/** A save exactly as the single-subject build wrote it. */
const v1Save = () => ({
  version: 1,
  createdAt: 100,
  lastPlayedAt: 200,
  reviewClock: 42,
  tier: 2,
  coins: 37,
  zooDecor: [],
  milestones: ['mastery:0'],
  coinsGrantedAt: 1,
  milestonesGrantedAt: 1,
  settings: { sound: false, language: 'en', playMinutes: 7, showDigital: true },
  session: { startedAt: 0, answered: 0, correct: 0, napUntil: 0 },
  stats: { totalAnswered: 90, totalCorrect: 70, streak: 4, bestStreak: 9, daysPlayed: [] },
  items: {
    '4:15': { h: 4, m: 15, species: 'fizz', phase: 'graduated', feeds: 5, cracks: 2, decor: [], hatchedAt: 123 },
    '1:00': { h: 1, m: 0, species: 'mochi', phase: 'learning', reps: 0, correctStreak: 3, hatchedAt: null },
  },
});

const savedAs = (blob) => {
  const storage = fakeStorage();
  storage.setItem(STORAGE_KEY, JSON.stringify(blob));
  return storage;
};

test('a save written before subjects existed keeps its whole zoo', () => {
  const back = load(9999, savedAs(v1Save()));
  assertEqual(Object.keys(back.items).length, 2, 'the pets are still there');
  assertEqual(back.items['4:15'].feeds, 5, 'and so is what they had earned');
  assertEqual(back.reviewClock, 42);
  assertEqual(back.coins, 37);
  assertEqual(back.version, VERSION, 'and it comes back at the current version');
});

test('the clock tier a v1 save had earned survives as a per-subject tier', () => {
  const back = load(0, savedAs(v1Save()));
  assertEqual(back.tiers.clock, 2, 'the scalar became the clock');
  assertEqual(back.tier, undefined, 'and the scalar itself is gone');
});

test('every pet in an upgraded save learns which subject it belongs to', () => {
  const back = load(0, savedAs(v1Save()));
  assertEqual(back.items['4:15'].subject, 'clock');
  assertEqual(back.items['1:00'].subject, 'clock');
});

test('a save from a future build is refused rather than half-read', () => {
  const back = load(0, savedAs({ ...v1Save(), version: VERSION + 1 }));
  assertEqual(back.reviewClock, 0, 'it started fresh instead of guessing');
});

test('a save with no version at all is not trusted', () => {
  const { version, ...unversioned } = v1Save();
  assertEqual(load(0, savedAs(unversioned)).reviewClock, 0);
});

test('upgrading is idempotent — a current save passes through untouched', () => {
  const current = { ...freshState(0), reviewClock: 7 };
  assertEqual(upgrade(current), current, 'it was needlessly rebuilt');
});

test('an item whose subject this build does not know is dropped, not carried', () => {
  const save = v1Save();
  save.items['chem:H2O'] = { phase: 'learning', hatchedAt: null };
  const back = load(0, savedAs(save));
  assertEqual(Object.keys(back.items).sort().join(), '1:00,4:15', 'the pet we cannot draw is gone');
});

test('a file carrying an unknown subject loses only that item', () => {
  const kept = cleanItems({
    '4:15': { h: 4, m: 15, hatchedAt: 1 },
    'add:3+5': { a: 3, b: 5, hatchedAt: 1 },
  });
  assertEqual(Object.keys(kept).join(), '4:15', 'the rest of the zoo still lands');
});

/* --------------------------------------------------- scheduling across subjects */

describe('scheduling — two subjects sharing one session');

test('a new item is stamped with the subject that owns it', () => {
  const item = createItem({ subject: 'clock', h: 4, m: 15, tier: 2, species: 'fizz' });
  assertEqual(item.subject, 'clock');
  assertEqual(item.tier, 2, 'the subject supplied the tier');
  assertEqual(item.h, 4, 'and the payload still reads off the top level');
});

test('an item built the old way is still a clock item', () => {
  const item = createItem({ h: 9, m: 30, species: 'fizz' });
  assertEqual(item.subject, 'clock', 'the default holds for saves and older call sites');
  assertEqual(item.tier, 1, 'and the tier is still derived when nobody supplies one');
});

test('the id an item is filed under is not copied into the item', () => {
  const item = createItem({ id: '4:15', h: 4, m: 15, species: 'fizz' });
  assert(!('id' in item), 'two sources of truth for one id');
});

test('two subjects due at once alternate rather than repeat', () => {
  // The scheduler only ever reads `item.subject`, so a second subject can be simulated
  // here before its curriculum exists.
  const due = (subject, dueStep) => ({ subject, phase: 'learning', dueStep, seen: 0, dueAt: 0 });
  const state = {
    reviewClock: 10,
    tiers: { clock: 0 },
    items: {
      '4:15': due('clock', 1),
      '9:30': due('clock', 2),
      'add:3+5': due('add', 3),
    },
  };
  assertEqual(
    nextItem(state, { now: 0, lastSubject: 'clock' }),
    'add:3+5',
    'after a clock question, the sum wins even though it is less overdue'
  );
  assertEqual(
    nextItem(state, { now: 0, lastSubject: 'add' }),
    '4:15',
    'and after a sum, the most overdue clock face comes back'
  );
});

test('alternating never overrides urgency within one subject', () => {
  const due = (subject, dueStep) => ({ subject, phase: 'learning', dueStep, seen: 0, dueAt: 0 });
  const state = {
    reviewClock: 10,
    tiers: { clock: 0 },
    items: { '4:15': due('clock', 5), '9:30': due('clock', 1) },
  };
  assertEqual(
    nextItem(state, { now: 0, lastSubject: 'clock' }),
    '9:30',
    'with nothing to alternate to, the longest overdue still wins'
  );
});

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
