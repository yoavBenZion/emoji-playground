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
        // Bottom-anchored shear + cos-phase squash, verified against reference GIFs.
        // Shear: sway*cbrt(sin) — top sweeps, image bottom stays fixed horizontally.
        // Squash: cos(phase) — tall at t=0, most squashed at t=0.5 (between leans).
        const phase   = t * Math.PI * 2;
        const sway    = Math.cbrt(Math.sin(phase));
        const squishY = 0.87 + 0.13 * Math.cos(phase);
        const shear   = sway * 0.20;

        const imgScale  = Math.min(SIZE / img.naturalWidth, SIZE / img.naturalHeight);
        const imgH      = img.naturalHeight * imgScale;
        const imgTop    = (SIZE - imgH) / 2;
        const imgBottom = imgTop + imgH;
        const bob       = imgBottom * (1 - squishY);

        ctx.setTransform(1, 0, shear, squishY, -shear * imgBottom, bob);
        drawCentered(ctx, img);
        ctx.setTransform(1, 0, 0, 1, 0, 0);

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

      case 'wobble': {
        // Rotational sway ±12°, snappy timing via cbrt
        const angle = Math.cbrt(Math.sin(t * Math.PI * 2)) * 0.21;
        ctx.save();
        ctx.translate(SIZE / 2, SIZE / 2);
        ctx.rotate(angle);
        ctx.translate(-SIZE / 2, -SIZE / 2);
        drawCentered(ctx, img);
        ctx.restore();
        break;
      }

      case 'float': {
        // Gentle vertical levitation + very subtle rotation
        const phase = t * Math.PI * 2;
        const dy    = Math.sin(phase) * SIZE * 0.07;
        const angle = Math.sin(phase) * 0.06;
        ctx.save();
        ctx.translate(SIZE / 2, SIZE / 2 + dy);
        ctx.rotate(angle);
        ctx.translate(-SIZE / 2, -SIZE / 2);
        drawCentered(ctx, img);
        ctx.restore();
        break;
      }

      case 'flip': {
        // Horizontal coin-flip: scaleX cycles 1→0→-1→0→1 (image mirrors at halfway)
        const scaleX = Math.cos(t * Math.PI * 2);
        ctx.save();
        ctx.translate(SIZE / 2, SIZE / 2);
        ctx.scale(scaleX, 1);
        ctx.translate(-SIZE / 2, -SIZE / 2);
        drawCentered(ctx, img);
        ctx.restore();
        break;
      }

      case 'glitch': {
        // Draw image to temp canvas, then redraw in slices with glitch offsets
        const tmp = document.createElement('canvas');
        tmp.width = SIZE;
        tmp.height = SIZE;
        const tCtx = tmp.getContext('2d')!;
        drawCentered(tCtx, img);

        const numSlices = 12;
        const sliceH    = Math.ceil(SIZE / numSlices);
        for (let s = 0; s < numSlices; s++) {
          // Deterministic pseudo-random: changes ~3x per cycle
          const hash   = Math.sin(s * 127.1 + Math.floor(t * frameCount * 3) * 311.7) * 43758.5453;
          const frac   = hash - Math.floor(hash); // 0..1
          const dx     = frac < 0.2 ? (frac * 10 - 1) * SIZE * 0.18 : 0;
          const sy     = s * sliceH;
          const sh     = Math.min(sliceH, SIZE - sy);
          ctx.drawImage(tmp, 0, sy, SIZE, sh, dx, sy, SIZE, sh);
        }

        // Subtle colour-channel fringing on the whole frame
        const shift = Math.sin(t * Math.PI * 6) * 4;
        ctx.globalCompositeOperation = 'source-atop';
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = shift > 0 ? '#ff0066' : '#00ccff';
        ctx.fillRect(shift, 0, SIZE, SIZE);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
        break;
      }

      case 'tilt': {
        // Simulate 3D rotation: skewX and skewY orbit in a phase-offset ellipse
        const phase = t * Math.PI * 2;
        const skewX = Math.sin(phase) * 0.28;
        const skewY = Math.cos(phase) * 0.12;
        ctx.save();
        ctx.translate(SIZE / 2, SIZE / 2);
        ctx.transform(1, skewY, skewX, 1, 0, 0);
        ctx.translate(-SIZE / 2, -SIZE / 2);
        drawCentered(ctx, img);
        ctx.restore();
        break;
      }

      case 'rainbow': {
        // Image stays still; a rainbow gradient sweeps across it
        drawCentered(ctx, img);
        const offset = t * SIZE * 2.5;
        const grad   = ctx.createLinearGradient(offset - SIZE * 1.5, 0, offset, SIZE);
        grad.addColorStop(0,    'hsla(0,   100%, 60%, 0)');
        grad.addColorStop(0.2,  'hsla(60,  100%, 60%, 0.65)');
        grad.addColorStop(0.4,  'hsla(120, 100%, 60%, 0.65)');
        grad.addColorStop(0.6,  'hsla(200, 100%, 60%, 0.65)');
        grad.addColorStop(0.8,  'hsla(280, 100%, 60%, 0.65)');
        grad.addColorStop(1,    'hsla(360, 100%, 60%, 0)');
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, SIZE, SIZE);
        ctx.globalCompositeOperation = 'source-over';
        break;
      }

      case 'orbit': {
        // Circular drift path with subtle depth scaling
        const phase  = t * Math.PI * 2;
        const radius = SIZE * 0.10;
        const dx     = Math.cos(phase) * radius;
        const dy     = Math.sin(phase) * radius * 0.55; // ellipse
        const scale  = 0.92 + 0.08 * Math.sin(phase);   // slight near/far illusion
        ctx.save();
        ctx.translate(SIZE / 2 + dx, SIZE / 2 + dy);
        ctx.scale(scale, scale);
        ctx.translate(-SIZE / 2, -SIZE / 2);
        drawCentered(ctx, img);
        ctx.restore();
        break;
      }

      case 'nod': {
        // Two quick downward bobs per cycle with squash on impact
        const phase  = t * Math.PI * 4; // 2× frequency
        const dy     = Math.abs(Math.sin(phase)) * SIZE * 0.13;
        const squish = 1 - 0.12 * Math.pow(Math.abs(Math.sin(phase)), 3);
        ctx.save();
        ctx.translate(SIZE / 2, SIZE / 2 + dy);
        ctx.scale(1, squish);
        ctx.translate(-SIZE / 2, -SIZE / 2);
        drawCentered(ctx, img);
        ctx.restore();
        break;
      }

      case 'dizzy': {
        // Overlapping sine waves at different frequencies → erratic woozy motion
        const phase  = t * Math.PI * 2;
        const angle  = Math.sin(phase * 1.5) * 0.22 + Math.sin(phase * 2.3) * 0.08;
        const dx     = Math.sin(phase * 1.1) * SIZE * 0.06;
        const dy     = Math.sin(phase * 1.7) * SIZE * 0.04;
        ctx.save();
        ctx.translate(SIZE / 2 + dx, SIZE / 2 + dy);
        ctx.rotate(angle);
        ctx.translate(-SIZE / 2, -SIZE / 2);
        drawCentered(ctx, img);
        ctx.restore();
        break;
      }

      case 'pop': {
        // Two staccato pops per cycle: snap large then quickly settle
        const localT  = (t * 2) % 1; // two pops per cycle
        let scale: number;
        if      (localT < 0.12) scale = 0.65 + localT * 4.6;  // snap up
        else if (localT < 0.28) scale = 1.20 - (localT - 0.12) * 3.1; // settle
        else                    scale = 0.70 + Math.sin(localT * Math.PI) * 0.22;
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
