import type { PackageItem } from "../../game/types";
import { colorSymbols } from "../Truck/Truck";

export function PackageQueue({ packages }: { packages: PackageItem[] }) {
  return (
    <section className="queue-section">
      <div className="section-heading"><h2>Package queue</h2><span>{packages.length} left</span></div>
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
