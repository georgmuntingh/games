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
  GRIP_REACH,
  HOUR_REACH,
  MINUTE_REACH,
  PIN_DEAD_ZONE,
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
  applyPractice,
  hungryCount,
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
  admireFor,
  ADMIRE_SECONDS_DEFAULT,
  ADMIRE_SECONDS_MAX,
  ADMIRE_SECONDS_MIN,
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
import { FEATURE_COUNT, featuresOf, FEATURE_NAMES, holesOf } from '../ink/features.js';
import { logits, parameterCount } from '../ink/model.js';
import { centreOfMass, rasterize, SIZE as INK_SIZE, toAscii } from '../ink/raster.js';
import { mirror, recognize, UNSURE_BELOW } from '../ink/recognize.js';
import { CAPACITY, recall, remember, sanitize as sanitizeMemory } from '../ink/memory.js';
import { bounds as inkBounds, dedupe, hasInk, resample } from '../ink/strokes.js';
import { CASES } from './ink-fixtures.js';
import * as addSubject from '../subjects/math/index.js';
import * as mathFacts from '../subjects/math/facts.js';
import * as mathSkills from '../subjects/math/skills.js';
import * as mathColumns from '../subjects/math/columns.js';
import * as mathTimes from '../subjects/math/times.js';
import * as mathDivFacts from '../subjects/math/divfacts.js';
import * as mathDivide from '../subjects/math/divide.js';
import { columnIngredients, mulWalkHtml, stackedMulMarkup } from '../column.js';
import { ALL_VERDICTS, gradeDivide } from '../subjects/math/grade.js';
import { arrayPlan, arraySvg } from '../array.js';
import { dividedMarkup, divideWalkHtml, ingredientsFor, spanOf, stepOfRow, walkCols } from '../divwalk.js';
import { sharePlan, shareSvg } from '../share.js';
import {
  columnWalkHtml,
  DEFAULT_WALK_SPEED,
  isWalkSpeed,
  stepFor,
  walkDuration,
  WALK_SPEEDS,
  walkSpeedAt,
  walkSpeedIndex,
  walkSteps,
  walkWidth,
} from '../column.js';
import * as clockSubject from '../subjects/clock.js';
import { fillDuration, fillPlan, FRAME, takeAwayPlan, tenFrameSvg } from '../tenframe.js';
import {
  interleave,
  refreshTiers,
  SUBJECT_IDS,
  subjectIdOf,
  tiersOf,
  totalItemCount,
  unseenItems as unseenAcrossSubjects,
  shapesFor,
  DEFAULT_PRACTICE,
  enabledItemCount,
  enabledSubjects,
  floorOf,
  isResting,
  practiceOf,
  unlockedTier as unlockedTierOf,
  tierMastery as tierMasteryOf,
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
  eggLookFrom,
  eggMarksFor,
  eggSvg,
  shellHalfWidth,
  isCrowned,
  LOUD_FAMILIES,
  MARKING_IDS,
  moodOf,
  petName,
  petSvg,
  speciesAppearance,
  speciesFor,
  speciesForFact,
  factsOfSpecies,
  itemsOfSpecies,
  portraitOf,
  SPECIES_IDS,
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
  PET_FOOT,
  PET_SIZE,
  phaseOfHour,
  PHASE_IDS,
  ROAM,
  rndFrom,
  SAFE,
  SCENERY_IDS,
  TREAT_IDS,
  UMBRELLA_HALF_WIDTH,
  UMBRELLA_PEAK,
  UMBRELLA_TOP,
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
  dayFraction,
  DEFAULT_WEATHER,
  groundSoak,
  isWeather,
  NIGHT_VEIL,
  prevStamp,
  shelters,
  slows,
  veilFor,
  WEATHER_IDS,
  WEATHERS,
  weatherFor,
  weatherForDay,
  WEIGHTS,
} from '../weather.js';
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
  EGG_PATTERNS,
  EGG_SHAPES,
  EGG_SIZES,
  EGG_TINTS,
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
  numberWord as numberWordOf,
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


describe('clock — grabbing the hand you are pointing at');

// The face as main.js actually draws it. The picker measures segments, so the lengths are
// part of the question rather than a detail of the rendering.
const FACE = { radius: 180, hourLen: 100, minuteLen: 150 };

/** A point `frac` of the way out along a heading, in the same units as the face. */
const alongHand = (deg, dist) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { dx: Math.cos(rad) * dist, dy: Math.sin(rad) * dist };
};

const grab = (deg, dist, hourDeg, minuteDeg) =>
  pickHand({ ...alongHand(deg, dist), ...FACE, hourDeg, minuteDeg });

test('a finger on the minute hand grabs the minute hand, however far in it is', () => {
  // The bug this replaced: the hour hand's tip sits at 0.56 of the radius, and the old rule
  // handed back the hour hand for *anything* closer in than that — so most of the face could
  // not be used to grab the minute hand at all.
  const minuteDeg = 0; // straight up
  const hourDeg = 90; // and the hour hand well out of the way, at the 3
  for (const frac of [0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.6, 0.7, 0.8]) {
    assertEqual(
      grab(minuteDeg, FACE.radius * frac, hourDeg, minuteDeg),
      'minute',
      `dead on the minute hand at ${frac} of the radius`
    );
  }
});

test('and a finger on the hour hand still grabs the hour hand', () => {
  const hourDeg = 90;
  const minuteDeg = 0;
  for (const frac of [0.2, 0.3, 0.4, 0.5, 0.55]) {
    assertEqual(
      grab(hourDeg, FACE.radius * frac, hourDeg, minuteDeg),
      'hour',
      `dead on the hour hand at ${frac} of the radius`
    );
  }
  // The hour hand only reaches 0.56 of the radius, so a grab further out than its own tip is
  // covered by the reach test below rather than here.
});

test('walking out along either hand never changes its mind, at any time on the clock', () => {
  for (let h = 1; h <= 12; h += 1) {
    for (const m of [0, 10, 25, 40, 55]) {
      const hourDeg = hourAngle(h, m);
      const minuteDeg = minuteAngle(m);
      // Only where the hands are far enough apart for "along this one" to mean anything.
      if (angularDistance(hourDeg, minuteDeg) < 25) continue;
      // Starting clear of the dead zone at the pin, where no angle means anything: the hour
      // hand is short enough that a quarter of the way along it is still inside the pin.
      for (const frac of [0.4, 0.6, 0.8]) {
        assertEqual(
          grab(minuteDeg, FACE.minuteLen * frac, hourDeg, minuteDeg),
          'minute',
          `${h}:${m} along the minute hand`
        );
        assertEqual(
          grab(hourDeg, FACE.hourLen * frac, hourDeg, minuteDeg),
          'hour',
          `${h}:${m} along the hour hand`
        );
      }
      // And right out at each tip, which is where the grips are drawn.
      assertEqual(grab(minuteDeg, FACE.minuteLen, hourDeg, minuteDeg), 'minute', `${h}:${m} minute tip`);
      assertEqual(grab(hourDeg, FACE.hourLen, hourDeg, minuteDeg), 'hour', `${h}:${m} hour tip`);
    }
  }
});

test('a hand cannot be grabbed by the empty line beyond its own tip', () => {
  const hourDeg = 0;
  const minuteDeg = 90;
  const grip = FACE.radius * GRIP_REACH;
  // Just inside the grip drawn at the tip: still the hour hand.
  assertEqual(grab(hourDeg, FACE.hourLen + grip * 0.5, hourDeg, minuteDeg), 'hour');
  // Past it: there is nothing there, so the only hand in the running is the other one.
  assertEqual(grab(hourDeg, FACE.hourLen + grip * 1.5, hourDeg, minuteDeg), 'minute');
  assertEqual(grab(hourDeg, FACE.radius * 0.95, hourDeg, minuteDeg), 'minute');
});

test('stacked hands are told apart by how far out the grab is', () => {
  // At 12:00 both hands point the same way and the distances are equal — mathematically
  // zero, and in floating point two different zeroes — so only the radius is left.
  for (let h = 1; h <= 12; h += 1) {
    const deg = hourAngle(h, 0);
    assertEqual(grab(deg, FACE.hourLen * 0.5, deg, deg), 'hour', `${h}:00 low on the stack`);
    assertEqual(grab(deg, FACE.minuteLen * 0.9, deg, deg), 'minute', `${h}:00 high on the stack`);
  }
});

test('the pin and the rim are unchanged', () => {
  const face = { ...FACE, hourDeg: 0, minuteDeg: 90 };
  assertEqual(pickHand({ dx: 0, dy: -FACE.radius * (PIN_DEAD_ZONE - 0.02), ...face }), null, 'inside the pin');
  assert(pickHand({ dx: 0, dy: -FACE.radius * (PIN_DEAD_ZONE + 0.02), ...face }) !== null, 'and just outside it');
  assertEqual(pickHand({ dx: 0, dy: -FACE.radius * 1.3, ...face }), null, 'off the face');
});

test('a grab in the middle of nowhere still picks the nearer hand up', () => {
  // Forgiving on purpose: a mis-reach that did nothing at all would read as a broken game.
  const picked = grab(200, FACE.radius * 0.9, 0, 90);
  assert(picked === 'hour' || picked === 'minute', 'a tap on the empty face grabbed nothing');
});

test('the lengths default to the proportions the face is drawn at', () => {
  // Two callers pass the real pixel lengths; anything that does not should still be measuring
  // a clock rather than a guess at one.
  assertClose(HOUR_REACH * 180, 100, 1e-9, 'the hour hand');
  assertClose(MINUTE_REACH * 180, 150, 1e-9, 'the minute hand');
  assertEqual(
    pickHand({ ...alongHand(0, 72), radius: 180, hourDeg: 90, minuteDeg: 0 }),
    'minute',
    'the defaults disagree with the face'
  );
});

describe('a moment to look at a new pet');

test('a hatch is held for three seconds, an evolve a little less', () => {
  const times = admireFor(ADMIRE_SECONDS_DEFAULT);
  assertEqual(times.hatchMs, 3000);
  assertEqual(times.evolveMs, 2500);
  assert(times.evolveMs < times.hatchMs, 'an evolve should be the shorter of the two');
});

test('the beat is a grown-up choice, and it is clamped at both ends', () => {
  assertEqual(admireFor(ADMIRE_SECONDS_MAX + 10).seconds, ADMIRE_SECONDS_MAX);
  assertEqual(admireFor(0).seconds, ADMIRE_SECONDS_MIN);
  assertEqual(admireFor(-5).seconds, ADMIRE_SECONDS_MIN);
  assertEqual(admireFor(4.5).seconds, 4.5, 'a half second is a real choice');
});

test('a pause is never NaN, however odd the number handed in', () => {
  // The one failure that matters here: a pause of NaN would leave a child looking at a pet
  // forever, waiting for a question that never comes.
  for (const odd of [undefined, null, 'ages', {}, NaN, Infinity]) {
    const times = admireFor(odd);
    assert(Number.isFinite(times.hatchMs) && times.hatchMs > 0, `hatch beat for ${String(odd)}`);
    assert(Number.isFinite(times.evolveMs) && times.evolveMs > 0, `evolve beat for ${String(odd)}`);
  }
  assertEqual(admireFor(undefined).seconds, ADMIRE_SECONDS_DEFAULT);
});

test('the evolve beat never drops below the floor, however short the setting', () => {
  assertEqual(admireFor(ADMIRE_SECONDS_MIN).evolveMs, ADMIRE_SECONDS_MIN * 1000);
  assert(admireFor(1.5).evolveMs >= ADMIRE_SECONDS_MIN * 1000);
});

test('the setting survives a reload, and a hand-edited one is clamped', () => {
  const storage = fakeStorage();
  write({ ...freshState(0), settings: { ...freshState(0).settings, admireSeconds: 6 } }, storage);
  assertEqual(load(0, storage).settings.admireSeconds, 6);
  write({ ...freshState(0), settings: { ...freshState(0).settings, admireSeconds: 'ages' } }, storage);
  assertEqual(load(0, storage).settings.admireSeconds, ADMIRE_SECONDS_DEFAULT, 'nonsense was trusted');
});

test('a save written before the beat existed picks it up', () => {
  const storage = fakeStorage();
  const { admireSeconds, ...older } = freshState(0).settings;
  write({ ...freshState(0), settings: older }, storage);
  assertEqual(load(0, storage).settings.admireSeconds, ADMIRE_SECONDS_DEFAULT);
});

test('it is named and explained in both languages', () => {
  for (const lang of ['nb', 'en']) {
    const t = translator(lang);
    for (const key of ['settings.admire', 'settings.admireValue', 'settings.admireHelp']) {
      assert(t(key) !== key, `${lang} is missing ${key}`);
    }
  }
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
  const shared = new Set(['unlock.copy', 'coins.earned', 'shop.statue', 'habitat.ariaWeather']);
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
  const item = { subject: 'clock', h: 4, m: 15, reps: 0, feeds: 5, cracks: 2, decor: [], covered: [], hatchedAt: 1 };
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

/* -------------------------------------------------------------- weather */

describe('weather — one sky over the whole zoo');

// A year and a half of days, walked without a Date: the module never sees one, and neither
// should the test that holds it to a distribution.
const walkDays = (from, count) => {
  const out = [];
  let stamp = from;
  for (let i = 0; i < count; i += 1) {
    out.push(stamp);
    stamp = nextStamp(stamp);
  }
  return out;
};

// prevStamp's inverse, written out here rather than exported: a test that steps forward with
// the same arithmetic it is checking backwards would agree with itself about a bug.
function nextStamp(stamp) {
  const at = new Date(`${stamp}T12:00:00Z`);
  return new Date(at.getTime() + 86400000).toISOString().slice(0, 10);
}

const YEARS = walkDays('2020-01-01', 3000);

test('the same date always gives the same sky, so two devices agree without syncing', () => {
  for (const stamp of ['2026-09-03', '2019-02-28', '2400-12-31']) {
    assertEqual(weatherFor(stamp), weatherFor(stamp), `${stamp} is not deterministic`);
    assertEqual(weatherForDay(stamp), weatherForDay(stamp), `${stamp} is not deterministic`);
  }
});

test('every day names a weather this build can actually draw', () => {
  for (const stamp of YEARS) {
    assert(isWeather(weatherFor(stamp)), `${stamp} produced a weather that does not exist`);
  }
  assert(isWeather(DEFAULT_WEATHER), 'the fallback must itself be real');
  assert(!isWeather('drizzle') && !isWeather(''), 'and nothing else counts');
});

test('fair weather is the rule and the rest is the exception', () => {
  const seen = {};
  for (const stamp of YEARS) {
    const kind = weatherForDay(stamp);
    seen[kind] = (seen[kind] ?? 0) + 1;
  }
  for (const [kind, weight] of Object.entries(WEIGHTS)) {
    const share = ((seen[kind] ?? 0) / YEARS.length) * 100;
    assertClose(share, weight, 3, `${kind} turns up ${share.toFixed(1)}% of days, not ${weight}%`);
  }
  assert(!seen.rainbow, 'a rainbow is earned by yesterday, never rolled for');
});

test('consecutive days are independent — the sky does not walk through the table', () => {
  // The reason weather.js scrambles the hash. djb2 on two dates a day apart differs by one,
  // so without the avalanche this comes out near 100% and the zoo gets a week of snow in a
  // row. Independent weights predict about 26%.
  let same = 0;
  for (let i = 1; i < YEARS.length; i += 1) {
    if (weatherForDay(YEARS[i]) === weatherForDay(YEARS[i - 1])) same += 1;
  }
  const share = (same / (YEARS.length - 1)) * 100;
  assert(share > 18 && share < 34, `${share.toFixed(1)}% of days repeat yesterday — not independent`);
});

test('a rainbow only ever follows rain, and stays rare', () => {
  let bows = 0;
  for (const stamp of YEARS) {
    if (weatherFor(stamp) !== 'rainbow') continue;
    bows += 1;
    assertEqual(
      weatherForDay(prevStamp(stamp)),
      'rain',
      `${stamp} put a rainbow up after a dry day`
    );
  }
  const share = (bows / YEARS.length) * 100;
  assert(share > 2 && share < 9, `rainbows on ${share.toFixed(1)}% of days — too ${share > 9 ? 'common' : 'rare'}`);
});

test('yesterday is arithmetic, not a subtracted day — leap years and year ends included', () => {
  assertEqual(prevStamp('2026-03-01'), '2026-02-28');
  assertEqual(prevStamp('2024-03-01'), '2024-02-29', 'a leap year has a 29th');
  assertEqual(prevStamp('1900-03-01'), '1900-02-28', 'and a century that is not a leap year does not');
  assertEqual(prevStamp('2000-03-01'), '2000-02-29', 'but a four-hundredth does');
  assertEqual(prevStamp('2026-01-01'), '2025-12-31');
  for (const stamp of YEARS.slice(1)) {
    assertEqual(nextStamp(prevStamp(stamp)), stamp, `${stamp} did not survive a round trip`);
  }
});

test('a stamp it cannot read costs a rainbow and nothing else', () => {
  for (const junk of ['', 'yesterday', '2026-13', null, undefined]) {
    assertEqual(prevStamp(junk), String(junk), 'rubbish should come back unchanged');
    assert(isWeather(weatherFor(junk)), 'and still name a real weather');
  }
});

describe('weather — the ground remembers, and stores nothing');

test('wet ground builds through the day and then holds', () => {
  let last = -1;
  for (let i = 0; i <= 100; i += 1) {
    const soak = groundSoak('rain', i / 100);
    assert(soak >= last, `soak went backwards at ${i}%`);
    assert(soak >= 0 && soak <= 1, `soak of ${soak} is outside 0..1`);
    last = soak;
  }
  assertEqual(groundSoak('rain', 0), 0, 'the day starts dry');
  assertEqual(groundSoak('rain', 1), 1, 'and ends as wet as it gets');
});

test('a dry sky never wets the ground, whatever the hour', () => {
  for (const kind of ['clear', 'cloudy']) {
    for (let i = 0; i <= 20; i += 1) {
      assertEqual(groundSoak(kind, i / 20), 0, `${kind} left a puddle`);
    }
  }
  assertEqual(groundSoak('nonsense', 0.5), 0, 'and an unknown weather leaves none either');
});

test('the day fraction runs midnight to midnight and clamps', () => {
  assertEqual(dayFraction(0, 0), 0);
  assertEqual(dayFraction(12, 0), 0.5);
  assert(dayFraction(23, 59) < 1 && dayFraction(23, 59) > 0.99);
  assert(dayFraction(-5, -5) >= 0 && dayFraction(99, 99) <= 1, 'rubbish hours must still land in 0..1');
});

describe('weather — a child can still see their pet');

test('no weather may darken a habitat the way night already has', () => {
  for (const kind of WEATHER_IDS) {
    const day = Number(veilFor(kind, false).match(/([\d.]+)\)$/)[1]);
    const night = Number(veilFor(kind, true).match(/([\d.]+)\)$/)[1]);
    assertClose(night, day * NIGHT_VEIL, 1e-9, `${kind} does not weaken at night`);
    assert(day <= 0.25, `${kind} lays on a veil of ${day} — too heavy to see a pet through`);
  }
});

test('the falling layers stay thin enough to see through', () => {
  for (const kind of WEATHER_IDS) {
    const fall = WEATHERS[kind].fall;
    if (!fall) continue;
    assert(fall.count <= 50, `${kind} drops ${fall.count} pieces — a curtain, not weather`);
    assert(fall.dur[0] > 0 && fall.dur[1] >= fall.dur[0], `${kind} has a nonsense duration`);
  }
});

test('a weather habitat still draws its pet, its ball and its larder', () => {
  const h = habitatFor(4, 15);
  for (const kind of WEATHER_IDS) {
    const svg = habitatSvg(h, { uid: 'u', weather: kind, soak: 1 });
    assert(svg.includes('hab-actors'), `${kind} lost the layer the pet stands in`);
    assert(svg.includes('hab-back'), `${kind} lost the ball and the larder`);
    assert(!svg.includes('undefined') && !svg.includes('NaN'), `${kind} drew a hole`);
  }
});

describe('weather — drawn over every home there is');

test('a habitat with no weather draws exactly what it drew before weather existed', () => {
  // The load-bearing one. Every other habitat assertion in this file calls habitatSvg without
  // a weather, so if this ever stops holding they all start testing something else.
  for (const h of EVERY_HABITAT.slice(0, 24)) {
    const bare = habitatSvg(h, { uid: 'u' });
    assertEqual(bare, habitatSvg(h, { uid: 'u', weather: null }), `${h.id} differs on an explicit null`);
    assert(!/hab-weather|hab-fall|hab-wet|hab-shelter/.test(bare), `${h.id} drew weather it was not given`);
  }
});

test('every weather draws over every biome and every hour without a hole in it', () => {
  for (const h of EVERY_HABITAT) {
    for (const kind of WEATHER_IDS) {
      const svg = habitatSvg(h, { uid: 'u', weather: kind, soak: 0.6 });
      assert(svg.length > 1500, `${h.id} in ${kind} came out empty`);
      assert(!svg.includes('undefined'), `${h.id} in ${kind} has an undefined in it`);
    }
  }
});

test('the same day draws the same habitat twice — weather is generated, never stored', () => {
  const h = habitatFor(4, 15);
  for (const kind of WEATHER_IDS) {
    assertEqual(
      habitatSvg(h, { uid: 'u', weather: kind, soak: 0.4 }),
      habitatSvg(h, { uid: 'u', weather: kind, soak: 0.4 }),
      `${kind} is not deterministic`
    );
  }
});

test('a rubbish weather is ignored rather than drawn', () => {
  const h = habitatFor(4, 15);
  const bare = habitatSvg(h, { uid: 'u' });
  for (const junk of ['storm', '', 42, {}]) {
    assertEqual(habitatSvg(h, { uid: 'u', weather: junk }), bare, `${junk} should have been ignored`);
  }
});

describe('weather — somewhere to shelter');

test('only the weathers worth hiding from put an umbrella out', () => {
  assert(shelters('rain') && shelters('hail'), 'rain and hail are what a pet shelters from');
  for (const kind of ['clear', 'cloudy', 'fog', 'snow', 'rainbow']) {
    assert(!shelters(kind), `${kind} should not need an umbrella`);
  }
  assert(slows('fog') && slows('snow'), 'and fog and snow are what it dawdles through');
  assert(!slows('rain') && !slows('clear'), 'while rain is hurried through, not dawdled in');

  const h = habitatFor(4, 15);
  for (const kind of WEATHER_IDS) {
    assertEqual(
      habitatSvg(h, { uid: 'u', weather: kind }).includes('hab-shelter'),
      shelters(kind),
      `${kind} drew the wrong thing about umbrellas`
    );
  }
});

test('the umbrella stands clear of everything, in every home, whatever has been bought', () => {
  const combos = [[], ['stump'], ['house', 'pond'], ['swing', 'feeder'], ['arch', 'windmill']];
  for (const entry of ALL_ITEMS) {
    for (const decor of combos) {
      const h = habitatOf({ h: entry.h, m: entry.m, decor });
      const x = h.shelter.x;
      // Reachable: the pet has to be able to walk under it, which is the whole point.
      assert(x >= ROAM.x0 && x <= ROAM.x1, `${h.id} put the umbrella outside the roam band`);
      // Whole: the canopy overhangs the roam band but must never be cropped.
      assert(
        x - UMBRELLA_HALF_WIDTH >= SAFE.x0 && x + UMBRELLA_HALF_WIDTH <= SAFE.x1,
        `${h.id} would lose the side of its umbrella on a narrow screen`
      );
      // And out of the middle, which belongs to the pet.
      assert(x < CENTRE_KEEP.x0 || x > CENTRE_KEEP.x1, `${h.id} put the umbrella in the pet's way`);
      const busy = [
        h.props.nest.x,
        h.props.larder.x,
        h.props.ball.x,
        h.home.x,
        ...h.furniture.map((f) => f.x),
      ];
      const gap = Math.min(...busy.map((b) => Math.abs(b - x)));
      assert(gap >= 10, `${h.id} stood its umbrella ${gap} from something with ${decor.length} bought`);
    }
  }
});

test('the umbrella clears the pet, which nothing else in the habitat has to', () => {
  // Bought furniture stands beside a pet and tops out around 22; this stands over one, so it
  // is the one piece in the kit squeezed between two hard numbers at once.
  assert(UMBRELLA_PEAK > PET_FOOT.y, 'a pet would stick out through the top of its own umbrella');
  assert(WALK_Y - UMBRELLA_TOP >= 50, 'the umbrella is taller than the safe box and gets cropped');
  assert(UMBRELLA_TOP > UMBRELLA_PEAK, 'the finial sits above the canopy, not under it');
  for (const id of FURNITURE_IDS) {
    assert(
      UMBRELLA_HALF_WIDTH <= FURNITURE_HALF_WIDTH,
      `an umbrella is wider than ${id}, which the spot finder assumes it is not`
    );
  }
});

test('an umbrella is free — it never touches the shop, the slots or the save', () => {
  const item = createItem({ h: 4, m: 15, species: 'fizz', reviewClock: 0 });
  assert(habitatOf(item).shelter, 'every habitat should know where its umbrella would go');
  assertEqual((item.decor ?? []).length, 0, 'and standing under one must not cost a slot');
  assertEqual(item.habitat, undefined, 'nor put anything on the pet');
  assertEqual(sanitizeDecor(['umbrella']).length, 0, 'the umbrella is not a shop id');
  assertEqual(
    CATALOG.filter((entry) => entry.id === 'umbrella').length,
    0,
    'and it is not for sale'
  );
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
  assertEqual(subjectIdOf('add:3+5'), 'math');
  assertEqual(subjectIdOf('add:5+3'), null, 'and only in its canonical spelling');
  assertEqual(subjectIdOf('chem:H2O'), null, 'a subject this build lacks claims nothing');
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
  const heads = unseenAcrossSubjects({}, { clock: 0, math: 0 });
  assert(heads.length > 0, 'a fresh zoo has everything to learn');
  assert(heads.every((entry) => entry.tier === 0), 'and nothing above the unlocked tier');
  assert(heads.some((entry) => entry.subject === 'clock'), 'the clock is in there');
  assert(heads.some((entry) => entry.subject === 'math'), 'and so is adding');
  assertEqual(heads[0].subject, 'clock', 'a fresh zoo meets the clock first');
  assertEqual(heads[1].subject, 'math', 'and then a sum, rather than every clock face first');
});

test('a seen item is never offered as new again', () => {
  const first = unseenAcrossSubjects({}, { clock: 0 })[0];
  const after = unseenAcrossSubjects({ [first.id]: { phase: 'learning' } }, { clock: 0 });
  assert(!after.some((entry) => entry.id === first.id), 'it came back around');
});

test('the zoo counts every subject it teaches', () => {
  assertEqual(
    totalItemCount(),
    144 + addSubject.ALL_ITEMS.length,
    'the hardcoded 144 is gone, not merely moved'
  );
  assertEqual(SUBJECT_IDS.join(), 'clock,math', 'and both subjects are counted');
});

test('a tier opens for one subject without opening another', () => {
  const items = {};
  for (const entry of unseenAcrossSubjects({}, { clock: 0, math: 0 })) {
    // Only the clock's first tier is finished; the sums are left untouched.
    if (entry.subject === 'clock') items[entry.id] = { subject: 'clock', phase: 'graduated' };
  }
  const { tiers, unlocked } = refreshTiers({ items, tiers: { clock: 0, math: 0 } });
  assertEqual(tiers.clock, 1, 'finishing tier 0 opens tier 1');
  assertEqual(tiers.math, 0, 'and maths has not moved an inch');
  assertEqual(unlocked.join(), 'clock', 'and only the subject that moved is named');
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


/** A save exactly as the build before the maths ladder wrote it: the subject was `add`. */
const v2Save = () => ({
  version: 2,
  createdAt: 100,
  lastPlayedAt: 200,
  reviewClock: 42,
  tiers: { clock: 2, add: 3 },
  practice: { clock: { on: false, floor: 1 }, add: { on: true, floor: 2 } },
  coins: 37,
  zooDecor: [],
  milestones: ['mastery:0', 'mastery:1', 'mastery:add:0', 'mastery:add:1', 'species:add:mochi', 'week:2'],
  coinsGrantedAt: 1,
  milestonesGrantedAt: 1,
  settings: { sound: false, language: 'en', playMinutes: 7, showDigital: true },
  session: { startedAt: 0, answered: 0, correct: 0, napUntil: 0 },
  stats: { totalAnswered: 90, totalCorrect: 70, streak: 4, bestStreak: 9, daysPlayed: [] },
  items: {
    '4:15': { subject: 'clock', h: 4, m: 15, species: 'fizz', phase: 'graduated', feeds: 5, cracks: 2, decor: [], hatchedAt: 123 },
    'add:3+5': { subject: 'add', a: 3, b: 5, species: 'glim', phase: 'graduated', feeds: 3, cracks: 2, decor: [], hatchedAt: 456 },
  },
});

test('the subject formerly called adding brings its progress across under its new name', () => {
  const back = load(0, savedAs(v2Save()));
  assertEqual(back.tiers.math, 3, 'the ladder it had climbed');
  assertEqual(back.tiers.clock, 2, 'and the clock is left where it was');
  assertEqual(back.tiers.add, undefined, 'the old name is gone rather than kept alongside');
});

test("and so does a grown-up's choice about what to practise", () => {
  // `practiceOf` tolerates a missing key by switching everything on, which means a botched
  // rename would silently *undo* a grown-up's decision and look like nothing had happened.
  const back = load(0, savedAs(v2Save()));
  assertEqual(back.practice.math.on, true);
  assertEqual(back.practice.math.floor, 2, 'the rungs they had skipped are still skipped');
  assertEqual(back.practice.clock.on, false, 'and the subject they switched off is still off');
});

test('a milestone already paid for is not paid for again under the new name', () => {
  // This is what the rename is really about. `settleMilestones` pays for any id it has not
  // seen before, so a `mastery:add:1` left behind would hand a child forty coins per tier for
  // work they finished months ago, on the day they updated the game.
  const back = load(0, savedAs(v2Save()));
  assert(back.milestones.includes('mastery:math:0'), 'the paid tier came back unrecognisable');
  assert(back.milestones.includes('mastery:math:1'));
  assert(!back.milestones.some((id) => id.startsWith('mastery:add:')), 'the old spelling lingered');
  assertEqual(back.milestones.filter((id) => id.startsWith('mastery:math:')).length, 2, 'and did not double up');

  // The whole zoo, with both of those tiers genuinely finished: settling must cost nothing.
  const items = {};
  for (const tier of [0, 1]) {
    for (const entry of addSubject.tierItems(tier)) {
      items[entry.id] = { subject: 'math', tier, phase: 'graduated', hatchedAt: 1 };
    }
  }
  const settled = settleMilestones(items, { daysPlayed: [] }, back.milestones);
  // Only the mastery ids matter here. Finishing those two rungs also completes a species or
  // two, and *those* really are newly earned — the claim being tested is that no rung is
  // paid for a second time under its new spelling.
  assertEqual(
    settled.ids.filter((id) => id.startsWith('mastery:')).join(', '),
    '',
    'a child was paid twice for the same work'
  );
});

test('the ids that were never about the subject are left exactly alone', () => {
  const back = load(0, savedAs(v2Save()));
  // `species:add:<id>` still means the sixty-six addition facts, and the clock's bare
  // `mastery:<n>` was never renamed either — both have been paid out in saves in the wild.
  assert(back.milestones.includes('species:add:mochi'), 'the adding species milestone was mangled');
  assert(back.milestones.includes('mastery:0'), "the clock's own milestone was caught in the rename");
  assert(back.milestones.includes('week:2'));
});

test('a pet keeps its key, and only learns the new name of its subject', () => {
  // The key is what a pet's species, colours and name are hashed from. Rewriting it would
  // hand a child back a zoo of strangers, so the rename stops at the subject field.
  const back = load(0, savedAs(v2Save()));
  assertEqual(Object.keys(back.items).sort().join(), '4:15,add:3+5', 'a key was rewritten');
  assertEqual(back.items['add:3+5'].subject, 'math');
  assertEqual(back.items['add:3+5'].feeds, 3, 'and everything it had earned is still there');
  assertEqual(back.items['4:15'].subject, 'clock');
});

test('upgrading twice does no more than upgrading once', () => {
  const once = upgrade(v2Save());
  assertEqual(JSON.stringify(upgrade(once)), JSON.stringify(once), 'a second pass moved something');
});

test('a v1 save climbs all the way to the current version in one go', () => {
  const back = load(0, savedAs(v1Save()));
  assertEqual(back.version, VERSION);
  assertEqual(back.tiers.clock, 2);
  assertEqual(back.tiers.math, 0, 'and it starts maths at the bottom, having never met it');
});

test('a file exported before the rename is imported without being paid for twice', () => {
  // The same trap one door along: `applyImport` reads the tiers and the milestones out of the
  // file, and a file written by the old build files both under `add`.
  const payload = { ...v2Save(), app: TRANSFER_APP, format: TRANSFER_FORMAT, items: {} };
  const imported = applyImport(freshState(0), { ...payload, items: cleanItems(v2Save().items) }, 1000);
  assertEqual(imported.tiers.math, 3, 'the imported ladder was lost');
  assert(imported.milestones.includes('mastery:math:1'), 'the imported milestone was not carried');
  assert(!imported.milestones.some((id) => id.startsWith('mastery:add:')), 'the old spelling arrived intact');
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
    'chem:H2O': { hatchedAt: 1 },
  });
  assertEqual(Object.keys(kept).sort().join(), '4:15,add:3+5', 'the rest of the zoo still lands');
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
      'add:3+5': due('math', 3),
    },
  };
  assertEqual(
    nextItem(state, { now: 0, lastSubject: 'clock' }),
    'add:3+5',
    'after a clock question, the sum wins even though it is less overdue'
  );
  assertEqual(
    nextItem(state, { now: 0, lastSubject: 'math' }),
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


/* ------------------------------------------------------------------- adding */

describe('adding — the deck');

test('every unordered pair up to ten and ten, and nothing twice', () => {
  const sums = addSubject.ALL_ITEMS.filter((entry) => entry.op === '+' && entry.tier <= 4);
  assertEqual(sums.length, 66);
  const ids = addSubject.ALL_ITEMS.map((entry) => entry.id);
  assertEqual(new Set(ids).size, ids.length, 'an item appears in two tiers');
});

test('the tiers partition the deck, so a tier can actually be finished', () => {
  const sizes = addSubject.TIERS.map((tier) => addSubject.tierItems(tier.id).length);
  assertEqual(sizes.reduce((a, b) => a + b, 0), addSubject.ALL_ITEMS.length);
  assert(sizes.every((n) => n > 0), 'an empty tier can never be mastered');
});

test('3 + 5 and 5 + 3 are one fact, spelled the smaller way round', () => {
  assertEqual(addSubject.idOf({ a: 5, b: 3 }), 'add:3+5');
  assertEqual(addSubject.idOf({ a: 3, b: 5 }), 'add:3+5');
  assert(addSubject.owns('add:3+5'), 'the canonical spelling is the fact');
  assert(!addSubject.owns('add:5+3'), 'and the other spelling is not a second pet');
});

test('ids outside the deck are refused', () => {
  assert(!addSubject.owns('add:11+1'), 'eleven is not an addend here');
  assert(!addSubject.owns('add:3+'), 'nor is half an id');
  assert(!addSubject.owns('4:15'), 'nor a time');
  assertEqual(addSubject.parse('nonsense'), null);
});

test('each tier is a strategy, not a size', () => {
  const shown = (tier) => addSubject.tierItems(tier).map((f) => `${f.a}+${f.b}`).join(' ');
  assert(addSubject.tierItems(0).every((f) => f.a <= 1), 'tier 0 is adding nothing and adding one');
  assert(addSubject.tierItems(1).every((f) => f.a + f.b <= 10), 'tier 1 stays inside one ten-frame');
  assertEqual(shown(2), '6+6 7+7 8+8 9+9 10+10', 'tier 2 is the doubles past ten');
  assert(addSubject.tierItems(3).every((f) => f.b === 10), 'tier 3 is adding ten');
  assert(
    addSubject.tierItems(4).every((f) => f.a + f.b > 10 && f.a !== f.b && f.b !== 10),
    'and tier 4 is what is left, which is everything that has to bridge ten'
  );
});

test('facts are taught easiest first', () => {
  const sums = addSubject.tierItems(1).map((f) => f.a + f.b);
  assertEqual(sums.join(), [...sums].sort((a, b) => a - b).join(), 'a tier jumps about');
});

describe('adding — naming the mistake');

const verdict = (a, b, answer) => addSubject.grade({ a, b }, answer).verdict;

test('the right answer is the right answer', () => {
  assertEqual(verdict(7, 8, 15), 'correct');
  assertEqual(verdict(0, 0, 0), 'correct', 'and zero is an answer, not an absence');
});

test('a miscount by one is told apart from a misunderstanding', () => {
  assertEqual(verdict(7, 8, 14), 'offByOne');
  assertEqual(verdict(7, 8, 16), 'offByOne');
  assert(addSubject.grade({ a: 7, b: 8 }, 14).nearMiss, 'and it earns the softer opening');
});

test('digits the right way round but in the wrong order', () => {
  assertEqual(verdict(7, 8, 51), 'transposed');
  assert(addSubject.grade({ a: 7, b: 8 }, 51).nearMiss);
  assertEqual(verdict(3, 5, 8), 'correct', 'a single-digit answer cannot be transposed');
});

test('giving back one of the numbers, or the difference', () => {
  assertEqual(verdict(3, 5, 5), 'gaveAddend');
  assertEqual(verdict(3, 5, 3), 'gaveAddend');
  assertEqual(verdict(9, 4, 5), 'gaveDifference', 'they subtracted');
  assertEqual(verdict(7, 8, 99), 'wrong');
});

test('an unanswered question is never scored as a wrong one', () => {
  // Number(null) and Number('') are both 0, so this is the trap worth a test of its own.
  for (const empty of [null, undefined, '', 'x', -1]) {
    assertEqual(verdict(7, 8, empty), 'blank', `${JSON.stringify(empty)} became an answer`);
    assertEqual(addSubject.grade({ a: 7, b: 8 }, empty).correct, false);
  }
});

describe('adding — how wide the answer box is');

test('the strip never changes width within a deck, whatever the fact is', () => {
  // A strip that narrowed for small sums would say "this one is under ten" before the child
  // had added anything. So the width is one number for every fact a child meets written the
  // same way — sums and differences, products, missing factors — rather than one number for
  // the whole game: a question shaped differently on screen gives nothing away by being
  // answered in a differently sized box.
  const decks = {
    plusMinus: (entry) => !entry.skill && entry.op !== '×',
    products: (entry) => entry.op === '×' && !entry.gap,
    missing: (entry) => entry.op === '×' && entry.gap,
  };
  for (const [name, inDeck] of Object.entries(decks)) {
    const deck = addSubject.ALL_ITEMS.filter(inDeck);
    assert(deck.length > 0, `${name} is empty`);
    const widths = new Set(deck.map((entry) => addSubject.answerWidth(entry)));
    assertEqual(widths.size, 1, `the width of the answer is a clue in ${name}`);
  }
  assertEqual(addSubject.answerWidth({ op: '+', a: 3, b: 5 }), 2);
  // Three, because the deck reaches 10 × 10 — so a two-digit product sits in it with the
  // leading box blank rather than announcing itself by making the strip shorter.
  assertEqual(addSubject.answerWidth({ op: '×', a: 3, b: 5 }), 3);
  assertEqual(addSubject.answerWidth({ op: '×', a: 3, b: 5, gap: true }), 2);
});

test('every answer in the deck fits in the strip', () => {
  // The first tier contains 0 + 10 — "sums to ten" includes ten — so a one-box strip would
  // not merely leak, it would make a fact impossible to answer at all.
  for (const entry of addSubject.ALL_ITEMS) {
    if (entry.skill) continue; // a skill's numbers are made up; it gets its own sweep below
    assert(
      addSubject.answerDigits(entry) <= addSubject.answerWidth(entry),
      `${entry.id} cannot be answered in ${addSubject.answerWidth(entry)} boxes`
    );
  }
  assertEqual(addSubject.answerDigits({ op: '+', a: 0, b: 10 }), 2, 'the fact that forced this');
  assertEqual(addSubject.tierOf({ op: '+', a: 0, b: 10 }), 0, 'and it really is in the first tier');
});


/* ---------------------------------------------------------- the maths ladder */

describe('maths — the whole ladder');

test('fifty-one rungs, in nine groups, with nothing left out of either', () => {
  assertEqual(addSubject.TIERS.length, 51);
  assertEqual(addSubject.LAST_TIER, 50);
  const grouped = addSubject.GROUPS.flatMap((group) => group.tiers);
  assertEqual(grouped.join(), addSubject.TIERS.map((tier) => tier.id).join(), 'a rung fell out of its group');
  assertEqual(new Set(grouped).size, grouped.length, 'a rung is in two groups at once');
});

test('the tiers partition the deck, so a tier can actually be finished', () => {
  const sizes = addSubject.TIERS.map((tier) => addSubject.tierItems(tier.id).length);
  assertEqual(sizes.reduce((a, b) => a + b, 0), addSubject.ALL_ITEMS.length);
  // An empty tier can never reach the 80% bar, so the ladder would stall on it forever.
  assert(sizes.every((n) => n > 0), 'an empty tier can never be mastered');
  const ids = addSubject.ALL_ITEMS.map((entry) => entry.id);
  assertEqual(new Set(ids).size, ids.length, 'an item appears on two rungs');
});

test('every item lands on the tier it is filed under', () => {
  for (const entry of addSubject.ALL_ITEMS) {
    assertEqual(addSubject.tierOf(entry), entry.tier, `${entry.id} disagrees about its own tier`);
    assert(addSubject.owns(entry.id), `${entry.id} is not owned by the subject that teaches it`);
  }
});

test('the sixty-six addition facts and their tiers are exactly what they were', () => {
  // Pinned rather than derived. A pet's species, name and colours are hashed from its id and
  // its tier, so a fact that quietly changed rung would come back a different creature.
  const sums = addSubject.ALL_ITEMS.filter((entry) => entry.op === '+' && entry.tier <= 4);
  assertEqual(sums.length, 66);
  assertEqual(
    mathFacts.factTierItems(2).map((f) => `${f.a}+${f.b}`).join(' '),
    '6+6 7+7 8+8 9+9 10+10',
    'tier 2 is the doubles past ten'
  );
  assert(mathFacts.factTierItems(0).every((f) => f.a <= 1), 'tier 0 is adding nothing and adding one');
  assert(mathFacts.factTierItems(3).every((f) => f.b === 10), 'tier 3 is adding ten');
});

describe('maths — taking away');

test('every difference the game teaches has an addition partner it can lean on', () => {
  const subs = addSubject.ALL_ITEMS.filter((entry) => entry.op === '-');
  assertEqual(subs.length, 121, 'the inverses of the sixty-six, and nothing else');
  for (const fact of subs) {
    const partner = mathFacts.partnerOf(fact);
    assert(
      mathFacts.owns(mathFacts.addIdOf(partner)),
      `${fact.id} has no partner to point at, so the fact-family correction would have nothing to say`
    );
    assertEqual(partner.a + partner.b, fact.a, `${fact.id} named the wrong partner`);
  }
});

test('a difference is not symmetric, and its id says so', () => {
  assertEqual(mathFacts.subIdOf({ a: 15, b: 8 }), 'sub:15-8');
  assert(mathFacts.owns('sub:15-8'), 'the difference this game teaches');
  assert(!mathFacts.owns('sub:8-15'), 'and not the one it does not');
  assert(!mathFacts.owns('sub:20-3'), 'nor one whose answer is past the facts');
  assert(!mathFacts.owns('sub:015-8'), 'nor a non-canonical spelling of a real one');
});

test('the minus rungs mirror the plus rungs', () => {
  const tierOf = (a, b) => mathFacts.subTierOf({ a, b });
  assertEqual(tierOf(9, 1), 5, 'taking away one is counting back');
  assertEqual(tierOf(9, 4), 6, 'and this stays inside one frame');
  assertEqual(tierOf(14, 4), 7, 'landing exactly on the ten');
  assertEqual(tierOf(16, 8), 8, 'halving a double');
  assertEqual(tierOf(17, 10), 9, 'taking ten away');
  assertEqual(tierOf(15, 8), 10, 'and bridging back under it');
});

describe('maths — the generator');

test('the same seed always draws the same question', () => {
  for (const entry of mathSkills.ALL_SKILLS) {
    const once = mathSkills.generate(entry.skill, { shape: entry.shapes[0], seed: 12345 });
    const twice = mathSkills.generate(entry.skill, { shape: entry.shapes[0], seed: 12345 });
    assertEqual(JSON.stringify(once), JSON.stringify(twice), `${entry.skill} is not reproducible`);
  }
});

test('asked for a case, the generator produces that case — every skill, every case', () => {
  // The coverage gate is only as good as this: if a shape could not be produced on demand,
  // an item would sit in learning forever waiting for one.
  for (const entry of mathSkills.ALL_SKILLS) {
    for (const shape of entry.shapes) {
      for (let seed = 1; seed <= 60; seed += 1) {
        const made = mathSkills.generate(entry.skill, { shape, seed });
        assertEqual(made.shape, shape, `${entry.skill} could not produce ${shape}`);
      }
    }
  }
});

test('a generated question never needs more boxes than the strip has', () => {
  // And the strip is a property of the item, never of the question — a strip that narrowed
  // when the answer got smaller would hand the answer over.
  for (const entry of mathSkills.ALL_SKILLS) {
    const width = addSubject.answerWidth(entry);
    for (const shape of entry.shapes) {
      for (let seed = 1; seed <= 60; seed += 1) {
        const made = mathSkills.generate(entry.skill, { shape, seed });
        assert(
          addSubject.answerDigits(made) <= width,
          `${entry.skill}/${shape} answered ${made.a}${made.op}${made.b} in more than ${width} boxes`
        );
        assert(made.a >= 0 && made.b >= 0, 'a question below zero');
        if (made.op === '-') assert(made.a >= made.b, 'a difference below zero');
      }
    }
  }
});

test('a skill is one width, whatever it draws', () => {
  for (const entry of mathSkills.ALL_SKILLS) {
    const widths = new Set(
      entry.shapes.flatMap((shape) =>
        [1, 2, 3, 4, 5].map(() => addSubject.answerWidth({ skill: entry.skill }))
      )
    );
    assertEqual(widths.size, 1, `${entry.skill} changes width, which is a clue`);
  }
});

test('the numbers come from the item, and change only when the answer was right', () => {
  // The whole of the retry behaviour. A wrong answer must leave the seed alone, so the
  // question comes back with the very numbers the child just watched being explained.
  const item = createItem({ subject: 'math', skill: 'col+2c', tier: 14, species: 'mochi', reviewClock: 0 });
  const before = addSubject.instanceOf(item);
  const missed = review(item, { ...addSubject.pacing(item), correct: false, reviewClock: 1, now: 0 }).item;
  assertEqual(
    JSON.stringify(addSubject.instanceOf(missed)),
    JSON.stringify(before),
    'the retry showed different numbers from the ones just explained'
  );
  const got = review(item, {
    ...addSubject.pacing(item),
    shape: before.shape,
    correct: true,
    reviewClock: 1,
    now: 0,
  }).item;
  assert(
    JSON.stringify(addSubject.instanceOf(got)) !== JSON.stringify(before),
    'a right answer got the same question back'
  );
});

test('an uncovered case is always preferred over one already done', () => {
  const shapes = mathSkills.shapesOf('col+3');
  const item = { skill: 'col+3', covered: shapes.slice(1), reps: 0, feeds: 0, correctStreak: 0, lapses: 0 };
  for (let n = 0; n < 20; n += 1) {
    assertEqual(addSubject.shapeFor({ ...item, reps: n }), shapes[0], 'a covered case was asked again');
  }
  // Everything covered: the skill becomes free practice rather than running out of questions.
  const done = { ...item, covered: shapes };
  assert(shapes.includes(addSubject.shapeFor(done)), 'a fully covered skill had nothing left to ask');
});

describe('maths — coverage is what makes the practice enough');

const answerRight = (item, shape, step) =>
  review(item, { ...addSubject.pacing(item), shape, correct: true, reviewClock: step, now: 0 }).item;

test('a skill cannot graduate on one case answered over and over', () => {
  const shapes = mathSkills.shapesOf('col+3');
  assert(shapes.length > 1, 'this test needs a skill with more than one case');
  let item = createItem({ subject: 'math', skill: 'col+3', tier: 15, species: 'mochi', reviewClock: 0 });
  for (let n = 0; n < 20; n += 1) item = answerRight(item, shapes[0], n + 1);
  assertEqual(item.phase, 'learning', 'twenty right answers on one case counted as mastery');
  assertEqual(item.hatchedAt, null, 'and it hatched anyway');
  assert(item.cracks < CRACK_STAGES, 'the last crack was spent before the hatch it promises');
});

test('and graduates once every case has been answered, and not before', () => {
  const shapes = mathSkills.shapesOf('col+3');
  let item = createItem({ subject: 'math', skill: 'col+3', tier: 15, species: 'mochi', reviewClock: 0 });
  let step = 0;
  for (const shape of shapes) {
    step += 1;
    item = answerRight(item, shape, step);
  }
  assertEqual(item.covered.length, shapes.length, 'a case answered right went unrecorded');
  // Coverage is necessary, not sufficient: the streak bar still has to be met.
  while (item.phase === 'learning' && step < 40) {
    step += 1;
    item = answerRight(item, shapes[0], step);
  }
  assertEqual(item.phase, 'graduated');
  assert(item.hatchedAt !== null, 'a graduated skill still had not hatched');
  assert(item.seen >= mathSkills.shapesOf('col+3').length, 'it graduated in fewer answers than it has cases');
});

test('a lapsed skill re-graduates without touring every case again', () => {
  // One bad day should not cost a twenty-question penalty. Coverage is a fact about what the
  // child has ever shown; the streak is what carries "and can still do it".
  const shapes = mathSkills.shapesOf('col-3');
  let item = createItem({ subject: 'math', skill: 'col-3', tier: 18, species: 'mochi', reviewClock: 0 });
  let step = 0;
  for (const shape of shapes) item = answerRight(item, shape, (step += 1));
  while (item.phase === 'learning' && step < 40) item = answerRight(item, shapes[0], (step += 1));
  assertEqual(item.phase, 'graduated');
  item = review(item, { ...addSubject.pacing(item), correct: false, reviewClock: (step += 1), now: 0 }).item;
  assertEqual(item.phase, 'learning', 'a wrong answer did not bring it back');
  for (let n = 0; n < GRADUATION_STREAK; n += 1) item = answerRight(item, shapes[0], (step += 1));
  assertEqual(item.phase, 'graduated', 'a lapsed skill was made to start the whole tour again');
});

test('a fact is unaffected by any of it — no cases, no change', () => {
  assertEqual(JSON.stringify(addSubject.pacing({ op: '+', a: 3, b: 5 })), '{}');
  assertEqual(shapesFor('add:3+5').length, 0);
  assertEqual(shapesFor('4:15').length, 0);
  assert(shapesFor('skill:col+2c').length > 0, 'a skill really does declare its cases');
});

test('the shell still breaks at the same rate it always did', () => {
  // `crackFor` was generalised to spread over however long the run to hatching is. At the
  // default it must give exactly the numbers it gave before, or every egg in every save
  // would jump.
  const before = (streak) => Math.min(Math.max(streak - 1, 0), CRACK_STAGES);
  for (let streak = 0; streak <= 8; streak += 1) {
    assertEqual(crackFor(streak), before(streak), `streak ${streak}`);
  }
  // And over a longer run the last crack still lands on the answer before hatching.
  assertEqual(crackFor(5, 6), CRACK_STAGES);
  assert(crackFor(4, 6) < CRACK_STAGES, 'the shell finished breaking too early');
});

describe('maths — naming the mistake in a column');

const colVerdict = (op, a, b, answer) => addSubject.grade({ op, a, b, column: true }, answer).verdict;

test('the wrong algorithms are each named, not lumped together as wrong', () => {
  assertEqual(colVerdict('+', 47, 38, '715'), 'wroteFullSumInColumn');
  assertEqual(colVerdict('+', 47, 38, '75'), 'forgotCarry');
  assertEqual(colVerdict('+', 47, 38, '175'), 'carriedWrongColumn');
  assertEqual(colVerdict('+', 47, 38, '76'), 'carriedIntoOwnColumn');
  assertEqual(colVerdict('-', 52, 38, '26'), 'smallerFromLarger');
  assertEqual(colVerdict('-', 52, 38, '24'), 'forgotBorrow');
  assertEqual(colVerdict('-', 503, 178, '435'), 'borrowAcrossZero');
  assertEqual(colVerdict('-', 52, 38, '90'), 'addedInstead');
  assertEqual(colVerdict('+', 47, 38, '9'), 'subtractedInstead');
  assertEqual(colVerdict('+', 47, 38, '85'), 'correct');
  assertEqual(colVerdict('+', 47, 38, '86'), 'offByOne');
  assertEqual(colVerdict('+', 47, 38, '95'), 'placeValueOff');
  assertEqual(colVerdict('+', 47, 38, ''), 'blank');
});

test('every wrong algorithm is recognised wherever it is run, not just on the famous example', () => {
  // Generated rather than hand-computed: run the mistaken procedure, feed its output back to
  // the grader, and the verdict must come back. Nothing here can be right by luck.
  const ways = [
    ['+', 'wroteFullSumInColumn', mathColumns.wroteFullSumInColumn],
    ['+', 'forgotCarry', mathColumns.forgotCarry],
    ['-', 'smallerFromLarger', mathColumns.smallerFromLarger],
    ['-', 'forgotBorrow', mathColumns.forgotBorrow],
  ];
  for (const entry of mathSkills.ALL_SKILLS) {
    for (const shape of entry.shapes) {
      for (let seed = 1; seed <= 25; seed += 1) {
        const made = mathSkills.generate(entry.skill, { shape, seed });
        if (!made.column) continue;
        for (const [op, name, run] of ways) {
          if (op !== made.op) continue;
          const wrong = run(made.a, made.b);
          const target = made.op === '-' ? made.a - made.b : made.a + made.b;
          // A wrong way that lands on the right answer is a coincidence, not a mistake.
          if (wrong === target || wrong < 0) continue;
          const got = addSubject.grade(made, String(wrong)).verdict;
          assert(
            got !== 'wrong',
            `${made.a}${made.op}${made.b} answered ${wrong} (${name}) was reported as plain wrong`
          );
        }
      }
    }
  }
});

test('a difference tells a child which wrong idea they had', () => {
  const v = (a, b, answer) => addSubject.grade({ op: '-', a, b }, answer).verdict;
  assertEqual(v(15, 8, '23'), 'gaveSum', 'reading the minus as a plus');
  assertEqual(v(15, 8, '7'), 'correct');
  assertEqual(v(12, 9, '9'), 'gaveOperand', 'reading the second number off the page');
  assertEqual(v(12, 9, '12'), 'gaveOperand', 'or counting the pile and taking nothing off it');
  assertEqual(v(15, 8, '6'), 'offByOne');
  // Where the two readings collide — 8 is both the number on the page and one past the
  // answer — the miscount wins, because it is the likelier of the two and much the kinder.
  assertEqual(v(15, 8, '8'), 'offByOne');
  assert(addSubject.grade({ op: '-', a: 15, b: 8 }, '6').nearMiss, 'and it earns the softer opening');
  assertEqual(v(15, 8, ''), 'blank');
  assertEqual(v(15, 8, null), 'blank', 'nothing at all is not zero');
});

describe('maths — the pictures a mistake gets instead of a cross');

test('a difference fills the frame and then empties the top of it', () => {
  const plan = takeAwayPlan(15, 8);
  assertEqual(plan.total, 15, 'the whole starting number goes on the board first');
  assertEqual(plan.gone, 8);
  assertEqual(plan.left, 7);
  assertEqual(plan.toTen, 5, 'five come off to get back down to the ten');
  assertEqual(plan.rest, 3, 'and three more after that');
  assertEqual(plan.cells.filter((c) => c.gone).length, 8);
  assert(
    plan.cells.filter((c) => c.bridges).every((c) => c.index >= FRAME),
    'the counters marked as bridging were not the ones in the second frame'
  );
});

test('taking away nothing takes nothing away', () => {
  assertEqual(takeAwayPlan(7, 0).cells.filter((c) => c.gone).length, 0);
  assertEqual(takeAwayPlan(0, 0).cells.length, 0, 'and an empty board does not throw');
});

test('the walkthrough carries into the column the carry is going into', () => {
  const steps = walkSteps({ op: '+', a: 47, b: 38 });
  assertEqual(steps[0].digit, 5, 'the ones column keeps five');
  assertEqual(steps[0].carryOut, 1, 'and passes one on');
  assertEqual(steps[1].carryIn, 1, 'which the tens column receives');
  assertEqual(steps[1].digit, 8);
  assertEqual(walkWidth({ op: '+', a: 98, b: 97 }), 3, 'a carry off the top gets its own column');
  assertEqual(walkWidth({ op: '-', a: 503, b: 178 }), 3);
});

test('the walkthrough shows the borrow as the digit the column actually worked with', () => {
  const steps = walkSteps({ op: '-', a: 52, b: 38 });
  assertEqual(steps[0].borrowed, 12, 'the two became twelve');
  assertEqual(steps[0].digit, 4);
  assertEqual(steps[1].borrowIn, 1, 'and the tens column paid for it');
  assertEqual(steps[1].digit, 1);
});

test('the walkthrough draws every column and never leaks past them', () => {
  for (const [op, a, b] of [['+', 47, 38], ['+', 998, 997], ['-', 503, 178], ['-', 90, 72]]) {
    const html = columnWalkHtml({ op, a, b }, { title: 'x' });
    const cells = html.match(/class="cw-cell/g) ?? [];
    const cols = walkWidth({ op, a, b });
    // Four rows of `cols` cells each: the carries, the two numbers and the answer.
    assertEqual(cells.length, cols * 4, `${a}${op}${b} drew the wrong number of cells`);
  }
});


describe('maths — how fast the working goes');

test('the speeds run slow to fast, and the default is one of them', () => {
  const steps = WALK_SPEEDS.map((speed) => speed.step);
  assertEqual(
    steps.join(),
    [...steps].sort((a, b) => b - a).join(),
    'the slider would run backwards'
  );
  assertEqual(new Set(WALK_SPEEDS.map((s) => s.id)).size, WALK_SPEEDS.length, 'a speed is named twice');
  assert(isWalkSpeed(DEFAULT_WALK_SPEED), 'the default is not a speed this build has');
});

test('the default is markedly slower than the pace nobody could follow', () => {
  // The first version of the walkthrough ran at 0.55s a column, and a child could not keep
  // up with it. This is the guard on that: if anyone ever tunes the default back towards it,
  // the complaint comes back with it.
  assert(
    stepFor(DEFAULT_WALK_SPEED) >= 1.5,
    `the default is back down to ${stepFor(DEFAULT_WALK_SPEED)}s a column`
  );
});

test('an unknown speed falls back rather than stopping the working', () => {
  assertEqual(stepFor('nonsense'), stepFor(DEFAULT_WALK_SPEED));
  assertEqual(stepFor(undefined), stepFor(DEFAULT_WALK_SPEED));
  assert(!isWalkSpeed('nonsense'));
});

test('the slider maps to a speed and back, and cannot be dragged off the end', () => {
  for (const speed of WALK_SPEEDS) {
    assertEqual(walkSpeedAt(walkSpeedIndex(speed.id)), speed.id, `${speed.id} did not round-trip`);
  }
  assertEqual(walkSpeedAt(-3), WALK_SPEEDS[0].id, 'past the slow end');
  assertEqual(walkSpeedAt(99), WALK_SPEEDS[WALK_SPEEDS.length - 1].id, 'past the fast end');
  assertEqual(walkSpeedAt('lots'), DEFAULT_WALK_SPEED, 'and nonsense lands on the default');
  assertEqual(walkSpeedIndex('nonsense'), walkSpeedIndex(DEFAULT_WALK_SPEED));
});

test('a slower speed really does take longer, and a longer sum longer still', () => {
  const sum = { op: '+', a: 47, b: 38 };
  const times = WALK_SPEEDS.map((speed) => walkDuration(sum, speed.step));
  assertEqual(
    times.join(),
    [...times].sort((a, b) => b - a).join(),
    'the speeds do not actually change how long it takes'
  );
  assert(
    walkDuration({ op: '-', a: 503, b: 178 }, stepFor(DEFAULT_WALK_SPEED)) >
      walkDuration(sum, stepFor(DEFAULT_WALK_SPEED)),
    'three columns finished no later than two'
  );
  // Long enough to follow: at the default a two-column sum is on screen for seconds, not
  // for the blink it used to be.
  assert(walkDuration(sum, stepFor(DEFAULT_WALK_SPEED)) > 4000, 'still too quick to follow');
});

test('the grown-up starts with the working shown, not skipped', () => {
  // Being told you were wrong and not why is the one outcome the whole correction exists to
  // avoid, so skipping it has to be something a grown-up chooses on purpose.
  const settings = freshState(0).settings;
  assertEqual(settings.walkInstant, false);
  assertEqual(settings.walkSpeed, DEFAULT_WALK_SPEED);
});

test('a hand-edited speed cannot leave a child watching a walk that never ends', () => {
  const storage = fakeStorage();
  write({ ...freshState(0), settings: { ...freshState(0).settings, walkSpeed: 'glacial', walkInstant: 'yes' } }, storage);
  const back = load(0, storage);
  assertEqual(back.settings.walkSpeed, DEFAULT_WALK_SPEED, 'an unknown speed was trusted');
  assertEqual(back.settings.walkInstant, true, 'and a truthy value is read as the switch being on');
});

test('a save written before either setting existed picks both up', () => {
  const storage = fakeStorage();
  const { walkSpeed, walkInstant, ...older } = freshState(0).settings;
  write({ ...freshState(0), settings: older }, storage);
  const back = load(0, storage);
  assertEqual(back.settings.walkSpeed, DEFAULT_WALK_SPEED);
  assertEqual(back.settings.walkInstant, false);
});

test('every speed has a name a grown-up can read, in both languages', () => {
  for (const lang of ['nb', 'en']) {
    const t = translator(lang);
    for (const speed of WALK_SPEEDS) {
      const key = `settings.walkSpeed.${speed.id}`;
      assert(t(key) !== key, `${lang} has no name for ${speed.id}`);
    }
    for (const key of ['settings.walkSpeed', 'settings.walkSpeedHelp', 'settings.walkInstant', 'settings.walkInstantHelp']) {
      assert(t(key) !== key, `${lang} is missing ${key}`);
    }
  }
});

describe('maths — the pets a longer ladder must not disturb');

test('an existing zoo comes back exactly as it was', () => {
  // Pinned against what the build before this ladder produced. A pet's species, trait index
  // and name are all derived from the id it is filed under and the tier it sits on, so an id
  // rewrite, a reordering of ALL_ITEMS, or a fact changing rung would hand a child back a zoo
  // of strangers — silently, and with no way to undo it.
  const pinned = [
    ['4:15', 'fizz', 1, 'Stjerneskudd', 'Pudding'],
    ['1:00', 'mochi', 0, 'Dugg', 'Muffin'],
    ['12:55', 'sprout', 22, 'Solstråle', 'Wobble'],
    ['add:3+5', 'glim', 6, 'Mose', 'Jellybean'],
    ['add:7+8', 'pip', 12, 'Regnbue', 'Cricket'],
    ['add:0+10', 'mochi', 9, 'Perle', 'Marshmallow'],
    ['add:10+10', 'fizz', 8, 'Tøffel', 'Pinecone'],
    ['add:2+2', 'glim', 4, 'Kongle', 'Blossom'],
  ];
  for (const [id, species, index, nb, en] of pinned) {
    const item = addSubject.owns(id)
      ? { subject: 'math', ...addSubject.parse(id) }
      : { subject: 'clock', ...parseTimeId(id) };
    const portrait = portraitOf(item);
    assertEqual(portrait.key, id, `${id} is filed under a different key now`);
    assertEqual(portrait.species, species, `${id} changed species`);
    assertEqual(portrait.index, index, `${id} changed trait index`);
    assertEqual(petName(item, 'nb'), nb, `${id} was renamed`);
    assertEqual(petName(item, 'en'), en, `${id} was renamed in English`);
  }
});

test('the adding species milestone still means exactly the sixty-six sums', () => {
  // `species:add:<id>` has already been paid out in saves in the wild. Widening it to mean
  // "and every difference, and every method" would push a milestone a child was two answers
  // from earning back over the horizon.
  const total = SPECIES_IDS.reduce((n, species) => n + factsOfSpecies(species).length, 0);
  assertEqual(total, 66, 'the adding milestone quietly grew a new requirement');
  for (const species of SPECIES_IDS) {
    assert(
      factsOfSpecies(species).every((id) => id.startsWith('add:')),
      'a difference or a method was filed as an addition fact'
    );
  }
});

test('a skill hatches a pet like anything else', () => {
  const portrait = portraitOf({ subject: 'math', skill: 'col+2c' });
  assertEqual(portrait.key, 'skill:col+2c');
  assert(SPECIES_IDS.includes(portrait.species), 'a method got no creature');
  assert(portrait.index >= 0);
});

describe('maths — the times tables');

test('six product rungs and six missing-factor rungs, exactly the sizes they were designed', () => {
  // The pairs are unordered, so there are fifty-five products rather than a hundred; the
  // missing-factor deck asks each non-square pair from both ends, which is why it is a
  // hundred rather than another fifty-five.
  const products = mathTimes.ALL_TIMES.filter((entry) => !entry.gap);
  const missing = mathTimes.ALL_TIMES.filter((entry) => entry.gap);
  assertEqual(products.length, 55, 'the products are not the unordered pairs to ten');
  assertEqual(missing.length, 100, 'the missing-factor deck lost a direction');
  assertEqual(
    [19, 20, 21, 22, 23, 24].map((t) => addSubject.tierItems(t).length).join(),
    '19,8,7,6,9,6',
    'a product changed rung'
  );
  assertEqual(
    [25, 26, 27, 28, 29, 30].map((t) => addSubject.tierItems(t).length).join(),
    '36,15,13,6,18,12',
    'a missing factor changed rung'
  );
});

test('the rungs are strategies, and each pair is on exactly one of them', () => {
  const seen = new Map();
  for (let a = 1; a <= 10; a += 1) {
    for (let b = a; b <= 10; b += 1) {
      const tier = mathTimes.timesTierOf({ a, b });
      assert(tier >= 19 && tier <= 24, `${a}×${b} landed off the times ladder`);
      seen.set(`${a}x${b}`, tier);
    }
  }
  assertEqual(seen.size, 55);
  // The lessons the rungs are named after, spot-checked where two rules could both apply.
  assertEqual(mathTimes.timesTierOf({ a: 2, b: 10 }), 19, 'ten wins over two — it is the plainer rule');
  assertEqual(mathTimes.timesTierOf({ a: 2, b: 5 }), 20, 'and doubling wins over five');
  assertEqual(mathTimes.timesTierOf({ a: 5, b: 5 }), 21, 'twenty-five is a five before it is a square');
  assertEqual(mathTimes.timesTierOf({ a: 7, b: 7 }), 22);
  assertEqual(mathTimes.timesTierOf({ a: 3, b: 9 }), 23);
  assertEqual(mathTimes.timesTierOf({ a: 7, b: 8 }), 24, 'the hardest one is on the last rung');
  // Six rungs above, mirroring the six below them.
  assertEqual(mathTimes.gapTierOf({ a: 7, b: 8 }), 30);
  assertEqual(mathTimes.gapTierOf({ a: 8, b: 7 }), 30, 'both directions sit on the same rung');
});

test('a product is one pet, however the pair is written', () => {
  assertEqual(addSubject.idOf({ op: '×', a: 7, b: 3 }), 'mul:3x7');
  assertEqual(addSubject.idOf({ op: '×', a: 3, b: 7 }), 'mul:3x7');
  assert(addSubject.owns('mul:3x7'), 'the canonical spelling is the fact');
  assert(!addSubject.owns('mul:7x3'), 'and the other spelling is not a second pet');
  assert(!addSubject.owns('mul:0x5'), 'nothing is multiplied by nothing here');
  assert(!addSubject.owns('mul:3x11'), 'eleven is off the end of the tables');
  assert(!addSubject.owns('mul:3x'), 'nor is half an id');
});

test('a missing factor is stored as the two numbers on screen', () => {
  // `mis:7x56` is "7 × __ = 56": the factor shown and the product, because those are the
  // numbers a child can see. What they have to supply is derived, which is also why an id
  // whose product does not divide describes nothing.
  assertEqual(addSubject.idOf({ op: '×', a: 7, b: 8, gap: true }), 'mis:7x56');
  assertEqual(addSubject.idOf({ op: '×', a: 8, b: 7, gap: true }), 'mis:8x56');
  assert(addSubject.owns('mis:7x56') && addSubject.owns('mis:8x56'), 'a direction went missing');
  assert(!addSubject.owns('mis:7x57'), 'fifty-seven is not seven of anything');
  assert(!addSubject.owns('mis:7x140'), 'twenty is off the end of the tables');
  assert(!addSubject.owns('mis:07x56'), 'a padded id is not a second pet for one question');
  for (const entry of mathTimes.ALL_TIMES) {
    assertEqual(addSubject.idOf(entry), entry.id, `${entry.id} does not round-trip`);
    assert(addSubject.owns(entry.id), `${entry.id} is not owned by the subject that teaches it`);
    assertEqual(mathTimes.answerOf(entry), entry.gap ? entry.b : entry.a * entry.b);
  }
});

test('every non-square pair is asked from both ends, and a square only from one', () => {
  const hunted = new Map();
  for (const entry of mathTimes.ALL_TIMES.filter((e) => e.gap)) {
    const pair = `${Math.min(entry.a, entry.b)}x${Math.max(entry.a, entry.b)}`;
    hunted.set(pair, (hunted.get(pair) ?? 0) + 1);
  }
  assertEqual(hunted.size, 55, 'a pair has no missing-factor question at all');
  for (const [pair, n] of hunted) {
    const [a, b] = pair.split('x').map(Number);
    assertEqual(n, a === b ? 1 : 2, `${pair} is asked ${n} times`);
  }
});

test('each multiplication mistake is named, by running the mistake', () => {
  // Built rather than hand-computed: the wrong answer is produced by doing the wrong thing,
  // so a verdict cannot pass by coincidence.
  const verdict = (q, answer) => addSubject.grade(q, answer).verdict;
  const q = { op: '×', a: 7, b: 8 };
  assertEqual(verdict(q, '56'), 'correct');
  assertEqual(verdict(q, '15'), 'mulGaveSum', 'the sign read as a plus');
  assertEqual(verdict(q, '7'), 'mulGaveFactor');
  assertEqual(verdict(q, String(7 * 7)), 'mulOffByOneRow', 'one row short');
  assertEqual(verdict(q, String(9 * 7)), 'mulOffByOneRow', 'and one row long');
  assertEqual(verdict(q, String(6 * 7)), 'mulNeighbour', 'a real seven, just not eight of them');
  assertEqual(verdict(q, '55'), 'offByOne');
  assertEqual(verdict(q, '65'), 'transposed');
  assertEqual(verdict(q, '31'), 'wrong');
  for (const empty of [null, undefined, '', 'x', -1]) {
    assertEqual(verdict(q, empty), 'blank', `${JSON.stringify(empty)} became an answer`);
  }
  // A wrong way that happens to give the right answer is a coincidence, not a mistake.
  assertEqual(verdict({ op: '×', a: 2, b: 2 }, '4'), 'correct', '2 + 2 and 2 × 2 are both four');
});

test('"so close" is only said about something that was close', () => {
  // One row out of seven is nearly right. One row out of two is not nearly anything, and
  // being kind about it would be the game telling a child they almost had a fact they simply
  // do not have yet.
  assert(addSubject.grade({ op: '×', a: 7, b: 8 }, String(7 * 7)).nearMiss, 'seven eights, one row short');
  assert(addSubject.grade({ op: '×', a: 6, b: 7 }, String(5 * 7)).nearMiss);
  const small = addSubject.grade({ op: '×', a: 1, b: 3 }, '6');
  assertEqual(small.verdict, 'mulOffByOneRow', 'it is still a row out');
  assert(!small.nearMiss, 'double the answer is not "so close"');
  assert(!addSubject.grade({ op: '×', a: 3, b: 4 }, '16').nearMiss, 'a third out is not "so close"');
  // These two are softened whatever the numbers are: both are an answer the child had and
  // lost on the way to the page.
  assert(addSubject.grade({ op: '×', a: 1, b: 3 }, '2').nearMiss, 'one out is always a miscount');
  assert(addSubject.grade({ op: '×', a: 7, b: 8 }, '65').nearMiss, 'and so are swapped digits');
});

test('each missing-factor mistake is named too', () => {
  const verdict = (q, answer) => addSubject.grade(q, answer).verdict;
  const q = { op: '×', a: 7, b: 8, gap: true };
  assertEqual(verdict(q, '8'), 'correct');
  assertEqual(verdict(q, '56'), 'gapGaveProduct', 'the product written back');
  assertEqual(verdict(q, '7'), 'gapGaveFactor', 'the number they already had');
  assertEqual(verdict(q, String(56 - 7)), 'gapTookAway', 'subtracted instead of divided');
  assertEqual(verdict(q, '9'), 'offByOne');
  assertEqual(verdict(q, '3'), 'wrong');
  // A near miss is softened; a whole wrong idea is not.
  assert(addSubject.grade(q, '9').nearMiss, 'one out is a miscount');
  assert(!addSubject.grade(q, '56').nearMiss, 'writing the product back is not "nearly"');
});

test('a missing factor is drawn with the strip inside the equation', () => {
  assertEqual(addSubject.layoutOf({ op: '×', a: 7, b: 8 }), 'inline');
  assertEqual(addSubject.layoutOf({ op: '×', a: 7, b: 8, gap: true }), 'gap');
  // And it is given longer, because it is hunted rather than recalled — without that the
  // scheduler reads every thoughtful right answer as a hesitant one.
  assert(
    addSubject.paceOf({ op: '×', a: 7, b: 8, gap: true }) > addSubject.paceOf({ op: '×', a: 7, b: 8 }),
    'hunting for a factor is not given any longer than saying a product'
  );
});

test('growing the ladder left every pet a child already has exactly where it was', () => {
  // The one rule the whole placement rests on: `pets.js` hands out species and trait indices
  // by *position* in `math.ALL_ITEMS`, so the times tables had to be appended and not
  // inserted. Pinned to the values from before they existed — a pet that came back a
  // different colour with a different name would be a bug with feelings attached.
  const pinned = [
    [{ subject: 'math', op: '+', a: 3, b: 5 }, 'add:3+5 glim 6'],
    [{ subject: 'math', op: '+', a: 7, b: 8 }, 'add:7+8 pip 12'],
    [{ subject: 'math', op: '+', a: 0, b: 10 }, 'add:0+10 mochi 9'],
    [{ subject: 'math', op: '-', a: 15, b: 8 }, 'sub:15-8 noodle 25'],
    [{ subject: 'math', op: '-', a: 20, b: 10 }, 'sub:20-10 bubs 32'],
    [{ subject: 'math', skill: 'col+2c' }, 'skill:col+2c noodle 27'],
    [{ subject: 'math', skill: 'col-32' }, 'skill:col-32 cloudlet 28'],
    [{ subject: 'clock', h: 4, m: 15 }, '4:15 fizz 1'],
  ];
  for (const [item, expected] of pinned) {
    const p = portraitOf(item);
    assertEqual(`${p.key} ${p.species} ${p.index}`, expected, 'a pet moved');
  }
  // And structurally, not only by sample: every addition of new material has gone on the end.
  // The first two hundred and four items are the sums, differences and methods that were there
  // before the times tables; the hundred and fifty-five after them are the times deck; then the
  // six stacked-multiplication skills, the hundred division facts, and the eight long-division
  // skills — each block appended behind the last, never inserted among it.
  const items = addSubject.ALL_ITEMS;
  assert(items.slice(0, 204).every((entry) => entry.op !== '×'), 'a times fact was inserted rather than appended');
  assertEqual(items.slice(204, 359).filter((entry) => entry.op === '×' && !entry.skill).length, 155,
    'the times deck moved');
  assert(
    items.slice(359, 365).every((entry) => Boolean(entry.skill)),
    'something other than the column-multiplication skills was appended'
  );
  assertEqual(items.slice(365, 465).filter((entry) => entry.op === '÷' && !entry.skill).length, 100,
    'the division deck moved');
  assert(
    items.slice(465).every((entry) => Boolean(entry.skill)),
    'something other than the long-division skills was appended'
  );
  assertEqual(items.length, 473, 'the ladder changed length somewhere other than its end');
});

test('a times fact hatches a pet like anything else', () => {
  for (const item of [
    { subject: 'math', op: '×', a: 7, b: 8 },
    { subject: 'math', op: '×', a: 7, b: 8, gap: true },
  ]) {
    const portrait = portraitOf(item);
    assert(SPECIES_IDS.includes(portrait.species), `${portrait.key} got no creature`);
    assert(portrait.index >= 0);
  }
  // The two are separate pets, or the grid would show one question twice.
  assert(portraitOf({ subject: 'math', op: '×', a: 7, b: 8 }).key !==
    portraitOf({ subject: 'math', op: '×', a: 7, b: 8, gap: true }).key);
});

describe('maths — the array that explains a wrong product');

test('the array is the question as it was written: a rows of b', () => {
  const plan = arrayPlan(7, 8);
  assertEqual(plan.rows, 7, 'seven times eight is seven rows of eight');
  assertEqual(plan.cols, 8);
  assertEqual(plan.cells.length, 56);
  assertEqual(plan.total, 56);
  // The running total beside each row is the skip-counting written down.
  assertEqual(plan.totals.join(), '8,16,24,32,40,48,56');
  assertEqual(plan.totals[plan.totals.length - 1], plan.total, 'the last total is the answer');
  // Every cell once, and no cell twice.
  const seen = new Set(plan.cells.map((c) => `${c.row},${c.col}`));
  assertEqual(seen.size, 56, 'a dot landed on top of another');
});

test('every product in the deck can be drawn, and drawn the same way twice', () => {
  for (const entry of mathTimes.ALL_TIMES.filter((e) => !e.gap)) {
    const plan = arrayPlan(entry.a, entry.b);
    assertEqual(plan.total, entry.a * entry.b, `${entry.id} drew the wrong number of dots`);
    assertEqual(arraySvg(entry.a, entry.b), arraySvg(entry.a, entry.b), `${entry.id} is not stable`);
  }
  // A still frame is what reduced motion and "skip the working" both ask for.
  assert(arraySvg(3, 4, { step: 0 }).includes('--ar-delay:0.00s'), 'a still frame still waits');
});

describe('maths — multiplying with the numbers stacked');

test('six rungs, and the shift is taught before it is needed', () => {
  const rungs = [31, 32, 33, 34, 35, 36].map((tier) => addSubject.tierItems(tier));
  assert(rungs.every((rows) => rows.length === 1), 'a rung holds something other than one method');
  assertEqual(
    rungs.flat().map((entry) => entry.skill).join(' '),
    'tensx colx21 colx21c colx31c colx22 colx32',
    'the rungs are not in teaching order'
  );
  // Multiplying by a whole ten comes first and is written on one line, because it is the
  // observation the shift rests on rather than a use of it.
  assert(!mathSkills.isColumn('tensx'), 'the whole-tens rung should be inline');
  assert(mathSkills.isColumn('colx22'), 'the two-by-two rung should be stacked');
});

test('the rows are the method: two partial products and their total', () => {
  assertEqual(mathColumns.mulRows(47, 38).join(), '376,1410,1786');
  // Written with its zeros on the end, not indented — the notation this game teaches.
  assertEqual(mathColumns.mulRows(247, 38).join(), '1976,7410,9386');
  // A single-digit multiplier has nothing to add up, so its answer is the one row.
  assertEqual(mathColumns.mulRows(47, 8).join(), '376');
  // A row now says where it sits as well as how wide it is, because a long division's rows step
  // across the page. A multiplication's all sit under the ones, so every one of them is place 0.
  const widths = (skill) => addSubject.answerRows({ skill }).map((row) => row.width).join();
  assertEqual(widths('colx32'), '4,5,5');
  assertEqual(widths('colx22'), '3,4,4');
  assertEqual(widths('colx21c'), '3');
  assert(
    addSubject.answerRows({ skill: 'colx32' }).every((row) => row.place === 0),
    'a partial product carries its own zeros, so it is not indented'
  );
});

test('the working never says how big the answer is going to be', () => {
  // Rows and widths are a property of the skill, so the strip is the same shape whatever
  // numbers get drawn — a stack that narrowed for a small product would hand it over.
  for (const skill of ['tensx', 'colx21', 'colx21c', 'colx31c', 'colx22', 'colx32']) {
    const rows = addSubject.answerRows({ skill });
    const seen = new Set();
    for (let seed = 1; seed <= 80; seed += 1) {
      const q = mathSkills.generate(skill, { seed });
      seen.add(JSON.stringify(addSubject.answerRows({ skill })));
      // And every question really does fit in the boxes it is given.
      const wanted = mathColumns.mulRows(q.a, q.b);
      if (!mathSkills.isColumn(skill)) {
        assert(String(q.a * q.b).length <= mathSkills.widthOf(skill), `${skill} overflows its strip`);
        continue;
      }
      assertEqual(wanted.length, rows.length, `${skill} drew ${wanted.length} rows for ${rows.length}`);
      wanted.forEach((value, i) => {
        assert(String(value).length <= rows[i].width, `${skill}: ${q.a}x${q.b} row ${i} overflows`);
      });
    }
    assertEqual(seen.size, 1, `${skill} changes shape with its numbers`);
  }
});

test('no question on these rungs multiplies by one, or by a whole ten', () => {
  // A multiplier ending in zero would ask for a row of zeros to be written out, and whole tens
  // are tier 31's own question. "23 x 1" is not a question about a method at all.
  for (const skill of ['colx21', 'colx21c', 'colx31c', 'colx22', 'colx32']) {
    for (let seed = 1; seed <= 200; seed += 1) {
      const q = mathSkills.generate(skill, { seed });
      assert(q.b % 10 !== 0, `${skill} drew ${q.a} x ${q.b}`);
      assert(q.b !== 1, `${skill} drew a multiplier of one`);
    }
  }
});

test('every step of the method agrees with the answer it comes to', () => {
  for (const skill of ['colx21', 'colx21c', 'colx31c', 'colx22', 'colx32']) {
    for (let seed = 1; seed <= 60; seed += 1) {
      const { a, b } = mathSkills.generate(skill, { seed });
      const { partials, total } = mathColumns.mulSteps(a, b);
      assertEqual(total, a * b, `${a} x ${b}`);
      // Each partial product is its own run down the multiplicand, carries and all.
      for (const partial of partials) {
        const built = mathColumns.fromDigits(partial.steps.map((step) => step.digit));
        assertEqual(built, a * partial.digit, `${a} x ${partial.digit}`);
        // A carry out of one column is the carry into the next, never anywhere else.
        partial.steps.forEach((step, i) => {
          assertEqual(step.carryIn, i === 0 ? 0 : partial.steps[i - 1].carryOut, 'a carry went astray');
          assertEqual(step.top * step.by + step.carryIn, step.carryOut * 10 + step.digit);
        });
      }
      assertEqual(partials.reduce((sum, p) => sum + p.value, 0), a * b, 'the rows do not add up');
    }
  }
});

test('each column-multiplication mistake is named, by running the mistake', () => {
  const verdict = (q, answer) => addSubject.grade(q, answer).verdict;
  const stacked = (a, b) => ({ op: '×', a, b, column: true });

  const one = stacked(47, 8); // one row: 376
  assertEqual(verdict(one, ['376']), 'correct');
  assertEqual(verdict(one, [String(mathColumns.carriedBeforeMultiplying(47, 8))]), 'mulCarriedFirst');
  assertEqual(verdict(one, [String(mathColumns.wroteFullProductInColumn(47, 8))]), 'mulFullProductInColumn');
  assertEqual(verdict(one, [String(mathColumns.forgotMulCarry(47, 8))]), 'mulForgotColCarry');
  assertEqual(verdict(one, ['55']), 'mulAddedInstead');
  assertEqual(verdict(one, ['375']), 'offByOne');
  assertEqual(verdict(one, ['476']), 'placeValueOff');
  for (const empty of [null, undefined, '', 'x', -1]) {
    assertEqual(verdict(one, [empty]), 'blank', `${JSON.stringify(empty)} became an answer`);
  }

  const two = stacked(47, 38); // 376, 1410, 1786
  assertEqual(verdict(two, ['376', '1410', '1786']), 'correct');
  // The famous one: the second row is right but sitting under the ones.
  assertEqual(verdict(two, ['376', '141', '517']), 'mulForgotShift');
  assertEqual(verdict(two, ['376', '141', String(mathColumns.forgotShift(47, 38))]), 'mulForgotShift');
  assertEqual(verdict(two, ['376', '0', '376']), 'mulOnlyOnes');

  // A wrong way that happens to give the right answer is a coincidence, not a mistake.
  assertEqual(verdict(stacked(12, 4), ['48']), 'correct', '12 x 4 has no carry to forget');
});

test('every row has to be right, and the grader says which one was not', () => {
  const two = { op: '×', a: 47, b: 38, column: true };
  const right = addSubject.grade(two, ['376', '1410', '1786']);
  assert(right.correct);
  assertEqual(right.rows.join(), 'true,true,true');

  // Multiplied correctly and then added the two rows up wrongly: not finished, so not right.
  const badTotal = addSubject.grade(two, ['376', '1410', '1785']);
  assert(!badTotal.correct, 'a wrong total passed');
  assertEqual(badTotal.row, 2, 'the total is the row that went wrong');
  assertEqual(badTotal.verdict, 'offByOne');

  const badFirst = addSubject.grade(two, ['370', '1410', '1780']);
  assertEqual(badFirst.row, 0, 'the first wrong row is the one to walk');
  assert(!badFirst.correct);
});

test('the walkthrough walks one row, and draws the rest finished', () => {
  const q = { op: '×', a: 247, b: 38 };
  const rows = [0, 1, 2].map((row) => mulWalkHtml(q, { row, width: 5, step: 1 }));
  for (const html of rows) {
    // Every row of the stack is on screen, whichever one is moving.
    assertEqual((html.match(/cw-answer/g) ?? []).length, 3, 'a row of the working went missing');
    assertEqual((html.match(/cw-rule/g) ?? []).length, 2, 'the second rule went missing');
    assert(html.includes('cw-lands'), 'nothing is being walked at all');
  }
  // Carries belong to a partial product; the final addition has none to show.
  assert(rows[0].includes('cw-mark'), 'the first row shows no carries');
  assert(!rows[2].includes('cw-mark'), 'the total should not claim carries of its own');
  // A single-digit multiplier is one row and one rule.
  const single = mulWalkHtml({ op: '×', a: 47, b: 8 }, { row: 0, width: 3, step: 1 });
  assertEqual((single.match(/cw-rule/g) ?? []).length, 1);
});

test('the stacked question offers somewhere to write every carry', () => {
  const cell = (n) => Array.from({ length: n }, () => '<span class="slot"></span>');
  const html = stackedMulMarkup(
    { a: 247, b: 38 },
    {
      width: 5,
      rows: [
        { slots: cell(4), carries: cell(5) },
        { slots: cell(5), carries: cell(5) },
        { slots: cell(5) },
      ],
    }
  );
  // One carry row per partial product, and none for the final addition — which is column
  // addition, taught eighteen rungs below this one.
  assertEqual((html.match(/cw-carries/g) ?? []).length, 2);
  assertEqual((html.match(/cw-answer/g) ?? []).length, 3);
  assertEqual((html.match(/cw-rule/g) ?? []).length, 2);
  assertEqual(addSubject.carryRows({ skill: 'colx32' }, { column: true, op: '×', a: 247, b: 38 }), 2);
  assertEqual(addSubject.carryRows({ skill: 'colx21c' }, { column: true, op: '×', a: 47, b: 8 }), 1);
  assertEqual(addSubject.carryRows({ op: '×', a: 7, b: 8 }, { op: '×', a: 7, b: 8 }), 0);
});

test('a stack of working is given longer than a single line of it', () => {
  // Three rows to write is not one row to write, and without this the scheduler would read
  // every correct answer on the last rung as a hesitant one.
  assert(
    addSubject.paceOf({ skill: 'colx32' }) > addSubject.paceOf({ skill: 'col+3' }),
    'a three-row multiplication is not given longer than a column sum'
  );
  assert(addSubject.paceOf({ skill: 'colx21c' }) <= addSubject.paceOf({ skill: 'colx32' }));
});

describe('maths — what each box is made from');

test('a column sum points at the column, not at the row', () => {
  // A column method works a column at a time — each box is its own little sum, made from the
  // two digits stacked over it and whatever came in from next door — so the ingredients belong
  // to the box and change as the cursor moves along. The carry counts: `addSteps` folds what
  // came in into the digit it produces, so it is an ingredient in the full sense.
  //
  // Note the two coordinates. A box is addressed by `data-i`, counting from the *left*, so it
  // depends on how wide the row is; everything else is a place, counting from the ones. 990 +
  // 533 is answered in four boxes, so its ones box is index 3.
  const at = (q, index) => columnIngredients(q, { index, widths: [4] });
  const sum = { op: '+', a: 990, b: 533 };
  assertEqual(
    JSON.stringify(at(sum, 3)),
    JSON.stringify({ top: 0, bottom: 0, carry: { row: 0, index: 0 }, slots: [] }),
    'the ones box is made from the ones of both numbers'
  );
  assertEqual(at(sum, 2).top, 1, 'and the box beside it from the tens');
  assertEqual(at(sum, 2).bottom, 1);
  assertEqual(at(sum, 2).carry.index, 1, 'with the carry coming into that column, not another');
  // The box the carry runs out into has no digits above it — only the carry itself.
  assertEqual(at(sum, 0).top, null, 'there is no thousands digit to point at');
  assertEqual(at(sum, 0).bottom, null);
  assertEqual(at(sum, 0).carry.index, 3);

  const difference = { op: '-', a: 837, b: 278 };
  const sub = (index) => columnIngredients(difference, { index, widths: [3] });
  assertEqual([0, 1, 2].map((i) => `${sub(i).top}${sub(i).bottom}`).join(' '), '22 11 00');
  assertEqual(sub(0).slots.length, 0, 'nothing already written is leaned on');
});

test('a stacked multiplication points at the digit pair, shift and all', () => {
  // 47 × 38 is answered on rows three, four and four boxes wide, so the same column is a
  // different box index in each of them — which is the whole reason places are the coordinate.
  const widths = [3, 4, 4];
  const q = { op: '×', a: 47, b: 38 };
  const at = (row, index) => columnIngredients(q, { row, index, widths });

  // The ones row: the multiplier's ones digit all the way along, and the multiplicand digit
  // standing over each box in turn.
  assertEqual([2, 1, 0].map((i) => at(0, i).bottom).join(''), '000', 'the same multiplier digit down the row');
  assertEqual([2, 1].map((i) => at(0, i).top).join(''), '01', 'and the multiplicand digit over the box');
  assertEqual(at(0, 0).top, null, 'nothing above the box the carry runs out into');

  // The tens row is written with its own zero on the end, so everything above it shifts a place
  // — and the box over that zero is made from nothing at all up there.
  assertEqual(at(1, 3).top, null, 'the shift zero comes from no digit');
  assertEqual(at(1, 3).bottom, 1, 'but it is still the tens of the multiplier that owns the row');
  assertEqual([2, 1].map((i) => at(1, i).top).join(''), '01', 'the multiplicand, shifted one place');

  // And the last line is the partial products added up, so that is all it points at — in the
  // same *column* of each, which is a different box in the narrower row.
  const total = at(2, 1); // place 2
  assertEqual(total.top, null);
  assertEqual(total.bottom, null, 'the question takes no part in adding the rows up');
  assertEqual(total.carry, null, 'the final addition has no carry row of its own');
  assertEqual(
    JSON.stringify(total.slots),
    JSON.stringify([{ row: 0, i: 0 }, { row: 1, i: 1 }]),
    'the same column, and so a different box index in the shorter row'
  );
  // The widest column of all reaches past the first partial product entirely.
  assertEqual(JSON.stringify(at(2, 0).slots), JSON.stringify([{ row: 1, i: 0 }]));

  // A single-digit multiplier has one row, and that row *is* the product — not a total.
  const short = columnIngredients({ op: '×', a: 47, b: 8 }, { row: 0, index: 1, widths: [3] });
  assertEqual(short.bottom, 0, 'the only multiplier digit there is');
  assertEqual(short.slots.length, 0, 'there is nothing to add up');
});

test('no box is ever made from a digit that is not there', () => {
  // Across every question the column rungs can generate. A cited place must exist in the number
  // it belongs to, a cited carry must sit inside the scratch row the question actually has, and
  // a cited box must be in the same column as the one being written.
  for (const skill of ['col+2c', 'col+3', 'col-2b', 'col-3', 'colx21c', 'colx31c', 'colx22', 'colx32']) {
    const widths = addSubject.answerRows({ skill }).map((row) => row.width);
    for (const shape of mathSkills.shapesOf(skill)) {
      for (let seed = 1; seed <= 40; seed += 1) {
        const q = mathSkills.generate(skill, { shape, seed });
        const carries = addSubject.carryRows({ skill }, q);
        for (let row = 0; row < widths.length; row += 1) {
          for (let index = 0; index < widths[row]; index += 1) {
            const place = widths[row] - 1 - index;
            const used = columnIngredients(q, { row, index, widths });
            const inside = (n, at) => at === null || (at >= 0 && at < String(n).length);
            assert(inside(q.a, used.top), `${skill} ${q.a}·${q.b} pointed past the top number`);
            assert(inside(q.b, used.bottom), `${skill} ${q.a}·${q.b} pointed past the bottom number`);
            if (used.carry) {
              assert(used.carry.row < carries, `${skill} cited a carry row that is not drawn`);
              assertEqual(used.carry.index, place, `${skill} cited a carry from another column`);
            }
            for (const slot of used.slots) {
              assert(slot.row < widths.length, `${skill} leaned on a row that is not there`);
              assert(slot.i >= 0 && slot.i < widths[slot.row], `${skill} leaned on a box off the end of its row`);
              assertEqual(
                widths[slot.row] - 1 - slot.i,
                place,
                `${skill} leaned on a box in another column`
              );
            }
          }
        }
      }
    }
  }
});

describe('maths — the division facts');

const DIV_SKILLS = ['div10', 'div21', 'div21x', 'div21s', 'div31', 'div31z', 'div21r', 'div31r'];

test('a hundred divisions, both ways round, on six rungs', () => {
  // Both ways because they are two different things to know: how many eights fit inside
  // fifty-six is not the same piece of knowing as how many sevens do. A square pair has only
  // one direction to be asked in, which is why it is a hundred rather than a hundred and ten.
  assertEqual(mathDivFacts.ALL_DIV_FACTS.length, 100);
  const tiers = new Set(mathDivFacts.ALL_DIV_FACTS.map((fact) => fact.tier));
  assertEqual([...tiers].sort((x, y) => x - y).join(','), '37,38,39,40,41,42');
});

test('the rungs partition the deck, so each one can actually be finished', () => {
  // `tierMastery` divides by the size of a rung. A fact counted twice would make one
  // impossible to finish, and a fact counted nowhere would make it impossible to start.
  const counted = [37, 38, 39, 40, 41, 42].flatMap((tier) =>
    mathDivFacts.divTierItems(tier).map((fact) => fact.id)
  );
  assertEqual(counted.length, 100, 'a fact landed on two rungs, or on none');
  assertEqual(new Set(counted).size, 100);
});

test('both directions of a pair sit on the same rung', () => {
  // They are the same picture read two ways, and the rungs are strategies rather than sizes —
  // so `56 : 8` and `56 : 7` are met together, leaning on the one product underneath them both.
  assertEqual(mathDivFacts.tierOf({ a: 56, b: 8 }), mathDivFacts.tierOf({ a: 56, b: 7 }));
  assertEqual(mathDivFacts.tierOf({ a: 10, b: 1 }), 37, 'dividing by one is not a strategy rung');
  assertEqual(mathDivFacts.tierOf({ a: 49, b: 7 }), 40, 'a square belongs with the squares');
});

test('an id that describes nothing is refused rather than rounded off', () => {
  // Refused rather than normalised, exactly as `mul:7x3` is: it would otherwise be possible to
  // hold two pets for one fact, or one pet for a fact this game does not teach.
  assert(mathDivFacts.owns('div:56/8'), '56 : 8 is a fact this game teaches');
  assert(!mathDivFacts.owns('div:57/8'), 'eight does not go into fifty-seven');
  assert(!mathDivFacts.owns('div:110/11'), 'eleven is off the end of the tables');
  assert(!mathDivFacts.owns('div:0/5'), 'nothing shared out is not a question');
  for (const fact of mathDivFacts.ALL_DIV_FACTS) {
    assertEqual(mathDivFacts.idOf(mathDivFacts.parse(fact.id)), fact.id, `${fact.id} did not round-trip`);
  }
});

test('a division closes on the product it is the flip side of', () => {
  // What the correction says: "you know 7 × 8 = 56". A sentence about something already
  // mastered rather than a new rule to hold.
  const { a, b } = mathDivFacts.partnerOf({ a: 56, b: 8 });
  assertEqual(`${a}x${b}`, '7x8');
  assertEqual(mathTimes.timesIdOf(mathDivFacts.partnerOf({ a: 56, b: 7 })), 'mul:7x8', 'both ways lean on one product');
});

test('every way of getting a division fact wrong has a name', () => {
  const verdict = (a, b, answer) => mathDivFacts.grade({ a, b }, String(answer)).verdict;
  assertEqual(verdict(56, 8, 7), 'correct');
  assertEqual(verdict(56, 8, 56), 'divGaveDividend', 'that is the number being shared out');
  assertEqual(verdict(56, 8, 8), 'divGaveDivisor', 'that is how many it is shared between');
  assertEqual(verdict(56, 8, 48), 'divTookAway', 'taken away rather than shared out');
  assertEqual(verdict(56, 8, 448), 'divMultiplied');
  assertEqual(verdict(56, 8, 6), 'offByOne');
  assertEqual(verdict(56, 8, 3), 'divNeighbour', 'a real quotient, just not this one');
  assertEqual(mathDivFacts.grade({ a: 56, b: 8 }, '').verdict, 'blank', 'an empty strip never means zero');
  assert(mathDivFacts.grade({ a: 56, b: 8 }, '6').nearMiss, 'one group out is a miscount');
  assert(!mathDivFacts.grade({ a: 56, b: 8 }, '48').nearMiss, 'a misread sign is not "nearly"');
});

describe('maths — long division');

test('the working comes out right, for every question the rungs can ask', () => {
  for (let b = 2; b <= 9; b += 1) {
    for (let a = 10; a <= 999; a += 1) {
      const steps = mathDivide.divSteps(a, b);
      const quotient = Number(steps.map((step) => step.digit).join(''));
      assertEqual(quotient, Math.floor(a / b), `${a} : ${b} came out wrong`);
      assertEqual(steps[steps.length - 1].remainder, a % b, `${a} : ${b} left the wrong amount`);
    }
  }
});

test('the first step takes two digits exactly when the first one is too small', () => {
  // `456 : 8` starts at 45, not at 4, and the answer is two digits rather than three with a
  // nothing on the front — nobody writes 056.
  assertEqual(mathDivide.divSteps(456, 8).length, 2, 'the quotient should be shorter than the dividend');
  assertEqual(mathDivide.divSteps(456, 8)[0].working, 45);
  assertEqual(mathDivide.divSteps(846, 8).length, 3, 'eight goes into eight, so every digit gets a turn');
  assertEqual(mathDivide.divSteps(846, 8)[0].working, 8);
});

test('each step takes exactly the digits it should from the number being divided', () => {
  // What the prompt lights up while the child works, so it has to be right about which digits
  // are in play: one normally, two on a first step that had to reach for the digit beside it.
  const taken = (a, b) =>
    mathDivide.divSteps(a, b).map((_, k) => mathDivide.stepDigits(a, b, k).join('')).join(' ');
  assertEqual(taken(456, 8), '01 2', 'a short first step takes the four and the five together');
  assertEqual(taken(56, 8), '01', 'and takes both when that is the whole number');
  assertEqual(taken(661, 4), '0 1 2', 'otherwise one digit comes down at a time');
  assertEqual(taken(840, 4), '0 1 2');

  // And structurally, across every question the rungs can ask: the steps tile the number being
  // divided exactly once, in order, in unbroken runs — and each step's working number really is
  // built from the digits it claims plus whatever came down from the step before.
  for (let b = 2; b <= 9; b += 1) {
    for (let a = 10; a <= 999; a += 1) {
      const steps = mathDivide.divSteps(a, b);
      const digits = mathDivide.digitsOf(a);
      const seen = [];
      steps.forEach((step, k) => {
        const run = mathDivide.stepDigits(a, b, k);
        assert(run.length > 0, `${a} : ${b} step ${k} takes no digit at all`);
        assert(run.every((i, j) => j === 0 || i === run[j - 1] + 1), `${a} : ${b} step ${k} skipped a digit`);
        const took = Number(run.map((i) => digits[i]).join(''));
        const carried = k === 0 ? 0 : steps[k - 1].remainder;
        assertEqual(step.working, carried * 10 ** run.length + took, `${a} : ${b} step ${k} divides into something else`);
        seen.push(...run);
      });
      assertEqual(seen.join(','), digits.map((_, i) => i).join(','), `${a} : ${b} does not use every digit once`);
    }
  }
});

test('every row says what it is made from, and never more than that', () => {
  // What the prompt lights up beside the row being written. Getting this wrong would point a
  // child at the wrong two numbers, which is worse than pointing at none.
  const rows = mathDivide.rowShape(3, 3); // 661 : 4 — three digits in, three out
  const of = (i) => ingredientsFor(661, 4, rows[i]);

  // The answer digit: how many fours fit into the digit being divided. That digit, and the four.
  assertEqual(of(0).digits.join(''), '0');
  assertEqual(of(0).divisor, true, 'you cannot divide without the divisor');
  assertEqual(of(0).quotientStep, null, 'nothing has been written to lean on yet');

  // The product: the answer digit just written, times the divisor — and *not* the number being
  // divided, which takes no part in the multiplication.
  assertEqual(of(1).digits.join(''), '', 'the number being divided is not an ingredient here');
  assertEqual(of(1).divisor, true);
  assertEqual(of(1).quotientStep, 0, 'it is that step’s own answer digit that gets multiplied');

  // What is left: the subtraction is the two rows right above it, so what gets named is the one
  // thing that is easy to miss — which digit comes down next.
  assertEqual(of(2).digits.join(''), '1', 'the next digit along comes down');
  assertEqual(of(2).divisor, false, 'nothing is divided on this row');
  assertEqual(of(2).quotientStep, null);

  // And the last row of all has no step after it, so it names nothing at all.
  const last = rows[rows.length - 1];
  assertEqual(last.kind, 'remainder');
  assertEqual(ingredientsFor(661, 4, last).digits.length, 0, 'there is nothing left to come down');

  // A short first step takes two digits, and both are ingredients of the first answer digit.
  const short = mathDivide.rowShape(1, 2); // 24 : 4 — two digits in, one out
  assertEqual(ingredientsFor(24, 4, short[0]).digits.join(''), '01', 'the two and the four together');

  // Across every question the rungs can ask: an ingredient is only ever a digit that exists, and
  // the divisor is wanted on exactly the rows that use it.
  for (let b = 2; b <= 9; b += 1) {
    for (let a = 10; a <= 999; a += 1) {
      const shape = mathDivide.rowShape(mathDivide.divSteps(a, b).length, mathDivide.digitsOf(a).length);
      const width = mathDivide.digitsOf(a).length;
      for (const row of shape) {
        const used = ingredientsFor(a, b, row);
        assert(
          used.digits.every((i) => i >= 0 && i < width),
          `${a} : ${b} pointed at a digit that is not there`
        );
        assertEqual(used.divisor, row.kind !== 'remainder', `${a} : ${b} ${row.kind} wants the divisor`);
        assertEqual(
          used.quotientStep,
          row.kind === 'product' ? row.step : null,
          `${a} : ${b} ${row.kind} leans on the wrong answer digit`
        );
      }
    }
  }
});

test('the rows are the working as it is written, in the order it is written', () => {
  // Quotient digit, then what it takes away, then what is left with the next digit down beside
  // it. The last remainder row is the remainder itself, which is why there is no extra box.
  const rows = mathDivide.divRows(456, 8);
  assertEqual(rows.map((row) => row.value).join(','), '5,40,56,7,56,0');
  assertEqual(rows.map((row) => row.kind).join(','), 'quotient,product,remainder,quotient,product,remainder');
  assertEqual(mathDivide.divRows(457, 8).map((row) => row.value).join(','), '5,40,57,7,56,1');
});

test('the answer strip and the walkthrough lay the rows out in the same places', () => {
  // One description of where the working goes — `rowShape` — read by both, so the boxes a child
  // types into and the working the correction draws cannot end up in different columns.
  for (const skill of DIV_SKILLS.slice(1)) {
    const digits = mathSkills.digitsOf(skill);
    const quotient = mathSkills.quotientDigitsOf(skill);
    const declared = mathSkills.rowsOf(skill);
    const shape = mathDivide.rowShape(quotient, digits);
    assertEqual(declared.length, shape.length, `${skill} declares a different number of rows`);
    for (let i = 0; i < shape.length; i += 1) {
      assertEqual(declared[i].width, shape[i].width, `${skill} row ${i} is a different width`);
      assertEqual(declared[i].place, shape[i].place, `${skill} row ${i} sits in a different column`);
    }
  }
});

test('every row fits on the page, and every number fits in its row', () => {
  // A product row a box too wide would run off the left of the stack; a value a digit too long
  // for its row would be silently cut in half. Both are layout bugs that only show up on the
  // one question in a thousand that produces them, so they are checked across all of them.
  for (const skill of DIV_SKILLS.slice(1)) {
    const cols = mathSkills.digitsOf(skill);
    for (const row of mathSkills.rowsOf(skill)) {
      if (row.line === 'q') continue;
      const { start, end } = spanOf(cols, row);
      assert(start >= 1, `${skill} has a row running off the left`);
      assert(end <= cols + 1, `${skill} has a row running off the right`);
      assertEqual(end - start, row.width, `${skill} lost a box off the edge`);
    }
  }
  for (let b = 2; b <= 9; b += 1) {
    for (let a = 10; a <= 999; a += 1) {
      for (const row of mathDivide.divRows(a, b)) {
        assert(String(row.value).length <= row.width, `${a} : ${b} wrote ${row.value} into ${row.width} boxes`);
      }
    }
  }
});

test('eight rungs, each asking for the shape it says it does', () => {
  // A shape the generator cannot find is a rung that can never finish covering itself, which
  // would leave the top of the ladder unable to graduate.
  for (const skill of DIV_SKILLS) {
    const wanted = mathSkills.shapesOf(skill);
    assert(wanted.length > 0, `${skill} declares no cases at all`);
    for (const shape of wanted) {
      const drawn = new Set();
      for (let seed = 1; seed <= 200; seed += 1) {
        drawn.add(mathSkills.generate(skill, { shape, seed }).shape);
      }
      assertEqual([...drawn].join(','), shape, `${skill} could not reliably draw ${shape}`);
    }
  }
});

test('a rung never asks outside the band it promises', () => {
  // The quotient's length is what fixes the height of the stack, so a rung that quietly drew a
  // shorter answer would have a stack that said how the division was going to come out.
  for (const skill of DIV_SKILLS.slice(1)) {
    const digits = mathSkills.digitsOf(skill);
    const quotient = mathSkills.quotientDigitsOf(skill);
    for (const shape of mathSkills.shapesOf(skill)) {
      for (let seed = 1; seed <= 200; seed += 1) {
        const q = mathSkills.generate(skill, { shape, seed });
        assertEqual(String(q.a).length, digits, `${skill} drew a ${String(q.a).length}-digit number`);
        assertEqual(mathDivide.divSteps(q.a, q.b).length, quotient, `${skill} drew a different-length answer`);
        assert(q.b >= 2 && q.b <= 9, `${skill} drew ${q.b} as a divisor`);
      }
    }
  }
});

test('exact rungs are exact and the remainder rungs always leave something', () => {
  const leaves = { div21r: true, div31r: true };
  for (const skill of DIV_SKILLS.slice(1)) {
    for (const shape of mathSkills.shapesOf(skill)) {
      const q = mathSkills.generate(skill, { shape, seed: 11 });
      assertEqual(q.a % q.b > 0, Boolean(leaves[skill]), `${skill} drew the wrong kind of question`);
    }
  }
});

test('every mistake in the working is named by running it', () => {
  // The same testable-by-construction property the column methods have: run the wrong
  // procedure, feed its output back to the grader, and the verdict must come back.
  const answerFor = (a, b, { quotient = null, tweak = null } = {}) => {
    const rows = mathDivide.divRows(a, b);
    const digits = quotient === null ? null : String(quotient).split('').map(Number);
    let at = 0;
    const out = rows.map((row) =>
      row.kind === 'quotient' && digits ? String(digits[at++] ?? '') : String(row.value)
    );
    if (tweak) tweak(out, rows);
    return out;
  };
  const verdict = (a, b, answer) => gradeDivide({ a, b }, answer).verdict;

  assertEqual(verdict(456, 8, answerFor(456, 8)), 'correct');
  assertEqual(verdict(456, 8, answerFor(456, 8).map((v, i) => (i ? v : ''))), 'blank');

  for (const [named, run, a, b] of [
    ['divDroppedRemainder', mathDivide.droppedRemainder, 456, 8],
    ['divBackwards', mathDivide.dividedBackwards, 618, 6],
    ['divSubInstead', mathDivide.dividedSubtractedInstead, 84, 4],
    ['divMulInstead', mathDivide.dividedMultipliedInstead, 242, 2],
  ]) {
    const wrote = run(a, b);
    assertEqual(String(wrote).length, mathDivide.divSteps(a, b).length, `${named} cannot be written here`);
    assert(wrote !== Math.floor(a / b), `${named} happens to be right for ${a} : ${b}`);
    assertEqual(verdict(a, b, answerFor(a, b, { quotient: wrote })), named);
  }

  // And the three that live in one step rather than in the whole method.
  const at = (a, b, kind, pick = () => true) =>
    mathDivide.divRows(a, b).findIndex((row) => row.kind === kind && pick(row));
  assertEqual(
    verdict(456, 8, answerFor(456, 8, { tweak: (out) => { out[at(456, 8, 'remainder')] = '5'; } })),
    'divForgotBringDown',
    'the digit that should have come down never did'
  );
  assertEqual(
    verdict(457, 8, answerFor(457, 8, { tweak: (out) => { out[out.length - 1] = '0'; } })),
    'divIgnoredRemainder',
    'what was left over was rubbed out'
  );
  assertEqual(
    verdict(618, 6, answerFor(618, 6, {
      tweak: (out) => { out[at(618, 6, 'quotient', (row) => row.value === 0)] = '1'; },
    })),
    'divZeroStep',
    'something written where the step comes to nothing'
  );

  const slipBy = (a, b, by) =>
    answerFor(a, b, { tweak: (out, rows) => { out[at(a, b, 'product')] = String(rows[at(a, b, 'product')].value + by); } });
  assertEqual(verdict(456, 8, slipBy(456, 8, 1)), 'offByOne');
  assertEqual(verdict(456, 8, slipBy(456, 8, 10)), 'placeValueOff');
  assertEqual(verdict(456, 8, slipBy(456, 8, 23)), 'wrong');
});

test('a wrong way that happens to be right is a coincidence, not a mistake', () => {
  // 242 : 2 has no column that needs turning round, so running it backwards gives the right
  // answer — and a child who wrote it has not made that mistake.
  assertEqual(mathDivide.dividedBackwards(242, 2), 121, 'this is the case the guard is for');
  const rows = mathDivide.divRows(242, 2).map((row) => String(row.value));
  assertEqual(gradeDivide({ a: 242, b: 2 }, rows).verdict, 'correct');
});

test('the stack is written out the way it is written on paper', () => {
  // Every row under the digits it came from: the product under the number it was taken from,
  // what is left under the next digit along, and a rule spanning exactly the subtraction.
  assertEqual(walkCols(456), 3);
  // 456 : 8 is the `shortFirst` shape — three digits in, two out — so its rows are the ones
  // `div21s` would declare for a longer dividend rather than `div21`'s.
  const rows = mathDivide.rowShape(2, 3);
  assertEqual(JSON.stringify(spanOf(3, rows[1])), JSON.stringify({ start: 1, end: 3 }), 'the product sits under 45');
  assertEqual(JSON.stringify(spanOf(3, rows[2])), JSON.stringify({ start: 2, end: 4 }), 'what is left sits under 56');
  // And a rung that divides every digit starts under the first one alone: 84 : 4 takes 8 away
  // from 8, which is one column wide, not two.
  assertEqual(JSON.stringify(spanOf(2, mathSkills.rowsOf('div21')[1])), JSON.stringify({ start: 1, end: 2 }));
  assertEqual(stepOfRow(0), 0);
  assertEqual(stepOfRow(4), 1, 'three rows to a step');

  const html = dividedMarkup({ a: 456, b: 8 }, {
    sign: ':',
    rows: rows.map((row) => ({ ...row, slots: new Array(row.width).fill('<span class="slot"></span>') })),
  });
  assert(html.includes('--dw-cols:3'), 'the stack is as wide as the dividend');
  assertEqual((html.match(/class="slot"/g) ?? []).length, 9, 'every box the answer needs is on screen');
  assert(html.includes('<i class="dw-op">:</i>'), 'the sign the child was taught');
});

test('the walkthrough starts at the step that went wrong and not before', () => {
  // A child who got the first two steps right does not need to watch them done again, and a
  // three-digit answer worked through in full is nine rows on every miss.
  const whole = divideWalkHtml({ a: 618, b: 6 }, { step: 1, from: 0 });
  const late = divideWalkHtml({ a: 618, b: 6 }, { step: 1, from: 2 });
  const moving = (html) => (html.match(/dw-mark/g) ?? []).length;
  assert(moving(late) < moving(whole), 'the late walk animates as much as the whole one');
  assert(whole.includes('--dw-delay:0.00s'), 'the first step moves straight away');
  assert(divideWalkHtml({ a: 456, b: 8 }, { step: 0 }).includes('--dw-delay:0.00s'), 'a still frame is one frame');
});

test('sharing out deals a round at a time, and the leftovers stand apart', () => {
  // The lesson is "one each, and one each again" — not counting all fifty-six.
  const plan = sharePlan(56, 8);
  assertEqual(plan.rounds, 7);
  assertEqual(plan.left, 0);
  assertEqual(plan.counts.join(','), '8,16,24,32,40,48,56', 'the skip-counting written down');
  assertEqual(plan.dots.length, 56);
  assertEqual(sharePlan(57, 8).left, 1, 'not enough to go round, so nobody gets one');
  assert(shareSvg(56, 8).includes('sh-dot'), 'a picture for a fact');
  assert(shareSvg(57, 8).includes('sh-spare'), 'the leftover is drawn, not dropped');
  assertEqual(shareSvg(450, 10), '', 'four hundred and fifty dots is a wall, not a picture');
});

describe('maths — every mistake has something to say about it');

test('every verdict has a sentence, in both languages', () => {
  // Driven off the verdict list rather than a hand-kept copy of it, so a new verdict without
  // a sentence fails here rather than showing a child a raw key.
  const keys = {
    offByOne: 'teach.sumOffByOne',
    transposed: 'teach.sumTransposed',
    gaveAddend: 'teach.sumGaveAddend',
    gaveDifference: 'teach.sumGaveDifference',
    gaveSum: 'teach.subGaveSum',
    reversed: 'teach.subReversed',
    gaveOperand: 'teach.subGaveOperand',
    wroteFullSumInColumn: 'teach.colFullSum',
    forgotCarry: 'teach.colForgotCarry',
    carriedWrongColumn: 'teach.colCarryWrongColumn',
    carriedIntoOwnColumn: 'teach.colCarriedIntoOwnColumn',
    smallerFromLarger: 'teach.colSmallerFromLarger',
    forgotBorrow: 'teach.colForgotBorrow',
    borrowAcrossZero: 'teach.colBorrowAcrossZero',
    addedInstead: 'teach.colAddedInstead',
    subtractedInstead: 'teach.colSubtractedInstead',
    placeValueOff: 'teach.colPlaceValueOff',
    mulGaveSum: 'teach.mulGaveSum',
    mulGaveFactor: 'teach.mulGaveFactor',
    mulOffByOneRow: 'teach.mulOffByOneRow',
    mulNeighbour: 'teach.mulNeighbour',
    gapGaveProduct: 'teach.gapGaveProduct',
    gapGaveFactor: 'teach.gapGaveFactor',
    gapTookAway: 'teach.gapTookAway',
    mulForgotShift: 'teach.mulColForgotShift',
    mulCarriedFirst: 'teach.mulColCarriedFirst',
    mulFullProductInColumn: 'teach.mulColFullProduct',
    mulForgotColCarry: 'teach.mulColForgotCarry',
    mulOnlyOnes: 'teach.mulColOnlyOnes',
    mulAddedInstead: 'teach.mulColAddedInstead',
    divGaveDividend: 'teach.divGaveDividend',
    divGaveDivisor: 'teach.divGaveDivisor',
    divTookAway: 'teach.divTookAway',
    divMultiplied: 'teach.divMultiplied',
    divNeighbour: 'teach.divNeighbour',
    divForgotBringDown: 'teach.divForgotBringDown',
    divIgnoredRemainder: 'teach.divIgnoredRemainder',
    divZeroStep: 'teach.divZeroStep',
    divDroppedRemainder: 'teach.divDroppedRemainder',
    divBackwards: 'teach.divBackwards',
    divMulInstead: 'teach.divMulInstead',
    divSubInstead: 'teach.divSubInstead',
  };
  // `correct`, `blank` and `wrong` are the three with nothing to name: they get the plain
  // closing sentence rather than a diagnosis.
  const named = ALL_VERDICTS.filter((v) => !['correct', 'blank', 'wrong'].includes(v));
  for (const verdict of named) {
    assert(keys[verdict], `${verdict} has no sentence at all`);
    for (const lang of ['nb', 'en']) {
      const t = translator(lang);
      assert(t(keys[verdict]) !== keys[verdict], `${lang} has no sentence for ${verdict}`);
    }
  }
});

test('every rung and every group is named and described, in both languages', () => {
  for (const lang of ['nb', 'en']) {
    const t = translator(lang);
    for (const tier of addSubject.TIERS) {
      assert(t(`tier.math.${tier.id}.name`) !== `tier.math.${tier.id}.name`, `${lang} rung ${tier.id} name`);
      assert(t(`tier.math.${tier.id}.blurb`) !== `tier.math.${tier.id}.blurb`, `${lang} rung ${tier.id} blurb`);
    }
    for (const group of addSubject.GROUPS) {
      assert(t(`group.${group.id}`) !== `group.${group.id}`, `${lang} group ${group.id}`);
    }
    for (const entry of mathSkills.ALL_SKILLS) {
      assert(t(`skill.${entry.skill}`) !== `skill.${entry.skill}`, `${lang} has no collar for ${entry.skill}`);
    }
  }
});

test('a column sum can be said out loud, past twenty and past a hundred', () => {
  // The aria-label is the whole question for anyone not looking at the screen, and the deck
  // now reaches into the thousands.
  assertEqual(numberWordOf('nb', 47), 'førtisju', 'Norwegian runs it together');
  assertEqual(numberWordOf('nb', 21), 'tjueen', 'and drops the accent inside a compound');
  assertEqual(numberWordOf('en', 47), 'forty-seven');
  assertEqual(numberWordOf('nb', 405), 'fire hundre og fem');
  assertEqual(numberWordOf('en', 405), 'four hundred and five');
  assertEqual(numberWordOf('en', 1998), 'one thousand nine hundred and ninety-eight');
  for (const lang of ['nb', 'en']) {
    for (let n = 0; n <= 1998; n += 1) {
      assert(!/\d/.test(numberWordOf(lang, n)), `${lang} fell back to digits at ${n}`);
    }
  }
});


describe('eggs — no two the same');

test('an egg is stable: the same pet always gets the same egg', () => {
  // A child is waiting on *this* egg. One that changed shape between two glances would be a
  // different egg, and the whole point of it is that it is theirs.
  for (const species of SPECIES_IDS.slice(0, 6)) {
    for (const index of [0, 1, 7, 23]) {
      const once = eggLookFrom({ species, index });
      const twice = eggLookFrom({ species, index });
      assertEqual(JSON.stringify(once), JSON.stringify(twice), `${species}/${index}`);
    }
  }
});

test('two eggs side by side differ in every way at once', () => {
  // Not "a speckle moved": a child does not notice that. The strides are chosen so that
  // neighbours change size, shape, pattern and colour together.
  for (const species of SPECIES_IDS) {
    for (let i = 0; i < 12; i += 1) {
      const a = eggLookFrom({ species, index: i });
      const b = eggLookFrom({ species, index: i + 1 });
      assert(a.size !== b.size, `${species}: ${i} and ${i + 1} are the same size`);
      assert(a.shape !== b.shape, `${species}: ${i} and ${i + 1} are the same shape`);
      assert(a.pattern !== b.pattern, `${species}: ${i} and ${i + 1} wear the same pattern`);
      assert(a.tint.id !== b.tint.id, `${species}: ${i} and ${i + 1} are the same colour`);
    }
  }
});

test('a zoo of one species meets every pattern, every size and every shape', () => {
  // Twenty-odd eggs of a species is roughly what a full zoo holds, and a look nobody ever
  // sees is a look that need not exist.
  const seen = { pattern: new Set(), size: new Set(), shape: new Set(), tint: new Set() };
  for (let i = 0; i < 24; i += 1) {
    const look = eggLookFrom({ species: 'mochi', index: i });
    seen.pattern.add(look.pattern);
    seen.size.add(look.size);
    seen.shape.add(look.shape);
    seen.tint.add(look.tint.id);
  }
  assertEqual(seen.pattern.size, EGG_PATTERNS.length, 'a pattern never came up');
  assertEqual(seen.size.size, EGG_SIZES.length, 'a size never came up');
  assertEqual(seen.shape.size, EGG_SHAPES.length, 'a shape never came up');
  assertEqual(seen.tint.size, EGG_TINTS.length, 'a tint never came up');
});

test('two species do not run through the same eggs in the same order', () => {
  const line = (species) =>
    Array.from({ length: 8 }, (_, i) => {
      const look = eggLookFrom({ species, index: i });
      return `${look.size}${look.shape}${look.pattern}`;
    }).join('|');
  const lines = SPECIES_IDS.map(line);
  assert(new Set(lines).size > 1, 'every species lays exactly the same eggs in the same order');
});

test('not one speckle hangs off the side of the egg', () => {
  // The single thing that would make the whole idea look broken. Checked against the shell's
  // own width rather than by eye, for every mark of every pattern.
  for (const pattern of EGG_PATTERNS) {
    for (const mark of eggMarksFor(pattern)) {
      const half = shellHalfWidth(mark.y);
      assert(half > 0, `${pattern}: a mark at y=${mark.y} is off the end of the shell`);
      const reach = mark.kind === 'dot' ? Math.abs(mark.x - 50) + mark.r : mark.rx;
      assert(
        reach <= half,
        `${pattern}: a ${mark.kind} reaches ${reach.toFixed(1)} where the shell is only ${half.toFixed(1)}`
      );
    }
  }
});

test('the shell is widest at its waist and comes to nothing at both ends', () => {
  assertEqual(shellHalfWidth(12), 0, 'the top');
  assertEqual(shellHalfWidth(90), 0, 'the bottom');
  assertEqual(shellHalfWidth(4), 0, 'and above the top there is no shell at all');
  assertClose(shellHalfWidth(58), 30, 1e-9, 'the waist');
  assert(shellHalfWidth(40) < shellHalfWidth(58), 'it narrows going up');
  assert(shellHalfWidth(80) < shellHalfWidth(58), 'and going down');
});

test('every pattern but the plain one actually puts something on the shell', () => {
  assertEqual(eggMarksFor('plain').length, 0);
  for (const pattern of EGG_PATTERNS.filter((p) => p !== 'plain')) {
    assert(eggMarksFor(pattern).length > 0, `${pattern} draws nothing`);
  }
  assertEqual(eggMarksFor('nonsense').length, 0, 'and an unknown pattern is simply plain');
});

test('a plain egg is glossy, so it reads as plain rather than as unfinished', () => {
  let plains = 0;
  for (const species of SPECIES_IDS) {
    for (let i = 0; i < 24; i += 1) {
      const look = eggLookFrom({ species, index: i });
      if (look.pattern !== 'plain') continue;
      plains += 1;
      assert(look.glint, `${species}/${i} is a bare shell with nothing on it at all`);
    }
  }
  assert(plains > 0, 'no plain eggs came up to check');
});

test('the whole egg scales together, cracks and all', () => {
  // The cracks are drawn for one shell at one size. They only stay on a small or a tall egg
  // because they sit inside the same scaled group the shell does.
  const svg = eggSvg({ species: 'mochi', index: 1 }, { cracks: EGG_CRACK_MAX });
  const body = svg.slice(svg.indexOf('<g class="egg-body"'));
  assert(/class="egg-body" transform="translate\([\d.]+ [\d.]+\) scale\([\d.]+ [\d.]+\)/.test(svg), 'no scale');
  for (let i = 1; i <= EGG_CRACK_MAX; i += 1) {
    assert(body.includes(`egg-crack-${i}`), `crack ${i} is outside the scaled group`);
  }
  assert(body.includes('egg-shell'), 'the shell is outside the scaled group');
});

test('an egg is drawn in its own pet\'s colours and nobody else\'s', () => {
  // The egg is a promise about what is inside it.
  for (const species of SPECIES_IDS) {
    const svg = eggSvg({ species, index: 3 });
    const palette = SPECIES[species].palette;
    for (const colour of svg.match(/#[0-9a-f]{6}/gi) ?? []) {
      assert(palette.includes(colour), `${species}'s egg is wearing ${colour}`);
    }
  }
});

test('a bare species id still draws an egg, as it always did', () => {
  // Two callers hand over a portrait; the unlock exemplars and the tests hand over a name.
  const svg = eggSvg('mochi', { cracks: 1 });
  assert(svg.includes('egg-shell'), 'a species id no longer draws anything');
  assert(svg.includes('egg-crack-1'));
  assertEqual(eggLookFrom({ species: 'nonsense' }).species, 'mochi', 'and an unknown species falls back');
  assert(eggSvg('nonsense').includes('egg-shell'), 'rather than throwing');
});

describe('the ten-frame');

test('seven and eight fills the first ten, then spills', () => {
  const plan = fillPlan(7, 8);
  assertEqual(plan.total, 15);
  assertEqual(plan.bridge, 3, 'three of the eight finish the ten');
  assertEqual(plan.rest, 5, 'and five are left over');
  assertEqual(plan.frames, 2);
  assertEqual(plan.cells.filter((c) => c.frame === 0).length, FRAME);
  assertEqual(plan.cells.filter((c) => c.bridges).length, 3, 'and those three are marked');
});

test('the two addends stay tellable apart', () => {
  const plan = fillPlan(7, 8);
  assertEqual(plan.cells.filter((c) => c.from === 'a').length, 7);
  assertEqual(plan.cells.filter((c) => c.from === 'b').length, 8);
});

test('a sum that stays under ten bridges nothing', () => {
  const plan = fillPlan(3, 5);
  assertEqual(plan.frames, 1);
  assertEqual(plan.cells.filter((c) => c.bridges).length, 0, 'nothing was completed');
});

test('the corners hold', () => {
  assertEqual(fillPlan(0, 0).total, 0);
  assertEqual(fillPlan(0, 0).frames, 1, 'there is always a frame to look at');
  assertEqual(fillPlan(10, 10).total, 20);
  assertEqual(fillPlan(10, 10).frames, 2);
  assertEqual(fillPlan(10, 10).bridge, 0, 'the first ten was already full');
});

test('every counter lands in a real cell', () => {
  for (const fact of addSubject.ALL_ITEMS) {
    for (const cell of fillPlan(fact.a, fact.b).cells) {
      assert(cell.row >= 0 && cell.row < 2, `row out of range for ${fact.id}`);
      assert(cell.col >= 0 && cell.col < 5, `column out of range for ${fact.id}`);
    }
  }
});

test('the picture waits exactly as long as it takes to draw', () => {
  assert(fillDuration(10, 10) > fillDuration(1, 1), 'a bigger sum takes longer');
  assert(tenFrameSvg(7, 8).includes('tf-bridge'), 'the bridging counters reach the markup');
});

describe('adding — pets, homes and milestones');

test('a fact hatches a pet of its own', () => {
  const portrait = portraitOf({ subject: 'math', a: 7, b: 8 });
  assertEqual(portrait.key, 'add:7+8');
  assertEqual(portrait.species, speciesForFact(7, 8));
  assert(portrait.index >= 0);
});

test('learning to add did not repaint the zoo', () => {
  // Trait indices decide appearance and name, and the clock's were handed out first.
  assertEqual(traitIndexFor(4, 15), timesOfSpecies(speciesFor(4, 15)).indexOf('4:15'));
  assertEqual(petName({ subject: 'clock', h: 4, m: 15 }, 'nb'), defaultName(4, 15, 'nb'));
});

test('no two pets of one species share a name', () => {
  for (const species of SPECIES_IDS) {
    const names = itemsOfSpecies(species).map((id) => {
      const payload = addSubject.parse(id);
      return payload
        ? petName({ subject: 'math', ...payload }, 'nb')
        : petName({ subject: 'clock', ...parseTimeId(id) }, 'nb');
    });
    assertEqual(new Set(names).size, names.length, `${species} has a repeated name`);
  }
});

test('the clock species milestone still means only clock pets', () => {
  assert(
    timesOfSpecies('mochi').every((id) => !id.startsWith('add:')),
    'an already-earned milestone quietly grew a new requirement'
  );
  assert(factsOfSpecies('mochi').every((id) => id.startsWith('add:')));
});

test('finishing an addition tier pays, without repricing the clock', () => {
  const items = {};
  for (const fact of addSubject.tierItems(0)) {
    items[fact.id] = { subject: 'math', phase: 'graduated', hatchedAt: 1 };
  }
  const reached = milestonesReached(items, { daysPlayed: [] });
  assert(reached.includes('mastery:math:0'), 'the addition tier went unrewarded');
  assert(!reached.includes('mastery:0'), 'and it must not claim the clock’s milestone');
});

describe('adding — the pace it is answered at');

test('writing a number is allowed to be slower than swinging two hands', () => {
  // 12 seconds is a hesitant clock answer but an ordinary one on a keypad.
  assertEqual(qualityOf({ correct: true, ms: 12000 }), 4, 'unchanged for the clock');
  assertEqual(qualityOf({ correct: true, ms: 12000, pace: addSubject.paceScale }), 5);
  assertEqual(qualityOf({ correct: true, ms: 40000, pace: addSubject.paceScale }), 3, 'but slow is still slow');
});

test('starting the answer over counts the same as waggling a hand', () => {
  assertEqual(qualityOf({ correct: true, ms: 500, reversals: 2, pace: 4 }), 3, 'pace never excuses hesitation');
});


/* --------------------------------------------------------------------- ink */

const P = (...points) => points.map(([x, y]) => ({ x, y }));

// Plain, textbook shapes in a 100x100 pad. They are not children's handwriting and no
// number taken from them should be read as if they were — what they establish is that the
// pipeline is wired end to end, which is a different and much smaller claim.
const GLYPHS = {
  0: [P([50, 12], [74, 28], [80, 50], [74, 72], [50, 88], [26, 72], [20, 50], [26, 28], [50, 12])],
  1: [P([34, 26], [50, 12], [50, 88])],
  2: [P([24, 30], [38, 14], [62, 14], [76, 30], [70, 48], [26, 86], [78, 86])],
  3: [P([26, 18], [62, 12], [76, 28], [60, 48], [76, 66], [62, 86], [28, 82])],
  4: [P([62, 12], [22, 60], [80, 60]), P([62, 36], [62, 88])],
  5: [P([74, 14], [32, 14], [28, 44], [52, 40], [74, 52], [70, 76], [44, 88], [24, 80])],
  6: [P([68, 14], [40, 30], [26, 58], [34, 80], [58, 88], [74, 72], [68, 52], [44, 48], [28, 60])],
  7: [P([22, 14], [78, 14], [46, 88])],
  8: [P([50, 12], [70, 24], [52, 46], [74, 64], [56, 86], [32, 80], [28, 60], [48, 46], [28, 32], [50, 12])],
  9: [P([64, 50], [40, 54], [28, 38], [38, 18], [62, 12], [72, 30], [70, 58], [56, 84], [34, 90])],
};

const backwards = (strokes) => strokes.map((s) => s.map((p) => ({ x: 100 - p.x, y: p.y })));
const inkRows = (image) => {
  let rows = 0;
  for (let y = 0; y < INK_SIZE; y += 1) {
    for (let x = 0; x < INK_SIZE; x += 1) {
      if (image[y * INK_SIZE + x] > 0.01) { rows += 1; break; }
    }
  }
  return rows;
};

describe('ink — stroke maths');

test('points are spaced evenly however fast the hand moved', () => {
  const even = resample(P([0, 0], [10, 0]), 2);
  assertEqual(even.map((p) => p.x).join(), '0,2,4,6,8,10');
  // The same line captured at a different sampling rate must resample the same way.
  const jittery = resample(P([0, 0], [1, 0], [1.2, 0], [7, 0], [10, 0]), 2);
  assertEqual(jittery.map((p) => Math.round(p.x)).join(), '0,2,4,6,8,10');
});

test('a finger held still is not a line, but a deliberate dot is a dot', () => {
  assertEqual(dedupe(P([0, 0], [0, 0], [0, 0], [1, 0])).length, 2);
  assertEqual(resample(P([5, 5]), 2).length, 1, 'a dot must survive');
});

test('a stray tap is refused rather than guessed at', () => {
  assert(!hasInk([P([5, 5])], 0.06, 100), 'a speck became a digit');
  assert(!hasInk([], 0.06, 100));
  assert(hasInk(GLYPHS[7], 0.06, 100), 'and a real digit is not refused');
});

test('bounds cover every stroke, and an empty drawing does not throw', () => {
  const box = inkBounds(GLYPHS[4]);
  assert(box.width > 0 && box.height > 0);
  assertEqual(inkBounds([]).width, 0);
});

describe('ink — the rasteriser');

test('the ink fills MNIST’s twenty pixels, stroke width included', () => {
  // Round caps put half a stroke past each end; if that is not taken off the scale, every
  // digit comes out a stroke wider than the ones the model was trained on.
  assertEqual(inkRows(rasterize([P([50, 10], [50, 90])])), 20);
  assertEqual(inkRows(rasterize(GLYPHS[0])), 20);
});

test('the digit is placed by centre of mass, as MNIST places it', () => {
  for (const strokes of [GLYPHS[1], GLYPHS[7], GLYPHS[4]]) {
    const com = centreOfMass(rasterize(strokes));
    assertClose(com.x, (INK_SIZE - 1) / 2, 0.01, 'horizontally off centre');
    assertClose(com.y, (INK_SIZE - 1) / 2, 0.01, 'vertically off centre');
  }
});

test('how big the child wrote, and where, reaches nothing', () => {
  const same = (a, b) => {
    let worst = 0;
    for (let i = 0; i < a.length; i += 1) worst = Math.max(worst, Math.abs(a[i] - b[i]));
    return worst;
  };
  const base = rasterize(GLYPHS[2]);
  const huge = rasterize(GLYPHS[2].map((s) => s.map((p) => ({ x: p.x * 9, y: p.y * 9 }))));
  const moved = rasterize(GLYPHS[2].map((s) => s.map((p) => ({ x: p.x + 137, y: p.y - 61 }))));
  assertEqual(same(base, huge), 0, 'a bigger drawing rasterised differently');
  assertEqual(same(base, moved), 0, 'a drawing in the corner rasterised differently');
});

test('a blank drawing gives a blank image rather than an exception', () => {
  const empty = rasterize([]);
  assertEqual(empty.length, INK_SIZE * INK_SIZE);
  assertEqual(Math.max(...empty), 0);
  assertEqual(centreOfMass(empty), null);
});

test('the picture can be looked at', () => {
  assert(toAscii(rasterize(GLYPHS[1])).split('\n').length === INK_SIZE);
});

describe('ink — the classifier');

test('the JavaScript forward pass agrees with the one that trained it', () => {
  // The fixtures come from the same quantised weights the browser loads, so anything left
  // is float32 rounding. A transposed axis or an off-by-one pad would show up here as a
  // number instead of as "recognition feels a bit worse".
  let worst = 0;
  for (const item of CASES) {
    const mine = logits(Float32Array.from(item.pixels));
    for (let i = 0; i < mine.length; i += 1) {
      worst = Math.max(worst, Math.abs(mine[i] - item.logits[i]));
    }
  }
  assert(worst < 1e-3, `the two forward passes have diverged: ${worst}`);
});

test('and picks the same digit on every fixture', () => {
  for (const item of CASES) {
    const mine = Array.from(logits(Float32Array.from(item.pixels)));
    const want = item.logits.indexOf(Math.max(...item.logits));
    assertEqual(mine.indexOf(Math.max(...mine)), want, `fixture for ${item.label}`);
  }
});

test('the weights are small enough to inline', () => {
  assert(parameterCount() < 60000, `${parameterCount()} parameters is more than planned`);
});

describe('ink — structure');

test('enclosed loops are found, and counted right', () => {
  assertEqual(holesOf(rasterize(GLYPHS[1])).count, 0, 'a 1 has no hole');
  assertEqual(holesOf(rasterize(GLYPHS[7])).count, 0, 'nor a 7');
  assertEqual(holesOf(rasterize(GLYPHS[0])).count, 1, 'a 0 has one');
  assertEqual(holesOf(rasterize(GLYPHS[8])).count, 2, 'an 8 has two');
});

test('the feature vector is the length everything else expects', () => {
  assertEqual(FEATURE_NAMES.length, FEATURE_COUNT);
  assertEqual(featuresOf(GLYPHS[3], rasterize(GLYPHS[3])).length, FEATURE_COUNT);
  assertEqual(featuresOf([], rasterize([])).length, FEATURE_COUNT, 'even for nothing at all');
});

test('a 1 and a 7 differ where the tiebreak looks', () => {
  const at = (name) => FEATURE_NAMES.indexOf(name);
  const one = featuresOf(GLYPHS[1], rasterize(GLYPHS[1]));
  const seven = featuresOf(GLYPHS[7], rasterize(GLYPHS[7]));
  assert(seven[at('aspect')] > one[at('aspect')], 'a 7 is wider than a 1');
  assert(seven[at('crossCentre')] > one[at('crossCentre')], 'a 7’s bar is crossed twice');
});

describe('ink — this child’s handwriting');

test('a correction is remembered, and the oldest fall off the end', () => {
  const vector = (seed) => Float32Array.from({ length: FEATURE_COUNT }, (_, i) => ((i * seed) % 7) / 7);
  let memory = [];
  for (let i = 0; i < CAPACITY + 20; i += 1) memory = remember(memory, vector(i + 1), i % 10);
  assert(memory.length <= CAPACITY, 'the memory grew without bound');
});

test('one stubborn digit cannot crowd out the other nine', () => {
  const vector = Float32Array.from({ length: FEATURE_COUNT }, () => 0.5);
  let memory = [];
  for (let i = 0; i < CAPACITY; i += 1) memory = remember(memory, vector, 7);
  assert(memory.length <= Math.ceil(CAPACITY / 3), 'sevens filled the whole memory');
});

test('a hand-edited memory cannot throw', () => {
  assertEqual(sanitizeMemory([{ d: 99, f: [] }, null, 'x', { d: 3, f: [1, 2] }, undefined]).length, 0);
  assertEqual(sanitizeMemory('not a list').length, 0);
  assertEqual(sanitizeMemory(undefined).length, 0);
});

test('an empty memory has no opinion at all', () => {
  const vector = Float32Array.from({ length: FEATURE_COUNT }, () => 0.5);
  assertEqual(recall([], vector).strength, 0, 'it voted with nothing to go on');
});

test('the nearest corrections are the ones that vote', () => {
  const vector = (seed) => Float32Array.from({ length: FEATURE_COUNT }, (_, i) => ((i * seed) % 7) / 7);
  let memory = [];
  for (const digit of [1, 2, 3, 4, 5, 6]) memory = remember(memory, vector(digit + 1), digit);
  const voted = recall(memory, vector(4));
  assertEqual(voted.votes.indexOf(Math.max(...voted.votes)), 3, 'it reached for the wrong neighbour');
  assert(voted.strength > 0);
});

describe('ink — reading a digit');

test('nothing on the pad reads as nothing, not as a one', () => {
  const blank = recognize([], { pad: 100 });
  assertEqual(blank.digit, null);
  assertEqual(blank.reason, 'blank');
  assertEqual(recognize([P([50, 50])], { pad: 100 }).digit, null, 'a stray tap became a digit');
});

test('every textbook digit is read as itself', () => {
  // Establishes that strokes, rasteriser, model and fusion are joined up correctly. It says
  // nothing about a six-year-old's handwriting — that is what the corpus on tests/ink.html
  // is for, and until somebody has written into it that number is unknown.
  for (const [digit, strokes] of Object.entries(GLYPHS)) {
    assertEqual(String(recognize(strokes, { pad: 100 }).digit), digit, `read ${digit} wrong`);
  }
});

test('a backwards digit is still that digit', () => {
  // Reversing 3, 5, 7 and 9 is ordinary at this age and must never cost a child the sum.
  for (const [digit, strokes] of Object.entries(GLYPHS)) {
    const read = recognize(backwards(strokes), { pad: 100 });
    assertEqual(String(read.digit), digit, `a backwards ${digit} was misread`);
  }
});

test('and the game knows it was backwards — where that means anything', () => {
  for (const digit of [1, 2, 3, 4, 5, 6, 7, 9]) {
    assert(recognize(backwards(GLYPHS[digit]), { pad: 100 }).mirrored, `${digit} was not flagged`);
  }
  // 0 and 8 are their own mirror image, so there is nothing to nudge anybody about.
  for (const digit of [0, 8]) {
    assert(!recognize(GLYPHS[digit], { pad: 100 }).mirrored, `${digit} was flagged for nothing`);
  }
});

test('an upright digit is never called backwards', () => {
  for (const [digit, strokes] of Object.entries(GLYPHS)) {
    assert(!recognize(strokes, { pad: 100 }).mirrored, `upright ${digit} was flagged`);
  }
});

test('a reading always carries enough to show it back and to learn from it', () => {
  const read = recognize(GLYPHS[6], { pad: 100 });
  assert(read.confidence > 0 && read.confidence <= 1, 'confidence out of range');
  assertEqual(read.image.length, INK_SIZE * INK_SIZE);
  assertEqual(read.features.length, FEATURE_COUNT);
  assert(read.unsure === read.confidence < UNSURE_BELOW, 'unsure disagrees with confidence');
  if (read.unsure) assert(read.alternative !== null, 'unsure but nothing offered instead');
});

test('mirroring an image twice changes nothing', () => {
  const image = rasterize(GLYPHS[7]);
  const back = mirror(mirror(image));
  let worst = 0;
  for (let i = 0; i < image.length; i += 1) worst = Math.max(worst, Math.abs(image[i] - back[i]));
  assertEqual(worst, 0);
});

test('the child’s own corrections reach the reading', () => {
  const strokes = GLYPHS[3];
  const features = featuresOf(strokes, rasterize(strokes));
  let memory = [];
  for (let i = 0; i < 10; i += 1) memory = remember(memory, features, 8);
  const read = recognize(strokes, { memory, pad: 100 });
  assert(read.detail.memoryStrength > 0, 'the memory was not consulted');
});


describe('handwriting — what the save keeps of it');

test('a fresh zoo has learned nothing about anybody’s handwriting yet', () => {
  const fresh = freshState(0);
  assertEqual(fresh.ink.length, 0);
  assertEqual(fresh.settings.mirrorNudge, false, 'the nudge starts off');
  assertEqual(fresh.settings.answerMode, 'auto');
});

test('corrections survive a reload', () => {
  const storage = fakeStorage();
  const features = Array.from({ length: FEATURE_COUNT }, (_, i) => i / FEATURE_COUNT);
  const state = { ...freshState(0), ink: remember([], Float32Array.from(features), 4) };
  write(state, storage);
  const back = load(0, storage);
  assertEqual(back.ink.length, 1);
  assertEqual(back.ink[0].d, 4, 'it forgot which digit it was told');
});

test('a corrupt memory is dropped rather than thrown at the child', () => {
  const storage = fakeStorage();
  storage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...freshState(0), ink: [{ d: 99, f: [] }, 'rubbish', null, { d: 2 }] })
  );
  assertEqual(load(0, storage).ink.length, 0, 'nonsense reached the recogniser');
});

test('a save written before handwriting existed simply has none', () => {
  const storage = fakeStorage();
  const { ink, ...older } = freshState(0);
  storage.setItem(STORAGE_KEY, JSON.stringify(older));
  assertEqual(load(0, storage).ink.length, 0);
});

test('one child’s handwriting does not travel to another child’s device', () => {
  // It is learned from *this* hand; carrying it across would make the reading worse, and it
  // costs nothing to learn again.
  const features = Float32Array.from({ length: FEATURE_COUNT }, () => 0.5);
  const state = { ...playedState(), ink: remember([], features, 7) };
  const payload = exportPayload(state, 1000);
  assert(!('ink' in payload), 'the handwriting memory travelled');
  const landed = applyImport(receivingState(), parseTransfer(payloadToJson(payload)), 5000);
  assertEqual(landed.ink.length, 0, 'and it must not arrive on the far side either');
});


/* --------------------------------------------------------- what to practise */

describe('practice — choosing what the game asks about');

const practiceWith = (clock, math) => practiceOf({ practice: { clock, math } });

test('a save that predates any of this practises everything', () => {
  const chosen = practiceOf({});
  assertEqual(chosen.clock.on, true);
  assertEqual(chosen.math.on, true);
  assertEqual(chosen.clock.floor, 0);
  assertEqual(practiceOf(undefined).math.floor, 0, 'and no state at all does not throw');
});

test('a hand-edited floor cannot reach past the ladder', () => {
  assertEqual(practiceWith({ floor: 99 }, {}).clock.floor, LAST_TIER);
  assertEqual(practiceWith({ floor: -4 }, {}).clock.floor, 0);
  assertEqual(practiceWith({ floor: 'lots' }, {}).clock.floor, 0);
  assertEqual(practiceWith({ floor: 2.7 }, {}).clock.floor, 2, 'fractional is truncated');
});

test('there is always something left to practise', () => {
  // Switching off the last subject would leave the game with no question to ask at all.
  const nothing = practiceWith({ on: false }, { on: false });
  assertEqual(enabledSubjects(nothing).length, 1, 'the game was left with nothing to ask');
  assertEqual(nothing.clock.on, true);
});

test('resting is decided by the choices, not stored on the pet', () => {
  const chosen = practiceWith({ on: false, floor: 0 }, { on: true, floor: 2 });
  assert(isResting({ subject: 'clock', tier: 3 }, chosen), 'a switched-off subject rests');
  assert(isResting({ subject: 'math', tier: 1 }, chosen), 'and so does a tier below the floor');
  assert(!isResting({ subject: 'math', tier: 2 }, chosen), 'the floor itself is practised');
  assert(!isResting({ subject: 'math', tier: 4 }, chosen), 'and everything above it');
});

test('an item from a subject this build does not know is left alone', () => {
  assert(!isResting({ subject: 'chemistry', tier: 0 }, DEFAULT_PRACTICE));
});

test('the zoo counts towards what is switched on', () => {
  assertEqual(enabledItemCount(DEFAULT_PRACTICE), totalItemCount());
  const chosen = practiceWith({ on: false }, { on: true, floor: 2 });
  // A target that includes what the game has been told not to ask is a target nobody can reach.
  const fromTwoUp = addSubject.ALL_ITEMS.filter((entry) => entry.tier >= 2).length;
  assertEqual(enabledItemCount(chosen), fromTwoUp, 'only the maths tiers from 2 up');
});

test('nothing skipped is ever introduced', () => {
  const chosen = practiceWith({ on: false, floor: 0 }, { on: true, floor: 2 });
  const fresh = unseenAcrossSubjects({}, { clock: 3, math: 4 }, chosen);
  assert(fresh.length > 0);
  assert(fresh.every((entry) => entry.subject === 'math'), 'a switched-off subject was taught');
  assert(fresh.every((entry) => entry.tier >= 2), 'a skipped tier was taught');
});

describe('practice — the ladder walks past a skipped rung');

test('the unlocked tier starts at the floor', () => {
  // A tier nobody is asked about can never reach the 80% bar, so a ladder starting at zero
  // would stall the whole subject forever.
  assertEqual(unlockedTierOf({}, 'math', 2), 2, 'an empty zoo still opens the floor');
  assertEqual(unlockedTierOf({}, 'math', 0), 0);
});

test('but mastery keeps telling the truth, so nobody is paid for skipping', () => {
  // wallet.js awards mastery:<tier> on tierMastery >= 1. If a skipped tier reported itself
  // mastered, a child would be handed forty coins for work they never did.
  assertEqual(tierMasteryOf({}, 'math', 0), 0, 'a skipped tier claimed to be mastered');
  const reached = milestonesReached({}, { daysPlayed: [] });
  assert(!reached.includes('mastery:math:0'), 'a skipped tier was paid for');
  assert(!reached.includes('mastery:0'));
});

describe('practice — pets that are resting');

const restingState = (extra = {}) => ({
  reviewClock: 0,
  tiers: { clock: 3, math: 4 },
  practice: practiceWith({ on: false, floor: 0 }, { on: true, floor: 0 }),
  items: {},
  ...extra,
});

test('a resting pet is never chosen, whichever queue it would have been in', () => {
  const clockItem = (over) => ({ subject: 'clock', tier: 0, seen: 0, dueStep: null, dueAt: 0, ...over });
  for (const [what, item] of [
    ['due for learning', clockItem({ phase: 'learning', dueStep: 1 })],
    ['hungry', clockItem({ phase: 'graduated', dueAt: 0 })],
    ['merely graduated', clockItem({ phase: 'graduated', dueAt: 9e15 })],
  ]) {
    const picked = nextItem(restingState({ items: { '1:00': item } }), { now: 1000 });
    assertEqual(subjectIdOf(picked), 'math', `a resting pet was asked about while ${what}`);
  }
});

test('a resting pet never asks to be fed', () => {
  const items = { '1:00': { subject: 'clock', tier: 0, phase: 'graduated', dueAt: 0 } };
  assertEqual(hungryCount(items, 1000), 1, 'it is hungry when it is being practised');
  assertEqual(hungryCount(items, 1000, restingState().practice), 0, 'and not when it is resting');
});

test('the last-resort fallback does not smuggle back what was switched off', () => {
  // Everything excluded and nothing left: the one moment nobody is watching for it.
  const state = restingState({ items: { '1:00': { subject: 'clock', tier: 0, phase: 'learning', dueStep: 99, dueAt: 0, seen: 0 } } });
  assertEqual(subjectIdOf(nextItem(state, { now: 1000, exclude: '1:00' })), 'math');
});

describe('practice — the schedule is frozen, not left running');

test('a pet due in two days is still due in two days after a month asleep', () => {
  // This is the whole point. Letting the clock run while a subject is off means coming back
  // to forty starving pets, which is a punishment for a grown-up changing a setting.
  const start = 1_000_000_000;
  const before = {
    reviewClock: 10,
    practice: DEFAULT_PRACTICE,
    items: {
      '1:00': { subject: 'clock', tier: 0, phase: 'graduated', dueAt: start + 2 * DAY_MS, dueStep: null },
      '2:00': { subject: 'clock', tier: 0, phase: 'learning', dueAt: 0, dueStep: 12 },
    },
  };
  const off = practiceWith({ on: false }, { on: true });
  const asleep = applyPractice(before, off, start);
  assertEqual(asleep.items['1:00'].restedAt, start, 'it was not stamped');
  assertEqual(asleep.items['2:00'].restedStep, 10);

  // A month passes, and forty questions of the other subject are answered.
  const later = start + 30 * DAY_MS;
  const awake = applyPractice({ ...asleep, reviewClock: 50 }, DEFAULT_PRACTICE, later);
  assertEqual(awake.items['1:00'].dueAt - later, 2 * DAY_MS, 'the days ran on while it slept');
  // The review clock counts questions, not days, and it keeps advancing while the *other*
  // subject is played — so freezing only the timestamps is not enough.
  assertEqual(awake.items['2:00'].dueStep - 50, 2, 'the questions ran on while it slept');
});

test('waking clears the stamps, so a second sleep starts fresh', () => {
  const off = practiceWith({ on: false }, { on: true });
  const state = { reviewClock: 0, items: { '1:00': { subject: 'clock', tier: 0, phase: 'graduated', dueAt: 500, dueStep: null } } };
  const awake = applyPractice(applyPractice(state, off, 100), DEFAULT_PRACTICE, 900);
  assert(!('restedAt' in awake.items['1:00']), 'the stamp was left behind');
  assert(!('restedStep' in awake.items['1:00']), 'and so was the step');
  assertEqual(awake.items['1:00'].dueAt, 500 + 800, 'it should have slept for eight hundred');
});

test('a pet that was already resting is not re-stamped', () => {
  const off = practiceWith({ on: false }, { on: true });
  const state = { reviewClock: 0, items: { '1:00': { subject: 'clock', tier: 0, phase: 'graduated', dueAt: 500 } } };
  const once = applyPractice(state, off, 100);
  const twice = applyPractice({ ...once, reviewClock: 40 }, off, 5000);
  assertEqual(twice.items['1:00'].restedAt, 100, 'the sleep restarted, losing a month of freeze');
});

test('raising the floor puts the pets below it to sleep too', () => {
  // Consistent with switching a subject off: anything no longer asked stops going hungry.
  const state = {
    reviewClock: 0,
    items: { 'add:0+0': { subject: 'math', tier: 0, phase: 'graduated', dueAt: 0, hatchedAt: 1 } },
  };
  const raised = applyPractice(state, practiceWith({}, { floor: 2 }), 1000);
  assertEqual(raised.items['add:0+0'].restedAt, 1000);
  assertEqual(hungryCount(raised.items, 2000, raised.practice), 0, 'a skipped pet still nagged');
});

test('the choices survive a reload, clamped', () => {
  const storage = fakeStorage();
  write({ ...freshState(0), practice: { clock: { on: false, floor: 9 }, math: { on: true, floor: 1 } } }, storage);
  const back = load(0, storage);
  assertEqual(back.practice.clock.on, false);
  assertEqual(back.practice.clock.floor, LAST_TIER, 'a floor past the ladder was kept');
  assertEqual(back.practice.math.floor, 1);
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
