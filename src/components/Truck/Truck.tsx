import type { CSSProperties, MouseEvent } from "react";
import type { ParkingTruck, Truck as TruckType, TruckColor } from "../../game/types";

export const colorSymbols: Record<TruckColor, string> = {
  red: "●", blue: "■", green: "▲", yellow: "★"
};
type FieldProps = {
  truck: TruckType;
  blocked: boolean;
  moving: boolean;
  onClick: (element: HTMLButtonElement) => void;
};

export function Truck({ truck, blocked, moving, onClick }: FieldProps) {
  const width = truck.capacity === 10 ? "190%" : truck.capacity === 6 ? "145%" : "100%";
  const style = {
    gridRow: truck.row + 1,
    gridColumn: truck.col + 1,
    "--truck-width": width
  } as CSSProperties;

  return (
    <button
      className={`truck truck--${truck.color} truck--${truck.direction}${blocked ? " is-blocked" : ""}${moving ? " is-exiting" : ""}`}
      style={style}
      onClick={(event: MouseEvent<HTMLButtonElement>) => onClick(event.currentTarget)}
      aria-label={`${truck.color} truck, points ${truck.direction}`}
    >
      <span className="truck__cargo">{colorSymbols[truck.color]}</span>
      <span className="truck__arrow">→</span>
      <span className="truck__capacity">{truck.capacity}</span>
      <i className="truck__cab" />
      <i className="truck__wheel truck__wheel--one" />
      <i className="truck__wheel truck__wheel--two" />
    </button>
  );
}

export function ParkedTruck({ truck }: { truck: ParkingTruck }) {
  return (
    <div
      className={`parked-truck parked-truck--${truck.capacity} truck--${truck.color}`}
      data-parking-truck-id={truck.truckId}
    >
      <span>{colorSymbols[truck.color]}</span>
      <div
        className={`load-dots load-dots--${truck.capacity}`}
        aria-label={`${truck.loaded} of ${truck.capacity} packages loaded`}
      >
        {Array.from({ length: truck.capacity }, (_, index) => <i className={index < truck.loaded ? "filled" : ""} key={index} />)}
      </div>
    </div>
  );
}
