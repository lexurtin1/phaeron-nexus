"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { clients } from "@/data/mock";
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
import type { DeploymentMaturity, HealthStatus, Region } from "@/data/types";

export function ClientsIndex() {
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
  }, [q, region, health]);

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-6 md:px-8">
      <SectionHeader
        eyebrow="Account Network"
        title="Clients"
        description="Every Phaeron deployment — health, maturity, and commercial posture in one command surface."
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
          className="h-9 rounded-lg border border-[rgba(10,22,40,0.1)] bg-white/80 px-3 text-[12px] font-medium"
        >
          <option value="all">All regions</option>
          <option value="EMEA">EMEA</option>
          <option value="Americas">Americas</option>
          <option value="APAC">APAC</option>
        </select>
        <select
          value={health}
          onChange={(e) => setHealth(e.target.value as HealthStatus | "all")}
          className="h-9 rounded-lg border border-[rgba(10,22,40,0.1)] bg-white/80 px-3 text-[12px] font-medium"
        >
          <option value="all">All health</option>
          <option value="healthy">Healthy</option>
          <option value="warning">Degraded</option>
          <option value="critical">Critical</option>
        </select>
        <span className="text-[12px] text-[var(--color-text-muted)]">
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
                  <h3 className="font-display text-[22px] leading-tight text-[var(--color-navy-deep)]">
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
              <p className="mt-1 text-[12px] text-[var(--color-text-muted)]">
                {c.industry} · {c.city}, {c.country}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Tag>{maturityLabel(c.maturity as DeploymentMaturity)}</Tag>
                <Tag>{c.region}</Tag>
                <Tag>Eval {c.evaluationScore.toFixed(1)}</Tag>
              </div>
              <div className="mt-4 flex justify-between border-t border-[rgba(10,22,40,0.06)] pt-3 text-[12px]">
                <span className="text-[var(--color-text-muted)]">
                  Uptime {formatPercent(c.uptime)}
                </span>
                <span className="font-semibold text-[var(--color-navy-deep)]">
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
