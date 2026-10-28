import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FlameIcon, CompassRoseIcon } from './GothicIcons';
import { candleCoords } from '../utils/candleState';
import { assetUrl } from '../data/valmorinData';

interface VestibuleHeroProps {
  soundOn: boolean;
  onEnterWithSound: () => void;
  returnedFromCrypt: boolean;
}

export function VestibuleHero({ soundOn, onEnterWithSound, returnedFromCrypt }: VestibuleHeroProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const plateImgRef = useRef<HTMLImageElement | null>(null);
  const plateCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [watcherVisible, setWatcherVisible] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const etchingY = useTransform(scrollYProgress, [0, 1], ['0%', '8%']);

  // Lit attic window (60.6 %, 21.77 % of the plate) and the figure standing behind it.
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let rafId = 0;
    let watcherAlpha = 0;
    let cachedW = 0;
    let cachedH = 0;
    let lastShowing = false;

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

            const winX = w * 0.606;
            const winY = h * 0.2177;
            const winW = w * 0.0125;
            const winH = h * 0.039;

            const dist = Math.hypot(candleCoords.x - (rect.left + winX), candleCoords.y - (rect.top + winY));
            const periodic = Math.sin(t * 0.42) > 0.35;
            const curious = candleCoords.hasMoved && dist < 290 && dist > 88;
            const startled = candleCoords.hasMoved && dist <= 88;
            const target = !startled && (curious || periodic) ? 1 : 0;
            watcherAlpha += (target - watcherAlpha) * (prefersReduced ? 0.2 : startled ? 0.18 : 0.045);

            const showing = watcherAlpha > 0.45;
            if (showing !== lastShowing) {
              lastShowing = showing;
              setWatcherVisible(showing);
            }

            const flicker = prefersReduced ? 0.22 : 0.2 + Math.sin(t * 9.4) * 0.06 + Math.cos(t * 19.8) * 0.04;
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

            if (watcherAlpha > 0.02) {
              ctx.save();
              ctx.beginPath();
              ctx.roundRect(winX - winW * 0.55, winY - winH * 0.52, winW * 1.1, winH * 1.04, winW * 0.5);
              ctx.clip();
              ctx.fillStyle = `rgba(14, 10, 9, ${(watcherAlpha * 0.86).toFixed(3)})`;
              ctx.beginPath();
              ctx.ellipse(winX, winY - winH * 0.1, winW * 0.26, winH * 0.16, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.beginPath();
              ctx.ellipse(winX, winY + winH * 0.34, winW * 0.46, winH * 0.32, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }

            if (!prefersReduced) {
              ctx.save();
              ctx.globalCompositeOperation = 'screen';
              const mistX = w * (0.48 + Math.sin(t * 0.23) * 0.08);
              const mist = ctx.createRadialGradient(mistX, h * 0.78, 4, mistX, h * 0.78, w * 0.36);
              mist.addColorStop(0, 'rgba(206, 196, 182, 0.075)');
              mist.addColorStop(1, 'rgba(140, 132, 122, 0)');
              ctx.fillStyle = mist;
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
        <div className="lg:col-span-6">
          <header>
            <h1 id="vestibule-heading" className="type-display text-ink">
              Le manoir d’ombre
            </h1>
            <p className="mt-4 text-sm text-muted">
              Inventaire clos à Valmorin le{' '}
              <time dateTime="1889-10-31" className="candle-gleam inline-block tabular-nums text-candle">
                31 octobre 1889
              </time>
              .
            </p>
          </header>

          <div className="mt-8 max-w-[44ch] space-y-1 text-lg leading-relaxed text-ink">
            <p>Le 1er novembre au matin, les gendarmes ont forcé la grille.</p>
            <p>La table était mise. Cinq bougies brûlaient.</p>
            <p>{returnedFromCrypt ? 'Il y avait quelqu’un.' : 'Il n’y avait personne.'}</p>
          </div>

          <p className="mt-6 max-w-[48ch] text-sm text-muted">
            Le notaire a signé l’inventaire sans le relire. Il n’est pas rentré chez lui.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4" data-ui="hero-actions">
            <button
              type="button"
              onClick={onEnterWithSound}
              className="inline-flex items-center gap-2.5 rounded-xs bg-accent px-5 py-3 text-sm font-medium text-accent-ink transition-colors duration-150 hover:bg-accent-hover active:bg-paper-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-candle disabled:opacity-40"
            >
              <FlameIcon filled className="h-4 w-4 text-candle" />
              <span>{soundOn ? 'Continuer avec la bougie' : 'Entrer avec une bougie'}</span>
            </button>

            <a
              href="#galerie"
              className="inline-flex items-center gap-2 rounded-xs border border-line-strong bg-surface px-5 py-3 text-sm text-ink transition-colors duration-150 hover:border-candle hover:bg-surface-raised active:bg-paper-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-candle"
            >
              <CompassRoseIcon className="h-4 w-4 text-candle" />
              <span>Entrer sans le son</span>
            </a>
          </div>
        </div>

        <div className="lg:col-span-6">
          <figure className="frame-double overflow-hidden rounded-xs bg-surface p-3 sm:p-4">
            <div className="relative overflow-hidden bg-paper-deep">
              <motion.div style={{ y: etchingY }} className="relative">
                <img
                  ref={plateImgRef}
                  src={assetUrl('assets/manoir-gravure.webp')}
                  alt="Gravure du manoir de Valmorin sur sa falaise, derrière une grille entrouverte"
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

            <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-2 px-1 text-sm text-muted">
              <span>{watcherVisible ? 'Lucarne nord. Quelqu’un.' : 'Lucarne nord.'}</span>
              <code className="candle-gleam inline-block tabular-nums text-candle">03:17</code>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
