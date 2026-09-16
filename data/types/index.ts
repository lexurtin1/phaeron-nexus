export type HealthStatus = "healthy" | "warning" | "critical";

export type Region = "EMEA" | "Americas" | "APAC" | "On-Prem" | "Global";

export type DeploymentMaturity =
  | "evaluation"
  | "deploying"
  | "live"
  | "ramped"
  | "at_risk";

export type PipelineStage =
  | "Prospect"
  | "Qualified"
  | "Proposed"
  | "Agreed"
  | "Deploying"
  | "Live";

export type OntologyNodeType =
  | "platform"
  | "distributor"
  | "administrator"
  | "custodian"
  | "asset_manager"
  | "market_infra"
  | "product"
  | "channel"
  | "concept"
  | "recent";

export type IncidentSeverity = "low" | "medium" | "high" | "critical";

export type TaskPriority = "low" | "medium" | "high" | "critical";

export type TaskModule =
  | "infrastructure"
  | "commercial"
  | "ontology"
  | "operations"
  | "client"
  | "team";

export interface SparkPoint {
  t: string;
  v: number;
}

export interface DeploymentHealth {
  runtimeStatus: HealthStatus;
  kubernetesHealth: HealthStatus;
  apiGateway: HealthStatus;
  lastCall: string;
  uptime: number;
  latencyP99: number;
  errorRate: number;
  evaluationScore: number;
  sparklines: {
    uptime: SparkPoint[];
    latency: SparkPoint[];
    errors: SparkPoint[];
    evaluation: SparkPoint[];
  };
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  strength: "strong" | "moderate" | "thin";
}

export interface Client {
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
}

export interface ClusterService {
  id: string;
  name: string;
  status: HealthStatus;
  replicas: number;
  ready: number;
  cpu: number;
  memory: number;
}

export interface Cluster {
  id: string;
  name: string;
  clientId: string | null;
  clientName: string;
  region: Region;
  k8sVersion: string;
  nodeCount: number;
  podsHealthy: number;
  podsPending: number;
  podsFailed: number;
  cpuUtil: number;
  memUtil: number;
  uptime: number;
  lastRollout: string;
  health: HealthStatus;
  services: ClusterService[];
}

export interface Incident {
  id: string;
  title: string;
  severity: IncidentSeverity;
  component: string;
  clientId: string | null;
  clientName: string;
  region: Region;
  openedAt: string;
  owner: string;
  status: "open" | "investigating" | "mitigating" | "resolved";
  impact: string;
}

export interface Rollout {
  id: string;
  name: string;
  fromVersion: string;
  toVersion: string;
  targetClients: string[];
  progress: number;
  status: "scheduled" | "in_progress" | "paused" | "complete";
  startedAt: string;
}

export interface OntologyNode {
  id: string;
  label: string;
  type: OntologyNodeType;
  version?: string;
  clientId?: string;
  packId?: string;
  description: string;
  relationshipCount: number;
  x?: number;
  y?: number;
}

export interface OntologyEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
  label: string;
}

export interface DomainPack {
  id: string;
  name: string;
  version: string;
  domain: string;
  deployedTo: string[];
  compatibility: string;
  rolloutStatus: "stable" | "rolling" | "outdated" | "draft";
}

export interface Opportunity {
  id: string;
  clientName: string;
  clientId: string | null;
  value: number;
  weightedValue: number;
  stage: PipelineStage;
  geography: string;
  region: Region;
  owner: string;
  daysInStage: number;
  health: HealthStatus;
  nextAction: string;
  confidence: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  region: Region;
  avatar?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  module: TaskModule;
  clientId: string | null;
  clientName: string | null;
  assigneeId: string;
  assigneeName: string;
  priority: TaskPriority;
  dueDate: string;
  status: "open" | "in_progress" | "done";
  raisedBy: string;
}

export interface Note {
  id: string;
  objectType: "client" | "deployment" | "opportunity" | "ontology" | "incident";
  objectId: string;
  author: string;
  body: string;
  createdAt: string;
}

export interface NetworkEvent {
  id: string;
  timestamp: string;
  type:
    | "api"
    | "deployment"
    | "evaluation"
    | "incident"
    | "commercial"
    | "ontology"
    | "sync";
  message: string;
  clientId?: string;
  severity?: HealthStatus;
}

export interface AttentionItem {
  id: string;
  title: string;
  context: string;
  raisedBy: string;
  module: TaskModule;
  priority: TaskPriority;
  clientName?: string;
  createdAt: string;
}

export interface TeamActivity {
  id: string;
  timestamp: string;
  memberName: string;
  action: string;
  target: string;
}
