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
        {Array.from({ length: 8 }, (_, index) => index < size ? (
          <div className="parking-slot" data-parking-slot={index} key={index}>
            <span className="slot-number">{index + 1}</span>
            {trucks.find((truck) => truck.slotIndex === index) && (
              <ParkedTruck truck={trucks.find((truck) => truck.slotIndex === index)!} />
            )}
          </div>
        ) : (
          <button className="parking-slot parking-slot--locked" key={index} aria-label="Unlock parking slot with Telegram Stars" disabled>
            <span>★</span><b>{index < 4 ? "UNLOCK" : "STARS"}</b>
          </button>
        ))}
      </div>
    </section>
  );
}
