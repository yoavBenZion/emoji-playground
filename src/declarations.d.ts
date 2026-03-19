declare module 'gifenc' {
  export function GIFEncoder(): {
    writeFrame(
      index: Uint8Array,
      width: number,
      height: number,
      options?: {
        palette?: Uint8Array;
        delay?: number;
        repeat?: number;
        transparent?: boolean;
        transparentIndex?: number;
        dispose?: number;
      }
    ): void;
    finish(): void;
    bytesView(): Uint8Array;
    bytes(): Uint8Array;
  };

  export function quantize(
    data: Uint8Array,
    maxColors: number,
    options?: {
      format?: string;
      clearAlpha?: boolean;
      clearAlphaColor?: number;
      clearAlphaThreshold?: number;
      oneBitAlpha?: boolean | number;
      colorSpace?: string;
    }
  ): Uint8Array;

  export function applyPalette(
    data: Uint8Array,
    palette: Uint8Array,
    format?: string
  ): Uint8Array;
}
