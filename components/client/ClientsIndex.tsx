"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
  Input,
  SectionHeader,
  Tag,
} from "@/components/ui";
import type { HealthStatus, Region } from "@/data/types";
import { useLiveClients } from "@/lib/query/hooks";

export function ClientsIndex() {
  const { data: clients } = useLiveClients();
  const [q, setQ] = useState("");
  const [region, setRegion] = useState<Region | "all">("all");
  const [health, setHealth] = useState<HealthStatus | "all">("all");

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      if (region !== "all" && c.region !== region) return false;
      if (health !== "all" && c.health !== health) return false;
      if (!q) return true;
      const hay = `${c.name} ${c.city} ${c.industry}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });
  }, [q, region, health, clients]);

  return (
    <div className="space-y-4">
      <SectionHeader
        eyebrow="Account Management"
        title="Clients"
        description="Manage funds-industry deployments — health, maturity, and commercial posture."
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search clients, cities, industries…"
          className="max-w-sm"
        />
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value as Region | "all")}
          className="h-9 rounded-lg border border-border bg-card px-3 text-[12px] font-medium text-foreground"
        >
          <option value="all">All regions</option>
          <option value="EMEA">EMEA</option>
          <option value="Americas">Americas</option>
          <option value="APAC">APAC</option>
        </select>
        <select
          value={health}
          onChange={(e) => setHealth(e.target.value as HealthStatus | "all")}
          className="h-9 rounded-lg border border-border bg-card px-3 text-[12px] font-medium text-foreground"
        >
          <option value="all">All health</option>
          <option value="healthy">Healthy</option>
          <option value="warning">Degraded</option>
          <option value="critical">Critical</option>
        </select>
        <span className="text-[12px] text-muted-foreground">
          {filtered.length} accounts
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((c) => (
          <Link key={c.id} href={`/clients/${c.id}`}>
            <Card className="h-full transition-shadow hover:shadow-[0_8px_28px_rgba(10,22,40,0.08)]">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <HealthDot status={c.health} />
                  <h3 className="font-display text-[22px] leading-tight text-foreground">
                    {c.name}
                  </h3>
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
              <p className="mt-1 text-[12px] text-muted-foreground">
                {c.industry} · {c.city}, {c.country}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Tag>{maturityLabel(c.maturity)}</Tag>
                <Tag>{c.region}</Tag>
                <Tag>Eval {c.evaluationScore.toFixed(1)}</Tag>
              </div>
              <div className="mt-4 flex justify-between border-t border-border pt-3 text-[12px]">
                <span className="text-muted-foreground">
                  Uptime {formatPercent(c.uptime)}
                </span>
                <span className="font-semibold text-foreground">
                  {c.arr > 0 ? formatCurrency(c.arr, true) : "Pipeline"}
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
