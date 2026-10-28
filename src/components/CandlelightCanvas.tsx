import { useEffect, useRef } from 'react';
import { candleCoords } from '../utils/candleState';
import { WALL_PHANTOM_MARKS } from '../data/valmorinData';
import { manorAudio } from '../audio/manorAudio';

export type LightingMode = 'candle' | 'lantern';

interface CandlelightCanvasProps {
  mode: LightingMode;
}

interface DustMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  phase: number;
}

interface SmokeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  maxAge: number;
  radius: number;
  seed: number;
}

interface EmberSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

export function CandlelightCanvas({ mode }: CandlelightCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modeRef = useRef<LightingMode>(mode);
  modeRef.current = mode;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!candleCoords.hasMoved) {
        candleCoords.x = width * 0.52;
        candleCoords.y = height * 0.44;
        candleCoords.targetX = candleCoords.x;
        candleCoords.targetY = candleCoords.y;
      }
    };
    resize();

    const moteCount = prefersReduced ? 16 : 46;
    const motes: DustMote[] = Array.from({ length: moteCount }, (_, i) => ({
      x: ((i * 173) % 1000) * 0.001 * width,
      y: ((i * 293) % 1000) * 0.001 * height,
      vx: (((i * 47) % 100) * 0.01 - 0.5) * 0.2,
      vy: -0.14 - ((i * 31) % 100) * 0.002,
      size: 0.8 + ((i * 19) % 10) * 0.15,
      phase: i * 0.7,
    }));

    const smokePool: SmokeParticle[] = [];
    const sparks: EmberSpark[] = [];

    // 2-mass spring-damper flame tip state for realistic aerodynamic lag & whip
    let tipBendX = 0;
    let tipVelX = 0;
    let flameStretchY = 0;
    let smokeAccum = 0;

    const onPointerMove = (e: PointerEvent) => {
      candleCoords.targetX = e.clientX;
      candleCoords.targetY = e.clientY;
      candleCoords.hasMoved = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        candleCoords.targetX = e.touches[0].clientX;
        candleCoords.targetY = e.touches[0].clientY;
        candleCoords.hasMoved = true;
      }
    };

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    let rafId = 0;
    let lastTime = performance.now();

    const drawWallPhantoms = (scrollY: number, lightX: number, lightY: number, lightRadius: number) => {
      ctx.save();
      for (const mark of WALL_PHANTOM_MARKS) {
        const mx = mark.xRatio * width;
        const my = mark.docY - scrollY;
        if (my < -120 || my > height + 120) continue;

        const dist = Math.hypot(mx - lightX, my - lightY);
        const revealR = lightRadius * 0.82;
        if (dist >= revealR) continue;

        const prox = 1 - dist / revealR;
        const alpha = Math.min(0.82, prox * prox * 0.92);
        if (alpha < 0.02) continue;

        ctx.save();
        ctx.translate(mx, my);
        ctx.rotate(((mark.angleDeg || 0) * Math.PI) / 180);

        if (mark.kind === 'tally') {
          const total = mark.count || 5;
          ctx.strokeStyle = `rgba(176, 54, 42, ${alpha.toFixed(3)})`;
          ctx.lineWidth = 1.35;
          ctx.lineCap = 'round';
          for (let i = 0; i < total; i++) {
            const group = Math.floor(i / 5);
            const idxInGroup = i % 5;
            const gx = group * 28;
            if (idxInGroup < 4) {
              const sx = gx + idxInGroup * 5;
              const jitter = ((i * 7) % 5) * 0.4 - 1;
              ctx.beginPath();
              ctx.moveTo(sx + jitter, -9);
              ctx.lineTo(sx - jitter * 0.7, 9 + ((i * 3) % 4));
              ctx.stroke();
            } else {
              // Diagonal 5th slash across the four scratches
              ctx.beginPath();
              ctx.moveTo(gx - 3, 7);
              ctx.lineTo(gx + 18, -6);
              ctx.stroke();
            }
          }
          if (mark.text) {
            ctx.font = 'italic 13px "Cormorant Garamond", Georgia, serif';
            ctx.fillStyle = `rgba(212, 166, 106, ${(alpha * 0.85).toFixed(3)})`;
            ctx.fillText(mark.text, 0, 25);
          }
        } else if (mark.kind === 'footprints') {
          ctx.fillStyle = `rgba(128, 38, 30, ${(alpha * 0.55).toFixed(3)})`;
          for (let s = 0; s < 3; s++) {
            const fx = (s % 2 === 0 ? -9 : 9) + s * 4;
            const fy = -s * 26;
            ctx.beginPath();
            ctx.ellipse(fx, fy, 4.5, 9.5, s % 2 === 0 ? -0.12 : 0.12, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(fx, fy + 13, 3.3, 4.2, 0, 0, Math.PI * 2);
            ctx.fill();
          }
          if (mark.text) {
            ctx.font = 'italic 13px "Cormorant Garamond", Georgia, serif';
            ctx.fillStyle = `rgba(198, 142, 92, ${(alpha * 0.82).toFixed(3)})`;
            ctx.fillText(mark.text, -28, 32);
          }
        } else if (mark.text) {
          ctx.font = 'italic 15px "Cormorant Garamond", Georgia, serif';
          ctx.fillStyle = `rgba(196, 74, 56, ${(alpha * 0.9).toFixed(3)})`;
          ctx.fillText(mark.text, 0, 0);
        }

        ctx.restore();
      }
      ctx.restore();
    };

    const render = (time: number) => {
      const dt = Math.min(0.05, Math.max(0.008, (time - lastTime) * 0.001));
      lastTime = time;
      const t = time * 0.001;

      if (!candleCoords.hasMoved && !prefersReduced) {
        candleCoords.targetX = width * 0.52 + Math.sin(t * 0.52) * 34;
        candleCoords.targetY = height * 0.44 + Math.cos(t * 0.39) * 20;
      }

      const prevX = candleCoords.x;
      const prevY = candleCoords.y;
      const lerp = prefersReduced ? 0.35 : 0.2;
      candleCoords.x += (candleCoords.targetX - candleCoords.x) * lerp;
      candleCoords.y += (candleCoords.targetY - candleCoords.y) * lerp;
      candleCoords.vx = candleCoords.x - prevX;
      candleCoords.vy = candleCoords.y - prevY;

      const speed = Math.hypot(candleCoords.vx, candleCoords.vy);

      // Trigger subtle tallow sputter sound when swept abruptly through a cold draft
      if (speed > 24 && !prefersReduced) {
        manorAudio.playCandleSputter();
      }

      // Corridor draft gust (periodic eerie cold draft every ~11s)
      const gustWave = prefersReduced
        ? 0
        : Math.pow(Math.max(0, Math.sin(t * 0.56) * Math.sin(t * 1.37)), 4) * 9.5;

      // Spring-damper physics for flame tip aerodynamic bend
      const targetBend = prefersReduced
        ? 0
        : Math.max(-20, Math.min(20, -candleCoords.vx * 0.85 + gustWave + Math.sin(t * 6.8) * 1.4));
      const springForce = (targetBend - tipBendX) * 150;
      tipVelX = (tipVelX + springForce * dt) * Math.exp(-10.5 * dt);
      tipBendX += tipVelX * dt;

      const targetStretch = prefersReduced
        ? 0
        : Math.max(-7, Math.min(6, candleCoords.vy * 0.32 - Math.min(speed * 0.22, 6.5)));
      flameStretchY += (targetStretch - flameStretchY) * 0.22;

      const harmonicFlicker = prefersReduced
        ? 0
        : Math.sin(t * 8.1) * 7.5 +
          Math.sin(t * 18.7) * 4.2 +
          Math.cos(t * 31.3) * 2.1 -
          gustWave * 2.6;

      const draftShrink = prefersReduced ? 0 : Math.min(speed * 1.55, 68);
      const isDeepCandle = modeRef.current === 'candle';
      const baseRadius = isDeepCandle ? 315 : 370;
      const outerRadius = Math.max(155, baseRadius + harmonicFlicker - draftShrink);

      // Anchor wick base slightly below cursor so the bright flame tip kisses the pointer hotspot
      const wickBaseX = candleCoords.x;
      const wickBaseY = candleCoords.y + 17;
      const wickTopX = wickBaseX + tipBendX * 0.14;
      const wickTopY = wickBaseY - 6.5;

      ctx.clearRect(0, 0, width, height);

      // 1. Deep nocturnal darkness shroud in 'candle' mode
      if (isDeepCandle) {
        ctx.save();
        const veilAlpha = 0.905;
        const darkness = ctx.createRadialGradient(
          wickTopX,
          wickTopY - 6,
          outerRadius * 0.05,
          wickTopX,
          wickTopY - 6,
          outerRadius
        );
        darkness.addColorStop(0, 'rgba(11, 8, 7, 0)');
        darkness.addColorStop(0.28, `rgba(11, 8, 7, ${(veilAlpha * 0.14).toFixed(3)})`);
        darkness.addColorStop(0.58, `rgba(10, 7, 6, ${(veilAlpha * 0.54).toFixed(3)})`);
        darkness.addColorStop(0.84, `rgba(8, 6, 5, ${(veilAlpha * 0.86).toFixed(3)})`);
        darkness.addColorStop(1, `rgba(5, 4, 4, ${veilAlpha.toFixed(3)})`);

        ctx.fillStyle = darkness;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      // 2. Hidden horror scratch marks, footprints & ghostly stone whispers revealed ONLY by candlelight
      drawWallPhantoms(window.scrollY, wickTopX, wickTopY - 6, outerRadius);

      // 3. Multi-layered warm beeswax & tallow illumination aura
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      const outerAura = ctx.createRadialGradient(
        wickTopX,
        wickTopY - 6,
        1,
        wickTopX,
        wickTopY - 6,
        outerRadius * 0.78
      );
      const auraAlpha = isDeepCandle ? 0.19 : 0.105;
      outerAura.addColorStop(0, `rgba(248, 196, 104, ${auraAlpha})`);
      outerAura.addColorStop(0.26, `rgba(218, 138, 52, ${(auraAlpha * 0.56).toFixed(3)})`);
      outerAura.addColorStop(0.62, `rgba(156, 68, 26, ${(auraAlpha * 0.2).toFixed(3)})`);
      outerAura.addColorStop(1, 'rgba(92, 28, 14, 0)');

      ctx.fillStyle = outerAura;
      ctx.beginPath();
      ctx.arc(wickTopX, wickTopY - 6, outerRadius * 0.78, 0, Math.PI * 2);
      ctx.fill();

      // Airborne dust & ash motes illuminated by the cone
      for (const m of motes) {
        if (!prefersReduced) {
          m.x += m.vx + Math.sin(t * 0.85 + m.phase) * 0.09;
          m.y += m.vy;
          if (m.y < -10) m.y = height + 10;
          if (m.x < -10) m.x = width + 10;
          if (m.x > width + 10) m.x = -10;
        }
        const dist = Math.hypot(m.x - wickTopX, m.y - (wickTopY - 6));
        if (dist < outerRadius * 0.75) {
          const proximity = 1 - dist / (outerRadius * 0.75);
          const twinkle = prefersReduced ? 0.7 : 0.5 + 0.5 * Math.sin(t * 3.4 + m.phase);
          const alpha = proximity * proximity * twinkle * (isDeepCandle ? 0.72 : 0.48);
          ctx.fillStyle = `rgba(238, 202, 142, ${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // 4. Physical 19th-Century Tallow Taper, Dripping Wax, Wick, 4-Zone Flame, Smoke & Sparks
      const flameBreath = prefersReduced
        ? 0
        : Math.sin(t * 14.3) * 1.4 + Math.cos(t * 26.9) * 0.85;
      const flameHeight = Math.max(12, 21.5 + flameBreath + flameStretchY);
      const flameHalfW = Math.max(3.8, 5.6 - Math.abs(tipBendX) * 0.07 + Math.sin(t * 19.1) * 0.32);
      const flameTipX = wickTopX + tipBendX;
      const flameTipY = wickTopY - flameHeight;

      // Spawn curling soot smoke from the flame tip
      if (!prefersReduced) {
        smokeAccum += dt * (speed > 8 ? 22 : 10);
        while (smokeAccum >= 1) {
          smokeAccum -= 1;
          if (smokePool.length < 38) {
            smokePool.push({
              x: flameTipX + (Math.random() - 0.5) * 1.8,
              y: flameTipY - 2,
              vx: tipBendX * 0.25 + (Math.random() - 0.5) * 4,
              vy: -22 - Math.random() * 14,
              age: 0,
              maxAge: 0.9 + Math.random() * 0.75,
              radius: 1.6 + Math.random() * 1.4,
              seed: Math.random() * Math.PI * 2,
            });
          }
        }

        // Spawn sputtering tallow micro-embers on sudden drafts or natural crackle
        if ((speed > 13 && Math.random() < 0.38) || Math.random() < 0.018) {
          if (sparks.length < 18) {
            sparks.push({
              x: wickTopX + (Math.random() - 0.5) * 2.5,
              y: wickTopY - 3,
              vx: tipBendX * 1.4 + (Math.random() - 0.5) * 34,
              vy: -38 - Math.random() * 44,
              life: 0,
              maxLife: 0.35 + Math.random() * 0.4,
              size: 0.85 + Math.random() * 0.9,
            });
          }
        }
      }

      // Render curling smoke plume behind/above flame
      ctx.save();
      for (let i = smokePool.length - 1; i >= 0; i--) {
        const s = smokePool[i];
        s.age += dt;
        if (s.age >= s.maxAge) {
          smokePool.splice(i, 1);
          continue;
        }
        const p = s.age / s.maxAge;
        s.x += (s.vx + Math.sin(t * 4.2 + s.seed + p * 5) * 12) * dt;
        s.y += s.vy * dt;
        const r = s.radius + p * 8.5;
        const a = Math.sin(p * Math.PI) * (isDeepCandle ? 0.14 : 0.09);
        const sg = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r);
        sg.addColorStop(0, `rgba(168, 152, 136, ${a.toFixed(3)})`);
        sg.addColorStop(1, 'rgba(72, 62, 56, 0)');
        ctx.fillStyle = sg;
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 4A. Tallow Taper Body & Subsurface-Lit Molten Wax Crown (fading cleanly downward)
      ctx.save();
      const taperW = 13.5;
      const taperH = 40;
      const taperLeft = wickBaseX - taperW * 0.5;
      const taperTop = wickBaseY + 0.5;

      // Cylindrical wax body shaded horizontally + subsurface top glow
      const bodyGrad = ctx.createLinearGradient(taperLeft, taperTop, taperLeft, taperTop + taperH);
      const waxOpacity = isDeepCandle ? 0.92 : 0.72;
      bodyGrad.addColorStop(0, `rgba(232, 186, 118, ${waxOpacity})`);
      bodyGrad.addColorStop(0.24, `rgba(176, 132, 84, ${(waxOpacity * 0.85).toFixed(3)})`);
      bodyGrad.addColorStop(0.62, `rgba(98, 68, 44, ${(waxOpacity * 0.48).toFixed(3)})`);
      bodyGrad.addColorStop(1, 'rgba(34, 22, 16, 0)');

      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.moveTo(taperLeft, taperTop + 2);
      ctx.quadraticCurveTo(wickBaseX, taperTop + 5, taperLeft + taperW, taperTop + 2);
      ctx.lineTo(taperLeft + taperW + 0.8, taperTop + taperH);
      ctx.lineTo(taperLeft - 0.8, taperTop + taperH);
      ctx.closePath();
      ctx.fill();

      // Solidified wax drip rivulets & slowly rolling molten wax bead on flanks
      const dripRollingY = prefersReduced ? 14 : 6 + ((t * 3.2) % 24);
      ctx.fillStyle = `rgba(226, 184, 122, ${(waxOpacity * 0.76).toFixed(3)})`;
      // Left frozen tallow rivulet
      ctx.beginPath();
      ctx.moveTo(taperLeft + 1.2, taperTop + 2.5);
      ctx.quadraticCurveTo(taperLeft - 1.4, taperTop + 11, taperLeft + 0.8, taperTop + 19);
      ctx.arc(taperLeft + 1.2, taperTop + 19.5, 1.35, Math.PI, 0, true);
      ctx.quadraticCurveTo(taperLeft + 2.4, taperTop + 11, taperLeft + 2.6, taperTop + 3);
      ctx.closePath();
      ctx.fill();

      // Right rolling hot wax droplet
      ctx.beginPath();
      ctx.moveTo(taperLeft + taperW - 2.4, taperTop + 3);
      ctx.lineTo(taperLeft + taperW - 0.8, taperTop + dripRollingY);
      ctx.arc(taperLeft + taperW - 1.5, taperTop + dripRollingY + 0.8, 1.3, 0, Math.PI * 2);
      ctx.fill();

      // Concave molten wax pool meniscus glowing from flame above
      const poolGrad = ctx.createRadialGradient(
        wickBaseX,
        taperTop + 1.5,
        0.5,
        wickBaseX,
        taperTop + 1.8,
        taperW * 0.55
      );
      poolGrad.addColorStop(0, `rgba(255, 224, 148, ${waxOpacity})`);
      poolGrad.addColorStop(0.65, `rgba(214, 148, 72, ${(waxOpacity * 0.9).toFixed(3)})`);
      poolGrad.addColorStop(1, `rgba(148, 96, 48, ${(waxOpacity * 0.75).toFixed(3)})`);
      ctx.fillStyle = poolGrad;
      ctx.beginPath();
      ctx.ellipse(wickBaseX, taperTop + 1.8, taperW * 0.5, 2.3, 0, 0, Math.PI * 2);
      ctx.fill();

      // 4B. Braided Charred Cotton Wick & Incandescent Red Ember Tip
      ctx.strokeStyle = 'rgba(24, 16, 13, 0.95)';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(wickBaseX, taperTop + 1.4);
      ctx.quadraticCurveTo(
        wickBaseX + tipBendX * 0.05,
        wickBaseY - 3.2,
        wickTopX,
        wickTopY
      );
      ctx.stroke();

      // Glowing ember dot at wick tip
      const emberPulse = prefersReduced ? 0.88 : 0.75 + 0.25 * Math.sin(t * 21.0);
      ctx.fillStyle = `rgba(255, 96, 28, ${emberPulse.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(wickTopX, wickTopY + 0.4, 1.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 4C. Four-Zone Physical Combustion Flame
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      // Zone 0: Tight thermal bloom directly around flame heart
      const heartY = wickTopY - flameHeight * 0.36;
      const heartX = wickTopX + tipBendX * 0.35;
      const bloomGrad = ctx.createRadialGradient(heartX, heartY, 1, heartX, heartY, flameHeight * 1.75);
      bloomGrad.addColorStop(0, 'rgba(255, 214, 128, 0.46)');
      bloomGrad.addColorStop(0.38, 'rgba(232, 134, 42, 0.18)');
      bloomGrad.addColorStop(1, 'rgba(160, 52, 18, 0)');
      ctx.fillStyle = bloomGrad;
      ctx.beginPath();
      ctx.arc(heartX, heartY, flameHeight * 1.75, 0, Math.PI * 2);
      ctx.fill();

      // Zone 1: Cobalt-violet oxygen combustion base hugging lower wick
      const blueBaseGrad = ctx.createRadialGradient(
        wickTopX,
        wickTopY + 0.5,
        0.4,
        wickTopX,
        wickTopY - 1.5,
        flameHalfW * 1.15
      );
      blueBaseGrad.addColorStop(0, 'rgba(96, 152, 255, 0.62)');
      blueBaseGrad.addColorStop(0.65, 'rgba(58, 98, 224, 0.28)');
      blueBaseGrad.addColorStop(1, 'rgba(38, 64, 180, 0)');
      ctx.fillStyle = blueBaseGrad;
      ctx.beginPath();
      ctx.ellipse(wickTopX, wickTopY - 0.5, flameHalfW * 0.92, 4.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Zone 2: Outer Saffron-Amber Luminous Mantle (asymmetric aerodynamic Bezier teardrop)
      const mantleGrad = ctx.createLinearGradient(wickTopX, wickTopY + 2, flameTipX, flameTipY);
      mantleGrad.addColorStop(0, 'rgba(214, 112, 32, 0.55)');
      mantleGrad.addColorStop(0.28, 'rgba(248, 176, 64, 0.92)');
      mantleGrad.addColorStop(0.76, 'rgba(252, 206, 102, 0.88)');
      mantleGrad.addColorStop(1, 'rgba(236, 118, 34, 0.25)');

      const ctrlLeftX = wickTopX - flameHalfW * 1.32 + tipBendX * 0.22;
      const ctrlRightX = wickTopX + flameHalfW * 1.32 + tipBendX * 0.22;
      const waistY = wickTopY - flameHeight * 0.34;

      ctx.fillStyle = mantleGrad;
      ctx.beginPath();
      ctx.moveTo(wickTopX, wickTopY + 2.2);
      ctx.bezierCurveTo(
        wickTopX - flameHalfW * 1.05,
        wickTopY + 1.2,
        ctrlLeftX,
        waistY,
        flameTipX,
        flameTipY
      );
      ctx.bezierCurveTo(
        ctrlRightX,
        waistY,
        wickTopX + flameHalfW * 1.05,
        wickTopY + 1.2,
        wickTopX,
        wickTopY + 2.2
      );
      ctx.closePath();
      ctx.fill();

      // Zone 3: Incandescent White-Hot Inner Core
      const coreTipX = wickTopX + tipBendX * 0.68;
      const coreTipY = wickTopY - flameHeight * 0.72;
      const coreHalfW = flameHalfW * 0.54;
      const coreGrad = ctx.createLinearGradient(wickTopX, wickTopY, coreTipX, coreTipY);
      coreGrad.addColorStop(0, 'rgba(255, 224, 152, 0.45)');
      coreGrad.addColorStop(0.32, 'rgba(255, 250, 232, 0.97)');
      coreGrad.addColorStop(1, 'rgba(255, 236, 176, 0.82)');

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.moveTo(wickTopX, wickTopY - 0.6);
      ctx.quadraticCurveTo(
        wickTopX - coreHalfW * 1.25 + tipBendX * 0.18,
        wickTopY - flameHeight * 0.28,
        coreTipX,
        coreTipY
      );
      ctx.quadraticCurveTo(
        wickTopX + coreHalfW * 1.25 + tipBendX * 0.18,
        wickTopY - flameHeight * 0.28,
        wickTopX,
        wickTopY - 0.6
      );
      ctx.closePath();
      ctx.fill();

      // Sputtering tallow micro-sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const sp = sparks[i];
        sp.life += dt;
        if (sp.life >= sp.maxLife) {
          sparks.splice(i, 1);
          continue;
        }
        sp.vx *= 0.96;
        sp.vy -= 18 * dt;
        sp.x += sp.vx * dt;
        sp.y += sp.vy * dt;
        const rem = 1 - sp.life / sp.maxLife;
        ctx.fillStyle = `rgba(255, ${Math.floor(140 + rem * 95)}, 56, ${rem.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size * rem, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // Subtle dark pyrolysis pocket right above the wick ember
      ctx.save();
      ctx.fillStyle = 'rgba(32, 16, 9, 0.34)';
      ctx.beginPath();
      ctx.ellipse(
        wickTopX + tipBendX * 0.08,
        wickTopY - 2.1,
        flameHalfW * 0.28,
        2.4,
        tipBendX * 0.02,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();

      rafId = window.requestAnimationFrame(render);
    };

    rafId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 h-full w-full"
    />
  );
}
