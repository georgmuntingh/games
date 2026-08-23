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
import { createItem, nextItem, refreshTier, review } from './srs.js';
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
import { createSaver, freshState, load, clear, touchDay } from './store.js';
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
import { audio } from './audio.js';
import { buzz, confetti, flyHeart, pop, reduceMotion, setHaptics, wiggle } from './juice.js';

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
  sky: $('sky'),
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

/* -------------------------------------------------------------------- clock */

const CX = 200;
const CY = 200;
const R = 180;
const HOUR_LEN = 100;
const MINUTE_LEN = 150;
const TAIL = 14;

const svgEl = (tag, attrs = {}, text) => {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  if (text !== undefined) node.textContent = text;
  return node;
};

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

function promptFor(item) {
  if (item.hatchedAt === null) {
    return { line: t('prompt.egg'), button: t('button.warm') };
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

function renderPetStage(item, mood) {
  const markup =
    item.hatchedAt === null
      ? eggSvg(appearanceOf(item).species, { title: t('zoo.eggTitle') })
      : petSvg(appearanceOf(item), { mood, title: escape(petName(item, t.lang)) });
  el.petStage.innerHTML = markup;
  const pet = el.petStage.querySelector('.pet');
  pet.classList.add('breathe');
  pet.style.setProperty('--blink-delay', `${(Math.random() * 5).toFixed(2)}s`);
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
  state = touchDay(state, now());

  const { tier, unlocked } = refreshTier(state);
  state.tier = tier;
  save();
  renderZooBadge();

  if (result.correct) await celebrate(outcome);
  else await correct(target, answer, result);

  if (unlocked) await showUnlock(tier);

  const reason = session.shouldEnd(state.session, {
    now: now(),
    correct: result.correct,
    limits,
  });
  if (reason) startNap();
  else askNext();
}

async function celebrate(outcome) {
  const item = outcome.item;
  const streak = state.stats.streak;

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
    el.feedback.textContent = t('hatch.now');
    el.feedback.className = 'feedback good';
    el.petStage.querySelector('.pet').classList.add('hatching');
    audio.play('hatch');
    buzz([14, 40, 14, 40, 24]);
    await wait(reduceMotion() ? 200 : 780);
    renderPetStage(item, 'happy');
    el.petStage.querySelector('.pet').classList.add('arriving');
    confetti(el.petStage, el.fx, { power: 1.8 });
    el.feedback.textContent = t('hatch.hello', { name: petName(item, t.lang) });
    await wait(1500);
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

  el.sky.style.setProperty(
    '--dusk',
    napping
      ? '1'
      : String(session.isRunning(state.session) ? session.dayProgress(state.session, tick, limits) : 0)
  );

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
    scene !== 'nap'
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
        ? eggSvg(appearanceOf(item).species, { title: t('zoo.eggTitle') })
        : petSvg(appearanceOf(item), { mood, title: escape(petName(item, t.lang)) });
      const flag = isEgg
        ? `${'●'.repeat(item.correctStreak)}${'○'.repeat(Math.max(0, 3 - item.correctStreak))}`
        : mood === 'hungry'
          ? '🍎'
          : '';
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

// Free play: tapping a pet does nothing but make it happy, and a long press renames it.
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
  wiggle(pen.querySelector('.pet-inner'));
  audio.play('purr');
  buzz(10);
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

/* ------------------------------------------------------------------- scenes */

function showScene(name) {
  scene = name;
  el.playScene.hidden = name !== 'play';
  el.napScene.hidden = name !== 'nap';
  el.zooScene.hidden = name !== 'zoo';
  el.tabPlay.classList.toggle('is-on', name !== 'zoo');
  el.tabZoo.classList.toggle('is-on', name === 'zoo');
  el.tabPlay.setAttribute('aria-pressed', String(name !== 'zoo'));
  el.tabZoo.setAttribute('aria-pressed', String(name === 'zoo'));
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
  if (!el.grownups.hidden) renderGrownups();
}

/** Repaint the two places a time is written. `applyLanguage` does not need this — both
 *  renders read the setting themselves — so this is only for the toggle and an import. */
function applyDigital() {
  if (current) renderPrompt(state.items[current.id]);
  if (scene === 'zoo') renderZoo();
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
  // Queue the new state *then* force it out: flushing first would push whatever the old
  // zoo had left pending and lose the import to a tab closed in the next few hundred ms.
  save();
  saver.flush();
  // The zoo that was in flight belongs to the save that has just been replaced.
  current = null;
  lastAskedId = null;
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
renderZooBadge();

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
