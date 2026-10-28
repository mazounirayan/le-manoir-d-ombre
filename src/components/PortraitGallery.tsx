import { useEffect, useRef, useState } from 'react';
import { EyeGazeIcon, FlipFrameIcon, FlameIcon } from './GothicIcons';
import { ANCESTOR_PORTRAITS, type AncestorPortrait } from '../data/valmorinData';
import { candleCoords } from '../utils/candleState';
import { manorAudio } from '../audio/manorAudio';
import { HiddenInscription } from './HiddenInscription';

interface PortraitFrameProps {
  portrait: AncestorPortrait;
  index: number;
}

export function PortraitFrame({ portrait, index }: PortraitFrameProps) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const heatBarRef = useRef<HTMLDivElement | null>(null);

  const [showVerso, setShowVerso] = useState(false);
  const [isWarmed, setIsWarmed] = useState(false);
  const isHoveredRef = useRef(false);
  const heatRef = useRef(0);
  const sighedRef = useRef(false);

  // 60 FPS rubber-sheet real-iris eye tracking, peripheral blinking & weeping bitumen tears
  useEffect(() => {
    if (showVerso) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rafId = 0;
    let lastTime = performance.now();

    // Smoothly interpolated normalized gaze ratios kx, ky in [-1, 1]
    let curKx = 0;
    let curKy = 0;
    let wasCandleNear = false;
    let blinkClock = -1; // >= 0 while blinking (0..0.19s)
    let nextIdleBlinkAt = performance.now() + 7500 + index * 3100;

    let cachedW = 0;
    let cachedH = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.008, (now - lastTime) * 0.001));
      lastTime = now;

      const img = imgRef.current;
      const canvas = canvasRef.current;

      if (img && canvas && img.complete && img.naturalWidth > 0) {
        const rect = img.getBoundingClientRect();
        const inViewport = rect.bottom > -40 && rect.top < window.innerHeight + 40;

        if (inViewport && rect.width > 20 && rect.height > 20) {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          const dispW = rect.width;
          const dispH = rect.height;
          const targetPxW = Math.round(dispW * dpr);
          const targetPxH = Math.round(dispH * dpr);

          if (cachedW !== targetPxW || cachedH !== targetPxH) {
            cachedW = targetPxW;
            cachedH = targetPxH;
            canvas.width = targetPxW;
            canvas.height = targetPxH;
          }

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, dispW, dispH);

            // Compute average eye bridge center on screen for unified binocular gaze
            let sumX = 0;
            let sumY = 0;
            for (const e of portrait.eyes) {
              sumX += rect.left + (e.xPct / 100) * dispW;
              sumY += rect.top + (e.yPct / 100) * dispH;
            }
            const bridgeX = sumX / portrait.eyes.length;
            const bridgeY = sumY / portrait.eyes.length;

            const dx = candleCoords.x - bridgeX;
            const dy = candleCoords.y - bridgeY;
            const dist = Math.hypot(dx, dy) || 1;

            const isCandleNear = dist < 245;
            // Trigger involuntary blink right as the visitor moves their candle away!
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
              const blinkDur = 0.19;
              if (blinkClock >= blinkDur) {
                blinkClock = -1;
                blinkClosure = 0;
              } else {
                blinkClosure = Math.sin((blinkClock / blinkDur) * Math.PI);
              }
            }

            const maxKx = prefersReduced ? 0.12 : portrait.id === 'jumeaux' ? 0.27 : 0.34;
            const maxKy = prefersReduced ? 0.08 : 0.22;
            const reach = Math.min(dist / 290, 1);

            // Subtle micro-tremor when flame is held uncomfortably close to their eyes
            const tremorX =
              !prefersReduced && isCandleNear ? Math.sin(now * 0.019 + index) * 0.022 : 0;
            const targetKx = (dx / dist) * reach * maxKx + tremorX;
            const targetKy = (dy / dist) * reach * maxKy;

            const gazeLerp = prefersReduced ? 0.25 : 0.12;
            curKx += (targetKx - curKx) * gazeLerp;
            curKy += (targetKy - curKy) * gazeLerp;

            const natW = img.naturalWidth;
            const natH = img.naturalHeight;
            const strips = 14;
            const flameProx = Math.max(0, 1 - dist / 390);

            // Warm canvas varnish when hovered OR when candle flame is held very close
            const nearFlame = isHoveredRef.current || (candleCoords.hasMoved && dist < 195);
            if (nearFlame) {
              heatRef.current = Math.min(1, heatRef.current + dt * 0.58);
              if (heatRef.current > 0.6 && !sighedRef.current) {
                sighedRef.current = true;
                setIsWarmed(true);
                manorAudio.playPortraitSigh();
              }
            } else {
              heatRef.current = Math.max(0, heatRef.current - dt * 0.36);
            }

            if (heatBarRef.current) {
              heatBarRef.current.style.transform = `scaleX(${heatRef.current.toFixed(3)})`;
            }

            // Render each calibrated eye socket with continuous 14-strip rubber-sheet UV displacement
            portrait.eyes.forEach((eye, eyeIdx) => {
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

              const k = Math.max(-0.42, Math.min(0.42, curKx));

              for (let i = 0; i < strips; i++) {
                const u0 = -1 + (2 * i) / strips;
                const u1 = -1 + (2 * (i + 1)) / strips;
                const dx0 = dcx + u0 * drx;
                const dx1 = dcx + u1 * drx;
                const dw = dx1 - dx0 + 0.45; // tiny sub-pixel overlap prevents hairline gaps

                const invU = (u: number) =>
                  u < k ? -1 + (u + 1) / (1 + k) : (u - k) / (1 - k);

                const su0 = invU(u0);
                const su1 = invU(u1);
                const sx0 = scx + su0 * srx;
                const sx1 = scx + su1 * srx;
                const sw = Math.max(0.5, sx1 - sx0);

                const um = 0.5 * (u0 + u1);
                const vShiftSrc = curKy * sry * Math.cos(um * Math.PI * 0.5);

                const sy0 = scy - sry * 1.25 - vShiftSrc;
                const sh = sry * 2.5;
                const dy0 = dcy - dry * 1.25;
                const dh = dry * 2.5;

                ctx.drawImage(img, sx0, sy0, sw, sh, dx0, dy0, dw, dh);
              }

              // Subtle upper-eyelid lash cast shadow so shifted iris stays tucked beneath lashes
              const lashShadow = ctx.createLinearGradient(dcx, dcy - dry, dcx, dcy + dry * 0.35);
              lashShadow.addColorStop(0, 'rgba(10, 7, 5, 0.46)');
              lashShadow.addColorStop(0.45, 'rgba(14, 9, 7, 0.14)');
              lashShadow.addColorStop(1, 'rgba(14, 9, 7, 0)');
              ctx.fillStyle = lashShadow;
              ctx.fillRect(dcx - drx, dcy - dry, drx * 2, dry * 1.4);

              // Wet-cornea amber flame reflection proportional to candle proximity
              if (flameProx > 0.05 && blinkClosure < 0.5) {
                const glintX = dcx + curKx * drx * 1.05 + (dx / dist) * drx * 0.14;
                const glintY = dcy + curKy * dry * 0.9 - dry * 0.16;
                const glintR = Math.max(1.1, drx * 0.13);
                const gg = ctx.createRadialGradient(glintX, glintY, 0, glintX, glintY, glintR * 1.8);
                gg.addColorStop(0, `rgba(255, 224, 152, ${(flameProx * 0.72).toFixed(3)})`);
                gg.addColorStop(1, 'rgba(224, 142, 54, 0)');
                ctx.fillStyle = gg;
                ctx.beginPath();
                ctx.arc(glintX, glintY, glintR * 1.8, 0, Math.PI * 2);
                ctx.fill();
              }

              // Peripheral / uncanny eyelid blink
              if (blinkClosure > 0.01) {
                const [lr, lg, lb] = eye.lidRgb;
                const lidBottom = dcy - dry + dry * 2.15 * blinkClosure;
                const lidGrad = ctx.createLinearGradient(dcx, dcy - dry, dcx, lidBottom);
                lidGrad.addColorStop(0, `rgb(${Math.max(0, lr - 22)}, ${Math.max(0, lg - 18)}, ${Math.max(0, lb - 14)})`);
                lidGrad.addColorStop(0.82, `rgb(${lr}, ${lg}, ${lb})`);
                lidGrad.addColorStop(1, 'rgb(20, 13, 10)');
                ctx.fillStyle = lidGrad;
                ctx.fillRect(dcx - drx - 1, dcy - dry - 1, drx * 2 + 2, lidBottom - (dcy - dry) + 1);
              }

              ctx.restore();

              // Horror detail: weeping dark carmine-bitumen tears when candle flame heats the canvas
              if (heatRef.current > 0.45) {
                const tearProgress = (heatRef.current - 0.45) / 0.55;
                const tearLen = tearProgress * (portrait.id === 'heloise' ? 32 : 20) * (1 + (eyeIdx % 2) * 0.22);
                const startX = dcx + (eyeIdx % 2 === 0 ? -drx * 0.12 : drx * 0.12);
                const startY = dcy + dry * 0.92;

                ctx.save();
                const tearGrad = ctx.createLinearGradient(startX, startY, startX, startY + tearLen);
                tearGrad.addColorStop(0, 'rgba(64, 10, 12, 0.75)');
                tearGrad.addColorStop(0.7, 'rgba(116, 18, 22, 0.86)');
                tearGrad.addColorStop(1, 'rgba(148, 26, 28, 0.92)');

                ctx.strokeStyle = tearGrad;
                ctx.lineWidth = Math.max(1.2, drx * 0.14);
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.quadraticCurveTo(
                  startX + (eyeIdx % 2 === 0 ? -0.8 : 0.8),
                  startY + tearLen * 0.55,
                  startX,
                  startY + tearLen
                );
                ctx.stroke();

                // Wet candlelit specular bead on the hanging tear droplet
                ctx.fillStyle = `rgba(246, 188, 118, ${(tearProgress * 0.65).toFixed(3)})`;
                ctx.beginPath();
                ctx.arc(startX - 0.3, startY + tearLen - 0.4, Math.max(0.8, drx * 0.09), 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
              }
            });

            // Twins Ferrotype horror anomaly: silver-bath phantom flicker & collodion scratches
            if (portrait.id === 'jumeaux' && heatRef.current > 0.38 && !prefersReduced) {
              const anomaly = (heatRef.current - 0.38) / 0.62;
              const flicker = 0.5 + 0.5 * Math.sin(now * 0.017);
              ctx.save();
              // Ghostly dark veil pulsing over Cyprien (left twin) as if vanishing from the silver plate
              const ghostGrad = ctx.createRadialGradient(
                dispW * 0.41,
                dispH * 0.52,
                dispW * 0.02,
                dispW * 0.41,
                dispH * 0.52,
                dispW * 0.16
              );
              ghostGrad.addColorStop(0, `rgba(18, 15, 13, ${(anomaly * flicker * 0.58).toFixed(3)})`);
              ghostGrad.addColorStop(1, 'rgba(18, 15, 13, 0)');
              ctx.fillStyle = ghostGrad;
              ctx.fillRect(dispW * 0.24, dispH * 0.2, dispW * 0.34, dispH * 0.72);

              // Fine vertical collodion plate scratches
              ctx.strokeStyle = `rgba(218, 198, 168, ${(anomaly * 0.28).toFixed(3)})`;
              ctx.lineWidth = 0.75;
              for (let s = 0; s < 5; s++) {
                const sx = dispW * (0.31 + s * 0.085) + Math.sin(now * 0.004 + s) * 1.5;
                ctx.beginPath();
                ctx.moveTo(sx, dispH * 0.14);
                ctx.lineTo(sx, dispH * 0.86);
                ctx.stroke();
              }
              ctx.restore();
            }
          }
        }
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [portrait, index, showVerso]);

  return (
    <article className={`${portrait.layoutClass} flex flex-col`} data-ui="portrait-frame">
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
            <img
              ref={imgRef}
              src={portrait.imageSrc}
              alt={portrait.alt}
              width={portrait.width}
              height={portrait.height}
              loading={index === 0 ? undefined : 'lazy'}
              className={`h-full w-full object-cover transition-transform duration-200 ${
                isWarmed ? 'contrast-125 sepia-[.16]' : ''
              }`}
            />

            {/* Real-iris rubber-sheet warp, peripheral blink & weeping bitumen tears canvas */}
            <canvas
              ref={canvasRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full"
            />

            {/* Candle heat varnish exposure gauge */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-paper-deep"
            >
              <div
                ref={heatBarRef}
                className="h-full w-full origin-left scale-x-0 bg-accent transition-transform duration-150"
              />
            </div>
          </div>
        ) : (
          <div
            className={`flex w-full flex-col justify-between bg-paper-deep p-6 sm:p-8 ${portrait.aspectClass}`}
          >
            <div>
              <h4 className="type-title text-ink">Revers du châssis</h4>
              <p className="mt-2 text-xs text-muted">
                Cote notariale : <code className="text-candle">{portrait.cote}</code> ({portrait.medium})
              </p>
              <blockquote className="mt-6 border-l border-line-strong pl-4 text-base italic text-ink">
                {portrait.versoConfession}
              </blockquote>
            </div>

            <div className="mt-6 border-t border-line pt-4">
              <p className="text-sm text-muted">{portrait.notaryNote}</p>
            </div>
          </div>
        )}
      </div>

      {/* Engraved brass nameplate */}
      <div className="mt-4 flex flex-col gap-3 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-[56ch]">
          <h3 className="type-title text-ink">{portrait.name}</h3>
          <p className="mt-1 text-sm text-muted">
            {portrait.title} (<time className="tabular-nums">{portrait.years}</time>)
          </p>
          <p className="mt-3 max-w-[54ch] text-sm italic text-muted">{portrait.epitaph}</p>
          {isWarmed && !showVerso && (
            <p className="mt-2 flex items-start gap-2 text-xs text-candle">
              <FlameIcon filled className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>{portrait.horrorPhenomenon}</span>
            </p>
          )}
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
    <section
      id="galerie"
      aria-labelledby="galerie-heading"
      className="bg-paper-deep py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        <header className="max-w-[60ch]">
          <h2 id="galerie-heading" className="type-headline text-ink">
            La galerie des ancêtres
          </h2>
          <p className="mt-4 max-w-[58ch] text-base text-muted">
            Accrochés selon l’ordonnance asymétrique du salon nord, quatre portraits ont survécu à la nuit de
            la Toussaint. Approchez votre flamme de leurs visages : leurs iris glissent sous l’huile ancienne,
            le bitume pleure à la chaleur du suif et le revers des châssis livre ce que le notaire n’osa
            transcrire.
          </p>
        </header>

        <div className="mt-8">
          <HiddenInscription text="« Ils ne clignent des paupières que lorsque votre bougie s’éloigne de leur cadre. »" />
        </div>

        {/* Asymmetrical 19th-century salon hang (7/5 staggered with 5/7) */}
        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-12">
          {ANCESTOR_PORTRAITS.map((portrait, index) => (
            <PortraitFrame key={portrait.id} portrait={portrait} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
