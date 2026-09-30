import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/700.css';
import React, {useEffect, useState} from 'react';
import {continueRender, delayRender} from 'remotion';

const FACES = [
	'400 40px "Instrument Serif"',
	'italic 400 40px "Instrument Serif"',
	'400 40px Manrope',
	'500 40px Manrope',
	'600 40px Manrope',
	'700 40px Manrope',
];

/**
 * Blocks rendering until every font face is loaded, so no frame is captured
 * with fallback fonts and caption line measurement is exact.
 */
export const FontGate: React.FC<{children: React.ReactNode}> = ({children}) => {
	const [handle] = useState(() => delayRender('Loading fonts'));
	const [ready, setReady] = useState(false);

	useEffect(() => {
		Promise.all(FACES.map((face) => document.fonts.load(face)))
			.then(() => document.fonts.ready)
			.then(() => {
				const missing = FACES.filter((face) => !document.fonts.check(face));
				if (missing.length > 0) {
					throw new Error(`Fonts failed to load: ${missing.join(', ')}`);
				}
				setReady(true);
				continueRender(handle);
			});
	}, [handle]);

	return ready ? <>{children}</> : null;
};
