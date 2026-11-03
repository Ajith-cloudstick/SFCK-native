import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Badge, type BadgeTone } from "@/common/components/ui/Badge";
import { Icon, type IconName } from "@/common/components/ui/Icon";
import { Text, type TextTone } from "@/common/components/ui/Text";
import { useLanguageStore, useT, type TranslationKey } from "@/common/i18n";
import { borderWidth, colors, opacity, radius, sizes, spacing } from "@/common/theme/tokens";
import { istClock } from "@/common/utils/ist";
import type { AttendanceRecord, DutyType, Worker, WorkerState } from "@/modules/centre/types/centreDay";
import { workerCode } from "@/modules/centre/utils/dayIndex";
import { dutyTypeOf } from "@/modules/centre/utils/duty";

type WorkerRowProps = {
	worker: Worker;
	record: AttendanceRecord | undefined;
	onPress: (worker: Worker) => void;
};

export const stateBadge: Record<WorkerState, { label: TranslationKey; tone: BadgeTone }> = {
	not_marked: { label: "attendance.statusNotMarked", tone: "neutral" },
	present: { label: "attendance.statusPresent", tone: "success" },
	pending: { label: "attendance.statusWaiting", tone: "warning" },
	absent: { label: "attendance.statusAbsent", tone: "danger" },
	leave: { label: "attendance.statusLeave", tone: "info" },
};

// Tapper or general worker at a glance; the same duty type decides their on-time cut-off
const dutyLabel: Record<DutyType, TranslationKey> = {
	tapper: "attendance.typeTapper",
	general: "attendance.typeGeneral",
	casual: "attendance.typeCasual",
	dependent: "attendance.typeDependent",
	protection: "attendance.typeProtection",
};

const marks: Record<WorkerState, { icon: IconName | null; fg: string; bg: string; label: TranslationKey; tone: TextTone }> = {
	not_marked: { icon: null, fg: colors.textSubtle, bg: colors.surface, label: "attendance.tapToMarkShort", tone: "subtle" },
	present: { icon: "check", fg: colors.onBrand, bg: colors.success.fg, label: "attendance.statusPresent", tone: "success" },
	pending: { icon: "clock", fg: colors.warning.fg, bg: colors.warning.bg, label: "attendance.statusWaiting", tone: "warning" },
	absent: { icon: "x", fg: colors.danger.fg, bg: colors.danger.bg, label: "attendance.statusAbsent", tone: "danger" },
	leave: { icon: "info", fg: colors.info.fg, bg: colors.info.bg, label: "attendance.statusLeave", tone: "info" },
};

function WorkerRowBase({ worker, record, onPress }: WorkerRowProps) {
	const t = useT();
	const language = useLanguageStore((s) => s.language);
	const state: WorkerState = record?.status ?? "not_marked";
	const mark = marks[state];
	const name = language === "ml" && worker.name_ml ? worker.name_ml : worker.name;
	const duty = dutyTypeOf(worker);
	const away = !!worker.working_at;
	const status = away
		? t("attendance.atCentre", { centre: worker.working_at ?? "" })
		: record
			? `${istClock(record.check_in)}${record.is_late ? ` · ${t("attendance.late")}` : ""}`
			: t(mark.label);
	// sent here from another centre: say where from, next to the ID
	const from = worker.moved_from == null ? null : worker.moved_from ? t("attendance.fromCentre", { centre: worker.moved_from }) : t("attendance.fromAnother");

	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={`${name}, ${t(dutyLabel[duty])}, ${away ? status : t(mark.label)}`}
			accessibilityHint={record || away ? undefined : t("attendance.tapToMark")}
			onPress={() => onPress(worker)}
			style={({ pressed }) => [styles.row, pressed ? styles.pressed : null, away ? styles.away : null]}
		>
			<View style={[styles.mark, { backgroundColor: mark.bg }, state === "not_marked" ? styles.markEmpty : null]}>
				{mark.icon ? <Icon name={mark.icon} size="sm" color={mark.fg} /> : null}
			</View>
			<View style={styles.body}>
				<View style={styles.nameRow}>
					<Text variant="bodyStrong" numberOfLines={1} style={styles.name}>
						{name}
					</Text>
					<Badge label={t(dutyLabel[duty])} tone={duty === "tapper" ? "brand" : "info"} />
				</View>
				<Text variant="caption" tone="subtle" numberOfLines={1} tabular>
					{from ? `${workerCode(worker)} · ${from}` : workerCode(worker)}
				</Text>
			</View>
			<Text variant="label" tone={away ? "subtle" : record?.is_late && state === "present" ? "warning" : mark.tone} tabular>
				{status}
			</Text>
		</Pressable>
	);
}

export const WorkerRow = memo(WorkerRowBase);

const styles = StyleSheet.create({
	row: {
		minHeight: sizes.touch + spacing.md,
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.md,
		paddingHorizontal: spacing.lg,
		paddingVertical: spacing.sm,
	},
	pressed: { backgroundColor: colors.surfaceMuted },
	away: { opacity: opacity.disabled },
	mark: { width: sizes.rowMark, height: sizes.rowMark, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
	markEmpty: { borderWidth: borderWidth.thick, borderColor: colors.borderStrong },
	body: { flex: 1, gap: spacing.xxs },
	nameRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
	name: { flexShrink: 1 },
});
