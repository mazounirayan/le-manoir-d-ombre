import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CodexOpenIcon, FolioPrevIcon, FolioNextIcon, FlameIcon, WaxKeyIcon } from './GothicIcons';
import { GRIMOIRE_FOLIOS } from '../data/valmorinData';
import { manorAudio } from '../audio/manorAudio';
import { HiddenInscription } from './HiddenInscription';

const VIGIL_SOULS = ['Séverin', 'Héloïse', 'Malachie', 'Céleste', 'Cyprien'] as const;

export function GrimoireBook() {
  const [unsealed, setUnsealed] = useState(false);
  const [folioIndex, setFolioIndex] = useState(0);
  const [litCandles, setLitCandles] = useState<boolean[]>([true, false, false, false, false]);

  const currentFolio = GRIMOIRE_FOLIOS[folioIndex];
  const litCount = litCandles.filter(Boolean).length;
  const ritualComplete = litCount === VIGIL_SOULS.length;

  const handleUnseal = () => {
    manorAudio.playWaxSealBreak();
    setUnsealed(true);
  };

  const goToFolio = (nextIdx: number) => {
    if (nextIdx < 0 || nextIdx >= GRIMOIRE_FOLIOS.length || nextIdx === folioIndex) return;
    manorAudio.playPageTurn();
    setFolioIndex(nextIdx);
  };

  const toggleCandle = (idx: number) => {
    setLitCandles((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      manorAudio.playCandleChime(idx, next[idx]);
      if (next.every(Boolean)) {
        manorAudio.playGhostBreath();
      }
      return next;
    });
  };

  return (
    <section
      id="bibliotheque"
      aria-labelledby="bibliotheque-heading"
      className="bg-surface py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        <header className="max-w-[60ch]">
          <h2 id="bibliotheque-heading" className="type-headline text-ink">
            Le cabinet d’étude et le grimoire scellé
          </h2>
          <p className="mt-4 max-w-[58ch] text-base text-muted">
            Retrouvé ouvert sur le lutrin de chêne, ce registre testamentaire rassemble les planches
            anatomiques, les calculs d’éclipse et la liturgie domestique de la lignée Valmorin. Rompez la
            cire notariale pour feuilleter ses vélinages tachés de rouille et de suif.
          </p>
        </header>

        <div className="mt-6">
          <HiddenInscription
            align="right"
            text="« Cinq mèches ardentes suffisent à rouvrir la porte que le glas avait close. »"
          />
        </div>

        <div className="mt-12" data-ui="grimoire-codex">
          {!unsealed ? (
            <div className="frame-double mx-auto max-w-3xl rounded-xs bg-paper p-8 sm:p-12">
              <div className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
                <div className="max-w-[54ch]">
                  <h3 className="type-title text-ink">
                    Registre testamentaire de Valmorin (<time className="text-base tabular-nums">1889</time>)
                  </h3>
                  <p className="mt-3 max-w-[52ch] text-sm text-muted">
                    Reliure en veau noirci, fermoirs de fer forgé, scellé à la cire carmin par l’étude de
                    maître Anselme Vasseur. Toute ouverture engage le lecteur au silence sur les clauses
                    relatives à la mansarde nord et aux bruits entendus sous les dalles.
                  </p>
                </div>

                {/* Engraved Heraldic Wax Seal SVG with Dripping Carmine Wax */}
                <div className="flex shrink-0 flex-col items-center gap-4 self-center">
                  <svg
                    viewBox="0 0 120 132"
                    className="h-32 w-28 text-accent"
                    aria-hidden="true"
                  >
                    <path
                      d="M60 6 C88 4, 114 26, 113 58 C115 86, 95 108, 70 112 C69 121, 67 128, 64 128 C61 128, 60 119, 58 113 C49 114, 46 122, 43 122 C40 122, 40 113, 35 110 C15 101, 5 82, 7 61 C5 29, 31 8, 60 6 Z"
                      fill="currentColor"
                    />
                    <circle
                      cx="60"
                      cy="58"
                      r="40"
                      fill="none"
                      stroke="var(--color-accent-ink)"
                      strokeWidth="1.2"
                    />
                    <circle
                      cx="60"
                      cy="58"
                      r="34"
                      fill="none"
                      stroke="var(--color-accent-ink)"
                      strokeWidth="0.75"
                      strokeDasharray="3 3"
                    />
                    <path
                      d="M46 40 L60 76 L74 40 M52 54 L68 54"
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
                    <span>Briser le sceau de cire</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="frame-double rounded-xs bg-paper-deep p-4 sm:p-6 md:p-8">
              {/* Top Archival Book Toolbar */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
                <div className="flex items-center gap-3 text-sm text-muted">
                  <CodexOpenIcon className="h-5 w-5 text-candle" />
                  <span>
                    Codex ouvert : <strong className="font-normal text-ink">{currentFolio.folioNumber}</strong>{' '}
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

              {/* Open Double-Page Vellum Spread */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentFolio.folioNumber}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-0"
                >
                  {/* Left Vellum Leaf (Verso) with Dried Carmine & Iron-Gall Stain Filigree */}
                  <div className="vellum-page relative flex flex-col justify-between overflow-hidden rounded-xs p-6 sm:p-10 lg:border-r-2">
                    <svg
                      viewBox="0 0 90 90"
                      aria-hidden="true"
                      className="pointer-events-none absolute top-0 left-0 h-20 w-20 text-accent opacity-20"
                    >
                      <path
                        d="M0 0 L68 0 C54 14, 48 24, 34 26 C26 27, 24 44, 15 47 C8 49, 6 65, 0 74 Z"
                        fill="currentColor"
                      />
                      <circle cx="42" cy="36" r="2.6" fill="currentColor" />
                      <circle cx="24" cy="54" r="1.8" fill="currentColor" />
                    </svg>

                    <div className="relative">
                      <h3 className="type-title text-vellum-ink">{currentFolio.leftTitle}</h3>
                      <p className="mt-1 text-sm italic text-vellum-muted">{currentFolio.latinRubric}</p>

                      <div className="mt-6 max-w-[56ch] space-y-4 text-base leading-relaxed text-vellum-ink">
                        {currentFolio.leftParagraphs.map((para) => (
                          <p key={para.slice(0, 24)}>{para}</p>
                        ))}
                      </div>
                    </div>

                    <blockquote className="relative mt-8 max-w-[56ch] border-t border-vellum-deep pt-4 text-sm italic text-vellum-muted">
                      {currentFolio.leftMarginalia}
                    </blockquote>
                  </div>

                  {/* Right Vellum Leaf (Recto) */}
                  <div className="vellum-page relative flex flex-col justify-between overflow-hidden rounded-xs p-6 sm:p-10">
                    <svg
                      viewBox="0 0 90 90"
                      aria-hidden="true"
                      className="pointer-events-none absolute right-0 bottom-0 h-24 w-24 text-accent opacity-20"
                    >
                      <path
                        d="M90 90 L24 90 C38 78, 46 69, 58 65 C68 62, 72 44, 80 38 C85 34, 87 18, 90 8 Z"
                        fill="currentColor"
                      />
                      <circle cx="52" cy="56" r="3.1" fill="currentColor" />
                    </svg>

                    {currentFolio.rightType === 'engraving' && currentFolio.engravingSrc ? (
                      <>
                        <figure className="relative flex flex-col items-center">
                          <div className="max-h-96 overflow-hidden border border-vellum-deep bg-vellum-deep/40 p-2">
                            <img
                              src={currentFolio.engravingSrc}
                              alt={currentFolio.engravingAlt || currentFolio.rightCaption}
                              width={currentFolio.engravingWidth || 896}
                              height={currentFolio.engravingHeight || 1200}
                              className="h-80 w-auto object-contain mix-blend-multiply"
                            />
                          </div>
                          <figcaption className="mt-4 max-w-[52ch] text-center text-sm font-medium text-vellum-ink">
                            {currentFolio.rightCaption}
                          </figcaption>
                        </figure>

                        <p className="relative mt-6 max-w-[56ch] border-t border-vellum-deep pt-4 text-sm text-vellum-muted">
                          {currentFolio.rightText}
                        </p>
                      </>
                    ) : (
                      <div className="relative flex h-full flex-col justify-between">
                        <div>
                          <h4 className="type-title text-vellum-ink">{currentFolio.rightCaption}</h4>
                          <p className="mt-2 max-w-[54ch] text-sm text-vellum-muted">
                            {currentFolio.rightText}
                          </p>

                          {/* Interactive 5 Vigil Candles Ritual */}
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
                                    className={`mt-2 block h-10 w-2.5 rounded-xs ${
                                      isLit ? 'bg-vellum' : 'bg-vellum-muted/40'
                                    }`}
                                  />
                                  <span className="mt-2 text-xs">{soul}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="mt-8 rounded-xs border border-vellum-deep bg-vellum-deep/40 p-4">
                          {ritualComplete ? (
                            <div className="space-y-2">
                              <p className="max-w-[54ch] text-sm font-medium text-accent">
                                Codicille dévoilé : « Les cinq flammes brûlent d’un même souffle. Le domaine ne
                                cherche point d’héritier ; il retient seulement le lecteur qui a rallumé la
                                veille. »
                              </p>
                              <p className="max-w-[54ch] border-t border-vellum-deep pt-2 text-xs italic text-vellum-ink">
                                Trace fraîche apparue dans la marge : cinq mèches brûlent pour les défunts de
                                Valmorin. Ne soufflez point la vôtre ; un sixième témoin s’est arrêté derrière
                                votre épaule pour lire avec vous.
                              </p>
                            </div>
                          ) : (
                            <p className="max-w-[54ch] text-sm text-vellum-muted">
                              Veilleuses ardentes :{' '}
                              <code className="tabular-nums text-vellum-ink">
                                {litCount}/{VIGIL_SOULS.length}
                              </code>
                              . Éveillez chaque cierge pour faire apparaître l’encre sympathique du codicille.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Bottom Pagination Controls */}
              <div className="mt-6 flex items-center justify-between gap-4 border-t border-line pt-4">
                <button
                  type="button"
                  disabled={folioIndex === 0}
                  onClick={() => goToFolio(folioIndex - 1)}
                  className="inline-flex items-center gap-2 rounded-xs border border-line-strong bg-surface px-4 py-2 text-sm text-ink transition-colors duration-150 hover:border-candle hover:bg-surface-raised active:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-candle disabled:pointer-events-none disabled:opacity-40"
                >
                  <FolioPrevIcon className="h-4 w-4" />
                  <span>Feuillet précédent</span>
                </button>

                <span className="text-xs text-muted">
                  Feuillet <code className="tabular-nums">{folioIndex + 1}</code> sur{' '}
                  <code className="tabular-nums">{GRIMOIRE_FOLIOS.length}</code>
                </span>

                <button
                  type="button"
                  disabled={folioIndex === GRIMOIRE_FOLIOS.length - 1}
                  onClick={() => goToFolio(folioIndex + 1)}
                  className="inline-flex items-center gap-2 rounded-xs border border-line-strong bg-surface px-4 py-2 text-sm text-ink transition-colors duration-150 hover:border-candle hover:bg-surface-raised active:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-candle disabled:pointer-events-none disabled:opacity-40"
                >
                  <span>Feuillet suivant</span>
                  <FolioNextIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
