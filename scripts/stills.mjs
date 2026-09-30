// Render preview stills at given VO timestamps (seconds) without a full render.
// Usage: node scripts/stills.mjs 4 12 27.5 ...   -> out/frames/t-<sec>.jpg
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const times = process.argv.slice(2).map(Number);
const outDir = path.join(root, 'out', 'frames');
fs.mkdirSync(outDir, {recursive: true});

const serveUrl = await bundle({
	entryPoint: path.join(root, 'src', 'index.ts'),
	publicDir: path.join(root, 'assets'),
});
const composition = await selectComposition({
	serveUrl,
	id: 'FistulaTracker',
	browserExecutable: process.env.BROWSER_EXECUTABLE ?? null,
});
for (const t of times) {
	const frame = Math.min(composition.durationInFrames - 1, Math.round(t * composition.fps));
	const output = path.join(outDir, `t-${t.toFixed(2)}.jpg`);
	await renderStill({
		composition,
		serveUrl,
		frame,
		output,
		imageFormat: 'jpeg',
		jpegQuality: 90,
		browserExecutable: process.env.BROWSER_EXECUTABLE ?? null,
	});
	console.log(output);
}
