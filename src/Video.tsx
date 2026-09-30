import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {Captions} from './components/Captions';
import {Grain} from './components/Grain';
import {At} from './components/timing';
import {FontGate} from './fonts';
import {RunA, RunB, RunC, RunD} from './scenes/AppRuns';
import {Diagram, Hook, Personal} from './scenes/Intro';
import {CareCard, Closing, Resolution} from './scenes/Outro';
import {colors} from './theme';

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
			<At start={24.15} end={47.8} name="Onboarding, home, check-in">
				<RunA />
			</At>
			<At start={47.4} end={69.2} name="History, medicines, routines, journal">
				<RunB />
			</At>
			<At start={68.8} end={91.4} name="Photos, privacy, disclaimer">
				<RunC />
			</At>
			<At start={91.1} end={105.3} name="Free care, Lifetime Supporter">
				<RunD />
			</At>
			<At start={106.6} end={113.6} name="Resolution">
				<Resolution />
			</At>
			<At start={113.25} end={118.625} name="Closing logo">
				<Closing />
			</At>
			{/* Dark fields sit above the cream scenes they dissolve into. */}
			<At start={0} end={7.0} name="Hook">
				<Hook />
			</At>
			<At start={104.8} end={107.0} name="Care is never the paywall">
				<CareCard />
			</At>
			<At start={0} end={118.625} name="Captions">
				<Captions />
			</At>
			<Grain />
		</FontGate>
	</AbsoluteFill>
);
