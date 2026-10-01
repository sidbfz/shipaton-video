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
| Codec | H.264 (yuv420p, BT.709), AAC 192 kbps, mastered to −17 LUFS |

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
npm run render           # -> out/tmp/render.mp4, then audio mastering -> out/fistula-tracker-shipaton.mp4
npm run verify           # checks codec, size, fps, frame count, duration, pixel format
npm run contact-sheet    # -> out/contact-sheet.png (frames taken from the rendered MP4)
```

`npm run render` encodes H.264 CRF 17 (x264 `slow`), yuv420p with BT.709
limited-range colour and AAC 192 kbps, then `scripts/master-audio.mjs` copies the
video stream untouched and raises the voice-over to −17 LUFS (true peak ≤ −1.5
dBTP) with a single linear gain — timing, speed and pitch are unchanged. Set
`REMOTION_CONCURRENCY=4` to use more CPU cores; a full render takes roughly
10 minutes on 4 cores.

## Project layout

```
assets/                     source media (unchanged)
src/
  Root.tsx                  compositions (video + contact-sheet utility still)
  Video.tsx                 master timeline, in voice-over seconds
  theme.ts                  palette, fonts, fps, safe margins, easing
  fonts.tsx                 local fonts (Instrument Serif, Manrope) + render gate
  data/captions.ts          sentence-level captions (word-aligned) + caption zones
  data/timeline.ts          the phone's path across the frame, text columns, dark fields
  data/vo-words.json        forced-alignment output: every word's start/end time
  components/
    timing.tsx              <At> / useT(): author everything in absolute VO seconds
    Editorial.tsx           eyebrows, masked serif headlines, sub copy, timed lists
    Captions.tsx            two-line-max captions, measured to fit, rose highlights,
                            light-on-dark over the dark fields
    Phone.tsx               phone at true 9:20 proportions: full screen, never zoomed,
                            clean status bar, dips between screens, highlights,
                            touch-dot patches on freeze frames
    phoneGeometry.ts        phone dimensions and source-px -> canvas mapping
    FistulaDiagram.tsx      original vector diagram with the tract drawn on
    Transitions.tsx         fades, soft reveals, mask reveals
    Grain.tsx               paper fibres, fine film grain, soft vignette
  scenes/
    Intro.tsx               hook, diagram, personal story, logo reveal
    Demo.tsx                app demo: one phone, shot list with source trims,
                            highlights, check-in triptych, editorial beats
    Outro.tsx               "Care is never the paywall" (grows out of the app's card),
                            phone callbacks, closing logo
  ContactSheet.tsx          layout for out/contact-sheet.png
scripts/
  align_vo.py               offline forced alignment (PocketSphinx) -> vo-words.json
  stills.mjs                preview stills at arbitrary timestamps
  contact-sheet.mjs         contact sheet from the rendered MP4
  verify.mjs                delivery-spec checks on the rendered MP4
  master-audio.mjs          two-pass EBU R128 loudness mastering (video stream copied)
```

## Adjusting timing

All times are **absolute voice-over seconds**, so a change in one scene never
shifts another.

- **Captions**: edit `src/data/captions.ts`. `s`/`e` come from
  `src/data/vo-words.json`; a caption shows from slightly before its first word
  until just after its last (or until the next caption).
- **App shots**: edit `MAIN_SHOTS` (and the triptych `SLOT*_SHOTS`) in
  `src/scenes/Demo.tsx`. `at` = VO second, `clip` = position in the recording,
  `holdAt` = clean freeze frame, `highlights` = boxes in source pixels
  (720 × 1606) to outline while the narration names them, `patches` = paint out
  a frozen touch indicator on a flat button.
- **Phone movement**: `PHONE_PATH` in `src/data/timeline.ts`.
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
  word for word (the opening hook, "Care is never the paywall.", "I hope you
  never need it.", and the closing "more organized, more private, and a little
  less lonely").
- Recording ranges that are deliberately never shown: the onboarding header
  that names the developer, the system photo picker (it shows a personal
  gallery), the store-check spinner and any touch indicator on the supporter
  screen (the purchase is already complete; only the confirmed state is shown).
- The app is always shown as a complete phone screen at its true proportions;
  it is never cropped or zoomed. The status bar (clock, notification icons) is
  covered with the app's own background; recordings are only scaled uniformly.
- No music or sound effects: the voice-over is the only audio.
