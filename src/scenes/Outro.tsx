import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile} from 'remotion';
import {AppWindow} from '../components/AppRecording';
import {Headline, Icon, Rich} from '../components/Editorial';
import {FadeLayer, MaskLine, Reveal, useFade} from '../components/Transitions';
import {useT} from '../components/timing';
import {colors, ease, fonts} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 01:45 — "Care is never the paywall." Echoes the app's own dark card. */
export const CareCard: React.FC = () => {
	const t = useT();
	const p = interpolate(t, [104.95, 106.8], [0, 1], clamp);
	return (
		<FadeLayer inAt={104.85} inDur={0.35} outAt={106.95} outDur={0.45} style={{background: colors.charcoal}}>
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
				<div style={{textAlign: 'center', transform: `scale(${1 + p * 0.02})`}}>
					<Reveal at={105.0} dy={8}>
						<div style={{display: 'flex', justifyContent: 'center', marginBottom: 40}}>
							<Icon kind="heart" size={54} color={colors.roseSoft} />
						</div>
					</Reveal>
					<div style={{fontFamily: fonts.serif, fontStyle: 'italic', fontSize: 150, lineHeight: 1.05, color: colors.cream}}>
						<MaskLine at={105.12} dur={0.8}>
							Care is never the paywall.
						</MaskLine>
					</div>
				</div>
			</AbsoluteFill>
		</FadeLayer>
	);
};

type Callback = {label: string; src: string; clip: number; fy: number; zoom?: number};
const CALLBACKS: Callback[] = [
	{label: 'Home', src: '03-home-and-checkin.mp4', clip: 0.5, fy: 0.3},
	{label: 'Check-in', src: '03-home-and-checkin.mp4', clip: 4.35, fy: 0.3, zoom: 1.1},
	{label: 'Medicines', src: '05-medicine-reminders-routines.mp4', clip: 4.7, fy: 0.36},
	{label: 'Journal', src: '06-journal-and-photos.mp4', clip: 10.5, fy: 0.4},
	{label: 'Timeline', src: '04-history-and-timeline.mp4', clip: 8.0, fy: 0.5},
];
const CB = {w: 272, h: 440, gap: 38};

/** 01:47–01:53 — "the app I wish I had", with short feature callbacks, then the feature graphic. */
export const Resolution: React.FC = () => {
	const t = useT();
	const rowW = CALLBACKS.length * CB.w + (CALLBACKS.length - 1) * CB.gap;
	const drift = interpolate(t, [106.7, 111.3], [16, -16], clamp);
	const rowOut = useFade(0, 111.25, 0, 0.5);
	const g = interpolate(t, [110.9, 113.5], [0, 1], clamp);
	return (
		<FadeLayer inAt={106.7} inDur={0.4} outAt={113.3} outDur={0.45}>
			<div style={{opacity: rowOut}}>
				<div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center'}}>
					<Headline lines={['The app I wish *I had.*']} at={108.6} size={88} align="center" italicColor={colors.roseDeep} />
				</div>
				<div
					style={{
						position: 'absolute',
						top: 330,
						left: (1920 - rowW) / 2 + drift,
						width: rowW,
						height: CB.h + 60,
					}}
				>
					{CALLBACKS.map((c, i) => {
						const at = 106.85 + i * 0.22;
						const p = interpolate(t, [at, at + 0.8], [0, 1], {...clamp, easing: ease.out});
						return (
							<div
								key={c.label}
								style={{
									position: 'absolute',
									left: i * (CB.w + CB.gap),
									top: (1 - p) * 26,
									opacity: p,
								}}
							>
								<AppWindow
									shots={[{src: c.src, at: 106.7, clip: c.clip, holdAt: c.clip, cam: [{t: 0, zoom: c.zoom ?? 1, fy: c.fy}]}]}
									end={111.8}
									x={0}
									y={0}
									w={CB.w}
									h={CB.h}
									style={{borderRadius: 18}}
								/>
								<div
									style={{
										marginTop: CB.h + 18,
										textAlign: 'center',
										fontFamily: fonts.sans,
										fontWeight: 700,
										fontSize: 16,
										letterSpacing: '0.22em',
										textTransform: 'uppercase',
										color: colors.rose,
									}}
								>
									{c.label}
								</div>
							</div>
						);
					})}
				</div>
			</div>
			{/* "I hope you never need it." */}
			<FadeLayer inAt={111.1} inDur={0.6}>
				<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
					<div
						style={{
							width: 1024,
							height: 500,
							borderRadius: 22,
							overflow: 'hidden',
							transform: `translateY(-50px) scale(${1 + g * 0.03})`,
							boxShadow: '0 0 0 1px rgba(42,39,36,0.08), 0 30px 70px -24px rgba(70,48,36,0.35)',
						}}
					>
						<Img src={staticFile('feature-graphic.png')} style={{width: 1024, height: 500, display: 'block'}} />
					</div>
				</AbsoluteFill>
			</FadeLayer>
		</FadeLayer>
	);
};

/** 01:53–01:58.6 — closing on the logo. */
export const Closing: React.FC = () => {
	const t = useT();
	const logoP = interpolate(t, [113.4, 114.45], [0, 1], {...clamp, easing: ease.out});
	const phrasesOut = useFade(0, 118.35, 0, 0.45);
	const phrases: {text: string; at: number}[] = [
		{text: 'More organized.', at: 115.13},
		{text: 'More private.', at: 115.94},
		{text: '*A little less lonely.*', at: 116.95},
	];
	return (
		<FadeLayer inAt={113.3} inDur={0.3}>
			<AbsoluteFill style={{alignItems: 'center'}}>
				<div
					style={{
						position: 'absolute',
						top: 120,
						width: 320,
						height: 320,
						opacity: logoP,
						transform: `scale(${0.94 + 0.06 * logoP})`,
						clipPath: `circle(${30 + logoP * 45}% at 50% 50%)`,
					}}
				>
					<Img src={staticFile('logo.png')} style={{width: 320, height: 320}} />
				</div>
				<div style={{position: 'absolute', top: 478}}>
					<Headline lines={['Fistula Tracker']} at={113.75} size={92} align="center" />
				</div>
				<div
					style={{
						position: 'absolute',
						top: 660,
						display: 'flex',
						gap: 54,
						opacity: phrasesOut,
						fontFamily: fonts.serif,
						fontSize: 66,
						color: colors.ink,
					}}
				>
					{phrases.map((p) => (
						<MaskLine key={p.text} at={p.at - 0.05} dur={0.8}>
							<Rich text={p.text} italicColor={colors.roseDeep} />
						</MaskLine>
					))}
				</div>
			</AbsoluteFill>
		</FadeLayer>
	);
};
