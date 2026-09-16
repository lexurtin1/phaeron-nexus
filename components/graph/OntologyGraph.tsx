"use client";

import Graph from "graphology";
import { useEffect, useMemo, useRef, useState } from "react";
import Sigma from "sigma";
import { ontologyEdges, ontologyNodes } from "@/data/mock";
import type { OntologyNode, OntologyNodeType } from "@/data/types";
import { useNexusStore } from "@/lib/store";
import { Badge, Card, Input, Tag } from "@/components/ui";

const NODE_COLOR: Record<OntologyNodeType, string> = {
  core: "#0d2245",
  extension: "#3b82f6",
  domain_pack: "#d97706",
  client: "#1a3a6b",
  recent: "#dc2626",
};

export function OntologyGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<Sigma | null>(null);
  const filters = useNexusStore((s) => s.graphFilters);
  const setGraphFilters = useNexusStore((s) => s.setGraphFilters);
  const [selected, setSelected] = useState<OntologyNode | null>(null);

  const visibleNodes = useMemo(() => {
    return ontologyNodes.filter((n) => {
      if (!filters.showClients && n.type === "client") return false;
      if (!filters.showPacks && n.type === "domain_pack") return false;
      if (filters.versionLayer !== "all" && n.version && !n.version.startsWith(filters.versionLayer))
        return false;
      if (filters.search) {
        return n.label.toLowerCase().includes(filters.search.toLowerCase());
      }
      return true;
    });
  }, [filters]);

  const visibleIds = useMemo(
    () => new Set(visibleNodes.map((n) => n.id)),
    [visibleNodes]
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const graph = new Graph();
    visibleNodes.forEach((n) => {
      graph.addNode(n.id, {
        label: n.label,
        x: n.x ?? Math.random() * 400 - 200,
        y: n.y ?? Math.random() * 400 - 200,
        size: n.type === "domain_pack" ? 10 : n.type === "client" ? 9 : 6 + Math.min(n.relationshipCount / 3, 4),
        color: NODE_COLOR[n.type],
        nodeType: n.type,
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
          size: 0.5 + e.weight,
          color: "rgba(10,22,40,0.18)",
          label: e.label,
        });
      }
    });

    const sigma = new Sigma(graph, containerRef.current, {
      allowInvalidContainer: true,
      renderEdgeLabels: false,
      defaultEdgeColor: "rgba(10,22,40,0.15)",
      labelColor: { color: "#0a1628" },
      labelSize: 11,
      labelFont: "Satoshi, sans-serif",
    });

    sigma.on("clickNode", ({ node }) => {
      const found = ontologyNodes.find((n) => n.id === node) ?? null;
      setSelected(found);
    });

    sigma.on("clickStage", () => setSelected(null));

    // Simple spring settle
    let frame = 0;
    const settle = () => {
      frame += 1;
      graph.forEachNode((node, attrs) => {
        const neighbors = graph.neighbors(node);
        let fx = 0;
        let fy = 0;
        neighbors.forEach((nb) => {
          const nAttrs = graph.getNodeAttributes(nb);
          fx += (nAttrs.x - attrs.x) * 0.02;
          fy += (nAttrs.y - attrs.y) * 0.02;
        });
        // mild centering
        fx += -attrs.x * 0.002;
        fy += -attrs.y * 0.002;
        graph.setNodeAttribute(node, "x", attrs.x + fx);
        graph.setNodeAttribute(node, "y", attrs.y + fy);
      });
      sigma.refresh();
      if (frame < 90) requestAnimationFrame(settle);
    };
    requestAnimationFrame(settle);

    sigmaRef.current = sigma;

    return () => {
      sigma.kill();
      sigmaRef.current = null;
    };
  }, [visibleNodes, visibleIds, filters.minEdgeWeight]);

  return (
    <div className="relative flex min-h-[calc(100vh-72px)] flex-col lg:flex-row">
      <div className="relative min-h-[480px] flex-1">
        <div ref={containerRef} className="absolute inset-0" />
        <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2 rounded-xl border border-[rgba(10,22,40,0.08)] bg-white/85 p-3 shadow-[0_4px_16px_rgba(10,22,40,0.06)] backdrop-blur">
          <label className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-text-secondary)]">
            <input
              type="checkbox"
              checked={filters.showClients}
              onChange={(e) =>
                setGraphFilters({ showClients: e.target.checked })
              }
            />
            Clients
          </label>
          <label className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-text-secondary)]">
            <input
              type="checkbox"
              checked={filters.showPacks}
              onChange={(e) => setGraphFilters({ showPacks: e.target.checked })}
            />
            Domain packs
          </label>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-[var(--color-text-secondary)]">
            Edge ≥
            <input
              type="range"
              min={0.4}
              max={0.95}
              step={0.05}
              value={filters.minEdgeWeight}
              onChange={(e) =>
                setGraphFilters({ minEdgeWeight: Number(e.target.value) })
              }
              className="w-24"
            />
            {filters.minEdgeWeight.toFixed(2)}
          </div>
          <Input
            value={filters.search}
            onChange={(e) => setGraphFilters({ search: e.target.value })}
            placeholder="Search concepts…"
            className="h-8 w-40 text-[12px]"
          />
          <select
            value={filters.versionLayer}
            onChange={(e) => setGraphFilters({ versionLayer: e.target.value })}
            className="h-8 rounded-lg border border-[rgba(10,22,40,0.1)] bg-white px-2 text-[11px] font-semibold"
          >
            <option value="all">All versions</option>
            <option value="4.2">Master 4.2</option>
            <option value="4.1">4.1.x</option>
            <option value="1.">Overlays 1.x</option>
          </select>
        </div>
        <div className="pointer-events-none absolute bottom-4 left-4 z-10 flex gap-3 rounded-lg bg-white/80 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--color-text-muted)] backdrop-blur">
          <span className="flex items-center gap-1.5">
            <i className="h-2 w-2 rounded-full bg-[#0d2245]" /> Core
          </span>
          <span className="flex items-center gap-1.5">
            <i className="h-2 w-2 rounded-full bg-[#3b82f6]" /> Extension
          </span>
          <span className="flex items-center gap-1.5">
            <i className="h-2 w-2 rounded-full bg-[#d97706]" /> Pack
          </span>
          <span className="flex items-center gap-1.5">
            <i className="h-2 w-2 rounded-full bg-[#dc2626]" /> Recent
          </span>
        </div>
      </div>

      <aside className="w-full border-t border-[rgba(10,22,40,0.06)] bg-[rgba(255,255,255,0.72)] p-5 backdrop-blur lg:w-[340px] lg:border-l lg:border-t-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
          Master Ontology
        </p>
        <h1 className="mt-1 font-display text-[32px] leading-tight text-[var(--color-navy-deep)]">
          Concept Network
        </h1>
        <p className="mt-2 text-[13px] text-[var(--color-text-secondary)]">
          Explore the intellectual core of Phaeron — master concepts, domain
          packs, and client overlays.
        </p>

        {selected ? (
          <Card className="mt-5 space-y-3" elevated>
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-display text-[24px] text-[var(--color-navy-deep)]">
                {selected.label}
              </h2>
              <Badge tone={selected.type === "recent" ? "critical" : "navy"}>
                {selected.type.replace("_", " ")}
              </Badge>
            </div>
            <p className="text-[13px] text-[var(--color-text-secondary)]">
              {selected.description}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {selected.version && <Tag>v{selected.version}</Tag>}
              <Tag>{selected.relationshipCount} relationships</Tag>
            </div>
            <p className="text-[12px] text-[var(--color-text-muted)]">
              Connected edges:{" "}
              {ontologyEdges
                .filter(
                  (e) =>
                    e.source === selected.id || e.target === selected.id
                )
                .map((e) => e.label)
                .join(", ") || "—"}
            </p>
          </Card>
        ) : (
          <Card className="mt-5">
            <p className="text-[13px] text-[var(--color-text-muted)]">
              Select a node to inspect its connections, version, and how it
              attaches to client overlays and domain packs.
            </p>
            <p className="mt-3 text-[12px] text-[var(--color-text-faint)]">
              {visibleNodes.length} nodes visible ·{" "}
              {
                ontologyEdges.filter(
                  (e) =>
                    visibleIds.has(e.source) &&
                    visibleIds.has(e.target) &&
                    e.weight >= filters.minEdgeWeight
                ).length
              }{" "}
              edges
            </p>
          </Card>
        )}
      </aside>
    </div>
  );
}
