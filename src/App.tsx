import { Controls } from "./components/Controls/Controls";
import { GameBoard } from "./components/GameBoard/GameBoard";
import { GameHeader } from "./components/GameHeader/GameHeader";
import { PackageQueue } from "./components/PackageQueue/PackageQueue";
import { Parking } from "./components/Parking/Parking";
import { ResultModal } from "./components/ResultModal/ResultModal";
import { useGame } from "./hooks/useGame";

export default function App() {
  const game = useGame();
  return (
    <main className="app-shell">
      <GameHeader level={game.level.id} onPrevious={game.previousLevel} />
      <PackageQueue packages={game.state.packages} />
      <Parking trucks={game.state.parking} size={game.level.parkingSize} fullFeedback={game.feedback?.kind === "parking"} />
      <GameBoard
        level={game.level}
        trucks={game.state.trucks}
        blockedTruckId={game.feedback?.kind === "truck" ? game.feedback.id : undefined}
        onTruckClick={game.selectTruck}
      />
      <p className="hint">Tap a truck with a clear path to its arrow</p>
      <Controls canUndo={game.canUndo} onUndo={game.undo} onRestart={game.restart} />
      {game.state.status !== "playing" && (
        <ResultModal status={game.state.status} hasNext={game.hasNextLevel} onRestart={game.restart} onNext={game.nextLevel} />
      )}
    </main>
  );
}
