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
import {
  courseLayout,
  favouriteObstacleOf,
  flubCues,
  flubMs,
  flubPose,
  isFrozen,
  LANE,
  MOVES as COURSE_MOVES,
  MUZZLE,
  pickFlub,
} from './course.js';
import { ballColors, COURSE_PARTS } from './course-parts.js';
import { tasteOf } from './snacks.js';
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
const TOSS_MS = 520; // a chunky pet flicks its food up and catches it before chewing
const SNIFF_MS = 650; // a food it does not like: a long suspicious sniff first
const REJECT_MS = 1400; // and then the face, the nudge, and the food rolling away
const CRUMB_MAX = 8; // crumbs on the ground at once; the oldest goes first
const CRUMB_LIFE = 20000;
const CRUMB_REACH = 46; // how far a pet will wander to tidy up after itself
const PECK_MS = 260;
const BELLY_FULL = 4; // treats in one visit before the feast catches up with it
const COMA_MS = 5000;
const BURP_MS = 700;
const FLING_VY = 120; // an upward flick faster than this sends a treat flying instead of falling
const CATCH_SPEED = 56; // flat out to get under a treat in the air
const LEAP_MS = 420;
const LEAP_HEIGHT = 12;
const RUN_SPEED = 56; // between obstacles: flat out, it is a race
const CHEER_MS = 1500; // at the finish line
const FOLD_MS = 420; // the course packing itself away again
const POP_STAGGER = 110; // the pieces pop up one after another, left to right
const AUTO_MIN = 45000; // how long an idle pet waits before it might run its course by itself
const AUTO_MAX = 90000;

/**
 * How each body shape eats. Same meal, same states — only the number of mouthfuls, their
 * pace, and the move that goes with each one. A tall pet pecks, a wide one swallows it in
 * one go, a round one nibbles, and anything chunky or spiky flips its food up first.
 */
const EAT_STYLES = {
  tall: { bites: 4, biteMs: 260, move: 'peck' },
  wide: { bites: 1, biteMs: 700, move: 'chomp' },
  round: { bites: 5, biteMs: 190, move: 'nibble' },
  chunky: { bites: 3, biteMs: 380, move: 'chomp', toss: true },
};
const PLAIN_STYLE = { bites: BITES, biteMs: BITE_MS, move: 'nibble' };

/** Foods that insist on being eaten their own way, whoever is eating them. */
const FOOD_STYLES = {
  lollipop: { bites: 6, biteMs: 480, move: 'lick', toss: false },
  kernel: { bites: 1, biteMs: 160, move: 'nibble', toss: false },
  cake: { bites: 4, biteMs: 300 },
  feast: { bites: 5, biteMs: 300 },
};
const foodStyle = (kind) => FOOD_STYLES[kind] ?? null;

/** A cookie is mostly crumbs. Everything else sheds one, sometimes two. */
const crumbsPerBite = (kind) => (kind === 'cookie' ? 3 : kind === 'kernel' ? 0 : 1 + (Math.random() < 0.4 ? 1 : 0));

/** The keyframes behind each move, played on `.pet-inner` once per mouthful. */
const MOVES = {
  peck: [
    { transform: 'rotate(0deg) translateY(0)' },
    { transform: 'rotate(10deg) translateY(2px)', offset: 0.4 },
    { transform: 'rotate(0deg) translateY(0)' },
  ],
  chomp: [
    { transform: 'scale(1, 1)' },
    { transform: 'scale(1.16, 0.84)', offset: 0.3 },
    { transform: 'scale(0.94, 1.08)', offset: 0.65 },
    { transform: 'scale(1, 1)' },
  ],
  nibble: [
    { transform: 'translateY(0)' },
    { transform: 'translateY(-1.2px) scale(1.02, 0.98)', offset: 0.5 },
    { transform: 'translateY(0)' },
  ],
  lick: [
    { transform: 'rotate(0deg)' },
    { transform: 'rotate(-6deg) translateY(1px)', offset: 0.5 },
    { transform: 'rotate(0deg)' },
  ],
};

/* -------------------------------------------------------------------- utils */

const now = () => performance.now();
const dist = (a, b, c, d) => Math.hypot(a - c, b - d);

/** The postures where the mouth is busy and the feet are not. `stepMeal` owns their clock. */
const MEAL_STATES = new Set(['notice', 'dip', 'toss', 'chew', 'gulp', 'savour', 'eat', 'sniff', 'reject']);

/** Snack shows that hold the pet still (or run it about) and own its face while they last. */
const SHOW_STATES = new Set(['freeze', 'spit', 'pant', 'zoom']);

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
export function createHabitatScene({ host, fx, onSnackEaten = () => {} }) {
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
  let meal = null; // { treat, taken, nextAt, liftFrom, taste, style } — the mouthful in progress
  let crumbs = []; // { node, x, y, vx, vy, landed, born }
  let belly = 0; // treats eaten this visit; it only ever makes the pet rounder, and sleepier
  let labels = {}; // the few words the scene shows, translated by whoever opened it
  let buffs = {}; // what the last snack is still doing to the pet: { hiccup: { until, next }, … }
  let filterIds = null; // the SVG filters a snack can tint the pet with, per open scene
  let opens = 0; // keeps every open scene's filter ids distinct
  let mind = { state: 'idle', until: 0, target: 0 };
  let stroke = null; // { pointerId, travelled, lastX, lastY, purredAt }
  let drag = null; // { pointerId, kind, node, samples: [] }
  let fetchWanted = false;
  let regrowAt = new Map();
  let course = null; // { pieces, segs, at, favourite, loved } — a run in progress
  let coursePose = null; // the pet's pose on an obstacle this frame: lift, lean, squash, hidden
  let courseAutoAt = 0; // not before this does an idle pet set its course up by itself

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
    pet.body.replaceChild(art, pet.art);
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
    // The art hangs inside a group of its own, so a full belly can widen the pet (and a food
    // coma tip it over) without touching the transform `draw` writes to the wrapper.
    const body = svgEl('g', { class: 'hab-body' });
    const art = fitPetArt(nodeFrom(petMarkup(napping ? 'sleep' : 'content')));
    body.append(art);
    wrap.append(body);
    const startX = napping ? habitat.props.nest.x : habitat.home.x;
    place(wrap, startX, WALK_Y);
    actors.append(wrap);
    pet = { wrap, body, art, x: startX, facing: 1, mood: napping ? 'sleep' : 'content', moodUntil: 0, title: pet?.title ?? '' };
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
  //   0. a run of the obstacle course. It can only start when nothing below is under way,
  //      and nothing interrupts it once it has but the nap or the scene closing.
  //   1. a mouthful already in progress. Nothing interrupts it but the child taking the food
  //      back, the nap starting, or the scene closing.
  //   2. food lying on the ground. It outranks the ball, and it outranks the umbrella — a pet
  //      that stayed dry while its dinner sat in the rain would read as broken, and coming
  //      out for it is the same rule a thrown ball already gets.
  //   3. a ball that has come to rest since it was last thrown.
  //   4. sheltering, and the amble.
  function stepMind(dt) {
    if (!pet || napping || mind.state === 'enjoy') return;

    // A run, once started, outranks everything: food dropped meanwhile waits on the ground and
    // a thrown ball waits where it stopped, and the checks below pick both up the moment the
    // course is packed away.
    if (course) {
      stepCourse(dt);
      return;
    }

    // Sleeping off a feast. Food dropped meanwhile waits on the ground until it wakes.
    if (mind.state === 'coma') {
      if (!mind.flopped && now() >= mind.burpUntil) flop();
      if (now() >= mind.until) wakeFromComa();
      return;
    }

    // Getting under a treat that is still in the air. Outranks everything below it, and if
    // the treat lands first the ordinary loose-treat rule takes over from here.
    if (mind.state === 'catch') {
      stepCatch(dt);
      return;
    }

    if (
      pet.moodUntil &&
      now() > pet.moodUntil &&
      !MEAL_STATES.has(mind.state) &&
      !SHOW_STATES.has(mind.state) &&
      mind.state !== 'catch'
    ) {
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
        // Now and then a pet with a course sets it up and has a go on its own — but only in
        // fine weather, and never with food about or a ball waiting to be fetched.
        if (wantsCourse()) {
          startCourse();
          return;
        }
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
      case 'peck':
        if (now() >= mind.until) finishPeck();
        return;
      case 'freeze':
      case 'spit':
      case 'pant':
        if (now() >= mind.until) {
          setMood(restingMood());
          if (!tidyUp(5)) idleFor(300, 900);
        }
        return;
      case 'zoom':
        stepZoom(dt);
        return;
      case 'notice':
      case 'dip':
      case 'toss':
      case 'chew':
      case 'gulp':
      case 'savour':
      case 'sniff':
      case 'reject':
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
      case 'tidy':
      case 'dash':
      case 'chase':
      case 'fetchfood': {
        const speed =
          mind.state === 'chase'
            ? CHASE_SPEED
            : mind.state === 'dash'
              ? DASH_SPEED
              : mind.state === 'fetchfood'
                ? FOOD_SPEED * pace() * (meal?.taste === 'love' ? 1.35 : 1)
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
      if (!meal) idleFor();
      else if (meal.taste === 'yuck') beginSniff();
      else beginDip();
      return;
    }
    if (mind.state === 'tidy') {
      beginPeck();
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
        if (treat.vx) {
          treat.x += treat.vx * dt;
          // Off the edges of the scene and back, softer, the way the ball comes off a wall.
          if (treat.x < 6 || treat.x > 194) {
            treat.x = clamp(treat.x, 6, 194);
            treat.vx = -treat.vx * 0.5;
          }
        }
        if (treat.y < 4) {
          treat.y = 4;
          treat.vy = Math.abs(treat.vy) * 0.3;
        }
        if (treat.y >= WALK_Y - 2) {
          treat.y = WALK_Y - 2;
          treat.falling = false;
          treat.airborne = false;
          treat.vx = 0;
          // Down, and staying down. Food that faded away uneaten was the one thing in this
          // scene that punished a child for missing; now the pet comes and gets it.
          treat.dropped = true;
          landed(treat);
        }
      }
    }
    // Popcorn bursts the moment it lands, so the list may have changed under the loop above.
    treats = treats.filter((treat) => !treat.gone);
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
    // The larder always fills back up: a child cannot run their pet out of food. A snack off
    // the picnic tray has no plant to grow back on, so it simply goes.
    if (Number.isInteger(treat.spot)) regrowAt.set(treat.spot, now() + REGROW_MS);
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
  const mouthY = () => WALK_Y + MOUTH.y - petLift();

  /** How high off the ground a leap has the pet right now. */
  function petLift() {
    if (!pet?.leapAt) return 0;
    const k = (now() - pet.leapAt) / LEAP_MS;
    if (k >= 1) {
      pet.leapAt = 0;
      return 0;
    }
    return Math.sin(Math.PI * k) * LEAP_HEIGHT;
  }

  /** Where to stand to eat something: just short of it, so the food is under the nose. */
  function standSpot(treat) {
    const dir = Math.sign(treat.x - pet.x) || pet.facing || 1;
    return clamp(treat.x - dir * FOOD_REACH, habitat.roam.x0, habitat.roam.x1);
  }

  const inner = () => pet?.art.querySelector('.pet-inner');

  /** One of the MOVES, once, on the pet. Under reduced motion, nothing. */
  function move(name, duration) {
    if (still) return;
    inner()?.animate(MOVES[name] ?? MOVES.nibble, { duration, easing: 'ease-in-out' });
  }

  /** A little hop on the spot — for spotting a favourite, and for loving it afterwards. */
  function hop(height = 7) {
    if (still) return;
    inner()?.animate(
      [
        { transform: 'translateY(0) scale(1, 1)' },
        { transform: 'translateY(1px) scale(1.08, 0.92)', offset: 0.15 },
        { transform: `translateY(-${height}px) scale(0.95, 1.06)`, offset: 0.5 },
        { transform: 'translateY(0) scale(1.06, 0.94)', offset: 0.85 },
        { transform: 'translateY(0) scale(1, 1)' },
      ],
      { duration: 460, easing: 'ease-out' }
    );
  }

  /** How this pet eats: its body's style, unless the food has a way of being eaten of its own. */
  function styleFor(treat) {
    const look = appearanceOf(item);
    const base = EAT_STYLES[look.body] ?? PLAIN_STYLE;
    const style = look.texture === 'spiky' ? { ...base, toss: true } : base;
    return { ...style, ...(foodStyle(treat.kind) ?? {}) };
  }

  /** What this pet makes of this food. A habitat's id is its pet's id. */
  const tasteFor = (treat) => tasteOf(habitat.id, treat.kind, habitat.props.larder.menu ?? []);

  /**
   * The reduced-motion meal: no walk, no chew, no crumbs. The treat is eaten where the pet
   * is standing — the same answer `returnBall` gives a thrown ball, and for the same reason.
   */
  function swallowWhole(treat) {
    if (meal?.taste === 'yuck') {
      // Not this one. The face says so, and the food simply goes back to its plant.
      audio.play('bleh');
      removeTreat(treat);
      meal = null;
      setMood('yuck');
      pet.moodUntil = now() + HAPPY_MS;
      mind = { state: 'eat', until: now() + EAT_MS, target: pet.x };
      return;
    }
    const loved = meal?.taste === 'love';
    audio.play('munch');
    audio.play('gulp');
    if (loved) audio.play('love');
    buzz([10, 40, 10]);
    if (treat.snack) onSnackEaten(treat.kind);
    removeTreat(treat);
    ate(treat.kind);
    meal = null;
    afterEffect(treat.kind);
    setMood('happy');
    pet.moodUntil = now() + HAPPY_MS;
    mind = { state: 'eat', until: now() + EAT_MS, target: pet.x };
    pop(inner());
    if (loved) heartBurst(pet.art, fx, { count: 4 });
  }

  /**
   * Start on a treat. `from` is 'hand' when the child put it straight on the pet's head,
   * which skips the noticing and the walk — they have already done both.
   */
  function beginMeal(treat, { from = 'ground' } = {}) {
    if (!pet || napping || !treat || !treats.includes(treat) || mind.state === 'coma') return;
    treat.held = false;
    treat.falling = false;
    treat.dropped = false; // claimed: nothing else may pick this one up
    meal = {
      treat,
      taken: 0,
      nextAt: 0,
      liftFrom: { x: treat.x, y: treat.y },
      taste: tasteFor(treat),
      style: styleFor(treat),
      tossed: false,
      // A popcorn kernel is a snap of the jaws, not a meal: no long look first, no hearts after.
      quick: treat.kind === 'kernel',
    };
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
      if (meal.taste === 'yuck') beginSniff();
      else beginDip();
      return;
    }
    if (from === 'catch') {
      // Straight into the cheeks — it was caught in the mouth, so there is nothing to dip for.
      meal.tossed = true;
      beginChew();
      return;
    }
    setMood('hungry');
    audio.play(meal.taste === 'love' ? 'love' : 'grab');
    if (meal.taste === 'love') hop(9);
    else pop(inner(), { power: 0.6 });
    mind = { state: 'notice', until: now() + (meal.quick ? 80 : NOTICE_MS), target: pet.x };
  }

  function beginDip() {
    meal.liftFrom = { x: meal.treat.x, y: meal.treat.y };
    mind = { state: 'dip', until: now() + DIP_MS, target: pet.x };
  }

  /** Chunky pets flick the food up and catch it — once per meal, and only the first time. */
  function beginToss() {
    meal.tossed = true;
    setMood('hungry');
    audio.play('boing');
    mind = { state: 'toss', until: now() + TOSS_MS, target: pet.x };
  }

  function beginChew() {
    setMood('stuffed');
    // On the wrap, not the art: `setMood` and `setTitle` both replace the art node, and a
    // class on a node that is about to be thrown away is a chew that stops halfway.
    pet.wrap.classList.add('is-chewing');
    // A one-bite eater holds it in its cheeks a moment first, so the chomp has a wind-up.
    meal.nextAt = now() + (meal.style.bites === 1 ? 450 : 0);
    mind = { state: 'chew', until: 0, target: pet.x };
  }

  function bite() {
    const { bites, biteMs, move: style } = meal.style;
    meal.taken += 1;
    const art = meal.treat.wrap.querySelector('.hab-art');
    const from = biteScale(meal.taken - 1, bites);
    const to = biteScale(meal.taken, bites);
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
    move(style, Math.min(biteMs, 340));
    confetti(meal.treat.wrap, fx, {
      power: 0.22,
      round: 0.7,
      colors: treatColors(meal.treat.kind, habitat.palette),
    });
    dropCrumbs(meal.treat, crumbsPerBite(meal.treat.kind));
    if (style === 'lick') audio.play('lick');
    else audio.play('munch', { pitch: (meal.taste === 'love' ? 1.1 : 0.92) + meal.taken * 0.07 });
    buzz(8);
    if (meal.taken >= bites) beginGulp();
    else meal.nextAt = now() + biteMs;
  }

  function beginGulp() {
    pet.wrap.classList.remove('is-chewing');
    const kind = meal.treat.kind;
    meal.swallowed = true;
    if (meal.treat.snack) onSnackEaten(kind);
    removeTreat(meal.treat);
    audio.play('gulp');
    buzz([10, 40, 10]);
    setMood('happy');
    gulpDown();
    ate(kind);
    pet.moodUntil = now() + HAPPY_MS + SAVOUR_MS;
    mind = { state: 'gulp', until: now() + GULP_MS, target: pet.x };
  }

  /** The mouthful on its way down: a stretch up, a lump sliding into the belly, a squash. */
  function gulpDown() {
    if (still) return;
    inner()?.animate(
      [
        { transform: 'scale(1, 1)' },
        { transform: 'scale(0.9, 1.12)', offset: 0.35 },
        { transform: 'scale(1.1, 0.92)', offset: 0.75 },
        { transform: 'scale(1, 1)' },
      ],
      { duration: GULP_MS + 120, easing: 'ease-in-out' }
    );
    const lump = svgEl('circle', { class: 'hab-lump', cx: '0', cy: '0', r: '2.4' });
    pet.body.append(lump);
    lump
      .animate(
        [
          { transform: 'translate(0px, -10px)', opacity: 0.9 },
          { transform: 'translate(0px, -3px)', opacity: 0.7, offset: 0.7 },
          { transform: 'translate(0px, -2px) scale(1.6, 0.6)', opacity: 0 },
        ],
        { duration: GULP_MS + 200, easing: 'ease-in' }
      )
      .finished.catch(() => {})
      .finally(() => lump.remove());
  }

  function beginSavour() {
    const loved = meal.taste === 'love';
    pop(inner(), { power: loved ? 1.4 : 1 });
    if (loved) {
      hop(10);
      heartBurst(pet.art, fx, { count: 6, spread: 34 });
      confetti(pet.art, fx, { power: 0.6, colors: ['#ffd66b', '#ff9ec0', '#fff0b0'] });
      audio.play('love');
    } else {
      wiggle(inner());
      heartBurst(pet.art, fx, { count: 3 });
      audio.play('purr');
    }
    mind = { state: 'savour', until: now() + SAVOUR_MS, target: pet.x };
  }

  function endMeal() {
    pet?.wrap.classList.remove('is-chewing');
    if (meal?.treat?.wrap) meal.treat.wrap.style.opacity = '';
    meal = null;
  }

  /** After the hearts: a nap if that was one treat too many, a tidy-up if it was messy. */
  function afterMeal(kind) {
    // A snack's own show comes first; a feast can wait until the chili has worn off.
    if (afterEffect(kind)) return;
    if (!still && belly >= BELLY_FULL) {
      beginComa();
      return;
    }
    if (!tidyUp(5)) idleFor();
  }

  /* --------------------------------------------------------------- dislikes */

  // Not every pet likes everything on its own plant. It goes over, sniffs, pulls a face and
  // noses the thing away — and the plant grows another. A bought snack is never refused:
  // snacks.js only ever picks the food a pet dislikes from its free larder.

  function beginSniff() {
    meal.liftFrom = { x: meal.treat.x, y: meal.treat.y };
    setMood('content');
    mind = { state: 'sniff', until: now() + SNIFF_MS, target: pet.x };
    if (!still) {
      inner()?.animate(
        [
          { transform: 'rotate(0deg)' },
          { transform: 'rotate(7deg)', offset: 0.2 },
          { transform: 'rotate(4deg)', offset: 0.35 },
          { transform: 'rotate(8deg)', offset: 0.5 },
          { transform: 'rotate(4deg)', offset: 0.65 },
          { transform: 'rotate(0deg)' },
        ],
        { duration: SNIFF_MS, easing: 'ease-in-out' }
      );
    }
  }

  function beginReject() {
    setMood('yuck');
    audio.play('bleh');
    buzz([6, 30, 6]);
    wiggle(inner());
    const treat = meal.treat;
    meal.pushFrom = { x: treat.x, y: treat.y };
    meal.pushDir = Math.sign(treat.x - pet.x) || pet.facing || 1;
    treat.wrap.style.transition = 'opacity 0.6s ease 0.7s';
    treat.wrap.style.opacity = '0';
    mind = { state: 'reject', until: now() + REJECT_MS, target: pet.x };
  }

  /* ---------------------------------------------------------------- crumbs */

  function dropCrumbs(treat, count) {
    if (still || !actors) return;
    const colors = treatColors(treat.kind, habitat.palette);
    for (let i = 0; i < count; i += 1) {
      const node = svgEl('circle', {
        class: 'hab-crumb',
        r: (0.8 + Math.random() * 0.7).toFixed(2),
        fill: colors[Math.floor(Math.random() * colors.length)],
      });
      actors.append(node);
      crumbs.push({
        node,
        x: treat.x + (Math.random() - 0.5) * 6,
        y: treat.y + 2,
        vx: (Math.random() - 0.5) * 34,
        vy: -Math.random() * 30,
        landed: false,
        born: now(),
        life: CRUMB_LIFE,
        edible: true,
        bounces: 0,
      });
    }
    trimCrumbs();
  }

  /** Crumbs first, then anything else on the ground, oldest first, down to the cap. */
  function trimCrumbs() {
    while (crumbs.filter((crumb) => crumb.edible).length > CRUMB_MAX) {
      const oldest = crumbs.find((crumb) => crumb.edible);
      oldest.node.remove();
      crumbs = crumbs.filter((crumb) => crumb !== oldest);
    }
  }

  /**
   * Something that is not a crumb but lies about like one — a spat-out seed, a lollipop
   * stick. Same physics, never tidied up, and gone by itself after `life`.
   */
  function litter(node, { x, y, vx = 0, vy = 0, life = 6000, bounces = 0 }) {
    if (!actors) return;
    actors.append(node);
    crumbs.push({ node, x, y, vx, vy, landed: false, born: now(), life, edible: false, bounces });
    if (crumbs.length > CRUMB_MAX * 2) crumbs.shift().node.remove();
  }

  function stepCrumbs(dt) {
    const at = now();
    for (const crumb of crumbs) {
      if (!crumb.landed) {
        crumb.vy += 260 * dt;
        crumb.x = clamp(crumb.x + crumb.vx * dt, 4, 196);
        crumb.y += crumb.vy * dt;
        if (crumb.y >= WALK_Y - 0.8) {
          crumb.y = WALK_Y - 0.8;
          if (crumb.bounces > 0 && crumb.vy > 30) {
            crumb.bounces -= 1;
            crumb.vy = -crumb.vy * 0.45;
            crumb.vx *= 0.6;
          } else {
            crumb.landed = true;
          }
        }
      }
      if (at - crumb.born > crumb.life - 900) crumb.node.classList.add('is-fading');
    }
    const stale = crumbs.filter((crumb) => at - crumb.born > crumb.life);
    if (stale.length) {
      for (const crumb of stale) crumb.node.remove();
      crumbs = crumbs.filter((crumb) => !stale.includes(crumb));
    }
  }

  /** The closest crumb on the ground within reach, or null. */
  function nearestCrumb() {
    if (!pet) return null;
    return (
      crumbs
        .filter((crumb) => crumb.edible && crumb.landed && Math.abs(crumb.x - pet.x) <= CRUMB_REACH)
        .filter((crumb) => crumb.x >= habitat.roam.x0 - MOUTH.x && crumb.x <= habitat.roam.x1 + MOUTH.x)
        .sort((a, b) => Math.abs(a.x - pet.x) - Math.abs(b.x - pet.x))[0] ?? null
    );
  }

  /** Walk over to the nearest crumb, if there is one. Answers whether it went. */
  function tidyUp(left) {
    if (still || left <= 0) return false;
    const crumb = nearestCrumb();
    if (!crumb) return false;
    const dir = Math.sign(crumb.x - pet.x) || pet.facing || 1;
    walkTo(crumb.x - dir * (MOUTH.x - 2), 'tidy');
    mind.crumb = crumb;
    mind.left = left;
    pet.facing = dir;
    return true;
  }

  function beginPeck() {
    const { crumb, left } = mind;
    if (crumb && crumbs.includes(crumb)) pet.facing = Math.sign(crumb.x - pet.x) || pet.facing;
    move('peck', PECK_MS);
    mind = { state: 'peck', until: now() + PECK_MS, target: pet.x, crumb, left };
  }

  function finishPeck() {
    const { crumb, left } = mind;
    if (crumb && crumbs.includes(crumb)) {
      crumb.node.remove();
      crumbs = crumbs.filter((entry) => entry !== crumb);
      audio.play('munch', { pitch: 1.3 });
    }
    if (!tidyUp(left - 1)) idleFor();
  }

  /* ------------------------------------------------------------- the belly */

  function ate(kind) {
    // A popcorn kernel is a mouthful, not a meal: five of them make about one.
    belly += kind === 'cake' || kind === 'feast' ? 2 : kind === 'kernel' ? 0.25 : 1;
    shapeBody();
  }

  /** Rounder with every treat, and tipped over on its side while it sleeps one off. */
  function shapeBody() {
    if (!pet?.body) return;
    const b = Math.min(belly, BELLY_FULL);
    const round = still ? '' : `scale(${(1 + 0.045 * b).toFixed(3)} ${(1 - 0.012 * b).toFixed(3)})`;
    const flop = mind.state === 'coma' && mind.flopped ? ' rotate(80 0 -14)' : '';
    pet.body.setAttribute('transform', `${round}${flop}`.trim());
  }

  function beginComa() {
    audio.play('burp');
    buzz([20, 40, 30]);
    pop(inner(), { power: 1.5 });
    setMood('happy');
    pet.moodUntil = 0;
    say(labels.burp || 'Burp!', 'hab-burp');
    mind = { state: 'coma', until: now() + BURP_MS + COMA_MS, burpUntil: now() + BURP_MS, flopped: false, target: pet.x };
  }

  function flop() {
    mind.flopped = true;
    setMood('sleep');
    shapeBody();
    const zeds = nodeFrom(`<g class="hab-zeds hab-coma-z" transform="translate(4 -26)">
      <text class="hab-z hab-z1" x="0" y="0">z</text>
      <text class="hab-z hab-z2" x="3.4" y="-4.4">z</text>
      <text class="hab-z hab-z3" x="7.6" y="-9.6">z</text></g>`);
    pet.wrap.append(zeds);
  }

  function wakeFromComa() {
    pet.wrap.querySelector('.hab-coma-z')?.remove();
    belly = 1;
    mind = { state: 'idle', until: now() + 400, target: pet.x };
    shapeBody();
    setMood('content');
    audio.play('stretch');
    wiggle(inner());
  }

  /** A word in a bubble over the pet's head, floating up and away. */
  function say(text, className = 'hab-say', lift = 0) {
    if (!actors || !pet) return;
    const node = svgEl('g', { class: `hab-bubble ${className}` });
    const width = Math.max(18, text.length * 4.2 + 8);
    node.innerHTML = `<rect x="${(-width / 2).toFixed(1)}" y="-6.5" width="${width.toFixed(1)}" height="11" rx="5.5" />
      <text x="0" y="1.6">${text.replace(/[<&>]/g, '')}</text>`;
    place(node, clamp(pet.x, 16, 184), WALK_Y - 44 - lift);
    actors.append(node);
    const art = node;
    if (still) {
      setTimeout(() => node.remove(), 1100);
      return;
    }
    art.style.transformBox = 'fill-box';
    art
      .animate(
        [
          { opacity: 0, translate: '0 4px', scale: '0.6' },
          { opacity: 1, translate: '0 0', scale: '1.1', offset: 0.2 },
          { opacity: 1, translate: '0 -3px', scale: '1', offset: 0.7 },
          { opacity: 0, translate: '0 -8px', scale: '1' },
        ],
        { duration: 1200, easing: 'ease-out' }
      )
      .finished.catch(() => {})
      .finally(() => node.remove());
  }

  /**
   * The mouth's clock. Runs between the ball and the treats in `tick`, so wherever it puts
   * the mouthful is where `draw` puts it on screen the same frame.
   */
  function stepMeal() {
    if (!meal || !pet) return;
    const treat = meal.treat;
    // The child may take the food back out of the pet's mouth, exactly as they may take the
    // ball. If they have, there is nothing left to eat. Once it is swallowed the treat is
    // gone on purpose, and the gulp and the hearts still have to play out.
    if (!meal.swallowed && (treat.held || !treats.includes(treat))) {
      endMeal();
      setMood(restingMood());
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
        if (at >= mind.until) {
          if (meal.style.toss && !meal.tossed) beginToss();
          else beginChew();
        }
        return;
      }
      case 'toss': {
        const k = 1 - Math.max(0, Math.min(1, (mind.until - at) / TOSS_MS));
        treat.x = mouthX();
        treat.y = mouthY() - Math.sin(Math.PI * k) * 28;
        if (at >= mind.until) {
          audio.play('nom');
          beginChew();
        }
        return;
      }
      case 'chew':
        treat.x = mouthX();
        treat.y = mouthY();
        if (at >= meal.nextAt) bite();
        return;
      case 'gulp':
        if (at < mind.until) return;
        if (meal.quick) {
          const kind = treat.kind;
          pop(inner(), { power: 0.5 });
          endMeal();
          afterMeal(kind);
        } else {
          beginSavour();
        }
        return;
      case 'savour':
        if (at >= mind.until) {
          const kind = treat.kind;
          endMeal();
          afterMeal(kind);
        }
        return;
      case 'sniff': {
        // Up to the nose, the same way a dip brings it to the mouth, and held there.
        const k = 1 - Math.max(0, Math.min(1, (mind.until - at) / SNIFF_MS));
        const lift = Math.min(1, k * 2.5) * 0.6;
        treat.x = meal.liftFrom.x + (mouthX() - meal.liftFrom.x) * lift;
        treat.y = meal.liftFrom.y + (mouthY() + 8 - meal.liftFrom.y) * lift;
        if (at >= mind.until) beginReject();
        return;
      }
      case 'reject': {
        const k = Math.min(1, (at - (mind.until - REJECT_MS)) / 450);
        const ease = 1 - (1 - k) * (1 - k);
        treat.x = clamp(meal.pushFrom.x + meal.pushDir * 18 * ease, 6, 194);
        treat.y = meal.pushFrom.y + (WALK_Y - 2 - meal.pushFrom.y) * k;
        if (at >= mind.until) {
          removeTreat(treat);
          endMeal();
          setMood(restingMood());
          idleFor();
        }
        return;
      }
      default:
        // Something else took the pet over — the nap, or the scene closing behind us.
        endMeal();
    }
  }

  /* ------------------------------------------------------------------ catch */

  // A treat flung into the air is a game of catch. The pet works out where it will come down
  // to mouth height, gets under it, and snaps it out of the air with a little leap. Miss, and
  // it simply lands — and is eaten off the ground like any other.

  /** Where a treat in the air will be when it comes down past the pet's mouth. */
  function catchPoint(treat) {
    const g = 260;
    const h = WALK_Y + MOUTH.y - treat.y;
    const t = (-treat.vy + Math.sqrt(Math.max(0, treat.vy * treat.vy + 2 * g * h))) / g;
    return clamp(treat.x + treat.vx * t, 6, 194);
  }

  function aimCatch(treat) {
    if (!pet || napping || meal || course || mind.state === 'coma' || mind.state === 'enjoy') return;
    if (SHOW_STATES.has(mind.state) || tasteFor(treat) === 'yuck') return;
    const x = catchPoint(treat);
    const dir = Math.sign(x - pet.x) || pet.facing || 1;
    if (ball?.carried) dropBall();
    if (mind.state === 'chase') fetchWanted = true;
    setMood('hungry');
    mind = { state: 'catch', until: 0, target: clamp(x - dir * MOUTH.x, habitat.roam.x0, habitat.roam.x1), treat };
  }

  function stepCatch(dt) {
    const { treat } = mind;
    if (!treat || !treats.includes(treat) || !treat.airborne || treat.held) {
      setMood(restingMood());
      idleFor(150, 400);
      return;
    }
    // Keep re-aiming: a treat off a wall is not where it was going to be.
    const x = catchPoint(treat);
    const dir = Math.sign(x - pet.x) || pet.facing || 1;
    mind.target = clamp(x - dir * MOUTH.x, habitat.roam.x0, habitat.roam.x1);
    const delta = mind.target - pet.x;
    if (Math.abs(delta) > ARRIVE) {
      pet.facing = Math.sign(delta);
      pet.x = clamp(pet.x + pet.facing * CATCH_SPEED * dt, habitat.roam.x0, habitat.roam.x1);
    } else {
      pet.facing = Math.sign(treat.x - pet.x) || pet.facing;
    }
    // Coming down, close to the mouth, and within a leap of it: snap.
    const reach = mouthY() - LEAP_HEIGHT - 4;
    if (treat.vy > 0 && Math.abs(treat.x - mouthX()) < 10 && treat.y >= reach && treat.y <= mouthY() + 6) {
      caught(treat);
    }
  }

  function caught(treat) {
    treat.falling = false;
    treat.airborne = false;
    treat.vx = 0;
    treat.vy = 0;
    pet.leapAt = now();
    audio.play('nom');
    buzz([8, 30, 14]);
    say(labels.nom || 'Nom!');
    confetti(treat.wrap, fx, { power: 0.5, round: 1, colors: ['#ffd66b', '#fff0b0', '#ffffff'] });
    beginMeal(treat, { from: 'catch' });
  }

  /* ----------------------------------------------------------------- snacks */

  // What the shop's snacks do. Everything here is decoration on top of the ordinary meal —
  // the walk, the chew and the gulp are the same as for a berry. A snack only adds a moment
  // when it lands (`landed`) and a show once it is eaten (`afterEffect`), and some of those
  // shows leave a lingering *buff* that `stepBuffs` keeps ticking while the pet carries on.

  /** A snack from the picnic basket, dropped from the sky a little way from the pet. */
  function dropSnack(kind) {
    if (!pet || !habitat || napping || item?.hatchedAt === null || !actors) return false;
    const side = Math.random() < 0.5 ? -1 : 1;
    const x = clamp(pet.x + side * (16 + Math.random() * 16), habitat.roam.x0 + 4, habitat.roam.x1 - 4);
    const treat = spawnTreat(kind, x, still ? WALK_Y - 2 : 8, { snack: true });
    if (still) {
      treat.dropped = true;
      landed(treat);
    } else {
      treat.falling = true;
      treat.vy = 0;
    }
    audio.play('grab');
    return true;
  }

  /** A loose treat with no plant to grow back on. */
  function spawnTreat(kind, x, y, extra = {}) {
    const wrap = svgEl('g', { class: 'hab-treat hab-grab' });
    wrap.innerHTML = `<g class="hab-art hab-arrive">${treatSvg(kind, habitat.palette)}</g>`;
    place(wrap, x, y);
    actors.append(wrap);
    const treat = { wrap, x, y, spot: null, kind, held: false, falling: false, dropped: false, vy: 0, vx: 0, ...extra };
    treats.push(treat);
    return treat;
  }

  /** How many snacks are lying about uneaten — so the tray can count them as already spent. */
  const pendingSnacks = (kind) =>
    treats.filter((treat) => treat.snack && treat.kind === kind && !treat.gone).length;

  /** A treat touched down. Most just sit there; a couple of snacks make an entrance. */
  function landed(treat) {
    if (treat.kind === 'popcorn' && !still) {
      burstPopcorn(treat);
    } else if (treat.kind === 'jelly' && !still) {
      treat.wrap.querySelector('.hab-art')?.animate(
        [
          { transform: 'scale(1.3, 0.7)' },
          { transform: 'scale(0.85, 1.2)', offset: 0.3 },
          { transform: 'scale(1.1, 0.92)', offset: 0.55 },
          { transform: 'scale(0.96, 1.04)', offset: 0.8 },
          { transform: 'scale(1, 1)' },
        ],
        { duration: 700, easing: 'ease-out' }
      );
      audio.play('boing');
    }
  }

  /** Popcorn pops on landing: the bag is gone and five kernels go everywhere. */
  function burstPopcorn(treat) {
    treat.gone = true;
    treat.wrap.remove();
    if (treat.snack) onSnackEaten('popcorn');
    audio.play('bounce', { power: 0.5 });
    for (let i = 0; i < 5; i += 1) {
      const kernel = spawnTreat('kernel', treat.x, treat.y - 2);
      kernel.falling = true;
      kernel.vx = (i - 2) * 22 + (Math.random() - 0.5) * 14;
      kernel.vy = -70 - Math.random() * 50;
    }
  }

  /**
   * The show a snack puts on once it is down. Answers whether it took the pet over — if it
   * did, the show itself decides what comes next, and the meal's own ending stands aside.
   */
  function afterEffect(kind) {
    if (still) {
      // Reduced motion keeps the parts that are a look rather than a movement.
      if (kind === 'goldenapple') crown();
      return false;
    }
    switch (kind) {
      case 'lollipop':
        dropStick();
        return false;
      case 'watermelon':
        spitSeeds();
        return true;
      case 'icecream':
        brainFreeze();
        return true;
      case 'soda':
        buffs.hiccup = { until: now() + 6000, next: now() + 500 };
        return false;
      case 'jelly':
        buffs.boing = { until: now() + 4200, next: now() + 300 };
        return false;
      case 'chili':
        goSpicy();
        return true;
      case 'cake':
        party();
        return false;
      case 'goldenapple':
        crown();
        audio.play('sparkle');
        heartBurst(pet.art, fx, { count: 3 });
        return false;
      default:
        return false;
    }
  }

  function dropStick() {
    const node = svgEl('ellipse', { class: 'hab-stick', rx: '2.8', ry: '0.55' });
    const x = mouthX();
    litter(node, { x, y: mouthY(), vx: pet.facing * 12, vy: -20, life: 5000, bounces: 1 });
  }

  function spitSeeds() {
    setMood('stuffed');
    mind = { state: 'spit', until: now() + 1500, target: pet.x };
    [250, 650, 1050].forEach((delay, i) => {
      setTimeout(() => {
        if (!pet || mind.state !== 'spit') return;
        const node = svgEl('ellipse', { class: 'hab-seed', rx: '0.9', ry: '1.3' });
        litter(node, {
          x: mouthX(),
          y: mouthY() + 4,
          vx: pet.facing * (55 + i * 18 + Math.random() * 20),
          vy: -70 - Math.random() * 40,
          life: 7000,
          bounces: 2,
        });
        move('chomp', 200);
        audio.play('ptoo');
        if (i === 2) setMood('happy');
      }, delay);
    });
  }

  function brainFreeze() {
    setMood('droopy');
    audio.play('brr');
    buzz([8, 20, 8, 20, 8]);
    buffs.frozen = { until: now() + 1700 };
    mind = { state: 'freeze', until: now() + 1700, target: pet.x };
    inner()?.animate(
      [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-1.2px)' },
        { transform: 'translateX(1.2px)' },
        { transform: 'translateX(0)' },
      ],
      { duration: 120, iterations: 12 }
    );
    confetti(pet.art, fx, { power: 0.5, round: 1, colors: ['#ffffff', '#cfeaff', '#9fd2ff'] });
  }

  function goSpicy() {
    setMood('hungry');
    audio.play('sizzle');
    buzz([10, 20, 10]);
    buffs.spicy = { until: now() + 5200, next: now() };
    const far = pet.x - habitat.roam.x0 > habitat.roam.x1 - pet.x ? habitat.roam.x0 : habitat.roam.x1;
    mind = { state: 'zoom', until: 0, target: far, legs: 3 };
  }

  /** Chili laps: flat out to one end, then the other, until the legs run out. */
  function stepZoom(dt) {
    const delta = mind.target - pet.x;
    if (Math.abs(delta) <= ARRIVE) {
      mind.legs -= 1;
      if (mind.legs <= 0) {
        mind = { state: 'pant', until: now() + 1200, target: pet.x };
        return;
      }
      audio.play('sizzle');
      mind.target = mind.target === habitat.roam.x0 ? habitat.roam.x1 : habitat.roam.x0;
      return;
    }
    pet.facing = Math.sign(delta);
    pet.x = clamp(pet.x + pet.facing * 78 * dt, habitat.roam.x0, habitat.roam.x1);
  }

  function party() {
    audio.play('sparkle');
    hop(10);
    confetti(pet.art, fx, { power: 1.4 });
    heartBurst(pet.art, fx, { count: 4 });
    buffs.rainbow = { until: now() + 6000 };
  }

  function crown() {
    buffs.golden = { until: Infinity };
    if (pet.body.querySelector('.hab-crown')) return;
    const node = nodeFrom(`<g class="hab-crown" transform="translate(0 ${-(PET_FOOT.y + 2).toFixed(1)})">
      <path d="M-6 0 L-6 -5 L-3 -2.4 L0 -6.4 L3 -2.4 L6 -5 L6 0 Z" fill="#f7c948" stroke="#c8961e" stroke-width="0.6" stroke-linejoin="round" />
      <circle cx="0" cy="-1.6" r="0.9" fill="#ef4f5f" />
    </g>`);
    pet.body.append(node);
  }

  /** A little round thing floating up off the pet and fading — a bubble, a puff of steam. */
  function float(cls, { dx = 0, dy = -30, r = 1.6, rise = 22, drift = 0, duration = 1200, x = pet.x + pet.facing * dx } = {}) {
    if (!actors || still) return;
    const node = svgEl('circle', { class: cls, r: String(r), cx: x.toFixed(2), cy: (WALK_Y + dy).toFixed(2) });
    actors.append(node);
    node
      .animate(
        [
          { transform: 'translate(0px, 0px) scale(0.6)', opacity: 0 },
          { transform: `translate(${drift * 0.3}px, ${-rise * 0.3}px) scale(1)`, opacity: 0.95, offset: 0.2 },
          { transform: `translate(${drift}px, ${-rise}px) scale(1.25)`, opacity: 0 },
        ],
        { duration, easing: 'ease-out' }
      )
      .finished.catch(() => {})
      .finally(() => node.remove());
  }

  /**
   * The lingering part of a snack: hiccups, jelly bounces, steam, and which tint the pet
   * wears. One filter at a time, the most dramatic winning, so two snacks never muddy each
   * other into brown.
   */
  function stepBuffs() {
    if (!pet || !filterIds) return;
    const at = now();
    for (const [name, buff] of Object.entries(buffs)) {
      if (at > buff.until) delete buffs[name];
    }
    const { hiccup, boing, spicy } = buffs;
    if (hiccup && at >= hiccup.next && mind.state !== 'coma') {
      hiccup.next = at + 700 + Math.random() * 300;
      hop(4);
      audio.play('hiccup');
      float('hab-bubble-pop', { dx: 6, dy: -30, r: 1.8, rise: 26, drift: (Math.random() - 0.5) * 8 });
    }
    if (boing && at >= boing.next && mind.state !== 'coma' && !MEAL_STATES.has(mind.state)) {
      boing.next = at + 650;
      hop(9);
      audio.play('boing');
    }
    if (spicy && at >= spicy.next) {
      spicy.next = at + 160;
      float('hab-steam', { dx: -4 + Math.random() * 8, dy: -38, r: 2 + Math.random(), rise: 16, drift: (Math.random() - 0.5) * 10, duration: 900 });
    }
    const tint = buffs.frozen ? 'frost' : buffs.spicy ? 'spicy' : buffs.rainbow ? 'rainbow' : buffs.golden ? 'golden' : '';
    const filter = tint ? `url(#${filterIds[tint]})` : '';
    if ((pet.body.getAttribute('filter') ?? '') !== filter) {
      if (filter) pet.body.setAttribute('filter', filter);
      else pet.body.removeAttribute('filter');
    }
  }

  /** The four tints, added to the open scene's own <defs> so they travel with it. */
  function addFilters(uid) {
    filterIds = {
      frost: `${uid}-frost`,
      spicy: `${uid}-spicy`,
      rainbow: `${uid}-rainbow`,
      golden: `${uid}-golden`,
    };
    const spin = still
      ? ''
      : '<animate attributeName="values" from="0" to="360" dur="1.4s" repeatCount="indefinite" />';
    const defs = svgEl('defs');
    defs.innerHTML = `
      <filter id="${filterIds.frost}" color-interpolation-filters="sRGB">
        <feColorMatrix type="matrix" values="0.55 0.2 0.2 0 0.05  0.2 0.65 0.2 0 0.12  0.2 0.25 0.8 0 0.28  0 0 0 1 0" />
      </filter>
      <filter id="${filterIds.spicy}" color-interpolation-filters="sRGB">
        <feColorMatrix type="matrix" values="1 0.35 0.2 0 0.18  0.1 0.45 0.1 0 0  0.1 0.1 0.4 0 0  0 0 0 1 0" />
      </filter>
      <filter id="${filterIds.rainbow}" color-interpolation-filters="sRGB">
        <feColorMatrix type="hueRotate" values="${still ? 60 : 0}">${spin}</feColorMatrix>
      </filter>
      <filter id="${filterIds.golden}" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="0" stdDeviation="1.6" flood-color="#ffd66b" flood-opacity="0.95" />
      </filter>`;
    root.prepend(defs);
  }

  /* ----------------------------------------------------------------- course */

  // The obstacle course. Between runs it is a flag; a tap (or, now and then, the pet itself)
  // pops the pieces up across the walk line, and the run is a list of segments played in
  // order: run to the start, then for each piece run to it and go over it — fluffing it first,
  // once in a while — then celebrate at the finish, pack it all away and amble back in.
  //
  // How the pet gets over each piece is course.js's: a pose as a function of progress. All
  // this part does is play those poses, move the pieces' own parts to match, and fire the cues.

  /** Whether a run could start right now. Anything already going on comes first. */
  function courseBlocked() {
    if (!pet || !habitat || !actors || napping || item?.hatchedAt === null) return true;
    if (!habitat.course?.length || course || meal) return true;
    if (MEAL_STATES.has(mind.state) || SHOW_STATES.has(mind.state)) return true;
    return ['coma', 'catch', 'enjoy', 'fetchfood'].includes(mind.state);
  }

  /** The idle pet's own decision to have a go. Never in the wet, the fog or the snow. */
  function wantsCourse() {
    if (now() < courseAutoAt || courseBlocked()) return false;
    if (shelters(weather) || slows(weather)) return false;
    if (looseTreat() || (fetchWanted && ball?.resting)) return false;
    return true;
  }

  function tapFlag() {
    const flag = root?.querySelector('.crs-flag-art');
    if (courseBlocked()) {
      // Not now — it is busy. The flag shrugs, so the tap was not lost on nobody.
      if (!still) wiggle(flag);
      buzz(6);
      return;
    }
    if (!still) wiggle(flag);
    startCourse();
  }

  /** One piece, built from its two layers and put either side of the pet. */
  function buildPiece(piece) {
    const part = COURSE_PARTS[piece.id];
    const c = habitat.palette;
    const opts = { frozen: piece.frozen };
    const back = svgEl('g', { class: `hab-obstacle crs-${piece.id}` });
    back.innerHTML = `<g class="crs-art">${part.back(c, opts)}</g>`;
    place(back, piece.x, WALK_Y);
    actors.insertBefore(back, pet.wrap);
    let front = null;
    if (part.front) {
      front = svgEl('g', { class: 'hab-obstacle hab-obstacle-front' });
      front.innerHTML = `<g class="crs-art">${part.front(c, opts)}</g>`;
      place(front, piece.x, WALK_Y);
      pet.wrap.after(front);
    }
    return { ...piece, back, front };
  }

  /** Each piece grows up out of the ground, one after another, left to right. */
  function popUp(pieces) {
    if (still) return;
    pieces.forEach((piece, i) => {
      for (const node of [piece.back, piece.front]) {
        node
          ?.querySelector('.crs-art')
          ?.animate(
            [
              { transform: 'scale(0.2, 0)', opacity: 0 },
              { transform: 'scale(1.08, 1.12)', opacity: 1, offset: 0.65 },
              { transform: 'scale(1, 1)', opacity: 1 },
            ],
            { duration: 380, delay: i * POP_STAGGER, easing: 'cubic-bezier(.34,1.56,.64,1)', fill: 'backwards' }
          );
      }
    });
  }

  function startCourse() {
    if (courseBlocked()) return;
    // Snowing, or a snowfield home: the wet pieces are frozen today.
    const layout = courseLayout(habitat.course, LANE, { frozen: isFrozen({ biome: habitat.biome, weather }) });
    const favourite = favouriteObstacleOf(habitat.id);
    const pieces = layout.pieces.map(buildPiece);
    popUp(pieces);
    // Whatever was in its mouth is put down first, and a ball it was off after it goes back
    // to once the run is done.
    if (ball?.carried) dropBall();
    if (mind.state === 'chase') fetchWanted = true;
    setMood('happy');
    audio.play('ready');
    buzz(10);

    const segs = [];
    if (still) {
      // The reduced-motion run: the pieces stand there, the pet is simply over the line.
      segs.push({ kind: 'warp', to: layout.finish });
    } else {
      const flub = pickFlub(pieces, favourite);
      // A beat for the pieces to finish popping up before anyone sets off.
      segs.push({ kind: 'wait', ms: 260 + pieces.length * POP_STAGGER });
      segs.push({ kind: 'go', to: layout.start });
      pieces.forEach((piece, i) => {
        segs.push({ kind: 'go', to: piece.x0 });
        if (i === flub) segs.push({ kind: 'move', piece, flub: true });
        segs.push({ kind: 'move', piece, flub: false });
      });
      segs.push({ kind: 'go', to: layout.finish });
    }
    // Back in off the finish line, which is further out than the pet ever wanders and close
    // enough to the edge to crop it, so the celebrating happens where all of it can be seen.
    segs.push({ kind: 'go', to: clamp(layout.finish, habitat.roam.x0, habitat.roam.x1) });
    segs.push({ kind: 'cheer', ms: CHEER_MS });
    segs.push({ kind: 'fold', ms: still ? 0 : FOLD_MS });

    course = {
      pieces,
      segs,
      at: -1,
      favourite,
      loved: pieces.some((piece) => piece.id === favourite),
    };
    mind = { state: 'course', until: 0, target: pet.x };
    nextSeg();
  }

  function nextSeg() {
    course.at += 1;
    const seg = course.segs[course.at];
    if (!seg) {
      endCourse();
      return;
    }
    seg.began = now();
    seg.fired = 0;
    if (seg.kind === 'move') {
      const { move } = seg.piece;
      // Snow and fog slow a run down the same way they slow an amble.
      seg.ms = (seg.flub ? flubMs(move) : COURSE_MOVES[move].ms) / pace();
      seg.cues = seg.flub ? flubCues(move) : COURSE_MOVES[move].cues;
      if (!seg.flub && seg.piece.id === course.favourite) setMood('happy');
    } else if (seg.kind === 'warp' || (seg.kind === 'go' && still)) {
      pet.x = seg.to;
      pet.facing = 1;
      nextSeg();
    } else if (seg.kind === 'cheer') {
      cheer();
    } else if (seg.kind === 'fold') {
      fold();
    }
  }

  function stepCourse(dt) {
    const seg = course.segs[course.at];
    if (!seg) return;
    if (seg.kind === 'go') {
      const delta = seg.to - pet.x;
      if (Math.abs(delta) <= ARRIVE) {
        pet.x = seg.to;
        nextSeg();
        return;
      }
      pet.facing = Math.sign(delta);
      pet.x += pet.facing * Math.min(Math.abs(delta), RUN_SPEED * pace() * dt);
      return;
    }
    if (seg.kind === 'move') {
      const k = Math.min(1, (now() - seg.began) / seg.ms);
      const { piece } = seg;
      const p = seg.flub ? flubPose(piece.move, k, piece.span) : COURSE_MOVES[piece.move].pose(k, piece.span);
      pet.facing = 1;
      pet.x = piece.x0 + p.dx;
      coursePose = p;
      movePart(piece, p);
      while (seg.fired < seg.cues.length && seg.cues[seg.fired].at <= k) {
        cue(seg.cues[seg.fired], piece);
        seg.fired += 1;
      }
      if (k >= 1) {
        coursePose = null;
        if (seg.flub) setMood('happy');
        else if (piece.id === course.favourite) {
          // Its very favourite. Hearts, right there over the piece.
          heartBurst(pet.art, fx, { count: 3 });
          audio.play('love');
        }
        nextSeg();
      }
      return;
    }
    if (now() - seg.began >= (seg.ms ?? 0)) nextSeg();
  }

  /** The piece's own moving parts, kept in step with the pet on it — in front of it and behind. */
  function movePart(piece, p) {
    const rig = COURSE_PARTS[piece.id]?.rig?.(p, piece.span);
    if (!rig) return;
    for (const node of [piece.back, piece.front]) {
      if (!node) continue;
      for (const [selector, transform] of Object.entries(rig)) {
        node.querySelectorAll(selector).forEach((part, i) => {
          part.setAttribute('transform', Array.isArray(transform) ? transform[i] : transform);
        });
      }
    }
  }

  /** Something that happens at one moment of a move: a sound, and sometimes a bit of business. */
  function cue({ sound, fx: effect, say: words }, piece) {
    // A frozen piece may sound different: a sprinkler of snowflakes goes brr, not hiss.
    if (sound) audio.play(piece.sounds?.[sound] ?? sound);
    // Said over the pet wherever it is standing, up on the table included.
    if (words) say(words, 'hab-say', coursePose?.lift ?? 0);
    if (!effect || still) return;
    if (effect === 'land') {
      buzz(5);
      if (shelters(weather)) splash(pet.x);
    } else if (effect === 'balls') {
      sprayBalls(piece);
    } else if (effect === 'spray' || effect === 'drip') {
      // The wet pieces splash whatever the sky is doing — or, frozen, throw snow about.
      spatter(pet.x, { count: effect === 'spray' ? 6 : 5, color: piece.frozen ? habitat.palette.stoneLight : habitat.palette.waterLight, y: WALK_Y - (effect === 'spray' ? 16 : 10) });
    } else if (effect === 'bigsplash') {
      spatter(pet.x, { count: 12, power: 1.8, color: habitat.palette.waterLight });
    } else if (effect === 'leaves') {
      sprayLeaves(piece);
    } else if (effect === 'bubbles') {
      blowBubbles(piece);
    } else if (effect === 'popped') {
      popBubble((coursePose?.lift ?? 0) + 34);
    } else if (effect === 'hat') {
      leafHat(piece);
    } else if (effect === 'ring') {
      // The bell, swinging on its bracket.
      const bell = (piece.front ?? piece.back).querySelector('.crs-bell');
      if (bell) {
        bell.style.transformBox = 'fill-box';
        bell.style.transformOrigin = '50% 0%';
        bell.animate(
          [{ rotate: '0deg' }, { rotate: '22deg' }, { rotate: '-16deg' }, { rotate: '9deg' }, { rotate: '-4deg' }, { rotate: '0deg' }],
          { duration: 900, easing: 'ease-out' }
        );
      }
      heartBurst(pet.art, fx, { count: 1 });
    } else if (effect === 'smoke' || effect === 'puff') {
      smoke(piece, effect === 'smoke' ? 7 : 3);
      if (effect === 'smoke') {
        buzz([20, 30, 10]);
        confetti(pet.art, fx, { power: 0.5 });
      }
    } else if (effect === 'soot') {
      spatter(pet.x, { count: 6, color: habitat.palette.stone, y: WALK_Y - 18 });
    } else if (effect === 'rustle') {
      piece.back.querySelector('.crs-tube')?.animate(
        [
          { transform: 'scale(1, 1)' },
          { transform: 'scale(1.05, 0.95)' },
          { transform: 'scale(0.97, 1.04)' },
          { transform: 'scale(1, 1)' },
        ],
        { duration: 240, iterations: 3 }
      );
    } else if (effect === 'bonk') {
      // The joke: it went wrong. A dazed face, a thump, and the piece itself rocking.
      setMood('droopy');
      buzz([10, 30, 10]);
      for (const node of [piece.back, piece.front]) {
        node?.querySelector('.crs-art')?.animate(
          [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-6deg)' }, { transform: 'rotate(4deg)' }, { transform: 'rotate(0deg)' }],
          { duration: 420, easing: 'ease-out' }
        );
      }
    }
  }

  /** Into the ball pit, and out it all comes. */
  function sprayBalls(piece) {
    const colors = ballColors(habitat.palette);
    for (let i = 0; i < 6; i += 1) {
      const node = svgEl('circle', { class: 'hab-crumb', r: '1.7', fill: colors[i % colors.length] });
      litter(node, {
        x: piece.x + (Math.random() - 0.5) * 16,
        y: WALK_Y - 14,
        vx: (Math.random() - 0.5) * 70,
        vy: -70 - Math.random() * 50,
        life: 1600,
        bounces: 2,
      });
    }
  }

  /** A landing in the rain throws up a little water. */
  function splash(x) {
    spatter(x);
    audio.play('splash');
  }

  /** Drops flung up and out from `x`: water, or snow off a frozen piece. */
  function spatter(x, { count = 5, power = 1, color = habitat.palette.waterLight, y = WALK_Y - 1 } = {}) {
    for (let i = 0; i < count; i += 1) {
      const node = svgEl('circle', { class: 'hab-crumb', r: '0.9', fill: color });
      litter(node, {
        x: x + (Math.random() - 0.5) * 8 * power,
        y,
        vx: (Math.random() - 0.5) * 50 * power,
        vy: (-40 - Math.random() * 30) * power,
        life: 800,
      });
    }
  }

  /** Into the leaf pile, and up go the leaves — or the snow, off a snow pile. */
  function sprayLeaves(piece) {
    const c = habitat.palette;
    const colors = piece.frozen ? [c.stoneLight, '#fff8e0', c.waterLight] : [c.leaf, c.accent, c.bloom, c.leafDark];
    for (let i = 0; i < 7; i += 1) {
      const fill = colors[i % colors.length];
      const node = piece.frozen
        ? svgEl('circle', { class: 'hab-crumb', r: '1.1', fill })
        : svgEl('ellipse', { class: 'hab-crumb', rx: '1.6', ry: '0.8', fill });
      litter(node, { x: piece.x + (Math.random() - 0.5) * 14, y: WALK_Y - 7, vx: (Math.random() - 0.5) * 60, vy: -60 - Math.random() * 50, life: 1400 });
    }
  }

  /** The machine puffs a string of bubbles up into the air. */
  function blowBubbles(piece) {
    for (let i = 0; i < 6; i += 1) {
      setTimeout(() => {
        if (!actors || !pet) return;
        float('hab-bubble-pop', {
          x: piece.x - 0.4 + (Math.random() - 0.3) * 6,
          dy: -12,
          r: 1.2 + Math.random() * 1.4,
          rise: 22 + Math.random() * 14,
          drift: 4 + Math.random() * 10,
          duration: 1600 + Math.random() * 600,
        });
      }, i * 160);
    }
  }

  /** A cloud of smoke out of the cannon's mouth. */
  function smoke(piece, count) {
    for (let i = 0; i < count; i += 1) {
      float('hab-steam', {
        x: piece.x + MUZZLE.u + 1 + (Math.random() - 0.5) * 4,
        dy: -MUZZLE.y - 2,
        r: 2.2 + Math.random() * 2,
        rise: 8 + Math.random() * 12,
        drift: 4 + Math.random() * 12,
        duration: 900 + Math.random() * 500,
      });
    }
  }

  /** One bubble, popped on the pet's nose: a ring that bursts outward and is gone. */
  function popBubble(height) {
    if (!actors || !pet) return;
    const node = svgEl('circle', { class: 'hab-bubble-pop', r: '2.2', cx: (pet.x + 6).toFixed(2), cy: (WALK_Y - height).toFixed(2) });
    node.style.transformBox = 'fill-box';
    node.style.transformOrigin = '50% 50%';
    actors.append(node);
    node
      .animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(2.4)', opacity: 0 }], { duration: 260, easing: 'ease-out' })
      .finished.catch(() => {})
      .finally(() => node.remove());
  }

  /** Out of the pile backwards, with a leaf (or a lump of snow) stuck on its head, shaken off. */
  function leafHat(piece) {
    const c = habitat.palette;
    const hat = piece.frozen
      ? svgEl('circle', { r: '2.4', cx: '0', cy: String(4 - PET_FOOT.y), fill: c.stoneLight })
      : svgEl('ellipse', { rx: '3.4', ry: '1.5', cx: '0', cy: String(4 - PET_FOOT.y), fill: c.leaf, transform: `rotate(-20 0 ${4 - PET_FOOT.y})` });
    hat.setAttribute('class', 'hab-hat');
    pet.wrap.append(hat);
    hat
      .animate(
        [
          { translate: '0 0', rotate: '0deg', opacity: 1 },
          { translate: '0 0', rotate: '0deg', opacity: 1, offset: 0.6 },
          { translate: '10px -6px', rotate: '80deg', opacity: 1, offset: 0.75 },
          { translate: '16px 24px', rotate: '160deg', opacity: 0 },
        ],
        { duration: 1500, easing: 'ease-in' }
      )
      .finished.catch(() => {})
      .finally(() => hat.remove());
  }

  /** Over the line. Bigger if its favourite was in the course. */
  function cheer() {
    pet.facing = pet.x > 100 ? -1 : 1;
    cheerUp(HAPPY_MS);
    audio.play('fanfare');
    buzz([12, 40, 12, 40, 20]);
    hop(course.loved ? 12 : 9);
    heartBurst(pet.art, fx, { count: course.loved ? 5 : 3 });
    if (course.loved) confetti(pet.art, fx, { power: 1.1 });
  }

  /** Everything folds back down into the ground, and goes. */
  function fold() {
    for (const piece of course.pieces) {
      for (const node of [piece.back, piece.front]) {
        if (!node) continue;
        if (still) {
          node.remove();
          continue;
        }
        node
          .querySelector('.crs-art')
          ?.animate([{ transform: 'scale(1, 1)', opacity: 1 }, { transform: 'scale(0.3, 0)', opacity: 0 }], {
            duration: FOLD_MS,
            easing: 'ease-in',
            fill: 'forwards',
          })
          .finished.catch(() => {})
          .finally(() => node.remove());
      }
    }
  }

  function endCourse() {
    for (const piece of course?.pieces ?? []) {
      piece.back.remove();
      piece.front?.remove();
    }
    course = null;
    coursePose = null;
    courseAutoAt = now() + AUTO_MIN + Math.random() * (AUTO_MAX - AUTO_MIN);
    idleFor();
  }

  /* --------------------------------------------------------------- pointers */

  function onDown(event) {
    if (!habitat || !pet) return;
    const hit = event.target.closest?.('.hab-ball, .hab-treat, .hab-pet, .hab-course-flag');
    if (!hit) return;
    event.preventDefault();

    if (napping) {
      // The zoo is asleep. Touching anything earns a stretch, not a game of fetch.
      audio.play('stretch');
      buzz(8);
      if (!still) wiggle(pet.art.querySelector('.pet-inner'));
      return;
    }

    if (hit.classList.contains('hab-course-flag')) {
      tapFlag();
      return;
    }

    // Busy. Mid-run the pet is not to be stroked out of the air; it is all yours at the finish.
    if (hit.classList.contains('hab-pet') && course) return;

    root.setPointerCapture(event.pointerId);

    if (hit.classList.contains('hab-pet') && mind.state === 'coma') {
      // Out cold after a feast. A poke gets a stretch and a mumble, and it sleeps on.
      audio.play('stretch');
      buzz(8);
      return;
    }

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
        setMood(restingMood());
        idleFor(200, 600);
      }
      treat.wrap.style.transition = '';
      treat.wrap.style.opacity = '';
      treat.held = true;
      treat.falling = false;
      treat.airborne = false;
      treat.vx = 0;
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
      const awake = mind.state !== 'coma';
      if (awake && dist(treat.x, treat.y, pet.x + HEAD.x, WALK_Y + HEAD.y) <= EAT_RADIUS) {
        // Put straight on its head: it has already been noticed and walked to.
        beginMeal(treat, { from: 'hand' });
      } else if (still) {
        // Reduced motion: it is already down. The pet eats it next frame, where it stands.
        treat.y = WALK_Y - 2;
        treat.dropped = true;
      } else if (vy < -FLING_VY) {
        // Flung upward: it goes up, comes down, and the pet may well get there first.
        treat.falling = true;
        treat.airborne = true;
        treat.vx = clamp(vx * 0.7, -130, 130);
        treat.vy = Math.max(vy * 0.85, -260);
        aimCatch(treat);
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
      const p = coursePose;
      const flip = pet.facing < 0 ? ' scale(-1 1)' : '';
      // On an obstacle the pet leans about its middle and squashes about its feet, so a
      // somersault turns it over rather than swinging it round its toes.
      const shape = p
        ? ` rotate(${p.rot.toFixed(1)} 0 ${(-PET_FOOT.y * 0.45).toFixed(1)}) scale(${p.sx.toFixed(3)} ${p.sy.toFixed(3)})`
        : '';
      place(pet.wrap, pet.x, WALK_Y - petLift() - (p?.lift ?? 0), `${flip}${shape}`);
      pet.wrap.style.visibility = p?.hide ? 'hidden' : '';
    }
    if (ball) {
      place(ball.wrap, ball.x, ball.y, ` rotate(${(ball.spin ?? 0).toFixed(1)})`);
    }
    for (const treat of treats) place(treat.wrap, treat.x, treat.y);
    for (const crumb of crumbs) {
      crumb.node.setAttribute('cx', crumb.x.toFixed(2));
      crumb.node.setAttribute('cy', crumb.y.toFixed(2));
    }
  }

  function tick(frameTime) {
    const dt = Math.min(0.05, Math.max(0, (frameTime - last) / 1000));
    last = frameTime;
    stepMind(dt);
    stepBallPhysics(dt);
    stepMeal();
    stepTreats(dt);
    stepCrumbs(dt);
    stepBuffs();
    draw();
    raf = requestAnimationFrame(tick);
  }

  /* ------------------------------------------------------------------- API */

  return {
    /** Put a pet in its habitat. Safe to call over an already-open scene. */
    open(
      nextItem,
      {
        napping: isNapping = false,
        label = '',
        title = '',
        weather: sky = null,
        soak = 0,
        words = labels,
      } = {}
    ) {
      this.close();
      item = nextItem;
      labels = words ?? {};
      napping = isNapping;
      still = reduceMotion();
      weather = sky;
      habitat = habitatOf(item);
      const uid = `hab${habitat.id.replace(':', '')}`;

      host.innerHTML = habitatSvg(habitat, {
        uid,
        label,
        sleeping: napping,
        weather: sky,
        soak,
        courseLabel: labels.course ?? '',
      });
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
      opens += 1;
      addFilters(`snk${opens}`);
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
      course = null;
      coursePose = null;
      courseAutoAt = now() + AUTO_MIN + Math.random() * (AUTO_MAX - AUTO_MIN);
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
      crumbs = [];
      belly = 0;
      buffs = {};
      filterIds = null;
      // A meal has to be dropped here or it survives into the next pet's habitat. Both the
      // nap and a change of weather re-`open`, and `open` closes first — so this one line is
      // also what stops a mouthful that bedtime or a downpour interrupted.
      meal = null;
      drag = null;
      stroke = null;
      fetchWanted = false;
      // The pieces went with the nodes above; the run goes with them, so a nap or a downpour
      // that re-opens the scene starts it with the course folded away.
      course = null;
      coursePose = null;
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
      pet.body.replaceChild(art, pet.art);
      pet.art = art;
    },

    get isOpen() {
      return Boolean(habitat);
    },

    /** A snack off the picnic tray. Answers whether it went in (not into an egg's home, say). */
    dropSnack(kind) {
      return dropSnack(kind);
    },

    /** Snacks from the tray that are in the scene but not eaten yet. */
    pendingSnacks(kind) {
      return habitat ? pendingSnacks(kind) : 0;
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
      // The flag is a button to a keyboard too: it is the one thing in here that is.
      target.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        if (!event.target.closest?.('.hab-course-flag')) return;
        event.preventDefault();
        if (napping) {
          audio.play('stretch');
          return;
        }
        tapFlag();
      });
    },
  };
}
