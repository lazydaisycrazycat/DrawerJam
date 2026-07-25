import { useCallback, useEffect, useState } from "react";
import { createInitialState, createSnapshot, restoreSnapshot } from "../game/createInitialState";
import { levels } from "../game/levels";
import { addTruckToParking, canTruckExit, hasParkingSpace, removeTruckFromField } from "../game/movement";
import { canProcessNextPackage, processNextPackage } from "../game/packageProcessing";
import type { GameSnapshot } from "../game/types";
import { getGameStatus } from "../game/winLoseConditions";
import { useTelegram } from "./useTelegram";

type Feedback = { kind: "truck" | "parking"; id: string } | null;
const storageKey = "parcel-jam-progress";
const packageSpacing = 0.068;

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
  const [isProcessing, setIsProcessing] = useState(false);
  const telegram = useTelegram();

  const flash = useCallback((next: Feedback) => {
    setFeedback(next);
    window.setTimeout(() => setFeedback(null), 320);
  }, []);

  const selectTruck = useCallback((truckId: string) => {
    if (state.status !== "playing" || isProcessing) return;
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
    setState({ ...state, trucks, parking: addedParking, status: "playing" });
    setIsProcessing(true);
    telegram.impact();
  }, [flash, isProcessing, level, state, telegram]);

  useEffect(() => {
    if (!isProcessing) return;
    const timer = window.setTimeout(() => {
      if (canProcessNextPackage(state.packages, state.parking)) {
        const next = processNextPackage(state.packages, state.parking);
        const conveyorProgress = Math.max(0.12, state.conveyorProgress - packageSpacing);
        const status = getGameStatus(next.packages, next.parking, level.parkingSize, conveyorProgress);
        setState((current) => current.status === "lost" ? current : {
          ...current, packages: next.packages, parking: next.parking, conveyorProgress, status
        });
        if (status === "won") {
          telegram.success();
          saveUnlockedLevel(Math.min(level.id + 1, levels.length));
          setIsProcessing(false);
        }
      } else {
        const status = getGameStatus(state.packages, state.parking, level.parkingSize, state.conveyorProgress);
        setState((current) => ({ ...current, status }));
        setIsProcessing(false);
      }
    }, 210);
    return () => window.clearTimeout(timer);
  }, [isProcessing, level.id, level.parkingSize, state.conveyorProgress, state.packages, state.parking, telegram]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setState((current) => {
        if (current.status !== "playing" || current.packages.length === 0) return current;
        const conveyorProgress = Math.min(1, current.conveyorProgress + 0.1 / level.conveyorSeconds);
        const status = getGameStatus(current.packages, current.parking, level.parkingSize, conveyorProgress);
        return { ...current, conveyorProgress, status };
      });
    }, 100);
    return () => window.clearInterval(interval);
  }, [level.conveyorSeconds, level.parkingSize]);

  useEffect(() => {
    if (state.status === "lost") {
      setIsProcessing(false);
      telegram.error();
    }
  }, [state.status, telegram]);

  const restart = useCallback(() => {
    setState(createInitialState(level));
    setHistory([]);
    setFeedback(null);
    setIsProcessing(false);
  }, [level]);

  const undo = useCallback(() => {
    const snapshot = history.at(-1);
    if (!snapshot) return;
    setState((current) => restoreSnapshot(current, snapshot));
    setHistory((items) => items.slice(0, -1));
    setIsProcessing(false);
  }, [history]);

  const openLevel = useCallback((index: number) => {
    const safeIndex = Math.min(Math.max(index, 0), levels.length - 1);
    setLevelIndex(safeIndex);
  }, []);

  useEffect(() => {
    setState(createInitialState(level));
    setHistory([]);
    setFeedback(null);
    setIsProcessing(false);
  }, [level]);

  return {
    level, levelIndex, state, feedback, isProcessing, canUndo: history.length > 0 && !isProcessing,
    selectTruck, restart, undo,
    nextLevel: () => openLevel(levelIndex + 1),
    previousLevel: () => openLevel(levelIndex - 1),
    hasNextLevel: levelIndex < levels.length - 1
  };
}
