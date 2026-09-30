import React from 'react';
import {Freeze, interpolate, OffthreadVideo, staticFile} from 'remotion';
import {colors, ease, f, FPS} from '../theme';
import {At, useT} from './timing';

/** All screen recordings are portrait 720 x 1606. */
const SRC_W = 720;
const SRC_H = 1606;
/** Phone status bar (clock, notification icons) and gesture bar are cropped away. */
const CROP_TOP = 60;
const CROP_BOTTOM = 42;
/**
 * The app has ~38px of horizontal padding at source scale. A centred zoom of
 * up to 1.1 only ever crops that padding, never the app's own text.
 */
const MAX_ZOOM = 1.1;

export type CamKey = {
	/** absolute VO seconds */
	t: number;
	/** 1 = recording width fills the window width */
	zoom: number;
	/** vertical focus point, 0..1 of the source frame height */
	fy: number;
	/** horizontal focus point, 0..1 of the source width (default centre) */
	fx?: number;
};

export type Shot = {
	src: string;
	/** absolute VO second at which this shot starts */
	at: number;
	/** clip time (seconds) shown at `at` */
	clip: number;
	rate?: number;
	/** clip time at which playback freezes and holds (a clean freeze frame) */
	holdAt?: number;
	cam: CamKey[];
};

const camAt = (keys: CamKey[], t: number) => {
	if (keys.length === 1) return {zoom: keys[0].zoom, fy: keys[0].fy, fx: keys[0].fx ?? 0.5};
	const times = keys.map((k) => k.t);
	const opts = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease.inOut} as const;
	// Interpolate segment by segment so every move eases in and out.
	let i = 0;
	while (i < keys.length - 2 && t > times[i + 1]) i++;
	const a = keys[i];
	const b = keys[i + 1];
	const r = [a.t, b.t];
	return {
		zoom: interpolate(t, r, [a.zoom, b.zoom], opts),
		fy: interpolate(t, r, [a.fy, b.fy], opts),
		fx: interpolate(t, r, [a.fx ?? 0.5, b.fx ?? 0.5], opts),
	};
};

const Camera: React.FC<{keys: CamKey[]; w: number; h: number; children: React.ReactNode}> = ({
	keys,
	w,
	h,
	children,
}) => {
	const t = useT();
	const cam = camAt(keys, t);
	const zoom = Math.min(MAX_ZOOM, Math.max(1, cam.zoom));
	const {fy, fx} = cam;
	// Uniform scale only: recordings are never stretched.
	const s = (w * zoom) / SRC_W;
	const visH = h / s;
	const visW = w / s;
	const top = Math.min(Math.max(fy * SRC_H - visH / 2, CROP_TOP), SRC_H - CROP_BOTTOM - visH);
	const left = Math.min(Math.max(fx * SRC_W - visW / 2, 0), SRC_W - visW);
	return (
		<div
			style={{
				position: 'absolute',
				width: SRC_W,
				height: SRC_H,
				transformOrigin: '0 0',
				transform: `translate(${-left * s}px, ${-top * s}px) scale(${s})`,
			}}
		>
			{children}
		</div>
	);
};

const Clip: React.FC<{shot: Shot}> = ({shot}) => {
	const src = staticFile(shot.src);
	const style: React.CSSProperties = {width: SRC_W, height: SRC_H, display: 'block'};
	const rate = shot.rate ?? 1;
	if (shot.holdAt === undefined) {
		return <OffthreadVideo src={src} muted trimBefore={f(shot.clip)} playbackRate={rate} style={style} />;
	}
	const playDur = (shot.holdAt - shot.clip) / rate;
	return (
		<>
			{playDur > 0 ? (
				<At start={shot.at} end={shot.at + playDur}>
					<OffthreadVideo src={src} muted trimBefore={f(shot.clip)} playbackRate={rate} style={style} />
				</At>
			) : null}
			<At start={shot.at + Math.max(0, playDur)} end={shot.at + 600}>
				<Freeze frame={0}>
					<OffthreadVideo src={src} muted trimBefore={Math.round(shot.holdAt * FPS)} style={style} />
				</Freeze>
			</At>
		</>
	);
};

const XFADE = 0.3;

const ShotLayer: React.FC<{shot: Shot; w: number; h: number; first: boolean}> = ({shot, w, h, first}) => {
	const t = useT();
	const opacity = first
		? 1
		: interpolate(t, [shot.at, shot.at + XFADE], [0, 1], {
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
				easing: ease.soft,
			});
	return (
		<div style={{position: 'absolute', inset: 0, opacity}}>
			<Camera keys={shot.cam} w={w} h={h}>
				<Clip shot={{...shot}} />
			</Camera>
		</div>
	);
};

/**
 * A large, cleanly cropped window onto a vertical app recording, with subtle
 * rounded corners, a hairline border and a soft shadow. Shots inside the
 * window cross-dissolve; the window itself stays put.
 */
export const AppWindow: React.FC<{
	shots: Shot[];
	/** absolute VO second at which the window is no longer needed */
	end: number;
	x: number;
	y: number;
	w: number;
	h: number;
	style?: React.CSSProperties;
}> = ({shots, end, x, y, w, h, style}) => {
	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				width: w,
				height: h,
				borderRadius: 26,
				overflow: 'hidden',
				background: colors.cream,
				boxShadow:
					'0 1px 0 rgba(255,255,255,0.6) inset, 0 0 0 1px rgba(42,39,36,0.10), 0 24px 60px -18px rgba(70,48,36,0.28), 0 6px 18px -6px rgba(70,48,36,0.12)',
				isolation: 'isolate',
				...style,
			}}
		>
			{shots.map((shot, i) => {
				const next = shots[i + 1];
				const shotEnd = next ? next.at + XFADE + 0.05 : end;
				return (
					<At key={i} start={shot.at} end={shotEnd} name={`${shot.src}@${shot.clip}`}>
						<ShotLayer shot={shot} w={w} h={h} first={i === 0} />
					</At>
				);
			})}
		</div>
	);
};
