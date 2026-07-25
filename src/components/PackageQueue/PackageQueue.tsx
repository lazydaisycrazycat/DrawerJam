import type { PackageItem } from "../../game/types";
import { colorSymbols } from "../Truck/Truck";

export function PackageQueue({ packages, total }: { packages: PackageItem[]; total: number }) {
  const delivered = total - packages.length;
  return (
    <section className="queue-section">
      <div className="section-heading"><h2>Delivery route</h2><span>{packages.length} left</span></div>
      <div className="delivery-track">
        <span className="delivery-van" style={{ left: `${Math.min(91, 5 + (delivered / total) * 86)}%` }}>
          <i className="van-box" /><i className="van-cab" /><b /><b />
        </span>
        <div className="track-fill" style={{ width: `${(delivered / total) * 100}%` }} />
        <span className="depot">DEPOT</span>
      </div>
      <div className="package-queue">
        {packages.slice(0, 8).map((item, index) => (
          <div className={`package package--${item.color}${index === 0 ? " package--next" : ""}`} key={item.id}>
            <i /><b>{colorSymbols[item.color]}</b>
          </div>
        ))}
        {packages.length > 8 && <span className="queue-more">+{packages.length - 8}</span>}
        {!packages.length && <span className="queue-empty">All packages delivered</span>}
      </div>
    </section>
  );
}
