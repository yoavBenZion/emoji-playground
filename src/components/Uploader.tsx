import { useCallback, useRef, useState } from 'react';
import { removeBg } from '../lib/bgRemoval';

interface UploaderProps {
  onImage: (img: HTMLImageElement) => void;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export default function Uploader({ onImage }: UploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [bgRemoving, setBgRemoving] = useState(false);
  const [bgProgress, setBgProgress] = useState(0);
  const [bgDone, setBgDone] = useState(false);
  const [bgError, setBgError] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setSourceFile(file);
    setBgDone(false);
    setBgError(false);
    const url = URL.createObjectURL(file);
    setPreview(url);
    const img = await loadImage(url);
    onImage(img);
  }, [onImage]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleRemoveBg = async () => {
    if (!sourceFile) return;
    setBgRemoving(true);
    setBgProgress(0);
    try {
      const url = await removeBg(sourceFile, setBgProgress);
      setPreview(url);
      setBgDone(true);
      const img = await loadImage(url);
      onImage(img);
    } catch (err) {
      console.error('BG removal failed:', err);
      setBgError(true);
    } finally {
      setBgRemoving(false);
    }
  };

  return (
    <div className="w-full">
      {!preview ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          className={`
            border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
            ${dragging
              ? 'border-violet-400 bg-violet-500/10'
              : 'border-gray-700 hover:border-violet-500 hover:bg-violet-500/5'}
          `}
        >
          <div className="text-5xl mb-4">🖼️</div>
          <p className="text-gray-300 font-medium">Drop an image here or click to upload</p>
          <p className="text-gray-600 text-sm mt-1">PNG, JPG, GIF, WebP</p>
        </div>
      ) : (
        <div className="flex items-center gap-6 p-5 bg-[#16161f] rounded-2xl border border-gray-800">
          <div
            className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer"
            style={{ background: 'repeating-conic-gradient(#2a2a3a 0% 25%, #1a1a26 0% 50%) 0 0/16px 16px' }}
          >
            <img src={preview} alt="Preview" className="w-full h-full object-contain" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-400 truncate mb-3">{sourceFile?.name}</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => inputRef.current?.click()}
                className="text-sm px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
              >
                Replace
              </button>

              {!bgDone && !bgError && (
                <button
                  onClick={handleRemoveBg}
                  disabled={bgRemoving}
                  className="text-sm px-3 py-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-600/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bgRemoving
                    ? bgProgress < 30
                      ? `Downloading model… ${bgProgress}%`
                      : `Removing bg… ${bgProgress}%`
                    : '✂️ Remove Background'}
                </button>
              )}

              {bgDone && (
                <span className="text-sm px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-600/40">
                  ✓ Background removed
                </span>
              )}

              {bgError && (
                <button
                  onClick={() => { setBgError(false); handleRemoveBg(); }}
                  className="text-sm px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/40 transition-colors"
                >
                  ⚠️ Failed — tap to retry
                </button>
              )}
            </div>

            {bgRemoving && (
              <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 transition-all duration-300 rounded-full"
                  style={{ width: `${bgProgress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
    </div>
  );
}
