import { useState, useEffect, useCallback } from 'react';
import type { AnimationStyle } from './types';
import { STYLES } from './types';
import Uploader from './components/Uploader';
import StylePicker from './components/StylePicker';
import Controls from './components/Controls';
import Preview from './components/Preview';
import { generateFrames } from './lib/animations';
import { encodeGif, formatBytes } from './lib/gifEncoder';

const FLOATING_EMOJIS = ['🎉', '🌀', '🏀', '📳', '💓', '🎊', '✨', '🔥', '💜', '🎈'];

const STEPS = [
  { icon: '🖼️', label: 'Upload', desc: 'Any PNG, JPG or WebP. Remove the background with one click.' },
  { icon: '🎨', label: 'Animate', desc: 'Pick a style, set the speed, preview in real time.' },
  { icon: '⬇️', label: 'Download', desc: 'Get a 128×128 GIF ready to drop straight into Slack.' },
];

export default function App() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [style, setStyle] = useState<AnimationStyle>('party');
  const [frameCount, setFrameCount] = useState(12);
  const [frameDelay, setFrameDelay] = useState(60);
  const [frames, setFrames] = useState<ImageData[]>([]);
  const [generating, setGenerating] = useState(false);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [gifSize, setGifSize] = useState<number>(0);

  useEffect(() => {
    if (!image) return;
    setFrames(generateFrames(image, style, frameCount));
    setGifUrl(null);
  }, [image, style, frameCount]);

  const handleGenerate = useCallback(async () => {
    if (!frames.length) return;
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 0));
    const blob = encodeGif(frames, frameDelay);
    setGifSize(blob.size);
    if (gifUrl) URL.revokeObjectURL(gifUrl);
    setGifUrl(URL.createObjectURL(blob));
    setGenerating(false);
  }, [frames, frameDelay, gifUrl]);

  useEffect(() => {
    if (gifUrl) setGifUrl(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameDelay]);

  const tooLarge = gifSize > 100 * 1024;

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: 'linear-gradient(160deg, #130a24 0%, #0d0d14 40%)' }}>

      {/* Floating emoji decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        {FLOATING_EMOJIS.map((emoji, i) => (
          <span
            key={i}
            className="absolute text-2xl select-none"
            style={{
              left: `${(i * 11 + 5) % 95}%`,
              top: `${(i * 17 + 8) % 85}%`,
              opacity: 0.07,
              animation: `float ${6 + (i % 4)}s ease-in-out ${i * 0.7}s infinite alternate`,
            }}
          >
            {emoji}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes float {
          from { transform: translateY(0px) rotate(-5deg); }
          to   { transform: translateY(-18px) rotate(5deg); }
        }
        @keyframes pulse-border {
          0%, 100% { box-shadow: 0 0 0 0 rgba(139,92,246,0.3); }
          50%       { box-shadow: 0 0 0 8px rgba(139,92,246,0); }
        }
      `}</style>

      {/* Header */}
      <header className="relative z-10 px-6 pt-6 pb-0">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎉</span>
            <span className="font-bold text-white tracking-tight">emoji playground</span>
          </div>
          <a
            href="https://github.com/yoavBenZion/emoji-playground"
            target="_blank"
            rel="noreferrer"
            className="text-gray-600 hover:text-gray-400 transition-colors text-sm"
          >
            GitHub ↗
          </a>
        </div>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-6 pb-16 flex flex-col gap-10">

        {/* Hero */}
        <section className="text-center pt-12 pb-2">
          <div className="text-6xl mb-5" style={{ filter: 'drop-shadow(0 0 24px rgba(139,92,246,0.5))' }}>
            🎉
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-3">
            Make your Slack emojis{' '}
            <span style={{ background: 'linear-gradient(90deg, #a78bfa, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              actually fun
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-md mx-auto">
            Upload any image → add animation → download a 128px GIF ready to drop into Slack.
          </p>
        </section>

        {/* How it works */}
        {!image && (
          <section className="grid grid-cols-3 gap-4">
            {STEPS.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-2 p-4 rounded-2xl border border-gray-800/60 bg-white/[0.02]">
                <span className="text-3xl">{step.icon}</span>
                <span className="font-semibold text-white text-sm">{step.label}</span>
                <span className="text-gray-500 text-xs leading-relaxed">{step.desc}</span>
              </div>
            ))}
          </section>
        )}

        {/* Upload */}
        <section>
          <Uploader onImage={setImage} />
        </section>

        {/* Style picker — always visible, locked pre-upload */}
        <section className="relative">
          {!image && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl backdrop-blur-[1px]"
              style={{ background: 'rgba(13,13,20,0.6)' }}>
              <span className="text-sm text-gray-500 bg-gray-900/80 px-4 py-2 rounded-full border border-gray-800">
                ☝️ Upload an image to unlock
              </span>
            </div>
          )}
          <div className={!image ? 'opacity-40 pointer-events-none select-none' : ''}>
            <StylePicker value={style} onChange={setStyle} />
          </div>
        </section>

        {/* Style feature pills — shown pre-upload to telegraph what's possible */}
        {!image && (
          <section className="flex flex-wrap gap-2 justify-center -mt-6">
            {STYLES.map((s) => (
              <span key={s.id} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-gray-800 text-gray-500 bg-white/[0.02]">
                <span>{s.emoji}</span>
                <span>{s.label}</span>
              </span>
            ))}
            <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-gray-800 text-gray-500 bg-white/[0.02]">
              ✂️ BG Removal
            </span>
          </section>
        )}

        {/* Controls — always visible, locked pre-upload */}
        <section className="relative">
          {!image && (
            <div className="absolute inset-0 z-10 rounded-2xl" style={{ background: 'rgba(13,13,20,0.6)' }} />
          )}
          <div className={!image ? 'opacity-40 pointer-events-none select-none' : ''}>
            <Controls
              frameCount={frameCount}
              frameDelay={frameDelay}
              onFrameCountChange={setFrameCount}
              onFrameDelayChange={setFrameDelay}
            />
          </div>
        </section>

        {/* Preview + Export — only after image loaded */}
        {image && (
          <section className="flex flex-col sm:flex-row gap-8 items-start">
            <Preview frames={frames} frameDelay={frameDelay} />

            <div className="flex flex-col gap-4 flex-1 pt-7">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full py-3 px-6 rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  animation: !generating ? 'pulse-border 2.5s infinite' : 'none',
                }}
              >
                {generating ? '⏳ Generating…' : '✨ Generate GIF'}
              </button>

              {gifUrl && (
                <div className="flex flex-col gap-3">
                  <div className={`text-sm px-3 py-2 rounded-lg ${tooLarge ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'}`}>
                    {tooLarge ? '⚠️' : '✓'} {formatBytes(gifSize)}
                    {tooLarge && ' — Try fewer frames to get under 100 KB.'}
                  </div>

                  <a
                    href={gifUrl}
                    download="emoji.gif"
                    className="w-full py-3 px-6 rounded-xl font-semibold text-center text-white bg-emerald-600 hover:bg-emerald-500 transition-colors"
                  >
                    ⬇️ Download emoji.gif
                  </a>

                  <p className="text-xs text-gray-600 text-center">
                    Slack → Customize Workspace → Emoji → Add Emoji
                  </p>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
