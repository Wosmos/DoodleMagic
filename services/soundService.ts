
let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.25; // Keep volume reasonable
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return { ctx: audioCtx, master: masterGain };
};

// Helper: Play a tone
const playTone = (freq: number, type: OscillatorType, duration: number, startTime: number = 0) => {
  const { ctx, master } = initAudio();
  if (!ctx || !master) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

  gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
  gain.gain.linearRampToValueAtTime(1, ctx.currentTime + startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);

  osc.connect(gain);
  gain.connect(master);

  osc.start(ctx.currentTime + startTime);
  osc.stop(ctx.currentTime + startTime + duration + 0.1);
};

// Helper: Create Noise
const createNoiseBuffer = (ctx: AudioContext) => {
  const bufferSize = ctx.sampleRate * 2; // 2 seconds
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
};

// 1. Color Picker: High pitched "Bloop" / Water drop
export const playBubblePop = () => {
  const { ctx, master } = initAudio();
  if (!ctx || !master) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
  
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

  osc.connect(gain);
  gain.connect(master);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
};

// 2. Tools: Low "Squish" / Thud
export const playSquish = () => {
  const { ctx, master } = initAudio();
  if (!ctx || !master) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(150, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.1);

  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

  osc.connect(gain);
  gain.connect(master);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
};

// 3. Magic: Sparkles (Arpeggio)
export const playMagicSparkle = () => {
  const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C Major arpeggio
  notes.forEach((freq, i) => {
    playTone(freq, 'sine', 0.3, i * 0.08);
  });
};

// 4. Clear/Trash: Crumple Noise
export const playCrumple = () => {
  const { ctx, master } = initAudio();
  if (!ctx || !master) return;

  const buffer = createNoiseBuffer(ctx);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1000, ctx.currentTime);
  filter.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  
  source.start();
  source.stop(ctx.currentTime + 0.4);
};

// 5. Undo/Slide: Whoosh
export const playWhoosh = () => {
  const { ctx, master } = initAudio();
  if (!ctx || !master) return;

  const buffer = createNoiseBuffer(ctx);
  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(200, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.2);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.1);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.25);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(master);

  source.start();
  source.stop(ctx.currentTime + 0.3);
};

// 6. Success: Happy Fanfare
export const playSuccess = () => {
  const { ctx, master } = initAudio();
  if (!ctx || !master) return;
  
  // C Major Chord
  playTone(523.25, 'triangle', 0.4, 0);
  playTone(659.25, 'triangle', 0.4, 0.1);
  playTone(783.99, 'triangle', 0.6, 0.2);
  playTone(1046.50, 'sine', 0.8, 0.3);
};

// 7. Fridge: Mechanical Clunk
export const playLatch = () => {
  const { ctx, master } = initAudio();
  if (!ctx || !master) return;

  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.setValueAtTime(100, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.5, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

  osc.connect(gain);
  gain.connect(master);
  osc.start();
  osc.stop(ctx.currentTime + 0.15);
};
