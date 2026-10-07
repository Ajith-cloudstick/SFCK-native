import { memo } from "react";
import { StyleSheet, View } from "react-native";

import { Avatar } from "@/common/components/ui/Avatar";
import { Button } from "@/common/components/ui/Button";
import { Card } from "@/common/components/ui/Card";
import { Text } from "@/common/components/ui/Text";
import { useT } from "@/common/i18n";
import { spacing } from "@/common/theme/tokens";
import { formatKg } from "@/common/utils/format";
import type { Worker } from "@/modules/attendance/types/worker";

import type { CollectionEntry } from "../types/collection";
import { computeDryRubber } from "../utils/dryRubber";

type TapperCollectionRowProps = {
	worker: Worker;
	entry: CollectionEntry | null;
	onOpen: (worker: Worker) => void;
};

function TapperCollectionRowBase({ worker, entry, onOpen }: TapperCollectionRowProps) {
	const t = useT();
	const dry = entry ? computeDryRubber(entry.latexKg, entry.drcPercent, entry.scrapKg) : null;

	return (
		<Card style={styles.card}>
			<View style={styles.top}>
				<Avatar initials={worker.initials} active={!!entry} />
				<View style={styles.body}>
					<Text variant="bodyStrong" numberOfLines={1}>
						{worker.name}
					</Text>
					<Text variant="caption" tone="muted" tabular>
						{worker.id}
					</Text>
				</View>
				{entry && dry ? (
					<View style={styles.total}>
						<Text variant="heading" tone="brand" tabular>
							{formatKg(dry.totalDry)}
						</Text>
						<Text variant="caption" tone="muted">
							{`${t("common.kg")} · ${t("today.dry")}`}
						</Text>
					</View>
				) : null}
			</View>
			{entry ? (
				<View style={styles.footer}>
					<Text variant="caption" tone="muted" tabular style={styles.summary}>
						{t("collection.summaryLine", { latex: entry.latexKg, drc: entry.drcPercent, scrap: entry.scrapKg })}
					</Text>
					<Button label={t("collection.edit")} icon="edit-2" size="sm" variant="secondary" onPress={() => onOpen(worker)} />
				</View>
			) : (
				<Button label={t("collection.add")} icon="plus" onPress={() => onOpen(worker)} fullWidth />
			)}
		</Card>
	);
}

export const TapperCollectionRow = memo(TapperCollectionRowBase);

const styles = StyleSheet.create({
	card: { gap: spacing.md },
	top: { flexDirection: "row", alignItems: "center", gap: spacing.md },
	body: { flex: 1, gap: spacing.xxs },
	total: { alignItems: "flex-end" },
	footer: { flexDirection: "row", alignItems: "center", gap: spacing.md },
	summary: { flex: 1 },
});
