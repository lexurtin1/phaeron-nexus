import { create } from "zustand";
import { notes as seedNotes, tasks as seedTasks } from "@/data/mock";
import type { Note, Task } from "@/data/types";

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
  notes: Note[];
  addNote: (note: Omit<Note, "id" | "createdAt">) => void;
  tasks: Task[];
  updateTaskStatus: (id: string, status: Task["status"]) => void;
  assignTask: (id: string, assigneeId: string, assigneeName: string) => void;
  attentionDismissed: string[];
  dismissAttention: (id: string) => void;
}

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
  notes: seedNotes,
  addNote: (note) =>
    set((s) => ({
      notes: [
        {
          ...note,
          id: `note-${Date.now()}`,
          createdAt: new Date().toISOString(),
        },
        ...s.notes,
      ],
    })),
  tasks: seedTasks,
  updateTaskStatus: (id, status) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
    })),
  assignTask: (id, assigneeId, assigneeName) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id ? { ...t, assigneeId, assigneeName, status: "in_progress" } : t
      ),
    })),
  attentionDismissed: [],
  dismissAttention: (id) =>
    set((s) => ({
      attentionDismissed: [...s.attentionDismissed, id],
    })),
}));
