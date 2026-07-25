import { createInitialState } from "../src/game/createInitialState";
import { levels } from "../src/game/levels";
import { addTruckToParking, canTruckExit, hasParkingSpace, removeTruckFromField } from "../src/game/movement";
import { processPackages } from "../src/game/packageProcessing";
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
  const solution = solve(level);
  if (!solution) throw new Error(`Level ${level.id} has no solution`);
  console.log(`Level ${level.id}: ${solution.join(" -> ")}`);
}
