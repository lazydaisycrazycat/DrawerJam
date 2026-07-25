import type { ParkingTruck, Truck as TruckType, TruckColor } from "../../game/types";

export const colorSymbols: Record<TruckColor, string> = {
  red: "●", blue: "■", green: "▲", yellow: "★"
};
const arrows = { up: "↑", down: "↓", left: "←", right: "→" };

type FieldProps = { truck: TruckType; blocked: boolean; onClick: () => void };

export function Truck({ truck, blocked, onClick }: FieldProps) {
  return (
    <button
      className={`truck truck--${truck.color} truck--${truck.direction}${blocked ? " is-blocked" : ""}`}
      style={{ gridRow: truck.row + 1, gridColumn: truck.col + 1 }}
      onClick={onClick}
      aria-label={`${truck.color} truck, points ${truck.direction}`}
    >
      <span className="truck__cargo">{colorSymbols[truck.color]}</span>
      <span className="truck__arrow">{arrows[truck.direction]}</span>
      <i className="truck__cab" />
      <i className="truck__wheel truck__wheel--one" />
      <i className="truck__wheel truck__wheel--two" />
    </button>
  );
}

export function ParkedTruck({ truck }: { truck: ParkingTruck }) {
  return (
    <div className={`parked-truck truck--${truck.color}`}>
      <span>{colorSymbols[truck.color]}</span>
      <div className="load-dots" aria-label={`${truck.loaded} of ${truck.capacity} packages loaded`}>
        {Array.from({ length: truck.capacity }, (_, index) => <i className={index < truck.loaded ? "filled" : ""} key={index} />)}
      </div>
    </div>
  );
}
