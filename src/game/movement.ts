import type { LevelConfig, ParkingTruck, Truck } from "./types";

export function canTruckExit(truck: Truck, allTrucks: Truck[], rows: number, cols: number): boolean {
  const occupied = new Set(allTrucks.filter((item) => item.id !== truck.id).map((item) => `${item.row}:${item.col}`));
  const [dr, dc] = {
    up: [-1, 0],
    down: [1, 0],
    left: [0, -1],
    right: [0, 1],
    "up-left": [-1, -1],
    "up-right": [-1, 1],
    "down-left": [1, -1],
    "down-right": [1, 1]
  }[truck.direction];
  for (let row = truck.row + dr, col = truck.col + dc; row >= 0 && row < rows && col >= 0 && col < cols; row += dr, col += dc) {
    if (occupied.has(`${row}:${col}`)) return false;
    if (dr !== 0 && dc !== 0) {
      const sideAlongRow = `${row}:${col - dc}`;
      const sideAlongColumn = `${row - dr}:${col}`;
      if (occupied.has(sideAlongRow) || occupied.has(sideAlongColumn)) return false;
    }
  }
  return true;
}

export function removeTruckFromField(trucks: Truck[], truckId: string): Truck[] {
  return trucks.filter((truck) => truck.id !== truckId);
}

export function addTruckToParking(parking: ParkingTruck[], truck: Truck): ParkingTruck[] {
  return [...parking, { truckId: truck.id, color: truck.color, capacity: truck.capacity, loaded: 0 }];
}

export function hasParkingSpace(parking: ParkingTruck[], level: LevelConfig): boolean {
  return parking.length < level.parkingSize;
}
