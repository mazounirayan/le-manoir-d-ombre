import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { EyeGazeIcon, FlipFrameIcon } from './GothicIcons';
import { ANCESTOR_PORTRAITS, type AncestorPortrait } from '../data/valmorinData';
import { candleCoords } from '../utils/candleState';
import { manorAudio } from '../audio/manorAudio';

interface PortraitFrameProps {
  portrait: AncestorPortrait;
  index: number;
}

// Time a portrait must be watched before it mutates once scrolled out of sight.
const WATCHED_BEFORE_CHANGE = 2.2;

export function PortraitFrame({ portrait, index }: PortraitFrameProps) {
  const shouldReduceMotion = useReducedMotion();
  const articleRef = useRef<HTMLElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const heatBarRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: articleRef,
    offset: ['start end', 'end start'],
  });
  const plateDriftY = useTransform(
    scrollYProgress,
    [0, 1],
    shouldReduceMotion ? ['0%', '0%'] : index % 2 === 0 ? ['-1.6%', '1.6%'] : ['1.4%', '-1.4%']
  );

  const [showVerso, setShowVerso] = useState(false);
  const [isWarmed, setIsWarmed] = useState(false);
  const [altered, setAltered] = useState(false);
  const alteredRef = useRef(false);
  const watchedRef = useRef(0);
  const isHoveredRef = useRef(false);
  const heatRef = useRef(0);
  const sighedRef = useRef(false);

  const mirrored = altered && portrait.alteration === 'mirrored';

  useEffect(() => {
    if (showVerso) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rafId = 0;
    let lastTime = performance.now();

    let curKx = 0;
    let curKy = 0;
    let wasCandleNear = false;
    let blinkClock = -1;
    let nextIdleBlinkAt = performance.now() + 7500 + index * 3100;
    let closedLid = 1;
    let eyesSnappedOpen = false;

    let cachedW = 0;
    let cachedH = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.008, (now - lastTime) * 0.001));
      lastTime = now;

      const img = imgRef.current;
      const canvas = canvasRef.current;

      if (img && canvas && img.complete && img.naturalWidth > 0) {
        const rect = img.getBoundingClientRect();
        const vh = window.innerHeight;
        const inViewport = rect.bottom > -40 && rect.top < vh + 40;
        const fullyOut = rect.bottom < 0 || rect.top > vh;
        const mostlyIn = rect.top > -rect.height * 0.25 && rect.bottom < vh + rect.height * 0.25;

        // Change blindness: once watched, the portrait changes while nobody looks at it.
        if (portrait.alteration !== 'none' && !alteredRef.current) {
          if (mostlyIn) watchedRef.current += dt;
          if (fullyOut && watchedRef.current >= WATCHED_BEFORE_CHANGE) {
            alteredRef.current = true;
            setAltered(true);
          }
        }

        if (inViewport && rect.width > 20 && rect.height > 20) {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          const dispW = rect.width;
          const dispH = rect.height;
          const pxW = Math.round(dispW * dpr);
          const pxH = Math.round(dispH * dpr);

          if (cachedW !== pxW || cachedH !== pxH) {
            cachedW = pxW;
            cachedH = pxH;
            canvas.width = pxW;
            canvas.height = pxH;
          }

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, dispW, dispH);

            const isAltered = alteredRef.current;
            const isMirrored = isAltered && portrait.alteration === 'mirrored';

            let sumX = 0;
            let sumY = 0;
            for (const e of portrait.eyes) {
              const fx = isMirrored ? 1 - e.xPct / 100 : e.xPct / 100;
              sumX += rect.left + fx * dispW;
              sumY += rect.top + (e.yPct / 100) * dispH;
            }
            const bridgeX = sumX / portrait.eyes.length;
            const bridgeY = sumY / portrait.eyes.length;

            const dx = candleCoords.x - bridgeX;
            const dy = candleCoords.y - bridgeY;
            const dist = Math.hypot(dx, dy) || 1;

            const isCandleNear = dist < 245;
            if (wasCandleNear && !isCandleNear && !prefersReduced && blinkClock < 0) {
              blinkClock = 0;
            }
            wasCandleNear = isCandleNear;

            if (!prefersReduced && blinkClock < 0 && now >= nextIdleBlinkAt && !isCandleNear) {
              blinkClock = 0;
              nextIdleBlinkAt = now + 9500 + ((index * 2700 + Math.floor(now)) % 6500);
            }

            let blinkClosure = 0;
            if (blinkClock >= 0) {
              blinkClock += dt;
              const dur = 0.19;
              if (blinkClock >= dur) {
                blinkClock = -1;
              } else {
                blinkClosure = Math.sin((blinkClock / dur) * Math.PI);
              }
            }

            // Séverin, once altered: eyelids shut until the candle comes close, then they snap wide open.
            if (isAltered && portrait.alteration === 'closed-eyes') {
              if (candleCoords.hasMoved && dist < 160) {
                if (!eyesSnappedOpen) {
                  eyesSnappedOpen = true;
                  manorAudio.playSuddenKnock();
                }
                closedLid = Math.max(0, closedLid - dt * 16);
              } else if (!eyesSnappedOpen) {
                closedLid = 1;
              }
              blinkClosure = Math.max(blinkClosure, closedLid);
            }

            const maxKx = prefersReduced ? 0.12 : portrait.id === 'jumeaux' ? 0.27 : 0.34;
            const maxKy = prefersReduced ? 0.08 : 0.22;
            const reach = Math.min(dist / 290, 1);

            let screenKx = (dx / dist) * reach * maxKx;
            const targetKy = (dy / dist) * reach * maxKy;
            if (isAltered && portrait.alteration === 'avoids-light') screenKx = -screenKx;
            const targetKx = isMirrored ? -screenKx : screenKx;

            const lerp = prefersReduced ? 0.25 : 0.12;
            curKx += (targetKx - curKx) * lerp;
            curKy += (targetKy - curKy) * lerp;

            const nearFlame = isHoveredRef.current || (candleCoords.hasMoved && dist < 195);
            if (nearFlame) {
              heatRef.current = Math.min(1, heatRef.current + dt * 0.45);
              if (heatRef.current > 0.6 && !sighedRef.current) {
                sighedRef.current = true;
                setIsWarmed(true);
                manorAudio.playPortraitSigh();
              }
            } else {
              heatRef.current = Math.max(0, heatRef.current - dt * 0.28);
            }
            if (heatBarRef.current) {
              heatBarRef.current.style.transform = `scaleX(${heatRef.current.toFixed(3)})`;
            }

            const dilation = Math.max(0, (heatRef.current - 0.3) / 0.7) * portrait.dilation;

            const natW = img.naturalWidth;
            const natH = img.naturalHeight;
            const strips = 14;
            const k = Math.max(-0.42, Math.min(0.42, curKx));
            const invU = (u: number) => (u < k ? -1 + (u + 1) / (1 + k) : (u - k) / (1 - k));

            portrait.eyes.forEach((eye) => {
              const dcx = (eye.xPct / 100) * dispW;
              const dcy = (eye.yPct / 100) * dispH;
              const drx = (eye.rxPct / 100) * dispW;
              const dry = (eye.ryPct / 100) * dispH;

              const scx = (eye.xPct / 100) * natW;
              const scy = (eye.yPct / 100) * natH;
              const srx = (eye.rxPct / 100) * natW;
              const sry = (eye.ryPct / 100) * natH;

              ctx.save();
              ctx.beginPath();
              ctx.ellipse(dcx, dcy, drx, dry, 0, 0, Math.PI * 2);
              ctx.clip();

              for (let i = 0; i < strips; i++) {
                const u0 = -1 + (2 * i) / strips;
                const u1 = -1 + (2 * (i + 1)) / strips;
                const dx0 = dcx + u0 * drx;
                const dw = (u1 - u0) * drx + 0.45;
                const sx0 = scx + invU(u0) * srx;
                const sw = Math.max(0.5, scx + invU(u1) * srx - sx0);
                const um = 0.5 * (u0 + u1);
                const vShift = curKy * sry * Math.cos(um * Math.PI * 0.5);
                ctx.drawImage(
                  img,
                  sx0,
                  scy - sry * 1.25 - vShift,
                  sw,
                  sry * 2.5,
                  dx0,
                  dcy - dry * 1.25,
                  dw,
                  dry * 2.5
                );
              }

              const lash = ctx.createLinearGradient(dcx, dcy - dry, dcx, dcy + dry * 0.35);
              lash.addColorStop(0, 'rgba(10, 7, 5, 0.46)');
              lash.addColorStop(0.45, 'rgba(14, 9, 7, 0.14)');
              lash.addColorStop(1, 'rgba(14, 9, 7, 0)');
              ctx.fillStyle = lash;
              ctx.fillRect(dcx - drx, dcy - dry, drx * 2, dry * 1.4);

              if (dilation > 0.01) {
                const px = dcx + k * drx * 0.95;
                const py = dcy + curKy * dry * 0.8;
                const pr = drx * (0.18 + dilation * 0.98);
                const pupil = ctx.createRadialGradient(px, py, pr * 0.2, px, py, pr);
                pupil.addColorStop(0, `rgba(3, 2, 2, ${(0.58 + dilation * 0.41).toFixed(3)})`);
                pupil.addColorStop(0.72, `rgba(5, 3, 3, ${(0.44 + dilation * 0.5).toFixed(3)})`);
                pupil.addColorStop(1, 'rgba(8, 5, 4, 0)');
                ctx.fillStyle = pupil;
                ctx.beginPath();
                ctx.arc(px, py, pr, 0, Math.PI * 2);
                ctx.fill();
              }

              if (blinkClosure > 0.01) {
                const [lr, lg, lb] = eye.lidRgb;
                const lidBottom = dcy - dry + dry * 2.15 * blinkClosure;
                const lid = ctx.createLinearGradient(dcx, dcy - dry, dcx, lidBottom);
                lid.addColorStop(0, `rgb(${Math.max(0, lr - 22)}, ${Math.max(0, lg - 18)}, ${Math.max(0, lb - 14)})`);
                lid.addColorStop(0.82, `rgb(${lr}, ${lg}, ${lb})`);
                lid.addColorStop(1, 'rgb(20, 13, 10)');
                ctx.fillStyle = lid;
                ctx.fillRect(dcx - drx - 1, dcy - dry - 1, drx * 2 + 2, lidBottom - (dcy - dry) + 1);
              }

              ctx.restore();
            });
          }
        }
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [portrait, index, showVerso]);

  const displayName = mirrored && portrait.alteredName ? portrait.alteredName : portrait.name;

  return (
    <article ref={articleRef} className={`${portrait.layoutClass} flex flex-col`}>
      <div
        onPointerEnter={() => {
          isHoveredRef.current = true;
        }}
        onPointerLeave={() => {
          isHoveredRef.current = false;
        }}
        className="frame-double relative overflow-hidden rounded-xs bg-surface p-3 sm:p-4"
      >
        {!showVerso ? (
          <div className={`relative w-full overflow-hidden bg-paper-deep ${portrait.aspectClass}`}>
            <motion.div style={{ y: plateDriftY }} className={`relative h-full w-full ${mirrored ? '-scale-x-100' : ''}`}>
              <img
                ref={imgRef}
                src={portrait.imageSrc}
                alt={portrait.alt}
                width={portrait.width}
                height={portrait.height}
                loading={index === 0 ? undefined : 'lazy'}
                className={`h-full w-full object-cover ${isWarmed ? 'contrast-125 sepia-[.16]' : ''}`}
              />
              <canvas
                ref={canvasRef}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full"
              />
            </motion.div>

            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-paper-deep">
              <div
                ref={heatBarRef}
                className="h-full w-full origin-left scale-x-0 bg-accent transition-transform duration-150"
              />
            </div>
          </div>
        ) : (
          <div className={`flex w-full flex-col justify-between bg-paper-deep p-6 sm:p-8 ${portrait.aspectClass}`}>
            <div>
              <h4 className="type-title text-ink">Revers</h4>
              <p className="mt-2 text-sm text-muted">
                <code className="text-candle">{portrait.cote}</code> · {portrait.medium}
              </p>
              <p className="mt-6 max-w-[48ch] text-base italic text-ink">{portrait.versoConfession}</p>
            </div>
            <p className="mt-6 pt-4 text-sm text-muted">{portrait.notaryNote}</p>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-[56ch]">
          <h3 className="type-title text-ink">{displayName}</h3>
          <p className="mt-1 text-sm text-muted">
            {portrait.title} (<time className="candle-gleam inline-block tabular-nums">{portrait.years}</time>)
          </p>
          <p className="mt-3 max-w-[54ch] text-base italic text-ink">{portrait.epitaph}</p>
          {isWarmed && !showVerso && <p className="mt-2 text-sm text-candle">{portrait.horrorPhenomenon}</p>}
        </div>

        <button
          type="button"
          onClick={() => {
            manorAudio.playPageTurn();
            setShowVerso((prev) => !prev);
          }}
          className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xs border border-line-strong bg-surface px-3 py-2 text-sm text-ink transition-colors duration-150 hover:border-candle hover:bg-surface-raised active:bg-paper-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-candle disabled:opacity-40"
        >
          {showVerso ? (
            <>
              <EyeGazeIcon className="h-4 w-4" />
              <span>Face peinte</span>
            </>
          ) : (
            <>
              <FlipFrameIcon className="h-4 w-4" />
              <span>Revers</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
}

export function PortraitGallery() {
  return (
    <section id="galerie" aria-labelledby="galerie-heading" className="bg-paper-deep py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        <header className="max-w-[60ch]">
          <h2 id="galerie-heading" className="type-headline text-ink">
            La galerie des ancêtres
          </h2>
          <p className="mt-4 max-w-[52ch] text-base text-ink">
            Quatre portraits, salon nord. Quand on les a trouvés, ils étaient tournés face au mur.
          </p>
          <p className="mt-2 text-base text-muted">Approchez la bougie.</p>
        </header>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-12">
          {ANCESTOR_PORTRAITS.map((portrait, index) => (
            <PortraitFrame key={portrait.id} portrait={portrait} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
