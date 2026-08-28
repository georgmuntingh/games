// Procedurally generated sound effects — no audio files. The AudioContext
// is created lazily on the first play() call inside a user gesture, so
// autoplay policies are satisfied (same pattern as sokoban).

let context = null;
let muted = false;

function ensureContext() {
  if (!context) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    context = new AC();
  }
  if (context.state === 'suspended') context.resume();
  return context;
}

function tone(ac, { type, freq, endFreq, duration, gain, delay = 0 }) {
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t0 + duration);
  amp.gain.setValueAtTime(gain, t0);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(amp);
  amp.connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

const SOUNDS = {
  step(ac) {
    tone(ac, { type: 'square', freq: 170, endFreq: 130, duration: 0.04, gain: 0.02 });
  },
  push(ac) {
    tone(ac, { type: 'triangle', freq: 110, endFreq: 70, duration: 0.1, gain: 0.1 });
  },
  heart(ac) {
    tone(ac, { type: 'sine', freq: 660, duration: 0.09, gain: 0.1 });
    tone(ac, { type: 'sine', freq: 880, duration: 0.12, gain: 0.1, delay: 0.07 });
  },
  bonus(ac) {
    [660, 880, 1100].forEach((freq, i) => {
      tone(ac, { type: 'square', freq, duration: 0.08, gain: 0.06, delay: i * 0.06 });
    });
  },
  shot(ac) {
    tone(ac, { type: 'sawtooth', freq: 900, endFreq: 300, duration: 0.12, gain: 0.08 });
  },
  dryFire(ac) {
    tone(ac, { type: 'square', freq: 140, duration: 0.05, gain: 0.05 });
  },
  egg(ac) {
    tone(ac, { type: 'triangle', freq: 500, endFreq: 900, duration: 0.15, gain: 0.1 });
  },
  hatch(ac) {
    tone(ac, { type: 'triangle', freq: 800, endFreq: 350, duration: 0.18, gain: 0.09 });
  },
  splash(ac) {
    tone(ac, { type: 'sine', freq: 320, endFreq: 90, duration: 0.25, gain: 0.12 });
  },
  sizzle(ac) {
    tone(ac, { type: 'sawtooth', freq: 220, endFreq: 60, duration: 0.3, gain: 0.1 });
  },
  open(ac) {
    [392, 523, 659].forEach((freq, i) => {
      tone(ac, { type: 'sine', freq, duration: 0.18, gain: 0.1, delay: i * 0.08 });
    });
  },
  clear(ac) {
    [392, 494, 587, 784, 988].forEach((freq, i) => {
      tone(ac, { type: 'sine', freq, duration: 0.22, gain: 0.11, delay: i * 0.09 });
    });
  },
  die(ac) {
    [440, 349, 262, 196].forEach((freq, i) => {
      tone(ac, { type: 'triangle', freq, duration: 0.16, gain: 0.11, delay: i * 0.1 });
    });
  },
  door(ac) {
    tone(ac, { type: 'triangle', freq: 260, endFreq: 520, duration: 0.16, gain: 0.09 });
  },
};

export const audio = {
  get muted() {
    return muted;
  },
  setMuted(value) {
    muted = value;
  },
  play(name) {
    if (muted || !SOUNDS[name]) return;
    const ac = ensureContext();
    if (ac) SOUNDS[name](ac);
  },
};
