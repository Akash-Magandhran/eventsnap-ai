import { useEffect, useState } from 'react';
import './ResolvingGrid.css';

// 16 placeholder event-photo thumbnails using picsum with fixed seeds for
// consistent portrait-like crops across reloads.
const PHOTOS = Array.from({ length: 16 }, (_, i) => `https://picsum.photos/seed/eventsnap${i}/200/200`);

export default function ResolvingGrid() {
  const [targetIndex, setTargetIndex] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setTargetIndex((prev) => {
        let next = Math.floor(Math.random() * 16);
        while (next === prev) next = Math.floor(Math.random() * 16);
        return next;
      });
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="resolving-grid" aria-hidden="true">
      <div className="rg-scan-line" />
      <div className="rg-grid">
        {PHOTOS.map((src, i) => (
          <div key={i} className={`rg-cell ${i === targetIndex ? 'is-target' : ''}`}>
            <img src={src} alt="" loading="lazy" />
            <div className="rg-reticle">
              <span className="rg-corner tl" />
              <span className="rg-corner tr" />
              <span className="rg-corner bl" />
              <span className="rg-corner br" />
            </div>
            {i === targetIndex && <span className="rg-match-badge">98.4% MATCH</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
