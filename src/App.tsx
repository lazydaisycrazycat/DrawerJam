import { Controls } from "./components/Controls/Controls";
import { GameBoard } from "./components/GameBoard/GameBoard";
import { GameHeader } from "./components/GameHeader/GameHeader";
import { PackageQueue } from "./components/PackageQueue/PackageQueue";
import { Parking } from "./components/Parking/Parking";
import { PackageTransferLayer } from "./components/PackageTransferLayer/PackageTransferLayer";
import { ResultModal } from "./components/ResultModal/ResultModal";
import { useGame } from "./hooks/useGame";

export default function App() {
  const game = useGame();

  function handleTruckClick(id: string, element: HTMLButtonElement) {
    const movement = game.selectTruck(id);
    if (!movement) return;
    const slot = document.querySelector<HTMLElement>(`[data-parking-slot="${movement.slotIndex}"]`);
    const board = document.querySelector<HTMLElement>(".board-wrap");
    if (!slot || !board) return;
    const from = element.getBoundingClientRect();
    const to = slot.getBoundingClientRect();
    const field = board.getBoundingClientRect();
    const startX = from.left + from.width / 2;
    const startY = from.top + from.height / 2;
    const vectors = {
      up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0],
      "up-left": [-Math.SQRT1_2, -Math.SQRT1_2],
      "up-right": [Math.SQRT1_2, -Math.SQRT1_2],
      "down-left": [-Math.SQRT1_2, Math.SQRT1_2],
      "down-right": [Math.SQRT1_2, Math.SQRT1_2]
    } as const;
    const [dx, dy] = vectors[movement.direction];
    const distances = [
      dx > 0 ? (field.right + 32 - startX) / dx : dx < 0 ? (field.left - 32 - startX) / dx : Infinity,
      dy > 0 ? (field.bottom + 32 - startY) / dy : dy < 0 ? (field.top - 32 - startY) / dy : Infinity
    ].filter((distance) => distance > 0);
    const exitDistance = Math.min(...distances);
    const exitX = startX + dx * exitDistance;
    const exitY = startY + dy * exitDistance;
    const useLeftSide = exitX <= field.left || (
      exitX < field.right && Math.abs(exitX - field.left) < Math.abs(exitX - field.right)
    );
    const sideX = useLeftSide ? field.left - 34 : field.right + 34;
    const cornerY = field.top + 42;
    const targetX = to.left + to.width / 2;
    const targetY = to.top + to.height / 2;

    element.style.setProperty("--exit-x", `${exitX - startX}px`);
    element.style.setProperty("--exit-y", `${exitY - startY}px`);
    element.style.setProperty("--corner-x", `${sideX - startX}px`);
    element.style.setProperty("--corner-y", `${cornerY - startY}px`);
    element.style.setProperty("--staging-x", `${targetX - startX}px`);
    element.style.setProperty("--staging-y", `${cornerY - startY}px`);
    element.style.setProperty("--route-angle", useLeftSide ? "0deg" : "180deg");
    element.style.setProperty("--approach-x", `${targetX - startX}px`);
    element.style.setProperty("--approach-y", `${to.bottom + 28 - startY}px`);
    element.style.setProperty("--travel-x", `${targetX - startX}px`);
    element.style.setProperty("--travel-y", `${targetY - startY}px`);
  }
  return (
    <main className="app-shell">
      <GameHeader level={game.level.id} onPrevious={game.previousLevel} />
      <PackageQueue
        packages={game.state.packages}
        level={game.level}
        progress={game.state.conveyorProgress}
        transfers={game.packageTransfers}
      />
      <Parking
        trucks={game.state.parking}
        size={game.level.parkingSize}
        fullFeedback={game.feedback?.kind === "parking"}
      />
      <PackageTransferLayer transfers={game.packageTransfers} />
      <GameBoard
        level={game.level}
        trucks={game.state.trucks}
        movingTruckIds={game.movingTruckIds}
        blockedTruckId={game.feedback?.kind === "truck" ? game.feedback.id : undefined}
        onTruckClick={handleTruckClick}
      />
      <p className={`hint${game.isProcessing ? " is-loading" : ""}`}>
        {game.isProcessing ? "Loading matching packages…" : "Tap a truck with a clear path to its arrow"}
      </p>
      <Controls onRestart={game.restart} />
      {game.state.status !== "playing" && (
        <ResultModal
          status={game.state.status}
          dangerLoss={game.state.conveyorProgress >= 1}
          hasNext={game.hasNextLevel}
          onRestart={game.restart}
          onNext={game.nextLevel}
        />
      )}
    </main>
  );
}
