"use client";

import { useState } from "react";
import {
  clusters,
  incidents,
  regionSummaries,
  rollouts,
} from "@/data/mock";
import type { Cluster } from "@/data/types";
import { formatPercent, healthLabel, relativeTime } from "@/lib/utils";
import {
  Badge,
  Card,
  HealthDot,
  SectionHeader,
  Tag,
} from "@/components/ui";

function ClusterDrawer({
  cluster,
  onClose,
}: {
  cluster: Cluster;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-[rgba(10,22,40,0.08)] bg-[rgba(255,255,255,0.96)] p-5 shadow-[-8px_0_40px_rgba(10,22,40,0.08)] backdrop-blur">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
            Cluster detail
          </p>
          <h2 className="font-display text-[28px] text-[var(--color-navy-deep)]">
            {cluster.name}
          </h2>
          <p className="text-[12px] text-[var(--color-text-muted)]">
            {cluster.clientName} · {cluster.region}
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg px-2 py-1 text-[12px] font-semibold text-[var(--color-text-muted)] hover:bg-[rgba(10,22,40,0.04)]"
        >
          Close
        </button>
      </div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        <Tag>K8s {cluster.k8sVersion}</Tag>
        <Tag>{cluster.nodeCount} nodes</Tag>
        <Tag>Uptime {formatPercent(cluster.uptime)}</Tag>
      </div>
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
        Services
      </h3>
      <ul className="space-y-2">
        {cluster.services.map((s) => (
          <li
            key={s.id}
            className="flex items-center justify-between rounded-lg bg-[rgba(10,22,40,0.03)] px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <HealthDot status={s.status} />
              <span className="text-[13px] font-semibold">{s.name}</span>
            </div>
            <span className="text-[11px] text-[var(--color-text-muted)]">
              {s.ready}/{s.replicas} · CPU {s.cpu}% · Mem {s.memory}%
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[12px] text-[var(--color-text-muted)]">
        Last rollout {relativeTime(cluster.lastRollout)} · CPU {cluster.cpuUtil}%
        · Memory {cluster.memUtil}%
      </p>
    </div>
  );
}

export default function InfrastructurePage() {
  const [selected, setSelected] = useState<Cluster | null>(null);
  const regions = regionSummaries();

  return (
    <div className="mx-auto max-w-[1440px] px-5 py-6 md:px-8">
      <SectionHeader
        eyebrow="Fleet Operations"
        title="Infrastructure"
        description="Global AI fleet health — regions, clusters, services, incidents, and rollouts."
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {regions.map((r) => (
              <Card key={r.region}>
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-[22px] text-[var(--color-navy-deep)]">
                    {r.region}
                  </h3>
                  <HealthDot status={r.health} />
                </div>
                <dl className="mt-3 space-y-1 text-[12px]">
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-text-muted)]">Clusters</dt>
                    <dd className="font-semibold">{r.totalClusters}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-text-muted)]">Healthy pods</dt>
                    <dd className="font-semibold">{r.healthyPods}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-text-muted)]">Degraded</dt>
                    <dd className="font-semibold">{r.degradedPods}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[var(--color-text-muted)]">Alerts</dt>
                    <dd className="font-semibold">{r.activeAlerts}</dd>
                  </div>
                </dl>
              </Card>
            ))}
          </div>

          <div>
            <h2 className="mb-3 font-display text-[24px] text-[var(--color-navy-deep)]">
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
                        <p className="font-mono text-[13px] font-semibold text-[var(--color-navy-deep)]">
                          {c.name}
                        </p>
                        <p className="mt-0.5 text-[12px] text-[var(--color-text-muted)]">
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
                      <Tag>K8s {c.k8sVersion}</Tag>
                      <Tag>{c.nodeCount} nodes</Tag>
                      <Tag>
                        Pods {c.podsHealthy}/{c.podsHealthy + c.podsPending + c.podsFailed}
                      </Tag>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-[var(--color-text-muted)]">
                      <span>CPU {c.cpuUtil}%</span>
                      <span>Mem {c.memUtil}%</span>
                      <span>Uptime {formatPercent(c.uptime)}</span>
                      <span>Rollout {relativeTime(c.lastRollout)}</span>
                    </div>
                  </Card>
                </button>
              ))}
            </div>
          </div>

          <Card>
            <h2 className="font-display text-[22px] text-[var(--color-navy-deep)]">
              Rollout Tracker
            </h2>
            <ul className="mt-3 space-y-3">
              {rollouts.map((r) => (
                <li
                  key={r.id}
                  className="rounded-lg border border-[rgba(10,22,40,0.06)] bg-white/50 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[13px] font-semibold text-[var(--color-navy-deep)]">
                        {r.name}
                      </p>
                      <p className="text-[12px] text-[var(--color-text-muted)]">
                        {r.fromVersion} → {r.toVersion} · {r.targetClients.join(", ")}
                      </p>
                    </div>
                    <Badge
                      tone={
                        r.status === "in_progress"
                          ? "navy"
                          : r.status === "scheduled"
                            ? "muted"
                            : "healthy"
                      }
                    >
                      {r.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[rgba(10,22,40,0.06)]">
                    <div
                      className="h-full rounded-full bg-[var(--color-navy-accent)]"
                      style={{ width: `${r.progress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-[var(--color-text-faint)]">
                    {r.progress}% · started {relativeTime(r.startedAt)}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <aside>
          <Card className="sticky top-[88px]" elevated>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
              Open Incidents
            </p>
            <ul className="mt-3 space-y-3">
              {incidents
                .slice()
                .sort((a, b) => {
                  const order = { critical: 0, high: 1, medium: 2, low: 3 };
                  return order[a.severity] - order[b.severity];
                })
                .map((i) => (
                  <li
                    key={i.id}
                    className="rounded-lg border border-[rgba(10,22,40,0.06)] bg-[rgba(10,22,40,0.02)] p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13px] font-semibold leading-snug text-[var(--color-navy-deep)]">
                        {i.title}
                      </p>
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
                    <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                      {i.clientName} · {i.component}
                    </p>
                    <p className="mt-1 text-[12px] text-[var(--color-text-secondary)]">
                      {i.impact}
                    </p>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-faint)]">
                      {i.owner} · {i.status} · {relativeTime(i.openedAt)}
                    </p>
                  </li>
                ))}
            </ul>
          </Card>
        </aside>
      </div>

      {selected && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-[rgba(10,22,40,0.2)]"
            aria-label="Close drawer"
            onClick={() => setSelected(null)}
          />
          <ClusterDrawer cluster={selected} onClose={() => setSelected(null)} />
        </>
      )}
    </div>
  );
}
