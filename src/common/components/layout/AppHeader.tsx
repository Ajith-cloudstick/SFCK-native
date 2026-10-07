import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "@/common/components/ui/Icon";
import { Text } from "@/common/components/ui/Text";
import { useT } from "@/common/i18n";
import { colors, sizes, spacing } from "@/common/theme/tokens";

type AppHeaderProps = {
	title: string;
	subtitle?: string;
	onBack?: () => void;
	right?: React.ReactNode;
};

// Brand bar that paints under the status bar inset
export function AppHeader({ title, subtitle, onBack, right }: AppHeaderProps) {
	const t = useT();
	const insets = useSafeAreaInsets();

	return (
		<View style={[styles.bar, { paddingTop: insets.top }]}>
			<View style={styles.row}>
				{onBack ? (
					<Pressable onPress={onBack} style={styles.back} accessibilityRole="button" accessibilityLabel={t("common.back")}>
						<Icon name="chevron-left" size="lg" color={colors.onBrand} />
					</Pressable>
				) : null}
				<View style={styles.titles}>
					<Text variant="heading" tone="onBrand" numberOfLines={1}>
						{title}
					</Text>
					{subtitle ? (
						<Text variant="caption" tone="onBrandMuted" numberOfLines={1}>
							{subtitle}
						</Text>
					) : null}
				</View>
				{right ? <View style={styles.right}>{right}</View> : null}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	bar: { backgroundColor: colors.brand[700] },
	row: {
		minHeight: sizes.header + spacing.sm,
		flexDirection: "row",
		alignItems: "center",
		paddingLeft: spacing.lg,
		paddingRight: spacing.sm,
		paddingVertical: spacing.xs,
		gap: spacing.sm,
	},
	back: { width: sizes.touch, height: sizes.touch, alignItems: "center", justifyContent: "center", marginLeft: -spacing.md },
	titles: { flex: 1, gap: spacing.xxs },
	right: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
});
