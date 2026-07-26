export function Controls({ onRestart }: { onRestart: () => void }) {
  return (
    <footer className="controls">
      <button onClick={onRestart}><span>↻</span>Restart</button>
      <button disabled><span>···</span>Settings</button>
    </footer>
  );
}
