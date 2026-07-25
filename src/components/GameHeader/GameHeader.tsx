export function GameHeader({ level, onPrevious }: { level: number; onPrevious: () => void }) {
  return (
    <header className="game-header">
      <button className="round-button" onClick={onPrevious} disabled={level === 1} aria-label="Previous level">‹</button>
      <div><span>PARCEL JAM</span><h1>Level {level}</h1></div>
      <button className="round-button settings-button" aria-label="Settings" disabled>•••</button>
    </header>
  );
}
