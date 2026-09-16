import type { Cluster, Incident, Rollout } from "@/data/types";

export const clusters: Cluster[] = [
  {
    id: "cls-emea-lon-1",
    name: "emea-lon-pulse-01",
    clientId: "cli-meridian",
    clientName: "Meridian Fund Services",
    region: "EMEA",
    k8sVersion: "1.31.2",
    nodeCount: 6,
    podsHealthy: 42,
    podsPending: 0,
    podsFailed: 0,
    cpuUtil: 48,
    memUtil: 61,
    uptime: 99.97,
    lastRollout: "2026-09-14T08:00:00Z",
    health: "healthy",
    services: [
      { id: "svc1", name: "pulse-runtime", status: "healthy", replicas: 4, ready: 4, cpu: 42, memory: 55 },
      { id: "svc2", name: "retrieval-gateway", status: "healthy", replicas: 3, ready: 3, cpu: 38, memory: 48 },
      { id: "svc3", name: "ontology-sync", status: "healthy", replicas: 2, ready: 2, cpu: 22, memory: 34 },
    ],
  },
  {
    id: "cls-emea-dub-1",
    name: "emea-dub-pulse-01",
    clientId: "cli-lumen",
    clientName: "Lumen Transfer Agency",
    region: "EMEA",
    k8sVersion: "1.31.2",
    nodeCount: 8,
    podsHealthy: 56,
    podsPending: 0,
    podsFailed: 0,
    cpuUtil: 52,
    memUtil: 58,
    uptime: 99.99,
    lastRollout: "2026-09-14T08:20:00Z",
    health: "healthy",
    services: [
      { id: "svc4", name: "pulse-runtime", status: "healthy", replicas: 6, ready: 6, cpu: 51, memory: 60 },
      { id: "svc5", name: "eval-worker", status: "healthy", replicas: 4, ready: 4, cpu: 44, memory: 52 },
      { id: "svc6", name: "api-edge", status: "healthy", replicas: 3, ready: 3, cpu: 33, memory: 41 },
    ],
  },
  {
    id: "cls-emea-lux-1",
    name: "emea-lux-pulse-01",
    clientId: "cli-northbank",
    clientName: "Northbank Savings",
    region: "EMEA",
    k8sVersion: "1.30.5",
    nodeCount: 4,
    podsHealthy: 28,
    podsPending: 1,
    podsFailed: 0,
    cpuUtil: 61,
    memUtil: 70,
    uptime: 99.94,
    lastRollout: "2026-09-10T11:00:00Z",
    health: "healthy",
    services: [
      { id: "svc7", name: "pulse-runtime", status: "healthy", replicas: 3, ready: 3, cpu: 58, memory: 66 },
      { id: "svc8", name: "retrieval-gateway", status: "warning", replicas: 2, ready: 1, cpu: 72, memory: 78 },
    ],
  },
  {
    id: "cls-ame-nyc-1",
    name: "ame-nyc-pulse-01",
    clientId: "cli-harbor",
    clientName: "Harbor Street Custodians",
    region: "Americas",
    k8sVersion: "1.31.2",
    nodeCount: 7,
    podsHealthy: 48,
    podsPending: 0,
    podsFailed: 0,
    cpuUtil: 45,
    memUtil: 54,
    uptime: 99.96,
    lastRollout: "2026-09-14T13:00:00Z",
    health: "healthy",
    services: [
      { id: "svc9", name: "pulse-runtime", status: "healthy", replicas: 5, ready: 5, cpu: 40, memory: 50 },
      { id: "svc10", name: "policy-engine", status: "healthy", replicas: 3, ready: 3, cpu: 28, memory: 36 },
    ],
  },
  {
    id: "cls-ame-nyc-2",
    name: "ame-nyc-pulse-02",
    clientId: "cli-kestrel",
    clientName: "Kestrel Asset Partners",
    region: "Americas",
    k8sVersion: "1.29.8",
    nodeCount: 3,
    podsHealthy: 14,
    podsPending: 2,
    podsFailed: 3,
    cpuUtil: 88,
    memUtil: 91,
    uptime: 97.4,
    lastRollout: "2026-08-12T09:00:00Z",
    health: "critical",
    services: [
      { id: "svc11", name: "pulse-runtime", status: "critical", replicas: 3, ready: 1, cpu: 94, memory: 96 },
      { id: "svc12", name: "retrieval-gateway", status: "critical", replicas: 2, ready: 0, cpu: 0, memory: 12 },
      { id: "svc13", name: "eval-worker", status: "warning", replicas: 2, ready: 1, cpu: 71, memory: 80 },
    ],
  },
  {
    id: "cls-ame-nyc-3",
    name: "ame-nyc-pulse-03",
    clientId: "cli-orion",
    clientName: "Orion Private Markets",
    region: "Americas",
    k8sVersion: "1.31.2",
    nodeCount: 4,
    podsHealthy: 22,
    podsPending: 3,
    podsFailed: 0,
    cpuUtil: 38,
    memUtil: 44,
    uptime: 99.4,
    lastRollout: "2026-09-15T20:00:00Z",
    health: "warning",
    services: [
      { id: "svc14", name: "pulse-runtime", status: "healthy", replicas: 3, ready: 3, cpu: 35, memory: 42 },
      { id: "svc15", name: "ontology-sync", status: "warning", replicas: 2, ready: 1, cpu: 18, memory: 30 },
    ],
  },
  {
    id: "cls-apac-sin-1",
    name: "apac-sin-pulse-01",
    clientId: "cli-fenwick",
    clientName: "Fenwick Merchant Bank",
    region: "APAC",
    k8sVersion: "1.31.1",
    nodeCount: 5,
    podsHealthy: 34,
    podsPending: 0,
    podsFailed: 0,
    cpuUtil: 50,
    memUtil: 57,
    uptime: 99.91,
    lastRollout: "2026-09-12T04:00:00Z",
    health: "healthy",
    services: [
      { id: "svc16", name: "pulse-runtime", status: "healthy", replicas: 4, ready: 4, cpu: 47, memory: 55 },
      { id: "svc17", name: "api-edge", status: "healthy", replicas: 2, ready: 2, cpu: 31, memory: 39 },
    ],
  },
  {
    id: "cls-apac-syd-1",
    name: "apac-syd-pulse-01",
    clientId: "cli-southgate",
    clientName: "Southgate Mutual",
    region: "APAC",
    k8sVersion: "1.31.2",
    nodeCount: 3,
    podsHealthy: 16,
    podsPending: 2,
    podsFailed: 0,
    cpuUtil: 29,
    memUtil: 36,
    uptime: 99.5,
    lastRollout: "2026-09-15T01:00:00Z",
    health: "warning",
    services: [
      { id: "svc18", name: "pulse-runtime", status: "healthy", replicas: 2, ready: 2, cpu: 26, memory: 33 },
      { id: "svc19", name: "bootstrap-job", status: "warning", replicas: 1, ready: 0, cpu: 12, memory: 20 },
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
      { id: "svc20", name: "control-api", status: "healthy", replicas: 6, ready: 6, cpu: 36, memory: 44 },
      { id: "svc21", name: "fleet-orchestrator", status: "healthy", replicas: 4, ready: 4, cpu: 48, memory: 52 },
      { id: "svc22", name: "telemetry-ingest", status: "healthy", replicas: 5, ready: 5, cpu: 55, memory: 61 },
    ],
  },
];

export const incidents: Incident[] = [
  {
    id: "inc-001",
    title: "Retrieval gateway timeout cascade",
    severity: "critical",
    component: "retrieval-gateway",
    clientId: "cli-kestrel",
    clientName: "Kestrel Asset Partners",
    region: "Americas",
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
    clientId: "cli-aldgate",
    clientName: "Aldgate Clearing House",
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
    clientId: "cli-havelock",
    clientName: "Havelock Credit Union",
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
    targetClients: ["Aldgate Clearing House", "Havelock Credit Union", "Kestrel Asset Partners"],
    progress: 34,
    status: "in_progress",
    startedAt: "2026-09-16T07:00:00Z",
  },
  {
    id: "rol-002",
    name: "Ontology 4.2.0 master promotion",
    fromVersion: "4.1.2",
    toVersion: "4.2.0",
    targetClients: ["Fenwick Merchant Bank", "Aldgate Clearing House"],
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
      region === "On-Prem"
        ? []
        : clusters.filter((c) => c.region === region);
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
