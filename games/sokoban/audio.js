// Procedurally generated sound effects — no audio files. The AudioContext is
// created lazily on the first play() call, which always happens inside a user
// gesture handler, so autoplay policies are satisfied.

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
    tone(ac, { type: 'square', freq: 180, endFreq: 140, duration: 0.05, gain: 0.03 });
  },
  push(ac) {
    tone(ac, { type: 'triangle', freq: 120, endFreq: 70, duration: 0.12, gain: 0.12 });
  },
  solve(ac) {
    const notes = [392, 494, 587, 784];
    notes.forEach((freq, i) => {
      tone(ac, { type: 'sine', freq, duration: 0.22, gain: 0.12, delay: i * 0.09 });
    });
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
