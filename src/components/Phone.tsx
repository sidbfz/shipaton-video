import React from 'react';
import {Freeze, interpolate, OffthreadVideo, staticFile} from 'remotion';
import {colors, ease, f, FPS} from '../theme';
import {APP_BG, phoneDims, SRC_H, SRC_W, STATUS_BAR_H} from './phoneGeometry';
import {At, useT} from './timing';

/** A box in source pixels of the 720 x 1606 recording: [x, y, w, h]. */
export type Box = [number, number, number, number];

/** A soft rose outline around a control while the narration names it; the rest of the screen dims slightly. */
export type Highlight = {from: number; to: number; box: Box; radius?: number};

/** Hides a frozen touch indicator by painting the flat surface colour back over it. */
export type Patch = {x: number; y: number; r: number; color: string};

export type PhoneShot = {
	src: string;
	/** absolute VO second at which this screen appears */
	at: number;
	/** position in the source recording (seconds) shown at `at` */
	clip: number;
	/** clip time at which playback freezes on a clean frame and holds */
	holdAt?: number;
	/** switch without the dip (continuous footage of the same screen) */
	cut?: boolean;
	/** applied to the held frame only */
	patches?: Patch[];
	highlights?: Highlight[];
};

const DIP_OUT = 0.14;
const DIP_IN = 0.18;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const videoStyle: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: SRC_W, height: SRC_H};

const Patches: React.FC<{patches?: Patch[]}> = ({patches}) => (
	<>
		{(patches ?? []).map((p, i) => (
			<div
				key={i}
				style={{
					position: 'absolute',
					left: p.x - p.r,
					top: p.y - p.r,
					width: p.r * 2,
					height: p.r * 2,
					borderRadius: p.r,
					background: p.color,
				}}
			/>
		))}
	</>
);

const Footage: React.FC<{shot: PhoneShot}> = ({shot}) => {
	const src = staticFile(shot.src);
	if (shot.holdAt === undefined) {
		return <OffthreadVideo src={src} muted trimBefore={f(shot.clip)} style={videoStyle} />;
	}
	const playDur = shot.holdAt - shot.clip;
	return (
		<>
			{playDur > 0 ? (
				<At start={shot.at} end={shot.at + playDur}>
					<OffthreadVideo src={src} muted trimBefore={f(shot.clip)} style={videoStyle} />
				</At>
			) : null}
			<At start={shot.at + Math.max(0, playDur)} end={shot.at + 600}>
				<Freeze frame={0}>
					<OffthreadVideo src={src} muted trimBefore={Math.round(shot.holdAt * FPS)} style={videoStyle} />
				</Freeze>
				<Patches patches={shot.patches} />
			</At>
		</>
	);
};

const HighlightLayer: React.FC<{h: Highlight}> = ({h}) => {
	const t = useT();
	const a = Math.min(
		interpolate(t, [h.from, h.from + 0.35], [0, 1], {...clamp, easing: ease.soft}),
		interpolate(t, [h.to - 0.35, h.to], [1, 0], {...clamp, easing: ease.soft}),
	);
	if (a <= 0) return null;
	const [x, y, w, hh] = h.box;
	const pad = 6;
	return (
		<div
			style={{
				position: 'absolute',
				left: x - pad,
				top: y - pad,
				width: w + pad * 2,
				height: hh + pad * 2,
				borderRadius: h.radius ?? 22,
				border: `4px solid ${colors.rose}`,
				boxShadow: `0 0 0 3000px rgba(33, 31, 29, ${0.13 * a}), 0 0 0 10px rgba(180, 114, 110, ${0.14 * a})`,
				opacity: a,
			}}
		/>
	);
};

const ShotLayer: React.FC<{shot: PhoneShot; next?: PhoneShot; first: boolean}> = ({shot, next, first}) => {
	const t = useT();
	const fadeIn = first || shot.cut ? 1 : interpolate(t, [shot.at, shot.at + DIP_IN], [0, 1], {...clamp, easing: ease.soft});
	const fadeOut =
		!next || next.cut ? 1 : interpolate(t, [next.at - DIP_OUT, next.at], [1, 0], {...clamp, easing: ease.soft});
	return (
		<div style={{position: 'absolute', inset: 0, opacity: Math.min(fadeIn, fadeOut)}}>
			<Footage shot={shot} />
			{(shot.highlights ?? []).map((h, i) => (
				<HighlightLayer key={i} h={h} />
			))}
		</div>
	);
};

/**
 * A phone at true proportions showing the complete app screen — never cropped,
 * never zoomed inside. Screens change with a brief dip through the app's own
 * background so two screens of text never overlap.
 */
export const Phone: React.FC<{
	shots: PhoneShot[];
	/** absolute VO second after which the phone is not needed */
	end: number;
	/** centre of the phone on the canvas */
	cx: number;
	cy: number;
	screenH: number;
	opacity?: number;
}> = ({shots, end, cx, cy, screenH, opacity = 1}) => {
	const d = phoneDims(screenH);
	return (
		<div
			style={{
				position: 'absolute',
				left: cx - d.deviceW / 2,
				top: cy - d.deviceH / 2,
				width: d.deviceW,
				height: d.deviceH,
				borderRadius: d.outerR,
				background: '#1F1D1B',
				boxShadow:
					'inset 0 0 0 1px rgba(255,255,255,0.10), 0 2px 0 rgba(255,255,255,0.35), 0 34px 70px -26px rgba(64, 42, 30, 0.42), 0 10px 24px -10px rgba(64, 42, 30, 0.22)',
				opacity,
			}}
		>
			<div
				style={{
					position: 'absolute',
					left: d.bezel,
					top: d.bezel,
					width: d.screenW,
					height: d.screenH,
					borderRadius: d.innerR,
					overflow: 'hidden',
					background: APP_BG,
					isolation: 'isolate',
				}}
			>
				<div style={{position: 'absolute', left: 0, top: 0, width: SRC_W, height: SRC_H, transformOrigin: '0 0', transform: `scale(${d.scale})`}}>
					{shots.map((shot, i) => {
						const next = shots[i + 1];
						return (
							<At key={i} start={shot.at} end={next ? next.at + 0.05 : end} name={`${shot.src}@${shot.clip}`}>
								<ShotLayer shot={shot} next={next} first={i === 0} />
							</At>
						);
					})}
					{/* Clean status bar: no clock or notification icons, just the camera. */}
					<div style={{position: 'absolute', left: 0, top: 0, width: SRC_W, height: STATUS_BAR_H, background: APP_BG}} />
					<div
						style={{
							position: 'absolute',
							left: SRC_W / 2 - 13,
							top: 18,
							width: 26,
							height: 26,
							borderRadius: 13,
							background: '#1F1D1B',
							boxShadow: 'inset 0 0 0 3px #2b2826',
						}}
					/>
				</div>
			</div>
		</div>
	);
};
