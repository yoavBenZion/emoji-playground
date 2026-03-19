import { removeBackground } from '@imgly/background-removal';

export async function removeBg(
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  const blob = await removeBackground(file, {
    progress: (_key: string, current: number, total: number) => {
      if (total > 0) onProgress?.(Math.round((current / total) * 100));
    },
  });
  return URL.createObjectURL(blob);
}
