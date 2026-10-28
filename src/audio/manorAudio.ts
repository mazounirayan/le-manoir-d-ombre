// Procedural Web Audio API soundscape for Domaine de Valmorin (1889).
// Zero external MP3 dependencies; strictly opt-in after user gesture.

class ManorAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private windNodes: AudioNode[] = [];
  private clockTimer: number | null = null;
  private tickCount = 0;
  private enabled = false;
  private lastCreakAt = 0;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.0001;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public toggle(): boolean {
    if (this.enabled) {
      this.stop();
      return false;
    }
    this.start();
    return true;
  }

  public start(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.enabled) return;
    this.enabled = true;

    const now = ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(0.0001, now);
    this.masterGain.gain.exponentialRampToValueAtTime(0.32, now + 1.4);

    this.startAutumnWind(ctx);
    this.startComtoiseClock();
  }

  public stop(): void {
    this.enabled = false;
    if (this.clockTimer !== null) {
      window.clearInterval(this.clockTimer);
      this.clockTimer = null;
    }
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(Math.max(0.0001, this.masterGain.gain.value), now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
    }
    window.setTimeout(() => {
      if (!this.enabled) {
        this.teardownWind();
      }
    }, 500);
  }

  private teardownWind(): void {
    for (const node of this.windNodes) {
      try {
        if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
          (node as AudioScheduledSourceNode).stop();
        }
        node.disconnect();
      } catch {
        // Ignore already-stopped nodes
      }
    }
    this.windNodes = [];
  }

  private startAutumnWind(ctx: AudioContext): void {
    this.teardownWind();
    if (!this.masterGain) return;

    // 4-second looping brown-pink noise buffer
    const length = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.025 * white) / 1.025;
      data[i] = lastOut * 2.6;
    }
    // Smooth loop seam
    const fadeSamples = Math.floor(ctx.sampleRate * 0.1);
    for (let i = 0; i < fadeSamples; i++) {
      const t = i / fadeSamples;
      data[i] = data[i] * t + data[length - fadeSamples + i] * (1 - t);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Low stone draft resonance
    const lowFilter = ctx.createBiquadFilter();
    lowFilter.type = 'bandpass';
    lowFilter.frequency.value = 185;
    lowFilter.Q.value = 3.2;

    // High chimney gust whistler
    const highFilter = ctx.createBiquadFilter();
    highFilter.type = 'bandpass';
    highFilter.frequency.value = 510;
    highFilter.Q.value = 7.5;

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.085;
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 125;

    const windGain = ctx.createGain();
    windGain.gain.value = 0.34;
    const whistleGain = ctx.createGain();
    whistleGain.gain.value = 0.08;

    lfo.connect(lfoDepth);
    lfoDepth.connect(highFilter.frequency);

    noise.connect(lowFilter);
    lowFilter.connect(windGain);
    windGain.connect(this.masterGain);

    noise.connect(highFilter);
    highFilter.connect(whistleGain);
    whistleGain.connect(this.masterGain);

    noise.start();
    lfo.start();

    this.windNodes.push(noise, lowFilter, highFilter, lfo, lfoDepth, windGain, whistleGain);
  }

  private startComtoiseClock(): void {
    if (this.clockTimer !== null) {
      window.clearInterval(this.clockTimer);
    }
    this.clockTimer = window.setInterval(() => {
      if (!this.enabled || !this.ctx || !this.masterGain) return;
      this.tickCount += 1;
      // Skip every 13th beat like an arrested escapement
      if (this.tickCount % 13 === 0) return;

      const isTic = this.tickCount % 2 === 0;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const env = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isTic ? 1080 : 820, now);
      osc.frequency.exponentialRampToValueAtTime(isTic ? 280 : 210, now + 0.032);

      filter.type = 'bandpass';
      filter.frequency.value = isTic ? 960 : 740;
      filter.Q.value = 2.4;

      env.gain.setValueAtTime(0.0001, now);
      env.gain.linearRampToValueAtTime(isTic ? 0.075 : 0.055, now + 0.003);
      env.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);

      osc.connect(filter);
      filter.connect(env);
      env.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.075);
    }, 1050);
  }

  public playFloorboardCreak(): void {
    if (!this.enabled || !this.ctx || !this.masterGain) return;
    const nowMs = performance.now();
    if (nowMs - this.lastCreakAt < 2200) return;
    this.lastCreakAt = nowMs;

    const now = this.ctx.currentTime;
    const carrier = this.ctx.createOscillator();
    const mod = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    const env = this.ctx.createGain();

    carrier.type = 'sawtooth';
    carrier.frequency.setValueAtTime(82, now);
    carrier.frequency.linearRampToValueAtTime(118, now + 0.24);
    carrier.frequency.linearRampToValueAtTime(74, now + 0.52);

    mod.type = 'sine';
    mod.frequency.value = 26;
    modGain.gain.value = 18;

    filter.type = 'bandpass';
    filter.frequency.value = 340;
    filter.Q.value = 4.2;

    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(0.06, now + 0.12);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 0.56);

    mod.connect(modGain);
    modGain.connect(carrier.frequency);
    carrier.connect(filter);
    filter.connect(env);
    env.connect(this.masterGain);

    carrier.start(now);
    mod.start(now);
    carrier.stop(now + 0.58);
    mod.stop(now + 0.58);
  }

  public playWaxSealBreak(): void {
    if (!this.enabled || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // 1. Brittle wax crack
    const crackLen = Math.floor(this.ctx.sampleRate * 0.09);
    const crackBuf = this.ctx.createBuffer(1, crackLen, this.ctx.sampleRate);
    const data = crackBuf.getChannelData(0);
    for (let i = 0; i < crackLen; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (crackLen * 0.18));
    }
    const crackSrc = this.ctx.createBufferSource();
    crackSrc.buffer = crackBuf;
    const crackFilter = this.ctx.createBiquadFilter();
    crackFilter.type = 'highpass';
    crackFilter.frequency.value = 1400;
    const crackGain = this.ctx.createGain();
    crackGain.gain.value = 0.22;

    crackSrc.connect(crackFilter);
    crackFilter.connect(crackGain);
    crackGain.connect(this.masterGain);
    crackSrc.start(now);

    // 2. Sepulchral bronze bell partials (D minor)
    const partials = [146.83, 174.61, 220.0, 293.66, 440.0];
    partials.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const env = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const amp = 0.14 / (idx + 1);
      const decay = 2.8 - idx * 0.35;
      env.gain.setValueAtTime(0.0001, now + 0.04);
      env.gain.linearRampToValueAtTime(amp, now + 0.06);
      env.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(env);
      env.connect(this.masterGain);
      osc.start(now + 0.04);
      osc.stop(now + decay + 0.05);
    });
  }

  public playPageTurn(): void {
    if (!this.enabled || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const len = Math.floor(this.ctx.sampleRate * 0.22);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const env = Math.sin((i / len) * Math.PI);
      ch[i] = (Math.random() * 2 - 1) * env * 0.5;
    }

    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.linearRampToValueAtTime(2200, now + 0.2);
    filter.Q.value = 1.6;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.14;

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    src.start(now);
  }

  public playCandleChime(index: number, lit: boolean): void {
    if (!this.enabled || !this.ctx || !this.masterGain) return;
    const scale = [146.83, 155.56, 220.0, 233.08, 293.66];
    const freq = scale[index % scale.length] * (lit ? 1 : 0.5);
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    osc.type = lit ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    if (!lit) {
      osc.frequency.exponentialRampToValueAtTime(freq * 0.88, now + 0.45);
    }

    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(0.11, now + 0.02);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 1.15);

    osc.connect(env);
    env.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 1.2);
  }

  public playPortraitSigh(): void {
    if (!this.enabled || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const len = Math.floor(this.ctx.sampleRate * 0.7);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      ch[i] = (Math.random() * 2 - 1) * Math.sin((i / len) * Math.PI);
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buf;

    const formant = this.ctx.createBiquadFilter();
    formant.type = 'bandpass';
    formant.frequency.setValueAtTime(620, now);
    formant.frequency.exponentialRampToValueAtTime(340, now + 0.68);
    formant.Q.value = 6.0;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.075;

    src.connect(formant);
    formant.connect(gain);
    gain.connect(this.masterGain);
    src.start(now);
  }
}

export const manorAudio = new ManorAudioEngine();
