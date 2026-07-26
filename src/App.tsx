import { Controls } from "./components/Controls/Controls";
import { GameBoard } from "./components/GameBoard/GameBoard";
import { GameHeader } from "./components/GameHeader/GameHeader";
import { PackageQueue } from "./components/PackageQueue/PackageQueue";
import { Parking } from "./components/Parking/Parking";
import { PackageTransferLayer } from "./components/PackageTransferLayer/PackageTransferLayer";
import { ResultModal } from "./components/ResultModal/ResultModal";
import { TutorialHint } from "./components/TutorialHint/TutorialHint";
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
    const directionAngles = {
      right: 0, "down-right": 45, down: 90, "down-left": 135,
      left: 180, "up-left": -135, up: -90, "up-right": -45
    } as const;
    const nearestAngle = (target: number, previous: number) => {
      const alternatives = [target - 360, target, target + 360];
      return alternatives.reduce((nearest, angle) =>
        Math.abs(angle - previous) < Math.abs(nearest - previous) ? angle : nearest
      );
    };
    const [dx, dy] = vectors[movement.direction];
    const distances = [
      dx > 0 ? (field.right + 32 - startX) / dx : dx < 0 ? (field.left - 32 - startX) / dx : Infinity,
      dy > 0 ? (field.bottom + 32 - startY) / dy : dy < 0 ? (field.top - 32 - startY) / dy : Infinity
    ].filter((distance) => distance > 0);
    const exitDistance = Math.min(...distances);
    const exitX = startX + dx * exitDistance;
    const exitY = startY + dy * exitDistance;
    const targetX = to.left + to.width / 2;
    const targetY = to.top + to.height / 2;
    const startAngle = directionAngles[movement.direction];
    const approachY = Math.min(to.bottom + 18, field.top - 4);
    const exitedThroughTop = exitY <= field.top - 20;
    const useLeftSide = exitX <= field.left || (
      exitX < field.right && Math.abs(exitX - field.left) < Math.abs(exitX - field.right)
    );
    const sideX = exitedThroughTop ? targetX : useLeftSide ? field.left - 34 : field.right + 34;
    const cornerY = Math.min(field.top - 10, to.bottom + 20);
    const cornerAngle = exitedThroughTop
      ? nearestAngle(targetX >= exitX ? 0 : 180, startAngle)
      : nearestAngle(-90, startAngle);
    const routeAngle = exitedThroughTop
      ? cornerAngle
      : nearestAngle(useLeftSide ? 0 : 180, cornerAngle);
    const approachAngle = nearestAngle(-90, routeAngle);

    element.style.setProperty("--exit-x", `${exitX - startX}px`);
    element.style.setProperty("--exit-y", `${exitY - startY}px`);
    element.style.setProperty("--corner-x", `${sideX - startX}px`);
    element.style.setProperty("--corner-y", `${cornerY - startY}px`);
    element.style.setProperty("--staging-x", `${targetX - startX}px`);
    element.style.setProperty("--staging-y", `${cornerY - startY}px`);
    element.style.setProperty("--corner-angle", `${cornerAngle}deg`);
    element.style.setProperty("--route-angle", `${routeAngle}deg`);
    element.style.setProperty("--approach-angle", `${approachAngle}deg`);
    element.style.setProperty("--approach-x", `${targetX - startX}px`);
    element.style.setProperty("--approach-y", `${approachY - startY}px`);
    element.style.setProperty("--travel-x", `${targetX - startX}px`);
    element.style.setProperty("--travel-y", `${targetY - startY}px`);

    const rawRoute = [
      { x: 0, y: 0, angle: startAngle, scale: 1 },
      { x: exitX - startX, y: exitY - startY, angle: startAngle, scale: 1 },
      { x: sideX - startX, y: cornerY - startY, angle: cornerAngle, scale: 0.94 },
      { x: targetX - startX, y: cornerY - startY, angle: routeAngle, scale: 0.9 },
      { x: targetX - startX, y: approachY - startY, angle: approachAngle, scale: 0.86 },
      { x: targetX - startX, y: targetY - startY, angle: approachAngle, scale: 0.78 }
    ];
    const route = rawRoute.filter((point, index, points) =>
      index === 0 || Math.hypot(point.x - points[index - 1].x, point.y - points[index - 1].y) > 0.5
    );
    const segmentLengths = route.slice(1).map((point, index) =>
      Math.hypot(point.x - route[index].x, point.y - route[index].y)
    );
    const routeLength = segmentLengths.reduce((sum, length) => sum + length, 0);
    let travelled = 0;
    const offsets = route.map((_, index) => {
      if (index > 0) travelled += segmentLengths[index - 1];
      return routeLength ? travelled / routeLength : index / (route.length - 1);
    });
    element.style.animation = "none";
    element.animate(
      route.map((point, index) => ({
        offset: offsets[index],
        opacity: index === route.length - 1 ? 0.72 : 1,
        transform: `translate(${point.x}px, ${point.y}px) rotate(${point.angle}deg) scale(${point.scale})`
      })),
      { duration: 1320, easing: "linear", fill: "forwards" }
    );
  }
  return (
    <main className="app-shell">
      <GameHeader level={game.level.id} onPrevious={game.previousLevel} />
      <PackageQueue
        packages={game.state.packages}
        level={game.level}
        progress={game.state.conveyorProgress}
        transfers={game.packageTransfers}
        fogCleared={game.fogCleared}
        onClearFog={game.clearFog}
        highlightFogBonus={game.tutorialStep === "fog"}
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
        highlightedTruckId={game.tutorialTargetTruckId}
        blockedTruckId={game.feedback?.kind === "truck" ? game.feedback.id : undefined}
        onTruckClick={handleTruckClick}
      />
      {game.tutorialStep && <TutorialHint step={game.tutorialStep} />}
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
