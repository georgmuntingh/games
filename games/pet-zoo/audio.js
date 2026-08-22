// Procedurally generated sound — no audio files. The AudioContext is created lazily on
// the first play(), which always happens inside a user gesture, so autoplay policies are
// satisfied. Same shape as games/sokoban/audio.js.
//
// The most important sound here is `tick`: it fires on every 5-minute snap while a hand
// is being dragged, and it is what makes the clock feel like a mechanism instead of a
// picture.

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

function tone(ac, { type = 'sine', freq, endFreq, duration, gain, delay = 0 }) {
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

const arpeggio = (ac, notes, { type = 'sine', gain = 0.11, spacing = 0.075, duration = 0.2 }) =>
  notes.forEach((freq, i) => tone(ac, { type, freq, duration, gain, delay: i * spacing }));

const SOUNDS = {
  // A dry mechanical click as a hand passes a 5-minute tick.
  tick(ac) {
    tone(ac, { type: 'triangle', freq: 900, endFreq: 640, duration: 0.035, gain: 0.05 });
  },
  grab(ac) {
    tone(ac, { type: 'sine', freq: 420, endFreq: 520, duration: 0.07, gain: 0.05 });
  },
  // Correct: a bright major arpeggio that resolves upward.
  correct(ac) {
    arpeggio(ac, [523, 659, 784, 1047], { gain: 0.12 });
  },
  // Three or more in a row: the same shape, higher and with a sparkle on top.
  streak(ac) {
    arpeggio(ac, [659, 784, 988, 1319, 1568], { gain: 0.11, spacing: 0.062 });
  },
  // Wrong: never a buzzer. Two soft descending notes — a questioning "hm?", not a no.
  oops(ac) {
    tone(ac, { type: 'sine', freq: 400, duration: 0.16, gain: 0.07 });
    tone(ac, { type: 'sine', freq: 330, duration: 0.22, gain: 0.07, delay: 0.14 });
  },
  // Evolution: a rising sweep into a bigger, higher version of the hatch fanfare.
  evolve(ac) {
    tone(ac, { type: 'sawtooth', freq: 160, endFreq: 1200, duration: 0.75, gain: 0.05 });
    arpeggio(ac, [523, 659, 784, 1047, 1319, 1568, 2093], {
      gain: 0.11,
      spacing: 0.085,
      duration: 0.4,
    });
  },
  hatch(ac) {
    tone(ac, { type: 'triangle', freq: 220, endFreq: 880, duration: 0.18, gain: 0.09 });
    arpeggio(ac, [784, 988, 1175, 1568, 2093], { gain: 0.1, spacing: 0.07, duration: 0.26 });
  },
  feed(ac) {
    tone(ac, { type: 'triangle', freq: 300, endFreq: 520, duration: 0.09, gain: 0.09 });
    tone(ac, { type: 'sine', freq: 700, duration: 0.1, gain: 0.06, delay: 0.08 });
  },
  // A pet being petted: a low warm wobble.
  purr(ac) {
    tone(ac, { type: 'sine', freq: 180, endFreq: 150, duration: 0.3, gain: 0.06 });
    tone(ac, { type: 'sine', freq: 150, endFreq: 185, duration: 0.3, gain: 0.05, delay: 0.16 });
  },
  unlock(ac) {
    arpeggio(ac, [523, 659, 784, 1047, 1319, 1568], { gain: 0.11, spacing: 0.1, duration: 0.34 });
  },
  // Bedtime: a descending lullaby, so the break arrives as an ending and not a buzzer.
  nap(ac) {
    arpeggio(ac, [784, 659, 587, 440], { type: 'sine', gain: 0.08, spacing: 0.2, duration: 0.45 });
  },
  wake(ac) {
    arpeggio(ac, [440, 587, 784], { gain: 0.09, spacing: 0.11, duration: 0.26 });
  },
};

export const audio = {
  get muted() {
    return muted;
  },
  setMuted(value) {
    muted = Boolean(value);
  },
  play(name) {
    if (muted || !SOUNDS[name]) return;
    const ac = ensureContext();
    if (ac) SOUNDS[name](ac);
  },
};
