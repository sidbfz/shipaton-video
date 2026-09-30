import React, {createContext, useContext} from 'react';
import {Sequence, useCurrentFrame} from 'remotion';
import {f, FPS} from '../theme';

/**
 * Every timing in this project is authored in absolute voice-over seconds.
 * <At> wraps a <Sequence> (converting the absolute start to the parent's
 * relative frame) and records the absolute start frame so that useT() can
 * return the absolute VO time at any nesting depth.
 */
const StartFrameContext = createContext(0);

export const At: React.FC<{
	start: number;
	end: number;
	name?: string;
	children: React.ReactNode;
}> = ({start, end, name, children}) => {
	const parentFrom = useContext(StartFrameContext);
	const from = f(start);
	return (
		<Sequence
			from={from - parentFrom}
			durationInFrames={Math.max(1, f(end) - from)}
			name={name}
			layout="none"
		>
			<StartFrameContext.Provider value={from}>{children}</StartFrameContext.Provider>
		</Sequence>
	);
};

/** Absolute VO time in seconds for the current frame. */
export const useT = () => {
	const startFrame = useContext(StartFrameContext);
	const frame = useCurrentFrame();
	return (startFrame + frame) / FPS;
};
