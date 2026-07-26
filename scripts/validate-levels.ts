import { createInitialState } from "../src/game/createInitialState";
import { levels } from "../src/game/levels";
import { addTruckToParking, canTruckExit, hasParkingSpace, removeTruckFromField } from "../src/game/movement";
import { processPackageWave, processPackages } from "../src/game/packageProcessing";
import type { GameState, LevelConfig } from "../src/game/types";
import { getGameStatus } from "../src/game/winLoseConditions";

function stateKey(state: GameState): string {
  return [
    state.trucks.map((truck) => truck.id).sort().join(","),
    state.parking.map((truck) => `${truck.truckId}:${truck.loaded}`).join(","),
    state.packages.length
  ].join("|");
}

function solve(level: LevelConfig): string[] | null {
  const visited = new Set<string>();
  function search(state: GameState, moves: string[]): string[] | null {
    if (state.status === "won") return moves;
    if (state.status === "lost" || visited.has(stateKey(state))) return null;
    visited.add(stateKey(state));
    for (const truck of state.trucks) {
      if (!hasParkingSpace(state.parking, level) || !canTruckExit(truck, state.trucks, level.rows, level.cols)) continue;
      const parking = addTruckToParking(state.parking, truck);
      const result = processPackages(state.packages, parking);
      const next: GameState = {
        ...state,
        trucks: removeTruckFromField(state.trucks, truck.id),
        parking: result.parking,
        packages: result.packages,
        status: getGameStatus(result.packages, result.parking, level.parkingSize)
      };
      const solution = search(next, [...moves, truck.id]);
      if (solution) return solution;
    }
    return null;
  }
  return search(createInitialState(level), []);
}

for (const level of levels) {
  const packageCapacity = new Map<string, number>();
  const truckCapacity = new Map<string, number>();
  for (const item of level.packages) {
    packageCapacity.set(item.color, (packageCapacity.get(item.color) ?? 0) + 1);
  }
  for (const truck of level.trucks) {
    truckCapacity.set(truck.color, (truckCapacity.get(truck.color) ?? 0) + truck.capacity);
  }
  for (const [color, count] of packageCapacity) {
    if (truckCapacity.get(color) !== count) {
      throw new Error(
        `Level ${level.id}: ${color} package count (${count}) does not match truck capacity (${truckCapacity.get(color) ?? 0})`
      );
    }
  }
  const solution = solve(level);
  if (!solution) throw new Error(`Level ${level.id} has no solution`);
  console.log(`Level ${level.id}: ${solution.join(" -> ")}`);
}

const visibilityCheck = processPackageWave(
  [
    { id: "visible-red", color: "red" },
    { id: "hidden-blue", color: "blue" }
  ],
  [{ truckId: "blue-truck", color: "blue", capacity: 3, loaded: 0 }],
  1
);
if (visibilityCheck.loaded !== 0 || visibilityCheck.packages.length !== 2) {
  throw new Error("A truck loaded a package that was not visible on the conveyor");
}
console.log("Visibility rule: hidden packages cannot be loaded");

const diagonalTruck = {
  id: "diagonal",
  row: 2,
  col: 2,
  color: "red" as const,
  direction: "up-right" as const,
  capacity: 3
};
const cornerBlocker = {
  id: "corner-blocker",
  row: 1,
  col: 2,
  color: "blue" as const,
  direction: "up" as const,
  capacity: 3
};
if (canTruckExit(diagonalTruck, [diagonalTruck, cornerBlocker], 5, 5)) {
  throw new Error("A diagonal truck passed through an occupied corner");
}
if (!canTruckExit(diagonalTruck, [diagonalTruck], 5, 5)) {
  throw new Error("A diagonal truck with a clear corridor was blocked");
}
console.log("Diagonal rule: trucks cannot pass through occupied corners");
