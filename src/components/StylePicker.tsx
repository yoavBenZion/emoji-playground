import { STYLES } from '../types';
import type { AnimationStyle } from '../types';

interface StylePickerProps {
  value: AnimationStyle;
  onChange: (style: AnimationStyle) => void;
}

export default function StylePicker({ value, onChange }: StylePickerProps) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Animation Style
      </h2>
      <div className="grid grid-cols-5 gap-3">
        {STYLES.map((s) => (
          <button
            key={s.id}
            onClick={() => onChange(s.id)}
            className={`
              flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all
              ${value === s.id
                ? 'border-violet-500 bg-violet-500/15 text-white'
                : 'border-gray-800 bg-[#16161f] text-gray-400 hover:border-gray-600 hover:text-gray-200'}
            `}
          >
            <span className="text-2xl">{s.emoji}</span>
            <span className="text-xs font-semibold">{s.label}</span>
            <span className="text-[11px] text-gray-600 leading-tight text-center">{s.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
