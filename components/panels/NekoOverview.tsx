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
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  healthLabel,
  relativeTime,
} from "@/lib/utils";
import { HealthDot } from "@/components/ui";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { StatsCards } from "@/components/features/stats/stats-cards";
import { WorldTrafficMap } from "@/components/features/countries/world-traffic-map";
import {
  buildCountryStatsFromClients,
  buildStatsSummaryFromSnapshot,
  clientsForCountryIso,
} from "@/lib/neko-adapters";
import { useNexusSnapshot } from "@/lib/query/hooks";
import { LiveChart } from "@/components/charts/LiveChart";

type KpiKey =
  | "deployments"
  | "uptime"
  | "incidents"
  | "evals"
  | "api"
  | "pipeline";

function RankRow({
  rank,
  title,
  subtitle,
  metric,
  bar,
  barColor = "var(--chart-1)",
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
    <div className="space-y-1.5 rounded-lg px-1 py-2 hover:bg-muted/60">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2">
          <span
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold ${
              rank <= 3
                ? "bg-primary/12 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {rank}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              {health && <HealthDot status={health} />}
              <p className="truncate text-sm font-semibold text-foreground">
                {title}
              </p>
            </div>
            <p className="truncate text-[11px] text-muted-foreground">
              {subtitle}
            </p>
          </div>
        </div>
        <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
          {metric}
        </p>
      </div>
      <div className="ml-7 h-1.5 overflow-hidden rounded-sm bg-muted">
        <div
          className="h-full rounded-sm"
          style={{
            width: `${Math.max(4, Math.min(100, bar * 100))}%`,
            backgroundColor: barColor,
          }}
        />
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export function NekoOverview() {
  const [selectedKpi, setSelectedKpi] = useState<KpiKey | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const { data: snapshot, isLoading } = useNexusSnapshot();

  const clients = snapshot?.clients ?? [];
  const clusters = snapshot?.clusters ?? [];
  const incidents = snapshot?.incidents ?? [];
  const networkEvents = snapshot?.networkEvents ?? [];
  const opportunities = snapshot?.opportunities ?? [];
  const organisations = snapshot?.organisations ?? [];

  const stats = useMemo(
    () =>
      snapshot
        ? buildStatsSummaryFromSnapshot(snapshot)
        : {
            totalUpload: 0,
            totalDownload: 0,
            totalConnections: 0,
            totalDomains: 0,
            totalRules: 0,
            activeDeployments: 0,
            fleetUptime: 0,
            openIncidents: 0,
            evaluationsPassing: 0,
            evaluationsTotal: 0,
            pipelineValue: 0,
            totalApiCalls24h: 0,
          },
    [snapshot]
  );
  const countryStats = useMemo(
    () => buildCountryStatsFromClients(clients),
    [clients]
  );
  const kpis = snapshot?.fleet ?? {
    activeDeployments: 0,
    fleetUptime: 0,
    openIncidents: 0,
    evaluationsPassing: 0,
    evaluationsTotal: 0,
    fleetRps: 0,
    fleetP95: 0,
  };
  const summary = snapshot?.commercial ?? {
    totalOpen: 0,
    weighted: 0,
    contractedArr: 0,
    liveArr: 0,
    rampedArr: 0,
    pipelineCoverage: 0,
    confidenceWeighted: 0,
    dealsToTarget: 0,
  };
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
  const countryClients = selectedCountry
    ? clientsForCountryIso(clients, selectedCountry)
    : [];

  const fleetLiveSeries = useMemo(() => {
    if (!organisations.length) {
      return { timestamps: [] as number[], rps: [] as number[], p95: [] as number[] };
    }
    const timestamps = organisations[0].liveTimestamps;
    const rps = timestamps.map((_, i) =>
      organisations.reduce((s, o) => s + (o.liveTraffic[i] ?? 0), 0)
    );
    const p95 = timestamps.map((_, i) => {
      const vals = organisations.map((o) => o.liveLatency[i] ?? o.latencyP99);
      return vals.reduce((a, b) => a + b, 0) / Math.max(vals.length, 1);
    });
    return { timestamps, rps, p95 };
  }, [organisations]);

  if (isLoading && !snapshot) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Connecting to Nexus LivePulse…
      </div>
    );
  }

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
              i.severity === "critical" || i.severity === "high"
                ? ("critical" as const)
                : i.severity === "medium"
                  ? ("warning" as const)
                  : ("healthy" as const),
          })),
        };
      case "evals":
        return {
          title: "Evaluation Scores",
          blurb: "Passing threshold is ≥ 85 across managed accounts.",
          rows: [...clients]
            .sort((a, b) => a.evaluationScore - b.evaluationScore)
            .slice(0, 8)
            .map((c) => ({
              label: c.name,
              meta: c.city,
              value: String(c.evaluationScore),
              href: `/clients/${c.id}`,
              health: c.health,
            })),
        };
      case "api":
        return {
          title: "API Calls · 24h",
          blurb: "Highest traffic managed deployments in the last day.",
          rows: [...clients]
            .sort((a, b) => b.apiCalls24h - a.apiCalls24h)
            .slice(0, 8)
            .map((c) => ({
              label: c.name,
              meta: c.city,
              value: formatNumber(c.apiCalls24h),
              href: `/clients/${c.id}`,
              health: c.health,
            })),
        };
      case "pipeline":
        return {
          title: "Open Pipeline",
          blurb: `Open ${formatCurrency(summary.totalOpen, true)} · weighted ${formatCurrency(summary.weighted, true)}.`,
          rows: opportunities
            .filter((o) => o.stage !== "Live")
            .sort((a, b) => b.value - a.value)
            .slice(0, 8)
            .map((o) => ({
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
    clients,
    kpis.fleetUptime,
    openIncidents,
    summary.totalOpen,
    summary.weighted,
    opportunities,
  ]);

  return (
    <div className="space-y-4">
      <StatsCards
        data={stats}
        activeKey={selectedKpi}
        onSelect={(key) =>
          setSelectedKpi((prev) => (prev === key ? null : (key as KpiKey)))
        }
      />

      {kpiDetail && (
            <Card className="border-primary/30">
              <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
                <div>
                  <CardTitle className="text-base">{kpiDetail.title}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {kpiDetail.blurb}
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => setSelectedKpi(null)}
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-border">
                  {kpiDetail.rows.map((row) => (
                    <li key={`${row.label}-${row.meta}`}>
                      <Link
                        href={row.href}
                        className="flex items-center justify-between gap-3 py-2.5 hover:bg-muted/40"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          {row.health && <HealthDot status={row.health} />}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                              {row.label}
                            </p>
                            <p className="truncate text-[11px] text-muted-foreground">
                              {row.meta}
                            </p>
                          </div>
                        </div>
                        <span className="shrink-0 text-sm font-semibold tabular-nums">
                          {row.value}
                        </span>
                      </Link>
                    </li>
                  ))}
                  {kpiDetail.rows.length === 0 && (
                    <li className="py-4 text-sm text-muted-foreground">
                      Nothing to show for this KPI.
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
      )}

      <WorldTrafficMap
        data={countryStats}
        onCountryClick={(iso) =>
          setSelectedCountry((prev) => (prev === iso ? null : iso))
        }
      />

      {selectedCountry && (
            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
                <div>
                  <CardTitle className="text-base">
                    Clients in {selectedCountry}
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {countryClients.length} managed account
                    {countryClients.length === 1 ? "" : "s"}
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                  onClick={() => setSelectedCountry(null)}
                >
                  <X className="h-4 w-4" />
                </button>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-border">
                  {countryClients.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/clients/${c.id}`}
                        className="flex items-center justify-between gap-3 py-2.5 hover:bg-muted/40"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <HealthDot status={c.health} />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                              {c.name}
                            </p>
                            <p className="truncate text-[11px] text-muted-foreground">
                              {c.city} · {c.maturity}
                            </p>
                          </div>
                        </div>
                        <span className="shrink-0 text-sm font-semibold tabular-nums">
                          {formatNumber(c.apiCalls24h)} calls
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-primary" />
              Live fleet telemetry
              <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
                LivePulse · 1s
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[240px]">
            {fleetLiveSeries.timestamps.length > 2 ? (
              <LiveChart
                height={210}
                timestamps={fleetLiveSeries.timestamps}
                series={[
                  {
                    label: "Fleet RPS",
                    color: "var(--chart-1)",
                    values: fleetLiveSeries.rps,
                  },
                  {
                    label: "P95 ms",
                    color: "var(--chart-5)",
                    values: fleetLiveSeries.p95,
                  },
                ]}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Waiting for live samples…
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-[var(--chart-5)]" />
              Live events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {networkEvents.slice(0, 6).map((evt) => (
                <li key={evt.id} className="flex gap-2">
                  <HealthDot
                    status={
                      evt.severity === "critical"
                        ? "critical"
                        : evt.severity === "warning"
                          ? "warning"
                          : "healthy"
                    }
                    className="mt-1.5"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{evt.message}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {evt.type} · {relativeTime(evt.timestamp)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4 text-[var(--chart-3)]" />
              Top clients by API
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {topClients.map((c, i) => (
              <RankRow
                key={c.id}
                rank={i + 1}
                title={c.name}
                subtitle={`${c.city} · ${c.country}`}
                metric={formatNumber(c.apiCalls24h)}
                bar={c.apiCalls24h / maxCalls}
                barColor="var(--chart-1)"
                href={`/clients/${c.id}`}
                health={c.health}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Server className="h-4 w-4 text-[var(--chart-4)]" />
              Hottest clusters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {topClusters.map((c, i) => (
              <RankRow
                key={c.id}
                rank={i + 1}
                title={c.name}
                subtitle={`${c.region} · ${c.clientName ?? "shared"}`}
                metric={`${c.cpuUtil.toFixed(0)}% CPU`}
                bar={c.cpuUtil / 100}
                barColor="var(--chart-2)"
                href={c.clientId ? `/clients/${c.clientId}` : "/infrastructure"}
                health={c.health}
              />
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-primary" />
              Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              {clients.length}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {liveClients.length} active deployments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-[var(--chart-4)]" />
              Contracted ARR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tabular-nums">
              {formatCurrency(summary.contractedArr, true)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Live {formatCurrency(summary.liveArr, true)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Link2 className="h-4 w-4 text-[var(--chart-2)]" />
              Quick links
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {[
              ["/clients", "Clients"],
              ["/ontology", "GraphRAG"],
              ["/infrastructure", "Infra"],
              ["/revenue", "Revenue"],
              ["/team", "Team"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="rounded-md border border-border bg-muted/40 px-2.5 py-1 text-xs font-semibold hover:bg-muted"
              >
                {label}
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
