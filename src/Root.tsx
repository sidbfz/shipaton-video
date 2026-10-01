import React from 'react';
import {Composition, Still} from 'remotion';
import {ContactSheet, ContactSheetProps, sheetSize} from './ContactSheet';
import {DURATION_IN_FRAMES, FPS, HEIGHT, WIDTH} from './theme';
import {THUMB, Thumbnail} from './Thumbnail';
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
		{/* YouTube thumbnail: npm run thumbnail -> out/thumbnail.png */}
		{/* A one-frame composition at the video's 24 fps, so recording trims mean the same as in the video. */}
		<Composition id="Thumbnail" component={Thumbnail} durationInFrames={1} fps={FPS} width={THUMB.width} height={THUMB.height} />
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
