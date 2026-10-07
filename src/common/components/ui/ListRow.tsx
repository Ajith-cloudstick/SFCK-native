import { Pressable, StyleSheet, View } from "react-native";

import { borderWidth, colors, opacity, sizes, spacing } from "@/common/theme/tokens";

import { Icon, type IconName } from "./Icon";
import { Text } from "./Text";

type ListRowProps = {
	title: string;
	subtitle?: string;
	icon?: IconName;
	leading?: React.ReactNode;
	trailing?: React.ReactNode;
	onPress?: () => void;
	chevron?: boolean;
	selected?: boolean;
	disabled?: boolean;
	divider?: boolean;
};

export function ListRow({ title, subtitle, icon, leading, trailing, onPress, chevron, selected, disabled, divider = true }: ListRowProps) {
	return (
		<Pressable
			accessibilityRole={onPress ? "button" : undefined}
			accessibilityState={{ selected: !!selected, disabled: !!disabled }}
			disabled={disabled || !onPress}
			onPress={onPress}
			style={({ pressed }) => [
				styles.row,
				divider ? styles.divider : null,
				selected ? styles.selected : null,
				pressed ? styles.pressed : null,
				disabled ? styles.disabled : null,
			]}
		>
			{leading ?? (icon ? <Icon name={icon} color={colors.textMuted} /> : null)}
			<View style={styles.body}>
				<Text variant="bodyStrong" numberOfLines={1}>
					{title}
				</Text>
				{subtitle ? (
					<Text variant="caption" tone="muted" numberOfLines={2}>
						{subtitle}
					</Text>
				) : null}
			</View>
			{trailing}
			{selected ? <Icon name="check" color={colors.brand[700]} /> : null}
			{chevron ? <Icon name="chevron-right" color={colors.textSubtle} /> : null}
		</Pressable>
	);
}

const styles = StyleSheet.create({
	row: {
		minHeight: sizes.touch + spacing.md,
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.md,
		paddingHorizontal: spacing.lg,
		paddingVertical: spacing.sm,
		backgroundColor: colors.surface,
	},
	divider: { borderBottomWidth: borderWidth.hairline, borderBottomColor: colors.border },
	selected: { backgroundColor: colors.brand[50] },
	body: { flex: 1, gap: spacing.xxs },
	pressed: { backgroundColor: colors.surfaceMuted },
	disabled: { opacity: opacity.disabled },
});
