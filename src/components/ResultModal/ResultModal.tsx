export function ResultModal({ status, hasNext, dangerLoss, onRestart, onNext }: {
  status: "won" | "lost"; hasNext: boolean; dangerLoss?: boolean; onRestart: () => void; onNext: () => void;
}) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      {status === "won" && <div className="confetti">{Array.from({ length: 18 }, (_, i) => <i key={i} />)}</div>}
      <div className={`result-modal result-modal--${status}`}>
        <div className="result-icon">{status === "won" ? "✓" : "!"}</div>
        <p>{status === "won" ? "DELIVERY COMPLETE" : dangerLoss ? "CONVEYOR OVERLOADED" : "PARKING IS FULL"}</p>
        <h2>{status === "won" ? "You win!" : "Parcel jammed!"}</h2>
        <span>{status === "won"
          ? "Every package found the right truck."
          : dangerLoss
            ? "A package reached the jam point. Keep the conveyor moving!"
            : "No parked truck matches the next package."}</span>
        {status === "won" && hasNext ? <button onClick={onNext}>Next level <b>→</b></button> : <button onClick={onRestart}>Try again <b>↻</b></button>}
      </div>
    </div>
  );
}
