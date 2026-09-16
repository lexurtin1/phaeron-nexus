import type {
  Client,
  ClientMeeting,
  ClientNewsItem,
  PricingTier,
} from "@/data/types";

export type ClientIntel = {
  pricingTier: PricingTier;
  products: string[];
  lastMeeting: ClientMeeting;
  nextMeeting: ClientMeeting;
  news: ClientNewsItem[];
  mrr: number;
  ytdRevenue: number;
};

const PRODUCTS = {
  pulse: "Phaeron Pulse Runtime",
  graph: "GraphRAG Ontology",
  evals: "Evaluation Suite",
  hub: "Control Plane Hub",
  packs: "Domain Packs",
} as const;

function intel(
  tier: PricingTier,
  products: string[],
  last: ClientMeeting,
  next: ClientMeeting,
  news: ClientNewsItem[],
  arr: number
): ClientIntel {
  return {
    pricingTier: tier,
    products,
    lastMeeting: last,
    nextMeeting: next,
    news,
    mrr: Math.round(arr / 12),
    ytdRevenue: Math.round(arr * 0.74),
  };
}

/** Per-account commercial + news enrichment for dossiers */
export const CLIENT_INTEL: Record<string, ClientIntel> = {
  "cli-bravura": intel(
    "Strategic",
    [PRODUCTS.pulse, PRODUCTS.graph, PRODUCTS.evals, PRODUCTS.hub, PRODUCTS.packs],
    {
      title: "Q4 ramp & TA expansion",
      date: "2026-09-12T14:00:00Z",
      attendees: ["Alex Curtin", "Juliet Dearlove", "Marcus Hale"],
      location: "London · Hybrid",
    },
    {
      title: "Executive business review",
      date: "2026-09-24T10:00:00Z",
      attendees: ["Alex Curtin", "Juliet Dearlove"],
      location: "Bravura HQ · London",
    },
    [
      {
        title: "Bravura wins multi-year TA mandate with European platform",
        source: "Funds Europe",
        date: "2026-09-08",
        summary: "Transfer-agency capacity expansion across UK and APAC hubs.",
      },
      {
        title: "Digital investor servicing remains a 2026 priority for TA providers",
        source: "Ignites Europe",
        date: "2026-08-28",
        summary: "Industry brief naming Bravura among active modernisation programmes.",
      },
    ],
    680000
  ),
  "cli-broadridge": intel(
    "Enterprise",
    [PRODUCTS.pulse, PRODUCTS.graph, PRODUCTS.evals, PRODUCTS.packs],
    {
      title: "Ops readiness review",
      date: "2026-09-10T15:30:00Z",
      attendees: ["R. Okonjo", "Priya Shah"],
      location: "London",
    },
    {
      title: "Phase 2 investor communications scope",
      date: "2026-09-22T11:00:00Z",
      attendees: ["R. Okonjo", "Dan Okafor"],
      location: "Virtual",
    },
    [
      {
        title: "Broadridge deepens European fund communications footprint",
        source: "Global Custodian",
        date: "2026-09-02",
        summary: "Continued investment in UK and Luxembourg processing rails.",
      },
    ],
    540000
  ),
  "cli-linedata": intel(
    "Enterprise",
    [PRODUCTS.pulse, PRODUCTS.graph, PRODUCTS.evals, PRODUCTS.hub],
    {
      title: "Alternatives pack demo",
      date: "2026-09-09T09:00:00Z",
      attendees: ["M. Chen", "Aoife Byrne", "Tom Walsh"],
      location: "Dublin",
    },
    {
      title: "Phase 2 commercial close",
      date: "2026-09-19T13:00:00Z",
      attendees: ["M. Chen", "Aoife Byrne"],
      location: "Virtual",
    },
    [
      {
        title: "Linedata focuses on alternatives ops modernisation",
        source: "Hedgeweek",
        date: "2026-08-21",
        summary: "Product roadmap emphasises private markets workflows.",
      },
    ],
    490000
  ),
  "cli-allfunds": intel(
    "Strategic",
    [PRODUCTS.pulse, PRODUCTS.graph, PRODUCTS.hub, PRODUCTS.packs],
    {
      title: "Distribution ontology sync",
      date: "2026-09-11T16:00:00Z",
      attendees: ["Alex Curtin", "Elena Ruiz"],
      location: "Luxembourg",
    },
    {
      title: "EMEA platform steering",
      date: "2026-09-26T10:30:00Z",
      attendees: ["Alex Curtin", "Lars Weber"],
      location: "Virtual",
    },
    [
      {
        title: "Allfunds continues European wealth platform expansion",
        source: "Funds Europe",
        date: "2026-09-05",
        summary: "Distribution network growth across Iberia and Benelux.",
      },
    ],
    455000
  ),
  "cli-apex": intel(
    "Growth",
    [PRODUCTS.pulse, PRODUCTS.evals, PRODUCTS.packs],
    {
      title: "Incident post-mortem follow-up",
      date: "2026-09-13T11:00:00Z",
      attendees: ["M. Chen", "Erik Holm"],
      location: "Virtual",
    },
    {
      title: "Stabilisation checkpoint",
      date: "2026-09-20T15:00:00Z",
      attendees: ["M. Chen", "Claire Dubois"],
      location: "Luxembourg",
    },
    [
      {
        title: "Apex Group scales fund admin technology stack",
        source: "International Investment",
        date: "2026-08-30",
        summary: "Focus on private markets servicing capacity in Luxembourg.",
      },
    ],
    380000
  ),
  "cli-clearstream": intel(
    "Enterprise",
    [PRODUCTS.pulse, PRODUCTS.graph, PRODUCTS.hub],
    {
      title: "Settlement ontology workshop",
      date: "2026-09-08T10:00:00Z",
      attendees: ["Alex Curtin", "Isabelle Moreau"],
      location: "Luxembourg",
    },
    {
      title: "Q4 roadmap alignment",
      date: "2026-09-29T09:30:00Z",
      attendees: ["Alex Curtin", "Isabelle Moreau"],
      location: "Virtual",
    },
    [
      {
        title: "Clearstream advances fund settlement digitalisation",
        source: "Global Custodian",
        date: "2026-09-01",
        summary: "ICSDs investing in messaging and data quality programmes.",
      },
    ],
    410000
  ),
  "cli-euroclear": intel(
    "Growth",
    [PRODUCTS.pulse, PRODUCTS.graph, PRODUCTS.evals],
    {
      title: "Bootstrap readiness",
      date: "2026-09-07T14:00:00Z",
      attendees: ["J. Rivera", "Sofie Peeters"],
      location: "Brussels",
    },
    {
      title: "Go-live criteria review",
      date: "2026-09-23T11:00:00Z",
      attendees: ["J. Rivera", "Pieter Janssen"],
      location: "Virtual",
    },
    [
      {
        title: "Euroclear outlines post-trade innovation priorities",
        source: "The Trade",
        date: "2026-08-19",
        summary: "Automation and data interoperability remain centre stage.",
      },
    ],
    320000
  ),
  "cli-fundsquare": intel(
    "Pilot",
    [PRODUCTS.pulse, PRODUCTS.evals],
    {
      title: "Pilot kickoff",
      date: "2026-09-04T10:00:00Z",
      attendees: ["Alex Curtin", "Marc Schmit"],
      location: "Luxembourg",
    },
    {
      title: "Pilot midpoint review",
      date: "2026-09-21T14:00:00Z",
      attendees: ["Alex Curtin", "Marc Schmit"],
      location: "Virtual",
    },
    [
      {
        title: "Fund data platforms compete on disclosure quality",
        source: "Funds Europe",
        date: "2026-08-14",
        summary: "Market note on Luxembourg fund data utilities.",
      },
    ],
    95000
  ),
  "cli-northerntrust": intel(
    "Strategic",
    [PRODUCTS.pulse, PRODUCTS.graph, PRODUCTS.evals, PRODUCTS.hub, PRODUCTS.packs],
    {
      title: "Custody GraphRAG deep-dive",
      date: "2026-09-14T13:00:00Z",
      attendees: ["Alex Curtin", "Helen Carter", "James Park"],
      location: "London",
    },
    {
      title: "Quarterly executive sync",
      date: "2026-09-30T15:00:00Z",
      attendees: ["Alex Curtin", "Helen Carter"],
      location: "London",
    },
    [
      {
        title: "Northern Trust invests in asset servicing intelligence",
        source: "Financial Times",
        date: "2026-09-03",
        summary: "Banks prioritise AI-assisted servicing workflows in EMEA.",
      },
    ],
    520000
  ),
  "cli-statestreet": intel(
    "Growth",
    [PRODUCTS.pulse, PRODUCTS.graph, PRODUCTS.evals],
    {
      title: "Critical incident bridge",
      date: "2026-09-15T08:30:00Z",
      attendees: ["M. Chen", "Ava Brooks", "David Kwon"],
      location: "Virtual",
    },
    {
      title: "Stabilisation & commercial reset",
      date: "2026-09-18T16:00:00Z",
      attendees: ["Alex Curtin", "David Kwon"],
      location: "London",
    },
    [
      {
        title: "State Street Alpha continues European platform push",
        source: "Water Technologies",
        date: "2026-08-25",
        summary: "Front-to-back platform competition intensifies in EMEA.",
      },
    ],
    295000
  ),
  "cli-sei": intel(
    "Enterprise",
    [PRODUCTS.pulse, PRODUCTS.evals, PRODUCTS.packs],
    {
      title: "TA workflow walkthrough",
      date: "2026-09-06T11:00:00Z",
      attendees: ["M. Chen", "Niamh Cullen"],
      location: "Dublin",
    },
    {
      title: "Expansion scoping",
      date: "2026-09-25T10:00:00Z",
      attendees: ["M. Chen", "Niamh Cullen"],
      location: "Virtual",
    },
    [
      {
        title: "SEI expands outsourcing relationships in Ireland",
        source: "Irish Independent Business",
        date: "2026-08-18",
        summary: "Fund admin and investor servicing demand remains firm.",
      },
    ],
    360000
  ),
  "cli-fis": intel(
    "Growth",
    [PRODUCTS.pulse, PRODUCTS.graph, PRODUCTS.packs],
    {
      title: "Distribution pack discovery",
      date: "2026-09-05T15:00:00Z",
      attendees: ["R. Okonjo", "Oliver Grant"],
      location: "London",
    },
    {
      title: "Technical architecture review",
      date: "2026-09-27T09:00:00Z",
      attendees: ["R. Okonjo", "Mia Cross"],
      location: "Virtual",
    },
    [
      {
        title: "FIS highlights fund distribution modernisation",
        source: "Finextra",
        date: "2026-08-22",
        summary: "Vendors race to connect distributors and manufacturers.",
      },
    ],
    275000
  ),
  "cli-citi": intel(
    "Pilot",
    [PRODUCTS.pulse, PRODUCTS.evals],
    {
      title: "Evaluation kickoff",
      date: "2026-09-03T12:00:00Z",
      attendees: ["J. Rivera", "Rachel Stein"],
      location: "London",
    },
    {
      title: "Pilot success criteria",
      date: "2026-09-28T14:30:00Z",
      attendees: ["J. Rivera", "Rachel Stein"],
      location: "Virtual",
    },
    [
      {
        title: "Custody banks trial generative AI in investor services",
        source: "Risk.net",
        date: "2026-09-01",
        summary: "Early programmes focus on retrieval quality and controls.",
      },
    ],
    120000
  ),
  "cli-jpm": intel(
    "Enterprise",
    [PRODUCTS.pulse, PRODUCTS.graph, PRODUCTS.evals, PRODUCTS.hub],
    {
      title: "Alternatives servicing workshop",
      date: "2026-09-11T09:30:00Z",
      attendees: ["J. Rivera", "Wei Lin", "Amira Yusuf"],
      location: "Luxembourg",
    },
    {
      title: "Commercial renewal prep",
      date: "2026-09-30T11:00:00Z",
      attendees: ["J. Rivera", "Wei Lin"],
      location: "Virtual",
    },
    [
      {
        title: "J.P. Morgan Fund Services builds out Luxembourg capacity",
        source: "Private Equity International",
        date: "2026-08-27",
        summary: "Alternatives administration remains a growth corridor.",
      },
    ],
    340000
  ),
  "cli-simcorp": intel(
    "Enterprise",
    [PRODUCTS.pulse, PRODUCTS.graph, PRODUCTS.evals, PRODUCTS.packs],
    {
      title: "Nordics deployment design",
      date: "2026-09-10T10:00:00Z",
      attendees: ["Alex Curtin", "Mette Larsen"],
      location: "Copenhagen",
    },
    {
      title: "Investment book of record integration",
      date: "2026-09-25T13:00:00Z",
      attendees: ["Alex Curtin", "Mette Larsen", "Jonas Berg"],
      location: "Virtual",
    },
    [
      {
        title: "SimCorp Dimension clients push for AI-assisted ops",
        source: "WatersTechnology",
        date: "2026-09-04",
        summary: "Buy-side platforms seek tighter ontology-backed workflows.",
      },
    ],
    410000
  ),
  "cli-caceis": intel(
    "Growth",
    [PRODUCTS.pulse, PRODUCTS.graph, PRODUCTS.hub],
    {
      title: "Paris hub onboarding",
      date: "2026-09-09T14:00:00Z",
      attendees: ["M. Chen", "Camille Dupont"],
      location: "Paris",
    },
    {
      title: "Custody data quality review",
      date: "2026-09-22T10:00:00Z",
      attendees: ["M. Chen", "Camille Dupont"],
      location: "Virtual",
    },
    [
      {
        title: "CACEIS accelerates European asset servicing integration",
        source: "Funds Europe",
        date: "2026-08-29",
        summary: "French custody franchise continues pan-European consolidation.",
      },
    ],
    365000
  ),
  "cli-universal": intel(
    "Growth",
    [PRODUCTS.pulse, PRODUCTS.evals, PRODUCTS.packs],
    {
      title: "Frankfurt runtime pilot",
      date: "2026-09-08T11:30:00Z",
      attendees: ["R. Okonjo", "Hans Mueller"],
      location: "Frankfurt",
    },
    {
      title: "ManCo ops steering",
      date: "2026-09-24T15:00:00Z",
      attendees: ["R. Okonjo", "Hans Mueller"],
      location: "Virtual",
    },
    [
      {
        title: "German ManCos invest in digital fund platforms",
        source: "Börsen-Zeitung",
        date: "2026-09-02",
        summary: "Universal Investment among groups modernising servicing stacks.",
      },
    ],
    288000
  ),
  "cli-ortec": intel(
    "Pilot",
    [PRODUCTS.pulse, PRODUCTS.evals],
    {
      title: "Amsterdam evaluation workshop",
      date: "2026-09-05T09:00:00Z",
      attendees: ["Alex Curtin", "Sanne de Vries"],
      location: "Amsterdam",
    },
    {
      title: "Pilot commercial options",
      date: "2026-09-26T11:30:00Z",
      attendees: ["Alex Curtin", "Sanne de Vries"],
      location: "Virtual",
    },
    [
      {
        title: "Dutch fintechs deepen institutional analytics offerings",
        source: "NL Times Business",
        date: "2026-08-20",
        summary: "Ortec Finance cited in buy-side risk and reporting tooling.",
      },
    ],
    145000
  ),
  "cli-fe-fundinfo": intel(
    "Enterprise",
    [PRODUCTS.pulse, PRODUCTS.graph, PRODUCTS.packs],
    {
      title: "Fund data ontology mapping",
      date: "2026-09-12T10:00:00Z",
      attendees: ["M. Chen", "Lukas Meier"],
      location: "Zurich",
    },
    {
      title: "EMEA data pack roadmap",
      date: "2026-09-29T14:00:00Z",
      attendees: ["M. Chen", "Lukas Meier"],
      location: "Virtual",
    },
    [
      {
        title: "FE fundinfo expands European disclosure coverage",
        source: "Funds Europe",
        date: "2026-09-06",
        summary: "Data vendors race to support cross-border distribution files.",
      },
    ],
    395000
  ),
};

export function resolveClientIntel(client: Client): ClientIntel {
  const existing = CLIENT_INTEL[client.id];
  if (existing) return existing;
  return intel(
    client.arr >= 500000
      ? "Strategic"
      : client.arr >= 350000
        ? "Enterprise"
        : client.arr > 0
          ? "Growth"
          : "Pilot",
    ["Phaeron Pulse Runtime", "Evaluation Suite"],
    {
      title: "Account check-in",
      date: client.lastCommercialContact,
      attendees: [client.accountOwner, client.contacts[0]?.name].filter(Boolean) as string[],
      location: client.city,
    },
    {
      title: "Next commercial sync",
      date: "2026-09-30T10:00:00Z",
      attendees: [client.accountOwner],
      location: "Virtual",
    },
    [
      {
        title: `${client.name} continues funds-industry technology investment`,
        source: "Industry Brief",
        date: "2026-09-01",
        summary: `Operational modernisation remains active for ${client.industry.toLowerCase()} firms.`,
      },
    ],
    client.arr || 100000
  );
}
