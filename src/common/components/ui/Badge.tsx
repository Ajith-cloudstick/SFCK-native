import { StyleSheet, View } from "react-native";

import { colors, radius, spacing } from "@/common/theme/tokens";

import { Text } from "./Text";

export type BadgeTone = "neutral" | "brand" | "success" | "warning" | "danger" | "info";

type BadgeProps = {
	label: string;
	tone?: BadgeTone;
};

const palette: Record<BadgeTone, { bg: string; fg: string }> = {
	neutral: { bg: colors.surfaceMuted, fg: colors.textMuted },
	brand: { bg: colors.brand[50], fg: colors.brand[700] },
	success: colors.success,
	warning: colors.warning,
	danger: colors.danger,
	info: colors.info,
};

export function Badge({ label, tone = "neutral" }: BadgeProps) {
	const p = palette[tone];
	return (
		<View style={[styles.badge, { backgroundColor: p.bg }]}>
			<Text variant="label" style={{ color: p.fg }} numberOfLines={1}>
				{label}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	badge: {
		alignSelf: "flex-start",
		paddingHorizontal: spacing.sm,
		paddingVertical: spacing.xxs,
		borderRadius: radius.pill,
	},
});
