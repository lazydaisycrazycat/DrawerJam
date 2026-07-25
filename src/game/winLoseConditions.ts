import type { GameStatus, PackageItem, ParkingTruck } from "./types";

export function getGameStatus(
  packages: PackageItem[],
  parking: ParkingTruck[],
  parkingSize: number,
  conveyorProgress = 0
): GameStatus {
  if (packages.length === 0) return "won";
  if (conveyorProgress >= 1) return "lost";
  if (parking.length < parkingSize) return "playing";
  const first = packages[0];
  return parking.some((truck) => truck.color === first.color && truck.loaded < truck.capacity) ? "playing" : "lost";
}
