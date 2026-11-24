import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { BottomSheet } from "@/common/components/ui/BottomSheet";
import { Button } from "@/common/components/ui/Button";
import { Icon } from "@/common/components/ui/Icon";
import { Text } from "@/common/components/ui/Text";
import { useT } from "@/common/i18n";
import { borderWidth, colors, radius, sizes, spacing } from "@/common/theme/tokens";
import type { AttendanceRecord, Worker } from "@/modules/centre/types/centreDay";
import { workerCode } from "@/modules/centre/utils/dayIndex";

type HalfDaySheetProps = {
	worker: Worker | null;
	record: AttendanceRecord | undefined;
	// workers marked present today, who could have done the other half (for example by bringing in the collection)
	candidates: Worker[];
	onClose: () => void;
	onMark: (coveredBy: number | null) => void;
	onFullDay: () => void;
};

// A half day: the worker did one half (e.g. tapped the block) and someone else did the other half. It counts as half a day.
export function HalfDaySheet({ worker, record, candidates, onClose, onMark, onFullDay }: HalfDaySheetProps) {
	const t = useT();
	const [coveredBy, setCoveredBy] = useState<number | null>(null);
	const already = !!record?.is_half_day;
	const options: { id: number | null; name: string; code: string }[] = [{ id: null, name: t("attendance.halfDayNobody"), code: "" }, ...candidates.map((c) => ({ id: c.id, name: c.name, code: workerCode(c) }))];

	return (
		<BottomSheet
			visible={worker !== null}
			onClose={onClose}
			title={t("attendance.halfDayTitle", { name: worker?.name ?? "" })}
			subtitle={already ? t("attendance.halfDayNow") : t("attendance.halfDayBody")}
			footer={
				already ? (
					<Button label={t("attendance.fullDayBack")} variant="secondary" onPress={onFullDay} size="lg" fullWidth />
				) : (
					<Button label={t("attendance.halfDayMark")} onPress={() => onMark(coveredBy)} size="lg" fullWidth />
				)
			}
		>
			{already ? (
				record?.covered_by_name ? (
					<Text variant="body" tone="muted">
						{t("attendance.halfDayCoveredBy", { name: record.covered_by_name })}
					</Text>
				) : null
			) : (
				<View style={styles.list}>
					{options.map((o) => {
						const selected = coveredBy === o.id;
						return (
							<Pressable
								key={String(o.id)}
								accessibilityRole="radio"
								accessibilityState={{ selected }}
								onPress={() => setCoveredBy(o.id)}
								style={({ pressed }) => [styles.option, selected ? styles.optionOn : null, pressed ? styles.pressed : null]}
							>
								<View style={styles.optionBody}>
									<Text variant="bodyStrong" numberOfLines={1}>
										{o.name}
									</Text>
									{o.code ? (
										<Text variant="caption" tone="subtle" numberOfLines={1} tabular>
											{o.code}
										</Text>
									) : null}
								</View>
								{selected ? <Icon name="check" size="sm" color={colors.brand[700]} /> : null}
							</Pressable>
						);
					})}
				</View>
			)}
		</BottomSheet>
	);
}

const styles = StyleSheet.create({
	list: { gap: spacing.sm },
	option: { minHeight: sizes.touch, flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: borderWidth.thin, borderColor: colors.border },
	optionOn: { borderColor: colors.brand[600], backgroundColor: colors.brand[50] },
	optionBody: { flex: 1, gap: spacing.xxs },
	pressed: { backgroundColor: colors.surfaceMuted },
});
