import React from 'react';
import {interpolate} from 'remotion';
import {Eyebrow, Headline, Icon, Tag, TimedList} from '../components/Editorial';
import {Phone, PhoneShot} from '../components/Phone';
import {Reveal} from '../components/Transitions';
import {useT} from '../components/timing';
import {CARE_CARD, phoneAt, TEXT_COL, TRIPTYCH} from '../data/timeline';
import {colors, ease, fonts} from '../theme';

/**
 * The app demo (24.2s–105s): one phone at true proportions, always showing the
 * complete screen. `at` = VO second a screen appears, `clip` = position in the
 * recording, `holdAt` = a clean freeze frame. Highlights outline the control
 * the narration is naming; nothing is ever zoomed or cropped.
 *
 * Deliberately excluded source ranges:
 *  - 01 0.0–2.5s  (header names the developer)
 *  - 06 14.0–16.9s (system photo picker shows a personal gallery)
 *  - 08 2.2–4.2s and 5.8s+ ("Checking the store…" spinner, then touch
 *    indicators on the support card) — the purchase is already complete.
 * Frozen touch indicators on flat buttons are painted out with `patches`.
 */

const BUTTON = '#181818';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const MAIN_SHOTS: PhoneShot[] = [
	// ── Onboarding ──
	// "the onboarding introduces my story"
	{src: '01-onboarding-story.mp4', at: 24.2, clip: 6.3},
	// "and explains why I created it"
	{src: '02-onboarding-personalization.mp4', at: 27.65, clip: 12.55, holdAt: 12.55, patches: [{x: 493, y: 1332, r: 20, color: BUTTON}]},
	// "It also asks a few questions about your condition and recovery."
	{src: '01-onboarding-story.mp4', at: 29.25, clip: 3.2, holdAt: 5.4, patches: [{x: 512, y: 1334, r: 20, color: BUTTON}]},
	// "Your answers are saved locally…"
	{
		src: '02-onboarding-personalization.mp4',
		at: 32.0,
		clip: 14.05,
		holdAt: 14.6,
		patches: [{x: 495, y: 1350, r: 20, color: BUTTON}],
		highlights: [{from: 32.75, to: 34.3, box: [14, 496, 692, 104], radius: 18}],
	},
	// "…used to adapt the app's experience" → Home shows the chosen stage. "…shows what needs your attention today."
	{
		src: '03-home-and-checkin.mp4',
		at: 34.4,
		clip: 0.0,
		holdAt: 0.9,
		highlights: [
			{from: 34.75, to: 36.3, box: [14, 172, 450, 170], radius: 20},
			{from: 39.55, to: 41.2, box: [36, 418, 648, 246], radius: 34},
		],
	},
	// ── Daily check-in (this phone becomes the first of three) ──
	// "Daily check-ins guide you through a few short questions. You can record pain,"
	{
		src: '03-home-and-checkin.mp4',
		at: 41.25,
		clip: 1.2,
		holdAt: 3.7,
		highlights: [{from: 44.35, to: 45.25, box: [12, 600, 696, 360], radius: 22}],
	},
	// ── Recovery timeline ──
	// "Your previous check-ins are saved by date, helping you understand how your recovery has changed over time."
	{
		src: '04-history-and-timeline.mp4',
		at: 47.6,
		clip: 4.6,
		holdAt: 9.5,
		highlights: [
			{from: 48.9, to: 50.45, box: [16, 868, 696, 378], radius: 20},
			{from: 50.6, to: 52.15, box: [16, 262, 696, 504], radius: 20},
		],
	},
	// ── Medicines ──
	// "The medicine section helps you organize what you take,"
	{src: '05-medicine-reminders-routines.mp4', at: 52.3, clip: 1.4, holdAt: 4.7, highlights: [{from: 53.45, to: 54.6, box: [26, 696, 668, 322], radius: 28}]},
	// "add instructions, and create reminders for important doses." (continuous footage: edit → scroll to reminders)
	{
		src: '05-medicine-reminders-routines.mp4',
		at: 54.7,
		clip: 5.45,
		holdAt: 8.6,
		highlights: [
			{from: 54.95, to: 55.85, box: [24, 733, 674, 268], radius: 22},
			{from: 57.0, to: 58.2, box: [16, 893, 696, 80], radius: 18},
		],
	},
	// "You can also create simple recovery routines and keep your daily tasks together."
	{src: '05-medicine-reminders-routines.mp4', at: 58.3, clip: 14.7},
	// ── Journal ──
	// "The journal gives you a private place to save thoughts, questions,"
	{src: '06-journal-and-photos.mp4', at: 62.2, clip: 1.6, holdAt: 2.55, highlights: [{from: 63.0, to: 65.05, box: [30, 126, 664, 764], radius: 30}]},
	// "and anything you want to remember for your next appointment." — the saved, dated entry
	{src: '06-journal-and-photos.mp4', at: 65.15, clip: 9.3, holdAt: 10.4, highlights: [{from: 65.6, to: 68.6, box: [16, 932, 696, 290], radius: 20}]},
	// ── Recovery photos ──
	// "You can save dated recovery photos too." (freeze before the system picker opens)
	{src: '06-journal-and-photos.mp4', at: 68.95, clip: 12.2, holdAt: 13.55, highlights: [{from: 70.4, to: 71.2, box: [24, 553, 674, 148], radius: 20}]},
	// "They stay organized alongside the rest of your recovery history…" (picker skipped)
	{src: '06-journal-and-photos.mp4', at: 71.25, clip: 17.05},
	// ── Privacy ──
	// "Fistula Tracker requires no account."
	{src: '07-privacy-and-settings.mp4', at: 76.5, clip: 2.75, holdAt: 4.6, highlights: [{from: 77.3, to: 79.2, box: [16, 378, 696, 268], radius: 20}]},
	// "…stay locally on your device."
	{src: '07-privacy-and-settings.mp4', at: 79.3, clip: 7.5, holdAt: 8.0, highlights: [{from: 80.2, to: 84.2, box: [34, 376, 654, 308], radius: 28}]},
	// Data controls scroll by, then "A companion, not a clinician." — the app's own medical boundary
	{src: '07-privacy-and-settings.mp4', at: 84.35, clip: 10.6, holdAt: 13.3, highlights: [{from: 87.3, to: 91.0, box: [16, 1266, 696, 144], radius: 18}]},
	// ── Free care and optional support ──
	// "Every recovery feature is free." — More: "Support the app · Optional support; recovery tools stay free"
	{src: '08-lifetime-supporter.mp4', at: 91.2, clip: 0.2, holdAt: 2.1, highlights: [{from: 91.95, to: 93.9, box: [16, 943, 696, 96], radius: 18}]},
	// Supporter screen, purchase already complete (clean confirmed state, held)
	{
		src: '08-lifetime-supporter.mp4',
		at: 94.0,
		clip: 4.3,
		holdAt: 5.5,
		highlights: [
			{from: 94.3, to: 95.95, box: [16, 403, 696, 134], radius: 18},
			{from: 96.15, to: 97.65, box: [16, 1248, 696, 154], radius: 18}, // "…handled by your app store and RevenueCat"
			{from: 97.8, to: 101.45, box: [24, 928, 672, 268], radius: 30}, // One-time support · Support confirmed
			{from: 101.75, to: CARE_CARD.expandTo, box: [24, 570, 672, 334], radius: 34}, // the "Care is never the paywall" card
		],
	},
];

/** The supporter screen's dark card, in source px — the full-frame statement grows out of it. */
export const CARE_CARD_BOX: [number, number, number, number] = [25, 572, 670, 330];

const SLOT2_SHOTS: PhoneShot[] = [
	// "discharge,"
	{
		src: '03-home-and-checkin.mp4',
		at: 44.6,
		clip: 7.2,
		holdAt: 8.5,
		patches: [{x: 462, y: 1206, r: 20, color: BUTTON}],
		highlights: [{from: 44.97, to: 45.8, box: [22, 734, 616, 66], radius: 34}],
	},
];
const SLOT3_SHOTS: PhoneShot[] = [
	// "bowel movements, and other changes."
	{
		src: '03-home-and-checkin.mp4',
		at: 45.35,
		clip: 9.2,
		highlights: [
			{from: 45.73, to: 46.35, box: [14, 720, 696, 66], radius: 16},
			{from: 46.4, to: 47.05, box: [14, 818, 696, 164], radius: 16},
		],
	},
];

const MainPhone: React.FC = () => {
	const t = useT();
	const p = phoneAt(t);
	const enter = interpolate(t, [24.2, 24.85], [0, 1], {...clamp, easing: ease.out});
	const exit = interpolate(t, [CARE_CARD.expandFrom + 0.15, CARE_CARD.expandTo], [1, 0], clamp);
	return (
		<div style={{position: 'absolute', inset: 0, transform: `translateY(${(1 - enter) * 30}px)`}}>
			<Phone shots={MAIN_SHOTS} end={105.6} cx={p.cx} cy={p.cy} screenH={p.sh} opacity={Math.min(enter, exit)} />
		</div>
	);
};

const SlotPhone: React.FC<{shots: PhoneShot[]; cx: number; inAt: number}> = ({shots, cx, inAt}) => {
	const t = useT();
	const enter = interpolate(t, [inAt, inAt + 0.55], [0, 1], {...clamp, easing: ease.out});
	const exit = interpolate(t, [47.0, 47.3], [1, 0], clamp);
	return (
		<div style={{position: 'absolute', inset: 0, transform: `translateY(${(1 - enter) * 40}px)`}}>
			<Phone shots={shots} end={47.6} cx={cx} cy={TRIPTYCH.cy} screenH={TRIPTYCH.sh} opacity={Math.min(enter, exit)} />
		</div>
	);
};

/** Editorial text beside the phone, vertically centred in its column. */
const Beat: React.FC<{side: 'left' | 'right'; children: React.ReactNode}> = ({side, children}) => {
	const col = TEXT_COL[side];
	return (
		<div
			style={{
				position: 'absolute',
				left: col.x,
				width: col.width,
				top: TEXT_COL.top,
				height: TEXT_COL.bottom - TEXT_COL.top,
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
			}}
		>
			<div>{children}</div>
		</div>
	);
};

const Statement: React.FC<{at: number; out: number; text: string; icon: 'device' | 'lock' | 'shield'}> = ({at, out, text, icon}) => (
	<Reveal at={at} out={out} dy={14}>
		<div style={{display: 'flex', alignItems: 'center', gap: 26, padding: '22px 0', borderBottom: `1px solid ${colors.line}`}}>
			<div
				style={{
					width: 62,
					height: 62,
					borderRadius: 62,
					border: `1.5px solid ${colors.roseSoft}`,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<Icon kind={icon} size={30} />
			</div>
			<div style={{fontFamily: fonts.serif, fontSize: 66, lineHeight: 1, color: colors.ink}}>{text}</div>
		</div>
	</Reveal>
);

const RevenueCatLine: React.FC<{at: number; out: number}> = ({at, out}) => (
	<Reveal at={at} out={out} dy={10} style={{marginTop: 44}}>
		<div style={{display: 'flex', flexDirection: 'column', gap: 12, paddingLeft: 26, borderLeft: `2px solid ${colors.roseSoft}`}}>
			<div style={{fontFamily: fonts.sans, fontSize: 20, fontWeight: 700, letterSpacing: '0.2em', color: colors.inkFaint, textTransform: 'uppercase'}}>
				Purchase powered by
			</div>
			<div style={{fontFamily: fonts.sans, fontSize: 44, fontWeight: 700, letterSpacing: '-0.01em', color: colors.ink}}>RevenueCat</div>
			<div style={{fontFamily: fonts.sans, fontSize: 28, lineHeight: 1.45, color: colors.inkSoft, maxWidth: 640}}>
				It handles the optional purchase only — never your recovery records.
			</div>
		</div>
	</Reveal>
);

export const Demo: React.FC = () => (
	<>
		{/* ── Onboarding · home · check-in — phone left, text right ── */}
		<Beat side="right">
			<Eyebrow at={24.5} out={29.2}>Onboarding</Eyebrow>
			<Headline lines={['It begins', 'with *a story.*']} at={24.6} out={29.2} italicColor={colors.roseDeep} />
		</Beat>
		<Beat side="right">
			<Eyebrow at={29.3} out={36.1}>Personalized</Eyebrow>
			<Headline lines={['Shaped around', '*your answers.*']} at={29.35} out={36.1} italicColor={colors.roseDeep} />
			<Tag at={32.75} out={36.1} icon="device">
				Saved on this device
			</Tag>
		</Beat>
		<Beat side="right">
			<Eyebrow at={36.2} out={41.25}>Home</Eyebrow>
			<Headline lines={['Today,', '*at a glance.*']} at={36.25} out={41.25} italicColor={colors.roseDeep} />
		</Beat>
		<Beat side="right">
			<Eyebrow at={41.35} out={43.5}>Daily check-in</Eyebrow>
			<Headline lines={['Check in,', '*in seconds.*']} at={41.4} out={43.5} italicColor={colors.roseDeep} />
		</Beat>

		{/* ── Timeline · medicines · routines · journal — phone right, text left ── */}
		<Beat side="left">
			<Eyebrow at={48.0} out={52.25}>Recovery timeline</Eyebrow>
			<Headline lines={['Saved', '*by date.*']} at={48.05} out={52.25} italicColor={colors.roseDeep} />
		</Beat>
		<Beat side="left">
			<Eyebrow at={52.35} out={58.25}>Medicines</Eyebrow>
			<Headline lines={['What you take,', '*organized.*']} at={52.4} out={58.25} italicColor={colors.roseDeep} />
			<TimedList
				marker="dash"
				out={58.25}
				items={[
					{text: 'Instructions from your label', at: 54.75},
					{text: 'Reminders for important doses', at: 56.25},
				]}
			/>
		</Beat>
		<Beat side="left">
			<Eyebrow at={58.35} out={62.15}>Daily routine</Eyebrow>
			<Headline lines={['Simple routines,', '*kept together.*']} at={58.4} out={62.15} italicColor={colors.roseDeep} />
		</Beat>
		<Beat side="left">
			<Eyebrow at={62.25} out={68.1}>Journal</Eyebrow>
			<Headline lines={['A private place', '*to think.*']} at={62.3} out={68.1} italicColor={colors.roseDeep} />
		</Beat>

		{/* ── Photos · privacy · medical boundary — phone left, text right ── */}
		<Beat side="right">
			<Eyebrow at={69.5} out={76.45}>Recovery photos</Eyebrow>
			<Headline lines={['Dated, and', '*kept private.*']} at={69.55} out={76.45} italicColor={colors.roseDeep} />
		</Beat>
		<Beat side="right">
			<Headline lines={['No account', '*required.*']} at={76.62} out={79.3} size={124} italicColor={colors.roseDeep} />
		</Beat>
		<Beat side="right">
			<Eyebrow at={79.4} out={84.4}>Privacy</Eyebrow>
			<Statement at={79.5} out={84.4} text="Stored locally" icon="device" />
			<Statement at={80.55} out={84.4} text="Private by design" icon="lock" />
			<Statement at={81.6} out={84.4} text="You remain in control" icon="shield" />
		</Beat>
		<Beat side="right">
			<Eyebrow at={84.5} out={90.75}>A companion, not a clinician</Eyebrow>
			<Headline lines={['Organizes recovery.', '*Does not diagnose.*']} at={84.9} stagger={0.4} out={90.75} size={88} italicColor={colors.roseDeep} />
		</Beat>

		{/* ── Free care · optional support — phone right, text left ── */}
		<Beat side="left">
			<Eyebrow at={91.75} out={96.0}>No paywall</Eyebrow>
			<Headline lines={['Every care tool,', '*free.*']} at={91.8} out={96.0} italicColor={colors.roseDeep} />
			<TimedList
				marker="dash"
				out={96.0}
				items={[
					{text: 'No advertisements', at: 93.4},
					{text: 'No subscriptions', at: 94.15},
					{text: 'No locked care tools', at: 94.9},
				]}
			/>
		</Beat>
		<Beat side="left">
			<Eyebrow at={96.1} out={101.6}>Optional support</Eyebrow>
			<Headline lines={['Lifetime', '*Supporter.*']} at={96.15} out={101.6} italicColor={colors.roseDeep} />
			<RevenueCatLine at={96.2} out={101.6} />
		</Beat>
		<Beat side="left">
			<Eyebrow at={101.7} out={104.75}>Purchase or not</Eyebrow>
			<Headline lines={['Every recovery tool', '*stays available.*']} at={101.72} out={104.75} size={86} italicColor={colors.roseDeep} />
			<TimedList
				marker="check"
				size={30}
				out={104.75}
				items={[
					{text: 'Check-ins and history', at: 102.4},
					{text: 'Medicines and reminders', at: 102.75},
					{text: 'Journal and photos', at: 103.1},
					{text: 'Privacy and data controls', at: 103.45},
				]}
			/>
		</Beat>

		{/* Phones draw above the text so a gliding phone never sits behind type. */}
		<SlotPhone shots={SLOT2_SHOTS} cx={TRIPTYCH.slots[1]} inAt={44.6} />
		<SlotPhone shots={SLOT3_SHOTS} cx={TRIPTYCH.slots[2]} inAt={45.35} />
		<MainPhone />
	</>
);
