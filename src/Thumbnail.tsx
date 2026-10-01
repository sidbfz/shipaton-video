import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Grain} from './components/Grain';
import {Phone, PhoneShot} from './components/Phone';
import {phoneDims} from './components/phoneGeometry';
import {FontGate} from './fonts';
import {colors, fonts} from './theme';

/**
 * YouTube thumbnail (1280 x 720), same look as the video. The name is the
 * headline so it reads even at ~170 px wide; the phone shows Home (the dark
 * "How are you today?" card is the focal point), cut by the bottom edge so it
 * can be large (the duration badge then only covers the lower part of the app).
 * Render: npm run thumbnail -> out/thumbnail.png
 */
export const THUMB = {width: 1280, height: 720};

const MARGIN = 72;
const SCREEN_H = 900;
const d = phoneDims(SCREEN_H);
const PHONE_TOP = 64;

const HOME: PhoneShot[] = [
	{
		src: '03-home-and-checkin.mp4',
		at: 0,
		clip: 0.9,
		holdAt: 0.9,
	},
];

export const Thumbnail: React.FC = () => (
	<AbsoluteFill style={{background: colors.cream}}>
		<FontGate>
			<div style={{position: 'absolute', left: MARGIN, top: 58}}>
				<Img src={staticFile('logo.png')} style={{width: 104, height: 104, display: 'block'}} />
			</div>
			<div
				style={{
					position: 'absolute',
					left: MARGIN - 6,
					top: 172,
					fontFamily: fonts.serif,
					fontSize: 178,
					lineHeight: 0.9,
					letterSpacing: '-0.015em',
					color: colors.ink,
				}}
			>
				<div>Fistula</div>
				<div style={{fontStyle: 'italic', color: colors.roseDeep}}>Tracker</div>
			</div>
			<div
				style={{
					position: 'absolute',
					left: MARGIN,
					top: 548,
					fontFamily: fonts.sans,
					fontWeight: 700,
					fontSize: 40,
					letterSpacing: '-0.01em',
					color: colors.ink,
				}}
			>
				Recovery, organized. <span style={{color: colors.roseDeep}}>Free.</span>
			</div>
			<Phone shots={HOME} end={10} cx={THUMB.width - MARGIN - d.deviceW / 2} cy={PHONE_TOP + d.deviceH / 2} screenH={SCREEN_H} />
			<Grain />
		</FontGate>
	</AbsoluteFill>
);
