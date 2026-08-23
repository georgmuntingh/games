// The reward layer: confetti, hearts, haptics. Everything here is decoration and must
// degrade to nothing — if reduced motion is on, or the API is missing, the game plays
// exactly the same, just quieter.

const reduceMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

let hapticsOn = true;
export const setHaptics = (value) => {
  hapticsOn = Boolean(value);
};

/** Short, quiet, and always optional — some browsers have no vibration motor at all. */
export function buzz(pattern) {
  if (!hapticsOn) return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* no motor, or blocked by the platform */
  }
}

const CONFETTI = ['#ff9ec0', '#ffd166', '#7bd88f', '#6bb8ff', '#c48cff', '#ff8a75'];

/**
 * An SVG element with attributes. Lives here rather than in clock.js because clock.js is
 * pure and tested as pure; this module is already the one that is allowed to touch the DOM.
 */
export function svgEl(tag, attrs = {}, text) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  if (text !== undefined) node.textContent = text;
  return node;
}

/**
 * A burst of paper from the middle of `origin`, drawn as absolutely-positioned divs in
 * `layer` and driven by one rAF loop that cleans up after itself. `power` scales both the
 * count and the spread, so a streak can visibly escalate; `colors` lets a burst borrow the
 * colours of whatever it came out of — crumbs off a berry should be berry-coloured. `round` is
 * the share of bits that come out as discs: paper is a mix, but shell shards are all edges, so a
 * burst of broken egg passes 0.
 */
export function confetti(origin, layer, { power = 1, colors = CONFETTI, round = 0.4 } = {}) {
  if (!origin || !layer || reduceMotion()) return;
  const box = origin.getBoundingClientRect();
  const host = layer.getBoundingClientRect();
  const cx = box.left + box.width / 2 - host.left;
  const cy = box.top + box.height / 2 - host.top;
  const count = Math.round(28 * power);

  const bits = Array.from({ length: count }, () => {
    const el = document.createElement('i');
    el.className = 'confetti-bit';
    const palette = colors.length ? colors : CONFETTI;
    el.style.background = palette[Math.floor(Math.random() * palette.length)];
    if (Math.random() < round) el.style.borderRadius = '50%';
    layer.appendChild(el);
    const angle = Math.random() * Math.PI * 2;
    const speed = (2.6 + Math.random() * 4.2) * power;
    return {
      el,
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4.5,
      spin: (Math.random() - 0.5) * 26,
      rot: Math.random() * 360,
      life: 1,
    };
  });

  let last = performance.now();
  const step = (t) => {
    const dt = Math.min(2.4, (t - last) / 16.67);
    last = t;
    let alive = false;
    for (const b of bits) {
      if (b.life <= 0) continue;
      alive = true;
      b.vy += 0.34 * dt;
      b.vx *= 0.99;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.rot += b.spin * dt;
      b.life -= 0.016 * dt;
      b.el.style.transform = `translate(${b.x}px, ${b.y}px) rotate(${b.rot}deg)`;
      b.el.style.opacity = String(Math.max(0, Math.min(1, b.life * 2)));
      if (b.life <= 0) b.el.remove();
    }
    if (alive) requestAnimationFrame(step);
    else bits.forEach((b) => b.el.remove());
  };
  requestAnimationFrame(step);
}

/** A heart that flies from the clock to the pet — the visible link between answer and reward. */
export function flyHeart(from, to, layer) {
  if (!from || !to || !layer || reduceMotion()) return;
  const host = layer.getBoundingClientRect();
  const a = from.getBoundingClientRect();
  const b = to.getBoundingClientRect();
  const el = document.createElement('i');
  el.className = 'fly-heart';
  el.textContent = '♥';
  layer.appendChild(el);
  const x0 = a.left + a.width / 2 - host.left;
  const y0 = a.top + a.height / 2 - host.top;
  const x1 = b.left + b.width / 2 - host.left;
  const y1 = b.top + b.height / 2 - host.top;
  const anim = el.animate(
    [
      { transform: `translate(${x0}px, ${y0}px) scale(0.4)`, opacity: 0 },
      { transform: `translate(${(x0 + x1) / 2}px, ${Math.min(y0, y1) - 70}px) scale(1.5)`, opacity: 1, offset: 0.5 },
      { transform: `translate(${x1}px, ${y1}px) scale(0.6)`, opacity: 0 },
    ],
    { duration: 900, easing: 'cubic-bezier(.4,0,.5,1)' }
  );
  anim.onfinish = () => el.remove();
}

/**
 * Hearts rising off whatever is being stroked. Same DOM-particle idiom as `flyHeart`, but
 * anchored to one element and repeatable, because stroking a pet is a thing you keep doing
 * rather than a thing that happens once.
 */
export function heartBurst(node, layer, { count = 1, spread = 26 } = {}) {
  if (!node || !layer || reduceMotion()) return;
  const host = layer.getBoundingClientRect();
  const box = node.getBoundingClientRect();
  const cx = box.left + box.width / 2 - host.left;
  const cy = box.top + box.height * 0.35 - host.top;

  for (let i = 0; i < count; i += 1) {
    const el = document.createElement('i');
    el.className = 'fly-heart heart-mote';
    el.textContent = '♥';
    layer.appendChild(el);
    const dx = (Math.random() - 0.5) * spread;
    const rise = 44 + Math.random() * 34;
    const anim = el.animate(
      [
        { transform: `translate(${cx}px, ${cy}px) scale(0.3)`, opacity: 0 },
        { transform: `translate(${cx + dx * 0.6}px, ${cy - rise * 0.55}px) scale(1)`, opacity: 0.95, offset: 0.4 },
        { transform: `translate(${cx + dx}px, ${cy - rise}px) scale(0.7)`, opacity: 0 },
      ],
      { duration: 780 + Math.random() * 320, easing: 'cubic-bezier(.3,.7,.4,1)' }
    );
    anim.onfinish = () => el.remove();
    anim.oncancel = () => el.remove();
  }
}

/**
 * The magician's poof: a cloud that blooms out of `node`, hangs, and thins away. It exists to be
 * looked *through* — the pet is swapped in underneath while the cloud is at its thickest, so the
 * child never sees the egg become the pet, only the pet already standing there as it clears.
 *
 * Same DOM-particle idiom as the hearts, and just as optional: with motion off there is no cloud,
 * and the swap simply happens.
 */
export function smokePuff(node, layer, { power = 1, count = 9 } = {}) {
  if (!node || !layer || reduceMotion()) return;
  const host = layer.getBoundingClientRect();
  const box = node.getBoundingClientRect();
  const cx = box.left + box.width / 2 - host.left;
  const cy = box.top + box.height * 0.55 - host.top;
  // Everything scales off whatever it is covering, so the same cloud works over the little egg on
  // the prompt card and over anything larger it is ever asked to hide.
  const unit = box.width * 0.52;
  const reach = box.width * 0.3 * power;

  for (let i = 0; i < count; i += 1) {
    const el = document.createElement('i');
    el.className = 'smoke-puff';
    el.style.width = `${unit.toFixed(1)}px`;
    el.style.height = `${unit.toFixed(1)}px`;
    el.style.margin = `${(-unit / 2).toFixed(1)}px 0 0 ${(-unit / 2).toFixed(1)}px`;
    layer.appendChild(el);
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.6;
    const dx = Math.cos(angle) * reach * (0.55 + Math.random() * 0.7);
    const dy = Math.sin(angle) * reach * (0.4 + Math.random() * 0.5) - reach * 0.35;
    const size = (0.8 + Math.random() * 0.5) * power;
    const anim = el.animate(
      [
        { transform: `translate(${cx}px, ${cy}px) scale(${0.25 * size})`, opacity: 0 },
        {
          transform: `translate(${cx + dx * 0.45}px, ${cy + dy * 0.45}px) scale(${1.15 * size})`,
          opacity: 0.9,
          offset: 0.28,
        },
        {
          transform: `translate(${cx + dx}px, ${cy + dy - reach * 0.5}px) scale(${1.8 * size})`,
          opacity: 0,
        },
      ],
      {
        duration: 760 + Math.random() * 340,
        delay: Math.random() * 90,
        easing: 'cubic-bezier(.2,.7,.4,1)',
        fill: 'both',
      }
    );
    anim.onfinish = () => el.remove();
    anim.oncancel = () => el.remove();
  }
}

/** A short squash-and-stretch pop — the pet reacting to being fed. */
export function pop(el, { power = 1 } = {}) {
  if (!el) return;
  if (reduceMotion()) return;
  el.animate(
    [
      { transform: 'scale(1, 1)' },
      { transform: `scale(${1 + 0.18 * power}, ${1 - 0.14 * power})`, offset: 0.25 },
      { transform: `scale(${1 - 0.1 * power}, ${1 + 0.16 * power})`, offset: 0.55 },
      { transform: 'scale(1, 1)' },
    ],
    { duration: 520, easing: 'cubic-bezier(.34,1.56,.64,1)' }
  );
}

/** A quick left-right waggle, for a tap on a pet during free-play. */
export function wiggle(el) {
  if (!el || reduceMotion()) return;
  el.animate(
    [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(-7deg)', offset: 0.25 },
      { transform: 'rotate(6deg)', offset: 0.6 },
      { transform: 'rotate(0deg)' },
    ],
    { duration: 460, easing: 'ease-in-out' }
  );
}

export { reduceMotion };
