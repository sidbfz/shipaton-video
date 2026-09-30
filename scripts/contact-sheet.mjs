// Builds out/contact-sheet.png from frames of the *rendered* MP4.
// Usage: node scripts/contact-sheet.mjs [path/to/video.mp4]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const video = path.resolve(process.argv[2] ?? path.join(root, 'out', 'fistula-tracker-shipaton.mp4'));
const tmp = path.join(root, 'out', 'tmp');
fs.mkdirSync(tmp, {recursive: true});

// Timestamps requested for review (nudged <1s off beat changes so no text is mid-fade), plus the final frame.
const TIMES = [4, 12, 27, 40, 52, 64, 74.5, 85.8, 96.6, 108, 116, 118.58];
const FPS = 24;
const fmt = (t) => {
	const m = Math.floor(t / 60);
	const s = t - m * 60;
	return `${String(m).padStart(2, '0')}:${s.toFixed(s % 1 ? 2 : 0).padStart(s % 1 ? 5 : 2, '0')}`;
};

const frames = TIMES.map((t) => {
	const out = path.join(tmp, `sheet-${t}.jpg`);
	execFileSync('npx', ['remotion', 'ffmpeg', '-v', 'error', '-y', '-ss', String(t), '-i', video, '-frames:v', '1', '-vf', 'scale=1040:-2', '-q:v', '3', out]);
	const src = `data:image/jpeg;base64,${fs.readFileSync(out).toString('base64')}`;
	return {label: `${fmt(t)}  ·  FRAME ${Math.round(t * FPS)}`, src};
});

const browserExecutable = process.env.BROWSER_EXECUTABLE ?? null;
const serveUrl = await bundle({entryPoint: path.join(root, 'src', 'index.ts'), publicDir: path.join(root, 'assets')});
const inputProps = {title: 'Fistula Tracker — Shipaton demo · contact sheet', frames};
const composition = await selectComposition({serveUrl, id: 'ContactSheet', inputProps, browserExecutable});
const output = path.join(root, 'out', 'contact-sheet.png');
await renderStill({composition, serveUrl, output, inputProps, imageFormat: 'png', browserExecutable});
console.log(output);
