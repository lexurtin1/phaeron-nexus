"use client";

import { useMemo, useState } from "react";
import type { PipelineStage } from "@/data/types";
import {
  formatCurrency,
  formatPercent,
  healthLabel,
  maturityLabel,
} from "@/lib/utils";
import {
  Badge,
  Card,
  HealthDot,
  SectionHeader,
  Tag,
} from "@/components/ui";
import {
  useLiveClients,
  useLiveCommercial,
  useLiveOpportunities,
} from "@/lib/query/hooks";

const STAGES: PipelineStage[] = [
  "Prospect",
  "Qualified",
  "Proposed",
  "Agreed",
  "Deploying",
  "Live",
];

export default function RevenuePage() {
  const { data: opportunities } = useLiveOpportunities();
  const { data: clients } = useLiveClients();
  const { data: summaryData } = useLiveCommercial();
  const summary = summaryData ?? {
    totalOpen: 0,
    weighted: 0,
    contractedArr: 0,
    liveArr: 0,
    rampedArr: 0,
    pipelineCoverage: 0,
    confidenceWeighted: 0,
    dealsToTarget: 0,
  };
  const [showMap, setShowMap] = useState(false);

  const byStage = useMemo(() => {
    return STAGES.map((stage) => {
      const items = opportunities.filter((o) => o.stage === stage);
      return {
        stage,
        items,
        total: items.reduce((s, o) => s + o.value, 0),
      };
    });
  }, [opportunities]);

  const accountHealth = clients.filter((c) =>
    ["live", "ramped", "deploying", "at_risk"].includes(c.maturity)
  );

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Commercial Intelligence"
        title="Revenue"
        description="Pipeline, account health, and forecast confidence — commercial briefing."
        action={
          <button
            type="button"
            onClick={() => setShowMap((v) => !v)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0063ff]"
          >
            {showMap ? "Hide map" : "Geographic layer"}
          </button>
        }
      />

      <div className="mb-5 grid gap-4 lg:grid-cols-[1.4fr_360px]">
        <Card elevated className="space-y-4">
          <h2 className="font-display text-[28px] leading-snug text-foreground md:text-[32px]">
            {formatCurrency(summary.totalOpen, true)} open,{" "}
            {formatCurrency(summary.weighted, true)} weighted — the rest is
            timing and execution, not doubt.
          </h2>
          <p className="text-[13px] text-muted-foreground">
            Plan on the weighted bar. Coverage against next-quarter target is{" "}
            {summary.pipelineCoverage.toFixed(1)}×.
            {summary.dealsToTarget > 0
              ? ` Roughly ${summary.dealsToTarget} more mid-size closes to lock the plan.`
              : " Coverage is sufficient to hit the near-term plan."}
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Contracted ARR", value: summary.contractedArr },
              { label: "Live ARR", value: summary.liveArr },
              { label: "Ramped ARR", value: summary.rampedArr },
            ].map((row) => (
              <div
                key={row.label}
                className="rounded-lg bg-[rgba(10,22,40,0.03)] p-3"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {row.label}
                </p>
                <p className="mt-1 font-display text-[26px] text-foreground">
                  {formatCurrency(row.value, true)}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Forecast Summary
          </p>
          <dl className="mt-3 space-y-2.5 text-[13px]">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Open pipeline</dt>
              <dd className="font-semibold">
                {formatCurrency(summary.totalOpen, true)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Weighted</dt>
              <dd className="font-semibold">
                {formatCurrency(summary.weighted, true)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Confidence-weighted</dt>
              <dd className="font-semibold">
                {formatCurrency(summary.confidenceWeighted, true)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Coverage</dt>
              <dd className="font-semibold">
                {summary.pipelineCoverage.toFixed(2)}×
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Deals to target</dt>
              <dd className="font-semibold">{summary.dealsToTarget}</dd>
            </div>
          </dl>
        </Card>
      </div>

      {showMap && (
        <Card className="mb-5">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Geographic concentration
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {clients.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-lg bg-[rgba(10,22,40,0.03)] px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <HealthDot status={c.health} />
                  <div>
                    <p className="text-[13px] font-semibold text-foreground">
                      {c.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {c.city} · {maturityLabel(c.maturity)}
                    </p>
                  </div>
                </div>
                <span className="text-[12px] font-semibold">
                  {c.arr ? formatCurrency(c.arr, true) : "Prospect"}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <h2 className="mb-3 font-display text-[24px] text-foreground">
        Pipeline
      </h2>
      <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
        {byStage.map((col) => (
          <div
            key={col.stage}
            className="w-[220px] shrink-0 rounded-xl border border-border bg-[rgba(255,255,255,0.55)] p-3"
          >
            <div className="mb-2 flex items-baseline justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {col.stage}
              </p>
              <p className="text-[12px] font-semibold text-foreground">
                {formatCurrency(col.total, true)}
              </p>
            </div>
            <div className="space-y-2">
              {col.items.map((o) => (
                <Card key={o.id} padding="sm" className="space-y-1.5">
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-[12px] font-semibold leading-snug text-foreground">
                      {o.clientName}
                    </p>
                    <HealthDot status={o.health} />
                  </div>
                  <p className="text-[14px] font-semibold">
                    {formatCurrency(o.value, true)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {o.geography} · {o.owner} · {o.daysInStage}d
                  </p>
                  <p className="text-[11px] leading-snug text-muted-foreground">
                    {o.nextAction}
                  </p>
                </Card>
              ))}
              {col.items.length === 0 && (
                <p className="px-1 py-4 text-center text-[11px] text-muted-foreground">
                  Empty stage
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <h2 className="mb-3 font-display text-[24px] text-foreground">
        Account Health
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {accountHealth.map((c) => (
          <Card key={c.id}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[20px] text-foreground">
                {c.name}
              </h3>
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
            <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                  Commercial
                </p>
                <p className="font-semibold">{c.commercialStage}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                  Deployment
                </p>
                <p className="font-semibold">{maturityLabel(c.maturity)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                  Relationship
                </p>
                <p className="font-semibold">{c.relationshipScore}/100</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                  Revenue
                </p>
                <p className="font-semibold">
                  {c.arr ? formatCurrency(c.arr, true) : "—"}
                </p>
              </div>
            </div>
            <div className="mt-2">
              <Tag>Uptime {formatPercent(c.uptime)}</Tag>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
