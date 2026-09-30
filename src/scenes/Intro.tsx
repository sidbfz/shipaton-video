import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile} from 'remotion';
import {Eyebrow, Headline, Rich, Sub, TimedList} from '../components/Editorial';
import {FistulaDiagram} from '../components/FistulaDiagram';
import {FadeLayer, MaskLine, Reveal, useFade} from '../components/Transitions';
import {useT} from '../components/timing';
import {colors, ease, fonts} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 00:00–00:07 — the hook, on a dark charcoal field. */
export const Hook: React.FC = () => {
	const t = useT();
	// At "Even with all the progress…" the two opening lines step back.
	const settle = interpolate(t, [2.55, 3.55], [0, 1], {...clamp, easing: ease.inOut});
	const scale = 1 - 0.3 * settle;
	const lift = -150 * settle;
	// Type clears first ("…gone forever" ends at 6.33s), then the dark field lifts.
	const textOpacity = useFade(0, 6.5, 0, 0.35);
	return (
		<FadeLayer inAt={0} inDur={0} outAt={6.95} outDur={0.45} style={{background: colors.charcoal}}>
			<AbsoluteFill style={{opacity: textOpacity}}>
				<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
					<div style={{transform: `translateY(${lift}px) scale(${scale})`, textAlign: 'center'}}>
						{/* Starts slightly before frame 0 so the very first frame already shows type. */}
						<Headline lines={['Cancer can come back.']} at={-0.25} size={128} color={colors.cream} align="center" />
						<div style={{height: 14}} />
						<Headline
							lines={['So can an *anal fistula.*']}
							at={1.2}
							size={128}
							color={colors.cream}
							italicColor={colors.roseSoft}
							align="center"
						/>
					</div>
				</AbsoluteFill>
				<div
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						top: 610,
						textAlign: 'center',
						fontFamily: fonts.serif,
						fontSize: 58,
						lineHeight: 1.25,
						color: 'rgba(243, 238, 231, 0.72)',
					}}
				>
					<MaskLine at={2.72}>Even with all the progress in medicine,</MaskLine>
					<MaskLine at={4.28}>
						<Rich text="there is no promise that either is *gone forever.*" italicColor={colors.cream} />
					</MaskLine>
				</div>
			</AbsoluteFill>
		</FadeLayer>
	);
};

/** 00:06–00:12 — what a fistula is, with an original vector diagram. */
export const Diagram: React.FC = () => {
	const t = useT();
	const drift = interpolate(t, [6.5, 12.6], [0, 1], clamp);
	return (
		<FadeLayer inAt={6.45} inDur={0.5} outAt={12.55} outDur={0.5}>
			<div style={{position: 'absolute', left: 170, top: 250, width: 560}}>
				<Eyebrow at={6.7}>Anal fistula</Eyebrow>
				<Headline lines={['A second', '*opening.*']} at={6.85} size={104} italicColor={colors.roseDeep} />
				<Sub at={7.9} width={520}>
					A small tunnel that forms between the inside of the anal canal and the skin nearby.
				</Sub>
				<TimedList
					marker="dash"
					size={27}
					items={[
						{text: 'It can leak', at: 9.6},
						{text: 'It can bleed', at: 10.05},
						{text: 'It can cause serious pain', at: 10.9},
					]}
				/>
			</div>
			<div
				style={{
					position: 'absolute',
					left: 740,
					top: 170,
					transform: `scale(${1 + drift * 0.025})`,
					transformOrigin: '40% 50%',
				}}
			>
				<FistulaDiagram
					appearAt={6.55}
					drawFrom={7.35}
					drawTo={8.55}
					labels={{internal: 7.4, tract: 8.05, external: 8.7}}
					width={920}
				/>
			</div>
		</FadeLayer>
	);
};

type Scattered = {text: string; at: number; x: number; y: number; italic?: boolean; rot: number};
const WORDS: Scattered[] = [
	{text: 'Medicines', at: 17.02, x: 470, y: 330, rot: -1.5},
	{text: 'Symptoms', at: 18.2, x: 1390, y: 280, italic: true, rot: 1.2},
	{text: 'Wound changes', at: 19.24, x: 560, y: 700, italic: true, rot: 0.8},
	{text: 'Questions', at: 20.44, x: 1400, y: 650, rot: -1},
];
const GATHER_FROM = 21.75;
const GATHER_TO = 22.75;
const CENTER = {x: 960, y: 450};

const ScatterWord: React.FC<{w: Scattered}> = ({w}) => {
	const t = useT();
	const p = interpolate(t, [w.at - 0.1, w.at + 0.8], [0, 1], {...clamp, easing: ease.out});
	const g = interpolate(t, [GATHER_FROM, GATHER_TO], [0, 1], {...clamp, easing: ease.inOut});
	const driftX = (t - w.at) * (w.x < 960 ? -4 : 4);
	const x = w.x + driftX + (CENTER.x - w.x) * g;
	const y = w.y + (1 - p) * 20 + (CENTER.y - w.y) * g;
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				transform: `translate(-50%, -50%) rotate(${w.rot * (1 - g)}deg) scale(${1 - 0.55 * g})`,
				opacity: p * (1 - g),
				filter: `blur(${(1 - p) * 6 + g * 4}px)`,
				fontFamily: fonts.serif,
				fontStyle: w.italic ? 'italic' : 'normal',
				fontSize: 92,
				color: w.italic ? colors.roseDeep : colors.ink,
				whiteSpace: 'nowrap',
			}}
		>
			{w.text}
		</div>
	);
};

/** 00:12–00:24 — personal experience, the daily load, and the logo. */
export const Personal: React.FC = () => {
	const t = useT();
	const logoP = interpolate(t, [22.35, 23.35], [0, 1], {...clamp, easing: ease.out});
	const firstOut = useFade(13.55, 16.5, 0.6, 0.6);
	return (
		<FadeLayer inAt={12.35} inDur={0.3} outAt={24.3} outDur={0.4}>
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: firstOut}}>
				<div style={{textAlign: 'center', transform: 'translateY(-30px)'}}>
					<Headline lines={['Two surgeries.']} at={13.6} size={150} align="center" />
					<Reveal at={14.75} style={{marginTop: 30}}>
						<div style={{fontFamily: fonts.serif, fontStyle: 'italic', fontSize: 60, color: colors.inkSoft}}>
							And recovery did not end there.
						</div>
					</Reveal>
				</div>
			</AbsoluteFill>
			{WORDS.map((w) => (
				<ScatterWord key={w.text} w={w} />
			))}
			<AbsoluteFill style={{alignItems: 'center'}}>
				<div
					style={{
						position: 'absolute',
						top: CENTER.y - 170,
						width: 340,
						height: 340,
						clipPath: `circle(${logoP * 72}% at 50% 50%)`,
						transform: `scale(${0.92 + 0.08 * logoP})`,
						opacity: Math.min(1, logoP * 1.6),
					}}
				>
					<Img src={staticFile('logo.png')} style={{width: 340, height: 340}} />
				</div>
				<div style={{position: 'absolute', top: CENTER.y + 200, textAlign: 'center'}}>
					<Headline lines={['Fistula Tracker']} at={22.7} size={96} align="center" />
					<Reveal at={23.25} style={{marginTop: 18}}>
						<div
							style={{
								fontFamily: fonts.sans,
								fontWeight: 600,
								fontSize: 18,
								letterSpacing: '0.24em',
								textTransform: 'uppercase',
								color: colors.rose,
							}}
						>
							A private space for fistula recovery
						</div>
					</Reveal>
				</div>
			</AbsoluteFill>
		</FadeLayer>
	);
};
