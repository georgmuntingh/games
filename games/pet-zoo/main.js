// Pet Zoo — wiring. The thinking lives in clock.js, srs.js, curriculum.js and session.js;
// this module owns the DOM, the pointer drag and the order things happen in.

import {
  advanceMinuteTo,
  angleOf,
  grade,
  hourAngle,
  inferHour,
  minuteAngle,
  norm360,
  parseTimeId,
  pickHand,
  pointOnFace,
  snapMinute,
  timeId,
} from './clock.js';
import { TIERS, tierItems, tierMastery } from './curriculum.js';
import { DEFAULT_LANGUAGE, isLanguage, LANGUAGES, translator } from './i18n.js';
import { CRACK_STAGES, createItem, nextItem, refreshTier, review } from './srs.js';
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
  promptSpoken: $('prompt-spoken'),
  clock: $('clock'),
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
  const { h, m } = parseTimeId(id);
  state.items[id] = createItem({ h, m, species: speciesFor(h, m), reviewClock: state.reviewClock });
  return state.items[id];
}

// One line per crack, so the anticipation survives the gap between two sittings: an egg the
// child left half-broken says so the moment it comes back on screen.
const EGG_PROMPTS = ['prompt.egg', 'prompt.egg1', 'prompt.egg2'];

function promptFor(item) {
  if (item.hatchedAt === null) {
    const line = EGG_PROMPTS[Math.min(item.cracks ?? 0, EGG_PROMPTS.length - 1)];
    return { line: t(line), button: t('button.warm') };
  }
  const name = petName(item, t.lang);
  const key =
    item.phase === 'learning'
      ? 'prompt.forgot'
      : item.dueAt <= now()
        ? 'prompt.hungry'
        : 'prompt.snack';
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
  const digits = digitalOn();
  el.promptLine.textContent = prompt.line;
  el.promptDigital.textContent = timeId(item.h, item.m);
  el.promptDigital.hidden = !digits;
  el.promptSpoken.textContent = t.spoken(item.h, item.m);
  // Without the digits the phrase is the whole question, so it takes their weight.
  el.promptSpoken.classList.toggle('is-lead', !digits);
  el.submit.textContent = prompt.button;
}

function askNext() {
  const id = nextItem(state, { now: now(), exclude: lastAskedId });
  const item = ensureItem(id);
  lastAskedId = id;
  current = { id, target: { h: item.h, m: item.m }, startedAt: now(), reversals: 0 };

  renderPrompt(item);
  el.submit.disabled = false;
  el.feedback.textContent = '';
  el.feedback.className = 'feedback';
  renderPetStage(item, moodOf(item, now()));
  setGhostVisible(false);
  scatterHands(current.target);
  locked = false;
  save();
}

/* ------------------------------------------------------------------ answers */

const cheer = () => t(`cheer.${1 + Math.floor(Math.random() * 5)}`);

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

  const target = current.target;
  const answer = { ...dial };
  const result = grade(target, answer);
  const ms = now() - current.startedAt;

  state.reviewClock += 1;
  const outcome = review(state.items[current.id], {
    correct: result.correct,
    ms,
    reversals: current.reversals,
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

  const { tier, unlocked } = refreshTier(state);
  state.tier = tier;

  // What this answer paid. A correct answer on its own pays nothing: what pays is a pet
  // arriving, a pet growing, a tier opening, and — below, once — turning up today at all.
  let paid = payoutFor(outcome.events);
  if (unlocked) paid += TIER_COINS;
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

  if (unlocked) await showUnlock(tier);

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
async function correct(target, answer, result) {
  audio.play('oops');
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
  const hungry = Object.values(state.items).filter(
    (item) => item.hatchedAt !== null && item.phase === 'graduated' && item.dueAt <= at
  ).length;
  el.zooBadge.hidden = hungry === 0;
  el.zooBadge.textContent = String(hungry);
}

function renderZoo() {
  renderStall();
  renderYard();
  const at = now();
  const digits = digitalOn();
  const napping = session.isNapping(state.session, at);
  const items = Object.entries(state.items).sort(([, a], [, b]) => {
    if ((a.hatchedAt === null) !== (b.hatchedAt === null)) return a.hatchedAt === null ? 1 : -1;
    return a.h - b.h || a.m - b.m;
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
      const flag = !isEgg && mood === 'hungry' ? '🍎' : '';
      const label = escape(
        isEgg
          ? t('zoo.egg', { species: SPECIES[appearanceOf(item).species]?.name ?? '?' })
          : petName(item, t.lang)
      );
      const rank = !isEgg && formFor(item.feeds ?? 0) >= 2 ? escape(formLabel(item)) : '';
      return `
        <button class="pen${isEgg ? ' is-egg' : ''}" type="button" data-id="${id}">
          <span class="pen-flag">${flag}</span>
          ${art}
          <span class="pen-name">${label}</span>
          ${rank ? `<span class="pen-rank">${rank}</span>` : ''}
          <span class="pen-time">${collarClock(item.h, item.m)}${digits ? timeId(item.h, item.m) : ''}</span>
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
      const locked = !isUnlocked(entry.id, state.tier);
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
  if (!isUnlocked(id, state.tier)) return note(t('shop.lockedHelp'));
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
  if (!isUnlocked(id, state.tier)) return note(t('shop.lockedHelp'));
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
  state.coins = earn(state.coins, retroGrant(state.items, state.tier));
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

async function showUnlock(tier) {
  const spec = TIERS[tier];
  const species = tierItems(tier)
    .map((time) => speciesFor(time.h, time.m))
    .filter((s, i, all) => all.indexOf(s) === i)
    .slice(0, 4);
  el.unlockPets.innerHTML = species
    .map((s) => petSvg(speciesAppearance(s), { mood: 'happy' }))
    .join('');
  el.unlockTitle.textContent = t('unlock.title');
  el.unlockCopy.textContent = t('unlock.copy', {
    tier: t(`tier.${spec.id}.name`),
    blurb: t(`tier.${spec.id}.blurb`),
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
  const hatched = Object.values(state.items).filter((i) => i.hatchedAt !== null).length;
  const rows = [
    [t('grownups.answered'), state.stats.totalAnswered],
    [t('grownups.accuracy'), `${accuracy}%`],
    [t('grownups.streak'), state.stats.bestStreak],
    [t('grownups.hatched'), `${hatched} / 144`],
    [t('grownups.days'), state.stats.daysPlayed.length],
  ];
  el.grownupsStats.innerHTML = rows
    .map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`)
    .join('');

  el.grownupsTiers.innerHTML = TIERS.map((tier) => {
    const pct = Math.round(tierMastery(state.items, tier.id) * 100);
    const locked = tier.id > state.tier;
    return `
      <div class="tier-row${locked ? ' locked' : ''}">
        <div class="tier-head"><span>${escape(t(`tier.${tier.id}.name`))}${locked ? ' 🔒' : ''}</span><span>${pct}%</span></div>
        <div class="track"><div class="fill" style="width:${pct}%"></div></div>
      </div>`;
  }).join('');
  el.grownups.hidden = false;
}

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
