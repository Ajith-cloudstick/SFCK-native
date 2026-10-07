import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useToast, type ToastTone } from "@/common/hooks/useToast";
import { shadow } from "@/common/theme/shadows";
import { colors, radius, sizes, spacing } from "@/common/theme/tokens";

import { Icon, type IconName } from "./Icon";
import { Text } from "./Text";

const palette: Record<ToastTone, { bg: string; fg: string; icon: IconName }> = {
	default: { bg: colors.brand[950], fg: colors.onBrand, icon: "info" },
	success: { bg: colors.brand[800], fg: colors.onBrand, icon: "check" },
	warning: { bg: colors.warning.bg, fg: colors.warning.fg, icon: "clock" },
	danger: { bg: colors.danger.bg, fg: colors.danger.fg, icon: "alert-circle" },
};

export function Toast() {
	const insets = useSafeAreaInsets();
	const message = useToast((state) => state.message);
	const tone = useToast((state) => state.tone);

	if (!message) return null;
	const p = palette[tone];

	return (
		<View pointerEvents="none" style={[styles.host, { bottom: insets.bottom + sizes.tabBar + sizes.scanOverhang + spacing.md }]}>
			<View style={[styles.toast, { backgroundColor: p.bg }]} accessibilityLiveRegion="polite">
				<Icon name={p.icon} size="sm" color={p.fg} />
				<Text variant="bodyStrong" style={[styles.text, { color: p.fg }]} numberOfLines={2}>
					{message}
				</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	host: { position: "absolute", left: spacing.lg, right: spacing.lg, alignItems: "center" },
	toast: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.sm,
		paddingHorizontal: spacing.lg,
		paddingVertical: spacing.md,
		borderRadius: radius.pill,
		maxWidth: sizes.contentMaxWidth,
		...shadow("md"),
	},
	text: { flexShrink: 1 },
});
