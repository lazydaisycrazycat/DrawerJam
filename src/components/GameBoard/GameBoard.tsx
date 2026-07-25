import type { LevelConfig, Truck as TruckType } from "../../game/types";
import { Truck } from "../Truck/Truck";

type Props = {
  level: LevelConfig;
  trucks: TruckType[];
  blockedTruckId?: string;
  onTruckClick: (id: string) => void;
};

export function GameBoard({ level, trucks, blockedTruckId, onTruckClick }: Props) {
  return (
    <section className="board-wrap" aria-label="Truck yard">
      <div className="road road--top" /><div className="road road--right" />
      <div className="road road--bottom" /><div className="road road--left" />
      <div className="game-board" style={{ gridTemplateColumns: `repeat(${level.cols}, 1fr)`, gridTemplateRows: `repeat(${level.rows}, 1fr)` }}>
        {Array.from({ length: level.rows * level.cols }, (_, index) => <i className="grid-cell" key={index} />)}
        {trucks.map((truck) => (
          <Truck key={truck.id} truck={truck} blocked={blockedTruckId === truck.id} onClick={() => onTruckClick(truck.id)} />
        ))}
      </div>
    </section>
  );
}
