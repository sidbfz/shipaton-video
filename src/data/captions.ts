/**
 * Sentence-level captions, synchronised to assets/shipaton-VO.wav.
 *
 * `s` / `e` are the start of the first word and end of the last word in
 * seconds, taken from the offline forced alignment in src/data/vo-words.json
 * (see scripts/align_vo.py). Long sentences are split at natural phrase
 * boundaries so no caption needs more than two lines.
 *
 * `hidden` captions are spoken lines that are already typeset on screen
 * word-for-word as editorial typography (hook, "Care is never the paywall",
 * closing phrases) — showing both would duplicate the same words twice.
 *
 * `hl` phrases are highlighted in the muted rose accent (used sparingly).
 * The transcript's "Revenue cap" is a recognition error: always "RevenueCat".
 */
export type CaptionDef = {
	text: string;
	s: number;
	e: number;
	hl?: string[];
	hidden?: boolean;
};

export const CAPTIONS: CaptionDef[] = [
	{text: 'Cancer can come back.', s: 0.0, e: 1.0, hidden: true},
	{text: 'So can an anal fistula.', s: 1.24, e: 2.38, hidden: true},
	{text: 'Even with all the progress in medicine,', s: 2.66, e: 4.24, hidden: true},
	{text: 'there is no promise that either is gone forever.', s: 4.24, e: 6.33, hidden: true},
	{text: 'A fistula is like having a second opening near your anus.', s: 6.58, e: 9.19},
	{text: 'It can leak, bleed, and cause serious pain.', s: 9.41, e: 11.62},
	{text: 'I had one, and I went through two surgeries.', s: 12.46, e: 14.34},
	{text: 'Recovery did not end after surgery.', s: 14.6, e: 16.32},
	{text: 'I still had medicines to remember, symptoms to track,', s: 16.58, e: 19.06},
	{text: 'wounds to monitor, and questions for my doctor.', s: 19.24, e: 21.55},
	{text: 'That is why I built Fistula Tracker.', s: 21.86, e: 23.55, hl: ['Fistula Tracker']},
	{text: 'When you first open the app, the onboarding introduces my story', s: 24.38, e: 27.45},
	{text: 'and explains why I created it.', s: 27.63, e: 28.96},
	{text: 'It also asks a few questions about your condition and recovery.', s: 29.25, e: 32.03},
	{text: 'Your answers are saved locally', s: 32.31, e: 33.56, hl: ['saved locally']},
	{text: "and used to adapt the app's experience to your needs.", s: 33.56, e: 35.61},
	{text: 'After onboarding, the home screen gives you a simple view of your recovery', s: 36.17, e: 39.28},
	{text: 'and shows what needs your attention today.', s: 39.44, e: 41.07},
	{text: 'Daily check-ins guide you through a few short questions.', s: 41.39, e: 43.65},
	{text: 'You can record pain, discharge, bowel movements, and other changes.', s: 43.82, e: 47.02},
	{text: 'Your previous check-ins are saved by date,', s: 47.59, e: 49.35},
	{text: 'helping you understand how your recovery has changed over time.', s: 49.52, e: 52.12},
	{text: 'The medicine section helps you organize what you take,', s: 52.39, e: 54.56},
	{text: 'add instructions, and create reminders for important doses.', s: 54.74, e: 57.71},
	{text: 'You can also create simple recovery routines', s: 58.39, e: 60.48},
	{text: 'and keep your daily tasks together.', s: 60.48, e: 61.99},
	{text: 'The journal gives you a private place to save thoughts, questions,', s: 62.29, e: 65.09, hl: ['private place']},
	{text: 'and anything you want to remember for your next appointment.', s: 65.24, e: 67.49},
	{text: 'You can save dated recovery photos too.', s: 69.0, e: 70.86},
	{text: 'They stay organized alongside the rest of your recovery history', s: 71.28, e: 73.94},
	{text: 'instead of getting lost in your normal gallery.', s: 74.15, e: 76.13},
	{text: 'Fistula Tracker requires no account.', s: 76.66, e: 78.51, hl: ['no account']},
	{text: 'Your onboarding answers, check-ins, medicines, journal entries, and photos', s: 79.37, e: 82.82},
	{text: 'stay locally on your device.', s: 82.82, e: 84.21, hl: ['locally on your device']},
	{text: 'The app does not diagnose you, recommend treatment,', s: 84.53, e: 86.87},
	{text: 'or replace professional medical care.', s: 86.87, e: 88.43},
	{text: 'It simply helps you organize your own recovery.', s: 88.78, e: 90.74},
	{text: 'Every recovery feature is free.', s: 91.31, e: 92.79, hl: ['free']},
	{text: 'There are no advertisements, subscriptions, or locked care tools.', s: 93.05, e: 95.88},
	{text: 'RevenueCat powers one optional Lifetime Supporter purchase', s: 96.15, e: 99.06, hl: ['optional']},
	{text: 'for people who want to support the project.', s: 99.06, e: 100.76},
	{text: 'Whether you purchase it or not, every recovery tool remains available.', s: 101.67, e: 104.74, hl: ['every recovery tool remains available']},
	{text: 'Care is never the paywall.', s: 105.16, e: 106.34, hidden: true},
	{text: 'I built Fistula Tracker because it is the app I wish I had', s: 106.84, e: 109.74},
	{text: 'during my own recovery.', s: 109.74, e: 110.81},
	{text: 'I hope you never need it.', s: 111.03, e: 112.02},
	{text: 'But if you do, I hope it makes recovery…', s: 113.54, e: 115.13},
	{text: 'more organized, more private, and a little less lonely.', s: 115.13, e: 117.86, hidden: true},
];

/**
 * Where captions sit. App scenes place the recording on one side and
 * captions under the opposite text column so they never cover app controls.
 */
export type CaptionZone = 'center' | 'colLeft' | 'colRight';
export const CAPTION_ZONES: {from: number; zone: CaptionZone}[] = [
	{from: 0, zone: 'center'},
	{from: 24.2, zone: 'colRight'}, // recording on the left
	{from: 47.45, zone: 'colLeft'}, // recording on the right
	{from: 68.85, zone: 'colRight'},
	{from: 91.15, zone: 'colLeft'},
	{from: 104.9, zone: 'center'},
];
