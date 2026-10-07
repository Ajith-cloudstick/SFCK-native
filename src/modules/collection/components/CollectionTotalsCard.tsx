import { StyleSheet, View } from "react-native";

import { Card } from "@/common/components/ui/Card";
import { Text } from "@/common/components/ui/Text";
import { useT } from "@/common/i18n";
import { borderWidth, colors, spacing } from "@/common/theme/tokens";
import { formatKg } from "@/common/utils/format";

import type { CollectionTotals } from "../types/collection";

type CollectionTotalsCardProps = {
	totals: CollectionTotals;
	title?: string;
};

export function CollectionTotalsCard({ totals, title }: CollectionTotalsCardProps) {
	const t = useT();
	return (
		<Card style={styles.card}>
			<Text variant="label" tone="muted">
				{title ?? t("today.collection")}
			</Text>
			<View style={styles.hero}>
				<Text variant="display" tone="brand">
					{formatKg(totals.totalDry)}
				</Text>
				<Text variant="subheading" tone="brand">
					{`${t("common.kg")} · ${t("today.dry")}`}
				</Text>
			</View>
			<View style={styles.split}>
				<View style={styles.cell}>
					<Text variant="caption" tone="muted">
						{t("today.latex")}
					</Text>
					<Text variant="heading" tabular>
						{`${formatKg(totals.latexKg)} ${t("common.kg")}`}
					</Text>
				</View>
				<View style={[styles.cell, styles.cellDivider]}>
					<Text variant="caption" tone="muted">
						{t("today.scrap")}
					</Text>
					<Text variant="heading" tabular>
						{`${formatKg(totals.scrapKg)} ${t("common.kg")}`}
					</Text>
				</View>
			</View>
		</Card>
	);
}

const styles = StyleSheet.create({
	card: { gap: spacing.sm },
	hero: { flexDirection: "row", alignItems: "baseline", gap: spacing.sm, flexWrap: "wrap" },
	split: { flexDirection: "row", borderTopWidth: borderWidth.hairline, borderTopColor: colors.border, paddingTop: spacing.md },
	cell: { flex: 1, gap: spacing.xxs },
	cellDivider: { borderLeftWidth: borderWidth.hairline, borderLeftColor: colors.border, paddingLeft: spacing.lg },
});
