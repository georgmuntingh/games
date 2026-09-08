// The living half of a habitat. habitat.js decides what a home looks like; this drives it:
// retained SVG nodes, one requestAnimationFrame loop, and the four things a child can do
// in there — watch the pet potter about, throw its ball, feed it, and stroke it.
//
// Feeding is the longest of the four, and the only one with a sequence to it: the pet spots
// the food, walks over, dips its head, takes it apart in three bites and swallows. That is
// split across two steppers on purpose. `stepMind` owns where the pet is; `stepMeal` owns
// what its mouth is doing. They meet in exactly two places — the mind treats a mouthful as
// standing still, and `arrived` hands a finished walk over to the meal — so the chase, the
// carry and the shelter never had to learn that eating exists.
//
// Owns the DOM and the clock. Owns no game state: nothing in here feeds a pet, grades an
// answer or unlocks anything, and it never writes to the save. Free play, on purpose — the
// clock scene stays the only place progress happens, so a habitat can never become the
// cheaper route to a reward.
//
// The loop runs only while the scene is open. Closing it cancels the frame and drops every
// node, so nothing animates behind a hidden section.

import { appearanceOf, eggSvg, petSvg, portraitOf } from './pets.js';
import {
  ballSvg,
  BALL_R,
  BITES,
  biteScale,
  clamp,
  habitatOf,
  habitatSvg,
  nextWanderTarget,
  PET_FOOT,
  PET_SIZE,
  stepBall,
  treatColors,
  treatSvg,
  WALK_Y,
} from './habitat.js';
import { audio } from './audio.js';
import { shelters, slows } from './weather.js';
import { buzz, confetti, heartBurst, pop, reduceMotion, svgEl, wiggle } from './juice.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

/* ------------------------------------------------------------------- tuning */

const WALK_SPEED = 27; // habitat units per second, ambling
const CHASE_SPEED = 47; // and hurrying after a ball
const DASH_SPEED = 38; // and getting out of the rain: quicker than an amble, slower than a game
const WET_PACE = 0.72; // how much fog and snow take off an amble
const SHELTER_MIN = 4000; // how long it waits under the umbrella before wandering out again
const SHELTER_MAX = 9000;
const SHELTER_ODDS = 0.65; // how often an idle pet in the rain heads for cover rather than off
const ARRIVE = 1.6; // close enough to count as there
const GRAB_RADIUS = 13; // how near the pet must be to pick the ball up
const FOOD_SPEED = 40; // going to dinner: quicker than an amble, short of a game of fetch
const FOOD_REACH = 10; // how far short of the food it stops, so dinner is under its nose
const MOUTH = { x: 9, y: -25 }; // where a carried ball rides, relative to the pet's feet
const HEAD = { x: 0, y: -30 }; // where a treat has to land to be eaten
const EAT_RADIUS = 24;
const THROW_SCALE = 1.05; // pointer speed to ball speed
const THROW_MAX = 340; // however hard a small arm swings, the ball stays catchable
const IDLE_MIN = 900;
const IDLE_MAX = 2600;
const EAT_MS = 1500; // the whole of a reduced-motion meal, which has no sequence to watch
const NOTICE_MS = 300; // spotting the food and turning to it
const DIP_MS = 300; // head down, and the food comes up to meet it
const BITE_MS = 400; // one mouthful; BITES of them make a meal
const GULP_MS = 300;
const SAVOUR_MS = 800; // the wiggle and the hearts afterwards
const HAPPY_MS = 2600;
const REGROW_MS = 2400;
const STROKE_STEP = 26; // pointer travel, in screen px, between hearts
const PURR_MS = 520;

/* -------------------------------------------------------------------- utils */

const now = () => performance.now();
const dist = (a, b, c, d) => Math.hypot(a - c, b - d);

/** The postures where the mouth is busy and the feet are not. `stepMeal` owns their clock. */
const MEAL_STATES = new Set(['notice', 'dip', 'chew', 'gulp', 'savour', 'eat']);

/** Parse an SVG-string fragment into a live node, so pets.js markup can be retained. */
function nodeFrom(markup) {
  const holder = document.createElementNS(SVG_NS, 'g');
  holder.innerHTML = markup;
  return holder.firstElementChild;
}

/**
 * The scene. One instance for the whole game — `open` swaps which pet is in it, so the
 * listeners below are wired once and never re-attached.
 */
export function createHabitatScene({ host, fx }) {
  let root = null; // the <svg class="habitat">
  let actors = null; // the <g> the movers live in
  let habitat = null;
  let item = null;
  let raf = 0;
  let last = 0;
  let napping = false;
  let still = false; // reduced motion: everything happens, nothing drifts
  let weather = null; // today's sky, or null. Read for behaviour only — the art is habitat.js's

  let pet = null; // { wrap, art, x, facing, mood, moodUntil }
  let ball = null; // { wrap, x, y, vx, vy, resting, held, carried }
  let treats = []; // { wrap, x, y, spot, kind, held, falling, dropped, vy }
  let meal = null; // { treat, taken, nextAt, liftFrom } — the mouthful in progress, if any
  let mind = { state: 'idle', until: 0, target: 0 };
  let stroke = null; // { pointerId, travelled, lastX, lastY, purredAt }
  let drag = null; // { pointerId, kind, node, samples: [] }
  let fetchWanted = false;
  let regrowAt = new Map();

  /* ------------------------------------------------------------ coordinates */

  /** Pointer position in habitat units. Goes through the CTM, so slice-cropping is free. */
  function toLocal(event) {
    const ctm = root?.getScreenCTM();
    if (!ctm) return { x: 100, y: WALK_Y };
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(ctm.inverse());
    return { x: point.x, y: point.y };
  }

  const place = (wrap, x, y, extra = '') =>
    wrap.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})${extra}`);

  /* ------------------------------------------------------------------- pet */

  function petMarkup(mood) {
    if (!item) return '';
    return item.hatchedAt === null
      ? eggSvg(portraitOf(item), {
          cracks: item.cracks ?? 0,
          title: pet?.title ?? '',
        })
      : petSvg(appearanceOf(item), { mood, title: pet?.title ?? '' });
  }

  /** Size and hang the pet so its own ground anchor lands exactly on the walk line. */
  function fitPetArt(art) {
    art.setAttribute('x', String(-PET_FOOT.x));
    art.setAttribute('y', String(-PET_FOOT.y));
    art.setAttribute('width', String(PET_SIZE));
    art.setAttribute('height', String(PET_SIZE));
    art.setAttribute('overflow', 'visible');
    art.style.setProperty('--blink-delay', `${(Math.random() * 6).toFixed(2)}s`);
    if (!still && !napping) art.classList.add('breathe');
    return art;
  }

  function setMood(mood) {
    if (!pet || pet.mood === mood) return;
    pet.mood = mood;
    const art = fitPetArt(nodeFrom(petMarkup(mood)));
    pet.wrap.replaceChild(art, pet.art);
    pet.art = art;
  }

  /** A mood that lapses on its own, so a treat leaves the pet happy for a little while. */
  function cheerUp(ms = HAPPY_MS) {
    if (!pet || napping) return;
    setMood('happy');
    pet.moodUntil = now() + ms;
  }

  const restingMood = () => (napping ? 'sleep' : 'content');

  /* ------------------------------------------------------------------ build */

  function buildPet() {
    const wrap = svgEl('g', { class: 'hab-pet hab-grab' });
    const art = fitPetArt(nodeFrom(petMarkup(napping ? 'sleep' : 'content')));
    wrap.append(art);
    const startX = napping ? habitat.props.nest.x : habitat.home.x;
    place(wrap, startX, WALK_Y);
    actors.append(wrap);
    pet = { wrap, art, x: startX, facing: 1, mood: napping ? 'sleep' : 'content', moodUntil: 0, title: pet?.title ?? '' };
    if (napping) {
      wrap.append(nodeFrom(`<g class="hab-zeds" transform="translate(15 -31)">
        <text class="hab-z hab-z1" x="0" y="0">z</text>
        <text class="hab-z hab-z2" x="3.4" y="-4.4">z</text>
        <text class="hab-z hab-z3" x="7.6" y="-9.6">z</text></g>`));
    }
  }

  function buildBall() {
    const wrap = svgEl('g', { class: 'hab-ball hab-grab' });
    wrap.innerHTML = `<g class="hab-art">${ballSvg(habitat.palette)}</g>`;
    const { x } = habitat.props.ball;
    place(wrap, x, WALK_Y - BALL_R);
    actors.append(wrap);
    ball = { wrap, x, y: WALK_Y - BALL_R, vx: 0, vy: 0, spin: 0, resting: true, held: false, carried: false };
  }

  function buildTreat(spotIndex) {
    const spot = habitat.props.larder.spots[spotIndex];
    if (!spot) return;
    // Each spot grows its own fruit, so a larder is three things rather than one thing three
    // times. `dropped` is the flag the whole of feeding hangs on: it is false here and turns
    // true only where a falling treat lands, so a pet never walks over and eats its larder.
    const kind = spot.treat ?? habitat.props.larder.treat;
    // The art lives in an inner group because the arrive animation and the bites touch
    // `transform`, and a transform on the wrapper overrides the attribute that positions it.
    const wrap = svgEl('g', { class: 'hab-treat hab-grab' });
    wrap.dataset.spot = String(spotIndex);
    wrap.innerHTML = `<g class="hab-art hab-arrive">${treatSvg(kind, habitat.palette)}</g>`;
    place(wrap, spot.x, spot.y);
    actors.append(wrap);
    treats.push({
      wrap, x: spot.x, y: spot.y, spot: spotIndex, kind,
      held: false, falling: false, dropped: false, vy: 0,
    });
  }

  /* -------------------------------------------------------------------- mind */

  function idleFor(msMin = IDLE_MIN, msMax = IDLE_MAX) {
    mind = { state: 'idle', until: now() + msMin + Math.random() * (msMax - msMin), target: pet.x };
  }

  function walkTo(x, state = 'walk') {
    mind = { state, until: 0, target: clamp(x, habitat.roam.x0, habitat.roam.x1) };
  }

  /** Fog and snow are things a pet dawdles through; rain and hail are things it hurries in. */
  const pace = () => (slows(weather) ? WET_PACE : 1);

  /** Where the umbrella is, when there is one to stand under. */
  const shelterSpot = () => habitat?.shelter?.x ?? habitat?.home?.x ?? 100;

  // What outranks what, in order:
  //   1. a mouthful already in progress. Nothing interrupts it but the child taking the food
  //      back, the nap starting, or the scene closing.
  //   2. food lying on the ground. It outranks the ball, and it outranks the umbrella — a pet
  //      that stayed dry while its dinner sat in the rain would read as broken, and coming
  //      out for it is the same rule a thrown ball already gets.
  //   3. a ball that has come to rest since it was last thrown.
  //   4. sheltering, and the amble.
  function stepMind(dt) {
    if (!pet || napping || mind.state === 'enjoy') return;

    if (pet.moodUntil && now() > pet.moodUntil && !MEAL_STATES.has(mind.state)) {
      pet.moodUntil = 0;
      setMood(restingMood());
    }

    if (!meal) {
      const loose = looseTreat();
      if (loose) {
        beginMeal(loose);
        return;
      }
    }

    // A ball that has come to rest since it was last thrown is a job to be done, and it
    // outranks whatever amble was in progress.
    if (fetchWanted && ball && ball.resting && !ball.held && !ball.carried) {
      fetchWanted = false;
      if (still) {
        returnBall();
      } else {
        walkTo(ball.x, 'chase');
      }
    }

    switch (mind.state) {
      case 'idle':
        if (still) return;
        if (now() < mind.until) return;
        // In rain or hail an idle pet mostly makes for the umbrella — mostly, not always,
        // because a pet that never once potters about in the wet is a pet that looks broken.
        if (shelters(weather) && Math.random() < SHELTER_ODDS) {
          walkTo(shelterSpot(), 'dash');
        } else {
          walkTo(nextWanderTarget(pet.x, habitat.roam, Math.random));
        }
        return;
      case 'shelter':
        // Waiting it out. Nothing to step: the pet is standing under the umbrella, and the
        // fetch check above still outranks this, so a thrown ball gets it out into the rain.
        if (now() >= mind.until) idleFor(200, 600);
        return;
      case 'eat':
        if (now() >= mind.until) idleFor();
        return;
      case 'notice':
      case 'dip':
      case 'chew':
      case 'gulp':
      case 'savour':
        // Standing still while a mouthful happens. `stepMeal` owns the clock for these; the
        // mind only has to know the feet are not going anywhere.
        return;
      case 'carry':
        // The child is allowed to take the ball back out of the pet's mouth. If they have,
        // there is nothing left to deliver.
        if (!ball || !ball.carried) {
          idleFor(200, 600);
          return;
        }
      // falls through
      case 'walk':
      case 'dash':
      case 'chase':
      case 'fetchfood': {
        const speed =
          mind.state === 'chase'
            ? CHASE_SPEED
            : mind.state === 'dash'
              ? DASH_SPEED
              : mind.state === 'fetchfood'
                ? FOOD_SPEED * pace()
                : WALK_SPEED * pace();
        const delta = mind.target - pet.x;
        if (Math.abs(delta) <= ARRIVE) {
          pet.x = mind.target;
          arrived();
          return;
        }
        const dir = Math.sign(delta);
        pet.facing = dir;
        // Ease into the last few units so the pet settles rather than stopping dead.
        const slow = Math.min(1, Math.abs(delta) / 10);
        pet.x = clamp(pet.x + dir * speed * dt * (0.35 + 0.65 * slow), habitat.roam.x0, habitat.roam.x1);
        return;
      }
      default:
    }
  }

  function arrived() {
    // First, so the chase below can never shadow it: a pet that walked to its dinner eats.
    if (mind.state === 'fetchfood') {
      if (meal) beginDip();
      else idleFor();
      return;
    }
    if (mind.state === 'dash') {
      mind = {
        state: 'shelter',
        until: now() + SHELTER_MIN + Math.random() * (SHELTER_MAX - SHELTER_MIN),
        target: pet.x,
      };
      return;
    }
    if (mind.state === 'chase' && ball && !ball.held && ball.resting) {
      ball.carried = true;
      ball.resting = false;
      audio.play('grab');
      walkTo(habitat.home.x, 'carry');
      return;
    }
    if (mind.state === 'carry' && ball && ball.carried) {
      dropBall();
      cheerUp(1600);
      audio.play('purr');
      idleFor();
      return;
    }
    idleFor();
  }

  /* ------------------------------------------------------------------- ball */

  function dropBall() {
    if (!ball) return;
    ball.carried = false;
    ball.x = clamp(pet.x + pet.facing * 10, habitat.roam.x0 + BALL_R, habitat.roam.x1 - BALL_R);
    ball.y = WALK_Y - BALL_R;
    ball.vx = 0;
    ball.vy = 0;
    ball.resting = true;
  }

  /** The reduced-motion fetch: no chase, no arc — the ball simply comes back. */
  function returnBall() {
    if (!ball) return;
    ball.x = habitat.props.ball.x;
    ball.y = WALK_Y - BALL_R;
    ball.vx = 0;
    ball.vy = 0;
    ball.resting = true;
    const art = ball.wrap.querySelector('.hab-art');
    art.classList.remove('hab-return');
    void art.getBoundingClientRect().width; // force a reflow so the class re-triggers
    art.classList.add('hab-return');
    cheerUp(1400);
    audio.play('purr');
  }

  function stepBallPhysics(dt) {
    if (!ball || ball.held) return;
    if (ball.carried) {
      ball.x = pet.x + pet.facing * MOUTH.x;
      ball.y = WALK_Y + MOUTH.y;
      return;
    }
    if (ball.resting || still) return;
    const next = stepBall(ball, dt, {
      x0: habitat.roam.x0,
      x1: habitat.roam.x1,
      floor: WALK_Y - BALL_R,
      ceiling: 10,
    });
    if (next.bounce > 40) {
      audio.play('bounce', { power: Math.min(1, next.bounce / 260) });
      buzz(6);
    }
    Object.assign(ball, next);
  }

  /* ----------------------------------------------------------------- treats */

  function stepTreats(dt) {
    for (const treat of treats) {
      if (treat.held) continue;
      if (treat.falling) {
        treat.vy += 260 * dt;
        treat.y += treat.vy * dt;
        if (treat.y >= WALK_Y - 2) {
          treat.y = WALK_Y - 2;
          treat.falling = false;
          // Down, and staying down. Food that faded away uneaten was the one thing in this
          // scene that punished a child for missing; now the pet comes and gets it.
          treat.dropped = true;
        }
      }
    }
    const at = now();
    for (const [spot, due] of regrowAt) {
      if (at >= due) {
        regrowAt.delete(spot);
        if (!napping && item?.hatchedAt !== null) buildTreat(spot);
      }
    }
  }

  function removeTreat(treat) {
    treats = treats.filter((entry) => entry !== treat);
    treat.wrap.remove();
    // The larder always fills back up: a child cannot run their pet out of food.
    regrowAt.set(treat.spot, now() + REGROW_MS);
  }

  /* ------------------------------------------------------------------- meals */

  /** The nearest thing on the ground that is food and is nobody's yet. */
  function looseTreat() {
    if (!pet) return null;
    return (
      treats
        .filter((entry) => entry.dropped && !entry.held && !entry.falling)
        .sort((a, b) => Math.abs(a.x - pet.x) - Math.abs(b.x - pet.x))[0] ?? null
    );
  }

  // Where a carried ball rides, and where a mouthful sits. The same two lines the ball
  // physics already used, named now that two things need them.
  const mouthX = () => pet.x + pet.facing * MOUTH.x;
  const mouthY = () => WALK_Y + MOUTH.y;

  /** Where to stand to eat something: just short of it, so the food is under the nose. */
  function standSpot(treat) {
    const dir = Math.sign(treat.x - pet.x) || pet.facing || 1;
    return clamp(treat.x - dir * FOOD_REACH, habitat.roam.x0, habitat.roam.x1);
  }

  /**
   * The reduced-motion meal: no walk, no chew, no crumbs. The treat is eaten where the pet
   * is standing — the same answer `returnBall` gives a thrown ball, and for the same reason.
   */
  function swallowWhole(treat) {
    audio.play('munch');
    audio.play('gulp');
    buzz([10, 40, 10]);
    removeTreat(treat);
    meal = null;
    setMood('happy');
    pet.moodUntil = now() + HAPPY_MS;
    mind = { state: 'eat', until: now() + EAT_MS, target: pet.x };
    pop(pet.art.querySelector('.pet-inner'));
  }

  /**
   * Start on a treat. `from` is 'hand' when the child put it straight on the pet's head,
   * which skips the noticing and the walk — they have already done both.
   */
  function beginMeal(treat, { from = 'ground' } = {}) {
    if (!pet || napping || !treat || !treats.includes(treat)) return;
    treat.held = false;
    treat.falling = false;
    treat.dropped = false; // claimed: nothing else may pick this one up
    meal = { treat, taken: 0, nextAt: 0, liftFrom: { x: treat.x, y: treat.y } };
    if (still) {
      swallowWhole(treat);
      return;
    }
    // A pet cannot carry a ball and a berry at once, and dinner wins. The fetch is not
    // forgotten, only put down: it is still wanted once the meal is over.
    if (ball?.carried) dropBall();
    if (mind.state === 'chase') fetchWanted = true;
    pet.facing = Math.sign(treat.x - pet.x) || pet.facing;
    if (from === 'hand') {
      beginDip();
      return;
    }
    setMood('hungry');
    audio.play('grab');
    pop(pet.art.querySelector('.pet-inner'), { power: 0.6 });
    mind = { state: 'notice', until: now() + NOTICE_MS, target: pet.x };
  }

  function beginDip() {
    meal.liftFrom = { x: meal.treat.x, y: meal.treat.y };
    mind = { state: 'dip', until: now() + DIP_MS, target: pet.x };
  }

  function beginChew() {
    setMood('chew');
    // On the wrap, not the art: `setMood` and `setTitle` both replace the art node, and a
    // class on a node that is about to be thrown away is a chew that stops halfway.
    pet.wrap.classList.add('is-chewing');
    meal.nextAt = now();
    mind = { state: 'chew', until: 0, target: pet.x };
  }

  function bite() {
    meal.taken += 1;
    const art = meal.treat.wrap.querySelector('.hab-art');
    const from = biteScale(meal.taken - 1);
    const to = biteScale(meal.taken);
    // On `.hab-art`, never on the wrapper: `draw` rewrites the wrapper's transform every
    // frame, and anything animating there would be overwritten before it was seen.
    art?.animate(
      [
        { transform: `scale(${from})` },
        { transform: `scale(${(to * 1.08).toFixed(3)})`, offset: 0.4 },
        { transform: `scale(${to})` },
      ],
      { duration: 200, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', fill: 'forwards' }
    );
    confetti(meal.treat.wrap, fx, {
      power: 0.22,
      round: 0.7,
      colors: treatColors(meal.treat.kind, habitat.palette),
    });
    audio.play('munch', { pitch: 0.92 + meal.taken * 0.07 });
    buzz(8);
    if (meal.taken >= BITES) beginGulp();
    else meal.nextAt = now() + BITE_MS;
  }

  function beginGulp() {
    pet.wrap.classList.remove('is-chewing');
    removeTreat(meal.treat);
    audio.play('gulp');
    buzz([10, 40, 10]);
    setMood('happy');
    pet.moodUntil = now() + HAPPY_MS + SAVOUR_MS;
    mind = { state: 'gulp', until: now() + GULP_MS, target: pet.x };
  }

  function beginSavour() {
    pop(pet.art.querySelector('.pet-inner'));
    wiggle(pet.art.querySelector('.pet-inner'));
    heartBurst(pet.art, fx, { count: 3 });
    audio.play('purr');
    mind = { state: 'savour', until: now() + SAVOUR_MS, target: pet.x };
  }

  function endMeal() {
    pet?.wrap.classList.remove('is-chewing');
    meal = null;
  }

  /**
   * The mouth's clock. Runs between the ball and the treats in `tick`, so wherever it puts
   * the mouthful is where `draw` puts it on screen the same frame.
   */
  function stepMeal() {
    if (!meal || !pet) return;
    const treat = meal.treat;
    // The child may take the food back out of the pet's mouth, exactly as they may take the
    // ball. If they have, there is nothing left to eat.
    if (treat.held || !treats.includes(treat)) {
      endMeal();
      idleFor(200, 600);
      return;
    }
    const at = now();
    switch (mind.state) {
      case 'notice':
        if (at >= mind.until) walkTo(standSpot(treat), 'fetchfood');
        return;
      case 'fetchfood':
        // On its way. `stepMind` is walking the feet; the mouth has nothing to do yet.
        return;
      case 'dip': {
        // The last stretch is the food coming up rather than the pet going down — which is
        // also how a treat dropped in a far corner, outside the roam band, still gets eaten.
        const k = 1 - Math.max(0, Math.min(1, (mind.until - at) / DIP_MS));
        treat.x = meal.liftFrom.x + (mouthX() - meal.liftFrom.x) * k;
        treat.y = meal.liftFrom.y + (mouthY() - meal.liftFrom.y) * k;
        if (at >= mind.until) beginChew();
        return;
      }
      case 'chew':
        treat.x = mouthX();
        treat.y = mouthY();
        if (at >= meal.nextAt) bite();
        return;
      case 'gulp':
        if (at >= mind.until) beginSavour();
        return;
      case 'savour':
        if (at >= mind.until) {
          endMeal();
          idleFor();
        }
        return;
      default:
        // Something else took the pet over — the nap, or the scene closing behind us.
        endMeal();
    }
  }

  /* --------------------------------------------------------------- pointers */

  function onDown(event) {
    if (!habitat || !pet) return;
    const hit = event.target.closest?.('.hab-ball, .hab-treat, .hab-pet');
    if (!hit) return;
    event.preventDefault();

    if (napping) {
      // The zoo is asleep. Touching anything earns a stretch, not a game of fetch.
      audio.play('stretch');
      buzz(8);
      if (!still) wiggle(pet.art.querySelector('.pet-inner'));
      return;
    }

    root.setPointerCapture(event.pointerId);

    if (hit.classList.contains('hab-pet')) {
      stroke = { pointerId: event.pointerId, travelled: 0, lastX: event.clientX, lastY: event.clientY, purredAt: 0 };
      mind = { state: 'enjoy', until: 0, target: pet.x };
      cheerUp(HAPPY_MS);
      return;
    }

    if (hit.classList.contains('hab-ball') && ball) {
      ball.held = true;
      ball.carried = false;
      ball.resting = false;
      ball.wrap.classList.add('is-held');
      drag = { pointerId: event.pointerId, kind: 'ball', samples: [] };
      audio.play('grab');
      return;
    }

    const treat = treats.find((entry) => entry.wrap === hit);
    if (treat) {
      // Taken back out of the pet's mouth: the meal ends at the grab, not a frame later.
      if (meal?.treat === treat) {
        endMeal();
        idleFor(200, 600);
      }
      treat.held = true;
      treat.falling = false;
      treat.dropped = false;
      treat.wrap.classList.add('is-held');
      drag = { pointerId: event.pointerId, kind: 'treat', treat, samples: [] };
      audio.play('grab');
    }
  }

  function onMove(event) {
    if (stroke && event.pointerId === stroke.pointerId) {
      const moved = Math.hypot(event.clientX - stroke.lastX, event.clientY - stroke.lastY);
      stroke.lastX = event.clientX;
      stroke.lastY = event.clientY;
      stroke.travelled += moved;
      if (stroke.travelled >= STROKE_STEP) {
        stroke.travelled = 0;
        heartBurst(pet.art, fx, { count: 1 });
        buzz(5);
        if (now() - stroke.purredAt > PURR_MS) {
          stroke.purredAt = now();
          audio.play('purr');
          if (!still) wiggle(pet.art.querySelector('.pet-inner'));
        }
      }
      return;
    }

    if (!drag || event.pointerId !== drag.pointerId) return;
    event.preventDefault();
    const at = toLocal(event);
    drag.samples.push({ x: at.x, y: at.y, t: now() });
    if (drag.samples.length > 5) drag.samples.shift();

    if (drag.kind === 'ball' && ball) {
      ball.x = clamp(at.x, habitat.roam.x0 + BALL_R, habitat.roam.x1 - BALL_R);
      ball.y = clamp(at.y, 8, WALK_Y - BALL_R);
    } else if (drag.kind === 'treat') {
      drag.treat.x = clamp(at.x, 6, 194);
      drag.treat.y = clamp(at.y, 6, WALK_Y - 2);
    }
  }

  /** Pointer speed over the last few samples, in habitat units per second. */
  function releaseVelocity(samples) {
    if (samples.length < 2) return { vx: 0, vy: 0 };
    const first = samples[0];
    const lastSample = samples[samples.length - 1];
    const span = Math.max(16, lastSample.t - first.t) / 1000;
    const vx = ((lastSample.x - first.x) / span) * THROW_SCALE;
    const vy = ((lastSample.y - first.y) / span) * THROW_SCALE;
    const speed = Math.hypot(vx, vy);
    if (speed <= THROW_MAX) return { vx, vy };
    const k = THROW_MAX / speed;
    return { vx: vx * k, vy: vy * k };
  }

  function onUp(event) {
    if (stroke && event.pointerId === stroke.pointerId) {
      stroke = null;
      if (mind.state === 'enjoy') idleFor(400, 900);
      return;
    }
    if (!drag || event.pointerId !== drag.pointerId) return;
    const { vx, vy } = releaseVelocity(drag.samples);

    if (drag.kind === 'ball' && ball) {
      ball.held = false;
      ball.wrap.classList.remove('is-held');
      if (still) {
        ball.x = clamp(ball.x + vx * 0.25, habitat.roam.x0 + BALL_R, habitat.roam.x1 - BALL_R);
        ball.y = WALK_Y - BALL_R;
        ball.vx = 0;
        ball.vy = 0;
        ball.resting = true;
      } else {
        ball.vx = vx;
        ball.vy = vy;
        ball.resting = false;
      }
      // However it was let go — hurled or just put down — the pet will go and get it.
      fetchWanted = true;
    } else if (drag.kind === 'treat') {
      const treat = drag.treat;
      treat.held = false;
      treat.wrap.classList.remove('is-held');
      if (dist(treat.x, treat.y, pet.x + HEAD.x, WALK_Y + HEAD.y) <= EAT_RADIUS) {
        // Put straight on its head: it has already been noticed and walked to.
        beginMeal(treat, { from: 'hand' });
      } else if (still) {
        // Reduced motion: it is already down. The pet eats it next frame, where it stands.
        treat.y = WALK_Y - 2;
        treat.dropped = true;
      } else {
        // Wherever it lands, it stays there, and the pet will come and get it.
        treat.falling = true;
        treat.vy = Math.max(0, vy * 0.3);
      }
    }
    drag = null;
  }

  /* ------------------------------------------------------------------- draw */

  function draw() {
    if (pet) {
      place(pet.wrap, pet.x, WALK_Y, pet.facing < 0 ? ' scale(-1 1)' : '');
    }
    if (ball) {
      place(ball.wrap, ball.x, ball.y, ` rotate(${(ball.spin ?? 0).toFixed(1)})`);
    }
    for (const treat of treats) place(treat.wrap, treat.x, treat.y);
  }

  function tick(frameTime) {
    const dt = Math.min(0.05, Math.max(0, (frameTime - last) / 1000));
    last = frameTime;
    stepMind(dt);
    stepBallPhysics(dt);
    stepMeal();
    stepTreats(dt);
    draw();
    raf = requestAnimationFrame(tick);
  }

  /* ------------------------------------------------------------------- API */

  return {
    /** Put a pet in its habitat. Safe to call over an already-open scene. */
    open(
      nextItem,
      { napping: isNapping = false, label = '', title = '', weather: sky = null, soak = 0 } = {}
    ) {
      this.close();
      item = nextItem;
      napping = isNapping;
      still = reduceMotion();
      weather = sky;
      habitat = habitatOf(item);
      const uid = `hab${habitat.id.replace(':', '')}`;

      host.innerHTML = habitatSvg(habitat, { uid, label, sleeping: napping, weather: sky, soak });
      root = host.querySelector('svg.habitat');
      actors = root.querySelector('.hab-actors');
      root.classList.toggle('is-night', Boolean(habitat.light.night));
      root.classList.toggle('is-asleep', napping);

      pet = { title };
      buildPet();

      // An egg has nobody to play with yet: it sits in the nest and waits, and the home
      // stands around it. Nothing interactive, and nothing that looks broken either.
      const playable = item.hatchedAt !== null && !napping;
      if (playable) {
        buildBall();
        habitat.props.larder.spots.forEach((_, i) => buildTreat(i));
      }
      if (item.hatchedAt === null) {
        pet.x = habitat.props.nest.x;
        place(pet.wrap, pet.x, WALK_Y);
      }
      // Reduced motion, the way the rest of this file does it: the thing still happens, it
      // just doesn't have to be watched happening. A pet that would shelter is already under
      // the umbrella rather than walking there.
      if (still && playable && shelters(sky)) {
        pet.x = shelterSpot();
        place(pet.wrap, pet.x, WALK_Y);
      }

      fetchWanted = false;
      regrowAt = new Map();
      mind = { state: napping ? 'sleep' : 'idle', until: now() + IDLE_MIN, target: pet.x };
      last = now();
      raf = requestAnimationFrame(tick);
    },

    /** Stop everything and let go of every node. Called on leaving the scene. */
    close() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      regrowAt.clear();
      host.innerHTML = '';
      root = null;
      actors = null;
      habitat = null;
      item = null;
      weather = null;
      pet = null;
      ball = null;
      treats = [];
      // A meal has to be dropped here or it survives into the next pet's habitat. Both the
      // nap and a change of weather re-`open`, and `open` closes first — so this one line is
      // also what stops a mouthful that bedtime or a downpour interrupted.
      meal = null;
      drag = null;
      stroke = null;
      fetchWanted = false;
    },

    /**
     * The sky moved on. Called from the heartbeat, so it runs twice a second and has to be
     * cheap in the common case — which it is: the ground deepening is one custom property,
     * and only an actual change of weather is worth the whole scene.
     *
     * Takes the numbers and the label rather than reading a clock or the string table: this
     * module owns no state, knows no date and does no translating, exactly as it owns no save.
     * The label matters here — a sky that turns over at midnight has to stop announcing
     * yesterday's weather along with it.
     */
    setWeather(next = null, soak = 0, label = null) {
      if (!habitat || !root) return;
      if (next !== weather) {
        const current = item;
        const said = label ?? root.getAttribute('aria-label') ?? '';
        this.open(current, { napping, label: said, title: pet?.title ?? '', weather: next, soak });
        return;
      }
      const wet = root.querySelector('.hab-wet');
      if (wet) wet.style.setProperty('--soak', String(Number(soak) || 0));
    },

    /** The nap started or ended while the child was standing in here. */
    setNapping(value) {
      const next = Boolean(value);
      if (!habitat || next === napping) return;
      const current = item;
      const label = root?.getAttribute('aria-label') ?? '';
      const soak = Number(root?.querySelector('.hab-wet')?.style.getPropertyValue('--soak')) || 0;
      this.open(current, { napping: next, label, title: pet?.title ?? '', weather, soak });
    },

    /** After a rename or a language change: the title the pet's art announces itself with. */
    setTitle(title) {
      if (!pet) return;
      pet.title = title;
      const art = fitPetArt(nodeFrom(petMarkup(pet.mood)));
      pet.wrap.replaceChild(art, pet.art);
      pet.art = art;
    },

    get isOpen() {
      return Boolean(habitat);
    },

    get itemId() {
      return habitat?.id ?? null;
    },

    /** Wired once by the caller; the scene never re-attaches listeners on open. */
    attach(target) {
      target.addEventListener('pointerdown', onDown);
      target.addEventListener('pointermove', onMove);
      target.addEventListener('pointerup', onUp);
      target.addEventListener('pointercancel', onUp);
    },
  };
}
