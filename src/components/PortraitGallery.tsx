import { useEffect, useRef, useState } from 'react';
import { EyeGazeIcon, FlipFrameIcon, FlameIcon } from './GothicIcons';
import { ANCESTOR_PORTRAITS, type AncestorPortrait } from '../data/valmorinData';
import { candleCoords } from '../utils/candleState';
import { manorAudio } from '../audio/manorAudio';
import { HiddenInscription } from './HiddenInscription';

interface PortraitFrameProps {
  portrait: AncestorPortrait;
  isFirst: boolean;
}

function PortraitFrame({ portrait, isFirst }: PortraitFrameProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const eyeRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const pupilRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const heatBarRef = useRef<HTMLDivElement | null>(null);

  const [showVerso, setShowVerso] = useState(false);
  const [isWarmed, setIsWarmed] = useState(false);
  const isHoveredRef = useRef(false);
  const heatRef = useRef(0);
  const sighedRef = useRef(false);

  // Position eye anchor points cleanly via DOM refs (avoids inline JSX style literals)
  useEffect(() => {
    portrait.eyes.forEach((coord, idx) => {
      const anchor = eyeRefs.current[idx];
      if (anchor) {
        anchor.style.left = `${coord.xPct}%`;
        anchor.style.top = `${coord.yPct}%`;
      }
    });
  }, [portrait.eyes]);

  // 60fps eye-tracking & candle-heat varnish reaction
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rafId = 0;

    const tick = () => {
      const box = containerRef.current;
      if (box && !showVerso) {
        const rect = box.getBoundingClientRect();
        const inViewport = rect.bottom > 0 && rect.top < window.innerHeight;

        if (inViewport) {
          portrait.eyes.forEach((coord, idx) => {
            const pupil = pupilRefs.current[idx];
            if (!pupil) return;
            const eyeX = rect.left + (coord.xPct / 100) * rect.width;
            const eyeY = rect.top + (coord.yPct / 100) * rect.height;
            const dx = candleCoords.x - eyeX;
            const dy = candleCoords.y - eyeY;
            const dist = Math.hypot(dx, dy) || 1;
            const maxShiftX = prefersReduced ? 0.7 : 1.9;
            const maxShiftY = prefersReduced ? 0.4 : 1.1;
            const ratio = Math.min(dist / 260, 1);
            const ox = (dx / dist) * ratio * maxShiftX;
            const oy = (dy / dist) * ratio * maxShiftY;
            pupil.style.transform = `translate3d(${ox.toFixed(2)}px, ${oy.toFixed(2)}px, 0)`;
          });

          if (isHoveredRef.current) {
            heatRef.current = Math.min(1, heatRef.current + 0.011);
            if (heatRef.current > 0.62 && !sighedRef.current) {
              sighedRef.current = true;
              setIsWarmed(true);
              manorAudio.playPortraitSigh();
            }
          } else {
            heatRef.current = Math.max(0, heatRef.current - 0.008);
          }

          if (heatBarRef.current) {
            heatBarRef.current.style.transform = `scaleX(${heatRef.current.toFixed(3)})`;
          }
        }
      }
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [portrait.eyes, showVerso]);

  return (
    <article className={`${portrait.layoutClass} flex flex-col`} data-ui="portrait-frame">
      <div
        ref={containerRef}
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
              src={portrait.imageSrc}
              alt={portrait.alt}
              width={portrait.width}
              height={portrait.height}
              loading={isFirst ? undefined : 'lazy'}
              className={`h-full w-full object-cover transition-transform duration-200 ${
                isWarmed ? 'contrast-125 sepia-[.18]' : ''
              }`}
            />

            {/* Subtle tracked specular catchlights aligned to painted eyes */}
            {portrait.eyes.map((eye, idx) => (
              <span
                key={`${portrait.id}-eye-${eye.xPct}-${eye.yPct}`}
                ref={(el) => {
                  eyeRefs.current[idx] = el;
                }}
                aria-hidden="true"
                className="pointer-events-none absolute -ml-2 -mt-2 flex h-4 w-4 items-center justify-center"
              >
                <span
                  ref={(el) => {
                    pupilRefs.current[idx] = el;
                  }}
                  className={`block transition-opacity duration-200 ${
                    isWarmed ? 'eye-glint-warm' : 'eye-glint'
                  }`}
                />
              </span>
            ))}

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
            <p className="mt-2 flex items-center gap-2 text-xs text-candle">
              <FlameIcon className="h-4 w-4 shrink-0" />
              <span>La chaleur de votre bougie fait suinter une écriture au dos de la toile.</span>
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
            la Toussaint. Approchez votre flamme de leurs visages : le bitume ancien s’échauffe, leurs pupilles
            captent la mèche et le revers des châssis livre ce que le notaire n’osa transcrire.
          </p>
        </header>

        <div className="mt-8">
          <HiddenInscription text="« Ils ne clignent des paupières que lorsque la bougie s’éloigne. »" />
        </div>

        {/* Asymmetrical 19th-century salon hang (7/5 staggered with 5/7) */}
        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-12">
          {ANCESTOR_PORTRAITS.map((portrait, index) => (
            <PortraitFrame key={portrait.id} portrait={portrait} isFirst={index === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}
