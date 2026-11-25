import { memo } from "react";
import { StyleSheet, View } from "react-native";

import { Avatar } from "@/common/components/ui/Avatar";
import { Badge } from "@/common/components/ui/Badge";
import { Button } from "@/common/components/ui/Button";
import { Card } from "@/common/components/ui/Card";
import { Text } from "@/common/components/ui/Text";
import { useT } from "@/common/i18n";
import { spacing } from "@/common/theme/tokens";
import { formatKg, initialsOf } from "@/common/utils/format";
import type { Assignment, Collection, Worker } from "@/modules/centre/types/centreDay";
import { workerCode } from "@/modules/centre/utils/dayIndex";

type TapperRowProps = {
	worker: Worker;
	assignment: Assignment | undefined;
	entry: Collection | undefined;
	onOpen: (worker: Worker) => void;
	onSlip: (worker: Worker, entry: Collection) => void;
	// absent for roles that cannot change collections
	onCorrect?: (worker: Worker, entry: Collection) => void;
};

function TapperRowBase({ worker, assignment, entry, onOpen, onSlip, onCorrect }: TapperRowProps) {
	const t = useT();
	const block = assignment?.block_no ? t("blocks.blockNo", { no: assignment.block_no }) : t("collection.noBlock");

	return (
		// Not pressable itself: the Add button is the one target (a button inside a button is invalid on web)
		<Card style={styles.card}>
			<View style={styles.top}>
				<Avatar initials={initialsOf(worker.name)} active={!!entry} />
				<View style={styles.body}>
					<Text variant="bodyStrong" numberOfLines={1}>
						{worker.name}
					</Text>
					<Text variant="caption" tone="muted" numberOfLines={1} tabular>
						{`${workerCode(worker)} · ${block}`}
					</Text>
				</View>
				{entry ? (
					<View style={styles.total}>
						<Text variant="heading" tone="brand" tabular>
							{formatKg(entry.total_dry)}
						</Text>
						<Text variant="caption" tone="muted">
							{`${t("common.kg")} · ${t("today.dry")}`}
						</Text>
					</View>
				) : null}
			</View>
			{entry ? (
				<>
					<View style={styles.footer}>
						<Text variant="caption" tone="muted" tabular style={styles.summary}>
							{t("collection.summaryLine", { latex: entry.latex_kg, drc: entry.sample_drc, scrap: entry.scrap_kg })}
						</Text>
						{entry.id === 0 ? <Badge label={t("collection.queued")} tone="warning" /> : null}
						<Badge label={t("collection.locked")} tone="neutral" />
					</View>
					<View style={styles.actions}>
						<Button label={t("collection.weightSlip")} icon="printer" size="sm" variant="secondary" onPress={() => onSlip(worker, entry)} style={styles.flex} />
						{onCorrect ? (
							<Button label={t("correction.button")} icon="edit-2" size="sm" variant="secondary" onPress={() => onCorrect(worker, entry)} style={styles.flex} />
						) : null}
					</View>
				</>
			) : (
				<Button label={t("collection.add")} icon="plus" onPress={() => onOpen(worker)} accessibilityLabel={`${t("collection.add")}, ${worker.name}, ${block}`} fullWidth />
			)}
		</Card>
	);
}

export const TapperRow = memo(TapperRowBase);

const styles = StyleSheet.create({
	card: { gap: spacing.md },
	top: { flexDirection: "row", alignItems: "center", gap: spacing.md },
	body: { flex: 1, gap: spacing.xxs },
	total: { alignItems: "flex-end" },
	footer: { flexDirection: "row", alignItems: "center", gap: spacing.md },
	summary: { flex: 1 },
	actions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
	flex: { flexGrow: 1, flexBasis: 190 },
});
