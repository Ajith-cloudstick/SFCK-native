import { Pressable, StyleSheet, View } from "react-native";

import { Text } from "@/common/components/ui/Text";
import { useLanguageStore, useT, type Language } from "@/common/i18n";
import { colors, radius, sizes, spacing } from "@/common/theme/tokens";

const options: { value: Language; label: string }[] = [
	{ value: "en", label: "EN" },
	{ value: "ml", label: "മല" },
];

// Compact EN / മല switch for the brand panel
export function LanguageToggle() {
	const t = useT();
	const language = useLanguageStore((s) => s.language);
	const setLanguage = useLanguageStore((s) => s.setLanguage);

	return (
		<View style={styles.track} accessibilityRole="tablist" accessibilityLabel={t("account.language")}>
			{options.map((option) => {
				const active = option.value === language;
				return (
					<Pressable
						key={option.value}
						accessibilityRole="tab"
						accessibilityState={{ selected: active }}
						onPress={() => setLanguage(option.value)}
						style={[styles.option, active ? styles.active : null]}
					>
						<Text variant="bodyStrong" tone={active ? "brand" : "onBrand"}>
							{option.label}
						</Text>
					</Pressable>
				);
			})}
		</View>
	);
}

const styles = StyleSheet.create({
	track: { flexDirection: "row", padding: spacing.xs, gap: spacing.xs, borderRadius: radius.pill, backgroundColor: colors.onBrandTint },
	option: { minWidth: sizes.touch + spacing.sm, minHeight: sizes.touch - spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
	active: { backgroundColor: colors.surface },
});
