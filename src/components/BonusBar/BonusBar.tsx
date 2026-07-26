const bonuses = [
  { icon: "↔", name: "Shuffle" },
  { icon: "◎", name: "Magnet" },
  { icon: "✦", name: "Swap" },
  { icon: "∞", name: "Buffer" }
];

export function BonusBar() {
  return (
    <section className="bonus-bar" aria-label="Locked bonuses">
      {bonuses.map((bonus, index) => (
        <button disabled key={bonus.name}>
          <i>{bonus.icon}</i>
          <span>{bonus.name}</span>
          <b>{index < 2 ? "★" : "SPECIAL"}</b>
        </button>
      ))}
    </section>
  );
}
