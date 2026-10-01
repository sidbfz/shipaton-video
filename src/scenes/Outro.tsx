import {measureText} from '@remotion/layout-utils';
import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile} from 'remotion';
import {Headline, Icon, Rich} from '../components/Editorial';
import {Phone, PhoneShot} from '../components/Phone';
import {boxOnCanvas} from '../components/phoneGeometry';
import {FadeLayer, MaskLine, Reveal, useFade} from '../components/Transitions';
import {useT} from '../components/timing';
import {CARE_CARD, phoneAt} from '../data/timeline';
import {colors, ease, fonts} from '../theme';
import {CARE_CARD_BOX} from './Demo';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/**
 * 01:45 — "Care is never the paywall." The app's own dark card grows out of
 * the phone until it fills the frame, then the line lands once, large.
 */
export const CareCard: React.FC = () => {
	const t = useT();
	const p = phoneAt(CARE_CARD.expandFrom);
	const from = boxOnCanvas(CARE_CARD_BOX, p.cx, p.cy, p.sh);
	const k = interpolate(t, [CARE_CARD.expandFrom, CARE_CARD.expandTo], [0, 1], {...clamp, easing: ease.inOut});
	const out = interpolate(t, [CARE_CARD.outFrom, CARE_CARD.outTo], [1, 0], {...clamp, easing: ease.soft});
	const x = from.x * (1 - k);
	const y = from.y * (1 - k);
	const w = from.w + (1920 - from.w) * k;
	const h = from.h + (1080 - from.h) * k;
	const r = 20 * (1 - k);
	const drift = interpolate(t, [105.1, 106.9], [0, 1], clamp);
	const textOpacity = interpolate(t, [CARE_CARD.textOut - 0.3, CARE_CARD.textOut], [1, 0], clamp);
	return (
		<AbsoluteFill style={{opacity: out}}>
			<div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: r, background: colors.charcoal}} />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
				<div style={{textAlign: 'center', transform: `scale(${1 + drift * 0.02})`, opacity: textOpacity}}>
					<Reveal at={105.05} dy={8}>
						<div style={{display: 'flex', justifyContent: 'center', marginBottom: 40}}>
							<Icon kind="heart" size={56} color={colors.roseSoft} />
						</div>
					</Reveal>
					<div style={{fontFamily: fonts.serif, fontStyle: 'italic', fontSize: 150, lineHeight: 1.05, color: colors.cream}}>
						<MaskLine at={105.12} dur={0.8}>
							Care is never the paywall.
						</MaskLine>
					</div>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

type Callback = {src: string; clip: number};
const CALLBACKS: Callback[] = [
	{src: '03-home-and-checkin.mp4', clip: 0.5}, // Home
	{src: '04-history-and-timeline.mp4', clip: 9.5}, // Recovery timeline
	{src: '06-journal-and-photos.mp4', clip: 10.4}, // Journal
];
const CB = {sh: 560, cy: 560, gap: 330};

/** 01:47–01:53 — "the app I wish I had" over three small phones, then "I hope you never need it." */
export const Resolution: React.FC = () => {
	const t = useT();
	const phonesOut = useFade(0, 111.15, 0, 0.45);
	const drift = interpolate(t, [106.8, 111.3], [10, -10], clamp);
	return (
		<FadeLayer inAt={106.6} inDur={0.3} outAt={113.25} outDur={0.4}>
			<div style={{opacity: phonesOut}}>
				<div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center'}}>
					<Headline lines={['The app I wish *I had.*']} at={108.6} size={92} align="center" italicColor={colors.roseDeep} />
				</div>
				{CALLBACKS.map((c, i) => {
					const at = 106.9 + i * 0.22;
					const p = interpolate(t, [at, at + 0.8], [0, 1], {...clamp, easing: ease.out});
					const shot: PhoneShot = {src: c.src, at: 106.6, clip: c.clip, holdAt: c.clip};
					return (
						<div key={c.src} style={{position: 'absolute', inset: 0, transform: `translate(${drift}px, ${(1 - p) * 30}px)`}}>
							<Phone shots={[shot]} end={111.7} cx={960 + (i - 1) * CB.gap} cy={CB.cy} screenH={CB.sh} opacity={p} />
						</div>
					);
				})}
			</div>
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
				<div style={{fontFamily: fonts.serif, fontStyle: 'italic', fontSize: 96, color: colors.ink, transform: 'translateY(-20px)'}}>
					<MaskLine at={111.0} out={113.2} dur={0.9}>
						I hope you never need it.
					</MaskLine>
				</div>
			</AbsoluteFill>
		</FadeLayer>
	);
};

const PHRASES: {text: string; at: number; italic?: boolean}[] = [
	{text: 'More organized.', at: 115.08},
	{text: 'More private.', at: 115.89},
	{text: 'A little less lonely.', at: 116.9, italic: true},
];
const PHRASE_SIZE = 64;
const PHRASE_GAP = 54;

/** The feature graphic's line-and-dots motif, redrawn in the palette. */
const LineMotif: React.FC<{at: number}> = ({at}) => {
	const t = useT();
	const p = interpolate(t, [at, at + 0.9], [0, 1], {...clamp, easing: ease.out});
	const dots = interpolate(t, [at + 0.5, at + 1.0], [0, 1], clamp);
	return (
		<svg width={320} height={14} viewBox="0 0 320 14" style={{display: 'block', margin: '0 auto'}}>
			<line x1={0} y1={7} x2={250 * p} y2={7} stroke={colors.rose} strokeWidth={3} strokeLinecap="round" />
			<circle cx={278} cy={7} r={5} fill={colors.rose} opacity={dots} />
			<circle cx={302} cy={7} r={5} fill={colors.rose} opacity={dots} />
		</svg>
	);
};

/** 01:53–01:58.6 — closing on the logo. */
export const Closing: React.FC = () => {
	const t = useT();
	const logoP = interpolate(t, [113.4, 114.45], [0, 1], {...clamp, easing: ease.out});
	// Keep whatever phrases are visible centred: the row re-centres as each one arrives.
	const widths = PHRASES.map(
		(p) =>
			measureText({
				text: p.text,
				fontFamily: 'Instrument Serif',
				fontSize: PHRASE_SIZE,
				fontWeight: 400,
				additionalStyles: p.italic ? {fontStyle: 'italic'} : undefined,
			}).width,
	);
	const offsets = widths.map((_, i) => widths.slice(0, i).reduce((a, w) => a + w + PHRASE_GAP, 0));
	const visibleWidth = PHRASES.reduce((acc, p, i) => {
		const k = interpolate(t, [p.at - 0.1, p.at + 0.5], [0, 1], {...clamp, easing: ease.inOut});
		return i === 0 ? widths[0] : acc + (PHRASE_GAP + widths[i]) * k;
	}, 0);
	const rowLeft = 960 - visibleWidth / 2;
	return (
		<FadeLayer inAt={113.3} inDur={0.3}>
			<div
				style={{
					position: 'absolute',
					top: 250,
					left: 960 - 130,
					width: 260,
					height: 260,
					opacity: logoP,
					transform: `scale(${0.94 + 0.06 * logoP})`,
					clipPath: `circle(${30 + logoP * 45}% at 50% 50%)`,
				}}
			>
				<Img src={staticFile('logo.png')} style={{width: 260, height: 260}} />
			</div>
			<div style={{position: 'absolute', top: 540, left: 0, right: 0}}>
				<Headline lines={['Fistula Tracker']} at={113.75} size={92} align="center" />
			</div>
			<div style={{position: 'absolute', top: 668, left: 0, right: 0}}>
				<LineMotif at={114.2} />
			</div>
			<div style={{position: 'absolute', top: 720, left: 0, right: 0, height: 90, fontFamily: fonts.serif, fontSize: PHRASE_SIZE, color: colors.ink}}>
				{PHRASES.map((p, i) => (
					<div key={p.text} style={{position: 'absolute', left: rowLeft + offsets[i], top: 0, whiteSpace: 'nowrap'}}>
						<MaskLine at={p.at - 0.05} dur={0.8}>
							<Rich text={p.italic ? `*${p.text}*` : p.text} italicColor={colors.roseDeep} />
						</MaskLine>
					</div>
				))}
			</div>
		</FadeLayer>
	);
};
