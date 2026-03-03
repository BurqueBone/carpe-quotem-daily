import {
  Briefcase,
  Globe,
  Palette,
  Heart,
  Users,
  DollarSign,
  Brain,
  Dumbbell,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types & Data                                                       */
/* ------------------------------------------------------------------ */

export interface LifeArea {
  key: string;
  label: string;
  icon: LucideIcon;
  resourceCategoryTitles: string[];
}

export const lifeAreas: LifeArea[] = [
  {
    key: "physical",
    label: "Physical",
    icon: Dumbbell,
    resourceCategoryTitles: ["Physical"],
  },
  {
    key: "mind_growth",
    label: "Mind & Growth",
    icon: Brain,
    resourceCategoryTitles: ["Mental", "Learning"],
  },
  {
    key: "emotional",
    label: "Emotional",
    icon: Heart,
    resourceCategoryTitles: ["Emotional"],
  },
  {
    key: "relationships",
    label: "Relationships",
    icon: Users,
    resourceCategoryTitles: ["Family", "Social"],
  },
  {
    key: "financial",
    label: "Financial",
    icon: DollarSign,
    resourceCategoryTitles: ["Financial"],
  },
  {
    key: "career",
    label: "Career",
    icon: Briefcase,
    resourceCategoryTitles: ["Career"],
  },
  {
    key: "creative_spiritual",
    label: "Creative & Spiritual",
    icon: Palette,
    resourceCategoryTitles: ["Creative", "Spiritual"],
  },
  {
    key: "community_environment",
    label: "Community & Environment",
    icon: Globe,
    resourceCategoryTitles: ["Community", "Environment"],
  },
];

export const AREA_COUNT = lifeAreas.length; // 8

/* ------------------------------------------------------------------ */
/*  Radar Chart                                                        */
/* ------------------------------------------------------------------ */

export function RadarChart({
  scores,
  previousScores,
}: {
  scores: Record<string, number | null>;
  previousScores?: Record<string, number> | null;
}) {
  const size = 300;
  const center = size / 2;
  const maxRadius = center - 40;

  function getPoints(vals: Record<string, number | null>) {
    return lifeAreas.map((area, i) => {
      const angle = (Math.PI * 2 * i) / AREA_COUNT - Math.PI / 2;
      const value = vals[area.key] ?? 0;
      const r = (value / 10) * maxRadius;
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
        labelX: center + (maxRadius + 25) * Math.cos(angle),
        labelY: center + (maxRadius + 25) * Math.sin(angle),
        label: area.label,
      };
    });
  }

  const points = getPoints(scores);
  const prevPoints = previousScores ? getPoints(previousScores) : null;

  const pathData =
    points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") +
    " Z";
  const prevPathData = prevPoints
    ? prevPoints
        .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
        .join(" ") + " Z"
    : null;

  const circles = [2, 4, 6, 8, 10].map((val) => (val / 10) * maxRadius);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto w-full max-w-[260px]"
    >
      {/* Grid circles */}
      {circles.map((r, i) => (
        <circle
          key={i}
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={0.5}
        />
      ))}

      {/* Axis lines */}
      {lifeAreas.map((_, i) => {
        const angle = (Math.PI * 2 * i) / AREA_COUNT - Math.PI / 2;
        const x2 = center + maxRadius * Math.cos(angle);
        const y2 = center + maxRadius * Math.sin(angle);
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={x2}
            y2={y2}
            stroke="#e5e7eb"
            strokeWidth={0.5}
          />
        );
      })}

      {/* Previous assessment area (if available) */}
      {prevPathData && (
        <path
          d={prevPathData}
          fill="rgba(8, 61, 119, 0.06)"
          stroke="#083D77"
          strokeWidth={1}
          strokeDasharray="4 3"
        />
      )}

      {/* Current data area */}
      <path
        d={pathData}
        fill="rgba(8, 61, 119, 0.15)"
        stroke="#083D77"
        strokeWidth={2}
      />

      {/* Current data points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill="#083D77" />
      ))}

      {/* Labels */}
      {points.map((p, i) => (
        <text
          key={i}
          x={p.labelX}
          y={p.labelY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-gray-500 text-[8px]"
        >
          {p.label}
        </text>
      ))}
    </svg>
  );
}
