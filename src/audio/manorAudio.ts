// Procedural Web Audio API soundscape for Domaine de Valmorin (1889).
// Zero external MP3 dependencies; strictly opt-in after user gesture.

class ManorAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private windNodes: AudioNode[] = [];
  private clockTimer: number | null = null;
  private footstepsTimer: number | null = null;
  private tickCount = 0;
  private enabled = false;
  private lastCreakAt = 0;
  private lastSputterAt = 0;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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

  public pauseIfActive(): void {
    if (this.enabled && this.ctx && this.ctx.state === 'running') {
      void this.ctx.suspend();
    }
  }

  public resumeIfActive(): void {
    if (this.enabled && this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
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
    this.masterGain.gain.exponentialRampToValueAtTime(0.34, now + 1.4);

    this.startAutumnWind(ctx);
    this.startComtoiseClock();
    this.startPhantomFootsteps();
  }

  public stop(): void {
    this.enabled = false;
    if (this.clockTimer !== null) {
      window.clearInterval(this.clockTimer);
      this.clockTimer = null;
    }
    if (this.footstepsTimer !== null) {
      window.clearInterval(this.footstepsTimer);
      this.footstepsTimer = null;
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

    const length = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.025 * white) / 1.025;
      data[i] = lastOut * 2.6;
    }
    const fadeSamples = Math.floor(ctx.sampleRate * 0.1);
    for (let i = 0; i < fadeSamples; i++) {
      const t = i / fadeSamples;
      data[i] = data[i] * t + data[length - fadeSamples + i] * (1 - t);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const lowFilter = ctx.createBiquadFilter();
    lowFilter.type = 'bandpass';
    lowFilter.frequency.value = 185;
    lowFilter.Q.value = 3.2;

    const highFilter = ctx.createBiquadFilter();
    highFilter.type = 'bandpass';
    highFilter.frequency.value = 510;
    highFilter.Q.value = 7.5;

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.085;
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 135;

    const windGain = ctx.createGain();
    windGain.gain.value = 0.34;
    const whistleGain = ctx.createGain();
    whistleGain.gain.value = 0.085;

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

      // Every 13th beat: escapement freezes and a muffled double heartbeat throbs under the floor
      if (this.tickCount % 13 === 0) {
        this.playSubfloorHeartbeat();
        return;
      }

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

  private playSubfloorHeartbeat(): void {
    if (!this.enabled || !this.ctx || !this.masterGain) return;
    const baseNow = this.ctx.currentTime;
    const pulses = [
      { offset: 0.02, startHz: 62, endHz: 34, amp: 0.24 },
      { offset: 0.29, startHz: 54, endHz: 30, amp: 0.16 },
    ];
    for (const p of pulses) {
      const t0 = baseNow + p.offset;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const env = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(p.startHz, t0);
      osc.frequency.exponentialRampToValueAtTime(p.endHz, t0 + 0.22);

      filter.type = 'lowpass';
      filter.frequency.value = 110;

      env.gain.setValueAtTime(0.0001, t0);
      env.gain.linearRampToValueAtTime(p.amp, t0 + 0.025);
      env.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.26);

      osc.connect(filter);
      filter.connect(env);
      env.connect(this.masterGain);

      osc.start(t0);
      osc.stop(t0 + 0.28);
    }
  }

  private startPhantomFootsteps(): void {
    if (this.footstepsTimer !== null) {
      window.clearInterval(this.footstepsTimer);
    }
    this.footstepsTimer = window.setInterval(() => {
      if (!this.enabled || !this.ctx || !this.masterGain) return;
      // Three slow steps pacing across the upper mansard floor, stopping without descending
      const pans = [-0.6, -0.1, 0.45];
      pans.forEach((panValue, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const t0 = this.ctx.currentTime + idx * 0.92;

        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const env = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(98 - idx * 6, t0);
        osc.frequency.exponentialRampToValueAtTime(42, t0 + 0.14);

        filter.type = 'lowpass';
        filter.frequency.value = 210;

        env.gain.setValueAtTime(0.0001, t0);
        env.gain.linearRampToValueAtTime(0.095, t0 + 0.015);
        env.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22);

        osc.connect(filter);
        filter.connect(env);

        if (typeof this.ctx.createStereoPanner === 'function') {
          const panner = this.ctx.createStereoPanner();
          panner.pan.setValueAtTime(panValue, t0);
          env.connect(panner);
          panner.connect(this.masterGain);
        } else {
          env.connect(this.masterGain);
        }

        osc.start(t0);
        osc.stop(t0 + 0.24);
      });
    }, 15500);
  }

  public playCandleSputter(): void {
    if (!this.enabled || !this.ctx || !this.masterGain) return;
    const nowMs = performance.now();
    if (nowMs - this.lastSputterAt < 850) return;
    this.lastSputterAt = nowMs;

    const now = this.ctx.currentTime;
    const len = Math.floor(this.ctx.sampleRate * 0.045);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      ch[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.22));
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 1950;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.09;

    src.connect(hp);
    hp.connect(gain);
    gain.connect(this.masterGain);
    src.start(now);
  }

  public playGhostBreath(): void {
    if (!this.enabled || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const len = Math.floor(this.ctx.sampleRate * 1.35);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      const env = Math.sin((i / len) * Math.PI);
      ch[i] = (Math.random() * 2 - 1) * env * env;
    }

    const src = this.ctx.createBufferSource();
    src.buffer = buf;

    const f1 = this.ctx.createBiquadFilter();
    f1.type = 'bandpass';
    f1.frequency.setValueAtTime(520, now);
    f1.frequency.exponentialRampToValueAtTime(290, now + 1.3);
    f1.Q.value = 5.5;

    const f2 = this.ctx.createBiquadFilter();
    f2.type = 'bandpass';
    f2.frequency.setValueAtTime(1480, now);
    f2.frequency.exponentialRampToValueAtTime(980, now + 1.3);
    f2.Q.value = 7.0;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.11;

    src.connect(f1);
    f1.connect(gain);
    src.connect(f2);
    f2.connect(gain);
    gain.connect(this.masterGain);

    src.start(now);
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
    gain.gain.value = 0.085;

    src.connect(formant);
    formant.connect(gain);
    gain.connect(this.masterGain);
    src.start(now);
  }

  public playSuddenKnock(): void {
    if (!this.enabled || !this.ctx || !this.masterGain) return;
    const baseNow = this.ctx.currentTime;
    const offsets = [0, 0.14];

    for (let k = 0; k < offsets.length; k++) {
      const t0 = baseNow + offsets[k];
      const amp = k === 0 ? 0.32 : 0.24;

      const osc = this.ctx.createOscillator();
      const bodyFilter = this.ctx.createBiquadFilter();
      const env = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(175 - k * 14, t0);
      osc.frequency.exponentialRampToValueAtTime(58, t0 + 0.065);

      bodyFilter.type = 'lowpass';
      bodyFilter.frequency.value = 420;

      env.gain.setValueAtTime(0.0001, t0);
      env.gain.linearRampToValueAtTime(amp, t0 + 0.003);
      env.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.085);

      osc.connect(bodyFilter);
      bodyFilter.connect(env);
      env.connect(this.masterGain);
      osc.start(t0);
      osc.stop(t0 + 0.095);

      const clickLen = Math.floor(this.ctx.sampleRate * 0.024);
      const clickBuf = this.ctx.createBuffer(1, clickLen, this.ctx.sampleRate);
      const ch = clickBuf.getChannelData(0);
      for (let i = 0; i < clickLen; i++) {
        ch[i] = (Math.random() * 2 - 1) * Math.exp(-i / (clickLen * 0.2));
      }
      const clickSrc = this.ctx.createBufferSource();
      clickSrc.buffer = clickBuf;
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 920;
      bp.Q.value = 2.8;
      const clickGain = this.ctx.createGain();
      clickGain.gain.value = amp * 0.55;

      clickSrc.connect(bp);
      bp.connect(clickGain);
      clickGain.connect(this.masterGain);
      clickSrc.start(t0);
    }
  }

  public playJumpStinger(): void {
    if (!this.enabled || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Low wooden door slam
    const sub = this.ctx.createOscillator();
    const subEnv = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(86, now);
    sub.frequency.exponentialRampToValueAtTime(26, now + 0.42);
    subEnv.gain.setValueAtTime(0.0001, now);
    subEnv.gain.linearRampToValueAtTime(0.52, now + 0.005);
    subEnv.gain.exponentialRampToValueAtTime(0.0001, now + 0.56);
    sub.connect(subEnv);
    subEnv.connect(this.masterGain);
    sub.start(now);
    sub.stop(now + 0.58);

    // Dissonant minor-second and tritone cluster
    const cluster = [311.13, 329.63, 466.16, 659.25];
    const screechFilter = this.ctx.createBiquadFilter();
    screechFilter.type = 'bandpass';
    screechFilter.frequency.setValueAtTime(2250, now);
    screechFilter.frequency.exponentialRampToValueAtTime(540, now + 0.85);
    screechFilter.Q.value = 3.6;

    const clusterGain = this.ctx.createGain();
    clusterGain.gain.setValueAtTime(0.0001, now);
    clusterGain.gain.linearRampToValueAtTime(0.18, now + 0.012);
    clusterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.92);

    screechFilter.connect(clusterGain);
    clusterGain.connect(this.masterGain);

    for (const freq of cluster) {
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.linearRampToValueAtTime(freq * 0.96, now + 0.9);
      osc.connect(screechFilter);
      osc.start(now);
      osc.stop(now + 0.94);
    }

    // Sharp intake of breath right beside the ear
    const gaspLen = Math.floor(this.ctx.sampleRate * 0.26);
    const gaspBuf = this.ctx.createBuffer(1, gaspLen, this.ctx.sampleRate);
    const ch = gaspBuf.getChannelData(0);
    for (let i = 0; i < gaspLen; i++) {
      ch[i] = (Math.random() * 2 - 1) * Math.exp(-i / (gaspLen * 0.35));
    }
    const gaspSrc = this.ctx.createBufferSource();
    gaspSrc.buffer = gaspBuf;
    const gaspFilter = this.ctx.createBiquadFilter();
    gaspFilter.type = 'bandpass';
    gaspFilter.frequency.value = 1620;
    gaspFilter.Q.value = 4.2;
    const gaspGain = this.ctx.createGain();
    gaspGain.gain.value = 0.24;

    gaspSrc.connect(gaspFilter);
    gaspFilter.connect(gaspGain);
    gaspGain.connect(this.masterGain);
    gaspSrc.start(now);
  }

  private lastPenScratchAt = 0;
  public playPenScratch(): void {
    if (!this.enabled || !this.ctx || !this.masterGain) return;
    const nowMs = performance.now();
    if (nowMs - this.lastPenScratchAt < 75) return;
    this.lastPenScratchAt = nowMs;

    const now = this.ctx.currentTime;
    const len = Math.floor(this.ctx.sampleRate * 0.05);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      ch[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.28));
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 3200 + (Math.random() * 800 - 400);
    filter.Q.value = 4.0;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.07;

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    src.start(now);
  }

  private lastWatchTickAt = 0;
  public playPocketWatch(): void {
    if (!this.enabled || !this.ctx || !this.masterGain) return;
    const nowMs = performance.now();
    if (nowMs - this.lastWatchTickAt < 220) return;
    this.lastWatchTickAt = nowMs;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2600, now);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.018);

    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(0.045, now + 0.002);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 0.024);

    osc.connect(env);
    env.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.03);
  }

  public playFuneralBell(): void {
    if (!this.enabled || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const fundamental = 73.42; // D2 (Glas funèbre en ré mineur)
    const partials = [
      { ratio: 1.0, gain: 0.26, decay: 4.6 },
      { ratio: 2.0, gain: 0.16, decay: 3.4 },
      { ratio: 2.76, gain: 0.11, decay: 2.4 },
      { ratio: 3.4, gain: 0.07, decay: 1.8 },
      { ratio: 4.16, gain: 0.04, decay: 1.1 },
    ];

    for (const p of partials) {
      const osc = this.ctx.createOscillator();
      const env = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(fundamental * p.ratio, now);
      env.gain.setValueAtTime(0.0001, now);
      env.gain.linearRampToValueAtTime(p.gain, now + 0.008);
      env.gain.exponentialRampToValueAtTime(0.0001, now + p.decay);
      osc.connect(env);
      env.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + p.decay + 0.05);
    }
  }
}

export const manorAudio = new ManorAudioEngine();
