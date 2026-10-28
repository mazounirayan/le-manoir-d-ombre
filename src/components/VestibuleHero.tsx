import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FlameIcon, CompassRoseIcon } from './GothicIcons';
import { HiddenInscription } from './HiddenInscription';
import { candleCoords } from '../utils/candleState';

interface VestibuleHeroProps {
  soundOn: boolean;
  onEnterWithSound: () => void;
}

export function VestibuleHero({ soundOn, onEnterWithSound }: VestibuleHeroProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const plateImgRef = useRef<HTMLImageElement | null>(null);
  const plateCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [watcherVisible, setWatcherVisible] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Subtle GPU-composited architectural parallax
  const etchingY = useTransform(scrollYProgress, [0, 1], ['0%', '8%']);

  // Animate the lit mansard attic window (60.6%, 21.77%) & the silent watcher silhouette
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rafId = 0;
    let watcherAlpha = 0;
    let cachedW = 0;
    let cachedH = 0;
    let lastStateBool = false;

    const tick = (time: number) => {
      const t = time * 0.001;
      const img = plateImgRef.current;
      const canvas = plateCanvasRef.current;

      if (img && canvas && img.complete && img.naturalWidth > 0) {
        const rect = img.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < window.innerHeight && rect.width > 40) {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          const w = rect.width;
          const h = rect.height;
          const pw = Math.round(w * dpr);
          const ph = Math.round(h * dpr);

          if (cachedW !== pw || cachedH !== ph) {
            cachedW = pw;
            cachedH = ph;
            canvas.width = pw;
            canvas.height = ph;
          }

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, w, h);

            // Exact calibrated mansard window center (60.60%, 21.77%)
            const winX = w * 0.606;
            const winY = h * 0.2177;
            const winW = w * 0.0125;
            const winH = h * 0.039;

            const screenWinX = rect.left + winX;
            const screenWinY = rect.top + winY;
            const distToWindow = Math.hypot(candleCoords.x - screenWinX, candleCoords.y - screenWinY);

            // Watcher appears periodically OR when candle approaches, but retreats sharply if flame gets too close (< 85px)!
            const periodicVisit = Math.sin(t * 0.42) > 0.35;
            const curiousApproach = candleCoords.hasMoved && distToWindow < 290 && distToWindow > 88;
            const startledRetreat = candleCoords.hasMoved && distToWindow <= 88;

            const targetWatcher = !startledRetreat && (curiousApproach || periodicVisit) ? 1 : 0;
            const lerpRate = startledRetreat ? 0.18 : 0.045;
            watcherAlpha += (targetWatcher - watcherAlpha) * (prefersReduced ? 0.2 : lerpRate);

            const isShowing = watcherAlpha > 0.45;
            if (isShowing !== lastStateBool) {
              lastStateBool = isShowing;
              setWatcherVisible(isShowing);
            }

            // 1. Flickering distant vigil candle inside the attic window
            const flicker = prefersReduced
              ? 0.22
              : 0.2 + Math.sin(t * 9.4) * 0.06 + Math.cos(t * 19.8) * 0.04;
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            const glow = ctx.createRadialGradient(winX, winY, 0.5, winX, winY, winH * 1.45);
            glow.addColorStop(0, `rgba(255, 206, 116, ${flicker.toFixed(3)})`);
            glow.addColorStop(0.5, `rgba(214, 128, 44, ${(flicker * 0.45).toFixed(3)})`);
            glow.addColorStop(1, 'rgba(140, 56, 20, 0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(winX, winY, winH * 1.45, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // 2. Motionless watcher silhouette standing behind the arched mansard windowpane
            if (watcherAlpha > 0.02) {
              ctx.save();
              ctx.beginPath();
              ctx.roundRect(winX - winW * 0.55, winY - winH * 0.52, winW * 1.1, winH * 1.04, winW * 0.5);
              ctx.clip();

              ctx.fillStyle = `rgba(14, 10, 9, ${(watcherAlpha * 0.86).toFixed(3)})`;
              // Head
              ctx.beginPath();
              ctx.ellipse(winX, winY - winH * 0.1, winW * 0.26, winH * 0.16, 0, 0, Math.PI * 2);
              ctx.fill();
              // Narrow Victorian shoulders/cloak
              ctx.beginPath();
              ctx.ellipse(winX, winY + winH * 0.34, winW * 0.46, winH * 0.32, 0, 0, Math.PI * 2);
              ctx.fill();

              ctx.restore();
            }

            // 3. Drifting sea-cliff fog veil across the lower iron gates
            if (!prefersReduced) {
              ctx.save();
              ctx.globalCompositeOperation = 'screen';
              const mistX = w * (0.48 + Math.sin(t * 0.23) * 0.08);
              const mistY = h * 0.78;
              const mistGrad = ctx.createRadialGradient(mistX, mistY, 4, mistX, mistY, w * 0.36);
              mistGrad.addColorStop(0, 'rgba(206, 196, 182, 0.075)');
              mistGrad.addColorStop(1, 'rgba(140, 132, 122, 0)');
              ctx.fillStyle = mistGrad;
              ctx.fillRect(0, h * 0.52, w, h * 0.48);
              ctx.restore();
            }
          }
        }
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="vestibule"
      aria-labelledby="vestibule-heading"
      className="relative min-h-dvh bg-paper py-16 md:py-24"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 md:px-12 lg:grid-cols-12">
        {/* Left 6 cols: Monumental French Gothic Editorial Frontispiece */}
        <div className="lg:col-span-6">
          <header>
            <h1 id="vestibule-heading" className="type-display text-ink">
              Le manoir d’ombre
            </h1>
            <p className="mt-4 max-w-[60ch] text-sm text-muted">
              Inventaire clos à Valmorin le{' '}
              <time dateTime="1889-10-31" className="tabular-nums text-candle">
                31 octobre 1889
              </time>
              .
            </p>
          </header>

          <p className="mt-8 max-w-[58ch] text-lg leading-relaxed text-ink">
            Lorsque les gendarmes de Dieppe forcèrent la grille à l’aube de la Toussaint, le souper fumait
            encore sur la nappe damassée, cinq bougies achevaient de se consumer dans le grand salon, et nul
            pas ne marquait la boue blanche du sentier.
          </p>

          <blockquote className="mt-6 max-w-[58ch] border-l border-line-strong pl-4 text-base italic text-muted">
            « Il est des demeures qui ne se contentent point d’abriter nos hivers ; elles retiennent nos
            reflets dans le tain de leurs glaces longtemps après que le cœur s’est tu. »
          </blockquote>

          <div className="mt-10 flex flex-wrap items-center gap-4" data-ui="hero-actions">
            <button
              type="button"
              onClick={onEnterWithSound}
              className="inline-flex items-center gap-2.5 rounded-xs bg-accent px-5 py-3 text-sm font-medium text-accent-ink transition-colors duration-150 hover:bg-accent-hover active:bg-paper-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-candle disabled:opacity-40"
            >
              <FlameIcon filled className="h-4 w-4 text-candle" />
              <span>
                {soundOn ? 'Parcourir la galerie aux chandelles' : 'Allumer la chandelle et le son'}
              </span>
            </button>

            <a
              href="#galerie"
              className="inline-flex items-center gap-2 rounded-xs border border-line-strong bg-surface px-5 py-3 text-sm text-ink transition-colors duration-150 hover:border-candle hover:bg-surface-raised active:bg-paper-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-candle"
            >
              <CompassRoseIcon className="h-4 w-4 text-candle" />
              <span>Entrer en silence</span>
            </a>
          </div>

          <div className="mt-10">
            <HiddenInscription text="« Approchez votre flamme des murs sombres : la craie garde les griffures que le greffier a raturées. »" />
          </div>
        </div>

        {/* Right 6 cols: Framed Copperplate Etching with Parallax & Living Attic Window Watcher */}
        <div className="lg:col-span-6" data-ui="frontispiece-plate">
          <figure className="frame-double overflow-hidden rounded-xs bg-surface p-3 sm:p-4">
            <div className="relative overflow-hidden bg-paper-deep">
              <motion.div style={{ y: etchingY }} className="relative">
                <img
                  ref={plateImgRef}
                  src="/assets/manoir-gravure.webp"
                  alt="Gravure en taille-douce du manoir de Valmorin perché sur une falaise brumeuse derrière ses grilles entrouvertes"
                  width={1025}
                  height={735}
                  fetchPriority="high"
                  className="h-auto w-full object-cover"
                />
                <canvas
                  ref={plateCanvasRef}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 h-full w-full"
                />
              </motion.div>
            </div>

            <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-2 px-1 text-xs text-muted">
              <span>
                {watcherVisible
                  ? 'Planche frontispice : silhouette immobile relevée derrière la lucarne haute.'
                  : 'Planche frontispice : élévation sud-ouest vue depuis la grille des falaises.'}
              </span>
              <code className="tabular-nums text-candle">03:17</code>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
