"use client";

import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Link2,
  Server,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  clients,
  clusters,
  commercialSummary,
  globalKpis,
  incidents,
  networkEvents,
  regionalHealth,
} from "@/data/mock";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  healthLabel,
  relativeTime,
} from "@/lib/utils";
import { HealthDot } from "@/components/ui";
import { RegionalTrafficMap } from "@/components/maps/RegionalTrafficMap";

const TREND = Array.from({ length: 24 }, (_, i) => {
  const hour = i;
  const base = 800 + Math.sin(i / 3) * 220 + (i > 16 ? 180 : 0);
  return {
    time: `${String(hour).padStart(2, "0")}:00`,
    api: Math.round(base + (i % 5) * 40),
    eval: Math.round(base * 0.35 + 120),
  };
});

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#171c2b]/90 px-3.5 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: `${color}22` }}
      >
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
          {label}
        </p>
        {sub && (
          <p className="mt-0.5 truncate text-[11px] text-slate-500">{sub}</p>
        )}
      </div>
      <p className="shrink-0 text-lg font-semibold leading-none tabular-nums text-slate-50">
        {value}
      </p>
    </div>
  );
}

function RankRow({
  rank,
  title,
  subtitle,
  metric,
  bar,
  barColor = "#818cf8",
  href,
  health,
}: {
  rank: number;
  title: string;
  subtitle: string;
  metric: string;
  bar: number;
  barColor?: string;
  href?: string;
  health?: "healthy" | "warning" | "critical";
}) {
  const inner = (
    <div className="space-y-1.5 rounded-lg px-1 py-2 hover:bg-white/5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2">
          <span
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold ${
              rank <= 3
                ? "bg-[#ff8c42]/20 text-[#ff8c42]"
                : "bg-white/10 text-slate-400"
            }`}
          >
            {rank}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              {health && <HealthDot status={health} />}
              <p className="truncate text-sm font-semibold text-slate-100">
                {title}
              </p>
            </div>
            <p className="truncate text-[11px] text-slate-400">{subtitle}</p>
          </div>
        </div>
        <p className="shrink-0 text-sm font-semibold tabular-nums text-slate-100">
          {metric}
        </p>
      </div>
      <div className="ml-7 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(4, Math.min(100, bar * 100))}%`,
            background: `linear-gradient(90deg, ${barColor}, #7b61ff)`,
          }}
        />
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export function NekoOverview() {
  const kpis = globalKpis();
  const summary = commercialSummary();
  const regions = regionalHealth();
  const topClients = [...clients]
    .sort((a, b) => b.apiCalls24h - a.apiCalls24h)
    .slice(0, 6);
  const maxCalls = topClients[0]?.apiCalls24h || 1;
  const topClusters = [...clusters]
    .filter((c) => c.clientId)
    .sort((a, b) => b.cpuUtil - a.cpuUtil)
    .slice(0, 6);
  const openIncidents = incidents.filter((i) => i.status !== "resolved");

  const kpiItems = [
    {
      label: "Active Deployments",
      value: String(kpis.activeDeployments),
      sub: `${clients.length} managed accounts`,
      icon: Server,
      color: "#818cf8",
    },
    {
      label: "Fleet Uptime",
      value: `${kpis.fleetUptime.toFixed(2)}%`,
      sub: "Across live runtimes",
      icon: Activity,
      color: "#00d084",
    },
    {
      label: "Open Incidents",
      value: String(kpis.openIncidents),
      sub: "Requires ops attention",
      icon: AlertTriangle,
      color: "#ef4444",
    },
    {
      label: "Evals Passing",
      value: `${kpis.evaluationsPassing}/${kpis.evaluationsTotal}`,
      sub: "Score ≥ 85",
      icon: CheckCircle2,
      color: "#7b61ff",
    },
    {
      label: "API Calls 24h",
      value: formatNumber(clients.reduce((s, c) => s + c.apiCalls24h, 0)),
      sub: "Managed deployment traffic",
      icon: Zap,
      color: "#00c7ff",
    },
    {
      label: "Open Pipeline",
      value: formatCurrency(summary.totalOpen, true),
      sub: `Weighted ${formatCurrency(summary.weighted, true)}`,
      icon: Building2,
      color: "#ff6b9d",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-[#171c2b]/60 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#818cf8]">
          Phaeron Internal Management System
        </p>
        <h2 className="mt-1 text-lg font-semibold text-slate-50">
          NEXUS · manage clients, fleet, revenue & GraphRAG in one place
        </h2>
        <p className="mt-0.5 text-[13px] text-slate-400">
          Operational overview for account health, deployment traffic, and
          commercial pipeline.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
        <div className="flex flex-col gap-3">
          {kpiItems.map((item) => (
            <StatCard key={item.label} {...item} />
          ))}
        </div>
        <div className="min-h-[520px] lg:min-h-0">
          <RegionalTrafficMap compact />
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#171c2b]/90 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Fleet Activity Trend
            </p>
            <p className="text-[12px] text-slate-500">
              API calls vs evaluation completions · last 24h
            </p>
          </div>
          <div className="flex gap-1 rounded-lg bg-white/5 p-0.5">
            {["30m", "1h", "24h"].map((t) => (
              <span
                key={t}
                className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${
                  t === "24h"
                    ? "bg-[#818cf8]/20 text-[#c7d2fe]"
                    : "text-slate-500"
                }`}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className="h-[220px] w-full">
          <ResponsiveContainer>
            <AreaChart data={TREND}>
              <defs>
                <linearGradient id="apiFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="evalFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7b61ff" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#7b61ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                interval={3}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "#171c2b",
                  color: "#e2e8f0",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="api"
                name="API"
                stroke="#818cf8"
                fill="url(#apiFill)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="eval"
                name="Evals"
                stroke="#7b61ff"
                fill="url(#evalFill)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-[#171c2b]/90 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
              <Building2 className="h-4 w-4" /> Top Clients
            </h3>
            <Link
              href="/clients"
              className="text-[11px] font-semibold text-[#818cf8]"
            >
              View all
            </Link>
          </div>
          <div className="space-y-0.5">
            {topClients.map((c, i) => (
              <RankRow
                key={c.id}
                rank={i + 1}
                title={c.name}
                subtitle={`${c.city} · ${formatNumber(c.apiCalls24h)} calls`}
                metric={formatPercent(c.uptime)}
                bar={c.apiCalls24h / maxCalls}
                href={`/clients/${c.id}`}
                health={c.health}
              />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#171c2b]/90 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
              <Link2 className="h-4 w-4" /> Top Deployments
            </h3>
            <Link
              href="/infrastructure"
              className="text-[11px] font-semibold text-[#818cf8]"
            >
              Fleet
            </Link>
          </div>
          <div className="space-y-0.5">
            {topClusters.map((c, i) => (
              <RankRow
                key={c.id}
                rank={i + 1}
                title={c.clientName}
                subtitle={`${c.name} · CPU ${c.cpuUtil}%`}
                metric={healthLabel(c.health)}
                bar={c.cpuUtil / 100}
                barColor={
                  c.health === "critical"
                    ? "#ef4444"
                    : c.health === "warning"
                      ? "#ff8c42"
                      : "#818cf8"
                }
                href="/infrastructure"
                health={c.health}
              />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#171c2b]/90 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
              <Server className="h-4 w-4" /> Regions
            </h3>
          </div>
          <div className="space-y-0.5">
            {regions.map((r, i) => (
              <RankRow
                key={r.region}
                rank={i + 1}
                title={r.region}
                subtitle={`${r.deployments} deployments`}
                metric={formatPercent(r.uptime)}
                bar={r.uptime / 100}
                health={r.status}
              />
            ))}
          </div>
          {openIncidents[0] && (
            <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-rose-400">
                Needs attention now
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-100">
                {openIncidents[0].title}
              </p>
              <p className="mt-0.5 text-[12px] text-slate-400">
                {openIncidents[0].clientName} ·{" "}
                {relativeTime(openIncidents[0].openedAt)}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#171c2b]/90 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Network Activity
          </h3>
          <span className="text-[11px] font-semibold text-[#7b61ff] live-pulse">
            Live feed
          </span>
        </div>
        <ul className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {networkEvents.slice(0, 9).map((evt) => (
            <li
              key={evt.id}
              className="flex gap-2 rounded-lg border border-white/10 bg-[#0b0f19]/60 px-3 py-2"
            >
              <HealthDot status={evt.severity ?? "healthy"} className="mt-1.5" />
              <div className="min-w-0">
                <p className="truncate text-[13px] text-slate-100">
                  {evt.message}
                </p>
                <p className="text-[10px] uppercase tracking-[0.08em] text-slate-500">
                  {relativeTime(evt.timestamp)} · {evt.type}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
