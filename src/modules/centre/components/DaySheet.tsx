import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { BottomSheet } from "@/common/components/ui/BottomSheet";
import { Button } from "@/common/components/ui/Button";
import { Icon } from "@/common/components/ui/Icon";
import { Text } from "@/common/components/ui/Text";
import { locales, useLanguageStore, useT } from "@/common/i18n";
import { borderWidth, colors, opacity, radius, sizes, spacing } from "@/common/theme/tokens";
import { istDate } from "@/common/utils/ist";

type DaySheetProps = {
	visible: boolean;
	selected: string;
	onSelect: (date: string | null) => void;
	onClose: () => void;
};

type Month = { year: number; month: number };

const pad = (value: number) => String(value).padStart(2, "0");
const isoOf = (year: number, month: number, day: number) => `${year}-${pad(month + 1)}-${pad(day)}`;
const monthOf = (iso: string): Month => ({ year: Number(iso.slice(0, 4)), month: Number(iso.slice(5, 7)) - 1 });
const shift = ({ year, month }: Month, by: number): Month => ({ year: year + Math.floor((month + by) / 12), month: (((month + by) % 12) + 12) % 12 });
// Noon UTC keeps the calendar day stable in every phone time zone
const noonUtc = (year: number, month: number, day: number) => new Date(Date.UTC(year, month, day, 12));

// Month calendar of IST dates up to today; picking today returns null so the app follows the live date
export function DaySheet({ visible, selected, onSelect, onClose }: DaySheetProps) {
	const t = useT();
	const language = useLanguageStore((s) => s.language);
	const today = istDate();
	const [shown, setShown] = useState<Month>(() => monthOf(selected));

	useEffect(() => {
		if (visible) setShown(monthOf(selected));
	}, [visible, selected]);

	const weekdays = useMemo(
		// 1 Jan 2024 was a Monday
		() => Array.from({ length: 7 }, (_, i) => noonUtc(2024, 0, 1 + i).toLocaleDateString(locales[language], { weekday: "narrow" })),
		[language],
	);

	const cells = useMemo(() => {
		const leading = (noonUtc(shown.year, shown.month, 1).getUTCDay() + 6) % 7;
		const count = noonUtc(shown.year, shown.month + 1, 0).getUTCDate();
		return [...Array.from({ length: leading }, () => null), ...Array.from({ length: count }, (_, i) => isoOf(shown.year, shown.month, i + 1))];
	}, [shown]);

	const title = noonUtc(shown.year, shown.month, 15).toLocaleDateString(locales[language], { month: "long", year: "numeric" });
	const canGoNext = isoOf(shown.year, shown.month, 1) < isoOf(monthOf(today).year, monthOf(today).month, 1);

	const pick = (iso: string) => {
		onSelect(iso === today ? null : iso);
		onClose();
	};

	return (
		<BottomSheet
			visible={visible}
			onClose={onClose}
			title={t("day.choose")}
			footer={<Button label={t("day.backToToday")} icon="calendar" variant="secondary" onPress={() => pick(today)} fullWidth />}
		>
			<View style={styles.monthRow}>
				<Pressable onPress={() => setShown((m) => shift(m, -1))} style={styles.arrow} accessibilityRole="button" accessibilityLabel={t("day.previousMonth")}>
					<Icon name="chevron-left" color={colors.text} />
				</Pressable>
				<Text variant="subheading" align="center" style={styles.monthTitle}>
					{title}
				</Text>
				<Pressable
					onPress={() => setShown((m) => shift(m, 1))}
					disabled={!canGoNext}
					style={[styles.arrow, canGoNext ? null : styles.disabled]}
					accessibilityRole="button"
					accessibilityLabel={t("day.nextMonth")}
				>
					<Icon name="chevron-right" color={colors.text} />
				</Pressable>
			</View>

			<View style={styles.grid}>
				{weekdays.map((label, i) => (
					<View key={`w${i}`} style={styles.cell}>
						<Text variant="caption" tone="subtle">
							{label}
						</Text>
					</View>
				))}
				{cells.map((iso, i) => {
					if (!iso) return <View key={`e${i}`} style={styles.cell} />;
					const future = iso > today;
					const isSelected = iso === selected;
					return (
						<View key={iso} style={styles.cell}>
							<Pressable
								onPress={() => pick(iso)}
								disabled={future}
								accessibilityRole="button"
								accessibilityState={{ selected: isSelected, disabled: future }}
								style={({ pressed }) => [
									styles.day,
									iso === today ? styles.today : null,
									isSelected ? styles.selected : null,
									pressed ? styles.pressed : null,
									future ? styles.disabled : null,
								]}
							>
								<Text variant="bodyStrong" tone={isSelected ? "onBrand" : future ? "subtle" : "default"} tabular>
									{String(Number(iso.slice(8)))}
								</Text>
							</Pressable>
						</View>
					);
				})}
			</View>
		</BottomSheet>
	);
}

const styles = StyleSheet.create({
	monthRow: { flexDirection: "row", alignItems: "center" },
	monthTitle: { flex: 1 },
	arrow: { width: sizes.touch, height: sizes.touch, alignItems: "center", justifyContent: "center" },
	grid: { flexDirection: "row", flexWrap: "wrap" },
	cell: { width: `${100 / 7}%`, height: sizes.touch, alignItems: "center", justifyContent: "center" },
	day: { width: sizes.calendarDay, height: sizes.calendarDay, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
	today: { borderWidth: borderWidth.thick, borderColor: colors.brand[600] },
	selected: { backgroundColor: colors.brand[700], borderColor: colors.brand[700] },
	pressed: { opacity: opacity.pressed },
	disabled: { opacity: opacity.disabled },
});
