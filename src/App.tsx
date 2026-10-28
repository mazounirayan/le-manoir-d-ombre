import { useEffect, useState } from 'react';
import { CandlelightCanvas, type LightingMode } from './components/CandlelightCanvas';
import { ManorHeader } from './components/ManorHeader';
import { VestibuleHero } from './components/VestibuleHero';
import { PortraitGallery } from './components/PortraitGallery';
import { GrimoireBook } from './components/GrimoireBook';
import { CryptLedger } from './components/CryptLedger';
import { manorAudio } from './audio/manorAudio';
import { MANOR_ROOMS } from './data/valmorinData';

export function App() {
  const [soundOn, setSoundOn] = useState(false);
  const [lightingMode, setLightingMode] = useState<LightingMode>('lantern');
  const [activeRoom, setActiveRoom] = useState<string>('vestibule');

  // Observe active room during scrollytelling and trigger subtle wooden floorboard creaks
  useEffect(() => {
    const sections = MANOR_ROOMS.map((r) => document.getElementById(r.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveRoom((prev) => {
              if (prev !== entry.target.id) {
                manorAudio.playFloorboardCreak();
              }
              return entry.target.id;
            });
          }
        }
      },
      { rootMargin: '-35% 0px -45% 0px', threshold: 0.05 }
    );

    sections.forEach((sec) => observer.observe(sec));
    return () => observer.disconnect();
  }, []);

  const handleToggleSound = () => {
    const next = manorAudio.toggle();
    setSoundOn(next);
  };

  const handleEnterWithSound = () => {
    if (!soundOn) {
      manorAudio.start();
      setSoundOn(true);
    }
    setLightingMode('candle');
    const gallery = document.getElementById('galerie');
    if (gallery) {
      gallery.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleToggleLighting = () => {
    setLightingMode((prev) => (prev === 'candle' ? 'lantern' : 'candle'));
  };

  return (
    <div className="relative min-h-dvh bg-paper text-ink">
      <CandlelightCanvas mode={lightingMode} />

      <ManorHeader
        activeRoom={activeRoom}
        soundOn={soundOn}
        onToggleSound={handleToggleSound}
        lightingMode={lightingMode}
        onToggleLighting={handleToggleLighting}
      />

      <main className="relative z-10">
        <VestibuleHero soundOn={soundOn} onEnterWithSound={handleEnterWithSound} />
        <PortraitGallery />
        <GrimoireBook />
        <CryptLedger />
      </main>
    </div>
  );
}

export default App;
