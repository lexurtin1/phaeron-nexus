"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Note, Task } from "@/data/types";
import { queryKeys, type SnapshotBundle } from "@/lib/query/keys";

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      status?: Task["status"];
      assigneeId?: string;
      assigneeName?: string;
    }) => {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to update task");
      return (await res.json()) as { task: Task };
    },
    onSuccess: ({ task }) => {
      queryClient.setQueryData<SnapshotBundle>(queryKeys.snapshot, (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: prev.tasks.map((t) => (t.id === task.id ? task : t)),
        };
      });
    },
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<Note, "id" | "createdAt">) => {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to create note");
      return (await res.json()) as { note: Note };
    },
    onSuccess: ({ note }) => {
      queryClient.setQueryData<SnapshotBundle>(queryKeys.snapshot, (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          notes: [note, ...prev.notes],
        };
      });
    },
  });
}
