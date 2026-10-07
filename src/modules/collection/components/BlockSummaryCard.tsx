import { memo } from "react";
import { StyleSheet, View } from "react-native";

import { Badge } from "@/common/components/ui/Badge";
import { Card } from "@/common/components/ui/Card";
import { Icon } from "@/common/components/ui/Icon";
import { Text } from "@/common/components/ui/Text";
import { useT } from "@/common/i18n";
import { colors, spacing } from "@/common/theme/tokens";
import { formatKg } from "@/common/utils/format";
import type { TappingBlock } from "@/modules/blocks/types/workItem";

type BlockSummaryCardProps = {
	block: TappingBlock;
	collected: number;
	totalDry: number;
	onPress: (block: TappingBlock) => void;
};

function BlockSummaryCardBase({ block, collected, totalDry, onPress }: BlockSummaryCardProps) {
	const t = useT();
	const tappers = block.workerIds.length;
	const done = tappers > 0 && collected >= tappers;

	return (
		<Card onPress={() => onPress(block)} accessibilityLabel={`${block.code} ${block.name}`} style={styles.card}>
			<View style={styles.body}>
				<View style={styles.titleRow}>
					<Text variant="subheading" numberOfLines={1} style={styles.title}>
						{`${block.code} · ${block.name}`}
					</Text>
					<Badge label={t("collection.progress", { done: collected, total: tappers })} tone={done ? "success" : tappers === 0 ? "neutral" : "warning"} />
				</View>
				<Text variant="caption" tone="muted" tabular>
					{`${t("blocks.trees", { count: block.trees })} · ${t("blocks.workersCount", { count: tappers })}`}
				</Text>
				<Text variant="heading" tone="brand" tabular>
					{t("collection.dryTotal", { value: formatKg(totalDry) })}
				</Text>
			</View>
			<Icon name="chevron-right" color={colors.textSubtle} />
		</Card>
	);
}

export const BlockSummaryCard = memo(BlockSummaryCardBase);

const styles = StyleSheet.create({
	card: { flexDirection: "row", alignItems: "center", gap: spacing.md },
	body: { flex: 1, gap: spacing.xs },
	titleRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
	title: { flex: 1 },
});
