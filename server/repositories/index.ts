import { organisationToClient } from "@/domain/adapters";
import type { Organisation } from "@/domain/entities";
import type {
  Cluster,
  HealthStatus,
  Incident,
  Note,
  Opportunity,
  Region,
  Task,
} from "@/data/types";
import { getWorld, recomputeFleet } from "@/server/world/store";
import {
  syncActivityToDb,
  syncNoteToDb,
  syncTaskToDb,
} from "@/server/seed/bootstrap";
import { bootNexusRuntime } from "@/server/live/runtime";

export async function listOrganisations(): Promise<Organisation[]> {
  await bootNexusRuntime();
  return getWorld().organisations.map((o) => structuredClone(o));
}

export async function getOrganisation(id: string): Promise<Organisation | null> {
  await bootNexusRuntime();
  const org = getWorld().organisations.find((o) => o.id === id);
  return org ? structuredClone(org) : null;
}

export async function listClients() {
  const orgs = await listOrganisations();
  return orgs.map(organisationToClient);
}

export async function getClient(id: string) {
  const org = await getOrganisation(id);
  return org ? organisationToClient(org) : null;
}

export async function listClusters(): Promise<Cluster[]> {
  await bootNexusRuntime();
  return getWorld().clusters.map((c) => structuredClone(c));
}

export async function getCluster(id: string): Promise<Cluster | null> {
  await bootNexusRuntime();
  const c = getWorld().clusters.find((x) => x.id === id);
  return c ? structuredClone(c) : null;
}

export async function listIncidents(): Promise<Incident[]> {
  await bootNexusRuntime();
  return getWorld().incidents.map((i) => structuredClone(i));
}

export async function listOpportunities(): Promise<Opportunity[]> {
  await bootNexusRuntime();
  return getWorld().opportunities.map((o) => structuredClone(o));
}

export async function listTasks(): Promise<Task[]> {
  await bootNexusRuntime();
  return getWorld().tasks.map((t) => structuredClone(t));
}

export async function listNotes(objectId?: string): Promise<Note[]> {
  await bootNexusRuntime();
  const notes = getWorld().notes;
  const filtered = objectId
    ? notes.filter((n) => n.objectId === objectId)
    : notes;
  return filtered.map((n) => structuredClone(n));
}

export async function listActivities(limit = 50) {
  await bootNexusRuntime();
  return getWorld()
    .activities.slice(0, limit)
    .map((a) => structuredClone(a));
}

export async function getFleetSnapshot() {
  await bootNexusRuntime();
  return structuredClone(getWorld().fleet);
}

export async function getNetworkEvents(limit = 40) {
  await bootNexusRuntime();
  return getWorld()
    .networkEvents.slice(0, limit)
    .map((e) => structuredClone(e));
}

export async function getRollouts() {
  await bootNexusRuntime();
  return getWorld().rollouts.map((r) => structuredClone(r));
}

export async function getAttentionItems() {
  await bootNexusRuntime();
  return getWorld().attentionItems.map((a) => structuredClone(a));
}

export async function getTeamActivity(limit = 30) {
  await bootNexusRuntime();
  return getWorld()
    .teamActivity.slice(0, limit)
    .map((a) => structuredClone(a));
}

export async function getTeamMembers() {
  await bootNexusRuntime();
  return getWorld().teamMembers.map((m) => structuredClone(m));
}

export async function getRelationships() {
  await bootNexusRuntime();
  return getWorld().relationships.map((r) => structuredClone(r));
}

export function commercialSummaryFrom(
  opps: Opportunity[],
  orgs: Organisation[]
) {
  const open = opps.filter((o) => o.stage !== "Live");
  const totalOpen = open.reduce((s, o) => s + o.value, 0);
  const weighted = open.reduce((s, o) => s + o.weightedValue, 0);
  const contractedArr = orgs.reduce((s, c) => s + c.arr, 0);
  const liveArr = orgs
    .filter((c) => ["live", "ramped"].includes(c.maturity))
    .reduce((s, c) => s + c.arr, 0);
  const rampedArr = orgs
    .filter((c) => c.maturity === "ramped")
    .reduce((s, c) => s + c.arr, 0);
  return {
    totalOpen,
    weighted,
    contractedArr,
    liveArr,
    rampedArr,
    pipelineCoverage: weighted / 1_200_000,
    confidenceWeighted: opps.reduce((s, o) => s + o.value * o.confidence, 0),
    dealsToTarget: Math.max(0, Math.ceil((1_200_000 - weighted) / 200000)),
  };
}

export function regionSummariesFrom(
  clusters: Cluster[],
  incidents: Incident[]
) {
  const regions: Region[] = ["EMEA", "Americas", "APAC", "On-Prem"];
  return regions.map((region) => {
    const regionClusters =
      region === "On-Prem" ? [] : clusters.filter((c) => c.region === region);
    return {
      region,
      totalClusters: regionClusters.length,
      healthyPods: regionClusters.reduce((s, c) => s + c.podsHealthy, 0),
      degradedPods: regionClusters.reduce(
        (s, c) => s + c.podsPending + c.podsFailed,
        0
      ),
      activeAlerts: incidents.filter(
        (i) => i.region === region && i.status !== "resolved"
      ).length,
      lastIncident:
        incidents
          .filter((i) => i.region === region)
          .sort(
            (a, b) =>
              new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime()
          )[0]?.openedAt ?? null,
      health: (regionClusters.some((c) => c.health === "critical")
        ? "critical"
        : regionClusters.some((c) => c.health === "warning")
          ? "warning"
          : "healthy") as HealthStatus,
    };
  });
}

export async function updateTask(
  id: string,
  patch: Partial<Pick<Task, "status" | "assigneeId" | "assigneeName">>
) {
  await bootNexusRuntime();
  const world = getWorld();
  const task = world.tasks.find((t) => t.id === id);
  if (!task) return null;
  Object.assign(task, patch);
  await syncTaskToDb(task);
  world.activities = [
    {
      id: `act:task-${Date.now()}`,
      type: "task",
      actorId: patch.assigneeId ?? null,
      subjectType: "task",
      subjectId: task.id,
      timestamp: new Date().toISOString(),
      title: `Task updated · ${task.title}`,
      body: `Status ${task.status}`,
      source: "api",
    },
    ...world.activities,
  ];
  void syncActivityToDb(world.activities[0]);
  return structuredClone(task);
}

export async function createNote(
  input: Omit<Note, "id" | "createdAt"> & { id?: string; createdAt?: string }
) {
  await bootNexusRuntime();
  const world = getWorld();
  const note: Note = {
    id: input.id ?? `note-${Date.now()}`,
    objectType: input.objectType,
    objectId: input.objectId,
    author: input.author,
    body: input.body,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
  world.notes = [note, ...world.notes];
  await syncNoteToDb(note);
  world.activities = [
    {
      id: `act:note-${Date.now()}`,
      type: "note",
      actorId: null,
      subjectType: note.objectType,
      subjectId: note.objectId,
      timestamp: note.createdAt,
      title: `Note by ${note.author}`,
      body: note.body,
      source: "api",
    },
    ...world.activities,
  ];
  void syncActivityToDb(world.activities[0]);
  return note;
}

export async function getSnapshotBundle() {
  await bootNexusRuntime();
  const world = getWorld();
  recomputeFleet(world);
  return {
    fleet: structuredClone(world.fleet),
    organisations: world.organisations.map((o) => structuredClone(o)),
    clients: world.organisations.map(organisationToClient),
    clusters: world.clusters.map((c) => structuredClone(c)),
    incidents: world.incidents.map((i) => structuredClone(i)),
    opportunities: world.opportunities.map((o) => structuredClone(o)),
    tasks: world.tasks.map((t) => structuredClone(t)),
    notes: world.notes.map((n) => structuredClone(n)),
    activities: world.activities.slice(0, 80).map((a) => structuredClone(a)),
    networkEvents: world.networkEvents
      .slice(0, 60)
      .map((e) => structuredClone(e)),
    rollouts: world.rollouts.map((r) => structuredClone(r)),
    attentionItems: world.attentionItems.map((a) => structuredClone(a)),
    teamActivity: world.teamActivity.slice(0, 40).map((a) => structuredClone(a)),
    teamMembers: world.teamMembers.map((m) => structuredClone(m)),
    relationships: world.relationships.map((r) => structuredClone(r)),
    commercial: commercialSummaryFrom(world.opportunities, world.organisations),
    regionSummaries: regionSummariesFrom(world.clusters, world.incidents),
    tick: world.tick,
  };
}
