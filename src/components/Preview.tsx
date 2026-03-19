import { useEffect, useRef } from 'react';
import { OUTPUT_SIZE } from '../types';

interface PreviewProps {
  frames: ImageData[];
  frameDelay: number;
}

export default function Preview({ frames, frameDelay }: PreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ frameIndex: 0, lastTime: 0, animId: 0 });

  useEffect(() => {
    if (!frames.length || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const state = stateRef.current;
    state.frameIndex = 0;
    state.lastTime = 0;

    const render = (timestamp: number) => {
      if (timestamp - state.lastTime >= frameDelay) {
        ctx.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
        ctx.putImageData(frames[state.frameIndex], 0, 0);
        state.frameIndex = (state.frameIndex + 1) % frames.length;
        state.lastTime = timestamp;
      }
      state.animId = requestAnimationFrame(render);
    };

    state.animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(state.animId);
  }, [frames, frameDelay]);

  if (!frames.length) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider self-start">
        Preview
      </h2>
      <div
        className="rounded-2xl overflow-hidden border border-gray-800 p-1"
        style={{ background: 'repeating-conic-gradient(#1e1e2a 0% 25%, #161622 0% 50%) 0 0/20px 20px' }}
      >
        <canvas
          ref={canvasRef}
          width={OUTPUT_SIZE}
          height={OUTPUT_SIZE}
          style={{ width: 256, height: 256, imageRendering: 'pixelated' }}
        />
      </div>
      <p className="text-xs text-gray-700">128 × 128 px — actual emoji size</p>
    </div>
  );
}
