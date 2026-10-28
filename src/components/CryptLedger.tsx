import { useEffect, useRef, useState, type FormEvent } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { QuillIcon, ArchiveResetIcon } from './GothicIcons';
import { withRedactions } from './RedactedPassage';
import { INITIAL_WITNESSES, type WitnessEntry } from '../data/valmorinData';
import { manorAudio } from '../audio/manorAudio';

const STORAGE_KEY = 'valmorin_witness_ledger_v1';

const formatClock = (d: Date) =>
  d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

export function CryptLedger() {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const formDriftY = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [12, -12]);
  const listDriftY = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [-10, 10]);
  const [entries, setEntries] = useState<WitnessEntry[]>(INITIAL_WITNESSES);
  const [authorName, setAuthorName] = useState('');
  const [verseText, setVerseText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [arrival] = useState(() => new Date());
  const [minutesInside, setMinutesInside] = useState(0);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as WitnessEntry[];
        if (Array.isArray(parsed) && parsed.length > 0) setEntries(parsed);
      }
    } catch {
      // Storage may be unavailable
    }
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setMinutesInside(Math.floor((Date.now() - arrival.getTime()) / 60000));
    }, 15000);
    return () => window.clearInterval(id);
  }, [arrival]);

  const hasCustomEntries = entries.length > INITIAL_WITNESSES.length;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cleanName = authorName.trim();
    const cleanVerse = verseText.trim();

    if (cleanName.length < 2) {
      setErrorMsg('Un nom, au moins deux lettres.');
      return;
    }
    if (cleanVerse.length < 12) {
      setErrorMsg('Ce que vous avez vu, en une phrase au moins.');
      return;
    }

    setErrorMsg(null);
    const today = new Date();
    const newEntry: WitnessEntry = {
      id: `witness-${Date.now()}`,
      name: cleanName,
      dateLabel: today.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
      isoDate: today.toISOString().slice(0, 10),
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

  const todayLabel = arrival.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const visitorVerse =
    minutesInside < 1
      ? `Entré à ${formatClock(arrival)}. Pas encore ressorti.`
      : `Entré à ${formatClock(arrival)}. Toujours là depuis ${minutesInside} min. Pas encore ressorti.`;

  return (
    <section
      ref={sectionRef}
      id="crypte"
      aria-labelledby="crypte-heading"
      className="bg-paper-deep py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        <header className="max-w-[60ch]">
          <h2 id="crypte-heading" className="type-headline text-ink">
            La crypte
          </h2>
          <p className="mt-4 max-w-[52ch] text-base text-ink">
            Ceux qui sont descendus ici depuis <time className="candle-gleam inline-block tabular-nums">1889</time> ont signé le registre.
          </p>
        </header>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12" data-ui="crypt-ledger">
          <motion.div style={{ y: formDriftY }} className="relative z-30 lg:col-span-5">
            <form onSubmit={handleSubmit} noValidate className="frame-double rounded-xs bg-surface p-6 sm:p-8">
              <h3 className="type-title text-ink">Signer</h3>
              <p className="mt-2 text-sm text-muted">Votre nom restera ici.</p>

              <div className="mt-6 space-y-5">
                <div>
                  <label htmlFor="witness-name" className="block text-sm text-ink">
                    Nom
                  </label>
                  <input
                    id="witness-name"
                    name="witnessName"
                    type="text"
                    maxLength={60}
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Camille Rochefort"
                    className="mt-2 w-full rounded-xs border border-line-strong bg-paper px-3 py-2 text-sm text-ink placeholder:text-faint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-candle"
                  />
                </div>

                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <label htmlFor="witness-verse" className="block text-sm text-ink">
                      Ce que vous avez vu
                    </label>
                    <code className="text-sm tabular-nums text-muted">{verseText.length}/240</code>
                  </div>
                  <textarea
                    id="witness-verse"
                    name="witnessVerse"
                    rows={4}
                    maxLength={240}
                    value={verseText}
                    onChange={(e) => setVerseText(e.target.value)}
                    placeholder="Dans l’escalier nord…"
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
                    <span>Signer le registre</span>
                  </button>

                  {hasCustomEntries && (
                    <button
                      type="button"
                      onClick={handleResetCustom}
                      className="inline-flex items-center gap-2 rounded-xs border border-line-strong bg-paper px-3 py-2 text-sm text-muted transition-colors duration-150 hover:border-candle hover:text-ink active:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-candle"
                    >
                      <ArchiveResetIcon className="h-4 w-4" />
                      <span>Effacer vos signatures</span>
                    </button>
                  )}
                </div>
              </div>
            </form>
          </motion.div>

          <motion.div style={{ y: listDriftY }} className="relative z-30 space-y-4 lg:col-span-7">
            {/* The ledger already knows the visitor's real arrival time. */}
            <article className="rounded-xs border border-line-strong bg-surface p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3">
                <h3 className="type-title text-ink">Visiteur sans nom</h3>
                <time dateTime={arrival.toISOString().slice(0, 10)} className="candle-gleam inline-block text-sm tabular-nums text-candle">
                  {todayLabel}
                </time>
              </div>
              <p className="mt-4 text-base italic text-candle">{visitorVerse}</p>
            </article>

            {entries.map((entry) => (
              <article key={entry.id} className="rounded-xs border border-line bg-surface p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3">
                  <h3 className="type-title text-ink">{entry.name}</h3>
                  <time dateTime={entry.isoDate} className="candle-gleam inline-block text-sm tabular-nums text-candle">
                    {entry.dateLabel}
                  </time>
                </div>
                <p className="mt-4 max-w-[58ch] text-base italic text-ink">
                  « {withRedactions(entry.verse, 'dark')} »
                </p>
              </article>
            ))}
          </motion.div>
        </div>

        <footer className="mt-24 pt-6 text-sm text-muted">
          <p>Fin de l’inventaire. Archives de Seine-Inférieure, cote 4 E 1889/31.</p>
        </footer>
      </div>
    </section>
  );
}
