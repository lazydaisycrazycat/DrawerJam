import type { Direction, LevelConfig, PackageItem, Truck, TruckColor } from "./types";

const truck = (id: string, row: number, col: number, color: TruckColor, direction: Direction): Truck => ({
  id, row, col, color, direction, capacity: 3
});

const packages = (sequence: TruckColor[]): PackageItem[] =>
  sequence.flatMap((color, group) =>
    Array.from({ length: 3 }, (_, item) => ({ id: `${color}-${group}-${item}`, color }))
  );

export const levels: LevelConfig[] = [
  {
    id: 1, rows: 5, cols: 5, parkingSize: 4, truckCapacity: 3,
    trucks: [
      truck("red-1", 4, 1, "red", "down"),
      truck("blue-1", 0, 3, "blue", "up")
    ],
    packages: packages(["red", "blue"])
  },
  {
    id: 2, rows: 5, cols: 5, parkingSize: 4, truckCapacity: 3,
    trucks: [
      truck("green-1", 2, 4, "green", "right"),
      truck("red-2", 2, 2, "red", "right"),
      truck("blue-2", 0, 1, "blue", "up")
    ],
    packages: packages(["green", "red", "blue"])
  },
  {
    id: 3, rows: 5, cols: 5, parkingSize: 4, truckCapacity: 3,
    trucks: [
      truck("yellow-1", 1, 0, "yellow", "left"),
      truck("green-2", 4, 4, "green", "down"),
      truck("red-3", 0, 2, "red", "up"),
      truck("blue-3", 3, 4, "blue", "right")
    ],
    packages: packages(["yellow", "green", "red", "blue"])
  },
  {
    id: 4, rows: 6, cols: 6, parkingSize: 4, truckCapacity: 3,
    trucks: [
      truck("blue-4", 0, 5, "blue", "up"),
      truck("red-4a", 5, 1, "red", "down"),
      truck("yellow-4", 3, 0, "yellow", "left"),
      truck("green-4", 1, 5, "green", "right"),
      truck("red-4b", 4, 1, "red", "down")
    ],
    packages: packages(["blue", "red", "yellow", "green"])
  },
  {
    id: 5, rows: 6, cols: 6, parkingSize: 4, truckCapacity: 3,
    trucks: [
      truck("green-5", 2, 5, "green", "right"),
      truck("yellow-5", 2, 3, "yellow", "right"),
      truck("red-5", 5, 2, "red", "down"),
      truck("blue-5", 0, 4, "blue", "up"),
      truck("extra-5a", 4, 2, "yellow", "down"),
      truck("extra-5b", 1, 4, "red", "up")
    ],
    packages: packages(["green", "yellow", "red", "blue"])
  }
];
