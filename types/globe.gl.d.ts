declare module "globe.gl" {
  export interface GlobeInstance {
    globeImageUrl(url: string): GlobeInstance;
    bumpImageUrl(url: string): GlobeInstance;
    backgroundColor(color: string): GlobeInstance;
    showAtmosphere(show: boolean): GlobeInstance;
    atmosphereColor(color: string): GlobeInstance;
    atmosphereAltitude(alt: number): GlobeInstance;
    pointsData(data: unknown[]): GlobeInstance;
    pointLat(accessor: string | ((d: unknown) => number)): GlobeInstance;
    pointLng(accessor: string | ((d: unknown) => number)): GlobeInstance;
    pointAltitude(alt: number | ((d: unknown) => number)): GlobeInstance;
    pointRadius(r: number | ((d: unknown) => number)): GlobeInstance;
    pointColor(c: string | ((d: unknown) => string)): GlobeInstance;
    pointLabel(l: string | ((d: unknown) => string)): GlobeInstance;
    onPointHover(fn: (point: unknown | null) => void): GlobeInstance;
    onPointClick(fn: (point: unknown | null) => void): GlobeInstance;
    arcsData(data: unknown[]): GlobeInstance;
    arcColor(c: string | ((d: unknown) => string | string[])): GlobeInstance;
    arcStroke(s: string | number | ((d: unknown) => number)): GlobeInstance;
    arcDashLength(n: number): GlobeInstance;
    arcDashGap(n: number): GlobeInstance;
    arcDashAnimateTime(n: number | ((d: unknown) => number)): GlobeInstance;
    arcAltitudeAutoScale(n: number): GlobeInstance;
    ringsData(data: unknown[]): GlobeInstance;
    ringColor(c: string | ((d: unknown) => string)): GlobeInstance;
    ringMaxRadius(n: number): GlobeInstance;
    ringPropagationSpeed(n: number): GlobeInstance;
    ringRepeatPeriod(n: number): GlobeInstance;
    controls(): {
      autoRotate: boolean;
      autoRotateSpeed: number;
      enableZoom: boolean;
    };
    pointOfView(
      pov: { lat: number; lng: number; altitude: number },
      transitionMs?: number
    ): GlobeInstance;
    width(w: number): GlobeInstance;
    height(h: number): GlobeInstance;
    _destructor?: () => void;
  }

  interface GlobeConstructor {
    new (element: HTMLElement, config?: object): GlobeInstance;
    (element: HTMLElement, config?: object): GlobeInstance;
  }

  const Globe: GlobeConstructor;
  export default Globe;
}
