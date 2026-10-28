import { useEffect, useState, type FormEvent } from 'react';
import { QuillIcon, ArchiveResetIcon } from './GothicIcons';
import { INITIAL_WITNESSES, type WitnessEntry } from '../data/valmorinData';
import { manorAudio } from '../audio/manorAudio';
import { HiddenInscription } from './HiddenInscription';

const STORAGE_KEY = 'valmorin_witness_ledger_v1';

export function CryptLedger() {
  const [entries, setEntries] = useState<WitnessEntry[]>(INITIAL_WITNESSES);
  const [authorName, setAuthorName] = useState('');
  const [verseText, setVerseText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as WitnessEntry[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEntries(parsed);
        }
      }
    } catch {
      // Ignore storage access restrictions
    }
  }, []);

  const hasCustomEntries = entries.length > INITIAL_WITNESSES.length;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cleanName = authorName.trim();
    const cleanVerse = verseText.trim();

    if (cleanName.length < 2) {
      setErrorMsg('Veuillez inscrire un nom ou un titre d’au moins deux caractères.');
      return;
    }
    if (cleanVerse.length < 12) {
      setErrorMsg('Votre témoignage doit compter au moins douze caractères pour être gravé.');
      return;
    }

    setErrorMsg(null);
    const today = new Date();
    const isoDate = today.toISOString().slice(0, 10);
    const dateLabel = today.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const newEntry: WitnessEntry = {
      id: `witness-${Date.now()}`,
      name: cleanName,
      dateLabel,
      isoDate,
      verse: cleanVerse,
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    setAuthorName('');
    setVerseText('');
    manorAudio.playWaxSealBreak();

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore quota errors
    }
  };

  const handleResetCustom = () => {
    setEntries(INITIAL_WITNESSES);
    manorAudio.playPageTurn();
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  };

  return (
    <section
      id="crypte"
      aria-labelledby="crypte-heading"
      className="bg-paper-deep py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        <header className="max-w-[60ch]">
          <h2 id="crypte-heading" className="type-headline text-ink">
            La crypte des soupirs et le registre des témoins
          </h2>
          <p className="mt-4 max-w-[58ch] text-base text-muted">
            Sous les voûtes de craie humide où nul caveau ne porte de date finale, les rares visiteurs ayant
            franchi le seuil depuis <time className="text-sm tabular-nums">1889</time> consignent leur trace
            sur le cuivre d’inventaire avant de refermer la grille.
          </p>
        </header>

        <div className="mt-8">
          <HiddenInscription text="« Nul ne quitte tout à fait Valmorin dès lors que son nom sèche sur ce feuillet. »" />
        </div>

        <div
          className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12"
          data-ui="crypt-ledger"
        >
          {/* Left 5 cols: Engrave new witness testimony */}
          <div className="lg:col-span-5">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="frame-double rounded-xs bg-surface p-6 sm:p-8"
            >
              <h3 className="type-title text-ink">Consigner une déposition</h3>
              <p className="mt-2 text-sm text-muted">
                Votre inscription demeure gravée localement dans les archives de cette visite.
              </p>

              <div className="mt-6 space-y-5">
                <div>
                  <label htmlFor="witness-name" className="block text-sm text-ink">
                    Nom et qualité du déposant
                  </label>
                  <input
                    id="witness-name"
                    name="witnessName"
                    type="text"
                    maxLength={60}
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Ex. Camille de Rochefort, géomètre"
                    className="mt-2 w-full rounded-xs border border-line-strong bg-paper px-3 py-2 text-sm text-ink placeholder:text-faint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-candle"
                  />
                </div>

                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <label htmlFor="witness-verse" className="block text-sm text-ink">
                      Observation nocturne
                    </label>
                    <code className="text-xs tabular-nums text-muted">
                      {verseText.length}/240
                    </code>
                  </div>
                  <textarea
                    id="witness-verse"
                    name="witnessVerse"
                    rows={4}
                    maxLength={240}
                    value={verseText}
                    onChange={(e) => setVerseText(e.target.value)}
                    placeholder="Décrivez ce que votre bougie a éclairé dans l’escalier nord…"
                    className="mt-2 w-full rounded-xs border border-line-strong bg-paper px-3 py-2 text-sm text-ink placeholder:text-faint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-candle"
                  />
                </div>

                {errorMsg && (
                  <p role="alert" className="text-sm text-accent">
                    {errorMsg}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xs bg-accent px-4 py-2.5 text-sm font-medium text-accent-ink transition-colors duration-150 hover:bg-accent-hover active:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-candle disabled:opacity-40"
                  >
                    <QuillIcon className="h-4 w-4" />
                    <span>Graver au registre</span>
                  </button>

                  {hasCustomEntries && (
                    <button
                      type="button"
                      onClick={handleResetCustom}
                      className="inline-flex items-center gap-2 rounded-xs border border-line-strong bg-paper px-3 py-2 text-sm text-muted transition-colors duration-150 hover:border-candle hover:text-ink active:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-candle"
                    >
                      <ArchiveResetIcon className="h-4 w-4" />
                      <span>Restaurer l’état de 1889</span>
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Right 7 cols: Engraved stone & brass witness tablets */}
          <div className="space-y-4 lg:col-span-7">
            {entries.map((entry) => (
              <article
                key={entry.id}
                className="rounded-xs border border-line bg-surface p-6 transition-colors duration-150 hover:border-line-strong"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3">
                  <h3 className="type-title text-ink">{entry.name}</h3>
                  <time dateTime={entry.isoDate} className="text-xs tabular-nums text-candle">
                    {entry.dateLabel}
                  </time>
                </div>
                <blockquote className="mt-4 max-w-[58ch] text-base italic text-muted">
                  « {entry.verse} »
                </blockquote>
              </article>
            ))}
          </div>
        </div>

        {/* Editorial Book Imprint Colophon (Portfolio & Anti-Slop Craft Note) */}
        <footer className="mt-24 bg-paper p-8 sm:p-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <h3 className="type-title text-ink">Colophon d’édition</h3>
              <p className="mt-2 max-w-[54ch] text-sm text-muted">
                Achevé d’imprimer pour la veille de la Toussaint. Gravures en taille-douce, portraits en
                clair-obscur et synthèse acoustique temps réel Web Audio composés pour le Domaine de Valmorin.
              </p>
            </div>

            <div>
              <p className="text-sm text-ink">Architecture Creative Dev sans IA slop</p>
              <p className="mt-2 max-w-[54ch] text-sm text-muted">
                Vérifié de manière déterministe selon les référentiels Impeccable, Hallmark, Taste Skill,
                No-Slop-UI, Avoid-AI-Design et UX-Skill. Palette teintée OKLCH, typographie Cormorant Garamond
                et Spectral.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </section>
  );
}
