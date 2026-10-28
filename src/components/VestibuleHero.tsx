import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FlameIcon, CompassRoseIcon } from './GothicIcons';
import { HiddenInscription } from './HiddenInscription';

interface VestibuleHeroProps {
  soundOn: boolean;
  onEnterWithSound: () => void;
}

export function VestibuleHero({ soundOn, onEnterWithSound }: VestibuleHeroProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Subtle GPU-composited architectural parallax
  const etchingY = useTransform(scrollYProgress, [0, 1], ['0%', '8%']);

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
            <HiddenInscription text="« Approchez votre flamme des murs : la pierre garde ce que le greffier a raturé. »" />
          </div>
        </div>

        {/* Right 6 cols: Framed Copperplate Etching with Parallax & Living Attic Window */}
        <div className="lg:col-span-6" data-ui="frontispiece-plate">
          <figure className="frame-double overflow-hidden rounded-xs bg-surface p-3 sm:p-4">
            <div className="relative overflow-hidden bg-paper-deep">
              <motion.div style={{ y: etchingY }}>
                <img
                  src="/assets/manoir-gravure.webp"
                  alt="Gravure en taille-douce du manoir de Valmorin perché sur une falaise brumeuse derrière ses grilles entrouvertes"
                  width={1025}
                  height={735}
                  fetchPriority="high"
                  className="h-auto w-full object-cover"
                />
              </motion.div>
            </div>

            <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-2 px-1 text-xs text-muted">
              <span>Planche frontispice : élévation sud-ouest vue depuis la grille des falaises.</span>
              <code className="tabular-nums text-candle">03:17</code>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
