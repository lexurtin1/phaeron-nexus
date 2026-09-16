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
import { useTheme } from "next-themes";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { formatBytes, formatNumber } from "@/lib/utils";
import {
  COUNTRY_NAME_MAPPING,
  type CountryStats,
} from "@/lib/neko-adapters";

interface WorldTrafficMapProps {
  data: CountryStats[];
  onCountryClick?: (iso: string) => void;
}

const GEO_URL = "/topojson/countries-110m.json";

const MAP_THEME = {
  light: {
    noData: "#f1f5f9",
    stroke: "#cbd5e1",
    scale: ["#e0e7ff", "#818cf8", "#6366f1", "#4f46e5"],
  },
  dark: {
    noData: "#1e2536",
    stroke: "rgba(148, 163, 184, 0.18)",
    scale: ["#312e81", "#4f46e5", "#818cf8", "#c7d2fe"],
  },
} as const;

export function WorldTrafficMap({ data, onCountryClick }: WorldTrafficMapProps) {
  const { resolvedTheme } = useTheme();
  const mapTheme = resolvedTheme === "dark" ? MAP_THEME.dark : MAP_THEME.light;
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [tooltipData, setTooltipData] = useState<{
    country: string;
    traffic: number;
    download: number;
    upload: number;
    connections: number;
  } | null>(null);

  const maxTraffic = useMemo(() => {
    if (!data || data.length === 0) return 1;
    return Math.max(...data.map((d) => d.totalDownload + d.totalUpload));
  }, [data]);

  const colorScale = useMemo(() => {
    return scaleLinear<string>()
      .domain([0, maxTraffic * 0.1, maxTraffic * 0.5, maxTraffic])
      .range([...mapTheme.scale]);
  }, [maxTraffic, mapTheme]);

  const countryMap = useMemo(() => {
    const map = new Map<string, CountryStats>();
    data.forEach((country) => {
      map.set(country.country, country);
      const fullName = COUNTRY_NAME_MAPPING[country.country];
      if (fullName) map.set(fullName, country);
      map.set(country.countryName, country);
    });
    return map;
  }, [data]);

  const resolveCountry = (geo: { properties: Record<string, string> }) => {
    const geoName = geo.properties.name;
    const isoCode = geo.properties.ISO_A2 || geo.properties.iso_a2;
    return countryMap.get(isoCode) ?? countryMap.get(geoName) ?? null;
  };

  const getFillColor = (geo: { properties: Record<string, string> }) => {
    const countryData = resolveCountry(geo);
    if (countryData) {
      const traffic = countryData.totalDownload + countryData.totalUpload;
      return colorScale(traffic);
    }
    return mapTheme.noData;
  };

  const handleMouseEnter = (geo: { properties: Record<string, string> }) => {
    const countryData = resolveCountry(geo);
    if (countryData) {
      setTooltipData({
        country: countryData.countryName,
        traffic: countryData.totalDownload + countryData.totalUpload,
        download: countryData.totalDownload,
        upload: countryData.totalUpload,
        connections: countryData.totalConnections,
      });
      setHoveredCountry(geo.properties.name);
    }
  };

  const topCountries = useMemo(() => {
    return [...data]
      .sort(
        (a, b) =>
          b.totalDownload + b.totalUpload - (a.totalDownload + a.totalUpload)
      )
      .slice(0, 5);
  }, [data]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Globe className="h-5 w-5 text-primary" />
          API traffic by country
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-[2/1] w-full overflow-hidden rounded-lg bg-slate-50 dark:bg-slate-900/50">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 150,
              center: [0, 40],
            }}
            style={{ width: "100%", height: "100%" }}
          >
            <ZoomableGroup>
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={getFillColor(geo)}
                      stroke={mapTheme.stroke}
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none", transition: "all 250ms" },
                        hover: {
                          fill:
                            hoveredCountry === geo.properties.name
                              ? "#f59e0b"
                              : undefined,
                          outline: "none",
                          cursor: "pointer",
                        },
                        pressed: { outline: "none" },
                      }}
                      onMouseEnter={() => handleMouseEnter(geo)}
                      onMouseLeave={() => {
                        setHoveredCountry(null);
                        setTooltipData(null);
                      }}
                      onClick={() => {
                        const country = resolveCountry(geo);
                        if (country && onCountryClick) {
                          onCountryClick(country.country);
                        }
                      }}
                    />
                  ))
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>

          {tooltipData && (
            <div className="pointer-events-none absolute left-1/2 top-5 z-50 -translate-x-1/2">
              <div className="glass-card min-w-[200px] rounded-lg border px-4 py-3 shadow-lg">
                <p className="mb-2 text-sm font-semibold">
                  {tooltipData.country}
                </p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-medium">
                      {formatBytes(tooltipData.traffic)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-blue-500">↓ Download:</span>
                    <span>{formatBytes(tooltipData.download)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-purple-500">↑ Upload:</span>
                    <span>{formatBytes(tooltipData.upload)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-emerald-500">API calls:</span>
                    <span>{formatNumber(tooltipData.connections)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-background/80 px-2 py-1 text-xs text-muted-foreground">
            <Info className="h-3 w-3" />
            <span>Hover for details · click for clients</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Traffic</span>
            <div className="flex items-center gap-1">
              <span className="text-xs">Low</span>
              <div className="flex">
                {mapTheme.scale.map((color) => (
                  <div
                    key={color}
                    className="h-3 w-6"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span className="text-xs">High</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {topCountries.map((country) => {
              const traffic = country.totalDownload + country.totalUpload;
              return (
                <button
                  key={country.country}
                  type="button"
                  className="flex items-center gap-1.5 text-xs hover:opacity-80"
                  onClick={() => onCountryClick?.(country.country)}
                >
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: colorScale(traffic) }}
                  />
                  <span className="text-muted-foreground">
                    {country.countryName}
                  </span>
                  <span className="font-medium">{formatBytes(traffic)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
