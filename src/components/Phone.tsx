import React from 'react';
import {Freeze, interpolate, OffthreadVideo, staticFile} from 'remotion';
import {colors, ease, f, FPS} from '../theme';
import {APP_BG, phoneDims, SRC_H, SRC_W, STATUS_BAR_H} from './phoneGeometry';
import {DotPatches} from './dotPatches';
import {checkTrackRange, trackState, TRACKS} from './tracking';
import {At, useT} from './timing';

/** A box in source pixels of the 720 x 1606 recording: [x, y, w, h]. */
export type Box = [number, number, number, number];

/** Text beside the phone, joined to a highlight by a leader line. */
export type Callout = {
	label: string;
	note?: string;
	/** a brand name set large in the sans (e.g. RevenueCat) */
	brand?: string;
};

/**
 * A soft rose outline around a control while the narration names it; the rest
 * of the screen dims slightly. Either:
 *  - static: sits on a held freeze frame (the frame its box was measured on), or
 *  - tracked: `track` names a section in src/data/tracks.json and the box
 *    follows it frame by frame while the recording plays.
 * validateShots() enforces this, so a box always matches the pixels beneath it.
 */
export type Highlight = {from: number; to: number; box: Box; radius?: number; callout?: Callout; track?: string};

/** A highlight that follows a tracked section (box comes from tracks.json). */
export const tracked = (id: string, from: number, to: number, extra: Omit<Highlight, 'from' | 'to' | 'box' | 'track'> = {}): Highlight => {
	const tr = TRACKS[id];
	if (!tr) throw new Error(`Unknown track "${id}" — run scripts/track_targets.py`);
	return {from, to, box: tr.box, track: id, ...extra};
};

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
	/** switch with a plain cut instead of the push (a later moment of the same screen) */
	cut?: boolean;
	/** applied to the held frame only */
	patches?: Patch[];
	highlights?: Highlight[];
};

/**
 * Guards the pointing system. A static highlight (and its callout) is only
 * allowed while the recording is frozen on its `holdAt` frame — the frame its
 * box was measured on. A tracked highlight may sit on moving footage, but only
 * within the source frames the tracker measured. Both must end before the next
 * screen arrives. Rendering fails loudly instead of pointing at the wrong pixels.
 */
export const validateShots = (name: string, shots: PhoneShot[]) => {
	shots.forEach((shot, i) => {
		const next = shots[i + 1];
		for (const h of shot.highlights ?? []) {
			const where = `${name}[${i}] ${shot.src}@${shot.clip} highlight ${h.from}–${h.to}`;
			if (h.track) {
				checkTrackRange(h.track, shot, h.from, h.to, where);
			} else {
				if (shot.holdAt === undefined) throw new Error(`${where}: static highlights need a held frame (holdAt)`);
				const holdStart = shot.at + (shot.holdAt - shot.clip);
				if (h.from < holdStart - 1e-6) throw new Error(`${where}: starts before the hold at ${holdStart.toFixed(2)}s`);
			}
			if (next && h.to > next.at + 1e-6) throw new Error(`${where}: outlasts the screen (next at ${next.at}s)`);
			if (h.to <= h.from) throw new Error(`${where}: empty range`);
		}
	});
	return shots;
};

/** App-style navigation: the next screen pushes in from the right, so the phone is never empty. */
const PUSH = 0.34;
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

/** Opacity of a highlight at time t (fade in/out, times on-screen visibility when tracked). */
export const highlightOpacity = (h: Highlight, shot: PhoneShot, t: number) => {
	const a = Math.min(
		interpolate(t, [h.from, h.from + 0.35], [0, 1], {...clamp, easing: ease.soft}),
		interpolate(t, [h.to - 0.35, h.to], [1, 0], {...clamp, easing: ease.soft}),
	);
	if (!h.track || a <= 0) return a;
	const st = trackState(h.track, shot, t);
	return st ? a * st.visible : 0;
};

/** The highlight's box (source px) at time t. */
export const highlightBox = (h: Highlight, shot: PhoneShot, t: number): Box => {
	if (!h.track) return h.box;
	return trackState(h.track, shot, t)?.box ?? h.box;
};

const HighlightLayer: React.FC<{h: Highlight; shot: PhoneShot}> = ({h, shot}) => {
	const t = useT();
	const a = highlightOpacity(h, shot, t);
	if (a <= 0) return null;
	const [x, y, w, hh] = highlightBox(h, shot, t);
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
	const opts = {...clamp, easing: ease.inOut};
	// Incoming screen slides in from the right edge…
	const inX = first || shot.cut ? 0 : interpolate(t, [shot.at, shot.at + PUSH], [SRC_W, 0], opts);
	// …while the outgoing one eases a little to the left and dims, like app navigation.
	const pushed = next && !next.cut ? interpolate(t, [next.at, next.at + PUSH], [0, 1], opts) : 0;
	const outX = -0.28 * SRC_W * pushed;
	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				background: APP_BG,
				transform: `translateX(${inX + outX}px)`,
				boxShadow: inX > 0.5 ? '-18px 0 36px rgba(40, 30, 24, 0.16)' : undefined,
			}}
		>
			<Footage shot={shot} />
			<DotPatches shot={shot} />
			{(shot.highlights ?? []).map((h, i) => (
				<HighlightLayer key={i} h={h} shot={shot} />
			))}
			{pushed > 0 ? <div style={{position: 'absolute', inset: 0, background: `rgba(30, 26, 22, ${0.12 * pushed})`}} /> : null}
		</div>
	);
};

/**
 * A phone at true proportions showing the complete app screen — never cropped,
 * never zoomed inside. Screens change with an app-style push (the next screen
 * slides in over the dimmed previous one), or a plain cut for a later moment of
 * the same screen, so the phone never shows an empty screen.
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
							<At key={i} start={shot.at} end={next ? next.at + (next.cut ? 0.05 : PUSH + 0.05) : end} name={`${shot.src}@${shot.clip}`}>
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
