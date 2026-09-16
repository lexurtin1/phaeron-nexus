"use client";

import { useEffect, useRef } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import { cn } from "@/lib/utils";

type Series = {
  label: string;
  color: string;
  values: number[];
};

export function LiveChart({
  timestamps,
  series,
  height = 160,
  className,
}: {
  timestamps: number[];
  series: Series[];
  height?: number;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<uPlot | null>(null);

  useEffect(() => {
    if (!rootRef.current || timestamps.length < 2) return;

    const opts: uPlot.Options = {
      width: rootRef.current.clientWidth || 480,
      height,
      class: "nexus-uplot",
      scales: {
        x: { time: true },
      },
      axes: [
        {
          stroke: "hsl(var(--muted-foreground))",
          grid: { show: false },
          ticks: { show: false },
          font: "11px sans-serif",
        },
        {
          stroke: "hsl(var(--muted-foreground))",
          grid: { stroke: "hsl(var(--border))", width: 1 },
          font: "11px sans-serif",
          size: 42,
        },
      ],
      series: [
        {},
        ...series.map((s) => ({
          label: s.label,
          stroke: s.color,
          width: 2,
          points: { show: false },
        })),
      ],
      legend: { show: true },
      cursor: {
        drag: { x: false, y: false },
      },
    };

    const data = [timestamps, ...series.map((s) => s.values)];

    plotRef.current?.destroy();
    // uPlot AlignedData typing is strict across versions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plotRef.current = new uPlot(opts, data as any, rootRef.current);

    const ro = new ResizeObserver(() => {
      if (!rootRef.current || !plotRef.current) return;
      plotRef.current.setSize({
        width: rootRef.current.clientWidth,
        height,
      });
    });
    ro.observe(rootRef.current);

    return () => {
      ro.disconnect();
      plotRef.current?.destroy();
      plotRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height, series.map((s) => s.label).join("|")]);

  useEffect(() => {
    const plot = plotRef.current;
    if (!plot || timestamps.length < 2) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plot.setData([timestamps, ...series.map((s) => s.values)] as any);
  }, [timestamps, series]);

  return <div ref={rootRef} className={cn("w-full", className)} />;
}
