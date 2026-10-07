import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Icon } from "@/common/components/ui/Icon";
import { Text } from "@/common/components/ui/Text";
import { borderWidth, colors, opacity, radius, sizes, spacing } from "@/common/theme/tokens";

import type { PendingItem } from "../types/today";

type PendingItemRowProps = {
	item: PendingItem;
	onPress: (item: PendingItem) => void;
};

const toneColors = {
	neutral: { bg: colors.surfaceMuted, fg: colors.textMuted },
	brand: { bg: colors.brand[50], fg: colors.brand[700] },
	success: colors.success,
	warning: colors.warning,
	danger: colors.danger,
	info: colors.info,
} as const;

function PendingItemRowBase({ item, onPress }: PendingItemRowProps) {
	const tone = toneColors[item.tone];
	return (
		<Pressable accessibilityRole="button" onPress={() => onPress(item)} style={({ pressed }) => [styles.row, pressed ? styles.pressed : null]}>
			<View style={[styles.icon, { backgroundColor: tone.bg }]}>
				<Icon name={item.icon} color={tone.fg} />
			</View>
			<Text variant="body" style={styles.message}>
				{item.message}
			</Text>
			<Icon name="chevron-right" color={colors.textSubtle} />
		</Pressable>
	);
}

export const PendingItemRow = memo(PendingItemRowBase);

const styles = StyleSheet.create({
	row: {
		minHeight: sizes.touch + spacing.lg,
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.md,
		padding: spacing.md,
		backgroundColor: colors.surface,
		borderRadius: radius.lg,
		borderWidth: borderWidth.thin,
		borderColor: colors.border,
	},
	pressed: { opacity: opacity.pressed },
	icon: { width: sizes.avatar, height: sizes.avatar, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
	message: { flex: 1 },
});
