import { SPEED_PRESETS, FRAME_PRESETS } from '../types';

interface ControlsProps {
  frameCount: number;
  frameDelay: number;
  onFrameCountChange: (n: number) => void;
  onFrameDelayChange: (ms: number) => void;
}

export default function Controls({
  frameCount,
  frameDelay,
  onFrameCountChange,
  onFrameDelayChange,
}: ControlsProps) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Speed</h2>
        <div className="flex gap-2">
          {SPEED_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => onFrameDelayChange(p.delay)}
              className={`
                flex-1 py-2 text-xs font-semibold rounded-lg border transition-all
                ${frameDelay === p.delay
                  ? 'border-violet-500 bg-violet-500/15 text-violet-300'
                  : 'border-gray-800 bg-[#16161f] text-gray-500 hover:border-gray-600 hover:text-gray-300'}
              `}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Frames <span className="text-gray-700 normal-case font-normal">(more = smoother)</span>
        </h2>
        <div className="flex gap-2">
          {FRAME_PRESETS.map((n) => (
            <button
              key={n}
              onClick={() => onFrameCountChange(n)}
              className={`
                flex-1 py-2 text-xs font-semibold rounded-lg border transition-all
                ${frameCount === n
                  ? 'border-violet-500 bg-violet-500/15 text-violet-300'
                  : 'border-gray-800 bg-[#16161f] text-gray-500 hover:border-gray-600 hover:text-gray-300'}
              `}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
