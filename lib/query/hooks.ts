"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { organisationToClient } from "@/domain/adapters";
import type { LivePatch } from "@/domain/live";
import type { HealthStatus, Incident, Region } from "@/data/types";
import {
  fetchSnapshot,
  queryKeys,
  type SnapshotBundle,
} from "@/lib/query/keys";

function regionSummariesFrom(
  clusters: SnapshotBundle["clusters"],
  incidents: Incident[]
): SnapshotBundle["regionSummaries"] {
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

function commercialFrom(
  opportunities: SnapshotBundle["opportunities"],
  organisations: SnapshotBundle["organisations"]
): SnapshotBundle["commercial"] {
  const open = opportunities.filter((o) => o.stage !== "Live");
  const totalOpen = open.reduce((s, o) => s + o.value, 0);
  const weighted = open.reduce((s, o) => s + o.weightedValue, 0);
  const contractedArr = organisations.reduce((s, c) => s + c.arr, 0);
  const liveArr = organisations
    .filter((c) => ["live", "ramped"].includes(c.maturity))
    .reduce((s, c) => s + c.arr, 0);
  const rampedArr = organisations
    .filter((c) => c.maturity === "ramped")
    .reduce((s, c) => s + c.arr, 0);
  return {
    totalOpen,
    weighted,
    contractedArr,
    liveArr,
    rampedArr,
    pipelineCoverage: weighted / 1_200_000,
    confidenceWeighted: opportunities.reduce(
      (s, o) => s + o.value * o.confidence,
      0
    ),
    dealsToTarget: Math.max(0, Math.ceil((1_200_000 - weighted) / 200000)),
  };
}

function applyPatch(
  prev: SnapshotBundle | undefined,
  patch: LivePatch
): SnapshotBundle {
  const organisations = patch.organisations ?? prev?.organisations ?? [];
  const clusters = patch.clusters ?? prev?.clusters ?? [];
  const incidents = patch.incidents ?? prev?.incidents ?? [];
  const opportunities = patch.opportunities ?? prev?.opportunities ?? [];
  return {
    tick: patch.tick,
    fleet: patch.fleet,
    organisations,
    clients: organisations.map(organisationToClient),
    clusters,
    incidents,
    networkEvents: patch.networkEvents ?? prev?.networkEvents ?? [],
    activities: patch.activities ?? prev?.activities ?? [],
    tasks: patch.tasks ?? prev?.tasks ?? [],
    notes: patch.notes ?? prev?.notes ?? [],
    opportunities,
    teamActivity: patch.teamActivity ?? prev?.teamActivity ?? [],
    rollouts: prev?.rollouts ?? [],
    attentionItems: prev?.attentionItems ?? [],
    teamMembers: prev?.teamMembers ?? [],
    relationships: prev?.relationships ?? [],
    regionSummaries: regionSummariesFrom(clusters, incidents),
    commercial: commercialFrom(opportunities, organisations),
  };
}

export function useNexusSnapshot() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.snapshot,
    queryFn: fetchSnapshot,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    let es: EventSource;
    try {
      es = new EventSource("/api/live/stream");
    } catch {
      return;
    }

    const onSnapshot = (ev: MessageEvent) => {
      try {
        const patch = JSON.parse(ev.data) as LivePatch;
        queryClient.setQueryData<SnapshotBundle>(queryKeys.snapshot, (prev) =>
          applyPatch(prev, patch)
        );
      } catch {
        // ignore malformed frames
      }
    };

    const onPatch = (ev: MessageEvent) => {
      try {
        const patch = JSON.parse(ev.data) as LivePatch;
        queryClient.setQueryData<SnapshotBundle>(queryKeys.snapshot, (prev) =>
          applyPatch(prev, patch)
        );
      } catch {
        // ignore
      }
    };

    es.addEventListener("snapshot", onSnapshot);
    es.addEventListener("patch", onPatch);

    return () => {
      es.removeEventListener("snapshot", onSnapshot);
      es.removeEventListener("patch", onPatch);
      es.close();
    };
  }, [queryClient]);

  return query;
}

export function useLiveClients() {
  const { data, ...rest } = useNexusSnapshot();
  return { ...rest, data: data?.clients ?? [] };
}

export function useLiveClusters() {
  const { data, ...rest } = useNexusSnapshot();
  return { ...rest, data: data?.clusters ?? [] };
}

export function useLiveIncidents() {
  const { data, ...rest } = useNexusSnapshot();
  return { ...rest, data: data?.incidents ?? [] };
}

export function useLiveOpportunities() {
  const { data, ...rest } = useNexusSnapshot();
  return { ...rest, data: data?.opportunities ?? [] };
}

export function useLiveTasks() {
  const { data, ...rest } = useNexusSnapshot();
  return { ...rest, data: data?.tasks ?? [] };
}

export function useLiveNotes(objectId?: string) {
  const { data, ...rest } = useNexusSnapshot();
  const notes = data?.notes ?? [];
  return {
    ...rest,
    data: objectId ? notes.filter((n) => n.objectId === objectId) : notes,
  };
}

export function useLiveFleet() {
  const { data, ...rest } = useNexusSnapshot();
  return { ...rest, data: data?.fleet };
}

export function useLiveCommercial() {
  const { data, ...rest } = useNexusSnapshot();
  return { ...rest, data: data?.commercial };
}

export function useLiveNetworkEvents() {
  const { data, ...rest } = useNexusSnapshot();
  return { ...rest, data: data?.networkEvents ?? [] };
}

export function useLiveRegionSummaries() {
  const { data, ...rest } = useNexusSnapshot();
  return { ...rest, data: data?.regionSummaries ?? [] };
}

export function useLiveRollouts() {
  const { data, ...rest } = useNexusSnapshot();
  return { ...rest, data: data?.rollouts ?? [] };
}

export function useLiveAttention() {
  const { data, ...rest } = useNexusSnapshot();
  return { ...rest, data: data?.attentionItems ?? [] };
}

export function useLiveTeamActivity() {
  const { data, ...rest } = useNexusSnapshot();
  return { ...rest, data: data?.teamActivity ?? [] };
}

export function useLiveOrganisation(id: string) {
  const { data, ...rest } = useNexusSnapshot();
  const org = data?.organisations.find((o) => o.id === id);
  return { ...rest, data: org, client: org ? organisationToClient(org) : undefined };
}
