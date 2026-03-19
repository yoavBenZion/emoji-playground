import { GIFEncoder, quantize, applyPalette } from 'gifenc';

export function encodeGif(frames: ImageData[], delay: number): Blob {
  const gif = GIFEncoder();
  const { width, height } = frames[0];

  for (const frame of frames) {
    const rgba = new Uint8Array(frame.data.buffer);

    const palette = quantize(rgba, 256, {
      format: 'rgba4444',
      clearAlpha: true,
      clearAlphaColor: 0x00,
      clearAlphaThreshold: 127,
    });

    const index = applyPalette(rgba, palette, 'rgba4444');

    gif.writeFrame(index, width, height, {
      palette,
      delay,
      repeat: 0,
      transparent: true,
      transparentIndex: 0,
    });
  }

  gif.finish();
  const bytes = gif.bytesView();
  return new Blob([new Uint8Array(bytes)], { type: 'image/gif' });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
