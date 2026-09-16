export type SnapshotBundle = {
  tick: number;
  fleet: {
    timestamp: string;
    activeDeployments: number;
    fleetUptime: number;
    openIncidents: number;
    evaluationsPassing: number;
    evaluationsTotal: number;
    totalApiCalls24h: number;
    fleetRps: number;
    fleetP95: number;
    fleetAvailability: number;
  };
  organisations: import("@/domain/entities").Organisation[];
  clients: import("@/data/types").Client[];
  clusters: import("@/data/types").Cluster[];
  incidents: import("@/data/types").Incident[];
  opportunities: import("@/data/types").Opportunity[];
  tasks: import("@/data/types").Task[];
  notes: import("@/data/types").Note[];
  activities: import("@/domain/entities").Activity[];
  networkEvents: import("@/data/types").NetworkEvent[];
  rollouts: import("@/data/types").Rollout[];
  attentionItems: import("@/data/types").AttentionItem[];
  teamActivity: import("@/data/types").TeamActivity[];
  teamMembers: import("@/data/types").TeamMember[];
  relationships: import("@/domain/entities").RelationshipEdge[];
  commercial: {
    totalOpen: number;
    weighted: number;
    contractedArr: number;
    liveArr: number;
    rampedArr: number;
    pipelineCoverage: number;
    confidenceWeighted: number;
    dealsToTarget: number;
  };
  regionSummaries: {
    region: string;
    totalClusters: number;
    healthyPods: number;
    degradedPods: number;
    activeAlerts: number;
    lastIncident: string | null;
    health: import("@/data/types").HealthStatus;
  }[];
};

export const queryKeys = {
  snapshot: ["nexus", "snapshot"] as const,
  orgs: ["nexus", "orgs"] as const,
  org: (id: string) => ["nexus", "orgs", id] as const,
  clusters: ["nexus", "clusters"] as const,
  opportunities: ["nexus", "opportunities"] as const,
  tasks: ["nexus", "tasks"] as const,
  notes: (objectId?: string) =>
    ["nexus", "notes", objectId ?? "all"] as const,
  activities: ["nexus", "activities"] as const,
};

export async function fetchSnapshot(): Promise<SnapshotBundle> {
  const res = await fetch("/api/snapshot", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load nexus snapshot");
  return res.json();
}
