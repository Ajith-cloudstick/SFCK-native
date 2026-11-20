import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Icon } from "@/common/components/ui/Icon";
import { Text } from "@/common/components/ui/Text";
import { useT } from "@/common/i18n";
import { colors, opacity, radius, sizes, spacing } from "@/common/theme/tokens";
import type { DayBlock } from "@/modules/centre/types/centreDay";

type BlockCardProps = {
	block: DayBlock;
	onAssign: (block: DayBlock) => void;
};

function BlockCardBase({ block, onAssign }: BlockCardProps) {
	const t = useT();
	const details = [block.block_class ? t("blocks.class", { value: block.block_class }) : null, block.tapping_cycle].filter(Boolean).join(" · ");
	const owner = block.tapper_name ?? t("blocks.vacant");
	const assigned = !!block.assigned_to;

	return (
		<Pressable
			disabled={assigned}
			onPress={() => onAssign(block)}
			accessibilityRole="button"
			accessibilityLabel={`${t("blocks.blockNo", { no: block.block_no })}, ${assigned ? block.assigned_name ?? "" : t("blocks.assign")}`}
			style={({ pressed }) => [styles.row, !block.due && !assigned ? styles.dim : null, pressed ? styles.pressed : null]}
		>
			<View style={[styles.tag, block.due ? styles.tagDue : null]}>
				<Text variant="subheading" tone={block.due ? "brand" : "muted"} numberOfLines={1}>
					{block.block_no}
				</Text>
			</View>
			<View style={styles.body}>
				<Text variant="bodyStrong" numberOfLines={1} tone={block.tapper_name ? "default" : "muted"}>
					{owner}
					{block.tapper_id && !block.tapper_present ? <Text variant="caption" tone="danger">{`  ${t("blocks.absent")}`}</Text> : null}
				</Text>
				{details ? (
					<Text variant="caption" tone="subtle" numberOfLines={1}>
						{details}
					</Text>
				) : null}
			</View>
			{assigned ? (
				<View style={styles.assigned}>
					<Icon name="check" size="sm" color={colors.success.fg} />
					<Text variant="label" tone="success" numberOfLines={1} style={styles.assignedName}>
						{block.assigned_name ?? ""}
					</Text>
				</View>
			) : (
				<View style={styles.assign}>
					<Text variant="label" tone="brand">
						{t("blocks.assign")}
					</Text>
					<Icon name="chevron-right" size="sm" color={colors.brand[700]} />
				</View>
			)}
		</Pressable>
	);
}

export const BlockCard = memo(BlockCardBase);

const styles = StyleSheet.create({
	row: { minHeight: sizes.touch + spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
	dim: { opacity: opacity.muted },
	pressed: { backgroundColor: colors.surfaceMuted },
	tag: { width: sizes.blockTag, height: sizes.blockTag, borderRadius: radius.md, backgroundColor: colors.surfaceMuted, alignItems: "center", justifyContent: "center" },
	tagDue: { backgroundColor: colors.brand[50] },
	body: { flex: 1, gap: spacing.xxs },
	assigned: { flexDirection: "row", alignItems: "center", gap: spacing.xs, maxWidth: "40%" },
	assignedName: { flexShrink: 1 },
	assign: { flexDirection: "row", alignItems: "center", gap: spacing.xxs },
});
