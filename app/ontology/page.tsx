"use client";

import dynamic from "next/dynamic";

const OntologyGraph = dynamic(
  () =>
    import("@/components/graph/OntologyGraph").then((m) => m.OntologyGraph),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-[#e2e8f0] bg-white text-[13px] text-[#6b7280]">
        Settling GraphRAG network…
      </div>
    ),
  }
);

export default function OntologyPage() {
  return <OntologyGraph />;
}
