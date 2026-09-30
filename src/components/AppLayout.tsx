import React from 'react';
import {AbsoluteFill} from 'remotion';
import {AppWindow, Shot} from './AppRecording';

/** Window geometry shared by every app scene so the recording never jumps around. */
export const WINDOW = {w: 620, h: 920, y: 80, inset: 250};
const TEXT_COL = {width: 760, top: 190};

export type Side = 'left' | 'right';

export const windowX = (side: Side) => (side === 'left' ? WINDOW.inset : 1920 - WINDOW.inset - WINDOW.w);
export const textColX = (side: Side) => (side === 'left' ? 1000 : 160);

/**
 * App scene: a large recording on one side, a quiet editorial text column on
 * the other. Captions are placed under the text column (see captions.ts), so
 * they never sit on top of the application.
 */
export const AppScene: React.FC<{
	side: Side;
	shots: Shot[];
	end: number;
	children?: React.ReactNode;
	windowStyle?: React.CSSProperties;
}> = ({side, shots, end, children, windowStyle}) => (
	<AbsoluteFill>
		<AppWindow shots={shots} end={end} x={windowX(side)} y={WINDOW.y} w={WINDOW.w} h={WINDOW.h} style={windowStyle} />
		<div style={{position: 'absolute', left: textColX(side), top: TEXT_COL.top, width: TEXT_COL.width}}>{children}</div>
	</AbsoluteFill>
);

/** Absolutely stacked text slots inside a text column, so successive beats can cross-fade in place. */
export const Slot: React.FC<{top?: number; children: React.ReactNode}> = ({top = 0, children}) => (
	<div style={{position: 'absolute', left: 0, right: 0, top}}>{children}</div>
);
