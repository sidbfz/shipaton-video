import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {Captions} from './components/Captions';
import {Grain} from './components/Grain';
import {At} from './components/timing';
import {FontGate} from './fonts';
import {Demo} from './scenes/Demo';
import {Diagram, Hook, Personal} from './scenes/Intro';
import {CareCard, Closing, Resolution} from './scenes/Outro';
import {colors} from './theme';

/**
 * Burned-in captions are off: the headlines and callouts already carry the
 * story, and subtitles ship as out/fistula-tracker-shipaton.srt for YouTube
 * (npm run srt). Set to true to burn them in again.
 */
const BURN_IN_CAPTIONS = false;

/**
 * Master timeline. Every scene is authored in absolute voice-over seconds
 * (see src/data/captions.ts for the word-aligned narration timings).
 */
export const FistulaTrackerVideo: React.FC = () => (
	<AbsoluteFill style={{background: colors.cream}}>
		{/* Voice-over: the timing authority. Starts at frame 0, unaltered. */}
		<Audio src={staticFile('shipaton-VO.wav')} />
		<FontGate>
			<At start={6.4} end={12.7} name="Fistula diagram">
				<Diagram />
			</At>
			<At start={12.3} end={24.7} name="Personal story + logo">
				<Personal />
			</At>
			<At start={24.15} end={105.6} name="App demo (one phone)">
				<Demo />
			</At>
			<At start={106.6} end={113.6} name="Resolution">
				<Resolution />
			</At>
			<At start={113.25} end={118.625} name="Closing logo">
				<Closing />
			</At>
			{/* Dark fields sit above the cream scenes they dissolve into. */}
			<At start={0} end={7.3} name="Hook">
				<Hook />
			</At>
			<At start={104.7} end={107.3} name="Care is never the paywall">
				<CareCard />
			</At>
			{BURN_IN_CAPTIONS ? (
				<At start={0} end={118.625} name="Captions">
					<Captions />
				</At>
			) : null}
			<Grain />
		</FontGate>
	</AbsoluteFill>
);
