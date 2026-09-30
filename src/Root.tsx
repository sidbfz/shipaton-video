import React from 'react';
import {Composition, Still} from 'remotion';
import {ContactSheet, ContactSheetProps, sheetSize} from './ContactSheet';
import {DURATION_IN_FRAMES, FPS, HEIGHT, WIDTH} from './theme';
import {FistulaTrackerVideo} from './Video';

const defaultSheet: ContactSheetProps = {title: 'Contact sheet', frames: []};

export const RemotionRoot: React.FC = () => (
	<>
		<Composition
			id="FistulaTracker"
			component={FistulaTrackerVideo}
			durationInFrames={DURATION_IN_FRAMES}
			fps={FPS}
			width={WIDTH}
			height={HEIGHT}
		/>
		{/* Utility still used by scripts/contact-sheet.mjs; not part of the video. */}
		<Still
			id="ContactSheet"
			component={ContactSheet}
			defaultProps={defaultSheet}
			calculateMetadata={({props}) => sheetSize(Math.max(1, props.frames.length))}
			width={1920}
			height={1080}
		/>
	</>
);
