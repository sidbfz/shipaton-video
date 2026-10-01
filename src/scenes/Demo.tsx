import {measureText} from '@remotion/layout-utils';
import React from 'react';
import {interpolate} from 'remotion';
import {Eyebrow, Headline, Icon, TimedList} from '../components/Editorial';
import {Highlight, highlightBox, highlightOpacity, Phone, PhoneShot, tracked, validateShots} from '../components/Phone';
import {boxOnCanvas} from '../components/phoneGeometry';
import {trackState} from '../components/tracking';
import {Reveal} from '../components/Transitions';
import {useT} from '../components/timing';
import {CARE_CARD, phoneAt, SIDE, TRIPTYCH} from '../data/timeline';
import {colors, ease, fonts, FPS} from '../theme';

/**
 * The app demo (24.2s–105s): one phone on the centre axis, always showing the
 * complete screen. `at` = VO second a screen appears, `clip` = position in the
 * recording, `holdAt` = a clean freeze frame.
 *
 * Pointing: a static highlight (and its callout) only appears while a screen
 * is held on its `holdAt` frame, where its box was measured in source pixels
 * (720 × 1606). Where the recording plays and scrolls, `tracked()` highlights
 * follow a section frame by frame using src/data/tracks.json (made by
 * scripts/track_targets.py). validateShots() fails the render if a static
 * highlight overlaps moving footage or a tracked one leaves its measured range.
 *
 * Deliberately excluded source ranges:
 *  - 01 0.0–2.5s  (header names the developer)
 *  - 06 14.0–16.9s (system photo picker shows a personal gallery)
 *  - 06 19.2s+    (the demo photo is revealed; it stays in its hidden state)
 *  - 08 2.2–4.2s and 5.8s+ ("Checking the store…" spinner, then touch
 *    indicators on the support card) — the purchase is already complete.
 * Frozen touch indicators are painted out with `patches`.
 */

const BUTTON = '#181818';
const PAGE = '#F4EFEA';
const PHOTO_CARD = '#EDE8E3';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const MAIN_SHOTS: PhoneShot[] = validateShots('MAIN', [
	// ── Onboarding ──
	// "the onboarding introduces my story"
	{src: '01-onboarding-story.mp4', at: 24.2, clip: 6.3},
	// "and explains why I created it"
	{
		src: '02-onboarding-personalization.mp4',
		at: 27.65,
		clip: 12.55,
		holdAt: 12.55,
		patches: [{x: 493, y: 1332, r: 20, color: BUTTON}],
		highlights: [
			{from: 27.95, to: 29.15, box: [14, 272, 692, 296], callout: {label: "The creator's note", note: 'Why the app exists, before any questions.'}},
		],
	},
	// "It also asks a few questions about your condition and recovery."
	{src: '01-onboarding-story.mp4', at: 29.25, clip: 3.2, holdAt: 5.4, patches: [{x: 512, y: 1334, r: 20, color: BUTTON}]},
	// "Your answers are saved locally…"
	{
		src: '02-onboarding-personalization.mp4',
		at: 32.0,
		clip: 14.05,
		holdAt: 14.6,
		patches: [{x: 495, y: 1350, r: 20, color: BUTTON}],
		highlights: [
			{from: 32.7, to: 34.3, box: [14, 496, 692, 104], radius: 18, callout: {label: 'On this device', note: 'Everything you answer stays on your phone.'}},
		],
	},
	// "…used to adapt the app's experience" → Home shows the chosen stage. "…shows what needs your attention today."
	{
		src: '03-home-and-checkin.mp4',
		at: 34.4,
		clip: 0.0,
		holdAt: 0.9,
		highlights: [
			{from: 35.4, to: 37.2, box: [14, 172, 450, 170], radius: 20, callout: {label: 'Your stage', note: 'Home adapts to what you chose.'}},
			{from: 39.5, to: 41.2, box: [36, 418, 648, 246], radius: 34, callout: {label: 'Today', note: 'One check-in, usually under 30 seconds.'}},
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
		clip: 5.2,
		holdAt: 9.5,
		highlights: [
			tracked('history-story', 48.9, 50.45, {radius: 20, callout: {label: 'The story so far', note: 'Every check-in, newest first.'}}),
			tracked('history-days', 50.6, 52.15, {radius: 20, callout: {label: 'Your last few days', note: 'Only the numbers you entered — never a healing score.'}}),
		],
	},
	// ── Medicines ──
	// "The medicine section helps you organize what you take,"
	{
		src: '05-medicine-reminders-routines.mp4',
		at: 52.3,
		clip: 1.4,
		holdAt: 2.4,
		highlights: [
			{from: 53.45, to: 54.6, box: [26, 696, 668, 322], radius: 28, callout: {label: 'Your medicines', note: 'Schedule, days and label wording together.'}},
		],
	},
	// "add instructions, and create reminders for important doses." — one continuous scroll
	{
		src: '05-medicine-reminders-routines.mp4',
		at: 54.7,
		clip: 5.45,
		holdAt: 8.6,
		highlights: [
			tracked('med-instructions', 54.85, 55.85, {radius: 22, callout: {label: 'From your label', note: 'Instructions in their own words.'}}),
			tracked('med-reminders', 55.9, 58.2, {radius: 18, callout: {label: 'Local reminders', note: 'A gentle nudge for each dose.'}}),
		],
	},
	// "You can also create simple recovery routines and keep your daily tasks together."
	{
		src: '05-medicine-reminders-routines.mp4',
		at: 58.3,
		clip: 15.0,
		holdAt: 18.9,
		highlights: [
			tracked('routine-today', 58.6, 60.35, {radius: 26, callout: {label: "Today's routine", note: 'Each task: Done, Skip or Postpone.'}}),
			tracked('routine-choose', 60.5, 62.1, {radius: 22, callout: {label: 'Choose your routine', note: 'Built-in tasks you switch on or off.'}}),
		],
	},
	// ── Journal ──
	// "The journal gives you a private place to save thoughts, questions,"
	{
		src: '06-journal-and-photos.mp4',
		at: 62.2,
		clip: 1.6,
		holdAt: 2.55,
		highlights: [
			{from: 63.25, to: 65.05, box: [30, 126, 664, 764], radius: 30, callout: {label: 'Return to this thought', note: 'Dated entries you can edit.'}},
		],
	},
	// "and anything you want to remember for your next appointment."
	{
		src: '06-journal-and-photos.mp4',
		at: 65.15,
		clip: 9.3,
		holdAt: 10.4,
		highlights: [
			{from: 66.35, to: 68.6, box: [16, 932, 696, 290], radius: 20, callout: {label: 'Pages behind you', note: 'Ready for your next appointment.'}},
		],
	},
	// ── Recovery photos ──
	// "You can save dated recovery photos too." (freeze before the system picker opens)
	{
		src: '06-journal-and-photos.mp4',
		at: 68.95,
		clip: 12.2,
		holdAt: 13.55,
		highlights: [{from: 70.4, to: 71.2, box: [24, 553, 674, 148], radius: 20}],
	},
	// "They stay organized alongside the rest of your recovery history…" — held in the hidden state
	{
		src: '06-journal-and-photos.mp4',
		at: 71.25,
		clip: 17.05,
		holdAt: 18.45,
		patches: [{x: 622, y: 749, r: 23, color: PHOTO_CARD}],
		highlights: [
			{from: 72.75, to: 76.3, box: [18, 500, 684, 815], radius: 30, callout: {label: 'Your visual record', note: 'Hidden until you choose to reveal it.'}},
		],
	},
	// ── Privacy ──
	// "Fistula Tracker requires no account."
	{
		src: '07-privacy-and-settings.mp4',
		at: 76.5,
		clip: 2.75,
		holdAt: 2.75,
		highlights: [
			{from: 77.0, to: 79.2, box: [16, 378, 696, 268], radius: 20, callout: {label: 'Private by default', note: 'No account, no cloud sync, no analytics.'}},
		],
	},
	// "…stay locally on your device."
	{src: '07-privacy-and-settings.mp4', at: 79.3, clip: 7.5, holdAt: 8.0, highlights: [{from: 80.0, to: 84.2, box: [34, 376, 654, 308], radius: 28}]},
	// Data controls scroll by, then "A companion, not a clinician." — the app's own medical boundary
	{
		src: '07-privacy-and-settings.mp4',
		at: 84.35,
		clip: 10.6,
		holdAt: 13.3,
		highlights: [
			tracked('settings-companion', 86.3, 90.9, {radius: 18, callout: {label: 'In the app', note: 'A companion, not a clinician.'}}),
		],
	},
	// ── Free care and optional support ──
	// "Every recovery feature is free." — More: "Support the app · Optional support; recovery tools stay free"
	{
		src: '08-lifetime-supporter.mp4',
		at: 91.2,
		clip: 0.2,
		holdAt: 1.6,
		patches: [{x: 402, y: 970, r: 18, color: PAGE}],
		highlights: [{from: 92.7, to: 93.9, box: [16, 928, 696, 110], radius: 18}],
	},
	// Supporter screen, purchase already complete (clean confirmed state, held)
	{
		src: '08-lifetime-supporter.mp4',
		at: 94.0,
		clip: 4.3,
		holdAt: 5.5,
		highlights: [
			{from: 95.3, to: 95.95, box: [16, 403, 696, 134], radius: 18},
			{
				from: 96.15,
				to: 98.65,
				box: [16, 1248, 696, 154],
				radius: 18,
				callout: {label: 'Powered by', brand: 'RevenueCat', note: 'Handles the optional purchase only — never your recovery records.'},
			},
			{from: 98.8, to: 101.45, box: [24, 928, 672, 268], radius: 30, callout: {label: 'One-time support', note: 'A thank-you — never a requirement.'}},
			{from: 101.75, to: CARE_CARD.expandTo, box: [24, 570, 672, 334], radius: 34}, // the "Care is never the paywall" card
		],
	},
]);

/** The supporter screen's dark card, in source px — the full-frame statement grows out of it. */
export const CARE_CARD_BOX: [number, number, number, number] = [25, 572, 670, 330];

const SLOT2_SHOTS: PhoneShot[] = validateShots('SLOT2', [
	// "discharge,"
	{
		src: '03-home-and-checkin.mp4',
		at: 44.6,
		clip: 8.5,
		holdAt: 8.5,
		patches: [{x: 462, y: 1206, r: 20, color: BUTTON}],
		highlights: [{from: 44.97, to: 45.8, box: [32, 748, 612, 96], radius: 34}],
	},
]);
const SLOT3_SHOTS: PhoneShot[] = validateShots('SLOT3', [
	// "bowel movements, and other changes."
	{
		src: '03-home-and-checkin.mp4',
		at: 45.35,
		clip: 9.8,
		holdAt: 9.8,
		highlights: [
			{from: 45.73, to: 46.35, box: [14, 730, 696, 78], radius: 16},
			{from: 46.4, to: 47.05, box: [14, 830, 696, 180], radius: 16},
		],
	},
]);

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

// ─── Callouts: joined to a highlight by an elbow leader line ───
//
// The text stays still so it is always readable. The phone end of the line is
// attached to the highlight every frame, so when a tracked section scrolls the
// line stretches and bends (out of the box horizontally, an angled run, then
// into the text). If the section drifts more than GLIDE_DEADZONE px from where
// the text sits, the text glides after it, slowly, so the line never gets steep.

const CALLOUT = {labelSize: 19, noteSize: 44, labelGap: 14};
const GLIDE_DEADZONE = 250;
const TEXT_Y = {min: 170, max: 800};

type Pointed = {h: Highlight; shot: PhoneShot};

/** Canvas y of the visible part of the highlight's centre at time t. */
const anchorY = ({h, shot}: Pointed, t: number) => {
	const p = phoneAt(t);
	const r = boxOnCanvas(highlightBox(h, shot, t), p.cx, p.cy, p.sh);
	const top = p.cy - p.sh / 2 + 34; // below the status strip
	const bottom = p.cy + p.sh / 2 - 12;
	const a = Math.max(r.y, top);
	const b = Math.min(r.y + r.h, bottom);
	return {y: b > a ? (a + b) / 2 : Math.min(Math.max(r.y + r.h / 2, top), bottom), right: r.x + r.w + 6};
};

const visibleAt = (pt: Pointed, t: number) => highlightOpacity({...pt.h, from: -1e9, to: 1e9}, pt.shot, t);

/** Where the callout text sits at time t: fixed, gliding only beyond the dead zone. */
const textYAt = (pt: Pointed, t: number) => {
	const {h} = pt;
	// Rest position: the section's position the first moment it is on screen.
	let rest = anchorY(pt, h.from).y;
	for (let tt = h.from; tt <= h.to; tt += 1 / FPS) {
		if (visibleAt(pt, tt) > 0.5) {
			rest = anchorY(pt, tt).y;
			break;
		}
	}
	// Average of the last second of positions (a deterministic, lagging follow).
	let sum = 0;
	let n = 0;
	for (let k = 0; k <= 24; k += 2) {
		const tt = Math.max(h.from, t - k / FPS);
		if (visibleAt(pt, tt) > 0.5) {
			sum += anchorY(pt, tt).y;
			n++;
		}
	}
	const avg = n ? sum / n : rest;
	const diff = avg - rest;
	const glide = Math.sign(diff) * Math.max(0, Math.abs(diff) - GLIDE_DEADZONE);
	return Math.min(TEXT_Y.max, Math.max(TEXT_Y.min, rest + glide));
};

const CalloutView: React.FC<{pt: Pointed}> = ({pt}) => {
	const t = useT();
	const {h, shot} = pt;
	const c = h.callout!;
	const opacity = highlightOpacity(h, shot, t);
	if (opacity <= 0) return null;
	const {y: dotY, right: sx} = anchorY(pt, t);
	const ty = textYAt(pt, t);
	const endX = SIDE.rightEdge - 18;
	const ex1 = sx + 34;
	const ex2 = endX - 46;
	const line = interpolate(t, [h.from + 0.1, h.from + 0.55], [0, 1], {...clamp, easing: ease.out});
	const textIn = interpolate(t, [h.from + 0.35, h.from + 0.85], [0, 1], {...clamp, easing: ease.out});
	// While a section scrolls fast, the line stays attached but the note dims a little.
	const speed = h.track ? (trackState(h.track, shot, t)?.speed ?? 0) * (phoneAt(t).sh / 1606) : 0;
	const settle = 1 - 0.45 * interpolate(speed, [3, 15], [0, 1], clamp);
	const path = Math.abs(dotY - ty) < 1 ? `M ${sx} ${dotY} H ${endX}` : `M ${sx} ${dotY} H ${ex1} L ${ex2} ${ty} H ${endX}`;
	return (
		<div style={{position: 'absolute', inset: 0, opacity}}>
			<svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
				<path
					d={path}
					fill="none"
					stroke={colors.rose}
					strokeWidth={2}
					strokeLinejoin="round"
					pathLength={1}
					strokeDasharray="1 1"
					strokeDashoffset={1 - line}
				/>
				<circle cx={sx} cy={dotY} r={6} fill={colors.rose} />
			</svg>
			<div
				style={{
					position: 'absolute',
					left: SIDE.rightEdge,
					width: SIDE.width,
					// The label sits just above the leader; the note starts on it.
					top: ty - CALLOUT.labelSize * 1.2 - CALLOUT.labelGap - CALLOUT.noteSize * 0.62,
					opacity: textIn,
					transform: `translateX(${(1 - textIn) * 12}px)`,
				}}
			>
				<div
					style={{
						fontFamily: fonts.sans,
						fontWeight: 700,
						fontSize: CALLOUT.labelSize,
						lineHeight: 1.2,
						letterSpacing: '0.2em',
						textTransform: 'uppercase',
						color: colors.rose,
						marginBottom: CALLOUT.labelGap,
					}}
				>
					{c.label}
				</div>
				{c.brand ? (
					<div style={{fontFamily: fonts.sans, fontWeight: 700, fontSize: 48, lineHeight: 1.0, letterSpacing: '-0.01em', color: colors.ink, marginBottom: 14}}>
						{c.brand}
					</div>
				) : null}
				{c.note ? (
					<div
						style={{
							fontFamily: c.brand ? fonts.sans : fonts.serif,
							fontSize: c.brand ? 26 : CALLOUT.noteSize,
							lineHeight: c.brand ? 1.45 : 1.08,
							color: c.brand ? colors.inkSoft : colors.ink,
							maxWidth: c.brand ? 460 : SIDE.width,
							opacity: settle,
						}}
					>
						{c.note}
					</div>
				) : null}
			</div>
		</div>
	);
};

const CALLOUTS: Pointed[] = MAIN_SHOTS.flatMap((shot) => (shot.highlights ?? []).filter((h) => h.callout).map((h) => ({h, shot})));

const Callouts: React.FC = () => {
	const t = useT();
	return (
		<>
			{CALLOUTS.filter(({h}) => t >= h.from && t < h.to).map((pt) => (
				<CalloutView key={`${pt.h.from}`} pt={pt} />
			))}
		</>
	);
};

// ─── Headline column (left of the phone, right-aligned toward it) ───

/** Largest size ≤ max at which every line fits the column. */
const fitHeadline = (lines: string[], max: number) => {
	let size = max;
	for (const line of lines) {
		const italic = line.startsWith('*') && line.endsWith('*');
		const text = line.replace(/\*/g, '');
		const w = measureText({
			text,
			fontFamily: 'Instrument Serif',
			fontSize: 100,
			fontWeight: 400,
			letterSpacing: '-0.01em',
			additionalStyles: italic ? {fontStyle: 'italic'} : undefined,
		}).width;
		size = Math.min(size, Math.floor(((SIDE.width - 10) / w) * 100));
	}
	return size;
};

const Beat: React.FC<{label?: string; lines: string[]; at: number; out: number; max?: number; stagger?: number}> = ({
	label,
	lines,
	at,
	out,
	max = 92,
	stagger,
}) => (
	<div
		style={{
			position: 'absolute',
			left: SIDE.leftEdge - SIDE.width,
			width: SIDE.width,
			top: SIDE.top,
			height: SIDE.bottom - SIDE.top,
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'flex-end',
		}}
	>
		<div style={{textAlign: 'right'}}>
			{label ? (
				<Eyebrow at={at} out={out} align="right">
					{label}
				</Eyebrow>
			) : null}
			<Headline lines={lines} at={at + 0.05} out={out} size={fitHeadline(lines, max)} stagger={stagger} align="right" italicColor={colors.roseDeep} />
		</div>
	</div>
);

/** Right column content that is not attached to a highlight (lists). */
const RightColumn: React.FC<{children: React.ReactNode}> = ({children}) => (
	<div
		style={{
			position: 'absolute',
			left: SIDE.rightEdge,
			width: SIDE.width,
			top: SIDE.top,
			height: SIDE.bottom - SIDE.top,
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
		}}
	>
		<div>{children}</div>
	</div>
);

const Statement: React.FC<{at: number; out: number; text: string; icon: 'device' | 'lock' | 'shield'}> = ({at, out, text, icon}) => (
	<Reveal at={at} out={out} dy={14}>
		<div style={{display: 'flex', alignItems: 'center', gap: 22, padding: '20px 0', borderBottom: `1px solid ${colors.line}`}}>
			<div
				style={{
					width: 54,
					height: 54,
					borderRadius: 54,
					border: `1.5px solid ${colors.roseSoft}`,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					flexShrink: 0,
				}}
			>
				<Icon kind={icon} size={26} />
			</div>
			<div style={{fontFamily: fonts.serif, fontSize: 50, lineHeight: 1, color: colors.ink, whiteSpace: 'nowrap'}}>{text}</div>
		</div>
	</Reveal>
);

export const Demo: React.FC = () => (
	<>
		{/* ── Headlines, left of the phone ── */}
		<Beat label="Onboarding" lines={['It begins', 'with *a story.*']} at={24.5} out={29.2} />
		<Beat label="Personalized" lines={['Shaped around', '*your answers.*']} at={29.3} out={36.1} />
		<Beat label="Home" lines={['Today,', '*at a glance.*']} at={36.2} out={41.25} />
		<Beat label="Daily check-in" lines={['Check in,', '*in seconds.*']} at={41.35} out={43.05} />
		<Beat label="Recovery timeline" lines={['Saved', '*by date.*']} at={48.0} out={52.25} />
		<Beat label="Medicines" lines={['What you take,', '*organized.*']} at={52.35} out={58.25} />
		<Beat label="Daily routine" lines={['Simple routines,', '*kept together.*']} at={58.35} out={62.15} />
		<Beat label="Journal" lines={['A private place', '*to think.*']} at={62.25} out={68.85} />
		<Beat label="Recovery photos" lines={['Dated, and', '*kept private.*']} at={69.0} out={76.45} />
		<Beat lines={['No account', '*required.*']} at={76.62} out={79.3} max={110} />
		<Beat label="Privacy" lines={['Your data,', '*your device.*']} at={79.4} out={84.4} />
		<Beat label="Medical boundary" lines={['Organizes recovery.', '*Does not diagnose.*']} at={84.5} out={90.95} stagger={0.4} />
		<Beat label="No paywall" lines={['Every care tool,', '*free.*']} at={91.3} out={96.0} />
		<Beat label="Optional support" lines={['Lifetime', '*Supporter.*']} at={96.1} out={101.6} />
		<Beat label="Purchase or not" lines={['Every recovery tool', '*stays available.*']} at={101.7} out={104.75} />

		{/* ── Right of the phone: lists (callouts are drawn separately) ── */}
		<RightColumn>
			<Statement at={79.5} out={84.4} text="Stored locally" icon="device" />
			<Statement at={80.55} out={84.4} text="Private by design" icon="lock" />
			<Statement at={81.6} out={84.4} text="You remain in control" icon="shield" />
		</RightColumn>
		<RightColumn>
			<TimedList
				marker="dash"
				out={96.0}
				items={[
					{text: 'No advertisements', at: 93.4},
					{text: 'No subscriptions', at: 94.15},
					{text: 'No locked care tools', at: 94.9},
				]}
			/>
		</RightColumn>
		<RightColumn>
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
		</RightColumn>

		{/* Phones draw above the text so a moving phone never sits behind type. */}
		<SlotPhone shots={SLOT2_SHOTS} cx={TRIPTYCH.slots[1]} inAt={44.6} />
		<SlotPhone shots={SLOT3_SHOTS} cx={TRIPTYCH.slots[2]} inAt={45.35} />
		<MainPhone />
		<Callouts />
	</>
);
