import type { ParkingTruck } from "../../game/types";
import type { PackageTransfer } from "../../game/packageProcessing";
import { ParkedTruck } from "../Truck/Truck";

export function Parking({ trucks, size, fullFeedback, transfers }: {
  trucks: ParkingTruck[];
  size: number;
  fullFeedback: boolean;
  transfers: PackageTransfer[];
}) {
  return (
    <section className={`parking-section${fullFeedback ? " is-shaking" : ""}`}>
      <div className="section-heading"><h2>Parking</h2><span>{trucks.length}/{size}</span></div>
      <div className="parking">
        {Array.from({ length: size }, (_, index) => (
          <div className="parking-slot" key={index}>
            <span className="slot-number">{index + 1}</span>
            {trucks[index] && <ParkedTruck truck={trucks[index]} />}
          </div>
        ))}
        {size < 4 && <div className="parking-slot parking-slot--locked"><span>+</span><b>LOCKED</b></div>}
        {transfers.map((transfer) => {
          const slot = Math.max(0, trucks.findIndex((truck) => truck.truckId === transfer.truckId));
          return (
            <span
              className={`package-flight package--${transfer.color}`}
              style={{ left: `${(slot + 0.5) * 25}%` }}
              key={transfer.packageId}
            />
          );
        })}
      </div>
    </section>
  );
}
