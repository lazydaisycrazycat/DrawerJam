import type { Direction, LevelConfig, PackageItem, Truck, TruckColor } from "./types";

const truck = (
  id: string,
  row: number,
  col: number,
  color: TruckColor,
  direction: Direction,
  capacity = 3
): Truck => ({
  id, row, col, color, direction, capacity
});

const packages = (sequence: TruckColor[]): PackageItem[] =>
  sequence.map((color, index) => ({ id: `package-${index}-${color}`, color }));

export const levels: LevelConfig[] = [
  {
    id: 1, rows: 5, cols: 5, parkingSize: 3, truckCapacity: 3, conveyorSeconds: 48,
    conveyorPoints: [{ x: 18, y: 165 }, { x: 92, y: 165 }, { x: 92, y: 52 }, { x: 268, y: 52 }, { x: 268, y: 150 }, { x: 342, y: 150 }],
    trucks: [
      truck("red-1", 2, 2, "red", "down"),
      truck("blue-1", 2, 3, "blue", "up")
    ],
    packages: packages(["red", "red", "blue", "red", "blue", "blue"])
  },
  {
    id: 2, rows: 5, cols: 5, parkingSize: 3, truckCapacity: 3, conveyorSeconds: 45,
    conveyorPoints: [{ x: 18, y: 170 }, { x: 68, y: 170 }, { x: 68, y: 55 }, { x: 178, y: 55 }, { x: 178, y: 150 }, { x: 292, y: 150 }, { x: 292, y: 42 }, { x: 342, y: 42 }],
    trucks: [
      truck("green-1", 1, 3, "green", "up-right"),
      truck("red-2", 2, 2, "red", "down-right"),
      truck("blue-2", 1, 1, "blue", "up-left"),
      truck("decoy-2a", 2, 1, "yellow", "left"),
      truck("decoy-2b", 1, 2, "red", "up"),
      truck("decoy-2c", 3, 2, "yellow", "down")
    ],
    packages: packages(["green", "green", "red", "green", "blue", "blue", "blue", "red", "red"])
  },
  {
    id: 3, rows: 5, cols: 5, parkingSize: 3, truckCapacity: 3, conveyorSeconds: 42,
    conveyorPoints: [{ x: 18, y: 110 }, { x: 58, y: 45 }, { x: 132, y: 45 }, { x: 168, y: 112 }, { x: 210, y: 175 }, { x: 292, y: 175 }, { x: 342, y: 105 }],
    trucks: [
      truck("yellow-1", 1, 0, "yellow", "up-left"),
      truck("green-2", 4, 4, "green", "down-right", 6),
      truck("red-3", 0, 2, "red", "up-right"),
      truck("blue-3", 3, 4, "blue", "down-right"),
      truck("decoy-3a", 2, 2, "yellow", "right"),
      truck("decoy-3b", 2, 1, "green", "down"),
      truck("decoy-3c", 1, 3, "red", "up-right")
    ],
    packages: packages(["yellow", "green", "green", "red", "yellow", "blue", "green", "blue", "green", "blue", "green", "red", "green", "red", "yellow"])
  },
  {
    id: 4, rows: 6, cols: 6, parkingSize: 4, truckCapacity: 3, conveyorSeconds: 38,
    conveyorPoints: [{ x: 18, y: 170 }, { x: 85, y: 170 }, { x: 85, y: 42 }, { x: 275, y: 42 }, { x: 275, y: 170 }, { x: 190, y: 170 }, { x: 190, y: 100 }, { x: 342, y: 100 }],
    trucks: [
      truck("blue-4", 0, 5, "blue", "up-left", 6),
      truck("red-4a", 5, 1, "red", "down"),
      truck("yellow-4", 3, 0, "yellow", "down-left"),
      truck("green-4", 1, 5, "green", "up-right"),
      truck("red-4b", 4, 1, "red", "down"),
      truck("decoy-4a", 2, 2, "blue", "left"),
      truck("decoy-4b", 4, 4, "yellow", "down-right"),
      truck("decoy-4c", 5, 5, "green", "left"),
      truck("decoy-4d", 0, 0, "red", "right")
    ],
    packages: packages(["blue", "blue", "red", "yellow", "blue", "yellow", "green", "blue", "red", "blue", "red", "green", "blue", "green", "yellow"])
  },
  {
    id: 5, rows: 6, cols: 6, parkingSize: 4, truckCapacity: 10, conveyorSeconds: 52,
    conveyorPoints: [{ x: 18, y: 168 }, { x: 62, y: 168 }, { x: 62, y: 45 }, { x: 150, y: 45 }, { x: 150, y: 170 }, { x: 238, y: 170 }, { x: 238, y: 45 }, { x: 305, y: 45 }, { x: 342, y: 108 }],
    trucks: [
      truck("green-5", 2, 5, "green", "up-right", 6),
      truck("yellow-5", 2, 3, "yellow", "down-right", 10),
      truck("red-5", 5, 2, "red", "down", 3),
      truck("blue-5", 0, 4, "blue", "up", 6),
      truck("extra-5a", 4, 2, "yellow", "down"),
      truck("extra-5b", 1, 4, "red", "up"),
      truck("decoy-5a", 3, 0, "blue", "up-left"),
      truck("decoy-5b", 5, 5, "green", "left"),
      truck("decoy-5c", 1, 1, "blue", "down-left"),
      truck("decoy-5d", 0, 0, "yellow", "right")
    ],
    packages: packages([
      "green", "yellow", "yellow", "red", "green", "blue", "yellow", "blue",
      "yellow", "green", "yellow", "blue", "yellow", "red", "green", "blue",
      "yellow", "green", "yellow", "blue", "yellow", "green", "yellow", "blue"
    ])
  }
];
