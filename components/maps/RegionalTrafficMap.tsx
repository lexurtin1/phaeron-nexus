"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { AnimatePresence, motion } from "framer-motion";
import { Globe, Info, X } from "lucide-react";
import { clients } from "@/data/mock";
import type { Client } from "@/data/types";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  healthLabel,
} from "@/lib/utils";
import { HealthDot } from "@/components/ui";

const GEO_URL = "/topojson/countries-110m.json";

const COUNTRY_NAME_MAPPING: Record<string, string> = {
  GB: "United Kingdom",
  IE: "Ireland",
  LU: "Luxembourg",
  BE: "Belgium",
  US: "United States of America",
  SG: "Singapore",
  AU: "Australia",
  DE: "Germany",
  FR: "France",
  NL: "Netherlands",
  DK: "Denmark",
  CH: "Switzerland",
};

const MAP_THEME = {
  noData: "#e8eef5",
  stroke: "rgba(10, 22, 40, 0.14)",
  scale: ["#c5d0e0", "#2a4060", "#0a1628", "#e11d48"],
};

export function countryCodeForClient(city: string, country: string): string {
  if (country === "UK" || city === "London" || city === "Edinburgh") return "GB";
  if (country === "Ireland" || city === "Dublin") return "IE";
  if (country === "Luxembourg") return "LU";
  if (country === "Belgium" || city === "Brussels") return "BE";
  if (country === "USA" || city === "New York") return "US";
  if (country === "Singapore") return "SG";
  if (country === "Australia" || city === "Sydney") return "AU";
  if (country === "Germany" || city === "Frankfurt") return "DE";
  if (country === "France" || city === "Paris") return "FR";
  if (country === "Netherlands" || city === "Amsterdam") return "NL";
  if (country === "Denmark" || city === "Copenhagen") return "DK";
  if (country === "Switzerland" || city === "Zurich") return "CH";
  return "GB";
}

type RegionStat = {
  country: string;
  countryName: string;
  deployments: number;
  apiCalls: number;
  uptime: number;
};

export function RegionalTrafficMap({ compact = false }: { compact?: boolean }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const regionStats: RegionStat[] = useMemo(() => {
    const map = new Map<string, RegionStat>();
    clients.forEach((c) => {
      const code = countryCodeForClient(c.city, c.country);
      const existing = map.get(code);
      if (existing) {
        existing.deployments += 1;
        existing.apiCalls += c.apiCalls24h;
        existing.uptime =
          (existing.uptime * (existing.deployments - 1) + c.uptime) /
          existing.deployments;
      } else {
        map.set(code, {
          country: code,
          countryName: COUNTRY_NAME_MAPPING[code] ?? c.country,
          deployments: 1,
          apiCalls: c.apiCalls24h,
          uptime: c.uptime,
        });
      }
    });
    return Array.from(map.values());
  }, []);

  const maxTraffic = useMemo(
    () => Math.max(...regionStats.map((r) => r.apiCalls), 1),
    [regionStats]
  );

  const colorScale = useMemo(
    () =>
      scaleLinear<string>()
        .domain([0, maxTraffic * 0.15, maxTraffic * 0.5, maxTraffic])
        .range([...MAP_THEME.scale]),
    [maxTraffic]
  );

  const countryMap = useMemo(() => {
    const m = new Map<string, RegionStat>();
    regionStats.forEach((r) => {
      m.set(r.country, r);
      m.set(r.countryName, r);
    });
    return m;
  }, [regionStats]);

  const selectedClients: Client[] = useMemo(() => {
    if (!selectedCode) return [];
    return clients.filter(
      (c) => countryCodeForClient(c.city, c.country) === selectedCode
    );
  }, [selectedCode]);

  const selectedStat = selectedCode
    ? regionStats.find((r) => r.country === selectedCode)
    : null;

  const getFill = (geo: {
    properties: { name: string; ISO_A2?: string; iso_a2?: string };
  }) => {
    const iso = geo.properties.ISO_A2 || geo.properties.iso_a2;
    const data =
      countryMap.get(geo.properties.name) ||
      (iso ? countryMap.get(iso) : undefined);
    if (!data) return MAP_THEME.noData;
    if (selectedCode && data.country === selectedCode) return "#e11d48";
    return colorScale(data.apiCalls);
  };

  const resolveCode = (geo: {
    properties: { name: string; ISO_A2?: string; iso_a2?: string };
  }) => {
    const iso = geo.properties.ISO_A2 || geo.properties.iso_a2;
    const data =
      countryMap.get(geo.properties.name) ||
      (iso ? countryMap.get(iso) : undefined);
    return data?.country ?? null;
  };

  const top = [...regionStats]
    .sort((a, b) => b.apiCalls - a.apiCalls)
    .slice(0, 6);

  return (
    <div className="flex h-full flex-col rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-[0_1px_2px_rgba(10,22,40,0.04)]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-[#0a1628]">
          <Globe className="h-4 w-4 text-[#0a1628]" />
          Global deployment traffic
        </h3>
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#64748b]">
          Europe focus · click country
        </span>
      </div>

      <div
        className={`relative w-full overflow-hidden rounded-lg bg-[#f4f6f9] ${
          compact ? "aspect-[4/3] min-h-[280px] flex-1" : "aspect-[2/1]"
        }`}
      >
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 820, center: [8, 52] }}
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup center={[8, 52] as [number, number]} zoom={1} minZoom={1} maxZoom={4}>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const code = resolveCode(geo);
                  const hasData = Boolean(code);
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={getFill(geo)}
                      stroke={MAP_THEME.stroke}
                      strokeWidth={0.6}
                      style={{
                        default: { outline: "none", transition: "all 200ms" },
                        hover: {
                          fill: hasData ? "#e11d48" : undefined,
                          outline: "none",
                          cursor: hasData ? "pointer" : "default",
                        },
                        pressed: { outline: "none" },
                      }}
                      onMouseEnter={() => {
                        if (!hasData || !code) return;
                        setHovered(geo.properties.name);
                      }}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => {
                        if (!code) return;
                        setSelectedCode(code);
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {hovered && !selectedCode && (
          <div className="pointer-events-none absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-lg border border-[#e2e8f0] bg-white/95 px-3 py-1.5 text-[12px] font-semibold text-[#0a1628] shadow-lg">
            {hovered}
          </div>
        )}

        <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-white/90 px-2 py-1 text-[10px] text-[#64748b] shadow-sm">
          <Info className="h-3 w-3" />
          Click a country to inspect live clients
        </div>

        <AnimatePresence>
          {selectedCode && selectedStat && (
            <motion.div
              key={selectedCode}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="absolute inset-2 z-20 overflow-hidden rounded-xl border border-[#e2e8f0] bg-white/97 shadow-[0_12px_40px_rgba(10,22,40,0.16)] backdrop-blur"
            >
              <div className="flex items-start justify-between border-b border-[#e2e8f0] px-4 py-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#e11d48]">
                    Live country · {selectedStat.country}
                  </p>
                  <h4 className="text-lg font-semibold text-[#0a1628]">
                    {selectedStat.countryName}
                  </h4>
                  <p className="text-[12px] text-[#64748b]">
                    {selectedStat.deployments} clients ·{" "}
                    {formatNumber(selectedStat.apiCalls)} API / 24h ·{" "}
                    {selectedStat.uptime.toFixed(2)}% uptime
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCode(null)}
                  className="rounded-lg border border-[#e2e8f0] p-1.5 text-[#64748b] hover:text-[#0a1628]"
                  aria-label="Close country panel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ul className="max-h-[calc(100%-72px)] space-y-2 overflow-y-auto p-3">
                {selectedClients.map((c, i) => (
                  <motion.li
                    key={c.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                  >
                    <Link
                      href={`/clients/${c.id}`}
                      className="block rounded-xl border border-[#e2e8f0] bg-[#f4f6f9]/80 px-3 py-2.5 transition hover:border-[#0a1628]/25 hover:bg-white"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <HealthDot status={c.health} />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#0a1628]">
                              {c.name}
                            </p>
                            <p className="truncate text-[11px] text-[#64748b]">
                              {c.city} · {healthLabel(c.health)} ·{" "}
                              {formatNumber(c.apiCalls24h)} calls
                            </p>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-semibold tabular-nums text-[#0a1628]">
                            {c.arr
                              ? formatCurrency(c.arr, true)
                              : "Pilot"}
                          </p>
                          <p className="text-[10px] text-[#64748b]">
                            {formatPercent(c.uptime)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[10px] text-[#64748b]">
          <span>Traffic</span>
          <div
            className="h-2 w-24 rounded-full"
            style={{
              background: `linear-gradient(90deg, ${MAP_THEME.scale.join(",")})`,
            }}
          />
          <span>High</span>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#334155]">
          {top.map((r) => (
            <button
              key={r.country}
              type="button"
              onClick={() => setSelectedCode(r.country)}
              className="hover:text-[#e11d48]"
            >
              <span className="text-[#64748b]">{r.countryName.split(" ")[0]}</span>{" "}
              <span className="font-semibold text-[#0a1628]">
                {formatNumber(r.apiCalls)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
