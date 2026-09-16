import type { Activity } from "@/domain/entities";
import type { HealthStatus, NetworkEvent } from "@/data/types";
import type { LivePatch } from "@/domain/live";
import {
  buildLivePatch,
  getWorld,
  recomputeFleet,
} from "@/server/world/store";
import { syncActivityToDb } from "@/server/seed/bootstrap";

type Listener = (patch: LivePatch) => void;

declare global {
  // eslint-disable-next-line no-var
  var __nexusPulseTimer: ReturnType<typeof setInterval> | undefined;
  // eslint-disable-next-line no-var
  var __nexusPulseListeners: Set<Listener> | undefined;
}

function listeners(): Set<Listener> {
  if (!globalThis.__nexusPulseListeners) {
    globalThis.__nexusPulseListeners = new Set();
  }
  return globalThis.__nexusPulseListeners;
}

export function subscribeLive(listener: Listener): () => void {
  listeners().add(listener);
  return () => listeners().delete(listener);
}

function broadcast(patch: LivePatch) {
  for (const listener of listeners()) {
    try {
      listener(patch);
    } catch {
      // ignore broken SSE clients
    }
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function drift(value: number, pct: number, min: number, max: number) {
  const delta = value * pct * (Math.random() * 2 - 1);
  return clamp(value + delta, min, max);
}

function healthFromMetrics(
  latency: number,
  errorRate: number,
  cpu: number
): HealthStatus {
  if (latency > 400 || errorRate > 2 || cpu > 90) return "critical";
  if (latency > 250 || errorRate > 0.5 || cpu > 78) return "warning";
  return "healthy";
}

const EVENT_TEMPLATES = [
  {
    type: "api" as const,
    message: (name: string, rps: number) =>
      `${name} inference gateway · ${rps.toLocaleString()} req/s`,
  },
  {
    type: "evaluation" as const,
    message: (name: string) => `${name} evaluation suite completed`,
  },
  {
    type: "sync" as const,
    message: (name: string) => `${name} ontology pack sync finished`,
  },
  {
    type: "deployment" as const,
    message: (name: string) => `${name} rollout checkpoint advanced`,
  },
  {
    type: "commercial" as const,
    message: (name: string) => `${name} relationship score refreshed`,
  },
];

function pushEvent(
  type: NetworkEvent["type"],
  message: string,
  clientId?: string,
  severity?: HealthStatus
) {
  const world = getWorld();
  const id = `evt-live-${Date.now()}-${Math.floor(Math.random() * 999)}`;
  const event: NetworkEvent = {
    id,
    timestamp: new Date().toISOString(),
    type,
    message,
    clientId,
    severity,
  };
  world.networkEvents = [event, ...world.networkEvents].slice(0, 120);

  const activity: Activity = {
    id: `act:${id}`,
    type,
    actorId: null,
    subjectType: clientId ? "organisation" : "fleet",
    subjectId: clientId ?? "fleet",
    timestamp: event.timestamp,
    title: message,
    body: message,
    source: "livepulse",
    metadata: { severity },
  };
  world.activities = [activity, ...world.activities].slice(0, 200);
  void syncActivityToDb(activity).catch(() => undefined);

  world.teamActivity = [
    {
      id: `ta-live-${Date.now()}`,
      timestamp: event.timestamp,
      memberName: "Nexus LivePulse",
      action: message,
      target: clientId ?? "Fleet",
    },
    ...world.teamActivity,
  ].slice(0, 60);
}

function maybeSyntheticIncident() {
  const world = getWorld();
  if (Math.random() > 0.015) return;

  const openCritical = world.incidents.filter(
    (i) => i.status !== "resolved" && i.severity === "critical"
  );
  if (openCritical.length >= 2) {
    // Resolve oldest open sometimes
    const target = world.incidents.find((i) => i.status !== "resolved");
    if (target && Math.random() > 0.4) {
      target.status = "resolved";
      pushEvent(
        "incident",
        `${target.id} resolved · ${target.title}`,
        target.clientId ?? undefined,
        "healthy"
      );
    }
    return;
  }

  const org =
    world.organisations[Math.floor(Math.random() * world.organisations.length)];
  if (!org) return;
  const id = `INC-${3800 + Math.floor(Math.random() * 200)}`;
  world.incidents = [
    {
      id,
      title: `${org.name} P95 latency spike`,
      severity: Math.random() > 0.7 ? "critical" : "high",
      component: "inference-gateway",
      clientId: org.id,
      clientName: org.name,
      region: org.region,
      openedAt: new Date().toISOString(),
      owner: "I. Okonkwo",
      status: "investigating",
      impact: "Elevated latency on retrieval path",
    },
    ...world.incidents,
  ];
  org.health = "warning";
  pushEvent("incident", `${id} opened · ${org.name} latency spike`, org.id, "warning");
}

function tickOnce() {
  const world = getWorld();
  if (!world.organisations.length) return;

  world.tick += 1;
  const now = Math.floor(Date.now() / 1000);

  for (const org of world.organisations) {
    const baseRps = Math.max(1, Math.round(org.apiCalls24h / 86_400));
    const nextRps = Math.round(drift(baseRps * (0.85 + Math.random() * 0.4), 0.12, 1, baseRps * 3));
    const nextLatency = Number(
      drift(org.latencyP99, 0.06, 40, Math.max(80, org.latencyP99 * 1.8)).toFixed(1)
    );
    const nextError = Number(
      drift(org.errorRate, 0.15, 0.01, Math.max(0.05, org.errorRate * 3)).toFixed(3)
    );
    const nextUptime = Number(
      clamp(org.uptime + (Math.random() - 0.45) * 0.002, 99.5, 99.999).toFixed(3)
    );

    org.latencyP99 = nextLatency;
    org.errorRate = nextError;
    org.uptime = nextUptime;
    org.apiCalls24h = Math.max(
      100,
      Math.round(org.apiCalls24h + nextRps * (0.8 + Math.random() * 0.5))
    );
    org.evaluationScore = Number(
      clamp(
        org.evaluationScore + (Math.random() - 0.48) * 0.15,
        70,
        99.5
      ).toFixed(1)
    );
    org.health = healthFromMetrics(nextLatency, nextError, 50);

    org.deployment.latencyP99 = nextLatency;
    org.deployment.errorRate = nextError;
    org.deployment.uptime = nextUptime;
    org.deployment.evaluationScore = org.evaluationScore;
    org.deployment.lastCall = new Date().toISOString();
    org.deployment.runtimeStatus = org.health;
    org.deployment.apiGateway = healthFromMetrics(nextLatency, nextError, 40);

    // Rolling live buffers (60 samples)
    org.liveTimestamps = [...org.liveTimestamps.slice(-59), now];
    org.liveTraffic = [...org.liveTraffic.slice(-59), nextRps];
    org.liveLatency = [...org.liveLatency.slice(-59), nextLatency];

    // Update sparklines tail
    const sparkPush = (arr: { t: string; v: number }[], v: number) => {
      const next = [...arr.slice(-23), { t: `${now}`, v }];
      return next;
    };
    org.deployment.sparklines.latency = sparkPush(
      org.deployment.sparklines.latency,
      nextLatency
    );
    org.deployment.sparklines.errors = sparkPush(
      org.deployment.sparklines.errors,
      nextError
    );
    org.deployment.sparklines.uptime = sparkPush(
      org.deployment.sparklines.uptime,
      nextUptime
    );
  }

  for (const cluster of world.clusters) {
    cluster.cpuUtil = Math.round(drift(cluster.cpuUtil, 0.08, 20, 96));
    cluster.memUtil = Math.round(drift(cluster.memUtil, 0.06, 25, 95));
    cluster.uptime = Number(
      clamp(cluster.uptime + (Math.random() - 0.4) * 0.001, 99.4, 99.999).toFixed(3)
    );
    if (Math.random() > 0.7) {
      cluster.podsPending = Math.max(
        0,
        cluster.podsPending + (Math.random() > 0.5 ? 1 : -1)
      );
    }
    cluster.health = healthFromMetrics(
      100 + cluster.cpuUtil * 2,
      cluster.podsFailed * 0.5,
      cluster.cpuUtil
    );
    for (const svc of cluster.services) {
      svc.cpu = Math.round(drift(svc.cpu, 0.1, 10, 98));
      svc.memory = Math.round(drift(svc.memory, 0.08, 15, 96));
      svc.status = healthFromMetrics(80, 0.1, svc.cpu);
      if (svc.ready < svc.replicas && Math.random() > 0.6) {
        svc.ready = Math.min(svc.replicas, svc.ready + 1);
      }
    }

    const org = world.organisations.find((o) => o.id === cluster.clientId);
    if (org && cluster.health === "critical") {
      org.health = "critical";
    }
  }

  for (const rollout of world.rollouts) {
    if (rollout.status === "in_progress" && rollout.progress < 100) {
      rollout.progress = Math.min(
        100,
        rollout.progress + Math.round(Math.random() * 3)
      );
      if (rollout.progress >= 100) rollout.status = "complete";
    }
  }

  // Occasional event feed noise
  if (Math.random() > 0.55) {
    const org =
      world.organisations[
        Math.floor(Math.random() * world.organisations.length)
      ];
    const tpl =
      EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)];
    const rps = org.liveTraffic[org.liveTraffic.length - 1] ?? 10;
    pushEvent(tpl.type, tpl.message(org.name, rps), org.id, org.health);
  }

  maybeSyntheticIncident();
  recomputeFleet(world);
  broadcast(buildLivePatch(world));
}

export function ensureLivePulse(): void {
  if (globalThis.__nexusPulseTimer) return;
  globalThis.__nexusPulseTimer = setInterval(() => {
    try {
      tickOnce();
    } catch (err) {
      console.error("[LivePulse]", err);
    }
  }, 1000);
  // Unref so it doesn't keep process alive in scripts if available
  const timer = globalThis.__nexusPulseTimer as NodeJS.Timeout;
  if (typeof timer.unref === "function") timer.unref();
}

export function getLiveSnapshot(): LivePatch {
  return buildLivePatch(getWorld());
}
