// Pet Zoo — wiring. The thinking lives in clock.js, srs.js, curriculum.js and session.js;
// this module owns the DOM, the pointer drag and the order things happen in.

import {
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
  spokenTime,
  timeId,
} from './clock.js';
import { TIERS, tierItems, tierMastery } from './curriculum.js';
import { createItem, nextItem, refreshTier, review } from './srs.js';
import * as session from './session.js';
import { collarClock, eggSvg, moodOf, petName, petSvg, speciesFor, SPECIES } from './pets.js';
import { createSaver, freshState, load, clear, touchDay } from './store.js';
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

/** Signed shortest distance in minutes, so a sweep past 12 counts as forward motion. */
function minuteDelta(from, to) {
  let d = (to - from) % 60;
  if (d > 30) d -= 60;
  if (d < -30) d += 60;
  return d;
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
    const delta = minuteDelta(dial.m, m);
    const sign = Math.sign(delta);
    if (sign && drag.lastSign && sign !== drag.lastSign) current.reversals += 1;
    if (sign) drag.lastSign = sign;
    setDial(dial.h, m);
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
    const step = (t) => {
      const p = Math.min(1, (t - t0) / duration);
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
  const name = petName(item);
  if (item.hatchedAt === null) {
    return {
      line: 'A chilly egg! It hatches at…',
      button: 'Warm the egg!',
    };
  }
  if (item.phase === 'learning') {
    return { line: `${name} forgot their snack time. It is…`, button: `Feed ${name}!` };
  }
  return {
    line: item.dueAt <= now() ? `${name} is hungry! They eat at…` : `${name} fancies a snack at…`,
    button: `Feed ${name}!`,
  };
}

function renderPetStage(item, mood) {
  const markup =
    item.hatchedAt === null
      ? eggSvg(item.species, { title: 'A chilly egg' })
      : petSvg(item.species, { mood, title: escape(petName(item)) });
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

function askNext() {
  const id = nextItem(state, { now: now(), exclude: lastAskedId });
  const item = ensureItem(id);
  lastAskedId = id;
  current = { id, target: { h: item.h, m: item.m }, startedAt: now(), reversals: 0 };

  const prompt = promptFor(item);
  el.promptLine.textContent = prompt.line;
  el.promptDigital.textContent = timeId(item.h, item.m);
  el.promptSpoken.textContent = spokenTime(item.h, item.m);
  el.submit.textContent = prompt.button;
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

const CORRECT_CHEERS = ['Yes!', 'Perfect!', 'Spot on!', 'Nailed it!', 'That is it!'];

function teachLine(target, result) {
  const jumps = target.m / 5;
  const prefix = result.nearMiss ? 'So close! ' : '';
  if (result.verdict === 'hourOff') {
    const next = (target.h % 12) + 1;
    if (target.m === 0) {
      return `${prefix}At ${target.h} o'clock the short fat hand points straight at the ${target.h}.`;
    }
    if (target.m >= 30) {
      return `${prefix}The short fat hand is past halfway from the ${target.h} to the ${next} — but it is still the ${target.h}.`;
    }
    return `${prefix}Look at the short fat hand: at ${timeId(target.h, target.m)} it has just left the ${target.h}.`;
  }
  if (result.verdict === 'minuteOff') {
    return target.m === 0
      ? `${prefix}At ${target.h} o'clock the long hand points straight up.`
      : `${prefix}Count round in fives: ${jumps} jump${jumps === 1 ? '' : 's'} past the top is ${target.m} minutes.`;
  }
  return `${prefix}Here is where both hands go for ${timeId(target.h, target.m)}.`;
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

  const reason = session.shouldEnd(state.session, { now: now(), correct: result.correct });
  if (reason) startNap();
  else askNext();
}

async function celebrate(outcome) {
  const item = outcome.item;
  const streak = state.stats.streak;

  if (outcome.events.hatched) {
    // The egg was the last thing standing between the child and a pet of their own —
    // this is the biggest moment the game has, so it gets its own beat.
    el.feedback.textContent = 'It hatched!';
    el.feedback.className = 'feedback good';
    el.petStage.querySelector('.pet').classList.add('hatching');
    audio.play('hatch');
    buzz([14, 40, 14, 40, 24]);
    await wait(reduceMotion() ? 200 : 780);
    renderPetStage(item, 'happy');
    el.petStage.querySelector('.pet').classList.add('arriving');
    confetti(el.petStage, el.fx, { power: 1.8 });
    el.feedback.textContent = `${petName(item)} says hello!`;
    await wait(1500);
    return;
  }

  el.feedback.textContent =
    streak >= 3
      ? `${CORRECT_CHEERS[streak % CORRECT_CHEERS.length]} ${streak} in a row!`
      : CORRECT_CHEERS[Math.floor(Math.random() * CORRECT_CHEERS.length)];
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
  const shown = sleepers.length ? sleepers : [{ species: 'mochi' }, { species: 'bloop' }, { species: 'pip' }];
  el.napPets.innerHTML = shown
    .map((item) => petSvg(item.species, { mood: 'sleep', title: 'sleeping' }))
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
  const t = now();
  const napping = session.isNapping(state.session, t);

  el.sky.style.setProperty(
    '--dusk',
    napping ? '1' : String(session.isRunning(state.session) ? session.dayProgress(state.session, t) : 0)
  );

  if (napping) {
    el.napTimer.textContent = session.formatCountdown(session.napRemaining(state.session, t));
    el.wake.disabled = true;
  } else if (state.session.napUntil) {
    el.napTimer.textContent = '0:00';
    el.wake.disabled = false;
  }

  // A child who wanders off mid-session still gets the break rather than an open game.
  if (!napping && session.isRunning(state.session) && session.capReached(state.session, t) && scene !== 'nap') {
    startNap();
  }
}, 500);

/* --------------------------------------------------------------------- zoo */

function renderZooBadge() {
  const t = now();
  const hungry = Object.values(state.items).filter(
    (item) => item.hatchedAt !== null && item.phase === 'graduated' && item.dueAt <= t
  ).length;
  el.zooBadge.hidden = hungry === 0;
  el.zooBadge.textContent = String(hungry);
}

function renderZoo() {
  const t = now();
  const napping = session.isNapping(state.session, t);
  const items = Object.entries(state.items).sort(([, a], [, b]) => {
    if ((a.hatchedAt === null) !== (b.hatchedAt === null)) return a.hatchedAt === null ? 1 : -1;
    return a.h - b.h || a.m - b.m;
  });

  el.zooEmpty.hidden = items.length > 0;
  el.zooGrid.innerHTML = items
    .map(([id, item]) => {
      const isEgg = item.hatchedAt === null;
      const mood = moodOf(item, t, { napping });
      const art = isEgg
        ? eggSvg(item.species, { title: 'egg' })
        : petSvg(item.species, { mood, title: escape(petName(item)) });
      const flag = isEgg
        ? `${'●'.repeat(item.correctStreak)}${'○'.repeat(Math.max(0, 3 - item.correctStreak))}`
        : mood === 'hungry'
          ? '🍎'
          : '';
      const label = escape(isEgg ? `${SPECIES[item.species]?.name ?? 'Egg'} egg` : petName(item));
      return `
        <button class="pen${isEgg ? ' is-egg' : ''}" type="button" data-id="${id}">
          <span class="pen-flag">${flag}</span>
          ${art}
          <span class="pen-name">${label}</span>
          <span class="pen-time">${collarClock(item.h, item.m)}${timeId(item.h, item.m)}</span>
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
  const chosen = prompt('What is this pet called?', petName(item));
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
    .map((t) => speciesFor(t.h, t.m))
    .filter((s, i, all) => all.indexOf(s) === i)
    .slice(0, 4);
  el.unlockPets.innerHTML = species.map((s) => petSvg(s, { mood: 'happy' })).join('');
  el.unlockTitle.textContent = 'New pets have arrived!';
  el.unlockCopy.textContent = `${spec.name} — ${spec.blurb}`;
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
    ['Times answered', state.stats.totalAnswered],
    ['Correct first try', `${accuracy}%`],
    ['Best streak', state.stats.bestStreak],
    ['Pets hatched', `${hatched} / 144`],
    ['Days played', state.stats.daysPlayed.length],
  ];
  el.grownupsStats.innerHTML = rows
    .map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`)
    .join('');

  el.grownupsTiers.innerHTML = TIERS.map((tier) => {
    const pct = Math.round(tierMastery(state.items, tier.id) * 100);
    const locked = tier.id > state.tier;
    return `
      <div class="tier-row${locked ? ' locked' : ''}">
        <div class="tier-head"><span>${tier.name}${locked ? ' 🔒' : ''}</span><span>${pct}%</span></div>
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
  const ok = confirm('Start over? Every pet and all progress will be lost.');
  if (!ok) return;
  clear();
  state = freshState(now());
  saver.flush();
  el.grownups.hidden = true;
  lastAskedId = null;
  showScene('play');
  askNext();
});

/* -------------------------------------------------------------------- sound */

function applySound() {
  const on = state.settings.sound;
  audio.setMuted(!on);
  setHaptics(state.settings.haptics && on);
  el.sound.textContent = on ? '🔊' : '🔈';
  el.sound.setAttribute('aria-pressed', String(on));
  el.sound.setAttribute('aria-label', on ? 'Sound on' : 'Sound off');
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
applySound();
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
