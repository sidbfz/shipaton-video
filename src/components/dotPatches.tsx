import React from 'react';
import {Img} from 'remotion';
import PATCHES_JSON from '../data/dot-patches.json';
import type {PhoneShot} from './Phone';
import {useT} from './timing';
import {sourceFrameAt} from './tracking';

/**
 * Paints out the screen recorder's touch indicators on footage that plays.
 * Patches come from scripts/clean_touch_dots.py (see that file): small
 * feathered images keyed by source frame, refilled from the pixels either side
 * of the dot. Dots over text, icons or edges are left untouched there.
 */
type Entry = [number, number, string, number];
const PATCHES = PATCHES_JSON as unknown as Record<string, Record<string, Entry[]>>;
const SIZE = 48; // PATCH_SIZE in the script

export const DotPatches: React.FC<{shot: PhoneShot}> = ({shot}) => {
	const t = useT();
	const bySrc = PATCHES[shot.src];
	if (!bySrc) return null;
	const entries = bySrc[String(sourceFrameAt(shot, t))];
	if (!entries) return null;
	return (
		<>
			{entries.map(([x, y, uri, opacity], i) => (
				<Img
					key={i}
					src={uri}
					style={{position: 'absolute', left: x, top: y, width: SIZE, height: SIZE, opacity}}
				/>
			))}
		</>
	);
};
