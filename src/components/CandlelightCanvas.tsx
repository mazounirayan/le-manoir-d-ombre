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

// Blackout timeline (seconds): flame snuffs out, pitch black holds, face flashes close, dark holds, flame returns.
const BLACKOUT_DIE = 0.28;
const BLACKOUT_EYES_IN = 0.86;
const BLACKOUT_EYES_OUT = 1.22;
const BLACKOUT_RELIGHT = 1.88;
const BLACKOUT_END = 2.48;
const FIRST_BLACKOUT_AFTER = 24;
const NEXT_BLACKOUT_AFTER = 150;

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

    const eyesImg = new Image();
    eyesImg.src = '/assets/portrait-heloise.webp';

    const moteCount = prefersReduced ? 14 : 40;
    const motes: DustMote[] = Array.from({ length: moteCount }, (_, i) => ({
      x: ((i * 173) % 1000) * 0.001 * width,
      y: ((i * 293) % 1000) * 0.001 * height,
      vx: (((i * 47) % 100) * 0.01 - 0.5) * 0.18,
      vy: -0.12 - ((i * 31) % 100) * 0.0018,
      size: 0.8 + ((i * 19) % 10) * 0.13,
      phase: i * 0.7,
    }));

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
    let frameCount = 0;
    let gleamNodes: HTMLElement[] = [];
    let candleSeconds = 0;
    let nextBlackoutAt = FIRST_BLACKOUT_AFTER;
    let blackoutClock = -1;
    let forcedBlackout = false;
    let eyesX = 0;
    let eyesY = 0;
    let lastTime = performance.now();

    const triggerBlackout = (isForced: boolean) => {
      blackoutClock = 0;
      forcedBlackout = isForced;
      eyesX = Math.max(180, Math.min(width - 180, candleCoords.x));
      eyesY = Math.max(130, Math.min(height - 130, candleCoords.y - 42));
      manorAudio.playCandleSputter();
    };

    const drawWallMarks = (scrollY: number, lx: number, ly: number, radius: number) => {
      for (const mark of WALL_PHANTOM_MARKS) {
        const mx = mark.xRatio * width;
        const my = mark.docY - scrollY;
        if (my < -120 || my > height + 120) continue;

        const dist = Math.hypot(mx - lx, my - ly);
        const revealR = radius * 0.8;
        if (dist >= revealR) continue;

        const prox = 1 - dist / revealR;
        const alpha = Math.min(0.7, prox * prox * 0.85);
        if (alpha < 0.02) continue;

        ctx.save();
        ctx.translate(mx, my);
        ctx.rotate(((mark.angleDeg || 0) * Math.PI) / 180);

        if (mark.kind === 'tally') {
          const total = mark.count || 5;
          ctx.strokeStyle = `rgba(150, 128, 108, ${alpha.toFixed(3)})`;
          ctx.lineWidth = 1.2;
          ctx.lineCap = 'round';
          for (let i = 0; i < total; i++) {
            const group = Math.floor(i / 5);
            const idx = i % 5;
            const gx = group * 28;
            if (idx < 4) {
              const sx = gx + idx * 5;
              const jitter = ((i * 7) % 5) * 0.4 - 1;
              ctx.beginPath();
              ctx.moveTo(sx + jitter, -9);
              ctx.lineTo(sx - jitter * 0.7, 9 + ((i * 3) % 4));
              ctx.stroke();
            } else {
              ctx.beginPath();
              ctx.moveTo(gx - 3, 7);
              ctx.lineTo(gx + 18, -6);
              ctx.stroke();
            }
          }
          if (mark.text) {
            ctx.font = 'italic 13px "Cormorant Garamond", Georgia, serif';
            ctx.fillStyle = `rgba(170, 150, 128, ${(alpha * 0.85).toFixed(3)})`;
            ctx.fillText(mark.text, 0, 26);
          }
        } else if (mark.kind === 'footprints') {
          ctx.fillStyle = `rgba(120, 108, 96, ${(alpha * 0.5).toFixed(3)})`;
          for (let s = 0; s < 3; s++) {
            const fx = (s % 2 === 0 ? -8 : 8) + s * 3;
            const fy = -s * 24;
            ctx.beginPath();
            ctx.ellipse(fx, fy, 3.6, 7.5, s % 2 === 0 ? -0.12 : 0.12, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(fx, fy + 10.5, 2.6, 3.2, 0, 0, Math.PI * 2);
            ctx.fill();
          }
          if (mark.text) {
            ctx.font = 'italic 13px "Cormorant Garamond", Georgia, serif';
            ctx.fillStyle = `rgba(160, 142, 122, ${(alpha * 0.8).toFixed(3)})`;
            ctx.fillText(mark.text, -24, 30);
          }
        } else if (mark.text) {
          ctx.font = 'italic 15px "Cormorant Garamond", Georgia, serif';
          ctx.fillStyle = `rgba(176, 156, 134, ${(alpha * 0.9).toFixed(3)})`;
          ctx.fillText(mark.text, 0, 0);
        }

        ctx.restore();
      }
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
      const isDeepCandle = modeRef.current === 'candle';

      if (candleCoords.blackoutRequested) {
        candleCoords.blackoutRequested = false;
        if (!prefersReduced && blackoutClock < 0) {
          triggerBlackout(true);
        }
      }

      if (isDeepCandle && candleCoords.hasMoved && !prefersReduced) {
        candleSeconds += dt;
        if (blackoutClock < 0 && candleSeconds >= nextBlackoutAt) {
          nextBlackoutAt = candleSeconds + NEXT_BLACKOUT_AFTER;
          triggerBlackout(false);
        }
      } else if (!isDeepCandle && blackoutClock >= 0 && !forcedBlackout) {
        blackoutClock = -1;
      }

      let lightLevel = 1;
      let eyesAlpha = 0;
      if (blackoutClock >= 0) {
        blackoutClock += dt;
        const b = blackoutClock;
        if (b < BLACKOUT_DIE) {
          lightLevel = 1 - b / BLACKOUT_DIE;
        } else if (b < BLACKOUT_RELIGHT) {
          lightLevel = 0;
          if (b >= BLACKOUT_EYES_IN && b < BLACKOUT_EYES_OUT) {
            const p = (b - BLACKOUT_EYES_IN) / (BLACKOUT_EYES_OUT - BLACKOUT_EYES_IN);
            eyesAlpha = p < 0.14 ? (p / 0.14) * 0.78 : 0.78 * (1 - (p - 0.14) * 0.35);
          }
        } else if (b < BLACKOUT_END) {
          lightLevel = (b - BLACKOUT_RELIGHT) / (BLACKOUT_END - BLACKOUT_RELIGHT);
        } else {
          blackoutClock = -1;
          forcedBlackout = false;
        }
        if (b >= BLACKOUT_EYES_IN && b - dt < BLACKOUT_EYES_IN) {
          manorAudio.playJumpStinger();
        }
      }

      const flicker = prefersReduced
        ? 0
        : Math.sin(t * 8.1) * 7 + Math.sin(t * 18.7) * 4 + Math.cos(t * 31.3) * 2;
      const draftShrink = prefersReduced ? 0 : Math.min(speed * 1.5, 64);
      const baseRadius = isDeepCandle ? 300 : 360;
      const radius = Math.max(0, Math.max(150, baseRadius + flicker - draftShrink) * lightLevel);

      if (!prefersReduced) {
        if (frameCount % 60 === 0) {
          gleamNodes = Array.from(document.querySelectorAll<HTMLElement>('.candle-gleam'));
        }
        frameCount += 1;
        if (frameCount % 3 === 0) {
          for (let i = 0; i < gleamNodes.length; i++) {
            const shimmer = 0.88 + 0.12 * Math.sin(t * 4.2 + i * 1.1);
            const op = Math.max(0.15, shimmer * lightLevel);
            gleamNodes[i].style.opacity = op.toFixed(3);
          }
        }
      }

      if (speed > 26 && !prefersReduced) {
        manorAudio.playCandleSputter();
      }

      const lx = candleCoords.x;
      const ly = candleCoords.y;

      ctx.clearRect(0, 0, width, height);

      const showDarkVeil = isDeepCandle || blackoutClock >= 0;
      const desiredZ = showDarkVeil ? '50' : '20';
      if (canvas.style.zIndex !== desiredZ) {
        canvas.style.zIndex = desiredZ;
      }
      if (showDarkVeil) {
        ctx.save();
        if (radius < 2) {
          ctx.fillStyle = 'rgba(4, 3, 3, 0.992)';
          ctx.fillRect(0, 0, width, height);
        } else if (isDeepCandle) {
          const veil = ctx.createRadialGradient(lx, ly, radius * 0.05, lx, ly, radius);
          veil.addColorStop(0, 'rgba(11, 8, 7, 0)');
          veil.addColorStop(0.3, 'rgba(11, 8, 7, 0.13)');
          veil.addColorStop(0.6, 'rgba(10, 7, 6, 0.5)');
          veil.addColorStop(0.85, 'rgba(8, 6, 5, 0.8)');
          veil.addColorStop(1, 'rgba(5, 4, 4, 0.9)');
          ctx.fillStyle = veil;
          ctx.fillRect(0, 0, width, height);
          if (lightLevel < 1) {
            ctx.fillStyle = `rgba(4, 3, 3, ${((1 - lightLevel) * 0.97).toFixed(3)})`;
            ctx.fillRect(0, 0, width, height);
          }
        } else if (lightLevel < 1) {
          ctx.fillStyle = `rgba(4, 3, 3, ${((1 - lightLevel) * 0.99).toFixed(3)})`;
          ctx.fillRect(0, 0, width, height);
        }
        ctx.restore();
      }

      // Pallid face and dilated hollow eyes emerging two feet away in pitch darkness.
      if (eyesAlpha > 0 && eyesImg.complete && eyesImg.naturalWidth > 0) {
        const sw = eyesImg.naturalWidth * 0.32;
        const sh = eyesImg.naturalHeight * 0.14;
        const sx = eyesImg.naturalWidth * 0.34;
        const sy = eyesImg.naturalHeight * 0.215;
        const dw = Math.min(340, width * 0.78);
        const dh = dw * (sh / sw);
        const jx = Math.sin(time * 0.19) * 1.8;
        const jy = Math.cos(time * 0.23) * 1.4;
        const cx = eyesX + jx;
        const cy = eyesY + jy;

        ctx.save();
        ctx.globalAlpha = eyesAlpha;
        ctx.filter = 'grayscale(0.78) contrast(1.48) brightness(1.06)';
        ctx.drawImage(eyesImg, sx, sy, sw, sh, cx - dw / 2, cy - dh / 2, dw, dh);
        ctx.filter = 'none';

        // Pitch-black dilated void pupils locked straight onto the viewer.
        const eyeOffsets = [
          { u: 0.317, v: 0.482 },
          { u: 0.691, v: 0.446 },
        ];
        for (const eo of eyeOffsets) {
          const px = cx - dw / 2 + eo.u * dw;
          const py = cy - dh / 2 + eo.v * dh;
          const pr = dw * 0.042;
          const voidGrad = ctx.createRadialGradient(px, py, pr * 0.25, px, py, pr);
          voidGrad.addColorStop(0, 'rgba(2, 2, 2, 0.96)');
          voidGrad.addColorStop(0.7, 'rgba(4, 3, 3, 0.82)');
          voidGrad.addColorStop(1, 'rgba(4, 3, 3, 0)');
          ctx.fillStyle = voidGrad;
          ctx.beginPath();
          ctx.arc(px, py, pr, 0, Math.PI * 2);
          ctx.fill();

          // Tiny cold dead pinprick reflection
          ctx.fillStyle = 'rgba(214, 210, 202, 0.55)';
          ctx.beginPath();
          ctx.arc(px - pr * 0.22, py - pr * 0.18, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Melt crop edges smoothly into the surrounding blackness.
        const fade = ctx.createRadialGradient(cx, cy, dh * 0.28, cx, cy, dw * 0.52);
        fade.addColorStop(0, 'rgba(4, 3, 3, 0)');
        fade.addColorStop(0.72, 'rgba(4, 3, 3, 0.55)');
        fade.addColorStop(1, 'rgba(4, 3, 3, 1)');
        ctx.globalAlpha = 1;
        ctx.fillStyle = fade;
        ctx.fillRect(cx - dw, cy - dw, dw * 2, dw * 2);
        ctx.restore();
      }

      if (radius > 2) {
        drawWallMarks(window.scrollY, lx, ly, radius);

        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const aura = ctx.createRadialGradient(lx, ly, 1, lx, ly, radius * 0.75);
        const a = (isDeepCandle ? 0.17 : 0.09) * lightLevel;
        aura.addColorStop(0, `rgba(240, 190, 108, ${a.toFixed(3)})`);
        aura.addColorStop(0.3, `rgba(206, 132, 56, ${(a * 0.5).toFixed(3)})`);
        aura.addColorStop(1, 'rgba(92, 28, 14, 0)');
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(lx, ly, radius * 0.75, 0, Math.PI * 2);
        ctx.fill();

        for (const m of motes) {
          if (!prefersReduced) {
            m.x += m.vx + Math.sin(t * 0.85 + m.phase) * 0.08;
            m.y += m.vy;
            if (m.y < -10) m.y = height + 10;
            if (m.x < -10) m.x = width + 10;
            if (m.x > width + 10) m.x = -10;
          }
          const d = Math.hypot(m.x - lx, m.y - ly);
          if (d < radius * 0.7) {
            const p = 1 - d / (radius * 0.7);
            const tw = prefersReduced ? 0.7 : 0.5 + 0.5 * Math.sin(t * 3.4 + m.phase);
            const ma = p * p * tw * (isDeepCandle ? 0.6 : 0.4) * lightLevel;
            ctx.fillStyle = `rgba(230, 200, 150, ${ma.toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      }

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
      className="pointer-events-none fixed inset-0 z-20 h-full w-full"
    />
  );
}
