import { useLayoutEffect, useState, type CSSProperties } from "react";
import type { PackageTransfer } from "../../game/packageProcessing";

type Flight = PackageTransfer & {
  startX: number;
  startY: number;
  middleX: number;
  middleY: number;
  endX: number;
  endY: number;
};

export function PackageTransferLayer({ transfers }: { transfers: PackageTransfer[] }) {
  const [flights, setFlights] = useState<Flight[]>([]);

  useLayoutEffect(() => {
    const shell = document.querySelector<HTMLElement>(".app-shell")?.getBoundingClientRect();
    if (!shell || !transfers.length) {
      setFlights([]);
      return;
    }
    setFlights(transfers.flatMap((transfer) => {
      const source = document.querySelector<SVGGElement>(`[data-package-id="${transfer.packageId}"]`);
      const target = document.querySelector<HTMLElement>(`[data-parking-truck-id="${transfer.truckId}"]`);
      if (!source || !target) return [];
      const from = source.getBoundingClientRect();
      const to = target.getBoundingClientRect();
      const startX = from.left + from.width / 2 - shell.left;
      const startY = from.top + from.height / 2 - shell.top;
      const endX = to.left + to.width / 2 - shell.left;
      const endY = to.top + to.height / 2 - shell.top;
      return [{
        ...transfer,
        startX,
        startY,
        middleX: (endX - startX) * 0.52,
        middleY: (endY - startY) * 0.52 - 42,
        endX: endX - startX,
        endY: endY - startY
      }];
    }));
  }, [transfers]);

  return (
    <div className="package-transfer-layer" aria-hidden="true">
      {flights.map((flight) => (
        <span
          className={`package-flight package--${flight.color}`}
          key={flight.packageId}
          style={{
            left: flight.startX,
            top: flight.startY,
            "--flight-mid-x": `${flight.middleX}px`,
            "--flight-mid-y": `${flight.middleY}px`,
            "--flight-end-x": `${flight.endX}px`,
            "--flight-end-y": `${flight.endY}px`
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
