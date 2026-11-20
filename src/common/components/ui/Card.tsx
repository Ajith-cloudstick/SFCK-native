import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { shadow } from "@/common/theme/shadows";
import { borderWidth, colors, opacity, radius, spacing } from "@/common/theme/tokens";

type CardProps = {
	children: React.ReactNode;
	onPress?: () => void;
	padded?: boolean;
	style?: StyleProp<ViewStyle>;
	accessibilityLabel?: string;
};

export function Card({ children, onPress, padded = true, style, accessibilityLabel }: CardProps) {
	if (onPress) {
		return (
			<Pressable
				accessibilityRole="button"
				accessibilityLabel={accessibilityLabel}
				onPress={onPress}
				style={({ pressed }) => [styles.card, padded ? styles.padded : null, pressed ? styles.pressed : null, style]}
			>
				{children}
			</Pressable>
		);
	}
	return <View style={[styles.card, padded ? styles.padded : null, style]}>{children}</View>;
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: colors.surface,
		borderRadius: radius.lg,
		borderWidth: borderWidth.thin,
		borderColor: colors.border,
		...shadow("sm"),
	},
	padded: { padding: spacing.lg },
	pressed: { opacity: opacity.pressed },
});
