import type { ParkingTruck } from "../../game/types";
import { ParkedTruck } from "../Truck/Truck";

export function Parking({ trucks, size, fullFeedback }: {
  trucks: ParkingTruck[];
  size: number;
  fullFeedback: boolean;
}) {
  return (
    <section className={`parking-section${fullFeedback ? " is-shaking" : ""}`}>
      <div className="section-heading"><h2>Parking</h2><span>{trucks.length}/{size}</span></div>
      <div className="parking">
        {Array.from({ length: size }, (_, index) => (
          <div className="parking-slot" data-parking-slot={index} key={index}>
            <span className="slot-number">{index + 1}</span>
            {trucks.find((truck) => truck.slotIndex === index) && (
              <ParkedTruck truck={trucks.find((truck) => truck.slotIndex === index)!} />
            )}
          </div>
        ))}
        {size < 4 && <div className="parking-slot parking-slot--locked"><span>+</span><b>LOCKED</b></div>}
      </div>
    </section>
  );
}
