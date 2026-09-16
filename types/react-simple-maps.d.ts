declare module "react-simple-maps" {
  import type { ComponentType, CSSProperties, MouseEvent, ReactNode } from "react";

  export interface ComposableMapProps {
    projection?: string;
    projectionConfig?: { scale?: number; center?: [number, number] };
    style?: CSSProperties;
    width?: number;
    height?: number;
    children?: ReactNode;
  }

  export interface GeographiesChildrenArgs {
    geographies: Array<{
      rsmKey: string;
      properties: {
        name: string;
        ISO_A2?: string;
        iso_a2?: string;
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any;
    }>;
  }

  export const ComposableMap: ComponentType<ComposableMapProps>;
  export const ZoomableGroup: ComponentType<{
    children?: ReactNode;
    center?: [number, number];
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
  }>;
  export const Geographies: ComponentType<{
    geography: string;
    children: (args: GeographiesChildrenArgs) => ReactNode;
  }>;
  export const Geography: ComponentType<{
    geography: unknown;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    style?: {
      default?: CSSProperties;
      hover?: CSSProperties;
      pressed?: CSSProperties;
    };
    onMouseEnter?: (event: MouseEvent) => void;
    onMouseLeave?: (event: MouseEvent) => void;
    onClick?: (event: MouseEvent) => void;
  }>;
}
