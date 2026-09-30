import React from 'react';
import {interpolate} from 'remotion';
import {colors, ease, fonts} from '../theme';
import {useT} from './timing';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/**
 * Simplified, original cross-section based on assets/fistula-diagram.png:
 * soft tissue, the anal canal, the sphincter muscles, and a fistula tract
 * running from an internal opening in the canal wall to an external opening
 * on the skin. Non-graphic, palette-matched, fully vector.
 */
export const FistulaDiagram: React.FC<{
	appearAt: number;
	drawFrom: number;
	drawTo: number;
	labels: {internal: number; tract: number; external: number};
	width?: number;
}> = ({appearAt, drawFrom, drawTo, labels, width = 1000}) => {
	const t = useT();
	const base = interpolate(t, [appearAt, appearAt + 0.9], [0, 1], {...clamp, easing: ease.out});
	const draw = interpolate(t, [drawFrom, drawTo], [0, 1], {...clamp, easing: ease.inOut});
	const inner = interpolate(t, [drawFrom - 0.2, drawFrom + 0.3], [0, 1], {...clamp, easing: ease.out});
	const outer = interpolate(t, [drawTo - 0.15, drawTo + 0.35], [0, 1], {...clamp, easing: ease.out});

	const tissue = '#EFDCD1';
	const tissueDeep = '#E6C8BB';
	const canal = '#C98985';
	const canalLow = '#D9A6A0';
	const muscle = '#DDB3A8';
	const tract = colors.roseDeep;

	// Tract: internal opening on the right canal wall -> external opening on the skin.
	const tractPath = 'M 553 318 C 600 330, 640 368, 662 420 C 684 470, 690 515, 697 553';

	return (
		<svg viewBox="0 0 1000 660" width={width} style={{overflow: 'visible', opacity: base}}>
			<defs>
				<pattern id="hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
					<line x1="0" y1="0" x2="0" y2="10" stroke="#C99287" strokeWidth="1.4" opacity="0.55" />
				</pattern>
				<clipPath id="tissueClip">
					<path d="M60 40 H940 V430 C940 540 800 590 690 562 C610 542 560 505 528 470 L472 470 C440 505 390 542 310 562 C200 590 60 540 60 430 Z" />
				</clipPath>
			</defs>

			{/* soft tissue */}
			<path
				d="M60 40 H940 V430 C940 540 800 590 690 562 C610 542 560 505 528 470 L472 470 C440 505 390 542 310 562 C200 590 60 540 60 430 Z"
				fill={tissue}
			/>
			<g clipPath="url(#tissueClip)">
				{/* deeper fat pads, very soft */}
				<path d="M120 60 C 240 60, 330 150, 340 300 C 350 420, 250 470, 170 450 C 110 435, 90 360, 100 250 Z" fill={tissueDeep} opacity="0.7" />
				<path d="M880 60 C 760 60, 670 150, 660 300 C 650 420, 750 470, 830 450 C 890 435, 910 360, 900 250 Z" fill={tissueDeep} opacity="0.7" />
				{/* sphincter muscles */}
				<path d="M380 230 C 395 300, 410 380, 440 468 L 470 468 C 450 380, 438 300, 425 230 Z" fill={muscle} />
				<path d="M380 230 C 395 300, 410 380, 440 468 L 470 468 C 450 380, 438 300, 425 230 Z" fill="url(#hatch)" />
				<path d="M620 230 C 605 300, 590 380, 560 468 L 530 468 C 550 380, 562 300, 575 230 Z" fill={muscle} />
				<path d="M620 230 C 605 300, 590 380, 560 468 L 530 468 C 550 380, 562 300, 575 230 Z" fill="url(#hatch)" />
			</g>

			{/* rectum and anal canal */}
			<path d="M418 40 H582 C590 150 575 230 552 300 L 528 470 H 472 L 448 300 C 425 230 410 150 418 40 Z" fill={canal} />
			<path d="M448 300 L 552 300 L 528 470 H 472 Z" fill={canalLow} />
			{/* dentate line */}
			<path
				d="M449 305 q 8 12 16 0 q 8 12 17 0 q 8 12 18 0 q 8 12 17 0 q 8 12 17 0 q 8 12 16 0"
				fill="none"
				stroke="#B8736F"
				strokeWidth="2"
				opacity="0.8"
			/>

			{/* fistula tract */}
			<path d={tractPath} fill="none" stroke={tract} strokeWidth="16" strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} opacity="0.22" />
			<path d={tractPath} fill="none" stroke={tract} strokeWidth="8" strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />

			{/* openings */}
			<circle cx="553" cy="318" r={11 * inner} fill={colors.cream} stroke={tract} strokeWidth="4" opacity={inner} />
			<ellipse cx="697" cy="556" rx={14 * outer} ry={8 * outer} fill={colors.cream} stroke={tract} strokeWidth="4" opacity={outer} />

			<Label t={t} at={labels.internal} x1={562} y1={312} x2={760} y2={230} text="Internal opening" />
			<Label t={t} at={labels.tract} x1={672} y1={440} x2={790} y2={410} text="Fistula tract" />
			<Label t={t} at={labels.external} x1={705} y1={562} x2={790} y2={612} text="External opening" />
		</svg>
	);
};

const Label: React.FC<{t: number; at: number; x1: number; y1: number; x2: number; y2: number; text: string}> = ({
	t,
	at,
	x1,
	y1,
	x2,
	y2,
	text,
}) => {
	const p = interpolate(t, [at, at + 0.6], [0, 1], {...clamp, easing: ease.out});
	const txt = interpolate(t, [at + 0.2, at + 0.75], [0, 1], {...clamp, easing: ease.out});
	const ex = x1 + (x2 - x1) * p;
	const ey = y1 + (y2 - y1) * p;
	return (
		<g opacity={Math.min(1, p * 3)}>
			<circle cx={x1} cy={y1} r={4} fill={colors.ink} />
			<line x1={x1} y1={y1} x2={ex} y2={ey} stroke={colors.ink} strokeWidth="1.5" />
			<line x1={x2} y1={y2} x2={x2 + 40 * txt} y2={y2} stroke={colors.ink} strokeWidth="1.5" />
			<text
				x={x2 + 54}
				y={y2 + 9}
				opacity={txt}
				transform={`translate(${(1 - txt) * -8} 0)`}
				style={{fontFamily: fonts.sans, fontWeight: 600, fontSize: 27, fill: colors.ink, letterSpacing: '0.01em'}}
			>
				{text}
			</text>
		</g>
	);
};
