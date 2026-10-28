import { FlameIcon, LanternIcon, SpeakerOnIcon, SpeakerOffIcon } from './GothicIcons';
import { MANOR_ROOMS } from '../data/valmorinData';
import type { LightingMode } from './CandlelightCanvas';

interface ManorHeaderProps {
  activeRoom: string;
  soundOn: boolean;
  onToggleSound: () => void;
  lightingMode: LightingMode;
  onToggleLighting: () => void;
}

export function ManorHeader({
  activeRoom,
  soundOn,
  onToggleSound,
  lightingMode,
  onToggleLighting,
}: ManorHeaderProps) {
  return (
    <header
      data-ui="manor-nav"
      className="sticky top-0 z-40 border-b border-line bg-paper px-4 py-3 sm:px-8"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <a
          href="#vestibule"
          className="brand-wordmark font-display text-lg font-semibold text-ink transition-colors duration-150 hover:text-candle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-candle"
        >
          Valmorin <code className="ml-1 text-xs text-candle">1889</code>
        </a>

        <nav aria-label="Pièces du manoir" className="hidden items-center gap-6 md:flex">
          {MANOR_ROOMS.map((room) => {
            const isCurrent = activeRoom === room.id;
            return (
              <a
                key={room.id}
                href={`#${room.id}`}
                aria-current={isCurrent ? 'location' : undefined}
                className={`text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-candle ${
                  isCurrent ? 'text-candle' : 'text-muted hover:text-ink'
                }`}
              >
                <span className="mr-1.5 text-xs text-faint">{room.numeral}.</span>
                {room.label}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleLighting}
            aria-pressed={lightingMode === 'candle'}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-xs border border-line-strong bg-surface px-3 py-1.5 text-xs text-ink transition-colors duration-150 hover:border-candle hover:bg-surface-raised active:bg-paper-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-candle disabled:opacity-40"
          >
            {lightingMode === 'candle' ? (
              <>
                <FlameIcon filled className="h-3.5 w-3.5 text-candle" />
                <span>Chandelle</span>
              </>
            ) : (
              <>
                <LanternIcon className="h-3.5 w-3.5 text-candle" />
                <span>Veilleuse</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onToggleSound}
            aria-pressed={soundOn}
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xs border px-3 py-1.5 text-xs transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-candle disabled:opacity-40 ${
              soundOn
                ? 'border-candle bg-surface-raised text-ink'
                : 'border-line-strong bg-surface text-muted hover:border-candle hover:text-ink active:bg-paper-deep'
            }`}
          >
            {soundOn ? (
              <>
                <SpeakerOnIcon className="h-3.5 w-3.5 text-candle" />
                <span>Son actif</span>
              </>
            ) : (
              <>
                <SpeakerOffIcon className="h-3.5 w-3.5" />
                <span>Silence</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
