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

      case 'poop': {
        // First half: image shrinks and fades out; second half: 💩 fades in and bounces
        if (t < 0.45) {
          const progress = t / 0.45;
          const scale = 1 - progress * 0.35;
          ctx.save();
          ctx.globalAlpha = 1 - progress * 0.8;
          ctx.translate(SIZE / 2, SIZE / 2);
          ctx.scale(scale, scale);
          ctx.translate(-SIZE / 2, -SIZE / 2);
          drawCentered(ctx, img);
          ctx.restore();
        } else {
          const progress = (t - 0.45) / 0.55;
          const bounce   = Math.abs(Math.sin(progress * Math.PI * 2.5)) * (1 - progress) * SIZE * 0.12;
          const scale    = 0.65 + progress * 0.45;
          ctx.save();
          ctx.globalAlpha = Math.min(1, progress * 2.5);
          ctx.font        = `${Math.round(SIZE * 0.65 * scale)}px serif`;
          ctx.textAlign   = 'center';
          ctx.textBaseline = 'middle';
          ctx.translate(SIZE / 2, SIZE / 2 - bounce);
          ctx.fillText('💩', 0, 0);
          ctx.restore();
        }
        break;
      }

      case 'explode': {
        // Tiles fly outward from center: first third normal, then explode, then reform
        const COLS = 4, ROWS = 4;
        const tw = SIZE / COLS, th = SIZE / ROWS;

        const tmp2 = document.createElement('canvas');
        tmp2.width = SIZE; tmp2.height = SIZE;
        const tCtx2 = tmp2.getContext('2d')!;
        drawCentered(tCtx2, img);

        // ease: 0→0.3 calm, 0.3→0.7 explode, 0.7→1 reassemble
        const explodeT = t < 0.3 ? 0 : t < 0.7 ? (t - 0.3) / 0.4 : 1 - (t - 0.7) / 0.3;
        const eased    = explodeT * explodeT;

        for (let row = 0; row < ROWS; row++) {
          for (let col = 0; col < COLS; col++) {
            const cx = (col - (COLS - 1) / 2);
            const cy = (row - (ROWS - 1) / 2);
            const dist = Math.sqrt(cx * cx + cy * cy);
            const dx = cx / dist * eased * SIZE * 0.7;
            const dy = cy / dist * eased * SIZE * 0.7;
            const angle = Math.atan2(cy, cx) * eased * 0.6;
            ctx.save();
            ctx.translate(col * tw + tw / 2 + dx, row * th + th / 2 + dy);
            ctx.rotate(angle);
            ctx.drawImage(tmp2, col * tw, row * th, tw, th, -tw / 2, -th / 2, tw, th);
            ctx.restore();
          }
        }
        break;
      }

      case 'rocket': {
        // 0–25%: vibration on launch pad; 25–70%: accelerate upward off screen; 70–100%: fall back in
        if (t < 0.25) {
          // shake on the pad
          const vibrate = Math.sin(t * Math.PI * 2 * 20) * SIZE * 0.02 * (t / 0.25);
          ctx.save();
          ctx.translate(vibrate, 0);
          drawCentered(ctx, img);
          ctx.restore();
        } else if (t < 0.70) {
          const liftT = (t - 0.25) / 0.45;
          const dy = liftT * liftT * SIZE * 1.8; // accelerate off top
          ctx.save();
          ctx.translate(0, -dy);
          drawCentered(ctx, img);
          ctx.restore();
          // draw rocket exhaust flame
          const flameSz  = SIZE * 0.25 * (1 + liftT);
          const imgScale = Math.min(SIZE / img.naturalWidth, SIZE / img.naturalHeight);
          const imgH     = img.naturalHeight * imgScale;
          const imgCY    = SIZE / 2 - dy;
          ctx.save();
          ctx.globalAlpha = 0.85 - liftT * 0.4;
          ctx.font        = `${Math.round(flameSz)}px serif`;
          ctx.textAlign   = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText('🔥', SIZE / 2, imgCY + imgH / 2);
          ctx.restore();
        } else {
          // crash back down with bounce
          const fallT  = (t - 0.70) / 0.30;
          const bounce = Math.abs(Math.sin(fallT * Math.PI * 1.5)) * (1 - fallT) * SIZE * 0.2;
          const dy     = -(1 - fallT * fallT) * SIZE * 1.8 + bounce;
          ctx.save();
          ctx.translate(0, -dy);
          drawCentered(ctx, img);
          ctx.restore();
        }
        break;
      }

      case 'vibecheck': {
        // Aggressive head-shake: high-frequency oscillation with snappy cbrt timing
        // Fades in intensity over the cycle for a "DENIED" feel
        const envelope = Math.sin(t * Math.PI); // ramps up then down
        const angle    = Math.cbrt(Math.sin(t * Math.PI * 2 * 5)) * 0.38 * envelope;
        const dx       = Math.sin(t * Math.PI * 2 * 5) * SIZE * 0.10 * envelope;
        ctx.save();
        ctx.translate(SIZE / 2 + dx, SIZE / 2);
        ctx.rotate(angle);
        ctx.translate(-SIZE / 2, -SIZE / 2);
        drawCentered(ctx, img);
        ctx.restore();
        // Flash red "NO" overlay at peak shake
        if (envelope > 0.7) {
          ctx.save();
          ctx.globalCompositeOperation = 'source-atop';
          ctx.globalAlpha = (envelope - 0.7) * 0.5;
          ctx.fillStyle = '#ff2244';
          ctx.fillRect(0, 0, SIZE, SIZE);
          ctx.restore();
        }
        break;
      }

      case 'melt': {
        // Scanlines droop downward with increasing delay per row → puddle effect
        const SLICES = 28;
        const sliceH = SIZE / SLICES;

        const tmp3 = document.createElement('canvas');
        tmp3.width = SIZE; tmp3.height = SIZE;
        const tCtx3 = tmp3.getContext('2d')!;
        drawCentered(tCtx3, img);

        for (let s = 0; s < SLICES; s++) {
          const rowFrac = s / SLICES;
          // Bottom rows melt more, top rows stay; delay kicks in later for top rows
          const delay  = rowFrac * 0.5;
          const tLocal = Math.max(0, (t - delay) / (1 - delay));
          const droop  = Math.pow(tLocal, 2) * rowFrac * SIZE * 0.85;
          // Squash: as rows droop, each gets taller (pile up)
          const squash = 1 + tLocal * rowFrac * 0.6;
          const sy     = s * sliceH;
          ctx.save();
          ctx.translate(0, droop);
          ctx.drawImage(tmp3, 0, sy, SIZE, sliceH, 0, sy, SIZE, sliceH * squash);
          ctx.restore();
        }
        break;
      }

      case 'onfire': {
        // Image wobbles with heat distortion; fire gradient sweeps up; embers fly
        const phase = t * Math.PI * 2;
        // heat-shimmer: slight horizontal wave distortion using scanlines
        const HSLICES = 20;
        const hSliceH = SIZE / HSLICES;
        const tmp4 = document.createElement('canvas');
        tmp4.width = SIZE; tmp4.height = SIZE;
        const tCtx4 = tmp4.getContext('2d')!;
        drawCentered(tCtx4, img);

        for (let s = 0; s < HSLICES; s++) {
          const shimmer = Math.sin(phase * 3 + s * 0.7) * SIZE * 0.025 * (1 - s / HSLICES);
          const sy = s * hSliceH;
          ctx.drawImage(tmp4, 0, sy, SIZE, hSliceH, shimmer, sy, SIZE, hSliceH);
        }

        // Fire gradient overlay: orange→red→transparent, oscillating height
        const fireHeight = SIZE * (0.55 + 0.15 * Math.sin(phase * 2.3));
        const grad2 = ctx.createLinearGradient(0, SIZE, 0, SIZE - fireHeight);
        grad2.addColorStop(0,    'hsla(20,  100%, 55%, 0.85)');
        grad2.addColorStop(0.35, 'hsla(35,  100%, 60%, 0.65)');
        grad2.addColorStop(0.65, 'hsla(50,  100%, 65%, 0.30)');
        grad2.addColorStop(1,    'hsla(60,  100%, 70%, 0)');
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = grad2;
        ctx.fillRect(0, 0, SIZE, SIZE);
        ctx.globalCompositeOperation = 'source-over';

        // Random ember sparks
        const sparkCount = 5;
        for (let sp = 0; sp < sparkCount; sp++) {
          const hash2 = Math.sin(sp * 91.3 + Math.floor(t * frameCount * 2) * 137.5) * 43758.5;
          const frac2 = hash2 - Math.floor(hash2);
          const sx2   = frac2 * SIZE;
          const sy2   = SIZE - (((frac2 * 7 + t * 2) % 1) * SIZE * 0.8);
          ctx.save();
          ctx.globalAlpha = 0.8 * (1 - sy2 / SIZE);
          ctx.fillStyle   = `hsl(${30 + frac2 * 30}, 100%, 65%)`;
          ctx.beginPath();
          ctx.arc(sx2, sy2, 2 + frac2 * 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        break;
      }
    }

    return ctx.getImageData(0, 0, SIZE, SIZE);
  });
}
