import { useEffect, useRef, useState } from 'react';
import { candleCoords } from '../utils/candleState';
import { FlameIcon } from './GothicIcons';

interface HiddenInscriptionProps {
  text: string;
  align?: 'left' | 'right';
}

export function HiddenInscription({ text, align = 'left' }: HiddenInscriptionProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let rafId = 0;
    const checkProximity = () => {
      if (!pinned && candleCoords.hasMoved) {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width * 0.5;
        const centerY = rect.top + rect.height * 0.5;
        const dist = Math.hypot(candleCoords.x - centerX, candleCoords.y - centerY);
        const isNear = dist < 220;
        setRevealed((prev) => (prev !== isNear ? isNear : prev));
      }
      rafId = window.requestAnimationFrame(checkProximity);
    };

    rafId = window.requestAnimationFrame(checkProximity);
    return () => window.cancelAnimationFrame(rafId);
  }, [pinned]);

  const isVisible = revealed || pinned;

  return (
    <div
      ref={ref}
      data-ui="wall-inscription"
      className={`flex ${align === 'right' ? 'justify-end' : 'justify-start'}`}
    >
      <div className="inline-flex max-w-[60ch] flex-wrap items-center gap-3 rounded-xs border border-line bg-surface px-3.5 py-2 text-sm">
        <FlameIcon
          filled={isVisible}
          className={`h-4 w-4 shrink-0 ${isVisible ? 'text-candle' : 'text-muted'}`}
        />
        {isVisible ? (
          <p className="max-w-[52ch] italic text-candle">{text}</p>
        ) : (
          <p className="text-muted">Entaille sous la suie : approchez votre flamme.</p>
        )}
        <button
          type="button"
          onClick={() => setPinned((prev) => !prev)}
          aria-pressed={pinned}
          className="whitespace-nowrap rounded-xs border border-line-strong bg-paper px-2.5 py-1 text-xs text-ink transition-colors duration-150 hover:border-candle active:bg-surface-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-candle disabled:opacity-40"
        >
          {isVisible ? 'Masquer' : 'Déchiffrer'}
        </button>
      </div>
    </div>
  );
}
