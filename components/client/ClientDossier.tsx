"use client";

import Link from "next/link";
import { useState } from "react";
import { domainPacks } from "@/data/mock";
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
import { LiveChart } from "@/components/charts/LiveChart";
import {
  Badge,
  Button,
  Card,
  Divider,
  HealthDot,
  Input,
  Tag,
} from "@/components/ui";
import {
  useLiveIncidents,
  useLiveNotes,
  useLiveOrganisation,
  useLiveTasks,
} from "@/lib/query/hooks";
import { useCreateNote } from "@/lib/query/mutations";

export function ClientDossier({ clientId }: { clientId: string }) {
  const { client, data: org, isLoading } = useLiveOrganisation(clientId);
  const { data: allTasks } = useLiveTasks();
  const { data: allIncidents } = useLiveIncidents();
  const { data: notes } = useLiveNotes(clientId);
  const createNote = useCreateNote();
  const [draft, setDraft] = useState("");

  if (isLoading && !client) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Loading organisation…
      </div>
    );
  }

  if (!client || !org) {
    return (
      <div className="space-y-3">
        <Link href="/clients" className="text-sm text-muted-foreground">
          ← All clients
        </Link>
        <p className="text-sm">Organisation not found.</p>
      </div>
    );
  }

  const clientTasks = allTasks.filter((t) => t.clientId === client.id);
  const clientIncidents = allIncidents.filter((i) => i.clientId === client.id);
  const packs = domainPacks.filter((p) => p.deployedTo.includes(client.id));
  const outdatedPack =
    client.ontologyVersion < "4.2.0" || client.runtimeVersion < "2.4.0";

  const pricingTier = client.pricingTier ?? "Growth";
  const products = client.products ?? [];
  const lastMeeting = client.lastMeeting;
  const nextMeeting = client.nextMeeting;
  const news = client.news ?? [];
  const mrr = client.mrr ?? Math.round(client.arr / 12);
  const ytdRevenue = client.ytdRevenue ?? client.arr;

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
        className="mb-1 inline-flex text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground"
      >
        ← All clients
      </Link>

      <header className="rounded-xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(10,22,40,0.04)] md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <HealthDot status={client.health} />
              <h1 className="text-[32px] font-bold leading-none text-foreground md:text-[40px]">
                {client.name}
              </h1>
            </div>
            <p className="mt-2 text-[13px] text-muted-foreground">
              {client.industry} · {client.city}, {client.country} ·{" "}
              {client.region}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Tag>{maturityLabel(client.maturity)}</Tag>
              <Tag>{client.commercialStage}</Tag>
              <Tag>Tier · {pricingTier}</Tag>
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
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              ARR
            </p>
            <p className="text-2xl font-semibold tabular-nums text-foreground">
              {client.arr ? formatCurrency(client.arr, true) : "—"}
            </p>
            <p className="text-[12px] text-muted-foreground">
              MRR {formatCurrency(mrr, true)} · YTD{" "}
              {formatCurrency(ytdRevenue, true)}
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Pricing tier
          </p>
          <p className="mt-1 text-xl font-semibold text-foreground">
            {pricingTier}
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Contracted ARR {formatCurrency(client.arr || mrr * 12, true)}
          </p>
        </Card>
        <Card>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Last meeting
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {lastMeeting?.title ?? "—"}
          </p>
          {lastMeeting && (
            <>
              <p className="mt-1 text-[12px] text-muted-foreground">
                {relativeTime(lastMeeting.date)}
                {lastMeeting.location ? ` · ${lastMeeting.location}` : ""}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {lastMeeting.attendees.join(" · ")}
              </p>
            </>
          )}
        </Card>
        <Card>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#e11d48]">
            Next meeting
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {nextMeeting?.title ?? "—"}
          </p>
          {nextMeeting && (
            <p className="mt-1 text-[12px] text-muted-foreground">
              {relativeTime(nextMeeting.date)}
            </p>
          )}
        </Card>
      </div>

      <Card>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Products & packs
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {products.map((p) => (
            <span
              key={p}
              className="rounded-md bg-muted px-2 py-1 text-[11px] font-semibold"
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
        {outdatedPack && (
          <p className="mt-3 text-[12px] text-amber-600">
            Runtime or ontology version is behind fleet standard.
          </p>
        )}
      </Card>

      <section>
        <h2 className="mb-3 font-display text-[24px] text-foreground">
          Network & operational stats
        </h2>
        <div className="mb-4 rounded-xl border border-border bg-card p-4 shadow-[0_1px_2px_rgba(10,22,40,0.04)]">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">
              Live traffic · latency
            </p>
            <p className="text-[11px] text-muted-foreground">
              {formatNumber(client.apiCalls24h)} calls · P99{" "}
              {formatLatency(client.latencyP99)}
            </p>
          </div>
          <div className="h-[180px] w-full">
            {org.liveTimestamps.length > 2 ? (
              <LiveChart
                height={160}
                timestamps={org.liveTimestamps}
                series={[
                  {
                    label: "RPS",
                    color: "#0a1628",
                    values: org.liveTraffic,
                  },
                  {
                    label: "Latency",
                    color: "#d97706",
                    values: org.liveLatency,
                  },
                ]}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Waiting for samples…
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((m) => (
            <Card key={m.label}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {m.label}
                </p>
                <HealthDot status={m.status} />
              </div>
              <p className="mt-1 text-lg font-semibold tabular-nums">{m.value}</p>
              <div className="mt-2">
                <Sparkline data={m.spark} color={m.color} />
              </div>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-[22px] text-foreground">Contacts</h2>
          <ul className="mt-3 space-y-2">
            {client.contacts.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
              >
                <div>
                  <p className="text-[13px] font-semibold">{c.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {c.role} · {c.email}
                  </p>
                </div>
                <Tag>{c.strength}</Tag>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="font-display text-[22px] text-foreground">
            Relationship
          </h2>
          <p className="mt-2 text-3xl font-semibold tabular-nums">
            {client.relationshipScore}
            <span className="text-base text-muted-foreground">/100</span>
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Last commercial contact{" "}
            {relativeTime(client.lastCommercialContact)}
          </p>
          <Divider className="my-3" />
          <p className="text-[12px] text-muted-foreground">
            Open opportunities · {client.openOpportunities}
          </p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-[22px] text-foreground">Tasks</h2>
          <ul className="mt-3 space-y-2">
            {clientTasks.map((t) => (
              <li key={t.id} className="rounded-lg border border-border p-3">
                <p className="text-[13px] font-semibold">{t.title}</p>
                <p className="text-[11px] text-muted-foreground">
                  {t.status} · {t.assigneeName} · {t.priority}
                </p>
              </li>
            ))}
            {clientTasks.length === 0 && (
              <p className="text-[12px] text-muted-foreground">No open tasks.</p>
            )}
          </ul>
        </Card>
        <Card>
          <h2 className="font-display text-[22px] text-foreground">
            Incidents
          </h2>
          <ul className="mt-3 space-y-2">
            {clientIncidents.map((i) => (
              <li key={i.id} className="rounded-lg border border-border p-3">
                <p className="text-[13px] font-semibold">{i.title}</p>
                <p className="text-[11px] text-muted-foreground">
                  {i.severity} · {i.status} · {relativeTime(i.openedAt)}
                </p>
              </li>
            ))}
            {clientIncidents.length === 0 && (
              <p className="text-[12px] text-muted-foreground">
                No incidents on this account.
              </p>
            )}
          </ul>
        </Card>
      </div>

      {news.length > 0 && (
        <Card>
          <h2 className="font-display text-[22px] text-foreground">News</h2>
          <ul className="mt-3 space-y-3">
            {news.map((n) => (
              <li key={n.title}>
                <p className="text-[13px] font-semibold">{n.title}</p>
                <p className="text-[11px] text-muted-foreground">
                  {n.source} · {n.date}
                </p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  {n.summary}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <h2 className="font-display text-[22px] text-foreground">Notes</h2>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.trim()) return;
            createNote.mutate({
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
              className="rounded-lg border border-border bg-muted/60 p-3"
            >
              <p className="text-[13px] text-foreground">{n.body}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {n.author} · {relativeTime(n.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
