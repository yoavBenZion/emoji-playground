export type AnimationStyle =
  | 'party' | 'spin' | 'bounce' | 'shake' | 'zoom'
  | 'wobble' | 'float' | 'flip' | 'glitch' | 'tilt'
  | 'rainbow' | 'orbit' | 'nod' | 'dizzy' | 'pop';

export interface StyleMeta {
  id: AnimationStyle;
  emoji: string;
  label: string;
  description: string;
}

export const STYLES: StyleMeta[] = [
  { id: 'party',   emoji: '🎉', label: 'Party',   description: 'Rainbow wave'       },
  { id: 'spin',    emoji: '🌀', label: 'Spin',    description: 'Full rotation'       },
  { id: 'bounce',  emoji: '🏀', label: 'Bounce',  description: 'Bob up & down'       },
  { id: 'shake',   emoji: '📳', label: 'Shake',   description: 'Frantic wiggle'      },
  { id: 'zoom',    emoji: '💓', label: 'Pulse',   description: 'Heartbeat zoom'      },
  { id: 'wobble',  emoji: '〰️', label: 'Wobble',  description: 'Rotation sway'       },
  { id: 'float',   emoji: '🍃', label: 'Float',   description: 'Gentle levitation'   },
  { id: 'flip',    emoji: '🔄', label: 'Flip',    description: 'Horizontal flip'     },
  { id: 'glitch',  emoji: '👾', label: 'Glitch',  description: 'Digital distortion'  },
  { id: 'tilt',    emoji: '💫', label: 'Tilt',    description: '3D perspective'      },
  { id: 'rainbow', emoji: '🌈', label: 'Rainbow', description: 'Color sweep'         },
  { id: 'orbit',   emoji: '🪐', label: 'Orbit',   description: 'Circular drift'      },
  { id: 'nod',     emoji: '👆', label: 'Nod',     description: 'Double bob'          },
  { id: 'dizzy',   emoji: '🥴', label: 'Dizzy',   description: 'Woozy sway'          },
  { id: 'pop',     emoji: '💥', label: 'Pop',     description: 'Staccato burst'      },
];

export const SPEED_PRESETS = [
  { label: 'Turbo',  delay: 20  },
  { label: 'Fast',   delay: 50  },
  { label: 'Normal', delay: 80  },
  { label: 'Slow',   delay: 150 },
  { label: 'Glacial',delay: 300 },
];

export const FRAME_PRESETS = [8, 12, 16, 24];

export const OUTPUT_SIZE = 128;
