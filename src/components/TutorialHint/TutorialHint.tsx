export type TutorialStep = "red" | "driving" | "loading" | "blue" | "fog";

const copy: Record<TutorialStep, readonly [string, string]> = {
  red: ["FIRST DELIVERY", "Tap the glowing red truck. It can leave in the arrow direction."],
  driving: ["ON THE WAY", "The truck drives around the yard and enters parking from below."],
  loading: ["MATCH THE COLORS", "Available parcels fly into matching parked trucks automatically."],
  blue: ["YOUR TURN", "Now send the glowing blue truck to parking."],
  fog: ["FOGGY ROAD", "Tap Clear Fog. For 5 seconds, parcels inside the fog can be loaded."]
} as const;

export function TutorialHint({ step }: { step: TutorialStep }) {
  const [title, text] = copy[step];
  return (
    <aside className="tutorial-hint" role="status">
      <span>{title}</span>
      <p>{text}</p>
    </aside>
  );
}
