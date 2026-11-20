import { Pressable, StyleSheet, View } from "react-native";

import { shadow } from "@/common/theme/shadows";
import { colors, radius, sizes, spacing } from "@/common/theme/tokens";

import { Text } from "./Text";

export type SegmentOption<T extends string> = {
	value: T;
	label: string;
};

type SegmentedControlProps<T extends string> = {
	options: SegmentOption<T>[];
	value: T;
	onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
	return (
		<View style={styles.track} accessibilityRole="tablist">
			{options.map((option) => {
				const active = option.value === value;
				return (
					<Pressable
						key={option.value}
						accessibilityRole="tab"
						accessibilityState={{ selected: active }}
						onPress={() => onChange(option.value)}
						hitSlop={{ top: spacing.xs, bottom: spacing.xs }}
						style={[styles.segment, active ? styles.active : null]}
					>
						<Text variant="bodyStrong" tone={active ? "brand" : "muted"} numberOfLines={1}>
							{option.label}
						</Text>
					</Pressable>
				);
			})}
		</View>
	);
}

const styles = StyleSheet.create({
	track: {
		flexDirection: "row",
		padding: spacing.xs,
		borderRadius: radius.md,
		backgroundColor: colors.border,
		gap: spacing.xs,
	},
	segment: {
		flex: 1,
		minHeight: sizes.control - spacing.sm,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: radius.sm,
		paddingHorizontal: spacing.sm,
	},
	active: { backgroundColor: colors.surface, ...shadow("sm") },
});
