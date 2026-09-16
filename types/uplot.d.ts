declare module "uplot" {
  type TypedArray =
    | Int8Array
    | Uint8Array
    | Int16Array
    | Uint16Array
    | Int32Array
    | Uint32Array
    | Float32Array
    | Float64Array;

  export default class uPlot {
    constructor(
      opts: uPlot.Options,
      data: uPlot.AlignedData,
      target?: HTMLElement
    );
    setData(data: uPlot.AlignedData, resetScales?: boolean): void;
    setSize(size: { width: number; height: number }): void;
    destroy(): void;
  }

  namespace uPlot {
    type AlignedData = [
      xValues: number[] | TypedArray,
      ...yValues: (number | null | undefined)[][] | TypedArray[],
    ];
    interface Options {
      width: number;
      height: number;
      class?: string;
      scales?: Record<string, { time?: boolean }>;
      axes?: Array<Record<string, unknown>>;
      series: Array<Record<string, unknown>>;
      legend?: { show?: boolean };
      cursor?: Record<string, unknown>;
    }
  }
}

export {};
