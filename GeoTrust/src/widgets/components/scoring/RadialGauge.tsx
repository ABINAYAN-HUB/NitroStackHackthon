"use client";

import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import { scoreColor, scoreLabel } from "@/lib/utils";

interface Props { score: number | null; isLoading: boolean; }

export function RadialGauge({ score, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center py-4">
        <div className="skeleton w-32 h-32 rounded-full" />
        <div className="skeleton w-20 h-4 mt-3 rounded" />
      </div>
    );
  }

  const safeScore = score ?? 0;
  const color = scoreColor(safeScore);
  const data = [{ name: "score", value: safeScore, fill: color }];

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <RadialBarChart
          width={160}
          height={160}
          cx={80}
          cy={80}
          innerRadius={54}
          outerRadius={74}
          startAngle={225}
          endAngle={-45}
          data={data}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar
            dataKey="value"
            cornerRadius={6}
            background={{ fill: "#2A3038" }}
          />
        </RadialBarChart>
        {/* Center score */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-bold text-3xl" style={{ color }}>
            {safeScore}
          </span>
          <span className="text-text-muted text-xs font-mono">/100</span>
        </div>
      </div>
      <div className="text-center mt-1">
        <div className="text-xs font-mono" style={{ color }}>
          {scoreLabel(safeScore)} Confidence
        </div>
      </div>
    </div>
  );
}
