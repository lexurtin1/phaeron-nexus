"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback } from "react";
import {
  clients,
  getClient,
  globalKpis,
  networkEvents,
  regionalHealth,
} from "@/data/mock";
import { useNexusStore } from "@/lib/store";
import {
  formatCommandDate,
  formatNumber,
  formatPercent,
  greetingForDate,
  healthLabel,
  maturityLabel,
  relativeTime,
} from "@/lib/utils";
import {
  Badge,
  Button,
  Card,
  HealthDot,
  KpiTile,
  Tag,
} from "@/components/ui";

const CommandGlobe = dynamic(
  () =>
    import("@/components/globe/CommandGlobe").then((m) => m.CommandGlobe),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-[13px] text-[var(--color-text-muted)]">
        Initialising global command surface…
      </div>
    ),
  }
);

export function GlobalCommandView() {
  const selectedClientId = useNexusStore((s) => s.selectedClientId);
  const setSelectedClientId = useNexusStore((s) => s.setSelectedClientId);
  const kpis = globalKpis();
  const regions = regionalHealth();
  const selected = selectedClientId ? getClient(selectedClientId) : null;

  const onSelectClient = useCallback(
    (id: string) => setSelectedClientId(id),
    [setSelectedClientId]
  );

  return (
    <div className="flex min-h-[calc(100vh-72px)] flex-col lg:flex-row">
      <aside className="z-10 flex w-full flex-col gap-4 p-5 lg:w-[38%] lg:max-w-[520px] lg:overflow-y-auto lg:p-6">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
            {greetingForDate()} · {formatCommandDate()}
          </p>
          <h1 className="mt-1 font-display text-[40px] leading-none text-[var(--color-navy-deep)] md:text-[46px]">
            Global Command
          </h1>
          <p className="mt-2 text-[13px] text-[var(--color-text-secondary)]">
            Live state of the Phaeron intelligence network — deployments,
            fleet health, and what needs attention now.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <KpiTile
            label="Active Deployments"
            value={kpis.activeDeployments}
            hint={`${clients.length} accounts in network`}
          />
          <KpiTile
            label="Fleet Uptime"
            value={kpis.fleetUptime}
            format={(n) => n.toFixed(2)}
            suffix="%"
            tone="healthy"
          />
          <KpiTile
            label="Open Incidents"
            value={kpis.openIncidents}
            tone={kpis.openIncidents > 0 ? "critical" : "default"}
            hint="Across global fleet"
          />
          <KpiTile
            label="Evaluations Passing"
            value={kpis.evaluationsPassing}
            suffix={` / ${kpis.evaluationsTotal}`}
            hint="Score ≥ 85"
          />
        </div>

        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              <Card elevated className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <HealthDot status={selected.health} />
                      <h3 className="font-display text-[24px] leading-tight text-[var(--color-navy-deep)]">
                        {selected.name}
                      </h3>
                    </div>
                    <p className="mt-1 text-[12px] text-[var(--color-text-muted)]">
                      {selected.industry} · {selected.city}, {selected.country}
                    </p>
                  </div>
                  <Badge
                    tone={
                      selected.health === "healthy"
                        ? "healthy"
                        : selected.health === "warning"
                          ? "warning"
                          : "critical"
                    }
                  >
                    {healthLabel(selected.health)}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Tag>{maturityLabel(selected.maturity)}</Tag>
                  <Tag>Runtime {selected.runtimeVersion}</Tag>
                  <Tag>Ontology {selected.ontologyVersion}</Tag>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-[rgba(10,22,40,0.03)] p-2">
                    <p className="text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-faint)]">
                      Eval
                    </p>
                    <p className="text-[15px] font-semibold text-[var(--color-navy-deep)]">
                      {selected.evaluationScore.toFixed(1)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-[rgba(10,22,40,0.03)] p-2">
                    <p className="text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-faint)]">
                      Uptime
                    </p>
                    <p className="text-[15px] font-semibold text-[var(--color-navy-deep)]">
                      {formatPercent(selected.uptime)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-[rgba(10,22,40,0.03)] p-2">
                    <p className="text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-faint)]">
                      Calls
                    </p>
                    <p className="text-[15px] font-semibold text-[var(--color-navy-deep)]">
                      {formatNumber(selected.apiCalls24h)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/clients/${selected.id}`} className="flex-1">
                    <Button variant="primary" className="w-full">
                      Open dossier
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedClientId(null)}
                  >
                    Clear
                  </Button>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="feed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card padding="none" className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-[rgba(10,22,40,0.06)] px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                    Network Activity
                  </p>
                  <span className="live-pulse text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-healthy)]">
                    Live
                  </span>
                </div>
                <ul className="scrollbar-thin max-h-[280px] overflow-y-auto">
                  {networkEvents.map((evt, i) => (
                    <motion.li
                      key={evt.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex gap-3 border-b border-[rgba(10,22,40,0.04)] px-4 py-2.5 last:border-0"
                    >
                      <span className="mt-1.5 shrink-0">
                        <HealthDot
                          status={evt.severity ?? "healthy"}
                          className={!evt.severity ? "opacity-30" : undefined}
                        />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[12.5px] leading-snug text-[var(--color-text)]">
                          {evt.message}
                        </p>
                        <p className="mt-0.5 text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-faint)]">
                          {relativeTime(evt.timestamp)} · {evt.type}
                        </p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <Card>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
            Regional Health
          </p>
          <div className="space-y-2">
            {regions.map((r) => (
              <div
                key={r.region}
                className="flex items-center justify-between rounded-lg bg-[rgba(10,22,40,0.025)] px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <HealthDot status={r.status} />
                  <span className="text-[13px] font-semibold text-[var(--color-navy-deep)]">
                    {r.region}
                  </span>
                </div>
                <div className="text-right text-[11px] text-[var(--color-text-muted)]">
                  <span className="font-medium text-[var(--color-text-secondary)]">
                    {r.deployments} deployments
                  </span>
                  <span className="mx-1.5 text-[var(--color-text-faint)]">·</span>
                  {formatPercent(r.uptime)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </aside>

      <section className="relative min-h-[420px] flex-1 lg:min-h-0">
        <CommandGlobe
          selectedClientId={selectedClientId}
          onSelectClient={onSelectClient}
        />
      </section>
    </div>
  );
}
