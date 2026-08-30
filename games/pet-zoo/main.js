// Pet Zoo — wiring. The thinking lives in clock.js, srs.js, curriculum.js and session.js;
// this module owns the DOM, the pointer drag and the order things happen in.

import {
  advanceMinuteTo,
  angleOf,
  hourAngle,
  inferHour,
  minuteAngle,
  norm360,
  pickHand,
  pointOnFace,
  snapMinute,
  timeId,
} from './clock.js';
import { TIERS, tierItems } from './curriculum.js';
import { DEFAULT_LANGUAGE, isLanguage, LANGUAGES, translator } from './i18n.js';
import {
  applyPractice,
  CRACK_STAGES,
  createItem,
  nextItem,
  refreshTiers,
  review,
} from './srs.js';
import * as math from './subjects/math/index.js';
import {
  DEFAULT_SUBJECT,
  enabledItemCount,
  enabledSubjects,
  floorOf,
  isEnabled,
  isResting,
  practiceOf,
  SUBJECT_IDS,
  SUBJECTS,
  subjectIdOf,
  subjectOf,
  tierMastery,
} from './subjects/index.js';
import { fillDuration, fillPlan, tenFrameSvg } from './tenframe.js';
import { arrayDuration, arraySvg, ROW_STEP_SCALE } from './array.js';
import {
  columnWalkHtml,
  DEFAULT_WALK_SPEED,
  stackedMarkup,
  stackedMulMarkup,
  mulWalkHtml,
  mulWalkDuration,
  stepFor,
  walkDuration,
  walkWidth,
  walkSpeedAt,
  walkSpeedIndex,
} from './column.js';
import {
  dividedMarkup,
  divideWalkDuration,
  divideWalkHtml,
  ingredientsFor,
  stepOfRow,
} from './divwalk.js';
import { ROUND_STEP_SCALE, shareDuration, shareSvg } from './share.js';
import { remember } from './ink/memory.js';
import { createInkPad } from './ink/pad.js';
import { recognize } from './ink/recognize.js';
import * as session from './session.js';
import {
  appearanceOf,
  collarClock,
  eggSvg,
  moodOf,
  petName,
  petSvg,
  portraitOf,
  speciesAppearance,
  speciesFor,
  speciesForFact,
  speciesOf,
  SPECIES,
} from './pets.js';
import { formFor } from './srs.js';
import { createSaver, freshState, load, clear, touchDay, dayStamp } from './store.js';
import {
  buy as buyItem,
  buyZoo,
  HOME_CATALOG,
  isFull,
  isOwned,
  isUnlocked,
  itemById as shopItemById,
  sell as sellItem,
  sellZoo,
  slotOf,
  zooIsFull,
  zooOwns,
  ZOO_CATALOG,
} from './shop.js';
import {
  canAfford,
  dayBonusFor,
  earn,
  milestonesReached,
  payoutFor,
  retroGrant,
  SESSION_COINS,
  settleMilestones,
  spend,
  TIER_COINS,
} from './wallet.js';
import {
  applyImport,
  encodeCode,
  exportFilename,
  exportPayload,
  parseTransfer,
  payloadToJson,
  petCount,
  TransferError,
} from './transfer.js';
import { BACKDROP, FURNITURE, YARD_PIECES } from './habitat-parts.js';
import { habitatOf, habitatSvg } from './habitat.js';
import { createHabitatScene } from './habitat-scene.js';
import { yardSvg } from './yard.js';
import { audio } from './audio.js';
import {
  buzz,
  confetti,
  flyCoins,
  flyHeart,
  pop,
  reduceMotion,
  setHaptics,
  smokePuff,
  svgEl,
} from './juice.js';

/* ----------------------------------------------------------------- elements */

const $ = (id) => document.getElementById(id);

// Pet names are the one string in this game a person can type, so they get escaped
// everywhere they meet innerHTML.
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  );

const el = {
  title: $('title'),
  tabPlay: $('tab-play'),
  tabZoo: $('tab-zoo'),
  zooBadge: $('zoo-badge'),
  sound: $('sound'),
  openSettings: $('open-settings'),
  playScene: $('play-scene'),
  napScene: $('nap-scene'),
  zooScene: $('zoo-scene'),
  promptCard: $('prompt-card'),
  petStage: $('pet-stage'),
  promptLine: $('prompt-line'),
  promptDigital: $('prompt-digital'),
  promptSum: $('prompt-sum'),
  promptSpoken: $('prompt-spoken'),
  clock: $('clock'),
  answerClock: $('answer-clock'),
  answerSum: $('answer-sum'),
  keypad: $('keypad'),
  tenframeHost: $('tenframe-host'),
  answerWrite: $('answer-write'),
  writeBoxes: $('write-boxes'),
  writePicker: $('write-picker'),
  writePickerKeys: $('write-picker-keys'),
  writePickerTitle: $('write-picker-title'),
  writeUndo: $('write-undo'),
  writeClear: $('write-clear'),
  writeNext: $('write-next'),
  answerMode: $('answer-mode'),
  mirrorNudge: $('mirror-nudge'),
  feedback: $('feedback'),
  submit: $('submit'),
  napPets: $('nap-pets'),
  napTimer: $('nap-timer'),
  wake: $('wake'),
  napToZoo: $('nap-to-zoo'),
  zooGrid: $('zoo-grid'),
  zooEmpty: $('zoo-empty'),
  habitatScene: $('habitat-scene'),
  habitatHost: $('habitat-host'),
  habitatBack: $('habitat-back'),
  habitatName: $('habitat-name'),
  habitatRank: $('habitat-rank'),
  habitatTime: $('habitat-time'),
  habitatRename: $('habitat-rename'),
  habitatNote: $('habitat-note'),
  zooYard: $('zoo-yard'),
  shopStall: $('shop-stall'),
  stallBalance: $('stall-balance'),
  shop: $('shop-overlay'),
  shopBalance: $('shop-balance'),
  shopEmpty: $('shop-empty'),
  shopTabs: $('shop-tabs'),
  shopBody: $('shop-body'),
  shopPick: $('shop-pick'),
  shopPets: $('shop-pets'),
  shopGrid: $('shop-grid'),
  shopNote: $('shop-note'),
  shopClose: $('shop-close'),
  shopConfirm: $('shop-confirm'),
  confirmPreview: $('confirm-preview'),
  confirmCopy: $('confirm-copy'),
  confirmBuy: $('confirm-buy'),
  confirmCancel: $('confirm-cancel'),
  unlock: $('unlock-overlay'),
  unlockPets: $('unlock-pets'),
  unlockTitle: $('unlock-title'),
  unlockCopy: $('unlock-copy'),
  unlockClose: $('unlock-close'),
  settings: $('settings-overlay'),
  language: $('language'),
  showDigital: $('show-digital'),
  playMinutes: $('play-minutes'),
  playMinutesValue: $('play-minutes-value'),
  walkSpeed: $('walk-speed'),
  walkSpeedValue: $('walk-speed-value'),
  walkInstant: $('walk-instant'),
  admireSeconds: $('admire-seconds'),
  admireSecondsValue: $('admire-seconds-value'),
  exportFile: $('export-file'),
  exportCode: $('export-code'),
  importFile: $('import-file'),
  importCode: $('import-code'),
  importInput: $('import-input'),
  transferStatus: $('transfer-status'),
  settingsClose: $('settings-close'),
  grownups: $('grownups-overlay'),
  grownupsStats: $('grownups-stats'),
  grownupsTiers: $('grownups-tiers'),
  grownupsNote: $('grownups-note'),
  grownupsClose: $('grownups-close'),
  grownupsReset: $('grownups-reset'),
  fx: $('fx'),
};

/* -------------------------------------------------------------------- state */

const now = () => Date.now();

let state = load(now());
const saver = createSaver();
const save = () => saver.save(state);

// `t` and `limits` are derived from settings and swapped wholesale when a setting
// changes, so nothing downstream has to know that a setting can move.
let t = translator(state.settings.language);
let limits = session.limitsFor(state.settings.playMinutes);

// Whether a time may be written as digits. Read at every render rather than cached, so
// the setting has exactly one home and turning it over repaints from the same state.
const digitalOn = () => state.settings.showDigital;

// The question in flight. `dial` is what the child has set the hands to; `reversals`
// counts how often they changed direction mid-drag, which feeds the SM-2 quality score.
let current = null;
let dial = { h: 12, m: 0 };
let lastAskedId = null;
let locked = true; // true while animating or between questions
let scene = 'play';
// Which pet's habitat is open. Kept out of `state` on purpose: standing in a habitat is
// not progress, so it is not worth persisting and must never end up in a save.
let habitatId = null;
let habitatNapping = false;
// Which pet the stall is currently serving, and what is waiting on a confirm. Neither is
// progress, so neither is persisted — the shop opens on the child's first pet every time.
let shopPetId = null;
let shopTab = 'home';
let pendingPurchase = null;

/* -------------------------------------------------------------------- clock */

const CX = 200;
const CY = 200;
const R = 180;
const HOUR_LEN = 100;
const MINUTE_LEN = 150;
const TAIL = 14;

let hands = null;

function buildClock() {
  const svg = el.clock;
  svg.append(
    svgEl('circle', { class: 'face-plate', cx: CX, cy: CY, r: R }),
    svgEl('circle', { class: 'face-ring', cx: CX, cy: CY, r: R - 13 })
  );

  // 60 ticks; the twelve five-minute ones are fat and accented, because "count round in
  // fives" is the whole minute lesson.
  for (let i = 0; i < 60; i += 1) {
    const major = i % 5 === 0;
    const p = pointOnFace(CX, CY, R - 26, i * 6);
    svg.append(
      svgEl('circle', { class: `tick${major ? ' major' : ''}`, cx: p.x, cy: p.y, r: major ? 6 : 2.6 })
    );
  }

  // Hour numerals inside, five-minute counts outside — so the child can read "15" off the
  // rim instead of counting ticks under time pressure.
  for (let i = 1; i <= 12; i += 1) {
    const p = pointOnFace(CX, CY, R - 56, i * 30);
    svg.append(svgEl('text', { class: 'numeral', x: p.x, y: p.y }, String(i)));
    const q = pointOnFace(CX, CY, R + 16, i * 30);
    svg.append(svgEl('text', { class: 'minute-label', x: q.x, y: q.y }, String((i * 5) % 60)));
  }

  const makeHand = (kind, len, extra = '') => {
    const g = svgEl('g', { class: `hand-group ${kind}${extra}` });
    g.append(
      svgEl('line', {
        class: `hand ${kind}${extra}`,
        x1: CX,
        y1: CY + TAIL,
        x2: CX,
        y2: CY - len,
      }),
      svgEl('circle', { class: `hand-knob ${kind}`, cx: CX, cy: CY - len, r: kind === 'hour' ? 12 : 9 }),
      svgEl('circle', { class: 'hand-grip', cx: CX, cy: CY - len, r: 40 })
    );
    return g;
  };

  // The ghost pair marks where the child actually put the hands during a correction, so
  // the animation reads as "from here to there" rather than the clock twitching.
  const ghostHour = makeHand('hour', HOUR_LEN, ' ghost');
  const ghostMinute = makeHand('minute', MINUTE_LEN, ' ghost');
  const hourHand = makeHand('hour', HOUR_LEN);
  const minuteHand = makeHand('minute', MINUTE_LEN);

  svg.append(ghostHour, ghostMinute, hourHand, minuteHand);
  svg.append(svgEl('circle', { class: 'pin', cx: CX, cy: CY, r: 13 }));

  hands = { hourHand, minuteHand, ghostHour, ghostMinute };
  setGhostVisible(false);
}

const rotate = (g, deg) => g.setAttribute('transform', `rotate(${deg.toFixed(2)} ${CX} ${CY})`);

function renderHands(h, m) {
  rotate(hands.hourHand, hourAngle(h, m));
  rotate(hands.minuteHand, minuteAngle(m));
}

function setGhostVisible(visible, h = 12, m = 0) {
  for (const g of [hands.ghostHour, hands.ghostMinute]) {
    g.style.display = visible ? '' : 'none';
    g.querySelector('.hand').classList.remove('fading');
  }
  if (visible) {
    rotate(hands.ghostHour, hourAngle(h, m));
    rotate(hands.ghostMinute, minuteAngle(m));
  }
}

const setDial = (h, m) => {
  dial = { h, m };
  renderHands(h, m);
};

/* --------------------------------------------------------------- hand drag */

let drag = null;

function svgVector(event) {
  const rect = el.clock.getBoundingClientRect();
  const scale = 400 / rect.width;
  return {
    dx: (event.clientX - rect.left) * scale - CX,
    dy: (event.clientY - rect.top) * scale - CY,
    radius: R,
  };
}

el.clock.addEventListener('pointerdown', (event) => {
  if (locked || !current) return;
  const v = svgVector(event);
  const hand = pickHand({
    ...v,
    // The lengths the hands are actually drawn at, so the picker measures the face the child
    // is looking at rather than a default of it.
    hourLen: HOUR_LEN,
    minuteLen: MINUTE_LEN,
    hourDeg: hourAngle(dial.h, dial.m),
    minuteDeg: minuteAngle(dial.m),
  });
  if (!hand) return;
  event.preventDefault();
  beginSessionIfNeeded();
  el.clock.setPointerCapture(event.pointerId);
  drag = { pointerId: event.pointerId, hand, lastSign: 0 };
  hands[hand === 'hour' ? 'hourHand' : 'minuteHand'].querySelector('.hand').classList.add('dragging');
  audio.play('grab');
});

el.clock.addEventListener('pointermove', (event) => {
  if (!drag || event.pointerId !== drag.pointerId) return;
  event.preventDefault();
  const { dx, dy } = svgVector(event);
  if (Math.hypot(dx, dy) < R * 0.12) return; // too near the pin for the angle to mean anything
  const deg = angleOf(dx, dy);

  if (drag.hand === 'minute') {
    const m = snapMinute(deg);
    if (m === dial.m) return;
    // The hour comes along for the ride: past the 12 it carries, back past it it borrows.
    const next = advanceMinuteTo(dial, m);
    const sign = Math.sign(next.delta);
    if (sign && drag.lastSign && sign !== drag.lastSign) current.reversals += 1;
    if (sign) drag.lastSign = sign;
    setDial(next.h, next.m);
  } else {
    const h = inferHour(deg, dial.m);
    if (h === dial.h) return;
    setDial(h, dial.m);
  }
  // Every snap is a click you can hear and feel — this is what makes the grid discoverable.
  audio.play('tick');
  buzz(8);
});

const endDrag = (event) => {
  if (!drag || event.pointerId !== drag.pointerId) return;
  hands[drag.hand === 'hour' ? 'hourHand' : 'minuteHand']
    .querySelector('.hand')
    .classList.remove('dragging');
  drag = null;
};
el.clock.addEventListener('pointerup', endDrag);
el.clock.addEventListener('pointercancel', endDrag);

/** Slide both hands from one time to another. Used only by the gentle correction. */
function animateHandsTo(from, to, duration) {
  return new Promise((resolve) => {
    const shortest = (a, b) => {
      const d = norm360(b - a);
      return d > 180 ? d - 360 : d;
    };
    const h0 = hourAngle(from.h, from.m);
    const m0 = minuteAngle(from.m);
    const dh = shortest(h0, hourAngle(to.h, to.m));
    const dm = shortest(m0, minuteAngle(to.m));
    const t0 = performance.now();
    const step = (frameTime) => {
      const p = Math.min(1, (frameTime - t0) / duration);
      const e = 1 - (1 - p) ** 3; // ease-out: decisive at first, settles gently
      rotate(hands.hourHand, h0 + dh * e);
      rotate(hands.minuteHand, m0 + dm * e);
      if (p < 1) requestAnimationFrame(step);
      else {
        dial = { ...to };
        renderHands(to.h, to.m);
        resolve();
      }
    };
    requestAnimationFrame(step);
  });
}

/* ------------------------------------------------------------------ prompts */

function ensureItem(id) {
  if (state.items[id]) return state.items[id];
  const subject = subjectOf(id) ?? SUBJECTS[DEFAULT_SUBJECT];
  const payload = subject.parse(id);
  state.items[id] = createItem({
    subject: subject.id,
    ...payload,
    tier: subject.tierOf(payload),
    species: speciesOf({ subject: subject.id, ...payload }),
    reviewClock: state.reviewClock,
  });
  return state.items[id];
}

// One line per crack, so the anticipation survives the gap between two sittings: an egg the
// child left half-broken says so the moment it comes back on screen.
const EGG_PROMPTS = ['prompt.egg', 'prompt.egg1', 'prompt.egg2'];
// The clock's lines all end by leading into a time — "they eat at…" — which is the wrong
// sentence in front of an equation, so maths gets its own set rather than a shared one with
// the ending filed off. And a column sum gets a third set, because "they eat at…" and "what
// is…" both lead into something written on one line, which a stacked sum is not.
const SUM_EGG_PROMPTS = ['prompt.sumEgg', 'prompt.sumEgg1', 'prompt.sumEgg2'];
const COLUMN_EGG_PROMPTS = ['prompt.colEgg', 'prompt.colEgg1', 'prompt.colEgg2'];
// And a fourth set for the missing factor, because every line above leads into "what is…",
// and this one is not asking what something is — it is asking which number is not there.
const GAP_EGG_PROMPTS = ['prompt.gapEgg', 'prompt.gapEgg1', 'prompt.gapEgg2'];
// And a fifth for the long division, because "work it out" is what you say over a stacked sum
// and this one is not worked out so much as shared out, a step at a time.
const DIVIDE_EGG_PROMPTS = ['prompt.divEgg', 'prompt.divEgg1', 'prompt.divEgg2'];

/** An item answered by writing digits rather than by dragging hands. */
const isSum = (item) => (item?.subject ?? DEFAULT_SUBJECT) === math.id;

/** Which of the families of prompt line an item is asked with. */
const promptKindOf = (item) => (isSum(item) ? (current?.layout ?? 'inline') : 'clock');

// The prefix each layout's lines are filed under, and the egg lines that go with it. A layout
// with no entry here — an inline sum — falls back to the plain `sum` family, which is what every
// written question was asked with before any of them had a shape of its own.
const PROMPT_PREFIXES = { column: 'col', gap: 'gap', divide: 'div' };

const EGG_LINES = {
  col: COLUMN_EGG_PROMPTS,
  gap: GAP_EGG_PROMPTS,
  div: DIVIDE_EGG_PROMPTS,
  sum: SUM_EGG_PROMPTS,
};

function promptFor(item) {
  // `col`, `gap` or `div` for a question that is written out, `sum` for one on a single line,
  // and null for the clock, whose lines are not filed under a prefix at all.
  const prefix = isSum(item) ? PROMPT_PREFIXES[promptKindOf(item)] ?? 'sum' : null;
  if (item.hatchedAt === null) {
    const prompts = EGG_LINES[prefix] ?? EGG_PROMPTS;
    return { line: t(prompts[Math.min(item.cracks ?? 0, prompts.length - 1)]), button: t('button.warm') };
  }
  const name = petName(item, t.lang);
  const state_ =
    item.phase === 'learning' ? 'Forgot' : item.dueAt <= now() ? 'Hungry' : 'Snack';
  const key = prefix ? `prompt.${prefix}${state_}` : `prompt.${state_.toLowerCase()}`;
  return { line: t(key, { name }), button: t('button.feed', { name }) };
}

/** A pet's species with the title it has earned — shown only from form 2, so the line
 *  appearing at all is itself part of the reward. */
function formLabel(item) {
  const species = SPECIES[appearanceOf(item).species]?.name ?? '';
  const form = formFor(item.feeds ?? 0);
  return form >= 2 ? `${species} ${t(`form.${form}`)}` : species;
}

/**
 * What an egg calls itself out loud. The broken shell is the only progress an egg shows now that
 * the dots are gone, so the label under the picture has to carry the same thing the picture does —
 * otherwise a screen reader loses it entirely. It lives on the art rather than on the tile name,
 * which has to stay short enough not to be cut off.
 */
function eggTitle(item) {
  const cracks = item.cracks ?? 0;
  return cracks > 0
    ? t('zoo.eggTitleCracks', { n: cracks, of: CRACK_STAGES })
    : t('zoo.eggTitle');
}

function renderPetStage(item, mood) {
  const markup =
    item.hatchedAt === null
      ? eggSvg(portraitOf(item), { cracks: item.cracks ?? 0, title: eggTitle(item) })
      : petSvg(appearanceOf(item), { mood, title: escape(petName(item, t.lang)) });
  el.petStage.innerHTML = markup;
  const pet = el.petStage.querySelector('.pet');
  pet.classList.add('breathe');
  pet.style.setProperty('--blink-delay', `${(Math.random() * 5).toFixed(2)}s`);
}

/**
 * Put an egg on the stage at an explicit crack level, whatever the item now says. The hatch
 * sequence needs exactly this: by the time it runs the item has already hatched, and the shell
 * still has to break on screen. No `breathe` — during the break the egg has other plans, and two
 * animations on `.pet-inner` would fight.
 */
function renderEggStage(item, cracks, { fresh = false } = {}) {
  el.petStage.innerHTML = eggSvg(portraitOf(item), { cracks, title: eggTitle(item) });
  const pet = el.petStage.querySelector('.pet');
  if (fresh) pet.querySelector(`.egg-crack-${cracks}`)?.classList.add('is-new');
  return pet;
}

/** Start the hands somewhere that is not the answer, so every question needs real work. */
function scatterHands(target) {
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  let h;
  let m;
  do {
    h = 1 + Math.floor(Math.random() * 12);
    m = minutes[Math.floor(Math.random() * minutes.length)];
  } while (h === target.h || m === target.m);
  setDial(h, m);
}

function renderPrompt(item) {
  const prompt = promptFor(item);
  el.promptLine.textContent = prompt.line;
  el.submit.textContent = prompt.button;
  if (isSum(item)) {
    el.promptDigital.hidden = true;
    el.promptSum.hidden = false;
    el.promptSpoken.classList.remove('is-lead');
    el.promptSpoken.textContent = t.spokenQuestion(current.shown);
    renderAnswer();
    return;
  }
  const digits = digitalOn();
  el.promptSum.hidden = true;
  el.promptDigital.textContent = timeId(item.h, item.m);
  el.promptDigital.hidden = !digits;
  el.promptSpoken.textContent = t.spoken(item.h, item.m);
  // Without the digits the phrase is the whole question, so it takes their weight.
  el.promptSpoken.classList.toggle('is-lead', !digits);
}

/* ------------------------------------------------------------- writing a number */

const coarsePointer = () =>
  typeof matchMedia === 'function' && matchMedia('(any-pointer: coarse)').matches;

/**
 * Whether the on-screen number pad is offered. `auto` follows the pointer — a finger gets
 * buttons, a mouse and keyboard get the keyboard — and the setting is there because
 * detection is a guess, and because a child who is having a bad day with one way of
 * answering should be able to use the other.
 */
function answerModeNow() {
  const mode = state.settings.answerMode ?? 'auto';
  // A finger gets to write; a mouse and keyboard get the keyboard. Writing with a mouse is
  // genuinely harder than writing with a finger, and worse to read, so it is not the
  // default anywhere a keyboard is to hand.
  if (mode === 'auto') return coarsePointer() ? 'write' : 'type';
  return mode;
}

const keypadWanted = () => answerModeNow() === 'tap';
const writingWanted = () => answerModeNow() === 'write';

const digitKey = (n) =>
  `<button type="button" class="key" data-digit="${n}" aria-label="${escape(t('answer.digit', { n }))}">${n}</button>`;

function buildKeypad() {
  el.keypad.innerHTML = [
    ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map(digitKey),
    '<span aria-hidden="true"></span>',
    digitKey(0),
    `<button type="button" class="key key-clear" data-clear="1">${escape(t('answer.clear'))}</button>`,
  ].join('');
}

/* ------------------------------------------------------------- the answer boxes */

// The answer is an array of boxes, leftmost first, because a column sum is answered one
// column at a time and *where* a digit sits is the whole of what is being taught. A blank box
// is a blank box, never a zero: `[_, 8, 5]` reads eighty-five, and `[8, _, 5]` reads as an
// unfinished answer rather than as anything at all.
//
// How many boxes there are is decided by the item, never by the question drawn from it — see
// `math.answerWidth`. A strip that narrowed when the answer got smaller would hand it over.

const emptyBoxes = (width) => new Array(width).fill(null);

// Typographic, not ASCII: a minus sign is not a hyphen and a multiplication sign is not the
// letter x. The ids stay ASCII (see times.js) — this is only what a child reads.
const OP_SIGNS = {
  '+': '<i class="op">+</i>',
  '-': '<i class="op">−</i>',
  '×': '<i class="op">×</i>',
};

/** The same signs as plain text, for a collar or a caption. */
const OP_TEXT = { '+': '+', '-': '−', '×': '×' };

// Division is the one sign this game cannot put in those tables, because which one is right is a
// fact about where a child goes to school rather than about arithmetic: Norwegian classrooms
// write `456 : 8` and English-speaking ones write `456 ÷ 8`. So it is looked up per language,
// while the id in the save stays `div:` either way — see divfacts.js.
const divSign = () => t('sign.divide');

const opSign = (op) => (op === '÷' ? `<i class="op">${divSign()}</i>` : OP_SIGNS[op] ?? OP_SIGNS['+']);

const opText = (op) => (op === '÷' ? divSign() : OP_TEXT[op] ?? OP_TEXT['+']);

// An answer is a list of *rows* of boxes, and almost always a list of one. Two things are not.
// A stacked multiplication is answered on three lines — the two partial products and their
// total. A long division is answered on three rows for every digit of the answer, and those
// step across the page rather than stacking under one another, so a row carries `place` (which
// column its rightmost box sits in) and `line` (which line of the working it is drawn on)
// alongside its width. Everything else became a one-row question rather than gaining a second
// code path, so there is one set of rules about where a digit lands rather than two that can
// drift apart.
//
// The rows arrive in *writing* order, not reading order: for a division that means the quotient
// digit for a step, then its working, then the next step's quotient digit — which is why the
// cursor can simply walk the list, and why several rows share the `'q'` line at the top.

const emptyRow = ({ width, place = 0, line = 0, flow = 'places', kind = null, step = null }) => ({
  width,
  place,
  line,
  flow,
  // What this row of a division *is* — the answer digit, the product taken away, or what is
  // left — and which step of the working it belongs to. Null for every other question, which
  // has one row and nothing to say about it.
  kind,
  step,
  digits: emptyBoxes(width),
});

/**
 * Whether a row holds an ordinary number rather than a set of places.
 *
 * A column sum's answer row is places: the digit worked out for the ones column belongs in the
 * ones box and nowhere else, so it is filled ones-first and a digit never moves once it is
 * written. A long division's working rows are not places — they are numbers that happen to be
 * written under particular columns — so a child writes ten as a one and then a nought, and the
 * row fills left to right and settles to the right, exactly as the inline strip does.
 */
const flowsAsNumber = (row) => row?.flow === 'number';

/** Which row the child is writing in at this moment. The cursor knows, except in handwriting
 *  mode, where there is no cursor and the pads themselves are parked on a row. */
const activeRowIndex = (c) => c?.cursor?.row ?? c?.row ?? 0;

/** And the row itself. */
const activeRow = (c) => c?.rows?.[activeRowIndex(c)] ?? null;

/**
 * The ingredients for the row being worked on, as things on screen: `ingredientsFor` knows which
 * numbers the method needs, and this turns the step it names into the row that holds it.
 */
function ingredientsOf(c, at) {
  const found = ingredientsFor(c.shown.a, c.shown.b, c?.rows?.[at]);
  return {
    ...found,
    row:
      found.quotientStep === null
        ? -1
        : c.rows.findIndex((entry) => entry.kind === 'quotient' && entry.step === found.quotientStep),
  };
}

/** One row's digits, with blanks contributing nothing. */
const rowText = (row) => (row?.digits ?? []).map((d) => (d === null ? '' : d)).join('');

/**
 * The answer as the graders want it: a string of digits for a question answered on one line,
 * and one string per row for one answered on several. `gradeMulColumn` is the only grader that
 * takes the list, and it is the only question that produces one.
 */
const answerText = (c) =>
  !c?.rows?.length ? '' : c.rows.length > 1 ? c.rows.map(rowText) : rowText(c.rows[0]);

/** What the whole answer reads as out loud — the rows in order, which is how it is written. */
const spokenAnswer = (c) => c.rows.map(rowText).filter(Boolean).join(', ');

const firstFilled = (digits) => digits.findIndex((d) => d !== null);

/**
 * Whether one row has an answer in it to submit. The ones box must be filled and there must be
 * no hole in the middle: `[8, _, 5]` is a child part way through, not the number 85, and
 * grading it as 85 would mark them right for something they had not finished saying.
 */
function isRowComplete(row) {
  if (!row?.digits?.length) return false;
  const first = firstFilled(row.digits);
  if (first === -1) return false;
  return row.digits.slice(first).every((d) => d !== null);
}

/** And the whole answer, which for a stacked multiplication means every line of the working. */
const isComplete = (c) => Boolean(c?.rows?.length) && c.rows.every(isRowComplete);

/**
 * Which box the next typed digit lands in, as a row and an index — or null when there is
 * nowhere left to put one.
 *
 * An inline answer has no cursor to speak of: digits shuffle left and the newest lands on the
 * right, which is how a number is written and read. A stacked one does, because *where* a digit
 * sits is the whole of what a column question is teaching, and because the answer may run over
 * several rows.
 */
function nextBox(c) {
  if (!c?.rows?.length) return null;
  if (!c.stacked) {
    const digits = c.rows[0].digits;
    return digits[0] === null ? { row: 0, index: digits.length - 1 } : null;
  }
  // A row that holds a number fills the same way an inline strip does: the digits shuffle right
  // and the newest always lands in the last box, so that is where the cursor sits. Once the row
  // is full it takes no more, rather than quietly pushing the first digit out of the end.
  const row = activeRow(c);
  if (flowsAsNumber(row) && c.cursor) {
    return row.digits[0] === null ? { row: c.cursor.row, index: row.digits.length - 1 } : null;
  }
  return c.cursor;
}

/** The ones box of a row — where writing a number starts, because that is where the work does. */
const onesBox = (c, row) => ({ row, index: c.rows[row].digits.length - 1 });

/**
 * One box to the left, and off the left-hand end into the ones of the row below.
 *
 * A row is *left* rather than filled: 51 written into three boxes leaves the hundreds blank, and
 * a child who has finished a row taps the next one to say so. Running off the end of the last
 * row parks the cursor, so a fourth digit cannot quietly overwrite the first.
 */
function stepCursor(c, at) {
  if (!at) return null;
  if (at.index > 0) return { row: at.row, index: at.index - 1 };
  return at.row + 1 < c.rows.length ? onesBox(c, at.row + 1) : null;
}

/* ------------------------------------------------------------ drawing it */

// The prompt is rebuilt only when its *shape* changes — a new question, or the cursor moving
// to another row. Every keystroke after that patches the boxes that are already on screen.
// That is not only cheaper: a carry box in writing mode is a live ink pad, and an innerHTML
// rewrite on every digit would destroy and recreate it under the child's finger.
let promptShape = null;

const shapeKey = (c) =>
  [
    c.layout,
    c.width,
    // Where a row sits is as much a part of the shape as how wide it is: two divisions with the
    // same row widths can still want their working in different columns.
    c.rows.map((r) => `${r.width}@${r.place}:${r.line}`).join('.'),
    c.carries.length,
    writingWanted(),
  ].join('|');

const slotMarkup = (row, r) =>
  row.digits.map(
    (digit, i) =>
      `<span class="slot" data-row="${r}" data-i="${i}">${digit === null ? '' : digit}</span>`
  );

/**
 * The answer as it stands. Inline questions right-align, because that is what a number does:
 * type 1 then 5 and it reads 1, then 15 — never "1_", which a child would read as ten-something.
 * Column questions do not shift at all: the digit written under the ones column stays under the
 * ones column.
 */
function renderAnswer() {
  const key = shapeKey(current);
  if (key !== promptShape) {
    promptShape = key;
    buildPrompt();
  }
  paintAnswer();
}

function buildPrompt() {
  // A stacked question's columns are finger-sized, and five of them will not fit beside the
  // pet — so the card lays itself out differently and the working goes underneath. Only the
  // stack moves; the clock, the inline sums and the times tables are untouched.
  el.promptCard.classList.toggle('is-stacked', current.stacked);
  const slots = current.rows.map((row, r) => slotMarkup(row, r));
  if (current.layout === 'divide') {
    // The stack owns where every row goes; this only hands it the boxes. Ones-first out of the
    // answer strip, because that is the order the rest of the game keeps digits in.
    el.promptSum.innerHTML = dividedMarkup(current.shown, {
      sign: divSign(),
      rows: current.rows.map((row, r) => ({ ...row, slots: [...slots[r]].reverse() })),
    });
  } else if (current.layout === 'column' && current.shown.op === '×') {
    el.promptSum.innerHTML = stackedMulMarkup(current.shown, {
      width: current.width,
      rows: current.rows.map((row, r) => ({
        slots: [...slots[r]].reverse(), // the stack wants them ones-first
        carries: carryMarkup(r),
      })),
    });
  } else if (current.layout === 'column') {
    el.promptSum.innerHTML = stackedMarkup(current.shown, {
      slots: [...slots[0]].reverse(),
      carries: carryMarkup(0),
      width: current.width,
    });
  } else if (current.layout === 'gap') {
    // The strip stands inside the equation rather than after it, on whichever side of the sign
    // `shownForm` put the blank. The product is on the right, where the child is going.
    const { a, b, gapSwapped } = current.shown;
    const strip = `<span class="gap-slots">${slots[0].join('')}</span>`;
    const written = gapSwapped ? `${strip}${OP_SIGNS['×']}${a}` : `${a}${OP_SIGNS['×']}${strip}`;
    el.promptSum.innerHTML = `${written}<i class="op">=</i>${a * b}`;
  } else {
    const { op, a, b } = current.shown;
    const strip = `<span class="ans-slots">${slots[0].join('')}</span>`;
    el.promptSum.innerHTML = `${a}${opSign(op)}${b}<i class="op">=</i>${strip}`;
  }
  attachCarryPads();
}

/** Put the current digits into the boxes already on screen, and say where the cursor is. */
function paintAnswer() {
  const next = writingWanted() ? null : nextBox(current);
  // Marked even in handwriting mode, where there is no cursor to show: the pads serve one row
  // at a time and which row they belong to is exactly the thing that needs saying.
  //
  // Long division only. Every other question in the game is answered on one line, where a row
  // to highlight would be the whole answer; the stacked multiplication has three, and could
  // take the same treatment, but it is not asking for it — its rows are read as a stack rather
  // than walked through in an order.
  const rowLit = current.layout === 'divide' && current.rows.length > 1;
  const live = activeRowIndex(current);
  for (const box of el.promptSum.querySelectorAll('.slot')) {
    const row = current.rows[Number(box.dataset.row)];
    const i = Number(box.dataset.i);
    const digit = row?.digits[i] ?? null;
    box.textContent = digit === null ? '' : String(digit);
    box.classList.toggle('is-empty', digit === null);
    box.classList.toggle(
      'is-next',
      Boolean(next) && !current.focus && next.row === Number(box.dataset.row) && next.index === i
    );
    // And the whole row it belongs to. A long division is answered on up to thirteen boxes
    // spread down nine lines, and one underlined box among them is easy to lose — so the row
    // being worked on lifts as a whole and the next box is picked out inside it.
    box.classList.toggle('is-live', rowLit && Number(box.dataset.row) === live);
  }
  // And what the row is made *from*. Working out which numbers go into the next thing you write
  // is most of the difficulty of long division — it is a different pair every row, and they are
  // scattered across the page — so the ingredients light up together with the row that needs
  // them. On paper a child does this with a finger; this is that finger.
  if (rowLit) {
    const used = ingredientsOf(current, live);
    for (const digit of el.promptSum.querySelectorAll('[data-dpos]')) {
      digit.classList.toggle('is-used', used.digits.includes(Number(digit.dataset.dpos)));
    }
    el.promptSum.querySelector('[data-by]')?.classList.toggle('is-used', used.divisor);
    for (const box of el.promptSum.querySelectorAll('.slot')) {
      box.classList.toggle('is-used', Number(box.dataset.row) === used.row);
    }
  }
  paintCarries();
  renderWriteTools();
  const spoken = t.spokenQuestion(current.shown);
  el.promptSum.setAttribute('aria-label', `${spoken} = ${spokenAnswer(current) || t('answer.empty')}`);
  el.submit.disabled = locked || !isComplete(current);
}

/* ------------------------------------------------------------ the carries */

/**
 * The little boxes above the columns. Scratch, and only scratch: nothing reads them, nothing
 * grades them, and leaving them empty is a perfectly good way to do a column sum. They are
 * here because writing the carry down is part of how the method is taught, and a child who
 * has been told to write it needs somewhere to write it.
 *
 * A column sum's carry is always a one, so its box is a one-tap toggle and has been since the
 * column tiers arrived. A multiplication's is anything from one to eight — 9 × 9 is 81 — so
 * those boxes take a real digit, and which widget that is follows *how the child is answering
 * the question*, not what device they are on: writing the answer means writing the carry, and
 * typing or tapping the answer means tapping the box to put the cursor in it and filling it
 * from the keyboard or the keypad. One rule everywhere, rather than one widget everywhere.
 */
function carryMarkup(rowIndex) {
  if (!current.carries[rowIndex]) return [];
  const toggles = current.shown.op !== '×';
  return current.carries[rowIndex].map((digit, i) => {
    const on = digit !== null;
    const label = escape(t(on ? 'answer.carryOn' : 'answer.carryOff'));
    if (toggles) {
      return `<button type="button" class="cw-cell cw-carrybox${on ? ' is-on' : ''}"` +
        ` data-carry="${rowIndex}" data-carry-i="${i}" aria-label="${label}">${on ? digit : ''}</button>`;
    }
    if (writingWanted()) {
      return `<span class="cw-cell cw-carrybox cw-carrypad" data-carry="${rowIndex}" data-carry-i="${i}"` +
        ` role="application" aria-label="${label}"></span>`;
    }
    return `<button type="button" class="cw-cell cw-carrybox cw-carrytype${on ? ' is-on' : ''}"` +
      ` data-carry="${rowIndex}" data-carry-i="${i}" aria-label="${label}">${on ? digit : ''}</button>`;
  });
}

function paintCarries() {
  for (const box of el.promptSum.querySelectorAll('[data-carry]')) {
    const digit = current.carries[Number(box.dataset.carry)]?.[Number(box.dataset.carryI)] ?? null;
    // A pad shows what the child drew, not what we read it as — the ink is the record.
    if (!box.classList.contains('cw-carrypad')) box.textContent = digit === null ? '' : String(digit);
    box.classList.toggle('is-on', digit !== null);
    box.classList.toggle(
      'is-focus',
      Boolean(current.focus) &&
        current.focus.row === Number(box.dataset.carry) &&
        current.focus.index === Number(box.dataset.carryI)
    );
  }
}

// The ink pads living in the carry boxes, when the child is writing rather than typing. Rebuilt
// with the prompt and torn down with it, and — because a carry is scratch — a misreading here
// costs nothing at all, which is why there is no correction chip beside them.
const carryPads = [];

function clearCarryPads() {
  for (const pad of carryPads) pad.destroy();
  carryPads.length = 0;
}

function attachCarryPads() {
  clearCarryPads();
  if (!writingWanted() || current.shown.op !== '×') return;
  for (const host of el.promptSum.querySelectorAll('.cw-carrypad')) {
    const row = Number(host.dataset.carry);
    const index = Number(host.dataset.carryI);
    const pad = createInkPad({
      host,
      onStart: () => {
        current.focus = null;
        host.classList.add('has-ink');
      },
      onSettled: () => {
        const strokes = pad.strokes;
        if (!strokes.length) {
          setCarry(row, index, null);
          host.classList.remove('has-ink');
          return;
        }
        setCarry(row, index, recognize(strokes, { memory: state.ink, pad: pad.pad }).digit);
      },
    });
    pad.attach();
    carryPads.push(pad);
  }
}

function setCarry(row, index, digit) {
  if (!current?.carries[row]) return;
  current.carries[row][index] = digit;
  paintCarries();
}

const blankCarries = (c) => c.carries.map((row) => row.map(() => null));

/**
 * Put a digit in the carry box the cursor is in, and give the cursor straight back to the
 * answer. A carry is one digit long — holding on to the cursor after it would mean the next
 * digit the child typed quietly overwrote the note they had just made, which is a nasty way to
 * lose your working.
 */
function fillFocusedCarry(digit) {
  const { row, index } = current.focus;
  current.focus = null;
  setCarry(row, index, Number(digit));
  audio.play('tick');
}

/**
 * A typed digit, whichever way the child is answering. In writing mode it fills the next empty
 * box rather than being ignored — a grown-up sitting beside a child on a touchscreen laptop
 * will reach for the keyboard, and having it do nothing there would be a small mystery for no
 * reason.
 */
function typeDigit(digit) {
  if (current?.focus) {
    fillFocusedCarry(digit);
    return;
  }
  if (!writingWanted()) {
    pushDigit(digit);
    return;
  }
  const at = nextBox(current);
  const slot = at ? writeSlots[at.index] : null;
  if (!slot) return;
  slot.digit = Number(digit);
  slot.corrected = true;
  slot.read = null;
  // The cursor has to move here too, or every digit typed would land in the same pad. It stops
  // at the end of the row rather than running on into the next: the pads only ever serve one
  // row, and the child says when that row is done.
  if (current.stacked) {
    const step = stepCursor(current, at);
    // Parked at the end of the row rather than running on into the next: the pads only ever
    // serve one row, and the child says when that row is done.
    current.cursor = step && step.row === at.row ? step : null;
  }
  audio.play('tick');
  renderSlot(slot);
  syncWrittenAnswer();
}

function pushDigit(digit) {
  if (locked || !current || !isSum(current)) return;
  if (current.focus) {
    fillFocusedCarry(digit);
    return;
  }
  const at = nextBox(current);
  if (!at) return;
  const row = current.rows[at.row];
  if (flowsAsNumber(row)) {
    // Left to right, settling right — and the cursor stays put, because the next digit lands in
    // the same box and pushes this one along. The child says when the row is done.
    row.digits = [...row.digits.slice(1), Number(digit)];
    current.row = at.row;
  } else if (current.stacked) {
    row.digits[at.index] = Number(digit);
    current.cursor = stepCursor(current, at);
    current.row = current.cursor?.row ?? at.row;
  } else {
    // Inline: everything shuffles left and the new digit lands on the right, which is how a
    // number is written and read.
    row.digits = [...row.digits.slice(1), Number(digit)];
  }
  audio.play('tick');
  renderAnswer();
}

function clearAnswer() {
  if (locked || !current || !isSum(current)) return;
  const written = current.rows.some((row) => row.digits.some((d) => d !== null));
  const scratched = current.carries.some((row) => row.some((d) => d !== null));
  if (!written && !scratched) return;
  // Adding's stand-in for waggling the clock hands: starting the answer over is the tell
  // that the child was not sure, and `qualityOf` reads it the same way.
  if (written) current.clears += 1;
  current.rows = current.rows.map(emptyRow);
  current.carries = blankCarries(current);
  current.row = 0;
  current.cursor = current.stacked ? onesBox(current, 0) : null;
  current.focus = null;
  audio.play('grab');
  renderAnswer();
}

/** The cursor's path in reverse: one box right, and off the right-hand end into the box the
 *  row above ended on. Mirrors `stepCursor` exactly, which is the only reason it is safe. */
function unstepCursor(c, at) {
  if (at.index + 1 < c.rows[at.row].digits.length) return { row: at.row, index: at.index + 1 };
  return at.row > 0 ? { row: at.row - 1, index: 0 } : null;
}

/**
 * The last box the child actually wrote in, walking back the way the cursor came and stepping
 * over anything they deliberately left blank — the leading box of a row that did not need it.
 */
function backCursor(c) {
  const filled = (box) => box && c.rows[box.row]?.digits[box.index] !== null;
  // A parked cursor has run off the end of the last row, so the last box there is may itself
  // be the one to rub out.
  let at = c.cursor ?? { row: c.rows.length - 1, index: 0 };
  if (!c.cursor && filled(at)) return at;
  while (at) {
    at = unstepCursor(c, at);
    if (filled(at)) return at;
  }
  return null;
}

/** Rub out the last box filled, rather than the whole answer. Four hand-written digits is a
 *  lot to lose over one slip. */
function backspaceAnswer() {
  if (locked || !current || !isSum(current)) return;
  if (current.focus) {
    setCarry(current.focus.row, current.focus.index, null);
    audio.play('grab');
    return;
  }
  if (!current.stacked) {
    const digits = current.rows[0].digits;
    const index = digits.map((d) => d !== null).lastIndexOf(true);
    if (index === -1) return;
    digits[index] = null;
    audio.play('grab');
    renderAnswer();
    return;
  }
  // A row of number rows undoes its own shuffle: the digits slide back to the right and the
  // last one written falls off the end. Walking the cursor backwards would rub out the box the
  // digit happens to be sitting in, which for a number is not where it was written.
  if (flowsAsNumber(activeRow(current))) {
    // Skipping rows the child left empty, so backspace on a fresh row reaches the one above.
    let at = current.cursor?.row ?? current.row;
    while (at >= 0 && current.rows[at].digits.every((d) => d === null)) at -= 1;
    if (at < 0) return;
    const row = current.rows[at];
    row.digits = [null, ...row.digits.slice(0, -1)];
    current.row = at;
    current.cursor = onesBox(current, at);
    audio.play('grab');
    renderAnswer();
    return;
  }
  // Backwards along the way the cursor came, so what is rubbed out is what was written last —
  // and the cursor lands on the box it emptied, ready to take the digit that should be there.
  const back = backCursor(current);
  if (!back) return;
  current.rows[back.row].digits[back.index] = null;
  current.cursor = back;
  current.row = back.row;
  audio.play('grab');
  renderAnswer();
}

/* --------------------------------------------------------- writing a number */

// One pad per digit of the answer, built once and reused. Two pads rather than one wide
// one, because segmenting a scribble into digits is a hard problem nobody needs solved
// here: give the child a box each and it does not arise.
//
// The number of boxes never depends on the answer — see math.answerWidth — and a
// single-digit answer may be written in either box. Both are read left to right and an
// empty one is skipped, so "8" in the left box is eight, not eighty.
const writeSlots = [];
let picking = null;
let lastDrawn = null;

/**
 * Whatever the pads currently say, put into the answer boxes.
 *
 * Which pad means which box depends on how the question is written, and getting it wrong is
 * how a column answer ends up shifted a place. Inline, the pads are read left to right and an
 * empty one is skipped, so "8" in either box is eight, not eighty. In a column, a pad *is* its
 * column: an empty one leaves that box empty, because a blank hundreds column is not a zero
 * and a digit that slid across would be a different number.
 */
function syncWrittenAnswer() {
  if (!current?.rows?.length) return;
  const row = current.rows[current.row] ?? current.rows[0];
  // A number row is read the inline way even inside a stack — left to right, empties skipped —
  // because that is what it is: a number written across two boxes, not two places.
  if (current.stacked && !flowsAsNumber(row)) {
    row.digits = writeSlots.map((slot) => slot.digit);
  } else {
    const written = writeSlots
      .map((slot) => (slot.digit === null ? '' : String(slot.digit)))
      .join('');
    const boxes = emptyBoxes(row.width);
    const start = row.width - written.length;
    for (let i = 0; i < written.length; i += 1) boxes[start + i] = Number(written[i]);
    row.digits = boxes;
  }
  renderAnswer();
}

/**
 * Hand the pads to the next row down.
 *
 * The strip holds one row at a time — fourteen ink pads will not fit across a phone, and a
 * stacked 247 × 38 wants fourteen boxes — so a child working down a stack says when a row is
 * finished rather than the game guessing. Guessing is not available anyway: a row is "complete"
 * the moment its ones box has a digit in it, and jumping away then would take the pads off a
 * child halfway through writing four hundred and thirty-seven.
 */
function nextWriteRow() {
  if (locked || !current?.stacked || current.row + 1 >= current.rows.length) return;
  if (!isRowComplete(current.rows[current.row])) return;
  current.row += 1;
  current.cursor = onesBox(current, current.row);
  renderAnswer();
  syncPadsToRow();
}

/** Whether that button is offered, and whether it may be pressed yet. */
function renderWriteTools() {
  const stack = writingWanted() && current?.rows?.length > 1;
  el.writeNext.hidden = !stack;
  // The button stands in the same row as the pads, so its width comes out of theirs — but only
  // where there is room for it. A long division is written one or two boxes at a time and has
  // room to spare; the widest multiplication row is five, and five pads and a button do not fit
  // across a phone. Pads squeezed small enough to make them fit are pads a child cannot write
  // in, so past three the button wraps underneath instead and the pads keep their size.
  const beside = stack && (current.rows[current.row]?.width ?? 0) <= 3;
  el.answerWrite.classList.toggle('has-next', beside);
  if (!stack) return;
  el.writeNext.disabled =
    current.row + 1 >= current.rows.length || !isRowComplete(current.rows[current.row]);
}

/** Rebuild the pad strip for whichever row the child is on now, and clear it for writing. */
function syncPadsToRow() {
  if (!writingWanted() || !current?.rows?.length) return;
  const row = current.rows[current.row] ?? current.rows[0];
  if (writeSlots.length !== row.width) buildWriteBoxes(row.width);
  resetWriting();
  for (const slot of writeSlots) slot.pad.resize();
}

function closePicker() {
  picking = null;
  el.writePicker.hidden = true;
}

function openPicker(slot) {
  picking = slot;
  el.writePickerKeys.innerHTML = Array.from(
    { length: 10 },
    (_, n) => `<button type="button" data-pick="${n}">${n}</button>`
  ).join('');
  el.writePickerTitle.textContent = `${t('answer.fixTitle')} ${t('answer.fixHint')}`;
  el.writePicker.hidden = false;
}

/**
 * The child has told us what they actually wrote. Two things follow: the answer changes,
 * and the recogniser learns. This is the only place a memory is written — clearing and
 * rewriting teaches nothing, because nobody said what the mark was meant to be.
 */
function correctSlot(slot, digit) {
  if (slot.read?.features) {
    state.ink = remember(state.ink, slot.read.features, digit);
    save();
  }
  slot.digit = digit;
  slot.corrected = true;
  // A misreading is our mistake, not theirs, so it must not land in the hesitation count
  // that `qualityOf` reads as "unsure of the maths".
  renderSlot(slot);
  syncWrittenAnswer();
  closePicker();
}

function renderSlot(slot) {
  const read = slot.read;
  slot.host.classList.toggle('has-ink', !slot.pad.isEmpty);
  if (slot.digit === null) {
    slot.readEl.innerHTML = '';
    return;
  }
  const unsure = Boolean(read?.unsure) && !slot.corrected;
  const parts = [
    `<button type="button" class="read-chip${unsure ? ' is-unsure' : ''}" data-fix="1"` +
      ` aria-label="${escape(t('answer.reads', { n: slot.digit }))}">${slot.digit}</button>`,
  ];
  // The runner-up, offered only when the reading is shaky: one tap instead of a rewrite.
  if (unsure && read.alternative !== null && read.alternative !== undefined) {
    parts.push(
      `<button type="button" class="read-alt" data-alt="${read.alternative}">` +
        `${escape(t('answer.orThis', { n: read.alternative }))}</button>`
    );
  }
  // And, only if a grown-up asked for it, which way round the digit usually goes.
  if (state.settings.mirrorNudge && read?.mirrored && !slot.corrected) {
    parts.push(
      `<span class="mirror-hint">${escape(t('answer.mirrored'))} <b>${slot.digit}</b></span>`
    );
  }
  slot.readEl.innerHTML = parts.join('');
}

function settleSlot(slot) {
  if (!current || !isSum(current) || locked) return;
  const { strokes, pad } = { strokes: slot.pad.strokes, pad: slot.pad.pad };
  if (!strokes.length) {
    slot.read = null;
    slot.digit = null;
    slot.corrected = false;
    renderSlot(slot);
    syncWrittenAnswer();
    return;
  }
  const read = recognize(strokes, { memory: state.ink, pad });
  slot.read = read;
  slot.digit = read.digit;
  slot.corrected = false;
  renderSlot(slot);
  syncWrittenAnswer();
}

function buildWriteBoxes(count) {
  for (const slot of writeSlots) slot.pad.destroy();
  writeSlots.length = 0;
  el.writeBoxes.innerHTML = '';
  // Three or four pads have to share the width two used to have to themselves, so the row says
  // how many there are and the stylesheet shrinks them to fit.
  el.writeBoxes.style.setProperty('--pads', String(count));
  for (let i = 0; i < count; i += 1) {
    const box = document.createElement('div');
    box.className = 'write-box';
    box.dataset.slot = String(i);
    const host = document.createElement('div');
    host.className = 'write-pad';
    host.setAttribute('role', 'application');
    host.setAttribute('aria-label', t('answer.writeHere'));
    const readEl = document.createElement('div');
    readEl.className = 'write-read';
    box.append(host, readEl);
    el.writeBoxes.append(box);

    const slot = { index: i, host, readEl, pad: null, read: null, digit: null, corrected: false };
    slot.pad = createInkPad({
      host,
      onStart: () => {
        lastDrawn = slot;
        closePicker();
        host.classList.add('has-ink');
      },
      onSettled: () => settleSlot(slot),
    });
    slot.pad.attach();
    writeSlots.push(slot);
  }
}

function resetWriting() {
  closePicker();
  lastDrawn = null;
  for (const slot of writeSlots) {
    slot.pad.clear();
    slot.read = null;
    slot.digit = null;
    slot.corrected = false;
    renderSlot(slot);
  }
}

el.writeBoxes.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button || locked) return;
  // By the box's own index, not by its position among the row's children: the row gains and
  // loses elements, and a click that landed on the wrong slot would be silent.
  const box = button.closest('.write-box');
  const slot = box ? writeSlots[Number(box.dataset.slot)] : null;
  if (!slot) return;
  if (button.dataset.alt !== undefined) correctSlot(slot, Number(button.dataset.alt));
  else if (button.dataset.fix !== undefined) openPicker(slot);
});

el.writePickerKeys.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (button && picking) correctSlot(picking, Number(button.dataset.pick));
});

el.writeUndo.addEventListener('click', () => {
  if (locked) return;
  (lastDrawn ?? writeSlots[writeSlots.length - 1])?.pad.undo();
  closePicker();
});

el.writeNext.addEventListener('click', () => {
  nextWriteRow();
});

el.writeClear.addEventListener('click', () => {
  if (locked || !current) return;
  // Starting the whole answer over *is* hesitation, unlike putting a misreading right.
  if (current.rows.some((row) => row.digits.some((d) => d !== null))) current.clears += 1;
  current.carries = blankCarries(current);
  current.rows = current.rows.map(emptyRow);
  current.row = 0;
  resetWriting();
  syncWrittenAnswer();
});

// The carry boxes. Never read, never graded — see `carryMarkup` — so they are handled here,
// well away from anything that decides whether an answer is right.
el.promptSum.addEventListener('click', (event) => {
  // Tapping a box puts the cursor in it. That is how a child says they have finished a row
  // whose leading box they meant to leave blank — 51 written into three boxes is finished at
  // two — and it is also how they go back and put one digit right without clearing the lot.
  // Not while the child is writing: there the pad strip serves one row at a time and the
  // "next row" button is what moves it on, so a tap that moved the cursor without moving the
  // pads would leave the two pointing at different rows.
  const slot = event.target.closest('.slot');
  if (slot && current?.stacked && !locked && !writingWanted()) {
    current.cursor = { row: Number(slot.dataset.row), index: Number(slot.dataset.i) };
    current.row = current.cursor.row;
    current.focus = null;
    audio.play('tick');
    paintAnswer();
    return;
  }
  const box = event.target.closest('[data-carry]');
  if (!box || locked || !current) return;
  const row = Number(box.dataset.carry);
  const index = Number(box.dataset.carryI);
  if (box.classList.contains('cw-carrytype')) {
    // A multiplication carry is a number, not a one, so tapping it does not set it — it puts
    // the cursor there and the next digit typed lands in it. Tapping it again gives the cursor
    // back to the answer.
    const same = current.focus?.row === row && current.focus?.index === index;
    current.focus = same ? null : { row, index };
    audio.play('tick');
    paintAnswer();
    return;
  }
  if (box.classList.contains('cw-carrypad')) return; // written in, not tapped
  setCarry(row, index, current.carries[row][index] === null ? 1 : null);
  audio.play('tick');
});

// pointerdown rather than click, for the same zero-latency reason the touch controls use it.
el.keypad.addEventListener('pointerdown', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  event.preventDefault();
  if (button.dataset.clear) clearAnswer();
  else pushDigit(button.dataset.digit);
});

// The keyboard always works, whatever the setting says — it costs nothing and a grown-up
// sitting next to a child on a laptop will reach for it.
document.addEventListener('keydown', (event) => {
  if (scene !== 'play' || !current || !isSum(current) || locked) return;
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  if (document.querySelector('.overlay:not([hidden])')) return;
  if (event.key >= '0' && event.key <= '9') {
    event.preventDefault();
    typeDigit(event.key);
  } else if (event.key === 'Backspace' || event.key === 'Delete') {
    event.preventDefault();
    if (writingWanted()) {
      if (current.rows.some((row) => row.digits.some((d) => d !== null))) current.clears += 1;
      resetWriting();
      syncWrittenAnswer();
    } else {
      backspaceAnswer();
    }
  } else if (event.key === 'Enter') {
    event.preventDefault();
    // Enter means "this row is done" while there is a row below, and "that is my answer" once
    // there is not — so a stack can be worked from the keyboard without reaching for the boxes.
    if (isComplete(current)) submit();
    else if (current?.stacked && current.rows.length > 1) {
      if (writingWanted()) nextWriteRow();
      else if (isRowComplete(current.rows[current.row]) && current.row + 1 < current.rows.length) {
        current.row += 1;
        current.cursor = onesBox(current, current.row);
        renderAnswer();
      }
    }
  }
});

/**
 * Which way round to write a question. Only a plain addition fact may be turned round: `3 + 5`
 * and `5 + 3` are the same thing to know and meeting both is how commutativity is taught. A
 * difference is not symmetric, and a column sum is written with the longer number on top,
 * so both are shown exactly as they came.
 */
function shownForm(question) {
  // A product turns round for the same reason a sum does, and a missing factor turns round
  // too — but there the swap moves the *blank*, from the right of the sign to the left of it,
  // and leaves the number the child was given and the number they are hunting exactly as they
  // were. `gapSwapped` is what the renderer reads to know which side the strip stands on.
  if (question.gap) {
    return Math.random() < 0.5 ? { ...question, gapSwapped: true } : question;
  }
  // A skill is shown exactly as it made itself. Turning `25 × 10` round would give `10 × 25`,
  // which is the same number and the wrong lesson: the rung is called "the digits stay put and
  // a zero goes on the end", and that sentence is only true of the way it was written.
  const commutes = (question.op === '+' || question.op === '×') && !question.skill;
  const swap = commutes && !question.column && Math.random() < 0.5;
  return swap ? { ...question, a: question.b, b: question.a } : question;
}

function askNext() {
  const id = nextItem(state, {
    now: now(),
    exclude: lastAskedId,
    lastSubject: subjectIdOf(lastAskedId),
  });
  const item = ensureItem(id);
  lastAskedId = id;
  const sum = isSum(item);
  // A fact *is* its question; a skill makes one up, from a seed built out of state the save was
  // keeping anyway — so a reload mid-question, and the retry two questions after a wrong
  // answer, both come back to the very same numbers the child was last looking at.
  const question = sum ? math.instanceOf(item) : { h: item.h, m: item.m };
  const width = sum ? math.answerWidth(item) : 0;
  const layout = sum ? math.layoutOf(question) : 'clock';
  // Almost every question is answered on one line. A stacked multiplication is the exception:
  // its rows are the two partial products and their total, and — like the width — they are a
  // property of the skill rather than of the numbers drawn, so the shape of the working can
  // never say how big the answer is going to be.
  const rows = sum ? math.answerRows(item) : [];
  current = {
    id,
    subject: item.subject ?? DEFAULT_SUBJECT,
    target: question,
    // Which way round the pair is written is decided fresh each time — but only for a sum.
    // The item is the same fact either way, which is the whole reason there is only one of it,
    // and seeing it both ways is how commutativity gets taught without a lesson about it.
    // Turning a *difference* round would not be the same question at all.
    shown: sum ? shownForm(question) : question,
    layout,
    // Both written layouts hold their digits where they are put rather than shuffling them
    // along, because *where* a digit sits is the whole of what they are teaching.
    stacked: layout === 'column' || layout === 'divide',
    width,
    rows: rows.map(emptyRow),
    row: 0,
    // Where the next digit lands, for a question that is written out: the ones of the first
    // row, because that is where the work starts. For a division the first row is the first
    // quotient digit, which is exactly where a child's pencil goes. An inline answer has no
    // cursor — its digits shuffle left and the newest lands on the right.
    cursor: layout === 'column' || layout === 'divide' ? { row: 0, index: rows[0].width - 1 } : null,
    // One row of scratch per run down the columns: one for a sum, one per partial product for a
    // multiplication, none at all for anything written on a single line. Never read, never graded.
    carries: Array.from({ length: sum ? math.carryRows(item, question) : 0 }, () =>
      new Array(width).fill(null)
    ),
    // Which carry box the cursor is in, when it is in one at all.
    focus: null,
    clears: 0,
    startedAt: now(),
    reversals: 0,
  };
  // The prompt's shape is rebuilt rather than patched whenever it changes, and a new question
  // always changes it.
  promptShape = null;

  const writing = sum && writingWanted();
  el.answerClock.hidden = sum;
  el.answerSum.hidden = !sum;
  el.keypad.hidden = !(sum && keypadWanted());
  el.answerWrite.hidden = !writing;
  el.tenframeHost.hidden = true;
  el.tenframeHost.innerHTML = '';
  if (writing) {
    const row = current.rows[0];
    if (writeSlots.length !== row.width) buildWriteBoxes(row.width);
    resetWriting();
    // The pads were laid out while hidden, where they had no size to measure.
    for (const slot of writeSlots) slot.pad.resize();
  }

  locked = false;
  renderPrompt(item);
  // A sum has nothing to submit until a digit is put down; the clock always has the hands
  // wherever they happen to be sitting.
  el.submit.disabled = sum;
  el.feedback.textContent = '';
  el.feedback.className = 'feedback';
  renderPetStage(item, moodOf(item, now()));
  if (!sum) {
    setGhostVisible(false);
    scatterHands(current.target);
  }
  save();
}

/* ------------------------------------------------------------------ answers */

const cheer = () => t(`cheer.${1 + Math.floor(Math.random() * 5)}`);

// One sentence per wrong idea. A child who added instead of subtracting and a child who
// miscounted by one have made different mistakes, and being told the same thing teaches
// neither of them anything.
const MATH_VERDICTS = {
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

/**
 * What the caption says under a wrong answer: the mistake named, where there is a name for it,
 * followed by the question stated the way the picture is about to show it.
 *
 * For a difference the closing sentence names the addition fact it is the flip side of —
 * "you know 7 + 8 = 15, so 15 − 8 = 7". That is deliberately not a new rule to hold on to but
 * a reminder of one the child has already mastered, which is the whole reason the subtraction
 * ladder mirrors the addition one rung for rung.
 */
function sumTeachLine(result) {
  const question = current.shown;
  const named = MATH_VERDICTS[result.verdict];
  const opening = (result.nearMiss ? t('teach.nearMiss') : '') + (named ? `${t(named)} ` : '');
  if (current.layout === 'divide') {
    const { a, b } = question;
    const rest = a % b;
    // What was left over is named when there was any, because "and two left over" is half of
    // what the answer to that question is.
    return opening + t(rest ? 'teach.divColRest' : 'teach.divColPlain', {
      a,
      b,
      quotient: Math.floor(a / b),
      rest,
    });
  }
  if (question.op === '÷') {
    const { a, b } = question;
    const answer = a / b;
    // A division closes on the product it is the flip side of — "you know 7 × 8 = 56, so
    // 56 ÷ 8 is 7". That is a sentence about something already mastered rather than a new rule
    // to hold, exactly as a difference closes on its addition partner. Only inside the deck the
    // game teaches, though: past that there is no partner to point at and the plain sentence is
    // the honest one.
    if (b <= 10 && answer <= 10) {
      const { a: small, b: large } = math.divfacts.partnerOf({ a, b });
      return opening + t('teach.divFamily', { a, b, answer, small, large });
    }
    return opening + t('teach.divPlain', { a, b, answer });
  }
  if (current.layout === 'column' && question.op === '×') {
    return opening + t('teach.mulColPlain', {
      a: question.a,
      b: question.b,
      total: question.a * question.b,
    });
  }
  if (current.layout === 'column') {
    return opening + t(question.op === '-' ? 'teach.colSubPlain' : 'teach.colAddPlain', {
      a: question.a,
      b: question.b,
      total: question.op === '-' ? question.a - question.b : question.a + question.b,
    });
  }
  if (question.op === '×') {
    const { a, b, gap } = question;
    const product = a * b;
    // A missing factor closes on the product it is the flip side of — "you know 7 × 8 = 56, so
    // the missing number is 8". That is a sentence about something already mastered rather
    // than a new rule to hold, exactly as a difference closes on its addition partner.
    if (gap) {
      const { a: small, b: large } = math.times.partnerOf({ a, b });
      return opening + t('teach.gapFamily', { a, b, product, small, large });
    }
    return opening + t('teach.mulPlain', { a, b, product });
  }
  if (question.op === '-') {
    const { a, b } = question;
    const rest = a - b;
    const params = { a, b, rest, small: Math.min(b, rest), large: Math.max(b, rest) };
    // The fact family only exists inside the deck the game teaches; past that there is no
    // partner to point at and the plain sentence is the honest one.
    const family = a <= 20 && b <= 10 && rest <= 10;
    return opening + t(family ? 'teach.subFamily' : 'teach.subPlain', params);
  }
  const { a, b } = question;
  const plan = fillPlan(a, b);
  const bridged = plan.rest > 0 && plan.a + plan.bridge === 10;
  const params = { a, b, sum: a + b, bridge: plan.bridge, rest: plan.rest };
  return opening + t(bridged ? 'teach.sumMakeTen' : 'teach.sumPlain', params);
}

function teachLine(target, result) {
  const prefix = result.nearMiss ? t('teach.nearMiss') : '';
  const params = {
    // The one string in a teach line that can be digits; with them off the sentence names
    // the time the same way the pet just did.
    time: digitalOn() ? timeId(target.h, target.m) : t.spoken(target.h, target.m),
    hour: t.hourWord(target.h),
    hourNum: target.h,
    next: (target.h % 12) + 1,
    jumps: target.m / 5,
    minutes: target.m,
  };
  if (result.verdict === 'hourOff') {
    const key =
      target.m === 0
        ? 'teach.hourExact'
        : target.m >= 30
          ? 'teach.hourPastHalf'
          : 'teach.hourJustLeft';
    return prefix + t(key, params);
  }
  if (result.verdict === 'minuteOff') {
    const key =
      target.m === 0
        ? 'teach.minuteOClock'
        : params.jumps === 1
          ? 'teach.minuteCountOne'
          : 'teach.minuteCountMany';
    return prefix + t(key, params);
  }
  return prefix + t('teach.both', params);
}

async function submit() {
  if (locked || !current) return;
  locked = true;
  el.submit.disabled = true;
  beginSessionIfNeeded();

  const subject = SUBJECTS[current.subject] ?? SUBJECTS[DEFAULT_SUBJECT];
  const sum = isSum(current);
  // Graded against the form on screen, not the canonical one: a commuted `5 + 3` and the fact
  // `3 + 5` come to the same number, but a column sum's columns do not line up if it is
  // turned round, so the question the child actually answered is the one to answer against.
  const target = current.shown;
  const answer = sum ? answerText(current) : { ...dial };
  const result = subject.grade(target, answer);
  const ms = now() - current.startedAt;
  const item = state.items[current.id];
  // How this item is scheduled, and which of its cases was just asked about. Both empty for
  // anything whose question never changes, which is every clock face and every fact.
  const pacing = subject.pacing?.(item) ?? {};

  state.reviewClock += 1;
  const outcome = review(item, {
    ...pacing,
    shape: current.shown?.shape ?? null,
    correct: result.correct,
    ms,
    reversals: sum ? current.clears : current.reversals,
    pace: subject.paceOf?.(item) ?? subject.paceScale,
    reviewClock: state.reviewClock,
    now: now(),
  });
  state.items[current.id] = outcome.item;

  state.session.answered += 1;
  state.stats.totalAnswered += 1;
  if (result.correct) {
    state.session.correct += 1;
    state.stats.totalCorrect += 1;
    state.stats.streak += 1;
    state.stats.bestStreak = Math.max(state.stats.bestStreak, state.stats.streak);
  } else {
    state.stats.streak = 0;
  }
  state.lastPlayedAt = now();
  // Asked before `touchDay` records today, and by the last entry rather than by the length:
  // the list is capped at 60 days, so a child on their sixty-first would never grow it again
  // and a length check would quietly stop paying them.
  const days = state.stats.daysPlayed;
  const firstToday = days[days.length - 1] !== dayStamp(now());
  state = touchDay(state, now());

  const { tiers, unlocked } = refreshTiers(state);
  state.tiers = tiers;

  // What this answer paid. A correct answer on its own pays nothing: what pays is a pet
  // arriving, a pet growing, a tier opening, and — below, once — turning up today at all.
  let paid = payoutFor(outcome.events);
  if (unlocked.length) paid += TIER_COINS * unlocked.length;
  if (firstToday) paid += dayBonusFor(state.stats.daysPlayed, dayStamp(now()));
  if (paid) state.coins = earn(state.coins, paid);
  // After the tier and the day have been recorded, because both are things a milestone is
  // about. Added to `paid` rather than shown separately: one answer, one lot of coins.
  paid += payMilestones();

  save();
  renderZooBadge();

  if (result.correct) await celebrate(outcome, paid);
  else await correct(target, answer, result);
  // Paid but nothing to celebrate — a day bonus on a wrong first answer still lands.
  if (paid && !result.correct) showCoins(paid);

  for (const subjectId of unlocked) await showUnlock(subjectId, tiers[subjectId]);

  const reason = session.shouldEnd(state.session, {
    now: now(),
    correct: result.correct,
    limits,
  });
  if (reason) startNap();
  else askNext();
}

async function celebrate(outcome, paid = 0) {
  const item = outcome.item;
  const streak = state.stats.streak;
  if (paid) showCoins(paid);

  if (outcome.events.evolved) {
    // The same shape as hatching, one size up: the pet whites out, and what comes back is
    // bigger. This is the only reward the SRS's long tail has, so it gets the full beat.
    const name = petName(item, t.lang);
    el.feedback.textContent = t('evolve.now');
    el.feedback.className = 'feedback good';
    el.petStage.querySelector('.pet')?.classList.add('evolving');
    audio.play('evolve');
    buzz([16, 50, 16, 50, 30]);
    await wait(reduceMotion() ? 250 : 950);
    renderPetStage(item, 'happy');
    el.petStage.querySelector('.pet')?.classList.add('arriving');
    confetti(el.petStage, el.fx, { power: 2.2 });
    el.feedback.textContent = t('evolve.done', { name, label: formLabel(item) });
    // The same look a hatch gets, a shade shorter: the pet was already there, and it has
    // changed rather than arrived.
    await admire(admireTimes().evolveMs);
    return;
  }

  if (outcome.events.hatched) {
    // The egg was the last thing standing between the child and a pet of their own —
    // this is the biggest moment the game has, so it gets its own beat.
    await hatchShow(item);
    return;
  }

  if (outcome.events.cracked) {
    // Not a pet yet, but visibly closer to one. A knock, a crack drawing itself on, and a few
    // flakes of shell — enough that the child can see the answer landed somewhere.
    const level = outcome.events.cracked;
    const pet = renderEggStage(item, level, { fresh: true });
    pet.classList.add('egg-jolt');
    audio.play('crack', { power: 0.8 + level * 0.3 });
    buzz([18, 40, 18]);
    confetti(el.petStage, el.fx, { power: 0.35, round: 0, colors: SHELL_DUST });
    el.feedback.textContent = t(`crack.${level}`);
    el.feedback.className = 'feedback good';
    await wait(reduceMotion() ? 900 : 1650);
    return;
  }

  el.feedback.textContent =
    streak >= 3 ? t('cheer.streak', { cheer: cheer(), n: streak }) : cheer();
  el.feedback.className = 'feedback good';
  audio.play(streak >= 3 ? 'streak' : 'correct');
  audio.play('feed');
  buzz([12, 30, 12]);
  confetti(el.petStage, el.fx, { power: streak >= 3 ? 1.5 : 1 });
  flyHeart(el.clock, el.petStage, el.fx);
  renderPetStage(item, 'happy');
  pop(el.petStage.querySelector('.pet-inner'), { power: streak >= 3 ? 1.3 : 1 });
  await wait(1250);
}

// Flakes off a breaking shell: bone and chalk, never the pet's colours. The pet's palette is
// saved for the burst, where it is the first hint of what is inside.
const SHELL_DUST = ['#fdf6ec', '#efe3d2', '#e2d3bd'];

/**
 * The hatch. Roughly three and a half seconds, and the only place in the game that spends that
 * much time on one thing — so a tap anywhere on the stage cuts it short and goes straight to the
 * pet, for the child on their thirtieth egg.
 *
 * The trick is the cloud: the pet is swapped in while the smoke is at its thickest, so nothing is
 * ever seen to turn into anything. The egg goes in, the smoke happens, and the pet is standing
 * there when it clears.
 */
/**
 * A run of pauses the child can cut short by tapping the pet.
 *
 * Used twice over a hatch, and deliberately not once: tapping through the shell breaking is
 * "get on with it", and tapping through the look at the new pet is a different "get on with
 * it". A child who skipped the build-up has not asked to skip meeting what came out of it, so
 * the two get separate tokens and the second starts fresh.
 */
function skippableBeats(host = el.petStage) {
  let skipped = false;
  let resolve = () => {};
  const done = new Promise((r) => {
    resolve = r;
  });
  const onDown = () => {
    skipped = true;
    resolve();
  };
  host.addEventListener('pointerdown', onDown);
  return {
    /** Wait, unless the child has already asked not to. False once they have. */
    async beat(ms) {
      if (skipped) return false;
      await Promise.race([wait(ms), done]);
      return !skipped;
    },
    get skipped() {
      return skipped;
    },
    release: () => host.removeEventListener('pointerdown', onDown),
  };
}

/**
 * The beat after something new appears. This is the whole of what the long tail of the
 * schedule is for — a pet that was not there before, or one that has grown — and until now it
 * was over in half a second, which is not long enough to notice a thing, let alone enjoy it.
 */
async function admire(ms) {
  const beats = skippableBeats();
  try {
    await beats.beat(ms);
  } finally {
    beats.release();
  }
}

/** How long the two celebrations hold, from the grown-up's setting. */
const admireTimes = () => session.admireFor(state.settings.admireSeconds);

async function hatchShow(item) {
  const name = petName(item, t.lang);
  const palette = SPECIES[appearanceOf(item).species]?.palette ?? [];
  el.feedback.className = 'feedback good';

  const arrive = () => {
    el.feedback.textContent = t('hatch.now');
    renderPetStage(item, 'happy');
    el.petStage.querySelector('.pet')?.classList.add('arriving');
    audio.play('hatch');
  };

  if (reduceMotion()) {
    el.feedback.textContent = t('hatch.now');
    buzz([14, 40, 14, 40, 24]);
    await wait(300);
    arrive();
    el.feedback.textContent = t('hatch.hello', { name });
    // The look is a pause, not an animation. A child who wants less motion does not want
    // less time to see what they have just been given.
    await admire(admireTimes().hatchMs);
    return;
  }

  const beats = skippableBeats();
  const beat = (ms) => beats.beat(ms);

  try {
    // The build-up: a twitch that grows into something trying to get out.
    const egg = el.petStage.querySelector('.pet');
    egg?.classList.remove('breathe');
    egg?.classList.add('egg-rocking');
    el.feedback.textContent = t('hatch.stir');
    buzz([14, 40, 14, 40, 24]);

    if (await beat(1100)) {
      // Three cracks in quick succession, each knock lower and heavier than the last.
      for (const level of [1, 2, 3]) {
        renderEggStage(item, level, { fresh: true }).classList.add('egg-jolt');
        audio.play('crack', { power: 0.8 + level * 0.35 });
        if (!(await beat(level === 3 ? 200 : 250))) break;
      }
    }

    if (!beats.skipped) {
      // The shell gives, and the cloud takes over.
      el.petStage.querySelector('.pet')?.classList.add('egg-burst');
      audio.play('poof');
      smokePuff(el.petStage, el.fx, { power: 1.4 });
      confetti(el.petStage, el.fx, { power: 2, round: 0, colors: palette });
      buzz([26, 60, 18]);
      el.feedback.textContent = t('hatch.now');
      await beat(500);
    }
  } finally {
    beats.release();
  }

  arrive();
  // The ending gets its own tap-to-skip, and it starts *here* rather than after the held
  // breath below. A child jabbing at the screen the instant the pet appears is asking to move
  // on, and a tap that lands in the gap before the listener exists does nothing, which they
  // read as the game ignoring them.
  const ending = skippableBeats();
  try {
    // A held breath before the cheer, so the pet is met before it is celebrated. A child who
    // skipped the shell still gets that moment — just a shorter one.
    await ending.beat(beats.skipped ? 500 : 700);
    confetti(el.petStage, el.fx, { power: 1.8 });
    el.feedback.textContent = t('hatch.hello', { name });
    // However impatient they are, long enough to read the name of the thing they have just
    // been given. Only what is left over after that can be tapped away.
    await wait(NAME_READ_MS);
    await ending.beat(Math.max(0, admireTimes().hatchMs - NAME_READ_MS));
  } finally {
    ending.release();
  }
}

// The pet says its name once, and that is the only time it is said. Everything else in the
// ending can be cut short; this cannot.
const NAME_READ_MS = 400;

/**
 * The wrong-answer path. No red, no cross, no buzzer: the hands simply walk from where
 * the child put them to where they belong, with a caption naming the mistake. Getting it
 * right on the retry celebrates exactly as hard as getting it right first time.
 */
/**
 * The wrong-answer path for a sum. The ten-frame is the counterpart to the clock's ghost
 * hands: it does not say the answer, it shows the shape of it — seven, then the three that
 * finish the ten, then the five that are left. Nothing is red and nothing is crossed out.
 */
async function correctSum(target, result) {
  const question = current.shown;
  el.feedback.textContent = sumTeachLine(result);
  el.feedback.className = 'feedback teach';
  const still = reduceMotion();
  el.tenframeHost.hidden = false;
  if (current.layout === 'divide') {
    // The long division's walkthrough, and it starts at the step the grader says went wrong.
    // Everything above it is drawn already finished: a child who got the first two steps right
    // does not need to watch them again, and a three-digit answer worked through in full is
    // nine rows on every miss.
    const instant = still || Boolean(state.settings.walkInstant);
    const step = stepFor(state.settings.walkSpeed ?? DEFAULT_WALK_SPEED);
    const opts = { from: stepOfRow(result.row ?? 0), sign: divSign() };
    el.tenframeHost.innerHTML = divideWalkHtml(question, {
      ...opts,
      step: instant ? 0 : step,
      title: t.spokenQuestion(question),
    });
    await wait(instant ? 1200 + current.width * 300 : divideWalkDuration(question, { ...opts, step }));
  } else if (question.op === '÷') {
    // Dots dealt into groups, a round at a time — "one each, and one each again" — which is the
    // dividing counterpart of the array and takes its pace from the same setting, for the same
    // reason: how long a child needs to watch is a fact about the child.
    //
    // Only where it is a picture worth drawing. The rung that divides by whole tens reaches four
    // hundred and fifty, and four hundred and fifty dots is not a picture, it is a wall — so
    // there the sentence stands on its own.
    const instant = still || Boolean(state.settings.walkInstant);
    const step = stepFor(state.settings.walkSpeed ?? DEFAULT_WALK_SPEED) * ROUND_STEP_SCALE;
    const { a, b } = question;
    const markup = shareSvg(a, b, { step: instant ? 0 : step, title: t.spokenQuestion(question) });
    el.tenframeHost.innerHTML = markup;
    el.tenframeHost.hidden = !markup;
    if (!markup) await wait(1600);
    else await wait(instant ? 1200 + Math.floor(a / b) * 120 : shareDuration(a, b, step));
  } else if (current.layout === 'column' && question.op === '×') {
    // The stacked multiplication's walkthrough, and it walks *one row* — the first that went
    // wrong, which the grader named. The rest of the stack is drawn finished: a child who got
    // the ones row right does not need to watch it done again, and 247 × 38 worked through in
    // full is ten columns and the better part of half a minute on every miss.
    const instant = still || Boolean(state.settings.walkInstant);
    const step = stepFor(state.settings.walkSpeed ?? DEFAULT_WALK_SPEED);
    const opts = { row: result.row ?? 0, width: current.width };
    el.tenframeHost.innerHTML = mulWalkHtml(question, {
      ...opts,
      step: instant ? 0 : step,
      title: t.spokenQuestion(question),
    });
    await wait(instant ? 1200 + current.width * 300 : mulWalkDuration(question, { ...opts, step }));
  } else if (current.layout === 'column') {
    // The column's counterpart to the clock's ghost hands: it does not say the answer, it does
    // the work — the ones column, then the carry lifting into the box above the tens.
    //
    // How fast is a grown-up's decision, because it is a fact about one child rather than
    // about the game. `walkInstant` skips the working altogether and lands on the finished
    // sum — the same still frame reduced motion gets, which is why the two share a path.
    const instant = still || Boolean(state.settings.walkInstant);
    const step = stepFor(state.settings.walkSpeed ?? DEFAULT_WALK_SPEED);
    el.tenframeHost.innerHTML = columnWalkHtml(question, {
      step: instant ? 0 : step,
      title: t.spokenQuestion(question),
    });
    // A still frame still needs long enough to be read, and a longer sum needs longer.
    await wait(instant ? 1200 + walkWidth(question) * 300 : walkDuration(question, step));
  } else if (question.op === '×') {
    // The array, counted out a row at a time — "eight, sixteen, twenty-four" — which is the
    // multiplying counterpart of the column walkthrough and takes its pace from the same
    // setting, for the same reason: how long a child needs to watch is a fact about the child.
    //
    // A missing factor is shown as the array it is hunting for: the rows are the factor they
    // were given, and the answer is how long each row turned out to be.
    const instant = still || Boolean(state.settings.walkInstant);
    const step = stepFor(state.settings.walkSpeed ?? DEFAULT_WALK_SPEED) * ROW_STEP_SCALE;
    const { a, b } = question;
    el.tenframeHost.innerHTML = arraySvg(a, b, {
      step: instant ? 0 : step,
      title: t.spokenQuestion(question),
    });
    await wait(instant ? 1200 + a * 120 : arrayDuration(a, b, step));
  } else {
    const { op = '+', a, b } = question;
    el.tenframeHost.innerHTML = tenFrameSvg(a, b, {
      step: still ? 0 : 0.07,
      title: t.spokenQuestion(question),
      op,
    });
    await wait(still ? 700 : fillDuration(a, b, 0.07, op));
  }
  renderPetStage(state.items[current.id], 'content');
  await wait(1700);
}

async function correct(target, answer, result) {
  audio.play('oops');
  if (isSum(current)) return correctSum(target, result);
  el.feedback.textContent = teachLine(target, result);
  el.feedback.className = 'feedback teach';
  setGhostVisible(true, answer.h, answer.m);
  await wait(360);
  await animateHandsTo(answer, target, reduceMotion() ? 1500 : 950);
  for (const g of [hands.ghostHour, hands.ghostMinute]) {
    g.querySelector('.hand').classList.add('fading');
  }
  renderPetStage(state.items[current.id], 'content');
  await wait(1700);
  setGhostVisible(false);
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------ session */

function beginSessionIfNeeded() {
  if (session.isRunning(state.session)) return;
  state.session = session.startSession(now());
  save();
}

function startNap() {
  // Finishing a session is itself worth paying for: the scheduler wants a child who stops
  // at the nap and comes back, not one who abandons a sitting halfway and reloads.
  state.coins = earn(state.coins, SESSION_COINS);
  payMilestones();
  state.session = session.beginNap({ ...state.session, startedAt: 0 }, now());
  save();
  audio.play('nap');
  clearCarryPads();
  current = null;
  locked = true;
  renderNapPets();
  showScene('nap');
}

function renderNapPets() {
  const sleepers = Object.values(state.items)
    .filter((item) => item.hatchedAt !== null)
    .slice(-3);
  // Before anything has hatched the nap card still needs someone asleep on it.
  const shown = sleepers.length ? sleepers : [{ h: 1, m: 0 }, { h: 2, m: 0 }, { h: 3, m: 0 }];
  el.napPets.innerHTML = shown
    .map((item) =>
      petSvg(appearanceOf(item), { mood: 'sleep', title: t('nap.sleeping') })
    )
    .join('');
}

function wakeUp() {
  state.session = session.startSession(now());
  save();
  audio.play('wake');
  showScene('play');
  askNext();
}

// One heartbeat drives the sky, the nap countdown and the idle hard cap.
setInterval(() => {
  const tick = now();
  const napping = session.isNapping(state.session, tick);

  document.documentElement.style.setProperty(
    '--dusk',
    napping
      ? '1'
      : String(session.isRunning(state.session) ? session.dayProgress(state.session, tick, limits) : 0)
  );

  // A session that ends while the child is standing in a habitat puts *that* pet to sleep
  // in front of them, rather than yanking them out to a nap card they did not ask for.
  // Only on the flip: this runs twice a second, and the bar redraws a collar clock.
  if (scene === 'habitat' && napping !== habitatNapping) {
    habitatNapping = napping;
    habitat.setNapping(napping);
    if (habitatId && state.items[habitatId]) renderHabitatBar(state.items[habitatId]);
  }

  if (napping) {
    el.napTimer.textContent = session.formatCountdown(session.napRemaining(state.session, tick));
    el.wake.disabled = true;
  } else if (state.session.napUntil) {
    el.napTimer.textContent = '0:00';
    el.wake.disabled = false;
  }

  // A child who wanders off mid-session still gets the break rather than an open game.
  if (
    !napping &&
    session.isRunning(state.session) &&
    session.capReached(state.session, tick, limits) &&
    scene !== 'nap' &&
    scene !== 'habitat'
  ) {
    startNap();
  }
}, 500);

/* --------------------------------------------------------------------- zoo */

function renderZooBadge() {
  const at = now();
  const practice = practiceOf(state);
  const hungry = Object.values(state.items).filter(
    (item) =>
      item.hatchedAt !== null &&
      item.phase === 'graduated' &&
      item.dueAt <= at &&
      // A resting pet never asks to be fed. Nagging a child about questions the game has
      // been told not to ask would be the worst of both.
      !isResting(item, practice)
  ).length;
  el.zooBadge.hidden = hungry === 0;
  el.zooBadge.textContent = String(hungry);
}

// Where a pet sits in the zoo. Clock pets keep the chronological order they have always
// had — an existing zoo must not rearrange itself — and the sums follow in teaching order
// after them. Sorting sums by `h` and `m`, which they do not have, was comparing NaN and
// leaving them in whatever order the save happened to list them.
const SUM_ORDER = new Map(math.ALL_ITEMS.map((entry, index) => [entry.id, index]));
const zooRank = (item) =>
  isSum(item)
    ? 10000 + (SUM_ORDER.get(math.idOf(item)) ?? 0)
    : (item.h ?? 0) * 60 + (item.m ?? 0);

/** What a pet wears to say which question it keeps: a clock face, a fact, or the name of the
 *  method it looks after. */
function penCollar(item, digits) {
  if (isSum(item)) {
    // Not hidden behind the digital setting, unlike the clock's: the question is the question,
    // and seeing it gives the answer away no more than the pet's name does. A skill's pet
    // wears the name of its method instead — there is no one sum to wear.
    // A missing-factor pet wears its question with the gap still in it: the pair alone would
    // be the product's collar, and the two pets would be indistinguishable in the grid.
    const label = item.skill
      ? escape(t(`skill.${item.skill}`))
      : item.gap
        ? `${item.a} × ? = ${item.a * item.b}`
        : `${item.a} ${opText(item.op)} ${item.b}`;
    return `<span class="collar-sum">${label}</span>`;
  }
  return `${collarClock(item.h, item.m)}${digits ? timeId(item.h, item.m) : ''}`;
}

function renderZoo() {
  renderStall();
  renderYard();
  const at = now();
  const digits = digitalOn();
  const practice = practiceOf(state);
  const napping = session.isNapping(state.session, at);
  const items = Object.entries(state.items).sort(([, a], [, b]) => {
    if ((a.hatchedAt === null) !== (b.hatchedAt === null)) return a.hatchedAt === null ? 1 : -1;
    return zooRank(a) - zooRank(b);
  });

  el.zooEmpty.hidden = items.length > 0;
  el.zooGrid.innerHTML = items
    .map(([id, item]) => {
      const isEgg = item.hatchedAt === null;
      const mood = moodOf(item, at, { napping });
      const art = isEgg
        ? eggSvg(portraitOf(item), { cracks: item.cracks ?? 0, title: eggTitle(item) })
        : petSvg(appearanceOf(item), { mood, title: escape(petName(item, t.lang)) });
      // Eggs no longer carry progress dots — the broken shell is the progress, and `eggTitle`
      // is what says so to anyone not looking at it.
      const resting = isResting(item, practice);
      // A moon rather than the nap's sleeping face: the nap means "back in two minutes" and
      // this means "not just now", and a child should be able to tell them apart.
      const flag = resting ? '🌙' : !isEgg && mood === 'hungry' ? '🍎' : '';
      const name = petName(item, t.lang);
      const label = escape(
        isEgg
          ? t('zoo.egg', { species: SPECIES[appearanceOf(item).species]?.name ?? '?' })
          : name
      );
      const rank = !isEgg && formFor(item.feeds ?? 0) >= 2 ? escape(formLabel(item)) : '';
      return `
        <button class="pen${isEgg ? ' is-egg' : ''}${resting ? ' is-resting' : ''}" type="button"
          data-id="${id}"${resting ? ` title="${escape(t('zoo.resting', { name }))}"` : ''}>
          <span class="pen-flag">${flag}</span>
          ${art}
          <span class="pen-name">${label}</span>
          ${rank ? `<span class="pen-rank">${rank}</span>` : ''}
          <span class="pen-time">${penCollar(item, digits)}</span>
        </button>`;
    })
    .join('');

  for (const pet of el.zooGrid.querySelectorAll('.pet')) {
    pet.style.setProperty('--blink-delay', `${(Math.random() * 6).toFixed(2)}s`);
    if (!napping) pet.classList.add('breathe');
  }
}

// Free play: tapping a pet takes you into its home, and a long press renames it from here.
// No questions and no scoring, deliberately available during the nap so the reward loop
// survives the break.
let penHold = null;
let renamed = false;

el.zooGrid.addEventListener('pointerdown', (event) => {
  const pen = event.target.closest('.pen');
  if (!pen) return;
  renamed = false;
  clearTimeout(penHold);
  penHold = setTimeout(() => {
    renamed = true;
    renamePet(pen.dataset.id);
  }, 700);
});

for (const evt of ['pointerup', 'pointercancel', 'pointerleave']) {
  el.zooGrid.addEventListener(evt, () => clearTimeout(penHold));
}

el.zooGrid.addEventListener('click', (event) => {
  const pen = event.target.closest('.pen');
  if (!pen || renamed) return;
  audio.play('purr');
  buzz(10);
  openHabitat(pen.dataset.id);
});

function renamePet(id) {
  const item = state.items[id];
  if (!item || item.hatchedAt === null) return;
  const chosen = prompt(t('zoo.rename'), petName(item, t.lang));
  if (chosen === null) return;
  const trimmed = chosen.trim().slice(0, 24);
  item.name = trimmed || null;
  save();
  renderZoo();
}

/* -------------------------------------------------------------------- shop */

// The stall is the only place a balance is shown, and the zoo is the only screen it appears
// on. Deliberately not in the header: a number beside the clock is a number a child watches
// instead of the hands, and the clock scene has one job.
//
// Two shelves, two tabs. The home shelf is bought for one named pet and needs to know which;
// the yard shelf is bought once for the whole zoo and has no pet to pick, so the picker goes
// away with it rather than sitting there meaning nothing.

const coinChip = (n) => `<span class="coin-pip" aria-hidden="true"></span>${n}`;

function renderStall() {
  el.stallBalance.innerHTML = coinChip(state.coins);
  el.stallBalance.title = t('coins.balance', { n: state.coins });
  el.shopStall.setAttribute('aria-label', `${t('shop.open')} — ${t('coins.balance', { n: state.coins })}`);
}

/**
 * The yard behind the stall. Drawn from the device's own hour, so the zoo is in daylight when
 * the child is — the one clock in the game that is not a question.
 */
function renderYard() {
  el.zooYard.innerHTML = yardSvg(state.zooDecor, {
    hour24: new Date(now()).getHours(),
    label: t('yard.label'),
  });
}

/** What this answer paid, drifting up off whatever earned it. */
function showCoins(amount) {
  audio.play('coin');
  flyCoins(scene === 'play' ? el.petStage : el.zooScene, el.fx, t('coins.earned', { n: amount }));
}

const hatchedPets = () =>
  Object.entries(state.items)
    .filter(([, item]) => item.hatchedAt !== null)
    .sort(([, a], [, b]) => a.h - b.h || a.m - b.m);

function openShop() {
  // Whichever pet the stall was serving last, while that pet still exists — a child buying
  // two things for the same pet should not have to find it again in between.
  const pets = hatchedPets();
  if (!pets.some(([id]) => id === shopPetId)) shopPetId = pets[0]?.[0] ?? null;
  el.shopNote.textContent = '';
  renderShop();
  el.shop.hidden = false;
  audio.play('purr');
}

function closeShop() {
  el.shop.hidden = true;
  el.shopNote.textContent = '';
}

/** The catalog the open tab is showing. */
const shelf = () => (shopTab === 'zoo' ? ZOO_CATALOG : HOME_CATALOG);

function renderTabs() {
  for (const tab of el.shopTabs.querySelectorAll('.shop-tab')) {
    const on = tab.dataset.tab === shopTab;
    tab.classList.toggle('is-on', on);
    tab.setAttribute('aria-selected', String(on));
  }
}

function renderShop() {
  const pets = hatchedPets();
  el.shopBalance.innerHTML = coinChip(state.coins);
  el.shopBalance.title = t('coins.balance', { n: state.coins });
  // With no pets there is nothing to shop for on either shelf: the yard's pieces are bought
  // for a zoo, and a zoo with no animals in it is not one yet.
  el.shopEmpty.hidden = pets.length > 0;
  el.shopBody.hidden = pets.length === 0;
  el.shopTabs.hidden = pets.length === 0;
  if (!pets.length) {
    el.shopPets.innerHTML = '';
    el.shopGrid.innerHTML = '';
    return;
  }

  renderTabs();

  // The picker belongs to the home shelf only. Hidden rather than emptied, so switching tabs
  // and coming back does not lose the pet the child had chosen.
  const home = shopTab === 'home';
  el.shopPick.hidden = !home;
  el.shopPets.hidden = !home;

  if (home) {
    el.shopPets.innerHTML = pets
      .map(([id, item]) => {
        const on = id === shopPetId;
        const name = escape(petName(item, t.lang));
        return `
          <button class="shop-pet${on ? ' is-on' : ''}" type="button"
                  aria-pressed="${on}" data-id="${id}">
            ${petSvg(appearanceOf(item), { mood: 'content', title: name })}
            <span class="shop-pet-name">${name}</span>
          </button>`;
      })
      .join('');
  }

  const pet = state.items[shopPetId];
  const petLabel = escape(petName(pet, t.lang));
  el.shopGrid.innerHTML = shelf()
    .map((entry) => {
      const locked = !isUnlocked(entry.id, state.tiers.clock);
      const owned = home ? isOwned(pet, entry.id) : zooOwns(state.zooDecor, entry.id);
      const poor = !canAfford(state.coins, entry.price);
      const name = escape(t(`shop.${entry.id}`));
      // Owned is checked before locked: a piece bought while its tier was open stays sellable
      // even if a save arrives from a device that had got further.
      const where = home ? t('shop.owned', { name: petLabel }) : t('shop.ownedZoo');
      const status = owned
        ? `<span class="shop-state">${escape(where)}</span>`
        : locked
          ? `<span class="shop-state is-locked">${escape(t('shop.locked'))}</span>`
          : `<span class="shop-price${poor ? ' is-poor' : ''}">${coinChip(entry.price)}</span>`;
      const cls = ['shop-card', owned && 'is-owned', !owned && locked && 'is-locked']
        .filter(Boolean)
        .join(' ');
      // A locked card is never disabled: tapping it is how a child finds out what it is
      // waiting for, and a dead button answers nothing.
      return `
        <button class="${cls}" type="button" data-id="${entry.id}">
          <span class="shop-art">${shopArt(entry.id)}</span>
          <span class="shop-name">${name}</span>
          ${status}
        </button>`;
    })
    .join('');
}

/**
 * The piece on its own, drawn from the same fragment the scene uses so the thing in the
 * shop and the thing in the pet's home can never drift apart. Coloured from the habitat the
 * child is actually shopping for, which is also the honest preview: a lantern is the colour
 * of the home it is going to. A yard piece takes the yard's own colours for the same reason.
 */
function shopArt(id) {
  const pet = state.items[shopPetId];
  const c = habitatOf(pet ?? { h: 12, m: 0 }).palette;
  const draw = YARD_PIECES[id] ?? BACKDROP[id] ?? FURNITURE[id] ?? FURNITURE.flowerbed;
  // Backdrop pieces are drawn for the horizon and are the tallest things in the catalog;
  // given the same box as a lantern they would come out as a stripe.
  const box = BACKDROP[id] ? '-26 -46 52 50' : '-24 -34 48 38';
  return `<svg viewBox="${box}" aria-hidden="true" focusable="false">${draw(c)}</svg>`;
}

/** Tapping a piece asks first, and shows it standing where it would go while it asks. */
function askToBuy(id) {
  const entry = shopItemById.get(id);
  if (!entry) return;
  return entry.scope === 'zoo' ? askToBuyZoo(entry) : askToBuyHome(entry);
}

function askToBuyHome(entry) {
  const pet = state.items[shopPetId];
  if (!pet) return;
  const id = entry.id;
  const label = t(`shop.${id}`);

  if (isOwned(pet, id)) {
    pendingPurchase = { id, mode: 'sell' };
    showConfirm(
      habitatSvg(habitatOf(sellItem(pet, id)), { label: t('shop.sellConfirm', { item: label, price: entry.price }) }),
      t('shop.sellConfirm', { item: label, price: entry.price }),
      t('shop.sell')
    );
    return;
  }
  if (!isUnlocked(id, state.tiers.clock)) return note(t('shop.lockedHelp'));
  if (isFull(pet, slotOf(id))) {
    // Which shelf is full matters: "sell something" is unhelpful advice if the child is
    // looking at an empty hill line and two things on the grass.
    return note(
      t(slotOf(id) === 'backdrop' ? 'shop.fullBackdrop' : 'shop.full', {
        name: petName(pet, t.lang),
      })
    );
  }
  if (!canAfford(state.coins, entry.price)) return note(t('shop.tooDear'));

  pendingPurchase = { id, mode: 'buy' };
  const copy = t('shop.confirm', { item: label, name: petName(pet, t.lang), price: entry.price });
  showConfirm(habitatSvg(habitatOf(buyItem(pet, id)), { label: copy }), copy, t('shop.buy'));
}

function askToBuyZoo(entry) {
  const id = entry.id;
  const label = t(`shop.${id}`);
  const yard = (decor, copy) => yardSvg(decor, { uid: 'confirm-yard', hour24: new Date(now()).getHours(), label: copy });

  if (zooOwns(state.zooDecor, id)) {
    const copy = t('shop.sellConfirm', { item: label, price: entry.price });
    pendingPurchase = { id, mode: 'sell' };
    showConfirm(yard(sellZoo(state.zooDecor, id), copy), copy, t('shop.sell'));
    return;
  }
  if (!isUnlocked(id, state.tiers.clock)) return note(t('shop.lockedHelp'));
  if (zooIsFull(state.zooDecor)) return note(t('shop.fullZoo'));
  if (!canAfford(state.coins, entry.price)) return note(t('shop.tooDear'));

  pendingPurchase = { id, mode: 'buy' };
  const copy = t('shop.confirmZoo', { item: label, price: entry.price });
  showConfirm(yard(buyZoo(state.zooDecor, id), copy), copy, t('shop.buy'));
}

function showConfirm(preview, copy, action) {
  el.confirmPreview.innerHTML = preview;
  el.confirmCopy.textContent = copy;
  el.confirmBuy.textContent = action;
  el.shopConfirm.hidden = false;
}

function closeConfirm() {
  el.shopConfirm.hidden = true;
  el.confirmPreview.innerHTML = '';
  pendingPurchase = null;
}

function commit() {
  const entry = pendingPurchase && shopItemById.get(pendingPurchase.id);
  if (!entry) return closeConfirm();
  const { id, mode } = pendingPurchase;
  const zoo = entry.scope === 'zoo';
  const pet = state.items[shopPetId];
  if (!zoo && !pet) return closeConfirm();

  if (mode === 'sell') {
    if (zoo) state.zooDecor = sellZoo(state.zooDecor, id);
    else state.items[shopPetId] = sellItem(pet, id);
    // Full price back, always. A child who tries something has to be able to undo it without
    // the undoing costing them anything, or trying things stops being safe.
    state.coins = earn(state.coins, entry.price);
    note(t('shop.sold', { price: entry.price }));
  } else {
    if (!canAfford(state.coins, entry.price)) return closeConfirm();
    if (zoo) {
      if (zooIsFull(state.zooDecor)) return closeConfirm();
      state.zooDecor = buyZoo(state.zooDecor, id);
      note(t('shop.boughtZoo'));
    } else {
      if (isFull(pet, slotOf(id))) return closeConfirm();
      state.items[shopPetId] = buyItem(pet, id);
      note(t('shop.bought', { name: petName(pet, t.lang) }));
    }
    state.coins = spend(state.coins, entry.price);
    audio.play('buy');
    buzz([12, 40, 18]);
  }

  save();
  closeConfirm();
  renderShop();
  renderStall();
  renderZoo();
  if (!zoo && habitatId === shopPetId) refreshHabitat();
}

const note = (message) => {
  el.shopNote.textContent = message;
};

el.shopStall.addEventListener('click', () => openShop());
el.shopClose.addEventListener('click', closeShop);
el.confirmCancel.addEventListener('click', closeConfirm);
el.confirmBuy.addEventListener('click', commit);

el.shopTabs.addEventListener('click', (event) => {
  const tab = event.target.closest('.shop-tab');
  if (!tab || tab.dataset.tab === shopTab) return;
  shopTab = tab.dataset.tab;
  note('');
  renderShop();
});

el.shopPets.addEventListener('click', (event) => {
  const pick = event.target.closest('.shop-pet');
  if (!pick) return;
  shopPetId = pick.dataset.id;
  note('');
  renderShop();
});

el.shopGrid.addEventListener('click', (event) => {
  const card = event.target.closest('.shop-card');
  if (card) askToBuy(card.dataset.id);
});

/**
 * A zoo that predates the shop is paid for the pets it already has, once. Without this a
 * child with forty pets meets a shop they cannot use and a week of saving; with it, the
 * feature arrives as a purse rather than as a locked door.
 *
 * `coinsGrantedAt` is the latch. It is set whether or not anything was owed, so an empty
 * zoo is not re-walked on every reload, and a save that has already been paid on another
 * device arrives with the latch already down.
 *
 */
function grantBackPay() {
  if (state.coinsGrantedAt) return;
  state.coins = earn(state.coins, retroGrant(state.items, state.tiers.clock));
  state.coinsGrantedAt = now();
  save();
}

/**
 * Read the milestones a save has already reached, and pointedly do *not* pay for them.
 *
 * A zoo that has run a six-week streak and finished two tiers would otherwise be handed a few
 * hundred coins for its history the moment this build first loaded — which is not a reward,
 * it is a windfall that empties the shop before the child has chosen anything. Recording them
 * as awarded means those particular milestones are simply behind this child; the next one
 * still pays, and pays properly.
 *
 * It needs a latch of its own rather than a share of `coinsGrantedAt`: every zoo that has met
 * the shop already has that flag down, and those are exactly the zoos with a history to read.
 * A brand new zoo reaches none of them, so nothing is latched away from a child starting now.
 */
function readMilestoneHistory() {
  if (state.milestonesGrantedAt) return;
  state.milestones = milestonesReached(state.items, state.stats);
  state.milestonesGrantedAt = now();
  save();
}

/**
 * Pay for anything the save has just become true about — a tier finished, a week of days in a
 * row, a species completed. Called on the answer path and when a session is banked, because
 * those are the only two moments any of them can change.
 *
 * Returns what it paid so the caller can decide when to show it: the milestone rides along
 * with whatever else that answer earned rather than throwing a second lot of coins up the
 * screen a beat later.
 */
function payMilestones() {
  const owed = settleMilestones(state.items, state.stats, state.milestones);
  if (!owed.coins) return 0;
  state.milestones = [...state.milestones, ...owed.ids];
  state.coins = earn(state.coins, owed.coins);
  return owed.coins;
}

/* ----------------------------------------------------------------- habitat */

const habitat = createHabitatScene({ host: el.habitatHost, fx: el.fx });
habitat.attach(el.habitatHost);

/** The name, rank and collar clock above the scene — everything the habitat says in words. */
function renderHabitatBar(item) {
  const isEgg = item.hatchedAt === null;
  const name = isEgg
    ? t('zoo.egg', { species: SPECIES[appearanceOf(item).species]?.name ?? '?' })
    : petName(item, t.lang);
  el.habitatName.textContent = name;
  el.habitatRank.textContent = !isEgg && formFor(item.feeds ?? 0) >= 2 ? formLabel(item) : '';
  el.habitatTime.innerHTML = `${collarClock(item.h, item.m, { size: 28 })}${
    digitalOn() ? `<span class="hab-digits">${timeId(item.h, item.m)}</span>` : ''
  }`;
  el.habitatRename.hidden = isEgg;

  const napping = session.isNapping(state.session, now());
  el.habitatNote.textContent = isEgg
    ? t('habitat.eggHint')
    : napping
      ? t('habitat.sleeping', { name })
      : t('habitat.hint', { name });
  return { name, isEgg };
}

/** Open a pet's home. Free play only — nothing in here writes to the save. */
function openHabitat(id) {
  const item = state.items[id];
  if (!item) return;
  habitatId = id;
  habitatNapping = session.isNapping(state.session, now());
  const { name, isEgg } = renderHabitatBar(item);
  habitat.open(item, {
    napping: habitatNapping,
    label: isEgg
      ? t('habitat.eggAria', { species: SPECIES[appearanceOf(item).species]?.name ?? '?' })
      : t('habitat.aria', { name }),
    title: escape(isEgg ? eggTitle(item) : name),
  });
  showScene('habitat');
}

function closeHabitat() {
  habitat.close();
  habitatId = null;
}

/** Repaint the open habitat from state — after a rename, or a language or format change. */
function refreshHabitat() {
  if (scene !== 'habitat' || !habitatId) return;
  const item = state.items[habitatId];
  if (!item) {
    closeHabitat();
    showScene('zoo');
    return;
  }
  const { name } = renderHabitatBar(item);
  habitat.setTitle(escape(name));
}

el.habitatBack.addEventListener('click', () => {
  closeHabitat();
  showScene('zoo');
});

el.habitatRename.addEventListener('click', () => {
  if (!habitatId) return;
  renamePet(habitatId);
  refreshHabitat();
});

/* ------------------------------------------------------------------- scenes */

function showScene(name) {
  scene = name;
  // A habitat is somewhere you *are*, not a tab: while one is open the game's own chrome
  // gets out of the way so the pet has the whole screen.
  if (name !== 'habitat' && habitatId) closeHabitat();
  el.playScene.hidden = name !== 'play';
  el.napScene.hidden = name !== 'nap';
  el.zooScene.hidden = name !== 'zoo';
  el.habitatScene.hidden = name !== 'habitat';
  document.body.classList.toggle('in-habitat', name === 'habitat');
  const zooish = name === 'zoo' || name === 'habitat';
  el.tabPlay.classList.toggle('is-on', !zooish);
  el.tabZoo.classList.toggle('is-on', zooish);
  el.tabPlay.setAttribute('aria-pressed', String(!zooish));
  el.tabZoo.setAttribute('aria-pressed', String(zooish));
  if (name === 'zoo') renderZoo();
  renderZooBadge();
}

el.tabPlay.addEventListener('click', () => {
  if (session.isNapping(state.session, now())) {
    renderNapPets();
    showScene('nap');
    return;
  }
  if (!current) {
    showScene('play');
    askNext();
  } else {
    showScene('play');
  }
});

el.tabZoo.addEventListener('click', () => showScene('zoo'));
el.napToZoo.addEventListener('click', () => showScene('zoo'));
el.wake.addEventListener('click', () => {
  if (session.isNapping(state.session, now())) return;
  wakeUp();
});
el.submit.addEventListener('click', submit);

/* ----------------------------------------------------------------- overlays */

async function showUnlock(subjectId, tier) {
  const sum = subjectId === math.id;
  const key = sum ? `tier.math.${tier}` : `tier.${tier}`;
  const species = (sum
    ? math.tierItems(tier).map((entry) => speciesOf({ subject: math.id, ...entry }))
    : tierItems(tier).map((time) => speciesFor(time.h, time.m))
  )
    .filter((s, i, all) => all.indexOf(s) === i)
    .slice(0, 4);
  el.unlockPets.innerHTML = species
    .map((s) => petSvg(speciesAppearance(s), { mood: 'happy' }))
    .join('');
  el.unlockTitle.textContent = t('unlock.title');
  el.unlockCopy.textContent = t('unlock.copy', {
    tier: t(`${key}.name`),
    blurb: t(`${key}.blurb`),
  });
  el.unlock.hidden = false;
  audio.play('unlock');
  confetti(el.unlockPets, el.fx, { power: 2 });
  await new Promise((resolve) => {
    el.unlockClose.addEventListener(
      'click',
      () => {
        el.unlock.hidden = true;
        resolve();
      },
      { once: true }
    );
  });
}

function renderGrownups() {
  const accuracy = state.stats.totalAnswered
    ? Math.round((state.stats.totalCorrect / state.stats.totalAnswered) * 100)
    : 0;
  const practice = practiceOf(state);
  const hatched = Object.values(state.items).filter(
    (item) => item.hatchedAt !== null && !isResting(item, practice)
  ).length;
  const rows = [
    [t('grownups.answered'), state.stats.totalAnswered],
    [t('grownups.accuracy'), `${accuracy}%`],
    [t('grownups.streak'), state.stats.bestStreak],
    // Counted over what is switched on. A target that includes material the game has been
    // told not to ask about is a target the child cannot reach.
    [t('grownups.hatched'), `${hatched} / ${enabledItemCount(practice)}`],
    [t('grownups.days'), state.stats.daysPlayed.length],
  ];
  el.grownupsStats.innerHTML = rows
    .map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`)
    .join('');

  /**
   * One block per subject: a switch, then its rungs.
   *
   * Maths has nineteen of them, which is more than anybody can read as a flat list, so they
   * are folded into groups — Pluss, Minus, Tiere, Kolonne — with the group the child is
   * actually working in open and the rest closed. The grouping is presentation and nothing
   * else: there is still one switch and one floor for the whole subject, because the ladder is
   * one ladder and a child who has not met subtraction has no business being handed column
   * subtraction.
   *
   * The floor moves one rung at a time, and only the two rungs either side of it carry a
   * button — "skip this" on the lowest one still being practised, "practise this" on the
   * highest one skipped. Offering `skip` on every rung would let a tap on tier 4 silently
   * skip tiers 0 to 3 as well, which is not what anybody pressing it would expect.
   */
  const rung = (subjectId, tier, keyOf, { on, floor, last }) => {
    const pct = Math.round(tierMastery(state.items, subjectId, tier.id) * 100);
    const locked = tier.id > (state.tiers[subjectId] ?? 0);
    const skipped = tier.id < floor;
    const button =
      on && tier.id === floor && tier.id < last
        ? `<button type="button" class="tier-skip" data-skip="${subjectId}" data-tier="${tier.id}">${escape(t('grownups.skip'))}</button>`
        : on && tier.id === floor - 1
          ? `<button type="button" class="tier-skip" data-unskip="${subjectId}" data-tier="${tier.id}">${escape(t('grownups.practiseThis'))}</button>`
          : '';
    const right = skipped
      ? `<span class="tier-note">${escape(t('grownups.skipped'))}</span>`
      : `<span class="tier-note">${pct}%</span>`;
    return `
      <div class="tier-row${locked ? ' locked' : ''}${skipped ? ' is-skipped' : ''}">
        <div class="tier-head">
          <span>${escape(t(keyOf(tier)))}${locked ? ' 🔒' : ''}</span>
          ${right}${button}
        </div>
        <div class="track"><div class="fill" style="width:${skipped ? 0 : pct}%"></div></div>
      </div>`;
  };

  const block = (subjectId, tiers, keyOf, groups = null) => {
    const on = isEnabled(practice, subjectId);
    const floor = floorOf(practice, subjectId);
    const last = tiers[tiers.length - 1].id;
    const opts = { on, floor, last };
    const reached = state.tiers[subjectId] ?? 0;
    const bars = groups
      ? groups
          .map((group) => {
            const rows = tiers.filter((tier) => group.tiers.includes(tier.id));
            const done = rows.filter((tier) => tierMastery(state.items, subjectId, tier.id) >= 1).length;
            // Open the group the child is actually working in — the one holding the highest
            // rung they have reached — and leave the finished ones folded away. Also the one
            // holding the floor, because that is where the skip and practise-this buttons are,
            // and a control folded out of sight is a control nobody finds.
            const open =
              group.tiers.includes(Math.min(reached, last)) ||
              group.tiers.includes(Math.min(floor, last)) ||
              group.tiers.includes(Math.max(floor - 1, 0));
            return `
      <details class="tier-group"${open ? ' open' : ''}>
        <summary>
          <span class="group-name">${escape(t(`group.${group.id}`))}</span>
          <span class="group-count">${done}/${rows.length}</span>
        </summary>
        ${rows.map((tier) => rung(subjectId, tier, keyOf, opts)).join('')}
      </details>`;
          })
          .join('')
      : tiers.map((tier) => rung(subjectId, tier, keyOf, opts)).join('');
    return `
      <div class="practice-subject${on ? '' : ' is-off'}">
        <div class="practice-head">
          <span class="practice-name">${escape(t(`subject.${subjectId}`))}</span>
          <input type="checkbox" class="setting-switch" data-subject="${subjectId}"
            aria-label="${escape(t(`subject.${subjectId}`))}" ${on ? 'checked' : ''} />
        </div>
        ${bars}
      </div>`;
  };

  el.grownupsTiers.innerHTML =
    block('clock', TIERS, (tier) => `tier.${tier.id}.name`) +
    block(math.id, math.TIERS, (tier) => `tier.math.${tier.id}.name`, math.GROUPS);
  el.grownups.hidden = false;
}

/**
 * Record a change of mind about what gets practised. `applyPractice` does the work: it puts
 * to sleep whatever just went away and wakes whatever came back, resuming each schedule
 * where it stopped rather than letting a month of due dates pile up behind it.
 */
function setPractice(next) {
  state = applyPractice(state, next, now());
  // A skipped rung counts as passed, so the ladder has to be recomputed or the subject
  // would sit forever waiting for mastery of something nobody is being asked.
  const { tiers } = refreshTiers(state);
  state.tiers = tiers;
  save();
  renderGrownups();
  renderZooBadge();
  // The question on screen may be one we have just stopped practising.
  if (scene === 'play' && !locked) askNext();
}

el.grownupsTiers.addEventListener('click', (event) => {
  const practice = practiceOf(state);
  const toggle = event.target.closest('input[data-subject]');
  if (toggle) {
    const subjectId = toggle.dataset.subject;
    const turningOff = !toggle.checked;
    // Something has to be left to ask about.
    if (turningOff && enabledSubjects(practice).length <= 1) {
      toggle.checked = true;
      el.grownupsNote.textContent = t('grownups.lastSubject');
      el.grownupsNote.hidden = false;
      return;
    }
    el.grownupsNote.hidden = true;
    setPractice({ ...practice, [subjectId]: { ...practice[subjectId], on: !turningOff } });
    return;
  }

  const button = event.target.closest('button[data-skip], button[data-unskip]');
  if (!button) return;
  el.grownupsNote.hidden = true;
  const skipping = button.dataset.skip !== undefined;
  const subjectId = skipping ? button.dataset.skip : button.dataset.unskip;
  const tier = Number(button.dataset.tier);
  setPractice({
    ...practice,
    [subjectId]: { ...practice[subjectId], floor: skipping ? tier + 1 : tier },
  });
});

// Tucked behind a long press so a child hunting for buttons never lands in it by accident.
let holdTimer = null;
const startHold = () => {
  clearTimeout(holdTimer);
  holdTimer = setTimeout(renderGrownups, 700);
};
const cancelHold = () => clearTimeout(holdTimer);
el.title.addEventListener('pointerdown', startHold);
for (const evt of ['pointerup', 'pointercancel', 'pointerleave']) {
  el.title.addEventListener(evt, cancelHold);
}

el.grownupsClose.addEventListener('click', () => {
  el.grownups.hidden = true;
});

el.grownupsReset.addEventListener('click', () => {
  const ok = confirm(t('grownups.resetConfirm'));
  if (!ok) return;
  clear();
  const keep = { ...state.settings };
  state = freshState(now());
  // Language and play time are the grown-up's choices about *this device*, not progress:
  // starting the child over should not also undo them.
  state.settings = keep;
  saver.flush();
  el.grownups.hidden = true;
  lastAskedId = null;
  showScene('play');
  askNext();
});

/* ----------------------------------------------------------------- settings */

/**
 * Repaint every string on the page in the current language. Static text carries a
 * `data-i18n` key; `data-i18n-html` marks the few strings with inline markup in them, and
 * `data-i18n-aria-label` the ones that live in an attribute. Anything drawn from state —
 * the question in flight, the zoo, an open panel — is re-rendered from the same state
 * rather than translated in place, so switching language mid-question changes the words
 * and nothing else.
 */
function applyLanguage() {
  t = translator(state.settings.language);
  document.documentElement.lang = t.lang;

  for (const node of document.querySelectorAll('[data-i18n]')) {
    node.textContent = t(node.dataset.i18n);
  }
  for (const node of document.querySelectorAll('[data-i18n-html]')) {
    // Only ever fed from the string tables in i18n.js, never from anything typed.
    node.innerHTML = t(node.dataset.i18nHtml);
  }
  for (const node of document.querySelectorAll('[data-i18n-aria-label]')) {
    node.setAttribute('aria-label', t(node.dataset.i18nAriaLabel));
  }

  applySound(); // its label is a string too
  el.playMinutesValue.textContent = t('settings.playTimeValue', { n: limits.minutes });
  // Filled in by hand rather than from `data-i18n`, so they have to be redrawn by hand too.
  renderWalkSpeed(state.settings.walkSpeed ?? DEFAULT_WALK_SPEED);
  renderAdmire(state.settings.admireSeconds);
  buildAnswerModeOptions();
  buildKeypad(); // its digits carry spoken labels, which are strings like any other
  for (const slot of writeSlots) {
    slot.host.setAttribute('aria-label', t('answer.writeHere'));
    renderSlot(slot);
  }

  if (current) renderPrompt(state.items[current.id]);
  if (scene === 'zoo') renderZoo();
  if (scene === 'nap') renderNapPets();
  refreshHabitat();
  renderStall();
  if (!el.shop.hidden) renderShop();
  if (!el.grownups.hidden) renderGrownups();
}

/** Repaint the two places a time is written. `applyLanguage` does not need this — both
 *  renders read the setting themselves — so this is only for the toggle and an import. */
function applyDigital() {
  if (current) renderPrompt(state.items[current.id]);
  if (scene === 'zoo') renderZoo();
  refreshHabitat();
}

const ANSWER_MODES = [
  { id: 'auto', key: 'settings.answerAuto' },
  { id: 'write', key: 'settings.answerWrite' },
  { id: 'type', key: 'settings.answerType' },
  { id: 'tap', key: 'settings.answerTap' },
];

function buildAnswerModeOptions() {
  el.answerMode.innerHTML = '';
  for (const mode of ANSWER_MODES) el.answerMode.append(new Option(t(mode.key), mode.id));
  el.answerMode.value = state.settings.answerMode ?? 'auto';
}

function buildLanguageOptions() {
  el.language.innerHTML = '';
  for (const lang of LANGUAGES) {
    // Each language names itself in its own words, so it stays findable to someone who
    // cannot read the language the app happens to be in.
    el.language.append(new Option(lang.label, lang.id));
  }
}

function openSettings() {
  el.language.value = t.lang;
  el.showDigital.checked = digitalOn();
  el.mirrorNudge.checked = Boolean(state.settings.mirrorNudge);
  el.answerMode.value = state.settings.answerMode ?? 'auto';
  el.playMinutes.value = String(limits.minutes);
  renderWalkSpeed(state.settings.walkSpeed ?? DEFAULT_WALK_SPEED);
  el.walkInstant.checked = Boolean(state.settings.walkInstant);
  renderAdmire(state.settings.admireSeconds);
  setTransferStatus('');
  el.playMinutesValue.textContent = t('settings.playTimeValue', { n: limits.minutes });
  el.settings.hidden = false;
}

el.openSettings.addEventListener('click', openSettings);
el.settingsClose.addEventListener('click', () => {
  el.settings.hidden = true;
});

el.language.addEventListener('change', () => {
  const chosen = el.language.value;
  state.settings.language = isLanguage(chosen) ? chosen : DEFAULT_LANGUAGE;
  save();
  applyLanguage();
});

el.answerMode.addEventListener('change', () => {
  state.settings.answerMode = el.answerMode.value;
  save();
  // The answering surface is chosen when a question is put, so the simplest way to apply a
  // change mid-session is to put the current one again.
  if (scene === 'play' && current && !locked) askNext();
});

el.mirrorNudge.addEventListener('change', () => {
  state.settings.mirrorNudge = el.mirrorNudge.checked;
  for (const slot of writeSlots) renderSlot(slot);
  save();
});

el.showDigital.addEventListener('change', () => {
  state.settings.showDigital = el.showDigital.checked;
  save();
  applyDigital();
});

// Live label while dragging; the setting itself lands on `change`, so a slider being
// swept does not restart the session limits on every pixel.
el.playMinutes.addEventListener('input', () => {
  el.playMinutesValue.textContent = t('settings.playTimeValue', {
    n: session.limitsFor(el.playMinutes.value).minutes,
  });
});

/** How long a new pet stays on screen, in seconds, shown as seconds. */
function renderAdmire(seconds) {
  const times = session.admireFor(seconds);
  el.admireSeconds.value = String(times.seconds);
  el.admireSecondsValue.textContent = t('settings.admireValue', {
    n: times.seconds.toFixed(1),
  });
}

// Live label while dragging; the setting lands on `change`, like the two sliders below it.
el.admireSeconds.addEventListener('input', () => {
  renderAdmire(el.admireSeconds.value);
});

el.admireSeconds.addEventListener('change', () => {
  state.settings.admireSeconds = session.admireFor(el.admireSeconds.value).seconds;
  renderAdmire(state.settings.admireSeconds);
  save();
});

/**
 * The walkthrough's pace, shown by name and by what it actually costs. A grown-up choosing
 * this is deciding how long their child sits looking at a sum they got wrong, so the seconds
 * are worth saying out loud rather than leaving them to be discovered.
 */
function renderWalkSpeed(id) {
  el.walkSpeed.value = String(walkSpeedIndex(id));
  el.walkSpeedValue.textContent = t('settings.walkSpeedValue', {
    name: t(`settings.walkSpeed.${id}`),
    // Two columns is the commonest column sum there is, so it is the honest one to quote.
    seconds: (walkDuration({ op: '+', a: 47, b: 38 }, stepFor(id)) / 1000).toFixed(1),
  });
  // Nothing to set the pace of if the working is switched off entirely.
  el.walkSpeed.disabled = Boolean(state.settings.walkInstant);
}

// Live label while dragging; the setting lands on `change`, like the play-time slider above.
el.walkSpeed.addEventListener('input', () => {
  renderWalkSpeed(walkSpeedAt(el.walkSpeed.value));
});

el.walkSpeed.addEventListener('change', () => {
  state.settings.walkSpeed = walkSpeedAt(el.walkSpeed.value);
  renderWalkSpeed(state.settings.walkSpeed);
  save();
});

el.walkInstant.addEventListener('change', () => {
  state.settings.walkInstant = el.walkInstant.checked;
  save();
  // The pace slider means nothing while the working is skipped, so it says so.
  renderWalkSpeed(state.settings.walkSpeed ?? DEFAULT_WALK_SPEED);
});

el.playMinutes.addEventListener('change', () => {
  limits = session.limitsFor(el.playMinutes.value);
  state.settings.playMinutes = limits.minutes;
  save();
  el.playMinutesValue.textContent = t('settings.playTimeValue', { n: limits.minutes });
  // A session already past the new limit is ended by the heartbeat on its next tick,
  // which is the honest outcome of shortening the cap mid-session.
});

/* ----------------------------------------------------------------- transfer */

/**
 * Import and export are grown-up business, so they report in a status line rather than
 * with the game's own noise and confetti. `parseTransfer` decides what a file or a code
 * is *before* anything is offered, which is what keeps a mistyped code from getting as
 * far as asking whether to wipe a child's zoo.
 */
function setTransferStatus(message, bad = false) {
  el.transferStatus.textContent = message;
  el.transferStatus.classList.toggle('is-bad', bad);
}

function download(filename, blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

el.exportFile.addEventListener('click', () => {
  const file = exportFilename(now());
  const json = payloadToJson(exportPayload(state, now()));
  download(file, new Blob([json], { type: 'application/json' }));
  setTransferStatus(t('transfer.saved', { file }));
});

el.exportCode.addEventListener('click', async () => {
  const code = encodeCode(exportPayload(state, now()));
  try {
    await navigator.clipboard.writeText(code);
    setTransferStatus(t('transfer.copied'));
  } catch {
    // No clipboard permission, or not a secure context. The code is still the thing they
    // asked for, so hand it over the other way rather than refusing.
    download(exportFilename(now()).replace(/\.json$/, '.txt'), new Blob([code], { type: 'text/plain' }));
    setTransferStatus(t('transfer.copyFailed'), true);
  }
});

el.importFile.addEventListener('click', () => {
  el.importInput.value = ''; // so picking the same file twice still fires `change`
  el.importInput.click();
});

el.importInput.addEventListener('change', async () => {
  const file = el.importInput.files?.[0];
  if (file) runImport(await file.text());
});

el.importCode.addEventListener('click', () => {
  const pasted = prompt(t('transfer.pastePrompt'));
  if (pasted !== null) runImport(pasted);
});

function runImport(text) {
  let payload;
  try {
    payload = parseTransfer(text);
  } catch (error) {
    setTransferStatus(t(error instanceof TransferError ? error.key : 'transfer.badFile'), true);
    return;
  }

  if (!confirm(t('transfer.confirm'))) return;

  state = applyImport(state, payload, now());
  // A zoo arriving from a build that predates the shop collects its back pay here rather
  // than on the next reload, so the child can spend it in the session they imported it in.
  grantBackPay();
  readMilestoneHistory();
  // Queue the new state *then* force it out: flushing first would push whatever the old
  // zoo had left pending and lose the import to a tab closed in the next few hundred ms.
  save();
  saver.flush();
  // The zoo that was in flight belongs to the save that has just been replaced, and so does
  // whichever pet the stall was serving.
  clearCarryPads();
  current = null;
  lastAskedId = null;
  shopPetId = null;
  shopTab = 'home';
  setTransferStatus(t('transfer.imported', { n: petCount(state.items) }));
  applyLanguage();
  showScene('play');
  askNext();
}

/* -------------------------------------------------------------------- sound */

function applySound() {
  const on = state.settings.sound;
  audio.setMuted(!on);
  setHaptics(state.settings.haptics && on);
  el.sound.textContent = on ? '🔊' : '🔈';
  el.sound.setAttribute('aria-pressed', String(on));
  el.sound.setAttribute('aria-label', t(on ? 'sound.on' : 'sound.off'));
}

el.sound.addEventListener('click', () => {
  state.settings.sound = !state.settings.sound;
  state.settings.haptics = state.settings.sound;
  applySound();
  save();
});

/* --------------------------------------------------------------------- boot */

window.addEventListener('pagehide', () => saver.flush());
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') saver.flush();
});

buildClock();
buildLanguageOptions();
el.playMinutes.min = String(session.PLAY_MINUTES_MIN);
el.playMinutes.max = String(session.PLAY_MINUTES_MAX);
applyLanguage();
grantBackPay();
readMilestoneHistory();
renderZooBadge();
renderStall();

// A reload is not a way to buy more play: both the nap and a session already in progress
// are picked up from storage exactly where they were left. Only a session old enough to
// have been abandoned (STALE_SESSION_MS) is thrown away, so coming back tomorrow does not
// drop the child straight into a nap.
if (session.isNapping(state.session, now())) {
  renderNapPets();
  showScene('nap');
} else if (session.isRunning(state.session) && !session.isStale(state.session, now())) {
  if (session.capReached(state.session, now())) {
    startNap();
  } else {
    showScene('play');
    askNext();
  }
} else {
  state.session = { ...session.startSession(0), napUntil: 0 };
  showScene('play');
  askNext();
}
