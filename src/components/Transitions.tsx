import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {ease} from '../theme';
import {useT} from './timing';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 0 -> 1 progress between two absolute times with an easing curve. */
export const useProgress = (from: number, to: number, easing = ease.out) => {
	const t = useT();
	return interpolate(t, [from, to], [0, 1], {...clamp, easing});
};

/** Opacity envelope: fades in at `inAt` and out at `outAt` (absolute seconds). */
export const useFade = (inAt: number, outAt = Infinity, inDur = 0.5, outDur = 0.4) => {
	const t = useT();
	const a = inDur <= 0 ? 1 : interpolate(t, [inAt, inAt + inDur], [0, 1], {...clamp, easing: ease.soft});
	const b = outAt === Infinity ? 1 : interpolate(t, [outAt - outDur, outAt], [1, 0], {...clamp, easing: ease.soft});
	return Math.min(a, b);
};

/**
 * Soft reveal: rises a few pixels and un-blurs while fading in.
 * Used for supporting text so motion stays restrained.
 */
export const Reveal: React.FC<{
	at: number;
	out?: number;
	dur?: number;
	outDur?: number;
	dy?: number;
	style?: React.CSSProperties;
	children: React.ReactNode;
}> = ({at, out = Infinity, dur = 0.7, outDur = 0.4, dy = 18, style, children}) => {
	const t = useT();
	const p = interpolate(t, [at, at + dur], [0, 1], {...clamp, easing: ease.out});
	const opacity = useFade(at, out, dur * 0.8, outDur);
	const outShift = out === Infinity ? 0 : interpolate(t, [out - outDur, out], [0, -8], clamp);
	return (
		<div
			style={{
				opacity,
				transform: `translateY(${(1 - p) * dy + outShift}px)`,
				filter: p < 1 ? `blur(${(1 - p) * 4}px)` : undefined,
				...style,
			}}
		>
			{children}
		</div>
	);
};

/**
 * Editorial masked line reveal: the line slides up from behind a mask.
 */
export const MaskLine: React.FC<{
	at: number;
	out?: number;
	dur?: number;
	style?: React.CSSProperties;
	children: React.ReactNode;
}> = ({at, out = Infinity, dur = 0.9, style, children}) => {
	const t = useT();
	const p = interpolate(t, [at, at + dur], [0, 1], {...clamp, easing: ease.out});
	const opacity = useFade(at, out, dur * 0.5, 0.45);
	return (
		<div style={{overflow: 'hidden', paddingBottom: '0.12em', marginBottom: '-0.12em', ...style}}>
			<div style={{transform: `translateY(${(1 - p) * 105}%)`, opacity}}>{children}</div>
		</div>
	);
};

/** Full-frame cross-dissolve layer with optional slow scale drift. */
export const FadeLayer: React.FC<{
	inAt: number;
	outAt?: number;
	inDur?: number;
	outDur?: number;
	style?: React.CSSProperties;
	children: React.ReactNode;
}> = ({inAt, outAt = Infinity, inDur = 0.5, outDur = 0.5, style, children}) => {
	const opacity = useFade(inAt, outAt, inDur, outDur);
	return <AbsoluteFill style={{opacity, ...style}}>{children}</AbsoluteFill>;
};
