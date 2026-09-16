"use client";

import { useMemo } from "react";
import { clients, PHAERON_HUB } from "@/data/mock";
import type { HealthStatus } from "@/data/types";
import { useNexusStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const HEALTH: Record<HealthStatus, string> = {
  healthy: "#0063ff",
  warning: "#ff8c42",
  critical: "#ef4444",
};

/** Project lon/lat into a Europe-focused SVG plane */
function project(lat: number, lng: number) {
  const x = ((lng + 12) / 28) * 720 + 40;
  const y = ((58 - lat) / 22) * 380 + 30;
  return { x, y };
}

export function EuropeTetherMap() {
  const selectedClientId = useNexusStore((s) => s.selectedClientId);
  const setSelectedClientId = useNexusStore((s) => s.setSelectedClientId);
  const hub = project(PHAERON_HUB.lat, PHAERON_HUB.lng);

  const nodes = useMemo(
    () =>
      clients.map((c) => ({
        ...c,
        ...project(c.lat, c.lng),
      })),
    []
  );

  return (
    <div className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-[0_1px_2px_rgba(26,29,41,0.04)]">
      <div className="flex items-center justify-between border-b border-[#e2e8f0] px-4 py-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-[#6b7280]">
            Europe Fleet Topology
          </p>
          <p className="text-[12px] text-[#94a3b8]">
            Solid tethers from Phaeron Control · London — click a node for dossier
          </p>
        </div>
        <div className="flex gap-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6b7280]">
          <span className="flex items-center gap-1.5">
            <i className="h-2 w-2 rounded-full bg-[#0063ff]" /> Healthy
          </span>
          <span className="flex items-center gap-1.5">
            <i className="h-2 w-2 rounded-full bg-[#ff8c42]" /> Degraded
          </span>
          <span className="flex items-center gap-1.5">
            <i className="h-2 w-2 rounded-full bg-[#ef4444]" /> Critical
          </span>
        </div>
      </div>
      <div className="relative bg-[#f8fafc]">
        <svg viewBox="0 0 800 440" className="h-[360px] w-full md:h-[420px]">
          <defs>
            <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path
                d="M 24 0 L 0 0 0 24"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="800" height="440" fill="url(#grid)" />
          {/* Schematic land blobs */}
          <ellipse cx="360" cy="210" rx="210" ry="140" fill="#e0e7ff" opacity="0.45" />
          <ellipse cx="520" cy="250" rx="90" ry="70" fill="#e0e7ff" opacity="0.35" />
          <ellipse cx="280" cy="160" rx="70" ry="50" fill="#c7d2fe" opacity="0.35" />

          {nodes.map((n) => (
            <line
              key={`t-${n.id}`}
              x1={hub.x}
              y1={hub.y}
              x2={n.x}
              y2={n.y}
              stroke={
                n.health === "critical"
                  ? "#ef4444"
                  : n.health === "warning"
                    ? "#ff8c42"
                    : "#7b61ff"
              }
              strokeWidth={1.2 + n.hubActivity * 2.2}
              strokeOpacity={0.35 + n.hubActivity * 0.45}
            />
          ))}

          <g>
            <circle cx={hub.x} cy={hub.y} r="10" fill="#7b61ff" />
            <circle
              cx={hub.x}
              cy={hub.y}
              r="16"
              fill="none"
              stroke="#7b61ff"
              strokeOpacity="0.35"
              strokeWidth="2"
            />
            <text
              x={hub.x + 14}
              y={hub.y - 10}
              className="fill-[#1a1d29]"
              fontSize="11"
              fontWeight="700"
              fontFamily="Open Sans, sans-serif"
            >
              PHAERON CONTROL · LONDON
            </text>
          </g>

          {nodes.map((n) => (
            <g
              key={n.id}
              className="cursor-pointer"
              onClick={() => setSelectedClientId(n.id)}
            >
              <circle
                cx={n.x}
                cy={n.y}
                r={selectedClientId === n.id ? 8 : 5.5}
                fill={HEALTH[n.health]}
                stroke="#fff"
                strokeWidth="2"
              />
              <text
                x={n.x + 8}
                y={n.y + 3}
                fontSize="10"
                fontWeight="600"
                fontFamily="Open Sans, sans-serif"
                className={cn(
                  selectedClientId === n.id ? "fill-[#7b61ff]" : "fill-[#475569]"
                )}
              >
                {n.name}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
