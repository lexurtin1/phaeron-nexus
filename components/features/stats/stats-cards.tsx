"use client";

import { useRef, useEffect, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  PoundSterling,
  Server,
  Zap,
} from "lucide-react";
import { cn, formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import type { StatsSummary } from "@/lib/neko-adapters";

interface StatsCardsProps {
  data: StatsSummary;
  activeKey?: string | null;
  onSelect?: (key: string) => void;
}

function AnimatedValue({
  value,
  formatter,
  className,
  title,
}: {
  value: number;
  formatter: (n: number) => string;
  className?: string;
  title?: string;
}) {
  const [display, setDisplay] = useState(() =>
    formatter(Number.isFinite(value) ? Math.max(0, value) : 0)
  );
  const prev = useRef(value);

  useEffect(() => {
    const target = Number.isFinite(value) ? Math.max(0, value) : 0;
    const from = Number.isFinite(prev.current) ? prev.current : target;
    prev.current = target;
    const start = performance.now();
    const duration = 450;
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = from + (target - from) * eased;
      setDisplay(formatter(current));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, formatter]);

  return (
    <span className={className} title={title}>
      {display}
    </span>
  );
}

function AnimatedStatCard({
  value,
  formatter,
  label,
  subvalue,
  icon: Icon,
  color,
  active,
  onClick,
}: {
  value: number;
  formatter: (n: number) => string;
  label: string;
  subvalue?: string;
  icon: React.ElementType;
  color: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full flex-col rounded-md border bg-card p-3.5 text-left shadow-xs transition",
        active
          ? "border-primary ring-2 ring-primary/20"
          : "hover:border-primary/40"
      )}
    >
      <div
        className="mb-2.5 flex h-8 w-8 items-center justify-center rounded-md"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <p className="truncate text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <AnimatedValue
        value={value}
        formatter={formatter}
        className="mt-2.5 block truncate text-lg font-semibold leading-none tabular-nums"
        title={formatter(Number.isFinite(value) ? value : 0)}
      />
      {subvalue && (
        <p className="mt-1.5 truncate text-[11px] text-muted-foreground">
          {subvalue}
        </p>
      )}
    </button>
  );
}

export function StatsCards({ data, activeKey, onSelect }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
      <AnimatedStatCard
        value={data.activeDeployments}
        formatter={formatNumber}
        label="Deployments"
        subvalue="Live · ramped · deploying"
        icon={Building2}
        color="#0a1628"
        active={activeKey === "deployments"}
        onClick={() => onSelect?.("deployments")}
      />
      <AnimatedStatCard
        value={data.fleetUptime}
        formatter={(n) => formatPercent(n, 2)}
        label="Fleet uptime"
        icon={Server}
        color="#2a4a6e"
        active={activeKey === "uptime"}
        onClick={() => onSelect?.("uptime")}
      />
      <AnimatedStatCard
        value={data.openIncidents}
        formatter={formatNumber}
        label="Open incidents"
        icon={AlertTriangle}
        color="#be123c"
        active={activeKey === "incidents"}
        onClick={() => onSelect?.("incidents")}
      />
      <AnimatedStatCard
        value={data.evaluationsPassing}
        formatter={(n) => `${Math.round(n)}/${data.evaluationsTotal}`}
        label="Evals passing"
        icon={CheckCircle2}
        color="#0f766e"
        active={activeKey === "evals"}
        onClick={() => onSelect?.("evals")}
      />
      <AnimatedStatCard
        value={data.totalApiCalls24h}
        formatter={formatNumber}
        label="API calls · 24h"
        icon={Zap}
        color="#0e7490"
        active={activeKey === "api"}
        onClick={() => onSelect?.("api")}
      />
      <AnimatedStatCard
        value={data.pipelineValue}
        formatter={(n) => formatCurrency(n, true)}
        label="Pipeline"
        icon={PoundSterling}
        color="#b45309"
        active={activeKey === "pipeline"}
        onClick={() => onSelect?.("pipeline")}
      />
    </div>
  );
}
