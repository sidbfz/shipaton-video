import {interpolate} from 'remotion';
import {phoneDims} from '../components/phoneGeometry';
import {ease} from '../theme';

/**
 * One phone carries the whole app demo (24.2s–105s). It stays centred on the
 * frame's centre — a headline on its left, callouts attached to the
 * highlighted control on its right — and only leaves the centre to become the
 * first of three phones for the daily check-in. There are no burned-in
 * captions (they ship as a separate .srt), so the phone uses the full height.
 */
export const PHONE = {sh: 950, cy: 540, cx: 960};
export const TRIPTYCH = {sh: 860, cy: 540, slots: [505, 960, 1415]};

type Key = {t: number; cx: number; cy: number; sh: number};
const C = {cx: PHONE.cx, cy: PHONE.cy, sh: PHONE.sh};
const T1 = {cx: TRIPTYCH.slots[0], cy: TRIPTYCH.cy, sh: TRIPTYCH.sh};

export const PHONE_PATH: Key[] = [
	{t: 24.2, ...C},
	{t: 43.15, ...C},
	{t: 43.75, ...T1}, // daily check-in: three phones side by side
	{t: 47.2, ...T1},
	{t: 47.85, ...C},
];

export const phoneAt = (t: number) => {
	const keys = PHONE_PATH;
	if (t <= keys[0].t) return keys[0];
	for (let i = 0; i < keys.length - 1; i++) {
		const a = keys[i];
		const b = keys[i + 1];
		if (t <= b.t) {
			const opts = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease.inOut} as const;
			return {
				t,
				cx: interpolate(t, [a.t, b.t], [a.cx, b.cx], opts),
				cy: interpolate(t, [a.t, b.t], [a.cy, b.cy], opts),
				sh: interpolate(t, [a.t, b.t], [a.sh, b.sh], opts),
			};
		}
	}
	return keys[keys.length - 1];
};

/**
 * Text columns either side of the centred phone. Both sit the same distance
 * (GAP) from the device, so the eye travels equally far in each direction.
 */
const GAP = 100;
const halfDevice = phoneDims(PHONE.sh).deviceW / 2;
export const SIDE = {
	/** right edge of the left (headline) column */
	leftEdge: Math.round(PHONE.cx - halfDevice - GAP),
	/** left edge of the right (callout) column */
	rightEdge: Math.round(PHONE.cx + halfDevice + GAP),
	width: 520,
	top: 130,
	bottom: 950,
};

/** Dark full-frame fields: the opening hook and "Care is never the paywall". */
export const HOOK_LIFT = {from: 6.35, to: 7.25};
/** The line clears first ('paywall' ends 106.34s), then the dark field lifts slowly. */
export const CARE_CARD = {expandFrom: 104.75, expandTo: 105.35, textOut: 106.6, outFrom: 106.55, outTo: 107.25};

export const darknessAt = (t: number) => {
	const c = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease.inOut} as const;
	const hook = interpolate(t, [HOOK_LIFT.from, HOOK_LIFT.to], [1, 0], c);
	const care = Math.min(
		interpolate(t, [CARE_CARD.expandFrom, CARE_CARD.expandTo], [0, 1], c),
		interpolate(t, [CARE_CARD.outFrom, CARE_CARD.outTo], [1, 0], c),
	);
	return Math.max(hook, care);
};
