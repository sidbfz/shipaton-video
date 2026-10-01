import {interpolate} from 'remotion';
import {ease} from '../theme';

/**
 * One phone carries the whole app demo (24.2s–105s). It sits left or right of
 * the editorial text, briefly becomes the first of three phones for the
 * daily check-in, and glides across at section changes instead of cutting to
 * an empty frame.
 */
export const PHONE = {sh: 950, cy: 540, left: 560, right: 1360};
export const TRIPTYCH = {sh: 740, cy: 445, slots: [560, 960, 1360]};

type Key = {t: number; cx: number; cy: number; sh: number};
const L = {cx: PHONE.left, cy: PHONE.cy, sh: PHONE.sh};
const R = {cx: PHONE.right, cy: PHONE.cy, sh: PHONE.sh};
const T1 = {cx: TRIPTYCH.slots[0], cy: TRIPTYCH.cy, sh: TRIPTYCH.sh};
/** While travelling across the frame the phone is smaller, so it never passes over a caption. */
const smallAt = (cx: number) => ({cx, cy: TRIPTYCH.cy, sh: TRIPTYCH.sh});

export const PHONE_PATH: Key[] = [
	{t: 24.2, ...L},
	{t: 43.15, ...L},
	{t: 43.75, ...T1}, // daily check-in: three phones side by side
	{t: 47.2, ...T1},
	{t: 47.85, ...smallAt(PHONE.right)},
	{t: 48.35, ...R}, // history, medicines, routines, journal
	{t: 68.2, ...R},
	{t: 69.0, ...L}, // photos, privacy, medical boundary (moves during the pause in the narration)
	{t: 90.8, ...L},
	{t: 91.15, ...smallAt(PHONE.left)},
	{t: 91.75, ...smallAt(PHONE.right)},
	{t: 92.15, ...R}, // free care, Lifetime Supporter
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

/** Which side the editorial text column is on (opposite the phone). */
export const TEXT_COL = {
	right: {x: 940, width: 820},
	left: {x: 160, width: 820},
	top: 110,
	bottom: 860,
};

/** Dark full-frame fields: the opening hook and "Care is never the paywall". Captions turn light over them. */
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
