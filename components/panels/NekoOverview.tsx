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
    <div className="flex items-center gap-3 rounded-xl border border-[#e2e8f0] bg-white px-3.5 py-3 shadow-[0_1px_2px_rgba(10,22,40,0.04)]">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: `${color}14` }}
      >
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-medium uppercase tracking-[0.14em] text-[#64748b]">
          {label}
        </p>
        {sub && (
          <p className="mt-0.5 truncate text-[11px] text-[#94a3b8]">{sub}</p>
        )}
      </div>
      <p className="shrink-0 text-lg font-semibold leading-none tabular-nums text-[#0a1628]">
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
  barColor = "#0a1628",
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
    <div className="space-y-1.5 rounded-lg px-1 py-2 hover:bg-[#f4f6f9]">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2">
          <span
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold ${
              rank <= 3
                ? "bg-[#e11d48]/12 text-[#e11d48]"
                : "bg-[#eef2f7] text-[#64748b]"
            }`}
          >
            {rank}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              {health && <HealthDot status={health} />}
              <p className="truncate text-sm font-semibold text-[#0a1628]">
                {title}
              </p>
            </div>
            <p className="truncate text-[11px] text-[#64748b]">{subtitle}</p>
          </div>
        </div>
        <p className="shrink-0 text-sm font-semibold tabular-nums text-[#0a1628]">
          {metric}
        </p>
      </div>
      <div className="ml-7 h-1.5 overflow-hidden rounded-full bg-[#eef2f7]">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(4, Math.min(100, bar * 100))}%`,
            background: `linear-gradient(90deg, ${barColor}, #6d5ce7)`,
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
      color: "#0a1628",
    },
    {
      label: "Fleet Uptime",
      value: `${kpis.fleetUptime.toFixed(2)}%`,
      sub: "Across live runtimes",
      icon: Activity,
      color: "#059669",
    },
    {
      label: "Open Incidents",
      value: String(kpis.openIncidents),
      sub: "Requires ops attention",
      icon: AlertTriangle,
      color: "#e11d48",
    },
    {
      label: "Evals Passing",
      value: `${kpis.evaluationsPassing}/${kpis.evaluationsTotal}`,
      sub: "Score ≥ 85",
      icon: CheckCircle2,
      color: "#6d5ce7",
    },
    {
      label: "API Calls 24h",
      value: formatNumber(clients.reduce((s, c) => s + c.apiCalls24h, 0)),
      sub: "Managed deployment traffic",
      icon: Zap,
      color: "#1a365d",
    },
    {
      label: "Open Pipeline",
      value: formatCurrency(summary.totalOpen, true),
      sub: `Weighted ${formatCurrency(summary.weighted, true)}`,
      icon: Building2,
      color: "#be123c",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[#e2e8f0] bg-white px-4 py-3 shadow-[0_1px_2px_rgba(10,22,40,0.04)]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#e11d48]">
          Phaeron Internal Management System
        </p>
        <h2 className="mt-1 text-lg font-semibold text-[#0a1628]">
          NEXUS · manage clients, fleet, revenue & GraphRAG in one place
        </h2>
        <p className="mt-0.5 text-[13px] text-[#64748b]">
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

      <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-[0_1px_2px_rgba(10,22,40,0.04)]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#64748b]">
              Fleet Activity Trend
            </p>
            <p className="text-[12px] text-[#94a3b8]">
              API calls vs evaluation completions · last 24h
            </p>
          </div>
          <div className="flex gap-1 rounded-lg bg-[#f4f6f9] p-0.5">
            {["30m", "1h", "24h"].map((t) => (
              <span
                key={t}
                className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${
                  t === "24h"
                    ? "bg-white text-[#0a1628] shadow-sm"
                    : "text-[#64748b]"
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
                  <stop offset="0%" stopColor="#0a1628" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#0a1628" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="evalFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e11d48" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#e11d48" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                interval={3}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  background: "#ffffff",
                  color: "#0a1628",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="api"
                name="API"
                stroke="#0a1628"
                fill="url(#apiFill)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="eval"
                name="Evals"
                stroke="#e11d48"
                fill="url(#evalFill)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-[0_1px_2px_rgba(10,22,40,0.04)]">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#64748b]">
              <Building2 className="h-4 w-4" /> Top Clients
            </h3>
            <Link
              href="/clients"
              className="text-[11px] font-semibold text-[#0a1628]"
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

        <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-[0_1px_2px_rgba(10,22,40,0.04)]">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#64748b]">
              <Link2 className="h-4 w-4" /> Top Deployments
            </h3>
            <Link
              href="/infrastructure"
              className="text-[11px] font-semibold text-[#0a1628]"
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
                    ? "#e11d48"
                    : c.health === "warning"
                      ? "#d97706"
                      : "#0a1628"
                }
                href="/infrastructure"
                health={c.health}
              />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-[0_1px_2px_rgba(10,22,40,0.04)]">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#64748b]">
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
            <div className="mt-3 rounded-lg border border-[#e11d48]/25 bg-[#e11d48]/08 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#e11d48]">
                Needs attention now
              </p>
              <p className="mt-1 text-sm font-semibold text-[#0a1628]">
                {openIncidents[0].title}
              </p>
              <p className="mt-0.5 text-[12px] text-[#64748b]">
                {openIncidents[0].clientName} ·{" "}
                {relativeTime(openIncidents[0].openedAt)}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-[0_1px_2px_rgba(10,22,40,0.04)]">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#64748b]">
            Network Activity
          </h3>
          <span className="text-[11px] font-semibold text-[#e11d48] live-pulse">
            Live feed
          </span>
        </div>
        <ul className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {networkEvents.slice(0, 9).map((evt) => (
            <li
              key={evt.id}
              className="flex gap-2 rounded-lg border border-[#e2e8f0] bg-[#f4f6f9]/80 px-3 py-2"
            >
              <HealthDot status={evt.severity ?? "healthy"} className="mt-1.5" />
              <div className="min-w-0">
                <p className="truncate text-[13px] text-[#0a1628]">
                  {evt.message}
                </p>
                <p className="text-[10px] uppercase tracking-[0.08em] text-[#94a3b8]">
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
