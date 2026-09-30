# Fistula Tracker — Shipaton demo video

A story-led, 118.6-second demo video for **Fistula Tracker**, built with
[Remotion](https://www.remotion.dev/) (React + TypeScript). The voice-over is
the timing authority; every visual change is keyed to its spoken words.

| | |
|---|---|
| Output | `out/fistula-tracker-shipaton.mp4` |
| Composition | `FistulaTracker` |
| Dimensions | 1920 × 1080 |
| Frame rate | 24 fps |
| Frame count | 2,847 frames |
| Runtime | 118.625 s (voice-over: 118.593 s) |
| Codec | H.264 (yuv420p), AAC 192 kbps |

## Install

```bash
npm install
```

Requires Node 18+. Source media stays untouched in `assets/`, which is served
as Remotion's public directory (see `remotion.config.ts`).

Remotion downloads its own headless Chromium on first use. In a sandbox without
access to `remotion.media`, point it at an installed Chromium / headless shell:

```bash
export BROWSER_EXECUTABLE=/path/to/chrome-headless-shell
```

## Preview

```bash
npm run preview          # opens Remotion Studio
```

Single frames without a full render (bundles once, writes `out/frames/t-<sec>.jpg`):

```bash
npm run stills -- 4 12 27.5 96
```

## Render

```bash
npm run render           # -> out/fistula-tracker-shipaton.mp4
npm run verify           # checks codec, size, fps, frame count, duration, pixel format
npm run contact-sheet    # -> out/contact-sheet.png (frames taken from the rendered MP4)
```

`npm run render` uses H.264 CRF 17 (x264 `slow`), yuv420p with BT.709
limited-range colour, and AAC 192 kbps; the result is ~70 MB. Add
`-- --concurrency=4` (or similar) to use more CPU cores. A full render takes
roughly 13 minutes on 4 cores.

## Project layout

```
assets/                     source media (unchanged)
src/
  Root.tsx                  compositions (video + contact-sheet utility still)
  Video.tsx                 master timeline, in voice-over seconds
  theme.ts                  palette, fonts, fps, safe margins, easing
  fonts.tsx                 local fonts (Instrument Serif, Manrope) + render gate
  data/captions.ts          sentence-level captions (word-aligned) + caption zones
  data/vo-words.json        forced-alignment output: every word's start/end time
  components/
    timing.tsx              <At> / useT(): author everything in absolute VO seconds
    Editorial.tsx           eyebrows, masked serif headlines, sub copy, timed lists
    Captions.tsx            two-line-max captions, measured to fit, rose highlights
    AppRecording.tsx        cropped app window, camera (zoom/focus), freeze frames
    AppLayout.tsx           recording on one side, text column on the other
    FistulaDiagram.tsx      original vector diagram with the tract drawn on
    Transitions.tsx         fades, soft reveals, mask reveals
    Grain.tsx               paper fibres, fine film grain, soft vignette
  scenes/
    Intro.tsx               hook, diagram, personal story, logo reveal
    AppRuns.tsx             app demo (4 runs), shot list with source trims
    Outro.tsx               "Care is never the paywall", callbacks, closing logo
  ContactSheet.tsx          layout for out/contact-sheet.png
scripts/
  align_vo.py               offline forced alignment (PocketSphinx) -> vo-words.json
  stills.mjs                preview stills at arbitrary timestamps
  contact-sheet.mjs         contact sheet from the rendered MP4
  verify.mjs                delivery-spec checks on the rendered MP4
```

## Adjusting timing

All times are **absolute voice-over seconds**, so a change in one scene never
shifts another.

- **Captions**: edit `src/data/captions.ts`. `s`/`e` come from
  `src/data/vo-words.json`; a caption shows from slightly before its first word
  until just after its last (or until the next caption).
- **App shots**: edit the `*_SHOTS` arrays in `src/scenes/AppRuns.tsx`.
  `at` = VO second, `clip` = position in the recording, `holdAt` = clean
  freeze frame, `cam` = zoom/focus keyframes (zoom is capped at 1.1 so only the
  app's side padding is ever cropped).
- **Scene windows**: `src/Video.tsx`.

To regenerate word timings (fully offline, no API):

```bash
pip install pocketsphinx   # bundles its own English acoustic model
python3 scripts/align_vo.py
```

## Notes and editorial decisions

- The transcript's "Revenue cap" is a recognition error; it is always shown as
  **RevenueCat**.
- Captions are hidden only where the same words are already typeset on screen
  word for word (the opening hook, "Care is never the paywall.", and the
  closing "more organized, more private, and a little less lonely").
- Recording ranges that are deliberately never shown: the onboarding header
  that names the developer, the system photo picker (it shows a personal
  gallery), the store-check spinner and any touch indicator on the supporter
  screen (the purchase is already complete; only the confirmed state is shown).
- Status and gesture bars are cropped from every recording; recordings are
  only ever scaled uniformly.
- No music or sound effects: the voice-over is the only audio.
