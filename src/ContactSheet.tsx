import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {FontGate} from './fonts';
import {colors, fonts} from './theme';

export type ContactSheetProps = {
	title: string;
	frames: {label: string; src: string}[];
};

export const SHEET = {cols: 4, cellW: 520, gap: 24, pad: 48, header: 120, labelH: 44};
export const sheetSize = (count: number) => {
	const rows = Math.ceil(count / SHEET.cols);
	const cellH = Math.round((SHEET.cellW * 9) / 16);
	return {
		width: SHEET.pad * 2 + SHEET.cols * SHEET.cellW + (SHEET.cols - 1) * SHEET.gap,
		height: SHEET.pad * 2 + SHEET.header + rows * (cellH + SHEET.labelH) + (rows - 1) * SHEET.gap,
	};
};

/** Grid of frames extracted from the rendered MP4 (see scripts/contact-sheet.mjs). */
export const ContactSheet: React.FC<ContactSheetProps> = ({title, frames}) => {
	const cellH = Math.round((SHEET.cellW * 9) / 16);
	return (
		<AbsoluteFill style={{background: colors.cream, padding: SHEET.pad}}>
			<FontGate>
				<div style={{height: SHEET.header, fontFamily: fonts.serif, fontSize: 60, color: colors.ink}}>
					{title}
				</div>
				<div style={{display: 'flex', flexWrap: 'wrap', gap: SHEET.gap}}>
					{frames.map((f) => (
						<div key={f.label} style={{width: SHEET.cellW}}>
							<Img
								src={f.src}
								style={{
									width: SHEET.cellW,
									height: cellH,
									display: 'block',
									borderRadius: 8,
									boxShadow: '0 0 0 1px rgba(42,39,36,0.12)',
								}}
							/>
							<div
								style={{
									height: SHEET.labelH,
									paddingTop: 10,
									fontFamily: fonts.sans,
									fontWeight: 700,
									fontSize: 18,
									letterSpacing: '0.12em',
									color: colors.rose,
								}}
							>
								{f.label}
							</div>
						</div>
					))}
				</div>
			</FontGate>
		</AbsoluteFill>
	);
};
