import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Grain} from './components/Grain';
import {Phone, PhoneShot} from './components/Phone';
import {phoneDims} from './components/phoneGeometry';
import {FontGate} from './fonts';
import {colors, fonts} from './theme';

/**
 * YouTube thumbnail (1280 x 720) in the video's look. One brand block on the
 * left — logo, the name, the reason it exists — and the Home screen as the
 * hero on the right, close enough to read as one composition. A soft glow in
 * the logo's icing pink gives the cream page a colour pop. The phone is cut by
 * the bottom edge so it can be large; YouTube's duration badge then only covers
 * the lower part of the app.
 * Render: npm run thumbnail -> out/thumbnail.png
 */
export const THUMB = {width: 1280, height: 720};

const MARGIN = 72;
const SCREEN_H = 1000;
const d = phoneDims(SCREEN_H);
const PHONE_CX = 930;
const PHONE_TOP = 52;

/** Home: "Noticing signs" and the dark "How are you today?" card (held frame, as in the video). */
const HOME: PhoneShot[] = [{src: '03-home-and-checkin.mp4', at: 0, clip: 0.9, holdAt: 0.9}];

const ICING = '226, 120, 124'; // the logo's pink

export const Thumbnail: React.FC = () => (
	<AbsoluteFill style={{background: colors.cream}}>
		<FontGate>
			{/* Warm pink glow behind the phone, fading into the paper. */}
			<AbsoluteFill
				style={{
					background: `radial-gradient(ellipse 600px 520px at ${PHONE_CX}px 380px, rgba(${ICING}, 0.42), rgba(${ICING}, 0.16) 55%, rgba(${ICING}, 0) 100%)`,
				}}
			/>
			{/* Brand block, centred vertically. */}
			<div
				style={{
					position: 'absolute',
					left: MARGIN,
					top: 0,
					bottom: 0,
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
				}}
			>
				<Img src={staticFile('logo.png')} style={{width: 150, height: 150, display: 'block', marginLeft: -10, marginBottom: 6}} />
				<div
					style={{
						fontFamily: fonts.serif,
						fontSize: 164,
						lineHeight: 0.9,
						letterSpacing: '-0.015em',
						color: colors.ink,
						marginLeft: -6,
					}}
				>
					<div>Fistula</div>
					<div style={{fontStyle: 'italic', color: colors.roseDeep}}>Tracker</div>
				</div>
				<div
					style={{
						marginTop: 28,
						fontFamily: fonts.sans,
						fontWeight: 700,
						fontSize: 38,
						lineHeight: 1.22,
						letterSpacing: '-0.01em',
						color: colors.ink,
					}}
				>
					I built this after
					<br />
					<span style={{color: colors.roseDeep}}>two surgeries.</span>
				</div>
			</div>
			{/* A deeper, softer shadow so the phone lifts off the page. */}
			<div
				style={{
					position: 'absolute',
					left: PHONE_CX - d.deviceW / 2,
					top: PHONE_TOP,
					width: d.deviceW,
					height: d.deviceH,
					borderRadius: d.outerR,
					boxShadow: '0 50px 90px -30px rgba(110, 52, 46, 0.45), 0 20px 40px -20px rgba(110, 52, 46, 0.30)',
				}}
			/>
			<Phone shots={HOME} end={10} cx={PHONE_CX} cy={PHONE_TOP + d.deviceH / 2} screenH={SCREEN_H} />
			<Grain />
		</FontGate>
	</AbsoluteFill>
);
