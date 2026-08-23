// The living half of a habitat. habitat.js decides what a home looks like; this drives it:
// retained SVG nodes, one requestAnimationFrame loop, and the four things a child can do
// in there — watch the pet potter about, throw its ball, offer it a treat, and stroke it.
//
// Owns the DOM and the clock. Owns no game state: nothing in here feeds a pet, grades an
// answer or unlocks anything, and it never writes to the save. Free play, on purpose — the
// clock scene stays the only place progress happens, so a habitat can never become the
// cheaper route to a reward.
//
// The loop runs only while the scene is open. Closing it cancels the frame and drops every
// node, so nothing animates behind a hidden section.

import { appearanceOf, eggSvg, petSvg } from './pets.js';
import {
  ballSvg,
  BALL_R,
  clamp,
  habitatOf,
  habitatSvg,
  nextWanderTarget,
  PET_FOOT,
  PET_SIZE,
  stepBall,
  treatSvg,
  WALK_Y,
} from './habitat.js';
import { audio } from './audio.js';
import { buzz, confetti, heartBurst, pop, reduceMotion, svgEl, wiggle } from './juice.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

/* ------------------------------------------------------------------- tuning */

const WALK_SPEED = 27; // habitat units per second, ambling
const CHASE_SPEED = 47; // and hurrying after a ball
const ARRIVE = 1.6; // close enough to count as there
const GRAB_RADIUS = 13; // how near the pet must be to pick the ball up
const MOUTH = { x: 9, y: -25 }; // where a carried ball rides, relative to the pet's feet
const HEAD = { x: 0, y: -30 }; // where a treat has to land to be eaten
const EAT_RADIUS = 24;
const THROW_SCALE = 1.05; // pointer speed to ball speed
const THROW_MAX = 340; // however hard a small arm swings, the ball stays catchable
const IDLE_MIN = 900;
const IDLE_MAX = 2600;
const EAT_MS = 1500;
const HAPPY_MS = 2600;
const REGROW_MS = 2400;
const STROKE_STEP = 26; // pointer travel, in screen px, between hearts
const PURR_MS = 520;

/* -------------------------------------------------------------------- utils */

const now = () => performance.now();
const dist = (a, b, c, d) => Math.hypot(a - c, b - d);

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

  let pet = null; // { wrap, art, x, facing, mood, moodUntil }
  let ball = null; // { wrap, x, y, vx, vy, resting, held, carried }
  let treats = []; // { wrap, x, y, spot, held, falling, vy }
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
      ? eggSvg(appearanceOf(item).species, { title: pet?.title ?? '' })
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
    // The art lives in an inner group because the arrive/fade animations touch `transform`,
    // and a CSS transform on the wrapper overrides the attribute that positions it.
    const wrap = svgEl('g', { class: 'hab-treat hab-grab' });
    wrap.dataset.spot = String(spotIndex);
    wrap.innerHTML = `<g class="hab-art hab-arrive">${treatSvg(habitat.props.larder.treat, habitat.palette)}</g>`;
    place(wrap, spot.x, spot.y);
    actors.append(wrap);
    treats.push({ wrap, x: spot.x, y: spot.y, spot: spotIndex, held: false, falling: false, vy: 0 });
  }

  /* -------------------------------------------------------------------- mind */

  function idleFor(msMin = IDLE_MIN, msMax = IDLE_MAX) {
    mind = { state: 'idle', until: now() + msMin + Math.random() * (msMax - msMin), target: pet.x };
  }

  function walkTo(x, state = 'walk') {
    mind = { state, until: 0, target: clamp(x, habitat.roam.x0, habitat.roam.x1) };
  }

  function stepMind(dt) {
    if (!pet || napping || mind.state === 'enjoy') return;

    if (pet.moodUntil && now() > pet.moodUntil && mind.state !== 'eat') {
      pet.moodUntil = 0;
      setMood(restingMood());
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
        if (now() >= mind.until) walkTo(nextWanderTarget(pet.x, habitat.roam, Math.random));
        return;
      case 'eat':
        if (now() >= mind.until) idleFor();
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
      case 'chase': {
        const speed = mind.state === 'walk' ? WALK_SPEED : CHASE_SPEED;
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
          fadeTreat(treat);
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

  function fadeTreat(treat) {
    treat.wrap.querySelector('.hab-art')?.classList.add('hab-fade');
    setTimeout(() => {
      if (treats.includes(treat)) removeTreat(treat);
    }, 420);
  }

  function eatTreat(treat) {
    const c = habitat.palette;
    confetti(treat.wrap, fx, { power: 0.45, colors: [c.accent, c.bloom, c.leaf] });
    audio.play('munch');
    buzz([10, 40, 10]);
    removeTreat(treat);
    setMood('happy');
    pet.moodUntil = now() + HAPPY_MS;
    mind = { state: 'eat', until: now() + EAT_MS, target: pet.x };
    pop(pet.art.querySelector('.pet-inner'));
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
      treat.held = true;
      treat.falling = false;
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
        eatTreat(treat);
      } else {
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
    stepTreats(dt);
    draw();
    raf = requestAnimationFrame(tick);
  }

  /* ------------------------------------------------------------------- API */

  return {
    /** Put a pet in its habitat. Safe to call over an already-open scene. */
    open(nextItem, { napping: isNapping = false, label = '', title = '' } = {}) {
      this.close();
      item = nextItem;
      napping = isNapping;
      still = reduceMotion();
      habitat = habitatOf(item);
      const uid = `hab${habitat.id.replace(':', '')}`;

      host.innerHTML = habitatSvg(habitat, { uid, label, sleeping: napping });
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
      pet = null;
      ball = null;
      treats = [];
      drag = null;
      stroke = null;
      fetchWanted = false;
    },

    /** The nap started or ended while the child was standing in here. */
    setNapping(value) {
      const next = Boolean(value);
      if (!habitat || next === napping) return;
      const current = item;
      const label = root?.getAttribute('aria-label') ?? '';
      this.open(current, { napping: next, label, title: pet?.title ?? '' });
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
