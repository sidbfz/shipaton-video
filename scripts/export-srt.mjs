// Writes out/fistula-tracker-shipaton.srt from src/data/captions.ts — the
// subtitle track to upload alongside the video (e.g. on YouTube), instead of
// burning captions into the picture. Every spoken line is included, also the
// ones the video typesets on screen, so the track is complete on its own.
// Usage: npm run srt   (Node 22.6+: loads the .ts data file directly)
import fs from 'node:fs';
import path from 'node:path';
import {CAPTIONS} from '../src/data/captions.ts';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = path.join(root, 'out', 'fistula-tracker-shipaton.srt');

const LEAD = 0.12; // same timing as the on-screen captions (src/components/Captions.tsx)
const TAIL = 0.7;
const MAX_LINE = 42; // characters per subtitle line

const stamp = (s) => {
	const ms = Math.max(0, Math.round(s * 1000));
	const p = (n, w = 2) => String(n).padStart(w, '0');
	return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};

/** One line if it fits, otherwise two lines of similar length. */
const wrap = (text) => {
	if (text.length <= MAX_LINE) return text;
	const words = text.split(' ');
	let best = null;
	for (let k = 1; k < words.length; k++) {
		const a = words.slice(0, k).join(' ');
		const b = words.slice(k).join(' ');
		const score = Math.max(a.length, b.length);
		if (!best || score < best.score) best = {score, text: `${a}\n${b}`};
	}
	return best.text;
};

const blocks = CAPTIONS.map((c, i) => {
	const next = CAPTIONS[i + 1];
	const from = Math.max(0, c.s - LEAD);
	const to = next ? Math.min(next.s - LEAD - 0.02, c.e + TAIL) : c.e + TAIL;
	return `${i + 1}\n${stamp(from)} --> ${stamp(to)}\n${wrap(c.text)}\n`;
});

fs.mkdirSync(path.dirname(out), {recursive: true});
fs.writeFileSync(out, blocks.join('\n'));
console.log(`${CAPTIONS.length} subtitles -> ${path.relative(root, out)}`);
