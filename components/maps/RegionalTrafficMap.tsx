"use client";

import { useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { Globe, Info } from "lucide-react";
import { clients } from "@/data/mock";
import { formatNumber } from "@/lib/utils";

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
};

const MAP_THEME = {
  noData: "#e8eef5",
  stroke: "rgba(10, 22, 40, 0.12)",
  scale: ["#c5d0e0", "#2a4060", "#0a1628", "#e11d48"],
};

type RegionStat = {
  country: string;
  countryName: string;
  deployments: number;
  apiCalls: number;
  uptime: number;
};

function countryCodeForClient(city: string, country: string): string {
  if (country === "UK" || city === "London") return "GB";
  if (country === "Ireland" || city === "Dublin") return "IE";
  if (country === "Luxembourg") return "LU";
  if (country === "Belgium" || city === "Brussels") return "BE";
  if (country === "USA" || city === "New York") return "US";
  if (country === "Singapore") return "SG";
  if (country === "Australia" || city === "Sydney") return "AU";
  return "GB";
}

export function RegionalTrafficMap({ compact = false }: { compact?: boolean }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    name: string;
    deployments: number;
    apiCalls: number;
    uptime: number;
  } | null>(null);

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

  const getFill = (geo: {
    properties: { name: string; ISO_A2?: string; iso_a2?: string };
  }) => {
    const iso = geo.properties.ISO_A2 || geo.properties.iso_a2;
    const data =
      countryMap.get(geo.properties.name) ||
      (iso ? countryMap.get(iso) : undefined);
    if (!data) return MAP_THEME.noData;
    return colorScale(data.apiCalls);
  };

  const top = [...regionStats]
    .sort((a, b) => b.apiCalls - a.apiCalls)
    .slice(0, 5);

  return (
    <div className="flex h-full flex-col rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-[0_1px_2px_rgba(10,22,40,0.04)]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-[#0a1628]">
          <Globe className="h-4 w-4 text-[#0a1628]" />
          Global deployment traffic
        </h3>
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#64748b]">
          Management map
        </span>
      </div>

      <div
        className={`relative w-full overflow-hidden rounded-lg bg-[#f4f6f9] ${
          compact ? "aspect-[4/3] min-h-[280px] flex-1" : "aspect-[2/1]"
        }`}
      >
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 145, center: [5, 42] }}
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getFill(geo)}
                    stroke={MAP_THEME.stroke}
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none", transition: "all 200ms" },
                      hover: {
                        fill:
                          hovered === geo.properties.name
                            ? "#e11d48"
                            : undefined,
                        outline: "none",
                        cursor: "pointer",
                      },
                      pressed: { outline: "none" },
                    }}
                    onMouseEnter={(event) => {
                      const iso =
                        geo.properties.ISO_A2 || geo.properties.iso_a2;
                      const data =
                        countryMap.get(geo.properties.name) ||
                        (iso ? countryMap.get(iso) : undefined);
                      if (!data) return;
                      setHovered(geo.properties.name);
                      setTooltip({
                        name: data.countryName,
                        deployments: data.deployments,
                        apiCalls: data.apiCalls,
                        uptime: data.uptime,
                      });
                      void event;
                    }}
                    onMouseLeave={() => {
                      setHovered(null);
                      setTooltip(null);
                    }}
                  />
                ))
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {tooltip && (
          <div className="pointer-events-none absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-lg border border-[#e2e8f0] bg-white/95 px-3 py-2 shadow-lg">
            <p className="text-sm font-semibold text-[#0a1628]">
              {tooltip.name}
            </p>
            <div className="mt-1 space-y-0.5 text-[11px] text-[#64748b]">
              <p>
                Deployments:{" "}
                <span className="font-semibold text-[#0a1628]">
                  {tooltip.deployments}
                </span>
              </p>
              <p>
                API 24h:{" "}
                <span className="font-semibold text-[#0a1628]">
                  {formatNumber(tooltip.apiCalls)}
                </span>
              </p>
              <p>
                Uptime:{" "}
                <span className="font-semibold text-[#059669]">
                  {tooltip.uptime.toFixed(2)}%
                </span>
              </p>
            </div>
          </div>
        )}

        <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-white/90 px-2 py-1 text-[10px] text-[#64748b] shadow-sm">
          <Info className="h-3 w-3" />
          Hover a country for deployment load
        </div>
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
            <span key={r.country}>
              <span className="text-[#64748b]">{r.countryName.split(" ")[0]}</span>{" "}
              <span className="font-semibold text-[#0a1628]">
                {formatNumber(r.apiCalls)}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
