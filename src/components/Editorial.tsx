import React from 'react';
import {interpolate} from 'remotion';
import {colors, ease, fonts} from '../theme';
import {MaskLine, Reveal, useFade} from './Transitions';
import {useT} from './timing';

/** Renders `*italic*` segments in the serif italic, like the app's own headlines. */
export const Rich: React.FC<{text: string; italicColor?: string}> = ({text, italicColor}) => {
	const parts = text.split('*');
	return (
		<>
			{parts.map((p, i) =>
				i % 2 === 1 ? (
					<em key={i} style={{fontStyle: 'italic', color: italicColor}}>
						{p}
					</em>
				) : (
					<React.Fragment key={i}>{p}</React.Fragment>
				),
			)}
		</>
	);
};

export const Eyebrow: React.FC<{at: number; out?: number; children: React.ReactNode; color?: string}> = ({
	at,
	out,
	children,
	color = colors.rose,
}) => {
	const t = useT();
	const opacity = useFade(at, out, 0.5, 0.35);
	const rule = interpolate(t, [at, at + 0.8], [0, 44], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: ease.out,
	});
	return (
		<div
			style={{
				opacity,
				display: 'flex',
				alignItems: 'center',
				gap: 16,
				fontFamily: fonts.sans,
				fontWeight: 700,
				fontSize: 20,
				letterSpacing: '0.22em',
				textTransform: 'uppercase',
				color,
				marginBottom: 30,
			}}
		>
			<div style={{width: rule, height: 1.5, background: color}} />
			{children}
		</div>
	);
};

/** Serif headline; each line is revealed from behind a mask, lightly staggered. */
export const Headline: React.FC<{
	lines: string[];
	at: number;
	out?: number;
	size?: number;
	stagger?: number;
	color?: string;
	italicColor?: string;
	align?: 'left' | 'center';
}> = ({lines, at, out, size = 92, stagger = 0.14, color = colors.ink, italicColor, align = 'left'}) => (
	<div
		style={{
			fontFamily: fonts.serif,
			fontSize: size,
			lineHeight: 1.02,
			letterSpacing: '-0.01em',
			color,
			textAlign: align,
		}}
	>
		{lines.map((line, i) => (
			<MaskLine key={i} at={at + i * stagger} out={out}>
				<Rich text={line} italicColor={italicColor} />
			</MaskLine>
		))}
	</div>
);

export const Sub: React.FC<{at: number; out?: number; children: React.ReactNode; width?: number}> = ({
	at,
	out,
	children,
	width = 600,
}) => (
	<Reveal at={at} out={out} style={{marginTop: 34, maxWidth: width}}>
		<div
			style={{
				fontFamily: fonts.sans,
				fontSize: 30,
				lineHeight: 1.5,
				fontWeight: 400,
				color: colors.inkSoft,
			}}
		>
			{children}
		</div>
	</Reveal>
);

/** A quiet list whose items arrive with the narration. */
export const TimedList: React.FC<{
	items: {text: string; at: number}[];
	out?: number;
	marker?: 'dot' | 'dash' | 'check';
	size?: number;
}> = ({items, out, marker = 'dot', size = 32}) => (
	<div style={{marginTop: 40, display: 'flex', flexDirection: 'column', gap: 16}}>
		{items.map((it) => (
			<Reveal key={it.text} at={it.at} out={out} dy={10} dur={0.55}>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 18,
						fontFamily: fonts.sans,
						fontWeight: 500,
						fontSize: size,
						color: colors.ink,
					}}
				>
					<Marker kind={marker} />
					{it.text}
				</div>
			</Reveal>
		))}
	</div>
);

const Marker: React.FC<{kind: 'dot' | 'dash' | 'check'}> = ({kind}) => {
	if (kind === 'dash') return <div style={{width: 22, height: 1.5, background: colors.rose}} />;
	if (kind === 'check')
		return (
			<svg width="26" height="26" viewBox="0 0 26 26">
				<circle cx="13" cy="13" r="12" fill="none" stroke={colors.rose} strokeWidth="1.5" />
				<path d="M8 13.5l3.2 3.2L18 10" fill="none" stroke={colors.roseDeep} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		);
	return <div style={{width: 9, height: 9, borderRadius: 9, background: colors.rose}} />;
};

/** Small outlined tag with an icon, e.g. "Saved on this device". */
export const Tag: React.FC<{at: number; out?: number; icon?: 'lock' | 'device' | 'heart' | 'shield'; children: React.ReactNode}> = ({
	at,
	out,
	icon = 'lock',
	children,
}) => (
	<Reveal at={at} out={out} dy={10} style={{marginTop: 34, display: 'inline-block'}}>
		<div
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: 12,
				padding: '12px 22px 12px 18px',
				borderRadius: 999,
				border: `1.5px solid ${colors.roseSoft}`,
				background: 'rgba(235, 214, 207, 0.35)',
				fontFamily: fonts.sans,
				fontWeight: 600,
				fontSize: 25,
				color: colors.roseDeep,
			}}
		>
			<Icon kind={icon} />
			{children}
		</div>
	</Reveal>
);

export const Icon: React.FC<{kind: 'lock' | 'device' | 'heart' | 'shield'; size?: number; color?: string}> = ({
	kind,
	size = 22,
	color = colors.roseDeep,
}) => {
	if (kind === 'heart')
		return (
			<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round">
				<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
			</svg>
		);
	if (kind === 'shield')
		return (
			<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round">
				<path d="M12 3l7 3v5.5c0 4.4-3 7.9-7 9.5-4-1.6-7-5.1-7-9.5V6z" />
				<path d="M9 12l2.2 2.2L15.5 10" strokeLinecap="round" />
			</svg>
		);
	if (kind === 'device')
		return (
			<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6">
				<rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
				<path d="M10.5 18.5h3" strokeLinecap="round" />
			</svg>
		);
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6">
			<rect x="5" y="10.5" width="14" height="10" rx="2" />
			<path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
		</svg>
	);
};
