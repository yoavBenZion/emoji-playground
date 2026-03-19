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
        // Party parrot: bottom-anchored shear + cos-phase squash, verified against reference GIFs.
        //
        // Shear:  sway*cbrt(sin) — top sweeps left/right, IMAGE BOTTOM stays fixed horizontally.
        //         Positive sway → top goes left (matches reference). cbrt = snappy lean timing.
        // Squash: cos(phase) — TALL at t=0, most SQUASHED at t=0.5 (between the two leans).
        //         Squash and lean are 90° out of phase.
        // Pivot:  62% down the image — both top and bottom move, but bottom barely shifts
        //         (matches measured reference: top drops ~10px, bottom rises ~6px at max squash).
        //
        // Single setTransform call replicates party-ify's matrix exactly:
        //   x' = x + shear*(y - imgBottom)   ← bottom-fixed shear
        //   y' = squishY*y + bob              ← scale from top + downward translation
        const phase   = t * Math.PI * 2;
        const sway    = Math.cbrt(Math.sin(phase));
        const squishY = 0.87 + 0.13 * Math.cos(phase);  // 1.0 at t=0, 0.74 at t=0.5
        const shear   = sway * 0.20;                     // positive sway → top goes left

        const imgScale  = Math.min(SIZE / img.naturalWidth, SIZE / img.naturalHeight);
        const imgH      = img.naturalHeight * imgScale;
        const imgTop    = (SIZE - imgH) / 2;
        const imgBottom = imgTop + imgH;
        const bob       = imgBottom * (1 - squishY);     // bottom-anchored: base stays at fixed Y

        ctx.setTransform(1, 0, shear, squishY, -shear * imgBottom, bob);
        drawCentered(ctx, img);
        ctx.setTransform(1, 0, 0, 1, 0, 0);

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
