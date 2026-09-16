"use client";

import Graph from "graphology";
import { useEffect, useMemo, useRef, useState } from "react";
import Sigma from "sigma";
import { Network } from "lucide-react";
import { ontologyEdges, ontologyNodes } from "@/data/mock";
import type { OntologyNode, OntologyNodeType } from "@/data/types";
import { useNexusStore } from "@/lib/store";
import { Badge, Input, Tag } from "@/components/ui";

const NODE_COLOR: Record<OntologyNodeType, string> = {
  platform: "#7b61ff",
  distributor: "#ff8c42",
  administrator: "#0063ff",
  custodian: "#0f172a",
  asset_manager: "#00c7ff",
  market_infra: "#5b4cdb",
  product: "#00d084",
  channel: "#ff6b9d",
  concept: "#334155",
  recent: "#ef4444",
};

const ROLE_FILTERS: { key: OntologyNodeType; label: string }[] = [
  { key: "platform", label: "Platforms" },
  { key: "distributor", label: "Distributors" },
  { key: "administrator", label: "Administrators" },
  { key: "custodian", label: "Custodians" },
  { key: "market_infra", label: "Market infra" },
  { key: "concept", label: "Concepts" },
  { key: "product", label: "Products" },
  { key: "channel", label: "Channels" },
];

export function OntologyGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const filters = useNexusStore((s) => s.graphFilters);
  const setGraphFilters = useNexusStore((s) => s.setGraphFilters);
  const [selected, setSelected] = useState<OntologyNode | null>(null);
  const [hiddenRoles, setHiddenRoles] = useState<Set<OntologyNodeType>>(
    new Set()
  );

  const visibleNodes = useMemo(() => {
    return ontologyNodes.filter((n) => {
      if (hiddenRoles.has(n.type)) return false;
      if (filters.search) {
        return n.label.toLowerCase().includes(filters.search.toLowerCase());
      }
      return true;
    });
  }, [filters.search, hiddenRoles]);

  const visibleIds = useMemo(
    () => new Set(visibleNodes.map((n) => n.id)),
    [visibleNodes]
  );

  const counterparties = useMemo(() => {
    if (!selected) return [];
    return ontologyEdges
      .filter((e) => e.source === selected.id || e.target === selected.id)
      .map((e) => {
        const otherId = e.source === selected.id ? e.target : e.source;
        const other = ontologyNodes.find((n) => n.id === otherId);
        return { edge: e, other };
      });
  }, [selected]);

  useEffect(() => {
    if (!containerRef.current) return;
    const graph = new Graph();
    visibleNodes.forEach((n) => {
      graph.addNode(n.id, {
        label: n.label,
        x: n.x ?? Math.random() * 400 - 200,
        y: n.y ?? Math.random() * 400 - 200,
        size:
          n.id === "phaeron-master"
            ? 16
            : n.type === "concept"
              ? 8
              : 10 + Math.min(n.relationshipCount / 4, 5),
        color: NODE_COLOR[n.type],
      });
    });

    ontologyEdges.forEach((e) => {
      if (
        visibleIds.has(e.source) &&
        visibleIds.has(e.target) &&
        e.weight >= filters.minEdgeWeight &&
        graph.hasNode(e.source) &&
        graph.hasNode(e.target) &&
        !graph.hasEdge(e.source, e.target)
      ) {
        graph.addEdge(e.source, e.target, {
          size: 1 + e.weight * 2,
          color:
            e.label === "settles_through" || e.label === "clears_via"
              ? "rgba(123,97,255,0.45)"
              : "rgba(0,99,255,0.28)",
          label: e.label,
        });
      }
    });

    const sigma = new Sigma(graph, containerRef.current, {
      allowInvalidContainer: true,
      renderEdgeLabels: false,
      labelColor: { color: "#0a1628" },
      labelSize: 11,
      labelFont: "Open Sans, sans-serif",
      defaultEdgeColor: "rgba(0,99,255,0.25)",
    });

    sigma.on("clickNode", ({ node }) => {
      setSelected(ontologyNodes.find((n) => n.id === node) ?? null);
    });
    sigma.on("clickStage", () => setSelected(null));

    let frame = 0;
    const settle = () => {
      frame += 1;
      graph.forEachNode((node, attrs) => {
        let fx = -attrs.x * 0.002;
        let fy = -attrs.y * 0.002;
        graph.neighbors(node).forEach((nb) => {
          const nAttrs = graph.getNodeAttributes(nb);
          fx += (nAttrs.x - attrs.x) * 0.015;
          fy += (nAttrs.y - attrs.y) * 0.015;
        });
        graph.setNodeAttribute(node, "x", attrs.x + fx);
        graph.setNodeAttribute(node, "y", attrs.y + fy);
      });
      sigma.refresh();
      if (frame < 80) requestAnimationFrame(settle);
    };
    requestAnimationFrame(settle);

    return () => {
      sigma.kill();
    };
  }, [visibleNodes, visibleIds, filters.minEdgeWeight]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4 shadow-[0_1px_2px_rgba(10,22,40,0.04)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <Network className="h-4 w-4 text-[#7b61ff]" />
              Funds Industry GraphRAG
            </p>
            <p className="mt-1 max-w-2xl text-[13px] text-muted-foreground">
              Who sells, distributes, administers, and settles with whom — unified
              through Phaeron&apos;s master ontology so every Pulse claim retrieves
              the same industry meaning.
            </p>
          </div>
          <Input
            value={filters.search}
            onChange={(e) => setGraphFilters({ search: e.target.value })}
            placeholder="Search firm or concept…"
            className="max-w-xs"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {ROLE_FILTERS.map((r) => {
            const on = !hiddenRoles.has(r.key);
            return (
              <button
                key={r.key}
                type="button"
                onClick={() =>
                  setHiddenRoles((prev) => {
                    const next = new Set(prev);
                    if (next.has(r.key)) next.delete(r.key);
                    else next.add(r.key);
                    return next;
                  })
                }
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
                  on
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {r.label}
              </button>
            );
          })}
          <label className="ml-auto flex items-center gap-2 text-[11px] font-semibold text-muted-foreground">
            Min strength
            <input
              type="range"
              min={0.5}
              max={0.98}
              step={0.02}
              value={filters.minEdgeWeight}
              onChange={(e) =>
                setGraphFilters({ minEdgeWeight: Number(e.target.value) })
              }
            />
          </label>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="relative min-h-[520px] overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_2px_rgba(10,22,40,0.04)]">
          <div ref={containerRef} className="absolute inset-0" />
        </div>
        <aside className="rounded-xl border border-border bg-card p-4 shadow-[0_1px_2px_rgba(10,22,40,0.04)]">
          {selected ? (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-xl font-bold text-foreground">
                  {selected.label}
                </h2>
                <Badge tone="purple">{selected.type.replace("_", " ")}</Badge>
              </div>
              <p className="text-[13px] text-muted-foreground">{selected.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {selected.version && <Tag>v{selected.version}</Tag>}
                <Tag>{selected.relationshipCount} links</Tag>
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Counterparties
              </p>
              <ul className="space-y-2">
                {counterparties.map(({ edge, other }) => (
                  <li
                    key={edge.id}
                    className="rounded-lg bg-muted/60 px-3 py-2 text-[12px]"
                  >
                    <span className="font-semibold text-foreground">
                      {edge.label}
                    </span>{" "}
                    <span className="text-foreground">{other?.label}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      · {(edge.weight * 100).toFixed(0)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold text-foreground">
                Select a node
              </p>
              <p className="mt-2 text-[13px] text-muted-foreground">
                Purple platforms, navy custodians, amber distributors, pink
                channels — edges show sells_to, distributes_via,
                administers_for, settles_through.
              </p>
              <p className="mt-3 text-[12px] text-muted-foreground">
                {visibleNodes.length} nodes ·{" "}
                {
                  ontologyEdges.filter(
                    (e) =>
                      visibleIds.has(e.source) &&
                      visibleIds.has(e.target) &&
                      e.weight >= filters.minEdgeWeight
                  ).length
                }{" "}
                relationships
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
