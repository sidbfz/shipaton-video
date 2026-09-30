// Verifies the rendered MP4 against the delivery spec.
// Usage: node scripts/verify.mjs [path/to/video.mp4]
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const file = path.resolve(process.argv[2] ?? path.join(root, 'out', 'fistula-tracker-shipaton.mp4'));
const probe = JSON.parse(
	execFileSync('npx', ['remotion', 'ffprobe', '-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', file]).toString(),
);
const v = probe.streams.find((s) => s.codec_type === 'video');
const a = probe.streams.find((s) => s.codec_type === 'audio');
const size = fs.statSync(file).size;
const checks = [
	['video stream present', !!v],
	['audio stream present', !!a],
	['H.264 video', v?.codec_name === 'h264'],
	['AAC audio', a?.codec_name === 'aac'],
	['1920 x 1080', v?.width === 1920 && v?.height === 1080],
	['24 fps', v?.r_frame_rate === '24/1' && v?.avg_frame_rate === '24/1'],
	['2847 frames', Number(v?.nb_frames) === 2847],
	['yuv420p', v?.pix_fmt === 'yuv420p'],
	['video duration 118.625s', Math.abs(Number(v?.duration) - 118.625) < 0.001],
	['audio starts at 0', Number(a?.start_time) === 0],
	['under two minutes', Number(probe.format.duration) < 120],
	['under GitHub 100 MB limit', size < 100 * 1024 * 1024],
];
for (const [name, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
console.log(
	`\n${path.relative(root, file)}\n  duration ${probe.format.duration}s (video ${v?.duration}s, audio ${a?.duration}s)` +
		`\n  ${v?.width}x${v?.height} @ ${v?.r_frame_rate} fps, ${v?.nb_frames} frames, ${v?.codec_name} ${v?.pix_fmt} ${v?.color_space ?? ''}` +
		`\n  ${a?.codec_name} ${a?.sample_rate} Hz ${a?.channels}ch` +
		`\n  ${(size / 1e6).toFixed(1)} MB (${size} bytes)`,
);
process.exit(checks.every(([, ok]) => ok) ? 0 : 1);
