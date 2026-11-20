import { StyleSheet, Text as NativeText, type TextProps as NativeTextProps } from "react-native";

import { colors, fontFamily, fontSize, fontVariant, lineHeight } from "@/common/theme/tokens";

export type TextVariant = "display" | "title" | "heading" | "subheading" | "body" | "bodyStrong" | "label" | "caption" | "number";
export type TextTone = "default" | "muted" | "subtle" | "onBrand" | "onBrandMuted" | "brand" | "success" | "warning" | "danger" | "info";

type TextProps = NativeTextProps & {
	variant?: TextVariant;
	tone?: TextTone;
	align?: "left" | "center" | "right";
	tabular?: boolean;
};

const toneColor: Record<TextTone, string> = {
	default: colors.text,
	muted: colors.textMuted,
	subtle: colors.textSubtle,
	onBrand: colors.onBrand,
	onBrandMuted: colors.onBrandMuted,
	brand: colors.brand[700],
	success: colors.success.fg,
	warning: colors.warning.fg,
	danger: colors.danger.fg,
	info: colors.info.fg,
};

export function Text({ variant = "body", tone = "default", align, tabular, style, ...rest }: TextProps) {
	return (
		<NativeText
			{...rest}
			style={[styles[variant], { color: toneColor[tone] }, align ? { textAlign: align } : null, tabular ? styles.tabular : null, style]}
		/>
	);
}

const styles = StyleSheet.create({
	display: { fontFamily: fontFamily.bold, fontSize: fontSize.display, lineHeight: lineHeight.display, fontVariant: fontVariant.tabular },
	title: { fontFamily: fontFamily.bold, fontSize: fontSize.xl, lineHeight: lineHeight.xl },
	heading: { fontFamily: fontFamily.semibold, fontSize: fontSize.lg, lineHeight: lineHeight.lg },
	subheading: { fontFamily: fontFamily.semibold, fontSize: fontSize.md, lineHeight: lineHeight.md },
	body: { fontFamily: fontFamily.regular, fontSize: fontSize.base, lineHeight: lineHeight.base },
	bodyStrong: { fontFamily: fontFamily.semibold, fontSize: fontSize.base, lineHeight: lineHeight.base },
	label: { fontFamily: fontFamily.medium, fontSize: fontSize.sm, lineHeight: lineHeight.sm },
	caption: { fontFamily: fontFamily.regular, fontSize: fontSize.xs, lineHeight: lineHeight.xs },
	number: { fontFamily: fontFamily.bold, fontSize: fontSize.xxl, lineHeight: lineHeight.xxl, fontVariant: fontVariant.tabular },
	tabular: { fontVariant: fontVariant.tabular },
});
