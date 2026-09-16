"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Series = {
  label: string;
  color: string;
  values: number[];
};

/**
 * High-frequency chart. Loads uPlot only in the browser inside useEffect
 * so a bundling/CSS issue can't take down the whole Overview page.
 */
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plotRef = useRef<any>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let ro: ResizeObserver | null = null;

    async function mount() {
      if (!rootRef.current || timestamps.length < 2) return;
      try {
        const mod = await import("uplot");
        await import("uplot/dist/uPlot.min.css");
        const uPlot = mod.default;
        if (cancelled || !rootRef.current) return;

        const safeSeries = series.map((s, i) => ({
          label: s.label,
          color: s.color.startsWith("var(")
            ? ["#0a1628", "#be123c", "#0f766e", "#b45309"][i % 4]
            : s.color,
          values: s.values.map((v) => (Number.isFinite(v) ? v : 0)),
        }));

        const opts = {
          width: rootRef.current.clientWidth || 480,
          height,
          class: "nexus-uplot",
          scales: { x: { time: true } },
          axes: [
            {
              stroke: "#94a3b8",
              grid: { show: false },
              ticks: { show: false },
              font: "11px sans-serif",
            },
            {
              stroke: "#94a3b8",
              grid: { stroke: "#e2e8f0", width: 1 },
              font: "11px sans-serif",
              size: 42,
            },
          ],
          series: [
            {},
            ...safeSeries.map((s) => ({
              label: s.label,
              stroke: s.color,
              width: 2,
              points: { show: false },
            })),
          ],
          legend: { show: true },
          cursor: { drag: { x: false, y: false } },
        };

        const data = [timestamps, ...safeSeries.map((s) => s.values)];
        plotRef.current?.destroy();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        plotRef.current = new uPlot(opts as any, data as any, rootRef.current);

        ro = new ResizeObserver(() => {
          if (!rootRef.current || !plotRef.current) return;
          plotRef.current.setSize({
            width: rootRef.current.clientWidth,
            height,
          });
        });
        ro.observe(rootRef.current);
        setFailed(false);
      } catch (err) {
        console.error("[LiveChart]", err);
        setFailed(true);
      }
    }

    void mount();

    return () => {
      cancelled = true;
      ro?.disconnect();
      plotRef.current?.destroy();
      plotRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height, series.map((s) => s.label).join("|"), timestamps.length > 2]);

  useEffect(() => {
    const plot = plotRef.current;
    if (!plot || timestamps.length < 2) return;
    try {
      plot.setData([
        timestamps,
        ...series.map((s) =>
          s.values.map((v) => (Number.isFinite(v) ? v : 0))
        ),
      ]);
    } catch {
      // ignore update races
    }
  }, [timestamps, series]);

  if (failed) {
    const last = series.map(
      (s) => `${s.label}: ${s.values[s.values.length - 1] ?? "—"}`
    );
    return (
      <div
        className={cn(
          "flex h-full items-center justify-center text-sm text-muted-foreground",
          className
        )}
        style={{ height }}
      >
        {last.join(" · ")}
      </div>
    );
  }

  return <div ref={rootRef} className={cn("w-full", className)} style={{ height }} />;
}
