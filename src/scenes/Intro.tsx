import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile} from 'remotion';
import {Eyebrow, Headline, Rich, Sub} from '../components/Editorial';
import {FistulaDiagram} from '../components/FistulaDiagram';
import {FadeLayer, MaskLine, Reveal, useFade} from '../components/Transitions';
import {useT} from '../components/timing';
import {HOOK_LIFT} from '../data/timeline';
import {colors, ease, fonts} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 00:00–00:07 — the hook, on a dark charcoal field. */
export const Hook: React.FC = () => {
	const t = useT();
	// At "Even with all the progress…" the two opening lines step back.
	const settle = interpolate(t, [2.55, 3.55], [0, 1], {...clamp, easing: ease.inOut});
	const scale = 1 - 0.3 * settle;
	const lift = -150 * settle;
	// "Cancer can come back." starts centred on its own; the pair glides into place as line two arrives.
	const pairGlide = interpolate(t, [1.15, 1.75], [76, 0], {...clamp, easing: ease.inOut});
	// Type clears first ("…gone forever" ends at 6.33s), then the dark field lifts slowly
	// (a fast lift from charcoal to cream reads as a flash).
	const textOpacity = useFade(0, 6.42, 0, 0.35);
	return (
		<FadeLayer
			inAt={0}
			inDur={0}
			outAt={HOOK_LIFT.to}
			outDur={HOOK_LIFT.to - HOOK_LIFT.from}
			style={{background: colors.charcoal}}
		>
			<AbsoluteFill style={{opacity: textOpacity}}>
				<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
					<div style={{transform: `translateY(${lift + pairGlide}px) scale(${scale})`, textAlign: 'center'}}>
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
		<FadeLayer inAt={6.55} inDur={0.7} outAt={12.45} outDur={0.35}>
			<div style={{position: 'absolute', left: 170, top: 384, width: 560}}>
				<Eyebrow at={6.8}>Anal fistula</Eyebrow>
				<Headline lines={['A second', '*opening.*']} at={6.9} size={108} italicColor={colors.roseDeep} />
				<Sub at={7.9} width={540}>
					A small tunnel that forms between the inside of the anal canal and the skin nearby.
				</Sub>
			</div>
			<div
				style={{
					position: 'absolute',
					left: 740,
					top: 234,
					// Wide enough to include the labels, which extend past the drawing.
					width: 1040,
					height: 680,
					transform: `scale(${1 + drift * 0.025})`,
					transformOrigin: '40% 50%',
					// The cross-section continues upward: fade its top edge instead of a hard cut.
					WebkitMaskImage: 'linear-gradient(to bottom, transparent 0px, black 120px)',
					maskImage: 'linear-gradient(to bottom, transparent 0px, black 120px)',
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

type Scattered = {
	text: string;
	at: number;
	x: number;
	y: number;
	size: number;
	italic?: boolean;
	soft?: boolean;
	rot: number;
	/** slow drift in px per second */
	dx: number;
	dy: number;
};
// Loose, uneven placement and sizes so the words read as things piling up, not a grid.
const WORDS: Scattered[] = [
	{text: 'Medicines', at: 17.02, x: 500, y: 300, size: 112, rot: -1.6, dx: -5, dy: -2},
	{text: 'Symptoms', at: 18.2, x: 1440, y: 340, size: 82, italic: true, rot: 1.8, dx: 4, dy: -3},
	{text: 'Wound changes', at: 19.24, x: 840, y: 655, size: 100, italic: true, rot: -0.8, dx: -3, dy: 3},
	{text: 'Questions', at: 20.44, x: 1460, y: 770, size: 88, soft: true, rot: 1.1, dx: 5, dy: 2},
];
const GATHER_FROM = 21.75;
const GATHER_TO = 22.75;
const CENTER = {x: 960, y: 450};

const ScatterWord: React.FC<{w: Scattered}> = ({w}) => {
	const t = useT();
	const p = interpolate(t, [w.at - 0.1, w.at + 0.8], [0, 1], {...clamp, easing: ease.out});
	const g = interpolate(t, [GATHER_FROM, GATHER_TO], [0, 1], {...clamp, easing: ease.inOut});
	const age = Math.max(0, t - w.at);
	const x = w.x + age * w.dx + (CENTER.x - w.x) * g;
	const y = w.y + age * w.dy + (1 - p) * 20 + (CENTER.y - w.y) * g;
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				transform: `translate(-50%, -50%) rotate(${w.rot * (1 - g)}deg) scale(${1 - 0.55 * g})`,
				opacity: p * (1 - g) * (1 - g),
				filter: `blur(${(1 - p) * 6 + g * 4}px)`,
				fontFamily: fonts.serif,
				fontStyle: w.italic ? 'italic' : 'normal',
				fontSize: w.size,
				color: w.italic ? colors.roseDeep : w.soft ? colors.inkSoft : colors.ink,
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
	// Stays until "Medicines" arrives, so the frame is never empty.
	const firstOut = useFade(0, 17.2, 0, 0.55);
	// The block is centred on whatever is visible: "I had one." alone, then with "Two surgeries.",
	// then all three lines — gliding between those positions as each line arrives.
	const blockGlide = interpolate(t, [13.55, 14.15, 14.7, 15.3], [146, 38, 38, 0], {...clamp, easing: ease.inOut});
	return (
		<FadeLayer inAt={12.35} inDur={0.3} outAt={24.3} outDur={0.4}>
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: firstOut}}>
				<div style={{textAlign: 'center', transform: `translateY(${blockGlide}px)`}}>
					<Reveal at={12.4} style={{marginBottom: 26}}>
						<div style={{fontFamily: fonts.serif, fontStyle: 'italic', fontSize: 64, color: colors.inkSoft}}>I had one.</div>
					</Reveal>
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
								fontSize: 22,
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
