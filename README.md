# 🎉 Emoji Playground

Turn any image into a fun animated Slack emoji — right in your browser.

**[emoji-playground.yoavbenzion.github.io](https://yoavbenzion.github.io/emoji-playground/)**

## Features

- **5 animation styles** — Party (rainbow wave), Spin, Bounce, Shake, Pulse
- **Background removal** — strip the background in-browser, no external tools needed
- **Speed control** — Turbo to Glacial frame delay presets
- **Frame count** — 8 to 24 frames for smoothness vs. file size trade-off
- **Auto-sized to 128×128px** — Slack's emoji format, ready to upload
- **File size warning** — flags anything over 100 KB before you download

Everything runs client-side. No uploads, no accounts, no API keys.

## Usage

1. Upload an image (PNG, JPG, GIF, WebP)
2. Optionally remove the background with one click
3. Pick an animation style and dial in speed + frame count
4. Hit **Generate GIF** and download
5. In Slack: **Customize → Emoji → Add Emoji** → upload the file

## Local Development

```bash
nvm use        # requires Node via nvm
npm install
npm run dev
```

## Deploy

```bash
npm run deploy  # builds and pushes to gh-pages branch
```

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4
- [`@imgly/background-removal`](https://github.com/imgly/background-removal-js) — in-browser ML background removal
- [`gifenc`](https://github.com/mattdesl/gifenc) — fast GIF encoding

## Inspired by

[party-ify](https://github.com/nathanielw/party-ify) — rebuilt from scratch with more styles, bg removal, and a cleaner UI.
