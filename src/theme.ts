import {Easing} from 'remotion';

export const FPS = 24;
export const WIDTH = 1920;
export const HEIGHT = 1080;
// Voice-over is 118.593s; 2847 frames = 118.625s (last 0.032s silent).
export const DURATION_IN_FRAMES = 2847;

/** Seconds -> composition frame. All timings in this project are authored in seconds of the VO. */
export const f = (seconds: number) => Math.round(seconds * FPS);

export const colors = {
	cream: '#F3EEE7',
	paper: '#EAE2D7',
	card: '#F8F5F0',
	charcoal: '#211F1D',
	charcoalSoft: '#2C2926',
	ink: '#2A2724',
	inkSoft: '#6B635B',
	inkFaint: '#9C938A',
	rose: '#B4726E',
	roseDeep: '#9A5652',
	roseSoft: '#D9B3AC',
	roseWash: '#EBD6CF',
	line: 'rgba(42, 39, 36, 0.14)',
};

export const fonts = {
	serif: '"Instrument Serif", Georgia, serif',
	sans: '"Manrope", "Helvetica Neue", Arial, sans-serif',
};

export const ease = {
	out: Easing.bezier(0.22, 1, 0.36, 1),
	inOut: Easing.bezier(0.65, 0, 0.35, 1),
	soft: Easing.bezier(0.33, 0, 0.2, 1),
};
