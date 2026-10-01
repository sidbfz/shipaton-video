/** All screen recordings are portrait 720 x 1606 (a real 9:20 phone screen). */
export const SRC_W = 720;
export const SRC_H = 1606;

/** The app's own background colour, used for the clean status bar and dips between screens. */
export const APP_BG = '#F4EFEA';

/** Status bar (clock, notification icons) is covered by a clean strip of app background. */
export const STATUS_BAR_H = 62;

/** Device bezel and corner radii at the reference screen height of 950 px. */
const REF_H = 950;
const BEZEL = 11;
const OUTER_R = 60;
const INNER_R = 49;

export const phoneDims = (screenH: number) => {
	const k = screenH / REF_H;
	const screenW = (screenH * SRC_W) / SRC_H;
	const bezel = Math.max(6, BEZEL * k);
	return {
		screenW,
		screenH,
		bezel,
		deviceW: screenW + 2 * bezel,
		deviceH: screenH + 2 * bezel,
		outerR: OUTER_R * k,
		innerR: INNER_R * k,
		/** source px -> screen px */
		scale: screenW / SRC_W,
	};
};

/** Screen-space rectangle of a box given in source pixels, for a phone centred at (cx, cy). */
export const boxOnCanvas = (
	box: [number, number, number, number],
	cx: number,
	cy: number,
	screenH: number,
) => {
	const d = phoneDims(screenH);
	const left = cx - d.screenW / 2;
	const top = cy - d.screenH / 2;
	return {
		x: left + box[0] * d.scale,
		y: top + box[1] * d.scale,
		w: box[2] * d.scale,
		h: box[3] * d.scale,
	};
};
