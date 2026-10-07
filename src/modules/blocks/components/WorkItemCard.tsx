import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Avatar } from "@/common/components/ui/Avatar";
import { Badge } from "@/common/components/ui/Badge";
import { Card } from "@/common/components/ui/Card";
import { Icon } from "@/common/components/ui/Icon";
import { Text } from "@/common/components/ui/Text";
import { useT } from "@/common/i18n";
import { borderWidth, colors, sizes, spacing } from "@/common/theme/tokens";
import type { Worker } from "@/modules/attendance/types/worker";

import { workItemTitle } from "../store/blocksStore";
import type { WorkItem } from "../types/workItem";

type WorkItemCardProps = {
	item: WorkItem;
	workers: Worker[];
	onRemove: (item: WorkItem, worker: Worker) => void;
};

function WorkItemCardBase({ item, workers, onRemove }: WorkItemCardProps) {
	const t = useT();
	const count = workers.length;

	return (
		<Card padded={false} style={styles.card}>
			<View style={styles.header}>
				<View style={styles.titles}>
					<Text variant="subheading" numberOfLines={1}>
						{workItemTitle(item)}
					</Text>
					{item.kind === "tapping" ? (
						<Text variant="caption" tone="muted" tabular>
							{t("blocks.trees", { count: item.trees })}
						</Text>
					) : null}
				</View>
				<Badge label={t("blocks.workersCount", { count })} tone={count > 0 ? "brand" : "neutral"} />
			</View>
			{count === 0 ? (
				<View style={styles.empty}>
					<Text variant="label" tone="subtle">
						{t("blocks.noWorkers")}
					</Text>
				</View>
			) : (
				workers.map((worker) => (
					<View key={worker.id} style={styles.worker}>
						<Avatar initials={worker.initials} small />
						<View style={styles.workerBody}>
							<Text variant="body" numberOfLines={1}>
								{worker.name}
							</Text>
							<Text variant="caption" tone="muted" tabular>
								{worker.id}
							</Text>
						</View>
						<Pressable
							onPress={() => onRemove(item, worker)}
							style={styles.remove}
							accessibilityRole="button"
							accessibilityLabel={`${t("blocks.remove")} ${worker.name}`}
						>
							<Icon name="x" color={colors.textSubtle} />
						</Pressable>
					</View>
				))
			)}
		</Card>
	);
}

export const WorkItemCard = memo(WorkItemCardBase);

const styles = StyleSheet.create({
	card: { overflow: "hidden" },
	header: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.lg },
	titles: { flex: 1, gap: spacing.xxs },
	empty: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
	worker: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.md,
		paddingLeft: spacing.lg,
		paddingRight: spacing.xs,
		borderTopWidth: borderWidth.hairline,
		borderTopColor: colors.border,
		minHeight: sizes.touch + spacing.sm,
	},
	workerBody: { flex: 1 },
	remove: { width: sizes.touch, height: sizes.touch, alignItems: "center", justifyContent: "center" },
});
