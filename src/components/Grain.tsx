import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

/**
 * Analogue warmth: a static paper fibre texture, a fine film grain whose seed
 * steps every two frames (deterministic), and a very soft vignette.
 */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 1}) => {
	const frame = useCurrentFrame();
	const seed = Math.floor(frame / 2) % 97;
	return (
		<AbsoluteFill style={{pointerEvents: 'none', opacity}}>
			{/* Paper fibres: low-frequency, static */}
			<svg width="100%" height="100%" style={{position: 'absolute', mixBlendMode: 'multiply', opacity: 0.035}}>
				<filter id="paper">
					<feTurbulence type="fractalNoise" baseFrequency="0.018 0.09" numOctaves={3} seed={7} />
					<feColorMatrix
						type="matrix"
						values="0 0 0 0 0.45  0 0 0 0 0.36  0 0 0 0 0.3  0 0 0 1.4 -0.35"
					/>
				</filter>
				<rect width="100%" height="100%" filter="url(#paper)" />
			</svg>
			{/* Film grain: fine, animated */}
			<svg width="100%" height="100%" style={{position: 'absolute', mixBlendMode: 'soft-light', opacity: 0.32}}>
				<filter id="grain">
					<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={seed} stitchTiles="stitch" />
					<feColorMatrix type="saturate" values="0" />
				</filter>
				<rect width="100%" height="100%" filter="url(#grain)" />
			</svg>
			{/* Vignette */}
			<AbsoluteFill
				style={{
					background: 'radial-gradient(ellipse 75% 70% at 50% 48%, rgba(0,0,0,0) 62%, rgba(70,48,36,0.10) 100%)',
				}}
			/>
		</AbsoluteFill>
	);
};
