"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from "recharts";
import type { SparkPoint } from "@/data/types";

export function Sparkline({
  data,
  color = "#1e4da0",
  height = 36,
}: {
  data: SparkPoint[];
  color?: string;
  height?: number;
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <YAxis hide domain={["dataMin", "dataMax"]} />
          <Tooltip
            contentStyle={{
              fontSize: 11,
              borderRadius: 8,
              border: "1px solid rgba(10,22,40,0.08)",
              boxShadow: "0 4px 16px rgba(10,22,40,0.08)",
            }}
            labelStyle={{ display: "none" }}
          />
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
