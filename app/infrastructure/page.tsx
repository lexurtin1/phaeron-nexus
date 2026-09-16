"use client";

import { useState } from "react";
import type { Cluster } from "@/data/types";
import { formatPercent, healthLabel, relativeTime } from "@/lib/utils";
import {
  Badge,
  Card,
  HealthDot,
  SectionHeader,
  Tag,
} from "@/components/ui";
import {
  useLiveClusters,
  useLiveIncidents,
  useLiveRegionSummaries,
  useLiveRollouts,
  useNexusSnapshot,
} from "@/lib/query/hooks";
import { LiveChart } from "@/components/charts/LiveChart";

function ClusterDrawer({
  cluster,
  onClose,
}: {
  cluster: Cluster;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-border bg-card p-5 shadow-[-8px_0_40px_rgba(10,22,40,0.08)] backdrop-blur">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Cluster detail
          </p>
          <h2 className="font-display text-[28px] text-foreground">
            {cluster.name}
          </h2>
          <p className="text-[12px] text-muted-foreground">
            {cluster.clientName} · {cluster.region}
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg px-2 py-1 text-[12px] font-semibold text-muted-foreground hover:bg-muted/60"
        >
          Close
        </button>
      </div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        <Tag>K8s {cluster.k8sVersion}</Tag>
        <Tag>{cluster.nodeCount} nodes</Tag>
        <Tag>Uptime {formatPercent(cluster.uptime)}</Tag>
      </div>
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        Services
      </h3>
      <ul className="space-y-2">
        {cluster.services.map((s) => (
          <li
            key={s.id}
            className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <HealthDot status={s.status} />
              <span className="text-[13px] font-semibold">{s.name}</span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              {s.ready}/{s.replicas} · CPU {s.cpu}% · Mem {s.memory}%
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[12px] text-muted-foreground">
        Last rollout {relativeTime(cluster.lastRollout)} · CPU {cluster.cpuUtil}%
        · Memory {cluster.memUtil}%
      </p>
    </div>
  );
}

export default function InfrastructurePage() {
  const [selected, setSelected] = useState<Cluster | null>(null);
  const { data: clusters } = useLiveClusters();
  const { data: incidents } = useLiveIncidents();
  const { data: regions } = useLiveRegionSummaries();
  const { data: rollouts } = useLiveRollouts();
  const { data: snapshot } = useNexusSnapshot();

  const liveCluster = selected
    ? clusters.find((c) => c.id === selected.id) ?? selected
    : null;

  const utilSeries = (() => {
    const orgs = snapshot?.organisations ?? [];
    if (!orgs.length) return null;
    return {
      timestamps: orgs[0].liveTimestamps,
      cpu: clusters.map((c) => c.cpuUtil),
    };
  })();

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Fleet Operations"
        title="Infrastructure"
        description="Manage deployment health — regions, clusters, incidents, and rollouts across the live fleet."
      />

      {snapshot?.fleet && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Card>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Fleet RPS
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {snapshot.fleet.fleetRps.toLocaleString()}
            </p>
          </Card>
          <Card>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Fleet P95
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {snapshot.fleet.fleetP95.toFixed(0)}ms
            </p>
          </Card>
          <Card>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Availability
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">
              {snapshot.fleet.fleetAvailability.toFixed(3)}%
            </p>
          </Card>
        </div>
      )}

      {utilSeries && utilSeries.timestamps.length > 2 && (
        <Card>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Live organisation latency (fleet sample)
          </p>
          <LiveChart
            height={140}
            timestamps={snapshot!.organisations[0].liveTimestamps}
            series={[
              {
                label: "P95 ms",
                color: "#d97706",
                values: snapshot!.organisations[0].liveLatency,
              },
              {
                label: "RPS",
                color: "#059669",
                values: snapshot!.organisations[0].liveTraffic,
              },
            ]}
          />
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {regions.map((r) => (
              <Card key={r.region}>
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-[22px] text-foreground">
                    {r.region}
                  </h3>
                  <HealthDot status={r.health} />
                </div>
                <dl className="mt-3 space-y-1 text-[12px]">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Clusters</dt>
                    <dd className="font-semibold">{r.totalClusters}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Healthy pods</dt>
                    <dd className="font-semibold">{r.healthyPods}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Degraded</dt>
                    <dd className="font-semibold">{r.degradedPods}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Alerts</dt>
                    <dd className="font-semibold">{r.activeAlerts}</dd>
                  </div>
                </dl>
              </Card>
            ))}
          </div>

          <div>
            <h2 className="mb-3 font-display text-[24px] text-foreground">
              Clusters
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {clusters.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelected(c)}
                  className="text-left"
                >
                  <Card className="h-full transition-shadow hover:shadow-[0_8px_28px_rgba(10,22,40,0.08)]">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-mono text-[13px] font-semibold text-foreground">
                          {c.name}
                        </p>
                        <p className="mt-0.5 text-[12px] text-muted-foreground">
                          {c.clientName} · {c.region}
                        </p>
                      </div>
                      <Badge
                        tone={
                          c.health === "healthy"
                            ? "healthy"
                            : c.health === "warning"
                              ? "warning"
                              : "critical"
                        }
                      >
                        {healthLabel(c.health)}
                      </Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <Tag>CPU {c.cpuUtil}%</Tag>
                      <Tag>Mem {c.memUtil}%</Tag>
                      <Tag>
                        Pods {c.podsHealthy}/{c.podsHealthy + c.podsPending + c.podsFailed}
                      </Tag>
                    </div>
                  </Card>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 font-display text-[24px] text-foreground">
              Rollouts
            </h2>
            <div className="space-y-2">
              {rollouts.map((r) => (
                <Card key={r.id}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[13px] font-semibold">{r.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {r.fromVersion} → {r.toVersion} · {r.status}
                      </p>
                    </div>
                    <p className="text-sm font-semibold tabular-nums">
                      {r.progress}%
                    </p>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${r.progress}%` }}
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="font-display text-[24px] text-foreground">Incidents</h2>
          {incidents
            .filter((i) => i.status !== "resolved")
            .map((i) => (
              <Card key={i.id}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13px] font-semibold">{i.title}</p>
                  <Badge
                    tone={
                      i.severity === "critical" || i.severity === "high"
                        ? "critical"
                        : "warning"
                    }
                  >
                    {i.severity}
                  </Badge>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {i.clientName} · {relativeTime(i.openedAt)}
                </p>
              </Card>
            ))}
        </div>
      </div>

      {liveCluster && (
        <ClusterDrawer
          cluster={liveCluster}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
