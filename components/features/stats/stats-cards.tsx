"use client";

import { useRef, useEffect } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  PoundSterling,
  Server,
  Zap,
} from "lucide-react";
import { animate, motion, useTransform, useMotionValue } from "framer-motion";
import { cn, formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import type { StatsSummary } from "@/lib/neko-adapters";

interface StatsCardsProps {
  data: StatsSummary;
  activeKey?: string | null;
  onSelect?: (key: string) => void;
}

const animationConfig = { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const };

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
  const motionValue = useMotionValue(0);
  const display = useTransform(motionValue, (v) => {
    const safe = Number.isFinite(v) ? Math.max(0, v) : 0;
    return formatter(Math.round(Math.min(safe, Number.MAX_SAFE_INTEGER)));
  });
  const isFirstRender = useRef(true);

  useEffect(() => {
    const target = Number.isFinite(value) ? Math.max(0, value) : 0;
    if (isFirstRender.current) {
      motionValue.jump(target);
      isFirstRender.current = false;
      return;
    }
    const controls = animate(motionValue, target, animationConfig);
    return () => controls.stop();
  }, [value, motionValue]);

  return (
    <motion.span className={className} title={title}>
      {display}
    </motion.span>
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
        "flex w-full flex-col rounded-xl border bg-card p-3.5 text-left shadow-xs transition",
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
        title={formatter(value)}
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
        color="#3B82F6"
        active={activeKey === "deployments"}
        onClick={() => onSelect?.("deployments")}
      />
      <AnimatedStatCard
        value={data.fleetUptime}
        formatter={(n) => formatPercent(n, 2)}
        label="Fleet uptime"
        icon={Server}
        color="#8B5CF6"
        active={activeKey === "uptime"}
        onClick={() => onSelect?.("uptime")}
      />
      <AnimatedStatCard
        value={data.openIncidents}
        formatter={formatNumber}
        label="Open incidents"
        icon={AlertTriangle}
        color="#EC4899"
        active={activeKey === "incidents"}
        onClick={() => onSelect?.("incidents")}
      />
      <AnimatedStatCard
        value={data.evaluationsPassing}
        formatter={(n) => `${n}/${data.evaluationsTotal}`}
        label="Evals passing"
        icon={CheckCircle2}
        color="#10B981"
        active={activeKey === "evals"}
        onClick={() => onSelect?.("evals")}
      />
      <AnimatedStatCard
        value={data.totalApiCalls24h}
        formatter={formatNumber}
        label="API calls · 24h"
        icon={Zap}
        color="#06B6D4"
        active={activeKey === "api"}
        onClick={() => onSelect?.("api")}
      />
      <AnimatedStatCard
        value={data.pipelineValue}
        formatter={(n) => formatCurrency(n, true)}
        label="Pipeline"
        icon={PoundSterling}
        color="#F59E0B"
        active={activeKey === "pipeline"}
        onClick={() => onSelect?.("pipeline")}
      />
    </div>
  );
}
