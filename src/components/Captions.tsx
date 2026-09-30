import {fitTextOnNLines, measureText} from '@remotion/layout-utils';
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {CAPTION_ZONES, CAPTIONS, CaptionDef, CaptionZone} from '../data/captions';
import {colors, ease, fonts} from '../theme';
import {useT} from './timing';

const LEAD = 0.12; // caption appears slightly before the first word
const TAIL = 0.7; // and lingers after the last word unless the next one starts
const FADE = 0.16;

const ZONES: Record<CaptionZone, {left: number; width: number; maxFont: number}> = {
	center: {left: 300, width: 1320, maxFont: 36},
	colLeft: {left: 160, width: 760, maxFont: 33},
	colRight: {left: 1000, width: 760, maxFont: 33},
};
const BOTTOM = 84;

type Timed = CaptionDef & {from: number; to: number; zone: CaptionZone};

const zoneAt = (t: number): CaptionZone => {
	let zone: CaptionZone = 'center';
	for (const z of CAPTION_ZONES) {
		if (t >= z.from) zone = z.zone;
	}
	return zone;
};

export const TIMED_CAPTIONS: Timed[] = CAPTIONS.map((c, i) => {
	const next = CAPTIONS[i + 1];
	const from = Math.max(0, c.s - LEAD);
	const to = next ? Math.min(next.s - LEAD - 0.02, c.e + TAIL) : c.e + TAIL;
	return {...c, from, to, zone: zoneAt(c.s)};
});

const layoutCache = new Map<string, {fontSize: number; lines: string[]}>();
const layoutFor = (text: string, zone: CaptionZone) => {
	const key = `${zone}|${text}`;
	const hit = layoutCache.get(key);
	if (hit) return hit;
	const z = ZONES[zone];
	const res = fitTextOnNLines({
		text,
		maxLines: 2,
		maxBoxWidth: z.width,
		fontFamily: 'Manrope',
		fontWeight: 500,
		maxFontSize: z.maxFont,
	});
	const fontSize = Math.min(res.fontSize, z.maxFont);
	const width = (s: string) =>
		measureText({text: s, fontFamily: 'Manrope', fontWeight: 500, fontSize, letterSpacing: '-0.005em'}).width;
	// Rebalance two-line captions so the lines have similar widths
	// (no long first line with a lonely last word), keeping both inside the box.
	let lines = res.lines;
	if (lines.length === 2) {
		const words = text.split(' ');
		let bestDiff = Math.abs(width(lines[0]) - width(lines[1]));
		for (let k = 1; k < words.length; k++) {
			const a = words.slice(0, k).join(' ');
			const b = words.slice(k).join(' ');
			const wa = width(a);
			const wb = width(b);
			if (wa <= z.width && wb <= z.width && Math.abs(wa - wb) < bestDiff) {
				lines = [a, b];
				bestDiff = Math.abs(wa - wb);
			}
		}
	}
	if (lines.length > 2 || lines.some((l) => width(l) > z.width + 1)) {
		throw new Error(`Caption does not fit on two lines: "${text}"`);
	}
	const out = {fontSize, lines};
	layoutCache.set(key, out);
	return out;
};

/** Marks which words of `text` belong to a highlighted phrase. */
const highlightMask = (text: string, phrases: string[] = []) => {
	const words = text.split(' ');
	const mask = words.map(() => false);
	for (const phrase of phrases) {
		const idx = text.indexOf(phrase);
		if (idx < 0) continue;
		let pos = 0;
		words.forEach((w, i) => {
			const start = pos;
			const end = pos + w.length;
			if (end > idx && start < idx + phrase.length) mask[i] = true;
			pos = end + 1;
		});
	}
	return mask;
};

const CaptionView: React.FC<{c: Timed; t: number}> = ({c, t}) => {
	const z = ZONES[c.zone];
	const {fontSize, lines} = layoutFor(c.text, c.zone);
	const mask = highlightMask(c.text, c.hl);
	const inP = interpolate(t, [c.from, c.from + FADE], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: ease.out,
	});
	const outP = interpolate(t, [c.to - FADE, c.to], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	let w = 0;
	return (
		<div
			style={{
				position: 'absolute',
				left: z.left,
				width: z.width,
				bottom: BOTTOM,
				textAlign: 'center',
				fontFamily: fonts.sans,
				fontWeight: 500,
				fontSize,
				lineHeight: 1.42,
				color: colors.ink,
				letterSpacing: '-0.005em',
				opacity: Math.min(inP, outP),
				transform: `translateY(${(1 - inP) * 8}px)`,
				textShadow: `0 0 18px ${colors.cream}, 0 0 6px ${colors.cream}`,
			}}
		>
			{lines.map((line, li) => (
				<div key={li} style={{whiteSpace: 'nowrap'}}>
					{line.split(' ').map((word, wi) => {
						const hl = mask[w++];
						return (
							<React.Fragment key={wi}>
								{wi > 0 ? ' ' : ''}
								<span style={hl ? {color: colors.roseDeep, fontWeight: 700} : undefined}>{word}</span>
							</React.Fragment>
						);
					})}
				</div>
			))}
		</div>
	);
};

export const Captions: React.FC = () => {
	const t = useT();
	const active = TIMED_CAPTIONS.filter((c) => !c.hidden && t >= c.from && t < c.to);
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			{active.map((c) => (
				<CaptionView key={c.text} c={c} t={t} />
			))}
		</AbsoluteFill>
	);
};
