// Procedurally generated sound effects — no audio files. The AudioContext is
// created lazily on the first play() call, which always happens inside a user
// gesture handler, so autoplay policies are satisfied.

let context = null;
let muted = false;
let noiseBuffer = null;

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

function noise(ac, { duration, gain, cutoff = 900, delay = 0 }) {
  if (!noiseBuffer) {
    const length = ac.sampleRate;
    noiseBuffer = ac.createBuffer(1, length, ac.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  }
  const t0 = ac.currentTime + delay;
  const src = ac.createBufferSource();
  src.buffer = noiseBuffer;
  const filter = ac.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(cutoff, t0);
  filter.frequency.exponentialRampToValueAtTime(60, t0 + duration);
  const amp = ac.createGain();
  amp.gain.setValueAtTime(gain, t0);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  src.connect(filter);
  filter.connect(amp);
  amp.connect(ac.destination);
  src.start(t0);
  src.stop(t0 + duration + 0.02);
}

const SOUNDS = {
  place(ac) {
    tone(ac, { type: 'triangle', freq: 220, endFreq: 150, duration: 0.08, gain: 0.12 });
  },
  boom(ac) {
    noise(ac, { duration: 0.4, gain: 0.35, cutoff: 1000 });
    tone(ac, { type: 'sine', freq: 120, endFreq: 38, duration: 0.35, gain: 0.3 });
  },
  pickup(ac) {
    tone(ac, { type: 'sine', freq: 523, duration: 0.09, gain: 0.12 });
    tone(ac, { type: 'sine', freq: 784, duration: 0.14, gain: 0.12, delay: 0.07 });
  },
  kick(ac) {
    tone(ac, { type: 'square', freq: 200, endFreq: 320, duration: 0.07, gain: 0.08 });
  },
  die(ac) {
    tone(ac, { type: 'sawtooth', freq: 300, endFreq: 70, duration: 0.45, gain: 0.14 });
  },
  enemyDie(ac) {
    tone(ac, { type: 'square', freq: 400, endFreq: 120, duration: 0.2, gain: 0.1 });
  },
  exit(ac) {
    const notes = [392, 494, 587, 784];
    notes.forEach((freq, i) => {
      tone(ac, { type: 'sine', freq, duration: 0.22, gain: 0.12, delay: i * 0.09 });
    });
  },
  roundWin(ac) {
    const notes = [330, 415, 494, 659];
    notes.forEach((freq, i) => {
      tone(ac, { type: 'triangle', freq, duration: 0.2, gain: 0.12, delay: i * 0.08 });
    });
  },
  tick(ac) {
    tone(ac, { type: 'square', freq: 850, duration: 0.04, gain: 0.06 });
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
    if (!ac) return;
    SOUNDS[name](ac);
  },
};
