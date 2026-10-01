// Loudness-masters the rendered video for online playback.
// The video stream is copied untouched; only the audio level changes
// (EBU R128 two-pass loudnorm in linear mode = one constant gain, so the
// voice-over's timing, speed and pitch are unchanged).
//
// Usage: node scripts/master-audio.mjs [in.mp4] [out.mp4]
import {spawnSync} from 'node:child_process';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
// Ignore stray flags (e.g. `npm run render -- --concurrency=4` appends them to this script too).
const [inArg, outArg] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const input = path.resolve(inArg ?? path.join(root, 'out', 'tmp', 'render.mp4'));
const output = path.resolve(outArg ?? path.join(root, 'out', 'fistula-tracker-shipaton.mp4'));
// -17 LUFS is the loudest target this voice-over reaches with a pure linear gain under a -1.5 dBTP ceiling.
const TARGET = {I: -17, TP: -1.5, LRA: 11};

/** Runs Remotion's bundled ffmpeg and returns its stderr (where ffmpeg reports). */
const ffmpeg = (args) => {
	const r = spawnSync('npx', ['remotion', 'ffmpeg', '-hide_banner', ...args], {encoding: 'utf8'});
	if (r.status !== 0) throw new Error(`ffmpeg failed:\n${r.stderr}`);
	return r.stderr;
};

// Pass 1: measure.
const report = ffmpeg(['-i', input, '-vn', '-af', `loudnorm=I=${TARGET.I}:TP=${TARGET.TP}:LRA=${TARGET.LRA}:print_format=json`, '-f', 'null', '-']);
const json = (report.match(/\{[^{}]*"input_i"[^{}]*\}/g) ?? []).pop();
if (!json) throw new Error('Could not read the loudnorm measurement');
const m = JSON.parse(json);
console.log(`measured: ${m.input_i} LUFS, true peak ${m.input_tp} dBTP, LRA ${m.input_lra} LU`);

// Pass 2: apply.
const filter =
	`loudnorm=I=${TARGET.I}:TP=${TARGET.TP}:LRA=${TARGET.LRA}` +
	`:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}` +
	`:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true:print_format=json`;
const applied = ffmpeg([
	'-y', '-i', input,
	'-map', '0:v:0', '-map', '0:a:0',
	'-c:v', 'copy',
	'-af', filter, '-ar', '48000', '-c:a', 'aac', '-b:a', '192k',
	'-movflags', '+faststart',
	output,
]);
const out = JSON.parse((applied.match(/\{[^{}]*"output_i"[^{}]*\}/g) ?? ['{}']).pop());
console.log(`output:   ${out.output_i} LUFS, true peak ${out.output_tp} dBTP (${out.normalization_type} normalization)`);
console.log(`mastered -> ${path.relative(root, output)}`);
