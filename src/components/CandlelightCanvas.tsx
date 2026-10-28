import { useEffect, useRef } from 'react';
import { candleCoords } from '../utils/candleState';

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
        candleCoords.x = width * 0.5;
        candleCoords.y = height * 0.38;
        candleCoords.targetX = candleCoords.x;
        candleCoords.targetY = candleCoords.y;
      }
    };
    resize();

    const moteCount = prefersReduced ? 14 : 38;
    const motes: DustMote[] = Array.from({ length: moteCount }, (_, i) => ({
      x: ((i * 173) % 1000) * 0.001 * width,
      y: ((i * 293) % 1000) * 0.001 * height,
      vx: (((i * 47) % 100) * 0.01 - 0.5) * 0.18,
      vy: -0.12 - ((i * 31) % 100) * 0.0018,
      size: 0.9 + ((i * 19) % 10) * 0.14,
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

    const render = (time: number) => {
      const t = time * 0.001;

      if (!candleCoords.hasMoved && !prefersReduced) {
        candleCoords.targetX = width * 0.5 + Math.sin(t * 0.55) * 48;
        candleCoords.targetY = height * 0.38 + Math.cos(t * 0.42) * 28;
      }

      const prevX = candleCoords.x;
      const prevY = candleCoords.y;
      const lerp = prefersReduced ? 0.35 : 0.16;
      candleCoords.x += (candleCoords.targetX - candleCoords.x) * lerp;
      candleCoords.y += (candleCoords.targetY - candleCoords.y) * lerp;
      candleCoords.vx = candleCoords.x - prevX;
      candleCoords.vy = candleCoords.y - prevY;

      const speed = Math.hypot(candleCoords.vx, candleCoords.vy);
      const draftShrink = prefersReduced ? 0 : Math.min(speed * 1.4, 52);
      const harmonicFlicker = prefersReduced
        ? 0
        : Math.sin(t * 7.3) * 6 + Math.sin(t * 17.1) * 3.2 + Math.cos(t * 29.7) * 1.8;

      const isDeepCandle = modeRef.current === 'candle';
      const baseRadius = isDeepCandle ? 305 : 430;
      const outerRadius = Math.max(170, baseRadius + harmonicFlicker - draftShrink);

      ctx.clearRect(0, 0, width, height);

      // In opt-in deep 'candle' mode, render full darkness shroud punctured by torch beam
      if (isDeepCandle) {
        ctx.save();
        const veilAlpha = 0.82;
        const darkness = ctx.createRadialGradient(
          candleCoords.x,
          candleCoords.y,
          outerRadius * 0.08,
          candleCoords.x,
          candleCoords.y,
          outerRadius
        );
        darkness.addColorStop(0, 'rgba(11, 9, 8, 0)');
        darkness.addColorStop(0.44, `rgba(11, 9, 8, ${(veilAlpha * 0.22).toFixed(3)})`);
        darkness.addColorStop(0.78, `rgba(9, 7, 6, ${(veilAlpha * 0.74).toFixed(3)})`);
        darkness.addColorStop(1, `rgba(7, 5, 5, ${veilAlpha.toFixed(3)})`);

        ctx.fillStyle = darkness;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      // Warm beeswax amber aura & airborne dust motes
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const warmGlow = ctx.createRadialGradient(
        candleCoords.x,
        candleCoords.y,
        2,
        candleCoords.x,
        candleCoords.y,
        outerRadius * 0.7
      );
      const glowStrength = isDeepCandle ? 0.14 : 0.11;
      warmGlow.addColorStop(0, `rgba(226, 172, 84, ${glowStrength})`);
      warmGlow.addColorStop(0.45, `rgba(184, 114, 44, ${(glowStrength * 0.42).toFixed(3)})`);
      warmGlow.addColorStop(1, 'rgba(120, 48, 22, 0)');
      ctx.fillStyle = warmGlow;
      ctx.beginPath();
      ctx.arc(candleCoords.x, candleCoords.y, outerRadius * 0.7, 0, Math.PI * 2);
      ctx.fill();

      for (const m of motes) {
        if (!prefersReduced) {
          m.x += m.vx + Math.sin(t * 0.8 + m.phase) * 0.08;
          m.y += m.vy;
          if (m.y < -10) m.y = height + 10;
          if (m.x < -10) m.x = width + 10;
          if (m.x > width + 10) m.x = -10;
        }
        const dist = Math.hypot(m.x - candleCoords.x, m.y - candleCoords.y);
        if (dist < outerRadius * 0.78) {
          const proximity = 1 - dist / (outerRadius * 0.78);
          const twinkle = prefersReduced ? 0.7 : 0.55 + 0.45 * Math.sin(t * 3.1 + m.phase);
          const alpha = proximity * proximity * twinkle * 0.65;
          ctx.fillStyle = `rgba(232, 198, 138, ${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (candleCoords.hasMoved && isDeepCandle) {
        const tiltX = Math.max(-7, Math.min(7, -candleCoords.vx * 0.45));
        const flameH = prefersReduced ? 11 : 11 + Math.sin(t * 19) * 1.4;
        ctx.beginPath();
        ctx.moveTo(candleCoords.x, candleCoords.y + 4);
        ctx.quadraticCurveTo(
          candleCoords.x - 4.2,
          candleCoords.y - flameH * 0.35,
          candleCoords.x + tiltX,
          candleCoords.y - flameH
        );
        ctx.quadraticCurveTo(
          candleCoords.x + 4.2,
          candleCoords.y - flameH * 0.35,
          candleCoords.x,
          candleCoords.y + 4
        );
        ctx.fillStyle = 'rgba(238, 194, 108, 0.78)';
        ctx.fill();
      }

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

  // In default 'lantern' arrival state, sit behind content (z-0) so zero overlay covers text;
  // in opt-in 'candle' torch mode, sit above content (z-30) as a physical darkness shroud.
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 h-full w-full ${
        mode === 'candle' ? 'z-30' : 'z-0'
      }`}
    />
  );
}
