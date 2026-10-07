import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { borderWidth, colors, opacity, radius, sizes, spacing } from "@/common/theme/tokens";

import { Icon, type IconName } from "./Icon";
import { Text } from "./Text";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
	label: string;
	onPress: () => void;
	variant?: ButtonVariant;
	size?: ButtonSize;
	icon?: IconName;
	loading?: boolean;
	disabled?: boolean;
	fullWidth?: boolean;
	style?: StyleProp<ViewStyle>;
	accessibilityLabel?: string;
};

const palette: Record<ButtonVariant, { bg: string; fg: string; border: string }> = {
	primary: { bg: colors.brand[700], fg: colors.onBrand, border: colors.brand[700] },
	secondary: { bg: colors.surface, fg: colors.brand[700], border: colors.borderStrong },
	ghost: { bg: colors.transparent, fg: colors.brand[700], border: colors.transparent },
	danger: { bg: colors.danger.fg, fg: colors.onBrand, border: colors.danger.fg },
};

export function Button({ label, onPress, variant = "primary", size = "md", icon, loading, disabled, fullWidth, style, accessibilityLabel }: ButtonProps) {
	const tone = palette[variant];
	const inactive = !!disabled || !!loading;
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={accessibilityLabel ?? label}
			accessibilityState={{ disabled: inactive, busy: !!loading }}
			disabled={inactive}
			onPress={onPress}
			style={({ pressed }) => [
				styles.base,
				styles[size],
				{ backgroundColor: tone.bg, borderColor: tone.border },
				fullWidth ? styles.fullWidth : null,
				pressed ? styles.pressed : null,
				disabled ? styles.disabled : null,
				style,
			]}
		>
			{loading ? (
				<ActivityIndicator color={tone.fg} />
			) : (
				<View style={styles.content}>
					{icon ? <Icon name={icon} size="sm" color={tone.fg} /> : null}
					<Text variant={size === "lg" ? "subheading" : "bodyStrong"} style={{ color: tone.fg }} numberOfLines={1}>
						{label}
					</Text>
				</View>
			)}
		</Pressable>
	);
}

const styles = StyleSheet.create({
	base: {
		borderRadius: radius.md,
		borderWidth: borderWidth.thin,
		alignItems: "center",
		justifyContent: "center",
	},
	sm: { minHeight: sizes.touch, paddingHorizontal: spacing.md },
	md: { minHeight: sizes.control, paddingHorizontal: spacing.lg },
	lg: { minHeight: sizes.header, paddingHorizontal: spacing.xxl },
	fullWidth: { alignSelf: "stretch" },
	content: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
	pressed: { opacity: opacity.pressed },
	disabled: { opacity: opacity.disabled },
});
