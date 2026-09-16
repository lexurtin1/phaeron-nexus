"use client";

import { useEffect, useRef } from "react";
import Globe, { type GlobeInstance } from "globe.gl";
import { clients, PHAERON_HUB } from "@/data/mock";
import type { HealthStatus } from "@/data/types";

const HEALTH_COLOR: Record<HealthStatus, string> = {
  healthy: "#1e4da0",
  warning: "#d97706",
  critical: "#dc2626",
};

interface CommandGlobeProps {
  selectedClientId: string | null;
  onSelectClient: (id: string) => void;
}

export function CommandGlobe({
  selectedClientId,
  onSelectClient,
}: CommandGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeInstance | null>(null);
  const selectedRef = useRef(selectedClientId);
  selectedRef.current = selectedClientId;

  useEffect(() => {
    if (!containerRef.current) return;

    const el = containerRef.current;
    const globe = new Globe(el)
      .globeImageUrl("//cdn.jsdelivr.net/npm/three-globe/example/img/earth-day.jpg")
      .bumpImageUrl("//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png")
      .backgroundColor("rgba(0,0,0,0)")
      .showAtmosphere(true)
      .atmosphereColor("#93c5fd")
      .atmosphereAltitude(0.18)
      .pointsData(clients)
      .pointLat("lat")
      .pointLng("lng")
      .pointAltitude(0.012)
      .pointRadius((d) => {
        const c = d as (typeof clients)[0];
        return selectedRef.current === c.id ? 0.55 : 0.32;
      })
      .pointColor((d) => HEALTH_COLOR[(d as (typeof clients)[0]).health])
      .pointLabel(
        (d) =>
          `<div style="font-family:Satoshi,sans-serif;padding:6px 8px;background:rgba(255,255,255,0.95);border:1px solid rgba(10,22,40,0.08);border-radius:8px;color:#0a1628;font-size:12px;box-shadow:0 4px 16px rgba(10,22,40,0.1)"><strong>${(d as (typeof clients)[0]).name}</strong><br/><span style="color:#64748b">${(d as (typeof clients)[0]).city} · ${(d as (typeof clients)[0]).maturity}</span></div>`
      )
      .onPointHover((point) => {
        const controls = globe.controls();
        if (controls) controls.autoRotate = !point;
        el.style.cursor = point ? "pointer" : "grab";
      })
      .onPointClick((point) => {
        if (point) onSelectClient((point as (typeof clients)[0]).id);
      })
      .arcsData(
        clients.map((c) => ({
          startLat: PHAERON_HUB.lat,
          startLng: PHAERON_HUB.lng,
          endLat: c.lat,
          endLng: c.lng,
          color:
            c.health === "critical"
              ? ["rgba(220,38,38,0.15)", "rgba(220,38,38,0.85)"]
              : ["rgba(30,77,160,0.1)", `rgba(30,77,160,${0.35 + c.hubActivity * 0.55})`],
          stroke: 0.35 + c.hubActivity * 0.9,
          dash: c.hubActivity,
          clientId: c.id,
        }))
      )
      .arcColor("color")
      .arcStroke("stroke")
      .arcDashLength(0.35)
      .arcDashGap(0.7)
      .arcDashAnimateTime((d) => 2500 - (d as { dash: number }).dash * 1400)
      .arcAltitudeAutoScale(0.35)
      .ringsData(
        clients
          .filter((c) => c.health !== "healthy")
          .map((c) => ({
            lat: c.lat,
            lng: c.lng,
            color:
              c.health === "critical"
                ? "rgba(220,38,38,0.45)"
                : "rgba(217,119,6,0.4)",
          }))
      )
      .ringColor("color")
      .ringMaxRadius(2.2)
      .ringPropagationSpeed(1.1)
      .ringRepeatPeriod(1400);

    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.35;
    globe.controls().enableZoom = true;
    globe.pointOfView({ lat: 28, lng: 10, altitude: 2.15 }, 0);

    const resize = () => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      globe.width(width);
      globe.height(height);
    };
    resize();
    window.addEventListener("resize", resize);
    globeRef.current = globe;

    return () => {
      window.removeEventListener("resize", resize);
      globe._destructor?.();
      globeRef.current = null;
      el.innerHTML = "";
    };
  }, [onSelectClient]);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    globe.pointRadius((d) => {
      const c = d as (typeof clients)[0];
      return selectedClientId === c.id ? 0.55 : 0.32;
    });
  }, [selectedClientId]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 z-[1] h-[min(78vh,720px)] w-[min(78vh,720px)] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.92) 38%, rgba(236,243,247,0.45) 62%, transparent 74%)",
          boxShadow: "0 40px 100px rgba(34,50,61,0.07)",
        }}
        aria-hidden
      />
      <div ref={containerRef} className="absolute inset-0 z-[2]" />
      <div className="pointer-events-none absolute bottom-5 right-5 z-[3] rounded-lg border border-[rgba(10,22,40,0.08)] bg-white/80 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)] backdrop-blur">
        Live fleet · London hub
      </div>
    </div>
  );
}
