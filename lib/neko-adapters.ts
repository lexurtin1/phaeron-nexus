import {
  clients,
  commercialSummary,
  globalKpis,
  incidents,
  ontologyNodes,
} from "@/data/mock";
import type { Client } from "@/data/types";

export type CountryStats = {
  country: string;
  countryName: string;
  continent: string;
  totalUpload: number;
  totalDownload: number;
  totalConnections: number;
  lastSeen?: string;
};

export type StatsSummary = {
  totalUpload: number;
  totalDownload: number;
  totalConnections: number;
  totalDomains: number;
  totalRules: number;
  activeDeployments: number;
  fleetUptime: number;
  openIncidents: number;
  evaluationsPassing: number;
  evaluationsTotal: number;
  pipelineValue: number;
  totalApiCalls24h: number;
};

const COUNTRY_TO_ISO: Record<string, { iso: string; name: string; continent: string }> = {
  UK: { iso: "GB", name: "United Kingdom", continent: "Europe" },
  "United Kingdom": { iso: "GB", name: "United Kingdom", continent: "Europe" },
  Ireland: { iso: "IE", name: "Ireland", continent: "Europe" },
  Luxembourg: { iso: "LU", name: "Luxembourg", continent: "Europe" },
  Belgium: { iso: "BE", name: "Belgium", continent: "Europe" },
  Denmark: { iso: "DK", name: "Denmark", continent: "Europe" },
  France: { iso: "FR", name: "France", continent: "Europe" },
  Germany: { iso: "DE", name: "Germany", continent: "Europe" },
  Netherlands: { iso: "NL", name: "Netherlands", continent: "Europe" },
  Switzerland: { iso: "CH", name: "Switzerland", continent: "Europe" },
  Sweden: { iso: "SE", name: "Sweden", continent: "Europe" },
  USA: { iso: "US", name: "United States", continent: "Americas" },
  "United States": { iso: "US", name: "United States", continent: "Americas" },
  Singapore: { iso: "SG", name: "Singapore", continent: "Asia" },
  Japan: { iso: "JP", name: "Japan", continent: "Asia" },
  Australia: { iso: "AU", name: "Australia", continent: "Oceania" },
};

/** ~1 API call ≈ 48 KB round-trip for map/chart traffic visualization */
const BYTES_PER_API_CALL = 48_000;

export function countryIsoForClient(client: Client): string {
  const mapped = COUNTRY_TO_ISO[client.country];
  return mapped?.iso ?? client.country.slice(0, 2).toUpperCase();
}

export function countryMeta(country: string) {
  return (
    COUNTRY_TO_ISO[country] ?? {
      iso: country.slice(0, 2).toUpperCase(),
      name: country,
      continent: "Europe",
    }
  );
}

export function buildStatsSummary(): StatsSummary {
  const kpis = globalKpis();
  const commercial = commercialSummary();
  const totalApi = clients.reduce((s, c) => s + c.apiCalls24h, 0);
  const totalDownload = Math.round(totalApi * BYTES_PER_API_CALL * 0.62);
  const totalUpload = Math.round(totalApi * BYTES_PER_API_CALL * 0.38);

  return {
    totalUpload,
    totalDownload,
    totalConnections: totalApi,
    totalDomains: ontologyNodes.length,
    totalRules: clients.reduce((s, c) => s + c.domainPacks.length, 0),
    activeDeployments: kpis.activeDeployments,
    fleetUptime: kpis.fleetUptime,
    openIncidents: kpis.openIncidents,
    evaluationsPassing: kpis.evaluationsPassing,
    evaluationsTotal: kpis.evaluationsTotal,
    pipelineValue: commercial.totalOpen,
    totalApiCalls24h: totalApi,
  };
}

export function buildCountryStats(): CountryStats[] {
  const byIso = new Map<
    string,
    {
      meta: ReturnType<typeof countryMeta>;
      download: number;
      upload: number;
      connections: number;
    }
  >();

  for (const client of clients) {
    const meta = countryMeta(client.country);
    const existing = byIso.get(meta.iso) ?? {
      meta,
      download: 0,
      upload: 0,
      connections: 0,
    };
    const traffic = client.apiCalls24h * BYTES_PER_API_CALL;
    existing.download += Math.round(traffic * 0.62);
    existing.upload += Math.round(traffic * 0.38);
    existing.connections += client.apiCalls24h;
    byIso.set(meta.iso, existing);
  }

  return Array.from(byIso.entries())
    .map(([iso, row]) => ({
      country: iso,
      countryName: row.meta.name,
      continent: row.meta.continent,
      totalDownload: row.download,
      totalUpload: row.upload,
      totalConnections: row.connections,
    }))
    .sort(
      (a, b) =>
        b.totalDownload + b.totalUpload - (a.totalDownload + a.totalUpload)
    );
}

export function clientsForCountryIso(iso: string): Client[] {
  return clients.filter((c) => countryIsoForClient(c) === iso);
}

export function fleetStatus(): "healthy" | "unhealthy" | "degraded" {
  const critical = incidents.some(
    (i) => i.severity === "critical" && i.status !== "resolved"
  );
  if (critical) return "unhealthy";
  if (incidents.some((i) => i.status !== "resolved")) return "degraded";
  return "healthy";
}

export const COUNTRY_NAME_MAPPING: Record<string, string> = {
  US: "United States of America",
  CN: "China",
  JP: "Japan",
  SG: "Singapore",
  HK: "Hong Kong",
  TW: "Taiwan",
  KR: "South Korea",
  GB: "United Kingdom",
  DE: "Germany",
  FR: "France",
  NL: "Netherlands",
  CA: "Canada",
  AU: "Australia",
  IN: "India",
  BR: "Brazil",
  RU: "Russia",
  SE: "Sweden",
  CH: "Switzerland",
  IL: "Israel",
  IE: "Ireland",
  LU: "Luxembourg",
  BE: "Belgium",
  DK: "Denmark",
};
