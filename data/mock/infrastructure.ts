import type { Cluster, Incident, Rollout } from "@/data/types";

export const clusters: Cluster[] = [
  {
    id: "cls-emea-lon-1",
    name: "emea-lon-pulse-01",
    clientId: "cli-bravura",
    clientName: "Bravura",
    region: "EMEA",
    k8sVersion: "1.31.2",
    nodeCount: 8,
    podsHealthy: 56,
    podsPending: 0,
    podsFailed: 0,
    cpuUtil: 48,
    memUtil: 61,
    uptime: 99.98,
    lastRollout: "2026-09-14T08:00:00Z",
    health: "healthy",
    services: [
      { id: "svc1", name: "pulse-runtime", status: "healthy", replicas: 6, ready: 6, cpu: 42, memory: 55 },
      { id: "svc2", name: "retrieval-gateway", status: "healthy", replicas: 4, ready: 4, cpu: 38, memory: 48 },
      { id: "svc3", name: "ontology-sync", status: "healthy", replicas: 2, ready: 2, cpu: 22, memory: 34 },
    ],
  },
  {
    id: "cls-emea-lon-2",
    name: "emea-lon-pulse-02",
    clientId: "cli-broadridge",
    clientName: "Broadridge",
    region: "EMEA",
    k8sVersion: "1.31.2",
    nodeCount: 6,
    podsHealthy: 42,
    podsPending: 0,
    podsFailed: 0,
    cpuUtil: 52,
    memUtil: 58,
    uptime: 99.96,
    lastRollout: "2026-09-14T08:20:00Z",
    health: "healthy",
    services: [
      { id: "svc4", name: "pulse-runtime", status: "healthy", replicas: 4, ready: 4, cpu: 51, memory: 60 },
      { id: "svc5", name: "eval-worker", status: "healthy", replicas: 3, ready: 3, cpu: 44, memory: 52 },
    ],
  },
  {
    id: "cls-emea-dub-1",
    name: "emea-dub-pulse-01",
    clientId: "cli-linedata",
    clientName: "Linedata",
    region: "EMEA",
    k8sVersion: "1.31.2",
    nodeCount: 5,
    podsHealthy: 34,
    podsPending: 0,
    podsFailed: 0,
    cpuUtil: 45,
    memUtil: 54,
    uptime: 99.94,
    lastRollout: "2026-09-12T09:00:00Z",
    health: "healthy",
    services: [
      { id: "svc6", name: "pulse-runtime", status: "healthy", replicas: 4, ready: 4, cpu: 40, memory: 50 },
      { id: "svc7", name: "policy-engine", status: "healthy", replicas: 2, ready: 2, cpu: 28, memory: 36 },
    ],
  },
  {
    id: "cls-emea-lux-1",
    name: "emea-lux-pulse-01",
    clientId: "cli-allfunds",
    clientName: "Allfunds",
    region: "EMEA",
    k8sVersion: "1.31.1",
    nodeCount: 5,
    podsHealthy: 36,
    podsPending: 0,
    podsFailed: 0,
    cpuUtil: 50,
    memUtil: 57,
    uptime: 99.95,
    lastRollout: "2026-09-13T07:00:00Z",
    health: "healthy",
    services: [
      { id: "svc8", name: "pulse-runtime", status: "healthy", replicas: 4, ready: 4, cpu: 47, memory: 55 },
      { id: "svc9", name: "api-edge", status: "healthy", replicas: 2, ready: 2, cpu: 31, memory: 39 },
    ],
  },
  {
    id: "cls-emea-lux-2",
    name: "emea-lux-pulse-02",
    clientId: "cli-apex",
    clientName: "Apex Group",
    region: "EMEA",
    k8sVersion: "1.30.5",
    nodeCount: 4,
    podsHealthy: 22,
    podsPending: 2,
    podsFailed: 1,
    cpuUtil: 74,
    memUtil: 81,
    uptime: 99.1,
    lastRollout: "2026-08-28T11:00:00Z",
    health: "warning",
    services: [
      { id: "svc10", name: "pulse-runtime", status: "warning", replicas: 3, ready: 2, cpu: 72, memory: 78 },
      { id: "svc11", name: "retrieval-gateway", status: "warning", replicas: 2, ready: 1, cpu: 68, memory: 74 },
    ],
  },
  {
    id: "cls-emea-bru-1",
    name: "emea-bru-pulse-01",
    clientId: "cli-euroclear",
    clientName: "Euroclear",
    region: "EMEA",
    k8sVersion: "1.31.2",
    nodeCount: 4,
    podsHealthy: 18,
    podsPending: 3,
    podsFailed: 0,
    cpuUtil: 38,
    memUtil: 44,
    uptime: 99.6,
    lastRollout: "2026-09-15T06:00:00Z",
    health: "warning",
    services: [
      { id: "svc12", name: "pulse-runtime", status: "healthy", replicas: 3, ready: 3, cpu: 35, memory: 42 },
      { id: "svc13", name: "bootstrap-job", status: "warning", replicas: 1, ready: 0, cpu: 12, memory: 20 },
    ],
  },
  {
    id: "cls-emea-lon-3",
    name: "emea-lon-pulse-03",
    clientId: "cli-statestreet",
    clientName: "State Street",
    region: "EMEA",
    k8sVersion: "1.29.8",
    nodeCount: 3,
    podsHealthy: 12,
    podsPending: 2,
    podsFailed: 4,
    cpuUtil: 91,
    memUtil: 94,
    uptime: 97.6,
    lastRollout: "2026-08-12T09:00:00Z",
    health: "critical",
    services: [
      { id: "svc14", name: "pulse-runtime", status: "critical", replicas: 3, ready: 1, cpu: 94, memory: 96 },
      { id: "svc15", name: "retrieval-gateway", status: "critical", replicas: 2, ready: 0, cpu: 0, memory: 12 },
      { id: "svc16", name: "eval-worker", status: "warning", replicas: 2, ready: 1, cpu: 71, memory: 80 },
    ],
  },
  {
    id: "cls-emea-lon-4",
    name: "emea-lon-pulse-04",
    clientId: "cli-northerntrust",
    clientName: "Northern Trust",
    region: "EMEA",
    k8sVersion: "1.31.2",
    nodeCount: 6,
    podsHealthy: 44,
    podsPending: 0,
    podsFailed: 0,
    cpuUtil: 46,
    memUtil: 53,
    uptime: 99.97,
    lastRollout: "2026-09-14T10:00:00Z",
    health: "healthy",
    services: [
      { id: "svc17", name: "pulse-runtime", status: "healthy", replicas: 5, ready: 5, cpu: 41, memory: 49 },
      { id: "svc18", name: "ontology-sync", status: "healthy", replicas: 2, ready: 2, cpu: 24, memory: 33 },
    ],
  },
  {
    id: "cls-ctrl-lon",
    name: "ctrl-lon-phaeron-hub",
    clientId: null,
    clientName: "Phaeron Control Plane",
    region: "EMEA",
    k8sVersion: "1.31.2",
    nodeCount: 12,
    podsHealthy: 86,
    podsPending: 0,
    podsFailed: 0,
    cpuUtil: 41,
    memUtil: 49,
    uptime: 99.99,
    lastRollout: "2026-09-16T06:00:00Z",
    health: "healthy",
    services: [
      { id: "svc19", name: "control-api", status: "healthy", replicas: 6, ready: 6, cpu: 36, memory: 44 },
      { id: "svc20", name: "fleet-orchestrator", status: "healthy", replicas: 4, ready: 4, cpu: 48, memory: 52 },
      { id: "svc21", name: "telemetry-ingest", status: "healthy", replicas: 5, ready: 5, cpu: 55, memory: 61 },
    ],
  },
];

export const incidents: Incident[] = [
  {
    id: "inc-001",
    title: "Retrieval gateway timeout cascade",
    severity: "critical",
    component: "retrieval-gateway",
    clientId: "cli-statestreet",
    clientName: "State Street",
    region: "EMEA",
    openedAt: "2026-09-16T10:18:00Z",
    owner: "I. Okonkwo",
    status: "investigating",
    impact: "Model calls failing · evaluation pipeline stalled · client Pulse degraded",
  },
  {
    id: "inc-002",
    title: "Elevated P99 on API edge",
    severity: "medium",
    component: "api-edge",
    clientId: "cli-apex",
    clientName: "Apex Group",
    region: "EMEA",
    openedAt: "2026-09-16T08:42:00Z",
    owner: "T. Nakamura",
    status: "mitigating",
    impact: "Latency above SLA for settlement queries · no data loss",
  },
  {
    id: "inc-003",
    title: "Ontology pack drift on outdated runtime",
    severity: "high",
    component: "ontology-sync",
    clientId: "cli-fis",
    clientName: "FIS",
    region: "EMEA",
    openedAt: "2026-09-15T16:05:00Z",
    owner: "P. Desai",
    status: "open",
    impact: "FundDistribution pack out of sync with master 4.2 · rollout blocked",
  },
];

export const rollouts: Rollout[] = [
  {
    id: "rol-001",
    name: "Runtime 2.4.1 fleet push",
    fromVersion: "2.3.8",
    toVersion: "2.4.1",
    targetClients: ["Apex Group", "FIS", "State Street"],
    progress: 34,
    status: "in_progress",
    startedAt: "2026-09-16T07:00:00Z",
  },
  {
    id: "rol-002",
    name: "Ontology 4.2.0 master promotion",
    fromVersion: "4.1.2",
    toVersion: "4.2.0",
    targetClients: ["SEI", "Apex Group"],
    progress: 0,
    status: "scheduled",
    startedAt: "2026-09-18T09:00:00Z",
  },
];

export function getCluster(id: string): Cluster | undefined {
  return clusters.find((c) => c.id === id);
}

export function regionSummaries() {
  const regions = ["EMEA", "Americas", "APAC", "On-Prem"] as const;
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
      health: regionClusters.some((c) => c.health === "critical")
        ? ("critical" as const)
        : regionClusters.some((c) => c.health === "warning")
          ? ("warning" as const)
          : ("healthy" as const),
    };
  });
}
