import { useCallback, useEffect, useState } from "react";
import { createInitialState, createSnapshot, restoreSnapshot } from "../game/createInitialState";
import { levels } from "../game/levels";
import { addTruckToParking, canTruckExit, hasParkingSpace, removeTruckFromField } from "../game/movement";
import { processPackages } from "../game/packageProcessing";
import type { GameSnapshot } from "../game/types";
import { getGameStatus } from "../game/winLoseConditions";
import { useTelegram } from "./useTelegram";

type Feedback = { kind: "truck" | "parking"; id: string } | null;
const storageKey = "parcel-jam-progress";

function readUnlockedLevel(): number {
  try {
    return Number(localStorage.getItem(storageKey) ?? 1);
  } catch {
    return 1;
  }
}

function saveUnlockedLevel(level: number): void {
  try {
    localStorage.setItem(storageKey, String(Math.max(level, readUnlockedLevel())));
  } catch {
    // Storage may be disabled in a private or restricted WebView.
  }
}

export function useGame() {
  const [levelIndex, setLevelIndex] = useState(() => {
    const saved = readUnlockedLevel();
    return Math.min(Math.max(saved - 1, 0), levels.length - 1);
  });
  const level = levels[levelIndex];
  const [state, setState] = useState(() => createInitialState(level));
  const [history, setHistory] = useState<GameSnapshot[]>([]);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const telegram = useTelegram();

  const flash = useCallback((next: Feedback) => {
    setFeedback(next);
    window.setTimeout(() => setFeedback(null), 320);
  }, []);

  const selectTruck = useCallback((truckId: string) => {
    if (state.status !== "playing") return;
    const truck = state.trucks.find((item) => item.id === truckId);
    if (!truck) return;
    if (!canTruckExit(truck, state.trucks, level.rows, level.cols)) {
      flash({ kind: "truck", id: truckId });
      telegram.error();
      return;
    }
    if (!hasParkingSpace(state.parking, level)) {
      flash({ kind: "parking", id: "parking" });
      telegram.error();
      return;
    }
    setHistory((items) => [...items, createSnapshot(state)]);
    const trucks = removeTruckFromField(state.trucks, truck.id);
    const addedParking = addTruckToParking(state.parking, truck);
    const processed = processPackages(state.packages, addedParking);
    const status = getGameStatus(processed.packages, processed.parking, level.parkingSize);
    setState({ ...state, trucks, parking: processed.parking, packages: processed.packages, status });
    telegram.impact();
    if (status === "won") {
      telegram.success();
      const unlocked = Math.min(level.id + 1, levels.length);
      saveUnlockedLevel(unlocked);
    }
  }, [flash, level, state, telegram]);

  const restart = useCallback(() => {
    setState(createInitialState(level));
    setHistory([]);
    setFeedback(null);
  }, [level]);

  const undo = useCallback(() => {
    const snapshot = history.at(-1);
    if (!snapshot) return;
    setState((current) => restoreSnapshot(current, snapshot));
    setHistory((items) => items.slice(0, -1));
  }, [history]);

  const openLevel = useCallback((index: number) => {
    const safeIndex = Math.min(Math.max(index, 0), levels.length - 1);
    setLevelIndex(safeIndex);
  }, []);

  useEffect(() => {
    setState(createInitialState(level));
    setHistory([]);
    setFeedback(null);
  }, [level]);

  return {
    level, levelIndex, state, feedback, canUndo: history.length > 0,
    selectTruck, restart, undo,
    nextLevel: () => openLevel(levelIndex + 1),
    previousLevel: () => openLevel(levelIndex - 1),
    hasNextLevel: levelIndex < levels.length - 1
  };
}
