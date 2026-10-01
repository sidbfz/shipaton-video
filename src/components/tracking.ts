import TRACKS_JSON from '../data/tracks.json';
import {f, FPS} from '../theme';
import type {Box, PhoneShot} from './Phone';

/**
 * Frame-by-frame positions of app sections in the screen recordings,
 * produced offline by scripts/track_targets.py (see that file).
 *
 * dy[k] is the vertical offset (source px) of the section at source frame
 * s0 + k relative to the reference frame its box was measured on; null when
 * the section is off-screen.
 */
type Track = {src: string; s0: number; s1: number; box: Box; dy: (number | null)[]; err: number[]};
export const TRACKS = TRACKS_JSON as unknown as Record<string, Track>;

/** Source frame shown by a shot at absolute VO time t (24 fps; holds at holdAt). */
export const sourceFrameAt = (shot: PhoneShot, t: number) => {
	const s = f(shot.clip) + (Math.round(t * FPS) - f(shot.at));
	return shot.holdAt === undefined ? s : Math.min(s, Math.round(shot.holdAt * FPS));
};

const dyAt = (tr: Track, s: number) => {
	const k = Math.min(tr.dy.length - 1, Math.max(0, s - tr.s0));
	return tr.dy[k];
};

/** Nearest known offset (searches a few frames either side while fading in/out). */
const nearestDy = (tr: Track, s: number) => {
	for (let r = 0; r <= 6; r++) {
		const a = dyAt(tr, s - r);
		if (a !== null) return a;
		const b = dyAt(tr, s + r);
		if (b !== null) return b;
	}
	return null;
};

export type TrackState = {
	/** box in source px at this frame */
	box: Box;
	/** 0..1 — fades over ~4 frames as the section enters/leaves the screen */
	visible: number;
	/** vertical speed in source px per frame */
	speed: number;
};

export const trackState = (id: string, shot: PhoneShot, t: number): TrackState | null => {
	const tr = TRACKS[id];
	if (!tr) throw new Error(`Unknown track "${id}" — run scripts/track_targets.py`);
	const s = sourceFrameAt(shot, t);
	const dy = nearestDy(tr, s);
	if (dy === null) return null;
	let seen = 0;
	for (let k = -2; k <= 2; k++) if (dyAt(tr, s + k) !== null) seen++;
	const here = dyAt(tr, s) !== null;
	const visible = here ? Math.min(1, 0.4 + seen * 0.12) : Math.max(0, (seen - 1) * 0.15);
	const prev = nearestDy(tr, s - 1) ?? dy;
	const next = nearestDy(tr, s + 1) ?? dy;
	const [x, y, w, h] = tr.box;
	return {box: [x, y + dy, w, h], visible, speed: Math.abs(next - prev) / 2};
};

/** Checks that a tracked highlight only covers source frames the tracker measured. */
export const checkTrackRange = (id: string, shot: PhoneShot, from: number, to: number, where: string) => {
	const tr = TRACKS[id];
	if (!tr) throw new Error(`${where}: unknown track "${id}"`);
	if (tr.src !== shot.src) throw new Error(`${where}: track "${id}" is for ${tr.src}`);
	const a = sourceFrameAt(shot, from);
	const b = sourceFrameAt(shot, to);
	if (a < tr.s0 || b > tr.s1) {
		throw new Error(`${where}: needs source frames ${a}–${b}, track "${id}" covers ${tr.s0}–${tr.s1}`);
	}
};
