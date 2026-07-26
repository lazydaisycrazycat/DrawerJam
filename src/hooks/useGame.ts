import { useCallback, useEffect, useState } from "react";
import { createInitialState } from "../game/createInitialState";
import { levels } from "../game/levels";
import { addTruckToParking, canTruckExit, hasParkingSpace, removeTruckFromField } from "../game/movement";
import {
  applyPackageTransfers,
  canProcessNextPackage,
  CONVEYOR_PACKAGE_SPACING,
  getVisiblePackageCount,
  type PackageTransfer,
  processPackageWave
} from "../game/packageProcessing";
import { getGameStatus } from "../game/winLoseConditions";
import { useTelegram } from "./useTelegram";
import type { TutorialStep } from "../components/TutorialHint/TutorialHint";

type Feedback = { kind: "truck" | "parking"; id: string } | null;
type MovingTruck = { id: string; slotIndex: number };
const storageKey = "parcel-jam-progress";
const TRUCK_TRAVEL_MS = 1120;

function readUnlockedLevel(): number {
  try {
    return Number(localStorage.getItem(storageKey) ?? 0);
  } catch {
    return 0;
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
    return Math.min(Math.max(saved, 0), levels.length - 1);
  });
  const level = levels[levelIndex];
  const [state, setState] = useState(() => createInitialState(level));
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [movingTrucks, setMovingTrucks] = useState<MovingTruck[]>([]);
  const [packageTransfers, setPackageTransfers] = useState<PackageTransfer[]>([]);
  const [fogCleared, setFogCleared] = useState(false);
  const telegram = useTelegram();
  const visiblePackageCount = getVisiblePackageCount(state.packages, state.conveyorProgress, fogCleared);
  const tutorialStep: TutorialStep | null = level.tutorial
    ? state.trucks.some((truck) => truck.id === "tutorial-red")
      ? movingTrucks.some((truck) => truck.id === "tutorial-red") ? "driving" : "red"
      : state.parking.some((truck) => truck.truckId === "tutorial-red") ? "loading"
      : state.trucks.some((truck) => truck.id === "tutorial-blue")
        ? movingTrucks.some((truck) => truck.id === "tutorial-blue") ? "driving" : "blue"
        : state.packages.length && !fogCleared ? "fog" : "loading"
    : null;

  const flash = useCallback((next: Feedback) => {
    setFeedback(next);
    window.setTimeout(() => setFeedback(null), 520);
  }, []);

  const selectTruck = useCallback((truckId: string) => {
    if (state.status !== "playing") return null;
    const truck = state.trucks.find((item) => item.id === truckId);
    if (!truck || movingTrucks.some((item) => item.id === truckId)) return null;
    if (level.tutorial && state.trucks[0]?.id !== truckId) {
      flash({ kind: "truck", id: truckId });
      telegram.error();
      return null;
    }
    if (!canTruckExit(truck, state.trucks, level.rows, level.cols)) {
      flash({ kind: "truck", id: truckId });
      telegram.error();
      return null;
    }
    if (state.parking.length + movingTrucks.length >= level.parkingSize) {
      flash({ kind: "parking", id: "parking" });
      telegram.error();
      return null;
    }
    const occupiedSlots = new Set([
      ...state.parking.map((item) => item.slotIndex),
      ...movingTrucks.map((item) => item.slotIndex)
    ]);
    const slotIndex = Array.from({ length: level.parkingSize }, (_, index) => index)
      .find((index) => !occupiedSlots.has(index));
    if (slotIndex === undefined) return null;
    setMovingTrucks((items) => [...items, { id: truck.id, slotIndex }]);
    telegram.impact();
    window.setTimeout(() => {
      setState((current) => {
        const currentTruck = current.trucks.find((item) => item.id === truck.id);
        if (!currentTruck || current.status !== "playing" || !hasParkingSpace(current.parking, level)) return current;
        return {
          ...current,
          trucks: removeTruckFromField(current.trucks, currentTruck.id),
          parking: addTruckToParking(current.parking, currentTruck, slotIndex)
        };
      });
      setMovingTrucks((items) => items.filter((item) => item.id !== truck.id));
    }, TRUCK_TRAVEL_MS);
    return { slotIndex, direction: truck.direction };
  }, [flash, level, movingTrucks, state, telegram]);

  useEffect(() => {
    if (packageTransfers.length) return;
    if (
      state.status !== "playing" ||
      !canProcessNextPackage(state.packages, state.parking, visiblePackageCount)
    ) {
      setIsProcessing(false);
      return;
    }
    setIsProcessing(true);
    const wave = processPackageWave(state.packages, state.parking, visiblePackageCount);
    setPackageTransfers(wave.transfers);
  }, [
    level.parkingSize,
    packageTransfers.length,
    state.packages,
    state.parking,
    state.status,
    visiblePackageCount
  ]);

  useEffect(() => {
    if (!packageTransfers.length) return;
    const fastFinish = state.trucks.length === 0 && movingTrucks.length === 0;
    const timer = window.setTimeout(() => {
      setState((current) => {
        if (current.status !== "playing") return current;
        const next = applyPackageTransfers(current.packages, current.parking, packageTransfers);
        const conveyorProgress = Math.max(
          0.12,
          current.conveyorProgress - CONVEYOR_PACKAGE_SPACING * next.loaded
        );
        const status = getGameStatus(next.packages, next.parking, level.parkingSize, conveyorProgress);
        return { ...current, packages: next.packages, parking: next.parking, conveyorProgress, status };
      });
      setPackageTransfers([]);
    }, fastFinish ? 240 : 680);
    return () => window.clearTimeout(timer);
  }, [level.parkingSize, movingTrucks.length, packageTransfers, state.trucks.length]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setState((current) => {
        if (current.status !== "playing" || current.packages.length === 0) return current;
        const fastFinish = current.trucks.length === 0 && movingTrucks.length === 0;
        const conveyorSpeed = fastFinish ? 7 : 1.6;
        const conveyorProgress = Math.min(
          1,
          current.conveyorProgress + (0.1 / level.conveyorSeconds) * conveyorSpeed
        );
        const status = getGameStatus(current.packages, current.parking, level.parkingSize, conveyorProgress);
        return { ...current, conveyorProgress, status };
      });
    }, 100);
    return () => window.clearInterval(interval);
  }, [level.conveyorSeconds, level.parkingSize, movingTrucks.length]);

  useEffect(() => {
    if (state.status === "lost") {
      setIsProcessing(false);
      setPackageTransfers([]);
      setMovingTrucks([]);
      telegram.error();
    }
    if (state.status === "won") {
      setIsProcessing(false);
      telegram.success();
      saveUnlockedLevel(Math.min(level.id + 1, levels.length - 1));
    }
  }, [level.id, state.status, telegram]);

  const restart = useCallback(() => {
    setState(createInitialState(level));
    setFeedback(null);
    setIsProcessing(false);
    setMovingTrucks([]);
    setPackageTransfers([]);
    setFogCleared(false);
  }, [level]);

  const openLevel = useCallback((index: number) => {
    const safeIndex = Math.min(Math.max(index, 0), levels.length - 1);
    setLevelIndex(safeIndex);
  }, []);

  const clearFog = useCallback(() => {
    if (fogCleared || state.status !== "playing") return;
    setFogCleared(true);
    telegram.impact();
    window.setTimeout(() => setFogCleared(false), 5000);
  }, [fogCleared, state.status, telegram]);

  useEffect(() => {
    setState(createInitialState(level));
    setFeedback(null);
    setIsProcessing(false);
    setMovingTrucks([]);
    setPackageTransfers([]);
    setFogCleared(false);
  }, [level]);

  return {
    level,
    levelIndex,
    state,
    feedback,
    isProcessing,
    movingTruckIds: movingTrucks.map((item) => item.id),
    packageTransfers,
    fastFinish: state.trucks.length === 0 && movingTrucks.length === 0,
    tutorialTargetTruckId: level.tutorial ? state.trucks[0]?.id : undefined,
    tutorialStep,
    fogCleared,
    clearFog,
    selectTruck, restart,
    nextLevel: () => openLevel(levelIndex + 1),
    previousLevel: () => openLevel(levelIndex - 1),
    hasNextLevel: levelIndex < levels.length - 1
  };
}
