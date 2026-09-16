"use client";

import dynamic from "next/dynamic";
import { SectionHeader } from "@/components/ui";

const OntologyGraph = dynamic(
  () =>
    import("@/components/graph/OntologyGraph").then((m) => m.OntologyGraph),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[calc(100vh-72px)] items-center justify-center text-[13px] text-[var(--color-text-muted)]">
        Settling ontology network…
      </div>
    ),
  }
);

export default function OntologyPage() {
  return (
    <div>
      <div className="px-5 pt-5 md:px-8">
        <SectionHeader
          eyebrow="Intelligence Layer"
          title="Ontology"
          description="Master concepts, domain packs, and client overlays — the semantic memory behind every Pulse deployment."
          className="mb-0"
        />
      </div>
      <OntologyGraph />
    </div>
  );
}
