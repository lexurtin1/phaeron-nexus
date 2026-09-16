import {
  attentionItems,
  clients,
  clusters,
  incidents,
  networkEvents,
  notes,
  opportunities,
  rollouts,
  tasks,
  teamActivity,
  teamMembers,
} from "@/data/mock";
import { resolveClientIntel } from "@/data/mock/clientIntel";
import { clientToOrganisation } from "@/domain/adapters";
import type { Activity, RelationshipEdge, WorldState } from "@/domain/entities";
import { getDb } from "@/server/db/client";
import * as schema from "@/server/db/schema";
import {
  getWorld,
  isWorldBooted,
  markWorldBooted,
  recomputeFleet,
  replaceWorld,
} from "@/server/world/store";
import { eq } from "drizzle-orm";

function buildRelationships(
  orgs: ReturnType<typeof clientToOrganisation>[],
  clusterList: typeof clusters,
  opps: typeof opportunities,
  taskList: typeof tasks,
  incidentList: typeof incidents
): RelationshipEdge[] {
  const edges: RelationshipEdge[] = [];
  for (const c of clusterList) {
    if (c.clientId) {
      edges.push({
        id: `rel:${c.clientId}:runs:${c.id}`,
        fromId: c.clientId,
        toId: c.id,
        type: "runs",
        label: "runs",
      });
    }
  }
  for (const o of opps) {
    if (o.clientId) {
      edges.push({
        id: `rel:${o.clientId}:owns:${o.id}`,
        fromId: o.clientId,
        toId: o.id,
        type: "owns",
        label: "owns",
      });
    }
  }
  for (const t of taskList) {
    if (t.clientId) {
      edges.push({
        id: `rel:${t.clientId}:has-task:${t.id}`,
        fromId: t.clientId,
        toId: t.id,
        type: "has-task",
        label: "has task",
      });
    }
  }
  for (const i of incidentList) {
    if (i.clientId) {
      edges.push({
        id: `rel:${i.clientId}:affected-by:${i.id}`,
        fromId: i.clientId,
        toId: i.id,
        type: "affected-by",
        label: "affected by",
      });
    }
  }
  for (const org of orgs) {
    for (const contact of org.contacts ?? []) {
      edges.push({
        id: `rel:${org.id}:employs:${contact.id}`,
        fromId: org.id,
        toId: contact.id,
        type: "employs",
        label: "employs",
        weight: contact.strength === "strong" ? 1 : 0.5,
      });
    }
  }
  return edges;
}

function eventsToActivities(events: typeof networkEvents): Activity[] {
  return events.map((e) => ({
    id: `act:${e.id}`,
    type: e.type,
    actorId: null,
    subjectType: e.clientId ? "organisation" : "fleet",
    subjectId: e.clientId ?? "fleet",
    timestamp: e.timestamp,
    title: e.message,
    body: e.message,
    source: "network",
    metadata: { severity: e.severity, networkEventId: e.id },
  }));
}

export function buildWorldFromMocks(): WorldState {
  const organisations = clients.map((c) => {
    const intel = resolveClientIntel(c);
    return clientToOrganisation({ ...c, ...intel });
  });
  const relationships = buildRelationships(
    organisations,
    clusters,
    opportunities,
    tasks,
    incidents
  );
  const activities = eventsToActivities(networkEvents);
  const world: WorldState = {
    organisations,
    clusters: structuredClone(clusters),
    incidents: structuredClone(incidents),
    rollouts: structuredClone(rollouts),
    opportunities: structuredClone(opportunities),
    tasks: structuredClone(tasks),
    notes: structuredClone(notes),
    activities,
    networkEvents: structuredClone(networkEvents),
    attentionItems: structuredClone(attentionItems),
    teamActivity: structuredClone(teamActivity),
    teamMembers: structuredClone(teamMembers),
    relationships,
    fleet: {
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
    },
    tick: 0,
  };
  recomputeFleet(world);
  return world;
}

async function persistWorld(world: WorldState): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const { resetSchema } = await import("@/server/db/client");
  await resetSchema();

  if (world.organisations.length) {
    await db.insert(schema.organisations).values(
      world.organisations.map((o) => ({
        id: o.id,
        name: o.name,
        industry: o.industry,
        city: o.city,
        country: o.country,
        region: o.region,
        lat: o.lat,
        lng: o.lng,
        health: o.health,
        maturity: o.maturity,
        runtimeVersion: o.runtimeVersion,
        ontologyVersion: o.ontologyVersion,
        domainPacks: o.domainPacks,
        evaluationScore: o.evaluationScore,
        uptime: o.uptime,
        apiCalls24h: o.apiCalls24h,
        latencyP99: o.latencyP99,
        errorRate: o.errorRate,
        commercialStage: o.commercialStage,
        arr: o.arr,
        accountOwner: o.accountOwner,
        relationshipScore: o.relationshipScore,
        lastCommercialContact: o.lastCommercialContact,
        openOpportunities: o.openOpportunities,
        contacts: o.contacts,
        deployment: o.deployment as unknown as Record<string, unknown>,
        hubActivity: o.hubActivity,
        pricingTier: o.pricingTier ?? null,
        products: o.products ?? null,
        lastMeeting: o.lastMeeting ?? null,
        nextMeeting: o.nextMeeting ?? null,
        news: o.news ?? null,
        mrr: o.mrr ?? null,
        ytdRevenue: o.ytdRevenue ?? null,
      }))
    );
  }

  if (world.opportunities.length) {
    await db.insert(schema.opportunities).values(
      world.opportunities.map((o) => ({
        id: o.id,
        clientName: o.clientName,
        clientId: o.clientId,
        value: o.value,
        weightedValue: o.weightedValue,
        stage: o.stage,
        geography: o.geography,
        region: o.region,
        owner: o.owner,
        daysInStage: o.daysInStage,
        health: o.health,
        nextAction: o.nextAction,
        confidence: o.confidence,
      }))
    );
  }

  if (world.clusters.length) {
    await db.insert(schema.clusters).values(
      world.clusters.map((c) => ({
        id: c.id,
        payload: c as unknown as Record<string, unknown>,
      }))
    );
  }

  if (world.incidents.length) {
    await db.insert(schema.incidents).values(
      world.incidents.map((i) => ({
        id: i.id,
        payload: i as unknown as Record<string, unknown>,
      }))
    );
  }

  if (world.tasks.length) {
    await db.insert(schema.tasks).values(world.tasks);
  }

  if (world.notes.length) {
    await db.insert(schema.notes).values(world.notes);
  }

  if (world.activities.length) {
    await db.insert(schema.activities).values(
      world.activities.map((a) => ({
        id: a.id,
        type: a.type,
        actorId: a.actorId,
        subjectType: a.subjectType,
        subjectId: a.subjectId,
        timestamp: a.timestamp,
        title: a.title,
        body: a.body,
        source: a.source,
        metadata: a.metadata ?? null,
      }))
    );
  }

  if (world.relationships.length) {
    await db.insert(schema.relationships).values(world.relationships);
  }
}

async function hydrateDurableFromDb(world: WorldState): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const existingTasks = await db.select().from(schema.tasks);
  if (existingTasks.length === 0) return false;

  world.tasks = existingTasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    module: t.module as WorldState["tasks"][number]["module"],
    clientId: t.clientId,
    clientName: t.clientName,
    assigneeId: t.assigneeId,
    assigneeName: t.assigneeName,
    priority: t.priority as WorldState["tasks"][number]["priority"],
    dueDate: t.dueDate,
    status: t.status as WorldState["tasks"][number]["status"],
    raisedBy: t.raisedBy,
  }));

  const existingNotes = await db.select().from(schema.notes);
  world.notes = existingNotes.map((n) => ({
    id: n.id,
    objectType: n.objectType as WorldState["notes"][number]["objectType"],
    objectId: n.objectId,
    author: n.author,
    body: n.body,
    createdAt: n.createdAt,
  }));

  const existingActivities = await db.select().from(schema.activities);
  if (existingActivities.length) {
    world.activities = existingActivities.map((a) => ({
      id: a.id,
      type: a.type as WorldState["activities"][number]["type"],
      actorId: a.actorId,
      subjectType: a.subjectType,
      subjectId: a.subjectId,
      timestamp: a.timestamp,
      title: a.title,
      body: a.body,
      source: a.source,
      metadata: (a.metadata as Record<string, unknown>) ?? undefined,
    }));
  }

  return true;
}

export async function ensureWorldBooted(options?: {
  forceReseed?: boolean;
}): Promise<WorldState> {
  if (isWorldBooted() && !options?.forceReseed) {
    return getWorld();
  }

  const world = buildWorldFromMocks();

  // Never block the request path on durable DB (critical on Vercel).
  const dbWork = (async () => {
    try {
      if (options?.forceReseed) {
        await persistWorld(world);
      } else {
        const hydrated = await hydrateDurableFromDb(world);
        if (!hydrated) {
          await persistWorld(world);
        }
      }
    } catch (err) {
      console.warn("[nexus] DB persist/hydrate failed; using in-memory only", err);
    }
  })();

  // Local/dev can await briefly; serverless returns immediately on memory world.
  if (!process.env.VERCEL) {
    await Promise.race([
      dbWork,
      new Promise((resolve) => setTimeout(resolve, 2500)),
    ]);
  } else {
    void dbWork;
  }

  replaceWorld(world);
  markWorldBooted();
  return world;
}

export async function syncTaskToDb(task: WorldState["tasks"][number]) {
  const db = await getDb();
  if (!db) return;
  const existing = await db
    .select()
    .from(schema.tasks)
    .where(eq(schema.tasks.id, task.id));
  if (existing.length) {
    await db
      .update(schema.tasks)
      .set({ ...task })
      .where(eq(schema.tasks.id, task.id));
  } else {
    await db.insert(schema.tasks).values(task);
  }
}

export async function syncNoteToDb(note: WorldState["notes"][number]) {
  const db = await getDb();
  if (!db) return;
  await db.insert(schema.notes).values(note).onConflictDoNothing();
}

export async function syncActivityToDb(activity: Activity) {
  const db = await getDb();
  if (!db) return;
  await db
    .insert(schema.activities)
    .values({
      id: activity.id,
      type: activity.type,
      actorId: activity.actorId,
      subjectType: activity.subjectType,
      subjectId: activity.subjectId,
      timestamp: activity.timestamp,
      title: activity.title,
      body: activity.body,
      source: activity.source,
      metadata: activity.metadata ?? null,
    })
    .onConflictDoNothing();
}
