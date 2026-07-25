export type TruckColor = "red" | "blue" | "green" | "yellow";
export type Direction = "up" | "down" | "left" | "right";
export type GameStatus = "playing" | "won" | "lost";

export type Truck = {
  id: string;
  row: number;
  col: number;
  color: TruckColor;
  direction: Direction;
  capacity: number;
};

export type PackageItem = {
  id: string;
  color: TruckColor;
};

export type ParkingTruck = {
  truckId: string;
  color: TruckColor;
  capacity: number;
  loaded: number;
};

export type LevelConfig = {
  id: number;
  rows: number;
  cols: number;
  parkingSize: number;
  truckCapacity: number;
  conveyorSeconds: number;
  conveyorPoints: Array<{ x: number; y: number }>;
  trucks: Truck[];
  packages: PackageItem[];
};

export type GameState = {
  levelId: number;
  trucks: Truck[];
  parking: ParkingTruck[];
  packages: PackageItem[];
  conveyorProgress: number;
  status: GameStatus;
};

export type GameSnapshot = Pick<GameState, "trucks" | "parking" | "packages" | "conveyorProgress" | "status">;
