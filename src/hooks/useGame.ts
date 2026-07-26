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
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [movingTruckIds, setMovingTruckIds] = useState<string[]>([]);
  const [packageTransfers, setPackageTransfers] = useState<PackageTransfer[]>([]);
  const telegram = useTelegram();
  const visiblePackageCount = getVisiblePackageCount(state.packages, state.conveyorProgress);

  const flash = useCallback((next: Feedback) => {
    setFeedback(next);
    window.setTimeout(() => setFeedback(null), 520);
  }, []);

  const selectTruck = useCallback((truckId: string) => {
    if (state.status !== "playing" || packageTransfers.length) return null;
    const truck = state.trucks.find((item) => item.id === truckId);
    if (!truck || movingTruckIds.includes(truckId)) return null;
    if (!canTruckExit(truck, state.trucks, level.rows, level.cols)) {
      flash({ kind: "truck", id: truckId });
      telegram.error();
      return null;
    }
    if (state.parking.length + movingTruckIds.length >= level.parkingSize) {
      flash({ kind: "parking", id: "parking" });
      telegram.error();
      return null;
    }
    const slotIndex = state.parking.length + movingTruckIds.length;
    setMovingTruckIds((items) => [...items, truck.id]);
    telegram.impact();
    window.setTimeout(() => {
      setState((current) => {
        const currentTruck = current.trucks.find((item) => item.id === truck.id);
        if (!currentTruck || current.status !== "playing" || !hasParkingSpace(current.parking, level)) return current;
        return {
          ...current,
          trucks: removeTruckFromField(current.trucks, currentTruck.id),
          parking: addTruckToParking(current.parking, currentTruck)
        };
      });
      setMovingTruckIds((items) => items.filter((id) => id !== truck.id));
    }, 620);
    return { slotIndex };
  }, [flash, level, movingTruckIds, packageTransfers.length, state, telegram]);

  useEffect(() => {
    if (packageTransfers.length || movingTruckIds.length) return;
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
    movingTruckIds.length,
    packageTransfers.length,
    state.packages,
    state.parking,
    state.status,
    visiblePackageCount
  ]);

  useEffect(() => {
    if (!packageTransfers.length) return;
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
    }, 680);
    return () => window.clearTimeout(timer);
  }, [level.parkingSize, packageTransfers]);

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
      setPackageTransfers([]);
      setMovingTruckIds([]);
      telegram.error();
    }
    if (state.status === "won") {
      setIsProcessing(false);
      telegram.success();
      saveUnlockedLevel(Math.min(level.id + 1, levels.length));
    }
  }, [level.id, state.status, telegram]);

  const restart = useCallback(() => {
    setState(createInitialState(level));
    setFeedback(null);
    setIsProcessing(false);
    setMovingTruckIds([]);
    setPackageTransfers([]);
  }, [level]);

  const openLevel = useCallback((index: number) => {
    const safeIndex = Math.min(Math.max(index, 0), levels.length - 1);
    setLevelIndex(safeIndex);
  }, []);

  useEffect(() => {
    setState(createInitialState(level));
    setFeedback(null);
    setIsProcessing(false);
    setMovingTruckIds([]);
    setPackageTransfers([]);
  }, [level]);

  return {
    level, levelIndex, state, feedback, isProcessing, movingTruckIds, packageTransfers,
    selectTruck, restart,
    nextLevel: () => openLevel(levelIndex + 1),
    previousLevel: () => openLevel(levelIndex - 1),
    hasNextLevel: levelIndex < levels.length - 1
  };
}
