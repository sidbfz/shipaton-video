import React from 'react';
import {interpolate} from 'remotion';
import {AppScene, Slot} from '../components/AppLayout';
import {Shot} from '../components/AppRecording';
import {Eyebrow, Headline, Icon, Sub, Tag, TimedList} from '../components/Editorial';
import {FadeLayer, Reveal} from '../components/Transitions';
import {useT} from '../components/timing';
import {colors, ease, fonts} from '../theme';

/**
 * Screen-recording timeline. `at` = VO second the shot starts, `clip` =
 * position inside the source recording, `holdAt` = clean freeze frame.
 * Camera `fy` is the vertical focus (0 top .. 1 bottom of the recording).
 *
 * Deliberately excluded source ranges:
 *  - 01 0.0–2.5s  (header names the developer)
 *  - 06 14.0–16.9s (system photo picker shows a personal gallery)
 *  - 08 2.2–4.2s and 5.8s+ ("Checking the store…" spinner, then touch
 *    indicators on the support card) — the purchase is already complete, so
 *    only the clean confirmed-support state is shown, as a held freeze frame.
 */

/** Slight horizontal settle when a whole run enters, so side changes feel intentional. */
const RunEnter: React.FC<{inAt: number; outAt: number; from: 'left' | 'right'; children: React.ReactNode}> = ({
	inAt,
	outAt,
	from,
	children,
}) => {
	const t = useT();
	const p = interpolate(t, [inAt, inAt + 0.8], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: ease.out,
	});
	const dx = (1 - p) * (from === 'left' ? -36 : 36);
	return (
		<FadeLayer inAt={inAt} outAt={outAt} inDur={0.5} outDur={0.35} style={{transform: `translateX(${dx}px)`}}>
			{children}
		</FadeLayer>
	);
};

// ─── Run A · recording left · onboarding, home, daily check-in (24.2–47.6) ───

const RUN_A_SHOTS: Shot[] = [
	// "the onboarding introduces my story"
	{src: '01-onboarding-story.mp4', at: 24.2, clip: 6.3, cam: [{t: 24.2, zoom: 1.0, fy: 0.4}, {t: 27.6, zoom: 1.07, fy: 0.38}]},
	// "and explains why I created it"
	{src: '02-onboarding-personalization.mp4', at: 27.55, clip: 12.55, holdAt: 12.55, cam: [{t: 27.55, zoom: 1.04, fy: 0.31}, {t: 29.4, zoom: 1.1, fy: 0.31}]},
	// "It also asks a few questions about your condition…"
	{src: '01-onboarding-story.mp4', at: 29.2, clip: 3.2, cam: [{t: 29.2, zoom: 1.02, fy: 0.37}]},
	// "…and recovery"
	{src: '01-onboarding-story.mp4', at: 30.8, clip: 11.4, cam: [{t: 30.8, zoom: 1.02, fy: 0.4}]},
	// "Your answers are saved locally"
	{src: '02-onboarding-personalization.mp4', at: 32.25, clip: 14.05, holdAt: 15.0, cam: [{t: 32.25, zoom: 1.05, fy: 0.33}, {t: 34.1, zoom: 1.1, fy: 0.33}]},
	// "used to adapt the app's experience" -> Home reflects the chosen stage ("Noticing signs").
	// Continues through "After onboarding, the home screen…" and punches in on today's card.
	{
		src: '03-home-and-checkin.mp4',
		at: 34.05,
		clip: 0.0,
		holdAt: 0.9,
		cam: [
			{t: 34.05, zoom: 1.0, fy: 0.36},
			{t: 36.4, zoom: 1.0, fy: 0.36},
			{t: 38.3, zoom: 1.0, fy: 0.56},
			{t: 39.5, zoom: 1.0, fy: 0.56},
			{t: 40.5, zoom: 1.1, fy: 0.34},
		],
	},
	// "Daily check-ins guide you through a few short questions. You can record pain,"
	{src: '03-home-and-checkin.mp4', at: 41.25, clip: 1.45, cam: [{t: 41.25, zoom: 1.06, fy: 0.44}, {t: 44.8, zoom: 1.1, fy: 0.44}]},
	// "discharge,"
	{src: '03-home-and-checkin.mp4', at: 44.85, clip: 7.35, cam: [{t: 44.85, zoom: 1.08, fy: 0.46}]},
	// "bowel movements, and other changes."
	{src: '03-home-and-checkin.mp4', at: 45.7, clip: 9.1, holdAt: 11.3, cam: [{t: 45.7, zoom: 1.06, fy: 0.46}]},
];

export const RunA: React.FC = () => (
	<RunEnter inAt={24.3} outAt={47.55} from="left">
		<AppScene side="left" shots={RUN_A_SHOTS} end={47.8}>
			<Slot top={40}>
				<Eyebrow at={24.45} out={29.15}>Onboarding</Eyebrow>
				<Headline lines={['It begins', 'with *a story.*']} at={24.55} out={29.15} italicColor={colors.roseDeep} />
				<Sub at={25.5} out={29.15}>Before asking anything, the app shares the story of why it exists.</Sub>
			</Slot>
			<Slot top={40}>
				<Eyebrow at={29.3} out={32.25}>A few questions</Eyebrow>
				<Headline lines={['It asks about', '*your recovery.*']} at={29.35} out={32.25} italicColor={colors.roseDeep} />
				<Sub at={30.3} out={32.25}>Your condition, any procedures, and where you are right now.</Sub>
			</Slot>
			<Slot top={40}>
				<Eyebrow at={32.35} out={36.05}>Personalized</Eyebrow>
				<Headline lines={['Shaped around', '*your answers.*']} at={32.4} out={36.05} italicColor={colors.roseDeep} />
				<Tag at={32.95} out={36.05} icon="device">
					Saved on this device
				</Tag>
				<Sub at={34.3} out={36.05}>Home adapts to the stage you chose.</Sub>
			</Slot>
			<Slot top={40}>
				<Eyebrow at={36.15} out={41.25}>Home</Eyebrow>
				<Headline lines={['Today,', '*at a glance.*']} at={36.2} out={41.25} italicColor={colors.roseDeep} />
				<Sub at={37.4} out={41.25}>A simple view of your recovery, and what needs your attention today.</Sub>
			</Slot>
			<Slot top={40}>
				<Eyebrow at={41.35} out={47.7}>Daily check-in</Eyebrow>
				<Headline lines={['Check in,', '*in seconds.*']} at={41.4} out={47.7} italicColor={colors.roseDeep} />
				<TimedList
					out={47.7}
					items={[
						{text: 'Pain', at: 44.4},
						{text: 'Discharge', at: 44.95},
						{text: 'Bowel movements', at: 45.7},
						{text: 'Other changes', at: 46.4},
					]}
				/>
			</Slot>
		</AppScene>
	</RunEnter>
);

// ─── Run B · recording right · history, medicines, routines, journal (47.45–69.1) ───

const RUN_B_SHOTS: Shot[] = [
	// "Your previous check-ins are saved by date, helping you understand how your recovery has changed"
	{
		src: '04-history-and-timeline.mp4',
		at: 47.45,
		clip: 4.6,
		holdAt: 9.5,
		cam: [
			{t: 47.45, zoom: 1.0, fy: 0.42},
			{t: 48.7, zoom: 1.0, fy: 0.42},
			{t: 49.5, zoom: 1.1, fy: 0.64},
			{t: 50.6, zoom: 1.1, fy: 0.64},
			{t: 51.5, zoom: 1.1, fy: 0.3},
		],
	},
	// "The medicine section helps you organize what you take,"
	{src: '05-medicine-reminders-routines.mp4', at: 52.3, clip: 1.4, cam: [{t: 52.3, zoom: 1.0, fy: 0.36}, {t: 53.4, zoom: 1.0, fy: 0.36}, {t: 54.3, zoom: 1.1, fy: 0.4}]},
	// "add instructions,"
	{src: '05-medicine-reminders-routines.mp4', at: 54.7, clip: 5.45, cam: [{t: 54.7, zoom: 1.08, fy: 0.42}, {t: 55.8, zoom: 1.1, fy: 0.46}]},
	// "and create reminders for important doses."
	{src: '05-medicine-reminders-routines.mp4', at: 55.85, clip: 6.85, holdAt: 8.6, cam: [{t: 55.85, zoom: 1.08, fy: 0.46}, {t: 56.8, zoom: 1.08, fy: 0.46}, {t: 57.8, zoom: 1.1, fy: 0.54}]},
	// "You can also create simple recovery routines and keep your daily tasks together."
	{src: '05-medicine-reminders-routines.mp4', at: 58.3, clip: 14.7, holdAt: 18.6, cam: [{t: 58.3, zoom: 1.0, fy: 0.45}, {t: 61.5, zoom: 1.04, fy: 0.5}]},
	// "The journal gives you a private place to save thoughts, questions,"
	{src: '06-journal-and-photos.mp4', at: 62.2, clip: 2.0, holdAt: 2.55, cam: [{t: 62.2, zoom: 1.0, fy: 0.42}, {t: 65.2, zoom: 1.08, fy: 0.38}]},
	// "and anything you want to remember for your next appointment." — the saved, dated entry.
	// (The typing section is skipped so the keyboard never covers the page.)
	{src: '06-journal-and-photos.mp4', at: 65.15, clip: 9.3, holdAt: 10.4, cam: [{t: 65.15, zoom: 1.04, fy: 0.42}, {t: 69.1, zoom: 1.1, fy: 0.5}]},
];

export const RunB: React.FC = () => (
	<RunEnter inAt={47.5} outAt={68.95} from="right">
		<AppScene side="right" shots={RUN_B_SHOTS} end={69.2}>
			<Slot top={40}>
				<Eyebrow at={47.6} out={52.3}>Recovery timeline</Eyebrow>
				<Headline lines={['Saved', '*by date.*']} at={47.65} out={52.3} italicColor={colors.roseDeep} />
				<Sub at={49.6} out={52.3}>Look back and see how your recovery has changed over time.</Sub>
			</Slot>
			<Slot top={40}>
				<Eyebrow at={52.4} out={58.3}>Medicines</Eyebrow>
				<Headline lines={['What you take,', '*organized.*']} at={52.45} out={58.3} italicColor={colors.roseDeep} />
				<TimedList
					marker="dash"
					out={58.3}
					items={[
						{text: 'Instructions from your label', at: 54.75},
						{text: 'Reminders for important doses', at: 56.25},
					]}
				/>
			</Slot>
			<Slot top={40}>
				<Eyebrow at={58.4} out={62.2}>Daily routine</Eyebrow>
				<Headline lines={['Simple routines,', '*kept together.*']} at={58.45} out={62.2} italicColor={colors.roseDeep} />
				<Sub at={59.6} out={62.2}>Sitz baths, dressings, daily tasks — on your own schedule.</Sub>
			</Slot>
			<Slot top={40}>
				<Eyebrow at={62.3} out={69.1}>Journal</Eyebrow>
				<Headline lines={['A private place', '*to think.*']} at={62.35} out={69.1} italicColor={colors.roseDeep} />
				<Sub at={63.7} out={69.1}>Thoughts, questions, and anything you want to remember for your next appointment.</Sub>
			</Slot>
		</AppScene>
	</RunEnter>
);

// ─── Run C · recording left · photos, no account, privacy, disclaimer (68.85–91.3) ───

const RUN_C_SHOTS: Shot[] = [
	// "You can save dated recovery photos too." (freeze before the system picker opens)
	{src: '06-journal-and-photos.mp4', at: 68.85, clip: 12.2, holdAt: 13.55, cam: [{t: 68.85, zoom: 1.0, fy: 0.42}, {t: 70.2, zoom: 1.0, fy: 0.4}, {t: 71.2, zoom: 1.08, fy: 0.36}]},
	// "They stay organized alongside the rest of your recovery history…" (picker skipped)
	{src: '06-journal-and-photos.mp4', at: 71.25, clip: 17.05, holdAt: 21.4, cam: [{t: 71.25, zoom: 1.0, fy: 0.52}, {t: 76.5, zoom: 1.06, fy: 0.5}]},
	// "Fistula Tracker requires no account."
	{src: '07-privacy-and-settings.mp4', at: 76.5, clip: 2.75, holdAt: 4.6, cam: [{t: 76.5, zoom: 1.02, fy: 0.3}, {t: 77.6, zoom: 1.02, fy: 0.3}, {t: 78.6, zoom: 1.1, fy: 0.3}]},
	// "Your onboarding answers, check-ins, … stay locally on your device."
	{src: '07-privacy-and-settings.mp4', at: 79.3, clip: 8.2, holdAt: 8.2, cam: [{t: 79.3, zoom: 1.04, fy: 0.38}, {t: 84.4, zoom: 1.1, fy: 0.4}]},
	// Data controls, then "A companion, not a clinician." — the app's own medical boundary.
	{
		src: '07-privacy-and-settings.mp4',
		at: 84.35,
		clip: 10.6,
		holdAt: 13.3,
		cam: [
			{t: 84.35, zoom: 1.02, fy: 0.5},
			{t: 85.6, zoom: 1.02, fy: 0.62},
			{t: 87.0, zoom: 1.1, fy: 0.75},
			{t: 91.3, zoom: 1.1, fy: 0.76},
		],
	},
];

const Statement: React.FC<{at: number; out: number; text: string; icon: 'device' | 'lock' | 'heart' | 'shield'}> = ({at, out, text, icon}) => (
	<Reveal at={at} out={out} dy={14}>
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: 26,
				padding: '22px 0',
				borderBottom: `1px solid ${colors.line}`,
			}}
		>
			<div
				style={{
					width: 58,
					height: 58,
					borderRadius: 58,
					border: `1.5px solid ${colors.roseSoft}`,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<Icon kind={icon} size={28} />
			</div>
			<div style={{fontFamily: fonts.serif, fontSize: 64, lineHeight: 1, color: colors.ink}}>{text}</div>
		</div>
	</Reveal>
);

export const RunC: React.FC = () => (
	<RunEnter inAt={68.9} outAt={91.25} from="left">
		<AppScene side="left" shots={RUN_C_SHOTS} end={91.4}>
			<Slot top={40}>
				<Eyebrow at={69.0} out={76.5}>Recovery photos</Eyebrow>
				<Headline lines={['Dated, and', '*kept private.*']} at={69.05} out={76.5} italicColor={colors.roseDeep} />
				<Sub at={71.5} out={76.5}>Organized alongside your recovery history — not lost in your everyday gallery.</Sub>
			</Slot>
			<Slot top={120}>
				<Headline lines={['No account', '*required.*']} at={76.62} out={79.3} size={124} italicColor={colors.roseDeep} />
			</Slot>
			<Slot top={40}>
				<Eyebrow at={79.4} out={84.45}>Privacy</Eyebrow>
				<Statement at={79.5} out={84.45} text="Stored locally" icon="device" />
				<Statement at={80.55} out={84.45} text="Private by design" icon="lock" />
				<Statement at={81.6} out={84.45} text="You remain in control" icon="shield" />
				<Sub at={82.85} out={84.45}>Answers, check-ins, medicines, journal entries and photos stay on your device.</Sub>
			</Slot>
			<Slot top={40}>
				<Eyebrow at={84.6} out={91.3}>A companion, not a clinician</Eyebrow>
				<Headline lines={['Organizes recovery.', '*Does not diagnose.*']} at={85.0} stagger={0.4} out={91.3} size={84} italicColor={colors.roseDeep} />
				<Sub at={86.9} out={91.3}>No diagnosis, no treatment advice, and never a replacement for professional medical care.</Sub>
			</Slot>
		</AppScene>
	</RunEnter>
);

// ─── Run D · recording right · free care and optional support (91.15–105.1) ───

const RUN_D_SHOTS: Shot[] = [
	// "Every recovery feature is free." — More screen: "Optional support; recovery tools stay free"
	{src: '08-lifetime-supporter.mp4', at: 91.15, clip: 0.2, holdAt: 2.1, cam: [{t: 91.15, zoom: 1.0, fy: 0.5}, {t: 92.6, zoom: 1.1, fy: 0.6}]},
	// Support screen (purchase already complete): clean confirmed state, then a held freeze.
	{
		src: '08-lifetime-supporter.mp4',
		at: 94.0,
		clip: 4.3,
		holdAt: 5.5,
		cam: [
			{t: 94.0, zoom: 1.1, fy: 0.28},
			{t: 96.0, zoom: 1.1, fy: 0.28},
			{t: 97.2, zoom: 1.1, fy: 0.66},
			{t: 98.9, zoom: 1.1, fy: 0.66},
			{t: 99.9, zoom: 1.1, fy: 0.83},
			{t: 101.5, zoom: 1.1, fy: 0.83},
			{t: 102.5, zoom: 1.0, fy: 0.45},
			{t: 105.1, zoom: 1.04, fy: 0.45},
		],
	},
];

const RevenueCatLine: React.FC<{at: number; out: number}> = ({at, out}) => (
	<Reveal at={at} out={out} dy={10} style={{marginTop: 38}}>
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				gap: 12,
				paddingLeft: 24,
				borderLeft: `2px solid ${colors.roseSoft}`,
			}}
		>
			<div style={{fontFamily: fonts.sans, fontSize: 18, fontWeight: 700, letterSpacing: '0.2em', color: colors.inkFaint, textTransform: 'uppercase'}}>
				Purchase powered by
			</div>
			<div style={{fontFamily: fonts.sans, fontSize: 40, fontWeight: 700, letterSpacing: '-0.01em', color: colors.ink}}>RevenueCat</div>
			<div style={{fontFamily: fonts.sans, fontSize: 23, lineHeight: 1.45, color: colors.inkSoft, maxWidth: 560}}>
				It handles the optional purchase only — your recovery records are never sent.
			</div>
		</div>
	</Reveal>
);

export const RunD: React.FC = () => (
	<RunEnter inAt={91.2} outAt={105.2} from="right">
		<AppScene side="right" shots={RUN_D_SHOTS} end={105.25}>
			<Slot top={40}>
				<Eyebrow at={91.3} out={96.05}>No paywall</Eyebrow>
				<Headline lines={['Every care tool,', '*free.*']} at={91.35} out={96.05} italicColor={colors.roseDeep} />
				<TimedList
					marker="dash"
					out={96.05}
					items={[
						{text: 'No advertisements', at: 93.4},
						{text: 'No subscriptions', at: 94.15},
						{text: 'No locked care tools', at: 94.9},
					]}
				/>
			</Slot>
			<Slot top={40}>
				<Eyebrow at={96.15} out={101.6}>Optional support</Eyebrow>
				<Headline lines={['Lifetime', '*Supporter.*']} at={96.2} out={101.6} italicColor={colors.roseDeep} />
				<Sub at={97.4} out={101.6}>One optional purchase, for people who want to support the project.</Sub>
				<RevenueCatLine at={98.4} out={101.6} />
			</Slot>
			<Slot top={40}>
				<Eyebrow at={101.7} out={105.0}>Purchase or not</Eyebrow>
				<Headline lines={['Every recovery tool', '*stays available.*']} at={101.72} out={105.0} size={84} italicColor={colors.roseDeep} />
				<TimedList
					marker="check"
					size={27}
					out={105.0}
					items={[
						{text: 'Check-ins and history', at: 102.4},
						{text: 'Medicines and reminders', at: 102.75},
						{text: 'Journal and photos', at: 103.1},
						{text: 'Privacy and data controls', at: 103.45},
					]}
				/>
			</Slot>
		</AppScene>
	</RunEnter>
);
