"use client";

import Link from "next/link";
import { useState } from "react";
import { domainPacks, incidents, tasks } from "@/data/mock";
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
  const outdatedPack =
    client.ontologyVersion < "4.2.0" ||
    client.runtimeVersion < "2.4.0";

  const metrics = [
    {
      label: "Runtime",
      value: healthLabel(client.deployment.runtimeStatus),
      status: client.deployment.runtimeStatus,
      spark: client.deployment.sparklines.uptime,
      color: "#1e4da0",
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
      color: "#1e4da0",
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
      color: "#dc2626",
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
      color: "#1e4da0",
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
        className="mb-1 inline-flex text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 hover:text-[#818cf8]"
      >
        ← All clients
      </Link>

      <header className="rounded-xl border border-white/10 bg-[#171c2b]/90 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.35)] md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <HealthDot status={client.health} />
              <h1 className="text-[32px] font-bold leading-none text-slate-100 md:text-[40px]">
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
              <Tag>Owner {client.accountOwner}</Tag>
            </div>
          </div>
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
        </div>
      </header>

      <section className="mb-5">
        <h2 className="mb-3 font-display text-[24px] text-[var(--color-navy-deep)]">
          Deployment Health
        </h2>
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

      <div className="mb-5 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-[22px] text-[var(--color-navy-deep)]">
            Ontology State
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
          <div className="mt-3 flex flex-wrap gap-1.5">
            {packs.map((p) => (
              <Tag key={p.id}>
                {p.name} · {p.version}
              </Tag>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-[rgba(30,77,160,0.06)] p-3 text-[12px] text-[var(--color-navy-mid)]">
            Overlay relative to master 4.2 — {client.domainPacks.length} domain
            packs active. Open the ontology graph to explore shared concepts.
          </div>
          <Link href="/ontology" className="mt-3 inline-block">
            <Button variant="subtle">Explore ontology graph</Button>
          </Link>
        </Card>

        <Card>
          <h2 className="font-display text-[22px] text-[var(--color-navy-deep)]">
            Commercial Context
          </h2>
          <dl className="mt-3 space-y-2 text-[13px]">
            <div className="flex justify-between">
              <dt className="text-[var(--color-text-muted)]">Stage</dt>
              <dd className="font-semibold">{client.commercialStage}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--color-text-muted)]">ARR</dt>
              <dd className="font-semibold">
                {client.arr ? formatCurrency(client.arr, true) : "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--color-text-muted)]">Owner</dt>
              <dd className="font-semibold">{client.accountOwner}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--color-text-muted)]">Relationship</dt>
              <dd className="font-semibold">{client.relationshipScore}/100</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--color-text-muted)]">Last contact</dt>
              <dd className="font-semibold">
                {relativeTime(client.lastCommercialContact)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--color-text-muted)]">Open opps</dt>
              <dd className="font-semibold">{client.openOpportunities}</dd>
            </div>
          </dl>
          <Divider className="my-3" />
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
            Key contacts
          </p>
          <ul className="space-y-2">
            {client.contacts.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between text-[12px]"
              >
                <span>
                  <span className="font-semibold text-[var(--color-navy-deep)]">
                    {c.name}
                  </span>
                  <span className="text-[var(--color-text-muted)]">
                    {" "}
                    · {c.role}
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
        </Card>
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-[22px] text-[var(--color-navy-deep)]">
            Recent Activity
          </h2>
          <ul className="mt-3 space-y-2.5">
            {[
              `${formatNumber(client.apiCalls24h)} API calls in last 24h`,
              `Evaluation score ${client.evaluationScore.toFixed(1)}`,
              `Runtime ${client.runtimeVersion} · Ontology ${client.ontologyVersion}`,
              ...clientIncidents.map((i) => `Incident: ${i.title}`),
              `Last commercial contact ${relativeTime(client.lastCommercialContact)}`,
            ].map((line, i) => (
              <li
                key={i}
                className="flex gap-2 border-b border-[rgba(10,22,40,0.04)] pb-2 text-[13px] last:border-0"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-navy-accent)]" />
                {line}
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="font-display text-[22px] text-[var(--color-navy-deep)]">
            Open Actions
          </h2>
          {clientTasks.length === 0 ? (
            <p className="mt-3 text-[13px] text-[var(--color-text-muted)]">
              No open actions against this account. Quiet is good — stay
              oriented.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
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
              className="rounded-lg border border-white/10 bg-white/5 p-3"
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
