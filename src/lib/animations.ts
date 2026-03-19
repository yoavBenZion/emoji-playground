import type { AnimationStyle } from '../types';
import { OUTPUT_SIZE as SIZE } from '../types';

function drawCentered(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
  const scale = Math.min(SIZE / img.naturalWidth, SIZE / img.naturalHeight);
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;
  ctx.drawImage(img, (SIZE - w) / 2, (SIZE - h) / 2, w, h);
}

export function generateFrames(
  img: HTMLImageElement,
  style: AnimationStyle,
  frameCount: number
): ImageData[] {
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  return Array.from({ length: frameCount }, (_, i) => {
    const t = i / frameCount; // 0..1
    ctx.clearRect(0, 0, SIZE, SIZE);

    switch (style) {
      case 'party': {
        // Party parrot: SHEAR (bottom planted) + squash-and-stretch + snappy timing.
        // cbrt(sin): rushes quickly through the upright position, dwells at the lean extremes.
        // Shear (not rotation): bottom pixel row never moves, only the top sweeps left/right.
        // Squash: peaks when upright (between leans), eases off at the lean extremes — matches
        // the original party parrot's weight-shift bob: down+squash at center, up+lean at sides.
        const phase     = t * Math.PI * 2;
        const sway      = Math.cbrt(Math.sin(phase)); // snappy: quick through center, dwells at lean
        const atExtreme = Math.abs(sway);             // 0 = upright (center), 1 = fully leaned

        const shear   = -sway * 0.33;                // top sweeps in lean direction
        const squishY = 0.68 + 0.26 * atExtreme;    // squashed (0.68) upright → less squashed (0.94) leaned
        const squishX = 1.10 - 0.10 * atExtreme;    // wider (1.10) upright → normal (1.00) leaned

        ctx.save();
        ctx.translate(SIZE / 2, SIZE);             // origin locked at bottom-centre — NEVER moves
        ctx.scale(squishX, squishY);               // squish/stretch from the bottom up
        ctx.transform(1, 0, shear, 1, 0, 0);      // horizontal shear in local coords (bottom=0 stays put)
        ctx.translate(-SIZE / 2, -SIZE);
        drawCentered(ctx, img);
        ctx.restore();

        // Rainbow overlay on opaque pixels only
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = `hsla(${t * 360}, 100%, 55%, 0.5)`;
        ctx.fillRect(0, 0, SIZE, SIZE);
        ctx.globalCompositeOperation = 'source-over';
        break;
      }

      case 'spin': {
        ctx.save();
        ctx.translate(SIZE / 2, SIZE / 2);
        ctx.rotate(t * Math.PI * 2);
        ctx.translate(-SIZE / 2, -SIZE / 2);
        drawCentered(ctx, img);
        ctx.restore();
        break;
      }

      case 'bounce': {
        const dy = Math.sin(t * Math.PI * 2) * (SIZE * 0.15);
        ctx.save();
        ctx.translate(0, dy);
        drawCentered(ctx, img);
        ctx.restore();
        break;
      }

      case 'shake': {
        const dx = Math.sin(t * Math.PI * 2 * 4) * (SIZE * 0.08);
        const tilt = Math.sin(t * Math.PI * 2 * 4) * 0.15;
        ctx.save();
        ctx.translate(SIZE / 2 + dx, SIZE / 2);
        ctx.rotate(tilt);
        ctx.translate(-SIZE / 2, -SIZE / 2);
        drawCentered(ctx, img);
        ctx.restore();
        break;
      }

      case 'zoom': {
        const scale = 0.82 + Math.abs(Math.sin(t * Math.PI)) * 0.22;
        ctx.save();
        ctx.translate(SIZE / 2, SIZE / 2);
        ctx.scale(scale, scale);
        ctx.translate(-SIZE / 2, -SIZE / 2);
        drawCentered(ctx, img);
        ctx.restore();
        break;
      }
    }

    return ctx.getImageData(0, 0, SIZE, SIZE);
  });
}
