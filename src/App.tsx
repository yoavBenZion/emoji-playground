import { useState, useEffect, useCallback } from 'react';
import type { AnimationStyle } from './types';
import Uploader from './components/Uploader';
import StylePicker from './components/StylePicker';
import Controls from './components/Controls';
import Preview from './components/Preview';
import { generateFrames } from './lib/animations';
import { encodeGif, formatBytes } from './lib/gifEncoder';

export default function App() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [style, setStyle] = useState<AnimationStyle>('party');
  const [frameCount, setFrameCount] = useState(12);
  const [frameDelay, setFrameDelay] = useState(60);
  const [frames, setFrames] = useState<ImageData[]>([]);
  const [generating, setGenerating] = useState(false);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [gifSize, setGifSize] = useState<number>(0);

  // Regenerate frames whenever image/style/frameCount changes
  useEffect(() => {
    if (!image) return;
    setFrames(generateFrames(image, style, frameCount));
    setGifUrl(null);
  }, [image, style, frameCount]);

  const handleGenerate = useCallback(async () => {
    if (!frames.length) return;
    setGenerating(true);
    // Defer to next tick so the UI updates first
    await new Promise((r) => setTimeout(r, 0));
    const blob = encodeGif(frames, frameDelay);
    setGifSize(blob.size);
    if (gifUrl) URL.revokeObjectURL(gifUrl);
    setGifUrl(URL.createObjectURL(blob));
    setGenerating(false);
  }, [frames, frameDelay, gifUrl]);

  // Regenerate gif if frameDelay changed and a gif already exists
  useEffect(() => {
    if (gifUrl) setGifUrl(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameDelay]);

  const tooLarge = gifSize > 100 * 1024;

  return (
    <div className="min-h-screen" style={{ background: '#0d0d14' }}>
      {/* Header */}
      <header className="border-b border-gray-900 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎉</span>
            <span className="font-bold text-white text-lg tracking-tight">emoji playground</span>
          </div>
          <a
            href="https://github.com/yoavBenZion/emoji-playground"
            target="_blank"
            rel="noreferrer"
            className="text-gray-600 hover:text-gray-400 transition-colors text-sm"
          >
            GitHub
          </a>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-2xl mx-auto px-6 py-10 flex flex-col gap-8">
        {/* Upload */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Image
          </h2>
          <Uploader onImage={setImage} />
        </section>

        {/* Settings — only shown after image is loaded */}
        {image && (
          <>
            <section>
              <StylePicker value={style} onChange={setStyle} />
            </section>

            <section>
              <Controls
                frameCount={frameCount}
                frameDelay={frameDelay}
                onFrameCountChange={setFrameCount}
                onFrameDelayChange={setFrameDelay}
              />
            </section>

            {/* Preview + Export */}
            <section className="flex flex-col sm:flex-row gap-8 items-start">
              <Preview frames={frames} frameDelay={frameDelay} />

              <div className="flex flex-col gap-4 flex-1 pt-7">
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full py-3 px-6 rounded-xl font-semibold text-white bg-violet-600 hover:bg-violet-500 active:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? '⏳ Generating…' : '✨ Generate GIF'}
                </button>

                {gifUrl && (
                  <div className="flex flex-col gap-3">
                    <div className={`text-sm px-3 py-2 rounded-lg ${tooLarge ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'}`}>
                      {tooLarge ? '⚠️' : '✓'} {formatBytes(gifSize)}
                      {tooLarge && ' — Slack recommends < 100 KB. Try fewer frames.'}
                    </div>

                    <a
                      href={gifUrl}
                      download="emoji.gif"
                      className="w-full py-3 px-6 rounded-xl font-semibold text-center text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 transition-colors"
                    >
                      ⬇️ Download emoji.gif
                    </a>

                    <p className="text-xs text-gray-700 text-center">
                      Slack → Customize → Emoji → Add Emoji
                    </p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {!image && (
          <div className="text-center text-gray-700 text-sm py-4">
            Upload an image to get started ↑
          </div>
        )}
      </main>
    </div>
  );
}
