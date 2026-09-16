import type {
  AttentionItem,
  Cluster,
  Contact,
  DeploymentHealth,
  DeploymentMaturity,
  HealthStatus,
  Incident,
  NetworkEvent,
  Note,
  Opportunity,
  PricingTier,
  Region,
  Rollout,
  Task,
  TeamActivity,
  TeamMember,
  ClientMeeting,
  ClientNewsItem,
} from "@/data/types";

/** Canonical organisation — commercial + geo core (was Client). */
export interface Organisation {
  id: string;
  name: string;
  industry: string;
  city: string;
  country: string;
  region: Region;
  lat: number;
  lng: number;
  health: HealthStatus;
  maturity: DeploymentMaturity;
  runtimeVersion: string;
  ontologyVersion: string;
  domainPacks: string[];
  evaluationScore: number;
  uptime: number;
  apiCalls24h: number;
  latencyP99: number;
  errorRate: number;
  commercialStage: string;
  arr: number;
  accountOwner: string;
  relationshipScore: number;
  lastCommercialContact: string;
  openOpportunities: number;
  contacts: Contact[];
  deployment: DeploymentHealth;
  hubActivity: number;
  pricingTier?: PricingTier;
  products?: string[];
  lastMeeting?: ClientMeeting;
  nextMeeting?: ClientMeeting;
  news?: ClientNewsItem[];
  mrr?: number;
  ytdRevenue?: number;
  /** Live series buffers (unix seconds + value) */
  liveTraffic: number[];
  liveLatency: number[];
  liveTimestamps: number[];
}

export interface Activity {
  id: string;
  type:
    | "api"
    | "deployment"
    | "evaluation"
    | "incident"
    | "commercial"
    | "ontology"
    | "sync"
    | "task"
    | "note"
    | "metric";
  actorId: string | null;
  subjectType: string;
  subjectId: string;
  timestamp: string;
  title: string;
  body: string;
  source: string;
  metadata?: Record<string, unknown>;
}

export interface RelationshipEdge {
  id: string;
  fromId: string;
  toId: string;
  type: string;
  weight?: number;
  label?: string;
}

export interface FleetSnapshot {
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
}

export interface WorldState {
  organisations: Organisation[];
  clusters: Cluster[];
  incidents: Incident[];
  rollouts: Rollout[];
  opportunities: Opportunity[];
  tasks: Task[];
  notes: Note[];
  activities: Activity[];
  networkEvents: NetworkEvent[];
  attentionItems: AttentionItem[];
  teamActivity: TeamActivity[];
  teamMembers: TeamMember[];
  relationships: RelationshipEdge[];
  fleet: FleetSnapshot;
  tick: number;
}

export type { Cluster, Incident, Opportunity, Task, Note, NetworkEvent };
