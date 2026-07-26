import type { GameStatus, PackageItem, ParkingTruck } from "./types";

export function getGameStatus(
  packages: PackageItem[],
  _parking: ParkingTruck[],
  _parkingSize: number,
  _conveyorProgress = 0,
  overloadHealth = 1
): GameStatus {
  if (packages.length === 0) return "won";
  return overloadHealth <= 0 ? "lost" : "playing";
}
