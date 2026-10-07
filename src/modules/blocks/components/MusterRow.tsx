import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Icon } from "@/common/components/ui/Icon";
import { Text } from "@/common/components/ui/Text";
import { useT } from "@/common/i18n";
import { colors, sizes, spacing } from "@/common/theme/tokens";
import type { Assignment, Worker } from "@/modules/centre/types/centreDay";
import { workerCode } from "@/modules/centre/utils/dayIndex";

type MusterRowProps = {
	worker: Worker;
	assignment: Assignment | undefined;
	onAssign: (worker: Worker) => void;
};

function MusterRowBase({ worker, assignment, onAssign }: MusterRowProps) {
	const t = useT();
	const work = assignment ? (assignment.location ? `${assignment.work_nature ?? ""} · ${assignment.location}` : (assignment.work_nature ?? "")) : null;

	return (
		<Pressable
			disabled={!!assignment}
			onPress={() => onAssign(worker)}
			accessibilityRole="button"
			accessibilityLabel={`${worker.name}, ${work ?? t("blocks.assignWork")}`}
			style={({ pressed }) => [styles.row, pressed ? styles.pressed : null]}
		>
			<View style={styles.body}>
				<Text variant="bodyStrong" numberOfLines={1}>
					{worker.name}
				</Text>
				<Text variant="caption" tone="subtle" numberOfLines={1} tabular>
					{workerCode(worker)}
				</Text>
			</View>
			{work ? (
				<Text variant="label" tone="success" numberOfLines={1} style={styles.work}>
					{work}
				</Text>
			) : (
				<View style={styles.assign}>
					<Text variant="label" tone="brand">
						{t("blocks.assignWork")}
					</Text>
					<Icon name="chevron-right" size="sm" color={colors.brand[700]} />
				</View>
			)}
		</Pressable>
	);
}

export const MusterRow = memo(MusterRowBase);

const styles = StyleSheet.create({
	row: { minHeight: sizes.touch + spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
	pressed: { backgroundColor: colors.surfaceMuted },
	body: { flex: 1, gap: spacing.xxs },
	work: { maxWidth: "50%", textAlign: "right" },
	assign: { flexDirection: "row", alignItems: "center", gap: spacing.xxs },
});
