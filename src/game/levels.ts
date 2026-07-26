import type { Direction, LevelConfig, PackageItem, Truck, TruckColor } from "./types";

const truck = (
  id: string,
  row: number,
  col: number,
  color: TruckColor,
  direction: Direction,
  capacity = 3
): Truck => ({ id, row, col, color, direction, capacity });

function packagesFor(trucks: Truck[], pattern: TruckColor[]): PackageItem[] {
  const remaining: Record<TruckColor, number> = { red: 0, blue: 0, green: 0, yellow: 0 };
  trucks.forEach(({ color, capacity }) => { remaining[color] += capacity; });
  const result: PackageItem[] = [];
  while (Object.values(remaining).some((count) => count > 0)) {
    for (const color of pattern) {
      if (!remaining[color]) continue;
      result.push({ id: `package-${result.length}-${color}`, color });
      remaining[color] -= 1;
    }
  }
  return result;
}

const tutorialTrucks = [
  truck("tutorial-red", 3, 2, "red", "down"),
  truck("tutorial-blue", 1, 3, "blue", "up")
];

const level1Trucks = [
  truck("red-1a", 0, 0, "red", "up"),
  truck("blue-1a", 0, 4, "blue", "up"),
  truck("green-1", 4, 0, "green", "down"),
  truck("yellow-1", 4, 4, "yellow", "down"),
  truck("red-1b", 2, 0, "red", "left"),
  truck("blue-1b", 2, 4, "blue", "right")
];

const level2Trucks = [
  truck("green-2a", 0, 1, "green", "up"),
  truck("red-2a", 0, 3, "red", "up"),
  truck("blue-2a", 4, 1, "blue", "down"),
  truck("yellow-2a", 4, 3, "yellow", "down"),
  truck("red-2b", 1, 0, "red", "left"),
  truck("green-2b", 3, 0, "green", "left"),
  truck("blue-2b", 1, 4, "blue", "right"),
  truck("yellow-2b", 3, 4, "yellow", "right"),
  truck("red-2c", 1, 3, "red", "up")
];

const level3Trucks = [
  truck("yellow-3a", 0, 0, "yellow", "up-left"),
  truck("red-3a", 0, 2, "red", "up"),
  truck("blue-3a", 0, 4, "blue", "up-right"),
  truck("green-3a", 4, 0, "green", "down-left", 6),
  truck("yellow-3b", 4, 2, "yellow", "down"),
  truck("red-3b", 4, 4, "red", "down-right"),
  truck("blue-3b", 2, 0, "blue", "left"),
  truck("green-3b", 2, 4, "green", "right"),
  truck("red-3c", 1, 2, "red", "up"),
  truck("blue-3c", 3, 2, "blue", "down"),
  truck("yellow-3c", 2, 2, "yellow", "right")
];

const level4Trucks = [
  truck("blue-4a", 0, 0, "blue", "up-left", 6),
  truck("red-4a", 0, 2, "red", "up"),
  truck("green-4a", 0, 3, "green", "up"),
  truck("yellow-4a", 0, 5, "yellow", "up-right"),
  truck("red-4b", 5, 0, "red", "down-left"),
  truck("blue-4b", 5, 2, "blue", "down"),
  truck("yellow-4b", 5, 3, "yellow", "down", 6),
  truck("green-4b", 5, 5, "green", "down-right"),
  truck("yellow-4c", 2, 0, "yellow", "left"),
  truck("green-4c", 3, 0, "green", "left"),
  truck("red-4c", 2, 5, "red", "right"),
  truck("blue-4c", 3, 5, "blue", "right"),
  truck("green-4d", 1, 3, "green", "up"),
  truck("blue-4d", 4, 2, "blue", "down")
];

const level5Trucks = [
  truck("green-5a", 0, 0, "green", "up-left", 6),
  truck("yellow-5a", 0, 1, "yellow", "up"),
  truck("red-5a", 0, 3, "red", "up", 6),
  truck("blue-5a", 0, 5, "blue", "up-right"),
  truck("blue-5b", 5, 0, "blue", "down-left", 6),
  truck("green-5b", 5, 2, "green", "down"),
  truck("yellow-5b", 5, 4, "yellow", "down", 10),
  truck("red-5b", 5, 5, "red", "down-right"),
  truck("red-5c", 1, 0, "red", "left"),
  truck("yellow-5c", 3, 0, "yellow", "left"),
  truck("green-5c", 4, 0, "green", "left"),
  truck("green-5d", 1, 5, "green", "right"),
  truck("blue-5c", 2, 5, "blue", "right"),
  truck("red-5d", 4, 5, "red", "right"),
  truck("yellow-5d", 1, 3, "yellow", "up"),
  truck("blue-5d", 4, 2, "blue", "down"),
  truck("red-5e", 2, 2, "red", "up-left"),
  truck("green-5e", 3, 3, "green", "down-right")
];

export const levels: LevelConfig[] = [
  {
    id: 0, tutorial: true, rows: 5, cols: 5, parkingSize: 2, truckCapacity: 3, conveyorSeconds: 80,
    conveyorPoints: [{ x: -180, y: 165 }, { x: 92, y: 165 }, { x: 92, y: 52 }, { x: 268, y: 52 }, { x: 268, y: 150 }, { x: 342, y: 150 }],
    trucks: tutorialTrucks,
    packages: packagesFor(tutorialTrucks, ["red", "red", "red", "blue", "blue"])
  },
  {
    id: 1, rows: 5, cols: 5, parkingSize: 3, truckCapacity: 3, conveyorSeconds: 45,
    conveyorPoints: [{ x: -180, y: 165 }, { x: 92, y: 165 }, { x: 92, y: 52 }, { x: 268, y: 52 }, { x: 268, y: 150 }, { x: 342, y: 150 }],
    trucks: level1Trucks,
    packages: packagesFor(level1Trucks, ["red", "red", "blue", "green", "blue", "yellow"])
  },
  {
    id: 2, rows: 5, cols: 5, parkingSize: 3, truckCapacity: 3, conveyorSeconds: 48,
    conveyorPoints: [{ x: 540, y: 170 }, { x: 292, y: 170 }, { x: 292, y: 55 }, { x: 178, y: 55 }, { x: 178, y: 150 }, { x: 68, y: 150 }, { x: 68, y: 42 }, { x: 18, y: 42 }],
    trucks: level2Trucks,
    packages: packagesFor(level2Trucks, ["green", "red", "red", "blue", "yellow", "green", "blue"])
  },
  {
    id: 3, rows: 5, cols: 5, parkingSize: 4, truckCapacity: 3, conveyorSeconds: 52,
    conveyorPoints: [{ x: 52, y: -180 }, { x: 58, y: 45 }, { x: 132, y: 45 }, { x: 168, y: 112 }, { x: 210, y: 175 }, { x: 292, y: 175 }, { x: 342, y: 105 }],
    trucks: level3Trucks,
    packages: packagesFor(level3Trucks, ["yellow", "green", "green", "red", "blue", "yellow", "red", "blue"])
  },
  {
    id: 4, rows: 6, cols: 6, parkingSize: 4, truckCapacity: 3, conveyorSeconds: 56,
    conveyorPoints: [{ x: 85, y: 390 }, { x: 85, y: 170 }, { x: 85, y: 42 }, { x: 275, y: 42 }, { x: 275, y: 170 }, { x: 190, y: 170 }, { x: 190, y: 100 }, { x: 342, y: 100 }],
    trucks: level4Trucks,
    packages: packagesFor(level4Trucks, ["blue", "blue", "red", "yellow", "green", "red", "green", "yellow"])
  },
  {
    id: 5, rows: 6, cols: 6, parkingSize: 4, truckCapacity: 3, conveyorSeconds: 62,
    conveyorPoints: [{ x: -190, y: 45 }, { x: 62, y: 168 }, { x: 62, y: 45 }, { x: 150, y: 45 }, { x: 150, y: 170 }, { x: 238, y: 170 }, { x: 238, y: 45 }, { x: 305, y: 45 }, { x: 342, y: 108 }],
    trucks: level5Trucks,
    packages: packagesFor(level5Trucks, ["green", "yellow", "yellow", "red", "blue", "green", "red", "yellow", "blue"])
  }
];
