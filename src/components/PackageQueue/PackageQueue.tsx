import { useMemo } from "react";
import { CONVEYOR_FOG_THRESHOLD, CONVEYOR_PACKAGE_SPACING } from "../../game/packageProcessing";
import type { PackageTransfer } from "../../game/packageProcessing";
import type { LevelConfig, PackageItem } from "../../game/types";
import { colorSymbols } from "../Truck/Truck";

type Point = { x: number; y: number };

function pointOnRoute(points: Point[], progress: number): Point {
  const segments = points.slice(1).map((point, index) => ({
    from: points[index],
    to: point,
    length: Math.hypot(point.x - points[index].x, point.y - points[index].y)
  }));
  const total = segments.reduce((sum, segment) => sum + segment.length, 0);
  let target = Math.max(0, Math.min(1, progress)) * total;
  for (const segment of segments) {
    if (target <= segment.length) {
      const ratio = segment.length ? target / segment.length : 0;
      return {
        x: segment.from.x + (segment.to.x - segment.from.x) * ratio,
        y: segment.from.y + (segment.to.y - segment.from.y) * ratio
      };
    }
    target -= segment.length;
  }
  return points.at(-1) ?? { x: 0, y: 0 };
}

export function PackageQueue({ packages, level, progress, transfers, speedBoosted, onToggleSpeed, highlightSpeedBonus, overloadHealth, jamGrace, hasRewound }: {
  packages: PackageItem[];
  level: LevelConfig;
  progress: number;
  transfers: PackageTransfer[];
  speedBoosted: boolean;
  onToggleSpeed: () => void;
  highlightSpeedBonus?: boolean;
  overloadHealth: number;
  jamGrace: number;
  hasRewound: boolean;
}) {
  const route = level.conveyorPoints.map(({ x, y }) => `${x},${y}`).join(" ");
  const jamPoint = level.conveyorPoints.at(-1) ?? { x: 342, y: 106 };
  const movingPackages = useMemo(() => packages.map((item, index) => ({
    item,
    index,
    point: pointOnRoute(level.conveyorPoints, progress - index * CONVEYOR_PACKAGE_SPACING),
    visible: progress - index * CONVEYOR_PACKAGE_SPACING >= 0
  })), [level.conveyorPoints, packages, progress]);

  return (
    <section className="conveyor-section">
      <div className="section-heading">
        <h2>Incoming packages</h2>
        <span>{packages.length} left</span>
      </div>
      <div className={`conveyor${progress > 0.82 ? " conveyor--danger" : ""}`}>
        <svg viewBox="0 0 360 210" role="img" aria-label="Moving package conveyor">
          <polyline className="conveyor-shadow" points={route} />
          <polyline className="conveyor-belt" points={route} />
          <polyline className="conveyor-markings" points={route} />
          <g className="dispatch-zone">
            <rect x="4" y="86" width="29" height="43" rx="7" />
            <path d="M10 86V76h17v10M11 99h15M11 108h15M11 117h15" />
          </g>
          <g className="jam-zone" transform={`translate(${jamPoint.x} ${jamPoint.y})`}>
            <circle cx="0" cy="0" r="15" />
            <path d="M0 -10v13M0 10v1" />
            <text x="0" y="31">JAM</text>
          </g>
          {movingPackages.map(({ item, index, point, visible }) => visible && (
            <g
              className={`moving-package moving-package--${item.color}${index === 0 ? " is-first" : ""}${progress - index * CONVEYOR_PACKAGE_SPACING < CONVEYOR_FOG_THRESHOLD ? " is-fogged" : ""}${transfers.some((transfer) => transfer.packageId === item.id) ? " is-loading" : ""}`}
              data-package-id={item.id}
              key={item.id}
              transform={`translate(${point.x} ${point.y})`}
            >
              <rect x="-14" y="-14" width="28" height="28" rx="6" />
              <path d="M-14 -4H14M-4 -14V14" />
              <text x="0" y="5">{colorSymbols[item.color]}</text>
            </g>
          ))}
          <polyline className="conveyor-fog" pathLength="1" points={route} />
        </svg>
        <button className={`speed-toggle${speedBoosted ? " is-active" : ""}${highlightSpeedBonus ? " is-tutorial-target" : ""}`} onClick={onToggleSpeed}>
          <span>»</span>
          {speedBoosted ? "×2" : "×1"}
        </button>
        <div className={`danger-meter${progress >= 1 && hasRewound ? " is-overloading" : ""}`}>
          <span>{jamGrace > 0 ? `REWIND ${Math.ceil(jamGrace)}` : "OVERLOAD"}</span>
          <i><b style={{
            width: `${overloadHealth * 100}%`,
            background: `hsl(${Math.round(overloadHealth * 120)} 68% 48%)`
          }} /></i>
          <span>{Math.ceil(overloadHealth * 100)}%</span>
        </div>
      </div>
    </section>
  );
}
