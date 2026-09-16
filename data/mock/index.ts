import { clients, getClient } from "./clients";
import { opportunities, commercialSummary } from "./commercial";
import { networkEvents } from "./events";
import {
  clusters,
  getCluster,
  incidents,
  regionSummaries,
  rollouts,
} from "./infrastructure";
import {
  domainPacks,
  getOntologyNode,
  ontologyEdges,
  ontologyNodes,
} from "./ontology";
import {
  attentionItems,
  notes,
  tasks,
  teamActivity,
  teamMembers,
} from "./team";
import { resolveClientIntel } from "./clientIntel";
import type { HealthStatus, Region } from "@/data/types";

export {
  clients,
  getClient,
  opportunities,
  commercialSummary,
  networkEvents,
  clusters,
  getCluster,
  incidents,
  regionSummaries,
  rollouts,
  domainPacks,
  ontologyNodes,
  ontologyEdges,
  getOntologyNode,
  attentionItems,
  notes,
  tasks,
  teamActivity,
  teamMembers,
  resolveClientIntel,
};

export function globalKpis() {
  const activeDeployments = clients.filter((c) =>
    ["live", "ramped", "deploying"].includes(c.maturity)
  ).length;
  const fleetUptime =
    clients.reduce((s, c) => s + c.uptime, 0) / clients.length;
  const openIncidents = incidents.filter((i) => i.status !== "resolved").length;
  const evalPassing = clients.filter((c) => c.evaluationScore >= 85).length;
  return {
    activeDeployments,
    fleetUptime,
    openIncidents,
    evaluationsPassing: evalPassing,
    evaluationsTotal: clients.length,
  };
}

export function regionalHealth(): {
  region: Region;
  status: HealthStatus;
  deployments: number;
  uptime: number;
}[] {
  const regions: Region[] = ["EMEA", "Americas", "APAC", "Global"];
  return regions.map((region) => {
    const subset =
      region === "Global"
        ? clients
        : clients.filter((c) => c.region === region);
    const critical = subset.some((c) => c.health === "critical");
    const warning = subset.some((c) => c.health === "warning");
    return {
      region,
      status: critical ? "critical" : warning ? "warning" : "healthy",
      deployments: subset.filter((c) =>
        ["live", "ramped", "deploying"].includes(c.maturity)
      ).length,
      uptime:
        subset.reduce((s, c) => s + c.uptime, 0) / Math.max(subset.length, 1),
    };
  });
}

export const PHAERON_HUB = {
  lat: 51.5074,
  lng: -0.1278,
  label: "Phaeron Control Plane · London",
};
