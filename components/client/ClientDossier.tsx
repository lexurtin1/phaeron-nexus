"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { domainPacks, incidents, resolveClientIntel, tasks } from "@/data/mock";
import type { Client } from "@/data/types";
import { useNexusStore } from "@/lib/store";
import {
  formatCurrency,
  formatLatency,
  formatNumber,
  formatPercent,
  healthLabel,
  maturityLabel,
  relativeTime,
} from "@/lib/utils";
import { Sparkline } from "@/components/charts/Sparkline";
import {
  Badge,
  Button,
  Card,
  Divider,
  HealthDot,
  Input,
  Tag,
} from "@/components/ui";

export function ClientDossier({ client }: { client: Client }) {
  const notes = useNexusStore((s) =>
    s.notes.filter(
      (n) => n.objectType === "client" && n.objectId === client.id
    )
  );
  const addNote = useNexusStore((s) => s.addNote);
  const [draft, setDraft] = useState("");
  const clientTasks = tasks.filter((t) => t.clientId === client.id);
  const clientIncidents = incidents.filter((i) => i.clientId === client.id);
  const packs = domainPacks.filter((p) => p.deployedTo.includes(client.id));
  const intel = resolveClientIntel(client);
  const outdatedPack =
    client.ontologyVersion < "4.2.0" || client.runtimeVersion < "2.4.0";

  const trafficSeries = client.deployment.sparklines.uptime.map((p, i) => ({
    t: p.t,
    api: Math.round(
      client.apiCalls24h / 24 +
        Math.sin(i / 2) * (client.apiCalls24h / 40) +
        (i % 3) * 40
    ),
    latency: client.deployment.sparklines.latency[i]?.v ?? client.latencyP99,
  }));

  const metrics = [
    {
      label: "Runtime",
      value: healthLabel(client.deployment.runtimeStatus),
      status: client.deployment.runtimeStatus,
      spark: client.deployment.sparklines.uptime,
      color: "#0a1628",
    },
    {
      label: "Kubernetes",
      value: healthLabel(client.deployment.kubernetesHealth),
      status: client.deployment.kubernetesHealth,
      spark: client.deployment.sparklines.uptime,
      color: "#059669",
    },
    {
      label: "API Gateway",
      value: healthLabel(client.deployment.apiGateway),
      status: client.deployment.apiGateway,
      spark: client.deployment.sparklines.latency,
      color: "#0a1628",
    },
    {
      label: "Uptime",
      value: formatPercent(client.uptime),
      status: client.health,
      spark: client.deployment.sparklines.uptime,
      color: "#059669",
    },
    {
      label: "Latency P99",
      value: formatLatency(client.latencyP99),
      status:
        client.latencyP99 > 400
          ? ("critical" as const)
          : client.latencyP99 > 250
            ? ("warning" as const)
            : ("healthy" as const),
      spark: client.deployment.sparklines.latency,
      color: "#d97706",
    },
    {
      label: "Error Rate",
      value: formatPercent(client.errorRate),
      status:
        client.errorRate > 2
          ? ("critical" as const)
          : client.errorRate > 0.5
            ? ("warning" as const)
            : ("healthy" as const),
      spark: client.deployment.sparklines.errors,
      color: "#e11d48",
    },
    {
      label: "Evaluation",
      value: client.evaluationScore.toFixed(1),
      status:
        client.evaluationScore >= 90
          ? ("healthy" as const)
          : client.evaluationScore >= 80
            ? ("warning" as const)
            : ("critical" as const),
      spark: client.deployment.sparklines.evaluation,
      color: "#6d5ce7",
    },
    {
      label: "Last Call",
      value: relativeTime(client.deployment.lastCall),
      status: "healthy" as const,
      spark: client.deployment.sparklines.uptime,
      color: "#64748b",
    },
  ];

  return (
    <div className="space-y-5">
      <Link
        href="/clients"
        className="mb-1 inline-flex text-[11px] font-semibold uppercase tracking-[0.12em] text-[#64748b] hover:text-[#0a1628]"
      >
        ← All clients
      </Link>

      <header className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-[0_1px_2px_rgba(10,22,40,0.04)] md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <HealthDot status={client.health} />
              <h1 className="text-[32px] font-bold leading-none text-[#0a1628] md:text-[40px]">
                {client.name}
              </h1>
            </div>
            <p className="mt-2 text-[13px] text-[var(--color-text-secondary)]">
              {client.industry} · {client.city}, {client.country} ·{" "}
              {client.region}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Tag>{maturityLabel(client.maturity)}</Tag>
              <Tag>{client.commercialStage}</Tag>
              <Tag>Tier · {intel.pricingTier}</Tag>
              <Tag>Owner {client.accountOwner}</Tag>
            </div>
          </div>
          <div className="text-right">
            <Badge
              tone={
                client.health === "healthy"
                  ? "healthy"
                  : client.health === "warning"
                    ? "warning"
                    : "critical"
              }
              className="px-3 py-1.5 text-[11px]"
            >
              <span className="live-pulse inline-block">●</span>{" "}
              {healthLabel(client.health)}
            </Badge>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#64748b]">
              ARR
            </p>
            <p className="text-2xl font-semibold tabular-nums text-[#0a1628]">
              {client.arr ? formatCurrency(client.arr, true) : "—"}
            </p>
            <p className="text-[12px] text-[#64748b]">
              MRR {formatCurrency(intel.mrr, true)} · YTD{" "}
              {formatCurrency(intel.ytdRevenue, true)}
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#64748b]">
            Pricing tier
          </p>
          <p className="mt-1 text-xl font-semibold text-[#0a1628]">
            {intel.pricingTier}
          </p>
          <p className="mt-1 text-[12px] text-[#64748b]">
            Contracted ARR {formatCurrency(client.arr || intel.mrr * 12, true)}
          </p>
        </Card>
        <Card>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#64748b]">
            Last meeting
          </p>
          <p className="mt-1 text-sm font-semibold text-[#0a1628]">
            {intel.lastMeeting.title}
          </p>
          <p className="mt-1 text-[12px] text-[#64748b]">
            {relativeTime(intel.lastMeeting.date)}
            {intel.lastMeeting.location ? ` · ${intel.lastMeeting.location}` : ""}
          </p>
          <p className="mt-1 text-[11px] text-[#94a3b8]">
            {intel.lastMeeting.attendees.join(" · ")}
          </p>
        </Card>
        <Card>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#e11d48]">
            Next meeting
          </p>
          <p className="mt-1 text-sm font-semibold text-[#0a1628]">
            {intel.nextMeeting.title}
          </p>
          <p className="mt-1 text-[12px] text-[#64748b]">
            {new Date(intel.nextMeeting.date).toLocaleString("en-GB", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
            {intel.nextMeeting.location ? ` · ${intel.nextMeeting.location}` : ""}
          </p>
          <p className="mt-1 text-[11px] text-[#94a3b8]">
            {intel.nextMeeting.attendees.join(" · ")}
          </p>
        </Card>
      </div>

      <Card>
        <h2 className="font-display text-[22px] text-[var(--color-navy-deep)]">
          Phaeron products in use
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {intel.products.map((p) => (
            <span
              key={p}
              className="rounded-lg border border-[#0a1628]/15 bg-[#0a1628]/5 px-3 py-1.5 text-[12px] font-semibold text-[#0a1628]"
            >
              {p}
            </span>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {packs.map((p) => (
            <Tag key={p.id}>
              Domain pack · {p.name} · {p.version}
            </Tag>
          ))}
        </div>
      </Card>

      <section>
        <h2 className="mb-3 font-display text-[24px] text-[var(--color-navy-deep)]">
          Network & operational stats
        </h2>
        <div className="mb-4 rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-[0_1px_2px_rgba(10,22,40,0.04)]">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-[#0a1628]">
              Traffic · latency overlay (24h)
            </p>
            <p className="text-[11px] text-[#64748b]">
              {formatNumber(client.apiCalls24h)} calls · P99{" "}
              {formatLatency(client.latencyP99)}
            </p>
          </div>
          <div className="h-[180px] w-full">
            <ResponsiveContainer>
              <AreaChart data={trafficSeries}>
                <defs>
                  <linearGradient id="clientApi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0a1628" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#0a1628" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="t"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  interval={3}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="linear"
                  dataKey="api"
                  name="API"
                  stroke="#0a1628"
                  fill="url(#clientApi)"
                  strokeWidth={2}
                />
                <Area
                  type="linear"
                  dataKey="latency"
                  name="Latency"
                  stroke="#e11d48"
                  fill="transparent"
                  strokeWidth={1.75}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) => (
            <Card key={m.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                  {m.label}
                </p>
                <HealthDot status={m.status} />
              </div>
              <p className="text-[18px] font-semibold text-[var(--color-navy-deep)]">
                {m.value}
              </p>
              <Sparkline data={m.spark} color={m.color} />
            </Card>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-[22px] text-[var(--color-navy-deep)]">
            Industry news
          </h2>
          <ul className="mt-3 space-y-3">
            {intel.news.map((n) => (
              <li
                key={n.title}
                className="rounded-lg border border-[#e2e8f0] bg-[#f4f6f9]/70 px-3 py-2.5"
              >
                <p className="text-sm font-semibold text-[#0a1628]">{n.title}</p>
                <p className="mt-1 text-[12px] text-[#64748b]">{n.summary}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-[#94a3b8]">
                  {n.source} · {n.date}
                </p>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="font-display text-[22px] text-[var(--color-navy-deep)]">
            Key contacts
          </h2>
          <ul className="mt-3 space-y-2">
            {client.contacts.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between rounded-lg bg-[#f4f6f9] px-3 py-2 text-[12px]"
              >
                <span>
                  <span className="font-semibold text-[var(--color-navy-deep)]">
                    {c.name}
                  </span>
                  <span className="text-[var(--color-text-muted)]">
                    {" "}
                    · {c.role}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-[#94a3b8]">
                    {c.email}
                  </span>
                </span>
                <Badge
                  tone={
                    c.strength === "strong"
                      ? "healthy"
                      : c.strength === "moderate"
                        ? "navy"
                        : "warning"
                  }
                >
                  {c.strength}
                </Badge>
              </li>
            ))}
          </ul>
          <Divider className="my-3" />
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#64748b]">
            Commercial context
          </h3>
          <dl className="mt-2 space-y-2 text-[13px]">
            <div className="flex justify-between">
              <dt className="text-[var(--color-text-muted)]">Stage</dt>
              <dd className="font-semibold">{client.commercialStage}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--color-text-muted)]">Relationship</dt>
              <dd className="font-semibold">{client.relationshipScore}/100</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--color-text-muted)]">Open opps</dt>
              <dd className="font-semibold">{client.openOpportunities}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--color-text-muted)]">Last contact</dt>
              <dd className="font-semibold">
                {relativeTime(client.lastCommercialContact)}
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-[22px] text-[var(--color-navy-deep)]">
            Ontology state
          </h2>
          <p className="mt-1 text-[12px] text-[var(--color-text-muted)]">
            Master ontology {client.ontologyVersion} · Runtime{" "}
            {client.runtimeVersion}
          </p>
          {outdatedPack && (
            <p className="mt-2 text-[12px] font-medium text-[var(--color-warning)]">
              Pack or runtime behind current master — rollout recommended.
            </p>
          )}
          <Link href="/ontology" className="mt-3 inline-block">
            <Button variant="subtle">Explore ontology graph</Button>
          </Link>
        </Card>

        <Card>
          <h2 className="font-display text-[22px] text-[var(--color-navy-deep)]">
            Open actions
          </h2>
          {clientTasks.length === 0 && clientIncidents.length === 0 ? (
            <p className="mt-3 text-[13px] text-[var(--color-text-muted)]">
              No open actions against this account.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {clientIncidents.map((i) => (
                <li
                  key={i.id}
                  className="rounded-lg border border-[#e11d48]/20 bg-[#e11d48]/5 p-3"
                >
                  <p className="text-[13px] font-semibold text-[#0a1628]">
                    Incident · {i.title}
                  </p>
                  <p className="mt-1 text-[12px] text-[#64748b]">
                    {i.severity} · {relativeTime(i.openedAt)}
                  </p>
                </li>
              ))}
              {clientTasks.map((t) => (
                <li
                  key={t.id}
                  className="rounded-lg bg-[rgba(10,22,40,0.03)] p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[13px] font-semibold text-[var(--color-navy-deep)]">
                      {t.title}
                    </p>
                    <Badge
                      tone={
                        t.priority === "critical"
                          ? "critical"
                          : t.priority === "high"
                            ? "warning"
                            : "navy"
                      }
                    >
                      {t.priority}
                    </Badge>
                  </div>
                  <p className="mt-1 text-[12px] text-[var(--color-text-muted)]">
                    {t.assigneeName} · due {t.dueDate}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="font-display text-[22px] text-[var(--color-navy-deep)]">
          Notes
        </h2>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.trim()) return;
            addNote({
              objectType: "client",
              objectId: client.id,
              author: "Alex Curtin",
              body: draft.trim(),
            });
            setDraft("");
          }}
        >
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add context, observation, or next action…"
          />
          <Button type="submit" variant="primary">
            Add
          </Button>
        </form>
        <ul className="mt-4 space-y-3">
          {notes.map((n) => (
            <li
              key={n.id}
              className="rounded-lg border border-[#e2e8f0] bg-[#f4f6f9] p-3"
            >
              <p className="text-[13px] text-[var(--color-text)]">{n.body}</p>
              <p className="mt-1 text-[11px] text-[var(--color-text-faint)]">
                {n.author} · {relativeTime(n.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
