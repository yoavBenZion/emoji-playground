export type AnimationStyle = 'party' | 'spin' | 'bounce' | 'shake' | 'zoom';

export interface StyleMeta {
  id: AnimationStyle;
  emoji: string;
  label: string;
  description: string;
}

export const STYLES: StyleMeta[] = [
  { id: 'party', emoji: '🎉', label: 'Party', description: 'Rainbow wave' },
  { id: 'spin', emoji: '🌀', label: 'Spin', description: 'Full rotation' },
  { id: 'bounce', emoji: '🏀', label: 'Bounce', description: 'Bob up & down' },
  { id: 'shake', emoji: '📳', label: 'Shake', description: 'Frantic wiggle' },
  { id: 'zoom', emoji: '💓', label: 'Pulse', description: 'Heartbeat zoom' },
];

export const SPEED_PRESETS = [
  { label: 'Turbo', delay: 20 },
  { label: 'Fast', delay: 50 },
  { label: 'Normal', delay: 80 },
  { label: 'Slow', delay: 150 },
  { label: 'Glacial', delay: 300 },
];

export const FRAME_PRESETS = [8, 12, 16, 24];

export const OUTPUT_SIZE = 128;
