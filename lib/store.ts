"use client";

import { create } from "zustand";

export interface GraphFilters {
  showClients: boolean;
  showPacks: boolean;
  minEdgeWeight: number;
  search: string;
  versionLayer: string;
}

interface NexusState {
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;
  graphFilters: GraphFilters;
  setGraphFilters: (patch: Partial<GraphFilters>) => void;
  attentionDismissed: string[];
  dismissAttention: (id: string) => void;
}

/** UI-only state. Notes/tasks live in Postgres via API + LivePulse. */
export const useNexusStore = create<NexusState>((set) => ({
  selectedClientId: null,
  setSelectedClientId: (id) => set({ selectedClientId: id }),
  graphFilters: {
    showClients: true,
    showPacks: true,
    minEdgeWeight: 0.5,
    search: "",
    versionLayer: "all",
  },
  setGraphFilters: (patch) =>
    set((s) => ({ graphFilters: { ...s.graphFilters, ...patch } })),
  attentionDismissed: [],
  dismissAttention: (id) =>
    set((s) => ({
      attentionDismissed: [...s.attentionDismissed, id],
    })),
}));
