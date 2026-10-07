import { Pressable, StyleSheet } from "react-native";

import { borderWidth, colors, radius, sizes, spacing } from "@/common/theme/tokens";

import { Text } from "./Text";

type ChipProps = {
	label: string;
	selected: boolean;
	onPress: () => void;
	count?: number;
};

export function Chip({ label, selected, onPress, count }: ChipProps) {
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityState={{ selected }}
			onPress={onPress}
			hitSlop={{ top: spacing.xs, bottom: spacing.xs }}
			style={[styles.chip, selected ? styles.selected : null]}
		>
			<Text variant="label" tone={selected ? "onBrand" : "default"} tabular>
				{count === undefined ? label : `${label} · ${count}`}
			</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	chip: {
		minHeight: sizes.touch - spacing.sm,
		paddingHorizontal: spacing.lg,
		borderRadius: radius.pill,
		borderWidth: borderWidth.thin,
		borderColor: colors.borderStrong,
		backgroundColor: colors.surface,
		alignItems: "center",
		justifyContent: "center",
	},
	selected: { backgroundColor: colors.brand[700], borderColor: colors.brand[700] },
});
