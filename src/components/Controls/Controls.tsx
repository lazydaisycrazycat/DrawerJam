export function Controls({ canUndo, onUndo, onRestart }: { canUndo: boolean; onUndo: () => void; onRestart: () => void }) {
  return (
    <footer className="controls">
      <button onClick={onRestart}><span>↻</span>Restart</button>
      <button onClick={onUndo} disabled={!canUndo}><span>↶</span>Undo</button>
      <button disabled><span>···</span>Settings</button>
    </footer>
  );
}
