import type {
  Activity,
  FleetSnapshot,
  Organisation,
  RelationshipEdge,
  WorldState,
} from "@/domain/entities";
import type { LivePatch } from "@/domain/live";
import type {
  AttentionItem,
  Cluster,
  Incident,
  NetworkEvent,
  Note,
  Opportunity,
  Rollout,
  Task,
  TeamActivity,
  TeamMember,
} from "@/data/types";

function emptyFleet(): FleetSnapshot {
  return {
    timestamp: new Date().toISOString(),
    activeDeployments: 0,
    fleetUptime: 0,
    openIncidents: 0,
    evaluationsPassing: 0,
    evaluationsTotal: 0,
    totalApiCalls24h: 0,
    fleetRps: 0,
    fleetP95: 0,
    fleetAvailability: 0,
  };
}

function createEmptyWorld(): WorldState {
  return {
    organisations: [],
    clusters: [],
    incidents: [],
    rollouts: [],
    opportunities: [],
    tasks: [],
    notes: [],
    activities: [],
    networkEvents: [],
    attentionItems: [],
    teamActivity: [],
    teamMembers: [],
    relationships: [],
    fleet: emptyFleet(),
    tick: 0,
  };
}

declare global {
  // eslint-disable-next-line no-var
  var __nexusWorld: WorldState | undefined;
  // eslint-disable-next-line no-var
  var __nexusWorldBooted: boolean | undefined;
}

export function getWorld(): WorldState {
  if (!globalThis.__nexusWorld) {
    globalThis.__nexusWorld = createEmptyWorld();
  }
  return globalThis.__nexusWorld;
}

export function isWorldBooted(): boolean {
  return Boolean(globalThis.__nexusWorldBooted);
}

export function markWorldBooted(): void {
  globalThis.__nexusWorldBooted = true;
}

export function replaceWorld(next: WorldState): void {
  globalThis.__nexusWorld = next;
  globalThis.__nexusWorldBooted = true;
}

export function recomputeFleet(world: WorldState = getWorld()): FleetSnapshot {
  const orgs = world.organisations;
  const openIncidents = world.incidents.filter(
    (i) => i.status !== "resolved"
  ).length;
  const activeDeployments = orgs.filter((c) =>
    ["live", "ramped", "deploying"].includes(c.maturity)
  ).length;
  const fleetUptime =
    orgs.reduce((s, c) => s + c.uptime, 0) / Math.max(orgs.length, 1);
  const evaluationsPassing = orgs.filter((c) => c.evaluationScore >= 85).length;
  const totalApiCalls24h = orgs.reduce((s, c) => s + c.apiCalls24h, 0);
  const liveRps = orgs.reduce((s, o) => {
    const last = o.liveTraffic[o.liveTraffic.length - 1] ?? 0;
    return s + last;
  }, 0);
  const fleetP95 =
    orgs.reduce((s, o) => s + o.latencyP99, 0) / Math.max(orgs.length, 1);

  world.fleet = {
    timestamp: new Date().toISOString(),
    activeDeployments,
    fleetUptime,
    openIncidents,
    evaluationsPassing,
    evaluationsTotal: orgs.length,
    totalApiCalls24h,
    fleetRps: liveRps || Math.max(1, Math.round(totalApiCalls24h / 86_400)),
    fleetP95: Number(fleetP95.toFixed(1)),
    fleetAvailability: Number(fleetUptime.toFixed(4)),
  };
  return world.fleet;
}

export function snapshotWorld(world: WorldState = getWorld()) {
  return {
    tick: world.tick,
    fleet: { ...world.fleet },
    organisations: world.organisations.map(cloneOrg),
    clusters: world.clusters.map((c) => structuredClone(c)),
    incidents: world.incidents.map((i) => structuredClone(i)),
    rollouts: world.rollouts.map((r) => structuredClone(r)),
    opportunities: world.opportunities.map((o) => structuredClone(o)),
    tasks: world.tasks.map((t) => structuredClone(t)),
    notes: world.notes.map((n) => structuredClone(n)),
    activities: world.activities.slice(0, 100).map((a) => structuredClone(a)),
    networkEvents: world.networkEvents
      .slice(0, 80)
      .map((e) => structuredClone(e)),
    attentionItems: world.attentionItems.map((a) => structuredClone(a)),
    teamActivity: world.teamActivity
      .slice(0, 40)
      .map((a) => structuredClone(a)),
    teamMembers: world.teamMembers.map((m) => structuredClone(m)),
    relationships: world.relationships.map((r) => structuredClone(r)),
  };
}

function cloneOrg(o: Organisation): Organisation {
  return structuredClone(o);
}

export type { LivePatch as WorldPatch };

export function buildLivePatch(world: WorldState = getWorld()): LivePatch {
  return {
    tick: world.tick,
    fleet: { ...world.fleet },
    organisations: world.organisations.map(cloneOrg),
    clusters: world.clusters.map((c) => structuredClone(c)),
    incidents: world.incidents.map((i) => structuredClone(i)),
    networkEvents: world.networkEvents
      .slice(0, 40)
      .map((e) => structuredClone(e)),
    activities: world.activities.slice(0, 40).map((a) => structuredClone(a)),
    tasks: world.tasks.map((t) => structuredClone(t)),
    notes: world.notes.map((n) => structuredClone(n)),
    opportunities: world.opportunities.map((o) => structuredClone(o)),
    teamActivity: world.teamActivity.slice(0, 20).map((a) => structuredClone(a)),
  };
}

export type {
  Organisation,
  Activity,
  RelationshipEdge,
  AttentionItem,
  Cluster,
  Incident,
  NetworkEvent,
  Note,
  Opportunity,
  Rollout,
  Task,
  TeamActivity,
  TeamMember,
};
