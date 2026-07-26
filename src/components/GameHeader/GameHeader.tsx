import { useState } from "react";

export function GameHeader({ level, onPrevious, onRestart }: {
  level: number;
  onPrevious: () => void;
  onRestart: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="game-header">
      <button className="round-button" onClick={onPrevious} disabled={level === 0} aria-label="Previous level">‹</button>
      <div className="header-title"><span>PARCEL JAM</span><h1>{level === 0 ? "Tutorial" : `Level ${level}`}</h1></div>
      <div className="header-menu">
        <button className="round-button settings-button" onClick={() => setMenuOpen((open) => !open)} aria-label="Game menu">•••</button>
        {menuOpen && (
          <aside>
            <button onClick={() => { onRestart(); setMenuOpen(false); }}><span>↻</span> Restart</button>
            <button disabled><span>⚙</span> Settings</button>
          </aside>
        )}
      </div>
    </header>
  );
}
