import { useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { CodexOpenIcon, FolioPrevIcon, FolioNextIcon, FlameIcon, WaxKeyIcon } from './GothicIcons';
import { withRedactions } from './RedactedPassage';
import { GRIMOIRE_FOLIOS } from '../data/valmorinData';
import { requestBlackout } from '../utils/candleState';
import { manorAudio } from '../audio/manorAudio';

const VIGIL_SOULS = ['Séverin', 'Héloïse', 'Malachie', 'Céleste', 'Cyprien'] as const;

export function GrimoireBook() {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const codexDriftY = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [14, -14]);
  const [unsealed, setUnsealed] = useState(false);
  const [folioIndex, setFolioIndex] = useState(0);
  const [visits, setVisits] = useState<number[]>(() => GRIMOIRE_FOLIOS.map((_, i) => (i === 0 ? 1 : 0)));
  const [litCandles, setLitCandles] = useState<boolean[]>([true, false, false, false, false]);
  const [ritualDoneOnce, setRitualDoneOnce] = useState(false);

  const currentFolio = GRIMOIRE_FOLIOS[folioIndex];
  const litCount = litCandles.filter(Boolean).length;
  const ritualComplete = litCount === VIGIL_SOULS.length;

  // A folio read a second time is no longer the same text.
  const isReread = visits[folioIndex] >= 2 || (currentFolio.rightType === 'ritual' && ritualDoneOnce && !ritualComplete);
  const paragraphs = isReread ? currentFolio.corruptedParagraphs : currentFolio.leftParagraphs;

  const handleUnseal = () => {
    manorAudio.playWaxSealBreak();
    setUnsealed(true);
  };

  const goToFolio = (nextIdx: number) => {
    if (nextIdx < 0 || nextIdx >= GRIMOIRE_FOLIOS.length || nextIdx === folioIndex) return;
    manorAudio.playPageTurn();
    setVisits((prev) => prev.map((v, i) => (i === nextIdx ? v + 1 : v)));
    setFolioIndex(nextIdx);
  };

  const toggleCandle = (idx: number) => {
    setLitCandles((prev) => {
      const wasComplete = prev.every(Boolean);
      const next = [...prev];
      next[idx] = !next[idx];
      manorAudio.playCandleChime(idx, next[idx]);

      if (next.every(Boolean)) {
        manorAudio.playGhostBreath();
        setRitualDoneOnce(true);
      } else if (!next[idx] && (wasComplete || ritualDoneOnce)) {
        // Blowing out a candle after completing the five-candle vigil violates Feuillet I ("Ne pas souffler la cinquième.")
        requestBlackout();
      }
      return next;
    });
  };

  return (
    <section
      ref={sectionRef}
      id="bibliotheque"
      aria-labelledby="bibliotheque-heading"
      className="bg-surface py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        <header className="max-w-[60ch]">
          <h2 id="bibliotheque-heading" className="type-headline text-ink">
            Le grimoire
          </h2>
          <p className="mt-4 max-w-[52ch] text-base text-ink">
            Trouvé ouvert sur le pupitre de la bibliothèque. Scellé par le notaire le jour même.
          </p>
        </header>

        <motion.div style={{ y: codexDriftY }} className="relative z-30 mt-12" data-ui="grimoire-codex">
          {!unsealed ? (
            <div className="frame-double mx-auto max-w-3xl rounded-xs bg-paper p-8 sm:p-12">
              <div className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
                <div className="max-w-[44ch]">
                  <h3 className="type-title text-ink">
                    Registre de Valmorin (<time className="candle-gleam inline-block text-base tabular-nums">1889</time>)
                  </h3>
                  <p className="mt-3 text-base text-ink">
                    Scellé à la cire. Sur le sceau, à l’encre : « Ne pas ouvrir après la tombée de la nuit. »
                  </p>
                </div>

                <div className="flex shrink-0 flex-col items-center gap-4 self-center">
                  <svg viewBox="0 0 120 120" className="h-28 w-28 text-accent" aria-hidden="true">
                    <path
                      d="M60 6 C88 4, 114 26, 113 58 C115 89, 91 114, 59 113 C28 115, 6 91, 7 61 C5 29, 31 8, 60 6 Z"
                      fill="currentColor"
                    />
                    <circle cx="60" cy="60" r="40" fill="none" stroke="var(--color-accent-ink)" strokeWidth="1.2" />
                    <circle
                      cx="60"
                      cy="60"
                      r="34"
                      fill="none"
                      stroke="var(--color-accent-ink)"
                      strokeWidth="0.75"
                    />
                    <path
                      d="M46 42 L60 78 L74 42 M52 56 L68 56"
                      fill="none"
                      stroke="var(--color-accent-ink)"
                      strokeWidth="1.8"
                    />
                  </svg>

                  <button
                    type="button"
                    onClick={handleUnseal}
                    className="inline-flex items-center gap-2 whitespace-nowrap rounded-xs bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink transition-colors duration-150 hover:bg-accent-hover active:bg-paper-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-candle disabled:opacity-40"
                  >
                    <WaxKeyIcon className="h-4 w-4" />
                    <span>Briser le sceau</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="frame-double rounded-xs bg-paper-deep p-4 sm:p-6 md:p-8">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
                <div className="flex items-center gap-3 text-sm text-muted">
                  <CodexOpenIcon className="h-5 w-5 text-candle" />
                  <span>
                    <strong className="font-normal text-ink">{currentFolio.folioNumber}</strong>{' '}
                    (<em className="italic">{currentFolio.latinRubric}</em>)
                  </span>
                </div>

                <div className="flex items-center gap-2" role="tablist" aria-label="Feuillets du grimoire">
                  {GRIMOIRE_FOLIOS.map((folio, idx) => {
                    const active = idx === folioIndex;
                    return (
                      <button
                        key={folio.folioNumber}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => goToFolio(idx)}
                        className={`rounded-xs border px-3 py-1.5 text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-candle ${
                          active
                            ? 'border-candle bg-surface-raised text-ink'
                            : 'border-line bg-surface text-muted hover:border-line-strong hover:text-ink active:bg-paper'
                        }`}
                      >
                        {folio.folioNumber}
                      </button>
                    );
                  })}
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`${currentFolio.folioNumber}-${isReread ? 'b' : 'a'}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-0"
                >
                  <div className="vellum-page flex flex-col justify-between rounded-xs p-6 sm:p-10 lg:border-r-2">
                    <div>
                      <h3 className="type-title text-vellum-ink">{currentFolio.leftTitle}</h3>
                      <p className="mt-1 text-sm italic text-vellum-muted">{currentFolio.latinRubric}</p>
                      <div className="mt-6 max-w-[48ch] space-y-4 text-base leading-relaxed text-vellum-ink">
                        {paragraphs.map((para) => (
                          <p key={para.slice(0, 32)}>{withRedactions(para, 'vellum')}</p>
                        ))}
                      </div>
                    </div>
                    <p className="mt-8 border-t border-vellum-deep pt-4 text-sm italic text-vellum-muted">
                      {currentFolio.leftMarginalia}
                    </p>
                  </div>

                  <div className="vellum-page flex flex-col justify-between rounded-xs p-6 sm:p-10">
                    {currentFolio.rightType === 'engraving' && currentFolio.engravingSrc ? (
                      <>
                        <figure className="flex flex-col items-center">
                          <div className="max-h-96 overflow-hidden border border-vellum-deep bg-vellum-deep/40 p-2">
                            <img
                              src={currentFolio.engravingSrc}
                              alt={currentFolio.engravingAlt || currentFolio.rightCaption}
                              width={currentFolio.engravingWidth || 896}
                              height={currentFolio.engravingHeight || 1200}
                              className="h-80 w-auto object-contain mix-blend-multiply"
                            />
                          </div>
                          <figcaption className="mt-4 text-center text-sm font-medium text-vellum-ink">
                            {currentFolio.rightCaption}
                          </figcaption>
                        </figure>
                        <p className="mt-6 border-t border-vellum-deep pt-4 text-sm text-vellum-muted">
                          {withRedactions(currentFolio.rightText, 'vellum')}
                        </p>
                      </>
                    ) : (
                      <div className="flex h-full flex-col justify-between">
                        <div>
                          <h4 className="type-title text-vellum-ink">{currentFolio.rightCaption}</h4>
                          <p className="mt-2 text-sm text-vellum-muted">{currentFolio.rightText}</p>

                          <div className="mt-8 grid grid-cols-5 gap-2 sm:gap-3">
                            {VIGIL_SOULS.map((soul, idx) => {
                              const isLit = litCandles[idx];
                              return (
                                <button
                                  key={soul}
                                  type="button"
                                  aria-pressed={isLit}
                                  onClick={() => toggleCandle(idx)}
                                  className={`flex flex-col items-center justify-end rounded-xs border p-3 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                                    isLit
                                      ? 'border-accent bg-paper text-ink'
                                      : 'border-vellum-deep bg-vellum-deep/50 text-vellum-ink hover:bg-vellum-deep active:bg-vellum'
                                  }`}
                                >
                                  <FlameIcon
                                    filled={isLit}
                                    className={`h-6 w-6 ${isLit ? 'text-candle' : 'text-vellum-muted'}`}
                                  />
                                  <span
                                    aria-hidden="true"
                                    className={`mt-2 block h-10 w-2.5 rounded-xs ${isLit ? 'bg-vellum' : 'bg-vellum-muted/40'}`}
                                  />
                                  <span className="mt-2 text-sm">{soul}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="mt-8 rounded-xs border border-vellum-deep bg-vellum-deep/40 p-4">
                          {ritualComplete ? (
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-accent">Cinq bougies. Six ombres sur le mur.</p>
                              <p className="text-sm text-vellum-ink">Ne vous retournez pas. Ne soufflez aucune flamme.</p>
                            </div>
                          ) : (
                            <p className="text-sm text-vellum-muted">
                              <code className="tabular-nums text-vellum-ink">
                                {litCount}/{VIGIL_SOULS.length}
                              </code>
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="mt-6 flex items-center justify-between gap-4 border-t border-line pt-4">
                <button
                  type="button"
                  disabled={folioIndex === 0}
                  onClick={() => goToFolio(folioIndex - 1)}
                  className="inline-flex items-center gap-2 rounded-xs border border-line-strong bg-surface px-4 py-2 text-sm text-ink transition-colors duration-150 hover:border-candle hover:bg-surface-raised active:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-candle disabled:pointer-events-none disabled:opacity-40"
                >
                  <FolioPrevIcon className="h-4 w-4" />
                  <span>Précédent</span>
                </button>

                <span className="text-sm text-muted">
                  <code className="tabular-nums">{folioIndex + 1}</code> /{' '}
                  <code className="tabular-nums">{GRIMOIRE_FOLIOS.length}</code>
                </span>

                <button
                  type="button"
                  disabled={folioIndex === GRIMOIRE_FOLIOS.length - 1}
                  onClick={() => goToFolio(folioIndex + 1)}
                  className="inline-flex items-center gap-2 rounded-xs border border-line-strong bg-surface px-4 py-2 text-sm text-ink transition-colors duration-150 hover:border-candle hover:bg-surface-raised active:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-candle disabled:pointer-events-none disabled:opacity-40"
                >
                  <span>Suivant</span>
                  <FolioNextIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
