"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Link2,
  Server,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
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
  opportunities,
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

const TREND = (() => {
  const apiProfile = [
    180, 2100, 90, 2450, 220, 2800, 60, 1980, 340, 2650, 110, 1720, 80, 2550,
    150, 2280, 70, 2900, 200, 1850, 95, 2700, 140, 2150,
  ];
  const evalProfile = [
    60, 980, 40, 1420, 90, 1680, 30, 1210, 120, 1550, 45, 890, 35, 1480, 55,
    1320, 25, 1750, 80, 1100, 40, 1600, 70, 1250,
  ];
  return apiProfile.map((api, i) => ({
    time: `${String(i).padStart(2, "0")}:00`,
    api,
    eval: evalProfile[i],
  }));
})();

type KpiKey =
  | "deployments"
  | "uptime"
  | "incidents"
  | "evals"
  | "api"
  | "pipeline";

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  active,
  onClick,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  color: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full flex-col rounded-xl border bg-white p-3 text-left shadow-[0_1px_2px_rgba(10,22,40,0.04)] transition ${
        active
          ? "border-[#e11d48] ring-2 ring-[#e11d48]/20"
          : "border-[#e2e8f0] hover:border-[#0a1628]/30"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-md"
          style={{ backgroundColor: `${color}14` }}
        >
          <Icon className="h-3.5 w-3.5" style={{ color }} />
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#94a3b8]">
          Click
        </span>
      </div>
      <p className="mt-2 truncate text-xl font-semibold leading-none tabular-nums text-[#0a1628]">
        {value}
      </p>
      <p className="mt-1.5 truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-[#64748b]">
        {label}
      </p>
      {sub && (
        <p className="mt-0.5 truncate text-[11px] text-[#94a3b8]">{sub}</p>
      )}
    </button>
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
  const [selectedKpi, setSelectedKpi] = useState<KpiKey | null>(null);
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
  const liveClients = clients.filter((c) =>
    ["live", "ramped", "deploying"].includes(c.maturity)
  );
  const totalApi = clients.reduce((s, c) => s + c.apiCalls24h, 0);
  const totalArr = clients.reduce((s, c) => s + c.arr, 0);

  const kpiItems: {
    key: KpiKey;
    label: string;
    value: string;
    sub: string;
    icon: React.ElementType;
    color: string;
  }[] = [
    {
      key: "deployments",
      label: "Active Deployments",
      value: String(kpis.activeDeployments),
      sub: `${clients.length} managed accounts`,
      icon: Server,
      color: "#0a1628",
    },
    {
      key: "uptime",
      label: "Fleet Uptime",
      value: `${kpis.fleetUptime.toFixed(2)}%`,
      sub: "Across live runtimes",
      icon: Activity,
      color: "#059669",
    },
    {
      key: "incidents",
      label: "Open Incidents",
      value: String(kpis.openIncidents),
      sub: "Requires ops attention",
      icon: AlertTriangle,
      color: "#e11d48",
    },
    {
      key: "evals",
      label: "Evals Passing",
      value: `${kpis.evaluationsPassing}/${kpis.evaluationsTotal}`,
      sub: "Score ≥ 85",
      icon: CheckCircle2,
      color: "#6d5ce7",
    },
    {
      key: "api",
      label: "API Calls 24h",
      value: formatNumber(totalApi),
      sub: "Managed deployment traffic",
      icon: Zap,
      color: "#1a365d",
    },
    {
      key: "pipeline",
      label: "Open Pipeline",
      value: formatCurrency(summary.totalOpen, true),
      sub: `Weighted ${formatCurrency(summary.weighted, true)}`,
      icon: Building2,
      color: "#be123c",
    },
  ];

  const kpiDetail = useMemo(() => {
    if (!selectedKpi) return null;
    switch (selectedKpi) {
      case "deployments":
        return {
          title: "Active Deployments",
          blurb:
            "Accounts currently live, ramped, or deploying on the Phaeron management plane.",
          rows: liveClients.map((c) => ({
            label: c.name,
            meta: `${c.city} · ${c.maturity}`,
            value: healthLabel(c.health),
            href: `/clients/${c.id}`,
            health: c.health,
          })),
        };
      case "uptime":
        return {
          title: "Fleet Uptime",
          blurb: `Fleet average ${kpis.fleetUptime.toFixed(2)}%. Lowest accounts need attention first.`,
          rows: [...clients]
            .sort((a, b) => a.uptime - b.uptime)
            .slice(0, 8)
            .map((c) => ({
              label: c.name,
              meta: `${c.city} · P99 ${c.latencyP99}ms`,
              value: formatPercent(c.uptime),
              href: `/clients/${c.id}`,
              health: c.health,
            })),
        };
      case "incidents":
        return {
          title: "Open Incidents",
          blurb: "Unresolved operational events across managed deployments.",
          rows: openIncidents.map((i) => ({
            label: i.title,
            meta: `${i.clientName} · ${relativeTime(i.openedAt)}`,
            value: i.severity,
            href: i.clientId ? `/clients/${i.clientId}` : "/infrastructure",
            health:
              i.severity === "critical"
                ? ("critical" as const)
                : i.severity === "high"
                  ? ("warning" as const)
                  : ("healthy" as const),
          })),
        };
      case "evals":
        return {
          title: "Evaluation Coverage",
          blurb: "Grounding / eval scores across the managed client fleet.",
          rows: [...clients]
            .sort((a, b) => a.evaluationScore - b.evaluationScore)
            .map((c) => ({
              label: c.name,
              meta: `Runtime ${c.runtimeVersion}`,
              value: c.evaluationScore.toFixed(1),
              href: `/clients/${c.id}`,
              health:
                c.evaluationScore >= 85
                  ? ("healthy" as const)
                  : c.evaluationScore >= 80
                    ? ("warning" as const)
                    : ("critical" as const),
            })),
        };
      case "api":
        return {
          title: "API Traffic · 24h",
          blurb: `Total ${formatNumber(totalApi)} managed calls in the last day.`,
          rows: [...clients]
            .sort((a, b) => b.apiCalls24h - a.apiCalls24h)
            .slice(0, 10)
            .map((c) => ({
              label: c.name,
              meta: `${c.city} · err ${c.errorRate}%`,
              value: formatNumber(c.apiCalls24h),
              href: `/clients/${c.id}`,
              health: c.health,
            })),
        };
      case "pipeline":
        return {
          title: "Open Pipeline",
          blurb: `Gross ${formatCurrency(summary.totalOpen, true)} · weighted ${formatCurrency(summary.weighted, true)} · booked ARR ${formatCurrency(totalArr, true)}.`,
          rows: opportunities.map((o) => ({
            label: o.clientName,
            meta: `${o.stage} · ${o.owner}`,
            value: formatCurrency(o.value, true),
            href: o.clientId ? `/clients/${o.clientId}` : "/revenue",
            health: o.health,
          })),
        };
      default:
        return null;
    }
  }, [
    selectedKpi,
    liveClients,
    kpis.fleetUptime,
    openIncidents,
    totalApi,
    summary.totalOpen,
    summary.weighted,
    totalArr,
  ]);

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
          commercial pipeline. Click any KPI tile to drill in.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5 content-start">
            {kpiItems.map((item) => (
              <StatCard
                key={item.key}
                label={item.label}
                value={item.value}
                sub={item.sub}
                icon={item.icon}
                color={item.color}
                active={selectedKpi === item.key}
                onClick={() =>
                  setSelectedKpi((prev) =>
                    prev === item.key ? null : item.key
                  )
                }
              />
            ))}
          </div>

          <AnimatePresence>
            {kpiDetail && (
              <motion.div
                key={kpiDetail.title}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-xl border border-[#e11d48]/25 bg-white p-4 shadow-[0_1px_2px_rgba(10,22,40,0.04)]">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#e11d48]">
                        KPI detail
                      </p>
                      <h3 className="text-base font-semibold text-[#0a1628]">
                        {kpiDetail.title}
                      </h3>
                      <p className="mt-0.5 text-[12px] text-[#64748b]">
                        {kpiDetail.blurb}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedKpi(null)}
                      className="rounded-lg border border-[#e2e8f0] p-1.5 text-[#64748b]"
                      aria-label="Close KPI detail"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <ul className="max-h-64 space-y-1.5 overflow-y-auto">
                    {kpiDetail.rows.map((row) => (
                      <li key={`${row.label}-${row.meta}`}>
                        <Link
                          href={row.href}
                          className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 hover:bg-[#f4f6f9]"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            {"health" in row && row.health && (
                              <HealthDot status={row.health} />
                            )}
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-[#0a1628]">
                                {row.label}
                              </p>
                              <p className="truncate text-[11px] text-[#64748b]">
                                {row.meta}
                              </p>
                            </div>
                          </div>
                          <span className="shrink-0 text-sm font-semibold tabular-nums text-[#0a1628]">
                            {row.value}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="min-h-[420px] lg:min-h-[480px]">
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
              Volatile ops load · API spikes vs eval bursts · last 24h
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
              <YAxis
                width={36}
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                domain={[0, "auto"]}
              />
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
                type="linear"
                dataKey="api"
                name="API"
                stroke="#0a1628"
                fill="url(#apiFill)"
                strokeWidth={2.25}
                isAnimationActive={false}
              />
              <Area
                type="linear"
                dataKey="eval"
                name="Evals"
                stroke="#e11d48"
                fill="url(#evalFill)"
                strokeWidth={2.25}
                isAnimationActive={false}
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
