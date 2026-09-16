"use client";

import { useMemo, useState } from "react";
import { attentionItems, teamActivity } from "@/data/mock";
import { useNexusStore } from "@/lib/store";
import { relativeTime } from "@/lib/utils";
import {
  Badge,
  Button,
  Card,
  SectionHeader,
  Tag,
} from "@/components/ui";
import type { TaskModule, TaskPriority } from "@/data/types";

const CURRENT_USER = "tm-alex";

export default function TeamPage() {
  const tasks = useNexusStore((s) => s.tasks);
  const updateTaskStatus = useNexusStore((s) => s.updateTaskStatus);
  const assignTask = useNexusStore((s) => s.assignTask);
  const attentionDismissed = useNexusStore((s) => s.attentionDismissed);
  const dismissAttention = useNexusStore((s) => s.dismissAttention);

  const [moduleFilter, setModuleFilter] = useState<TaskModule | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">(
    "all"
  );

  const attention = attentionItems.filter(
    (a) => !attentionDismissed.includes(a.id)
  );

  const myActions = useMemo(() => {
    return tasks.filter((t) => {
      if (t.assigneeId !== CURRENT_USER && t.status === "done") return false;
      if (t.assigneeId !== CURRENT_USER) return false;
      if (moduleFilter !== "all" && t.module !== moduleFilter) return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter)
        return false;
      return t.status !== "done";
    });
  }, [tasks, moduleFilter, priorityFilter]);

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Internal Operating Layer"
        title="Team"
        description="What needs a human decision, what you own, and what the Phaeron team has been doing."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card elevated className="lg:min-h-[520px]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Attention Required
          </p>
          <ul className="mt-3 space-y-3">
            {attention.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-border bg-muted/40 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13px] font-semibold text-foreground">
                    {item.title}
                  </p>
                  <Badge
                    tone={
                      item.priority === "critical"
                        ? "critical"
                        : item.priority === "high"
                          ? "warning"
                          : "navy"
                    }
                  >
                    {item.priority}
                  </Badge>
                </div>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  {item.context}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {item.raisedBy}
                  {item.clientName ? ` · ${item.clientName}` : ""} ·{" "}
                  {relativeTime(item.createdAt)}
                </p>
                <div className="mt-2 flex gap-2">
                  <Button
                    variant="primary"
                    onClick={() => {
                      const related = tasks.find(
                        (t) =>
                          t.clientName === item.clientName &&
                          t.status !== "done"
                      );
                      if (related) {
                        assignTask(related.id, CURRENT_USER, "Alex Curtin");
                      }
                      dismissAttention(item.id);
                    }}
                  >
                    Assign to me
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => dismissAttention(item.id)}
                  >
                    Resolve
                  </Button>
                </div>
              </li>
            ))}
            {attention.length === 0 && (
              <p className="py-8 text-center text-[13px] text-muted-foreground">
                Nothing escalated. The network is quiet — stay ready.
              </p>
            )}
          </ul>
        </Card>

        <Card className="lg:min-h-[520px]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              My Actions
            </p>
            <div className="flex gap-2">
              <select
                value={moduleFilter}
                onChange={(e) =>
                  setModuleFilter(e.target.value as TaskModule | "all")
                }
                className="h-7 rounded-md border border-[rgba(10,22,40,0.1)] bg-card px-2 text-[10px] font-semibold uppercase"
              >
                <option value="all">All modules</option>
                <option value="commercial">Commercial</option>
                <option value="client">Client</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="ontology">Ontology</option>
                <option value="operations">Operations</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) =>
                  setPriorityFilter(e.target.value as TaskPriority | "all")
                }
                className="h-7 rounded-md border border-[rgba(10,22,40,0.1)] bg-card px-2 text-[10px] font-semibold uppercase"
              >
                <option value="all">All priority</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <ul className="mt-3 space-y-3">
            {myActions.map((t) => (
              <li
                key={t.id}
                className="rounded-lg border border-border p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13px] font-semibold text-foreground">
                    {t.title}
                  </p>
                  <Badge
                    tone={
                      t.priority === "critical"
                        ? "critical"
                        : t.priority === "high"
                          ? "warning"
                          : "navy"
                    }
                  >
                    {t.priority}
                  </Badge>
                </div>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  {t.description}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Tag>{t.module}</Tag>
                  {t.clientName && <Tag>{t.clientName}</Tag>}
                  <Tag>Due {t.dueDate}</Tag>
                </div>
                <div className="mt-2 flex gap-2">
                  {t.status === "open" && (
                    <Button
                      variant="subtle"
                      onClick={() => updateTaskStatus(t.id, "in_progress")}
                    >
                      Start
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    onClick={() => updateTaskStatus(t.id, "done")}
                  >
                    Complete
                  </Button>
                </div>
              </li>
            ))}
            {myActions.length === 0 && (
              <p className="py-8 text-center text-[13px] text-muted-foreground">
                You&apos;re clear. Pick something from Attention Required when
                ready.
              </p>
            )}
          </ul>
        </Card>

        <Card className="lg:min-h-[520px]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Team Activity
          </p>
          <ul className="mt-3 space-y-0">
            {teamActivity.map((a) => (
              <li
                key={a.id}
                className="border-b border-[rgba(10,22,40,0.05)] py-3 last:border-0"
              >
                <p className="text-[13px] text-foreground">
                  <span className="font-semibold text-foreground">
                    {a.memberName}
                  </span>{" "}
                  {a.action.toLowerCase()}{" "}
                  <span className="font-medium">{a.target}</span>
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {relativeTime(a.timestamp)}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
