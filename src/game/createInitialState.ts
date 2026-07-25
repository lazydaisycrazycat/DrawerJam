import type { GameSnapshot, GameState, LevelConfig } from "./types";

export function createInitialState(level: LevelConfig): GameState {
  return {
    levelId: level.id,
    trucks: level.trucks.map((truck) => ({ ...truck })),
    parking: [],
    packages: level.packages.map((item) => ({ ...item })),
    conveyorProgress: 0.54,
    status: "playing"
  };
}

export function createSnapshot(state: GameState): GameSnapshot {
  return {
    trucks: state.trucks.map((truck) => ({ ...truck })),
    parking: state.parking.map((truck) => ({ ...truck })),
    packages: state.packages.map((item) => ({ ...item })),
    conveyorProgress: state.conveyorProgress,
    status: state.status
  };
}

export function restoreSnapshot(state: GameState, snapshot: GameSnapshot): GameState {
  return {
    ...state,
    trucks: snapshot.trucks.map((truck) => ({ ...truck })),
    parking: snapshot.parking.map((truck) => ({ ...truck })),
    packages: snapshot.packages.map((item) => ({ ...item })),
    conveyorProgress: snapshot.conveyorProgress,
    status: snapshot.status
  };
}
