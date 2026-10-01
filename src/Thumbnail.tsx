import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Grain} from './components/Grain';
import {Phone, PhoneShot} from './components/Phone';
import {boxOnCanvas, phoneDims} from './components/phoneGeometry';
import {FontGate} from './fonts';
import {colors, fonts} from './theme';

/**
 * YouTube thumbnail (1280 x 720) in the video's own language: the charcoal
 * field of the opening and "Care is never the paywall", cream serif with a
 * soft-rose italic, and the rose highlight + leader line used for pointing.
 *
 * Attention path: "Built after two surgeries." -> the name -> the leader line
 * -> the pain check-in on the phone (the brightest thing in the frame). The
 * phone is cut by the bottom edge so it can be large; YouTube's duration badge
 * then only covers the lower part of the app.
 * Render: npm run thumbnail -> out/thumbnail.png
 */
export const THUMB = {width: 1280, height: 720};

const MARGIN = 72;
const SCREEN_H = 900;
const d = phoneDims(SCREEN_H);

/** Check-in: "How bad is the pain today?" with the 0–10 scale (held frame, as in the video). */
const CHECK_IN: PhoneShot[] = [{src: '03-home-and-checkin.mp4', at: 0, clip: 3.7, holdAt: 3.7}];
/** The pain question and scale, in source px. */
const TARGET: [number, number, number, number] = [12, 600, 696, 360];

const NAME = {size: 172, lineHeight: 0.9, top: 250};
const nameLine = NAME.size * NAME.lineHeight;
/** Vertical centre of "Tracker" — the leader runs straight into it. */
const trackerY = NAME.top + nameLine * 1.5;

// Place the phone so the target's centre sits level with "Tracker".
const PHONE_TOP = Math.round(trackerY - d.bezel - (TARGET[1] + TARGET[3] / 2) * d.scale);
const PHONE_CX = THUMB.width - MARGIN - d.deviceW / 2;
const target = boxOnCanvas(TARGET, PHONE_CX, PHONE_TOP + d.deviceH / 2, SCREEN_H);
const PAD = 6;
const LINE_END = 572; // just past the end of "Tracker"

export const Thumbnail: React.FC = () => (
	<AbsoluteFill style={{background: colors.charcoal}}>
		<FontGate>
			{/* A soft warm glow behind the phone. */}
			<AbsoluteFill
				style={{
					background: `radial-gradient(ellipse 520px 460px at ${PHONE_CX}px 430px, rgba(180, 114, 110, 0.22), rgba(180, 114, 110, 0) 70%)`,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: MARGIN,
					top: 176,
					fontFamily: fonts.sans,
					fontWeight: 600,
					fontSize: 40,
					letterSpacing: '-0.01em',
					color: 'rgba(243, 238, 231, 0.86)',
				}}
			>
				Built after two surgeries.
			</div>
			<div
				style={{
					position: 'absolute',
					left: MARGIN - 7,
					top: NAME.top,
					fontFamily: fonts.serif,
					fontSize: NAME.size,
					lineHeight: NAME.lineHeight,
					letterSpacing: '-0.015em',
					color: colors.cream,
				}}
			>
				<div>Fistula</div>
				<div style={{fontStyle: 'italic', color: colors.roseSoft}}>Tracker</div>
			</div>
			<Phone shots={CHECK_IN} end={10} cx={PHONE_CX} cy={PHONE_TOP + d.deviceH / 2} screenH={SCREEN_H} />
			{/* A faint rim so the dark device still reads as a phone on the charcoal field. */}
			<div
				style={{
					position: 'absolute',
					left: PHONE_CX - d.deviceW / 2,
					top: PHONE_TOP,
					width: d.deviceW,
					height: d.deviceH,
					borderRadius: d.outerR,
					boxShadow: '0 0 0 1.5px rgba(243, 238, 231, 0.16)',
				}}
			/>
			{/* The video's pointing system: a rose outline on the control and a leader line to the words. */}
			<div
				style={{
					position: 'absolute',
					left: target.x - PAD,
					top: target.y - PAD,
					width: target.w + PAD * 2,
					height: target.h + PAD * 2,
					borderRadius: 16,
					border: `3px solid ${colors.rose}`,
					boxShadow: '0 0 0 7px rgba(180, 114, 110, 0.16)',
				}}
			/>
			<svg width={THUMB.width} height={THUMB.height} style={{position: 'absolute', left: 0, top: 0}}>
				<line x1={LINE_END} y1={trackerY} x2={target.x - PAD} y2={trackerY} stroke={colors.rose} strokeWidth={3} />
				<circle cx={target.x - PAD} cy={trackerY} r={6} fill={colors.rose} />
			</svg>
			<Grain />
		</FontGate>
	</AbsoluteFill>
);
