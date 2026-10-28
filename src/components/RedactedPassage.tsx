import { useState, type ReactNode } from 'react';
import { manorAudio } from '../audio/manorAudio';

type RedactionSurface = 'vellum' | 'dark';

interface RedactedChipProps {
  secret: string;
  surface: RedactionSurface;
}

function RedactedChip({ secret, surface }: RedactedChipProps) {
  const [revealed, setRevealed] = useState(false);

  const handleToggle = () => {
    setRevealed((prev) => {
      const next = !prev;
      if (next) {
        manorAudio.playSuddenKnock();
      } else {
        manorAudio.playPageTurn();
      }
      return next;
    });
  };

  if (revealed) {
    const revealedClass =
      surface === 'vellum'
        ? 'bg-vellum-deep text-vellum-ink hover:bg-vellum active:bg-vellum-deep focus-visible:outline-accent'
        : 'bg-surface-raised text-ink hover:bg-surface active:bg-paper focus-visible:outline-candle';

    return (
      <button
        type="button"
        aria-expanded="true"
        onClick={handleToggle}
        className={`inline rounded-xs px-1.5 py-0.5 italic underline decoration-accent decoration-2 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40 ${revealedClass}`}
      >
        {secret}
      </button>
    );
  }

  const sealedClass =
    surface === 'vellum'
      ? 'bg-paper text-ink hover:bg-surface-raised active:bg-paper-deep focus-visible:outline-accent'
      : 'bg-paper-deep text-candle hover:bg-surface-raised active:bg-paper focus-visible:outline-candle';

  return (
    <button
      type="button"
      aria-expanded="false"
      aria-label="Lire sous la rature du notaire"
      onClick={handleToggle}
      className={`inline rounded-xs px-1.5 py-0.5 text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40 ${sealedClass}`}
    >
      <code>[caviardé]</code>
    </button>
  );
}

// Parses [[...]] segments into interactive notary redactions that reveal what was struck out.
export function withRedactions(text: string, surface: RedactionSurface = 'vellum'): ReactNode[] {
  return text.split(/(\[\[.+?\]\])/g).map((part, i) => {
    const id = `${i}-${part.slice(0, 14)}`;
    if (part.startsWith('[[') && part.endsWith(']]')) {
      return <RedactedChip key={id} secret={part.slice(2, -2)} surface={surface} />;
    }
    return <span key={id}>{part}</span>;
  });
}
