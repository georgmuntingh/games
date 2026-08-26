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
import * as addition from './subjects/addition.js';
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
  speciesAppearance,
  speciesFor,
  speciesForFact,
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
    species: speciesFor(payload.h, payload.m),
    reviewClock: state.reviewClock,
  });
  return state.items[id];
}

// One line per crack, so the anticipation survives the gap between two sittings: an egg the
// child left half-broken says so the moment it comes back on screen.
const EGG_PROMPTS = ['prompt.egg', 'prompt.egg1', 'prompt.egg2'];
// The clock's lines all end by leading into a time — "they eat at…" — which is the wrong
// sentence in front of an equation, so adding gets its own set rather than a shared one
// with the ending filed off.
const SUM_EGG_PROMPTS = ['prompt.sumEgg', 'prompt.sumEgg1', 'prompt.sumEgg2'];

const isSum = (item) => (item?.subject ?? DEFAULT_SUBJECT) === addition.id;

function promptFor(item) {
  const sum = isSum(item);
  if (item.hatchedAt === null) {
    const prompts = sum ? SUM_EGG_PROMPTS : EGG_PROMPTS;
    return { line: t(prompts[Math.min(item.cracks ?? 0, prompts.length - 1)]), button: t('button.warm') };
  }
  const name = petName(item, t.lang);
  const state_ =
    item.phase === 'learning' ? 'Forgot' : item.dueAt <= now() ? 'Hungry' : 'Snack';
  const key = sum ? `prompt.sum${state_}` : `prompt.${state_.toLowerCase()}`;
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
      ? eggSvg(appearanceOf(item).species, { cracks: item.cracks ?? 0, title: eggTitle(item) })
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
  el.petStage.innerHTML = eggSvg(appearanceOf(item).species, { cracks, title: eggTitle(item) });
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
    el.promptSpoken.textContent = t.spokenSum(current.shown.a, current.shown.b);
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

/**
 * The answer as it stands, right-aligned in its slots. Right-aligned because that is what a
 * number does: type 1 then 5 and it reads 1, then 15 — never "1_", which a child would read
 * as ten-something. It also means a single-digit answer given in a two-slot strip lands
 * where they would have written it.
 */
function renderAnswer() {
  const value = current?.answer ?? '';
  const width = current?.width ?? 1;
  const pad = width - value.length;
  const slots = [];
  for (let i = 0; i < width; i += 1) {
    const filled = i >= pad;
    const classes = ['slot', filled ? '' : 'is-empty', i === width - 1 && !filled ? 'is-next' : '']
      .filter(Boolean)
      .join(' ');
    slots.push(`<span class="${classes}">${filled ? value[i - pad] : ''}</span>`);
  }
  const { a, b } = current.shown;
  el.promptSum.innerHTML = `${a}<i class="op">+</i>${b}<i class="op">=</i>${slots.join('')}`;
  el.promptSum.setAttribute(
    'aria-label',
    `${t.spokenSum(a, b)} = ${value || t('answer.empty')}`
  );
  el.submit.disabled = locked || value.length === 0;
}

/**
 * A typed digit, whichever way the child is answering. In writing mode it fills the first
 * empty box rather than being ignored — a grown-up sitting beside a child on a touchscreen
 * laptop will reach for the keyboard, and having it do nothing there would be a small
 * mystery for no reason.
 */
function typeDigit(digit) {
  if (!writingWanted()) {
    pushDigit(digit);
    return;
  }
  const slot = writeSlots.find((entry) => entry.digit === null);
  if (!slot) return;
  slot.digit = Number(digit);
  slot.corrected = true;
  slot.read = null;
  audio.play('tick');
  renderSlot(slot);
  syncWrittenAnswer();
}

function pushDigit(digit) {
  if (locked || !current || !isSum(current) || current.answer.length >= current.width) return;
  current.answer += String(digit);
  audio.play('tick');
  renderAnswer();
}

function clearAnswer() {
  if (locked || !current || !isSum(current) || !current.answer) return;
  // Adding's stand-in for waggling the clock hands: starting the answer over is the tell
  // that the child was not sure, and `qualityOf` reads it the same way.
  current.clears += 1;
  current.answer = '';
  audio.play('grab');
  renderAnswer();
}


/* --------------------------------------------------------- writing a number */

// One pad per digit of the answer, built once and reused. Two pads rather than one wide
// one, because segmenting a scribble into digits is a hard problem nobody needs solved
// here: give the child a box each and it does not arise.
//
// The number of boxes never depends on the answer — see addition.answerWidth — and a
// single-digit answer may be written in either box. Both are read left to right and an
// empty one is skipped, so "8" in the left box is eight, not eighty.
const writeSlots = [];
let picking = null;
let lastDrawn = null;

/** Whatever the boxes currently say, as the answer string the rest of the game uses. */
function syncWrittenAnswer() {
  if (!current) return;
  current.answer = writeSlots
    .map((slot) => (slot.digit === null ? '' : String(slot.digit)))
    .join('');
  renderAnswer();
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
  for (let i = 0; i < count; i += 1) {
    const box = document.createElement('div');
    box.className = 'write-box';
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
  const slot = writeSlots[[...el.writeBoxes.children].indexOf(button.closest('.write-box'))];
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

el.writeClear.addEventListener('click', () => {
  if (locked || !current) return;
  // Starting the whole answer over *is* hesitation, unlike putting a misreading right.
  if (current.answer) current.clears += 1;
  resetWriting();
  syncWrittenAnswer();
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
      if (current.answer) current.clears += 1;
      resetWriting();
      syncWrittenAnswer();
    } else {
      clearAnswer();
    }
  } else if (event.key === 'Enter' && current.answer) {
    event.preventDefault();
    submit();
  }
});

function askNext() {
  const id = nextItem(state, {
    now: now(),
    exclude: lastAskedId,
    lastSubject: subjectIdOf(lastAskedId),
  });
  const item = ensureItem(id);
  lastAskedId = id;
  const sum = isSum(item);
  current = {
    id,
    subject: item.subject ?? DEFAULT_SUBJECT,
    target: sum ? { a: item.a, b: item.b } : { h: item.h, m: item.m },
    // Which way round the pair is written is decided fresh each time. The item is the same
    // fact either way — that is the whole reason there is only one of it — and seeing it
    // both ways is how commutativity gets taught without a lesson about it.
    shown: sum && Math.random() < 0.5 ? { a: item.b, b: item.a } : { a: item.a, b: item.b },
    width: sum ? addition.answerWidth() : 0,
    answer: '',
    clears: 0,
    startedAt: now(),
    reversals: 0,
  };

  const writing = sum && writingWanted();
  el.answerClock.hidden = sum;
  el.answerSum.hidden = !sum;
  el.keypad.hidden = !(sum && keypadWanted());
  el.answerWrite.hidden = !writing;
  el.tenframeHost.hidden = true;
  el.tenframeHost.innerHTML = '';
  if (writing) {
    if (writeSlots.length !== current.width) buildWriteBoxes(current.width);
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

const SUM_VERDICTS = {
  offByOne: 'teach.sumOffByOne',
  transposed: 'teach.sumTransposed',
  gaveAddend: 'teach.sumGaveAddend',
  gaveDifference: 'teach.sumGaveDifference',
};

/**
 * What the caption says under a wrong sum: the mistake named, where there is a name for it,
 * followed by the fact stated the way the picture is about to show it. Telling a child who
 * subtracted the same sentence as a child who miscounted by one would teach neither.
 */
function sumTeachLine(result) {
  const { a, b } = current.shown;
  const plan = fillPlan(a, b);
  const bridged = plan.rest > 0 && plan.a + plan.bridge === 10;
  const params = { a, b, sum: a + b, bridge: plan.bridge, rest: plan.rest };
  const named = SUM_VERDICTS[result.verdict];
  return (
    (result.nearMiss ? t('teach.nearMiss') : '') +
    (named ? `${t(named)} ` : '') +
    t(bridged ? 'teach.sumMakeTen' : 'teach.sumPlain', params)
  );
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
  const target = current.target;
  const answer = sum ? current.answer : { ...dial };
  const result = subject.grade(target, answer);
  const ms = now() - current.startedAt;

  state.reviewClock += 1;
  const outcome = review(state.items[current.id], {
    correct: result.correct,
    ms,
    reversals: sum ? current.clears : current.reversals,
    pace: subject.paceScale,
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
    await wait(1800);
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
    await wait(1200);
    return;
  }

  let skipped = false;
  let release = () => {};
  const skip = new Promise((resolve) => {
    const onDown = () => {
      skipped = true;
      resolve();
    };
    el.petStage.addEventListener('pointerdown', onDown);
    release = () => el.petStage.removeEventListener('pointerdown', onDown);
  });

  /** A beat a tap can cut short. False once the child has asked to get on with it. */
  const beat = async (ms) => {
    if (skipped) return false;
    await Promise.race([wait(ms), skip]);
    return !skipped;
  };

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

    if (!skipped) {
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
    release();
  }

  arrive();
  // A held breath before the cheer, so the pet is met before it is celebrated. A child who
  // skipped still gets that moment — just a shorter one.
  if (skipped) {
    await wait(500);
    confetti(el.petStage, el.fx, { power: 1.8 });
    el.feedback.textContent = t('hatch.hello', { name });
    await wait(900);
    return;
  }
  await wait(700);
  confetti(el.petStage, el.fx, { power: 1.8 });
  el.feedback.textContent = t('hatch.hello', { name });
  await wait(500);
}

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
  const { a, b } = current.shown;
  el.feedback.textContent = sumTeachLine(result);
  el.feedback.className = 'feedback teach';
  const still = reduceMotion();
  el.tenframeHost.hidden = false;
  el.tenframeHost.innerHTML = tenFrameSvg(a, b, {
    step: still ? 0 : 0.07,
    title: t.spokenSum(a, b),
  });
  await wait(still ? 700 : fillDuration(a, b));
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
const SUM_ORDER = new Map(addition.ALL_ITEMS.map((fact, index) => [fact.id, index]));
const zooRank = (item) =>
  isSum(item)
    ? 10000 + (SUM_ORDER.get(addition.idOf(item)) ?? 0)
    : (item.h ?? 0) * 60 + (item.m ?? 0);

/** What a pet wears to say which question it keeps: a clock face, or its sum. */
function penCollar(item, digits) {
  if (isSum(item)) {
    // Not hidden behind the digital setting, unlike the clock's: the sum is the question,
    // and seeing it gives the answer away no more than the pet's name does.
    return `<span class="collar-sum">${item.a} + ${item.b}</span>`;
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
        ? eggSvg(appearanceOf(item).species, { cracks: item.cracks ?? 0, title: eggTitle(item) })
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
  const sum = subjectId === addition.id;
  const key = sum ? `tier.add.${tier}` : `tier.${tier}`;
  const species = (sum
    ? addition.tierItems(tier).map((fact) => speciesForFact(fact.a, fact.b))
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
   * The floor moves one rung at a time, and only the two rungs either side of it carry a
   * button — "skip this" on the lowest one still being practised, "practise this" on the
   * highest one skipped. Offering `skip` on every rung would let a tap on tier 4 silently
   * skip tiers 0 to 3 as well, which is not what anybody pressing it would expect.
   */
  const block = (subjectId, tiers, keyOf) => {
    const on = isEnabled(practice, subjectId);
    const floor = floorOf(practice, subjectId);
    const last = tiers[tiers.length - 1].id;
    const bars = tiers
      .map((tier) => {
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
      })
      .join('');
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
    block(addition.id, addition.TIERS, (tier) => `tier.add.${tier.id}.name`);
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
