// All sounds are synthesized with WebAudio — no audio files, no network.
// Created lazily on the first user gesture (browsers block audio before that).
export function createAudio() {
  let ctx = null;
  let master = null;
  let muted = false;
  let sizzleNodes = null;

  function ensure() {
    if (ctx) return true;
    try {
      const AC = window.AudioContext ?? window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.35;
      master.connect(ctx.destination);
      return true;
    } catch {
      return false;
    }
  }

  function tone(freq, dur, type = 'sine', vol = 0.5, slideTo = null, delay = 0) {
    if (!ensure() || muted) return;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo !== null) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  function noise(dur, vol = 0.3, filterFreq = 4000, delay = 0) {
    if (!ensure() || muted) return;
    const t0 = ctx.currentTime + delay;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i += 1) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;
    filter.Q.value = 0.8;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    src.start(t0);
    src.stop(t0 + dur);
  }

  return {
    get muted() {
      return muted;
    },
    toggleMute() {
      muted = !muted;
      if (master) master.gain.value = muted ? 0 : 0.35;
      return muted;
    },
    unlock() {
      ensure();
      if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
    },
    click() {
      tone(660, 0.06, 'triangle', 0.25);
    },
    chop() {
      noise(0.08, 0.4, 1800);
      tone(180, 0.07, 'square', 0.12, 90);
    },
    pickup() {
      tone(520, 0.07, 'sine', 0.3, 760);
    },
    place() {
      tone(330, 0.08, 'triangle', 0.3, 240);
    },
    /** Short sizzle burst when food hits a hot station. */
    sizzleStart() {
      noise(0.5, 0.22, 5200);
      noise(0.4, 0.12, 2600, 0.05);
    },
    /** A looping-ish crackle while something cooks; call stopSizzle when done. */
    sizzleLoop() {
      if (!ensure() || muted || sizzleNodes) return;
      const len = Math.floor(ctx.sampleRate * 1.2);
      const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * (0.5 + 0.5 * Math.sin(i / 900));
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 2400;
      const gain = ctx.createGain();
      gain.gain.value = 0.05;
      src.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      src.start();
      sizzleNodes = { src, gain };
    },
    sizzleStop() {
      if (!sizzleNodes) return;
      try {
        sizzleNodes.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
        sizzleNodes.src.stop(ctx.currentTime + 0.3);
      } catch {
        // Already stopped.
      }
      sizzleNodes = null;
    },
    ding() {
      tone(880, 0.18, 'sine', 0.35);
      tone(1318, 0.28, 'sine', 0.25, null, 0.09);
    },
    coin() {
      tone(988, 0.09, 'square', 0.16);
      tone(1319, 0.22, 'square', 0.16, null, 0.08);
    },
    wrong() {
      tone(220, 0.16, 'sawtooth', 0.2, 160);
      tone(160, 0.2, 'sawtooth', 0.18, 110, 0.1);
    },
    burn() {
      noise(0.35, 0.3, 700);
      tone(140, 0.3, 'sawtooth', 0.2, 70);
    },
    levelUp() {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.16, 'triangle', 0.3, null, i * 0.09));
    },
    endJingle() {
      [659, 784, 988, 784, 1047].forEach((f, i) => tone(f, 0.2, 'triangle', 0.28, null, i * 0.12));
    },
  };
}
