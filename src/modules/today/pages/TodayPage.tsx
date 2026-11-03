import { useRouter } from "expo-router";
import { useCallback } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";

import { Screen } from "@/common/components/layout/Screen";
import { SectionTitle } from "@/common/components/layout/SectionTitle";
import { useTabBarSpace } from "@/common/components/layout/TabBar";
import { Card } from "@/common/components/ui/Card";
import { EmptyState } from "@/common/components/ui/EmptyState";
import { Icon } from "@/common/components/ui/Icon";
import { Text } from "@/common/components/ui/Text";
import { useT } from "@/common/i18n";
import { useSyncStore } from "@/common/sync/syncStore";
import { borderWidth, colors, radius, sizes, spacing } from "@/common/theme/tokens";
import { istClock } from "@/common/utils/ist";
import { CentreHeader } from "@/modules/centre/components/CentreHeader";
import { DayGate } from "@/modules/centre/components/DayGate";
import { useSyncRefresh } from "@/modules/centre/hooks/useCentreSync";
import { useCentreDayStore } from "@/modules/centre/store/centreDayStore";
import type { DayIndex } from "@/modules/centre/utils/dayIndex";
import { CollectionSummaryCard } from "@/modules/collection/components/CollectionSummaryCard";

import { PendingItemRow } from "../components/PendingItemRow";
import { StatTile } from "../components/StatTile";
import { useTodaySummary } from "../store/useTodaySummary";
import type { PendingItem } from "../types/today";

export default function TodayPage() {
	return (
		<Screen header={<CentreHeader />}>
			<DayGate>{(index) => <TodayContent index={index} />}</DayGate>
		</Screen>
	);
}

function TodayContent({ index }: { index: DayIndex }) {
	const t = useT();
	const router = useRouter();
	const bottomSpace = useTabBarSpace();
	const refresh = useSyncRefresh();
	const summary = useTodaySummary(index);
	const lastSyncedAt = useSyncStore((s) => s.lastSyncedAt);
	const source = useCentreDayStore((s) => s.source);
	const savedAt = useCentreDayStore((s) => s.savedAt);
	const progress = summary.due > 0 ? summary.dueAssigned / summary.due : 0;
	const syncedAt = lastSyncedAt ?? savedAt;

	const openItem = useCallback((item: PendingItem) => router.navigate(item.target), [router]);
	const renderItem = useCallback(({ item }: { item: PendingItem }) => <PendingItemRow item={item} onPress={openItem} />, [openItem]);

	const header = (
		<View style={styles.header}>
			<Card style={styles.card}>
				<Text variant="label" tone="muted">
					{t("today.workers", { total: summary.total })}
				</Text>
				<View style={styles.stats}>
					<StatTile label={t("today.present")} value={summary.present} tone="success" />
					<StatTile label={t("today.waiting")} value={summary.waiting} tone="warning" />
					<StatTile label={t("today.notMarked")} value={summary.notMarked} tone={summary.notMarked > 0 ? "danger" : "muted"} />
				</View>
			</Card>

			<CollectionSummaryCard totals={summary.totals} />

			<Card style={styles.card}>
				<Text variant="label" tone="muted">
					{t("today.blocks")}
				</Text>
				<View style={styles.stats}>
					<StatTile label={t("today.due")} value={summary.due} />
					<StatTile label={t("today.assigned")} value={summary.dueAssigned} tone="brand" />
					<StatTile label={t("today.unassigned")} value={summary.due - summary.dueAssigned} tone={summary.due > summary.dueAssigned ? "danger" : "muted"} />
				</View>
				<View style={styles.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: summary.due, now: summary.dueAssigned }}>
					<View style={[styles.fill, { flex: progress }]} />
					<View style={{ flex: 1 - progress }} />
				</View>
			</Card>

			<View style={styles.syncLine}>
				<Icon name={source === "cache" ? "wifi-off" : "refresh-cw"} size="sm" color={colors.textMuted} />
				<Text variant="caption" tone="muted" tabular>
					{syncedAt ? t(source === "cache" && !lastSyncedAt ? "today.savedCopy" : "today.lastSync", { time: istClock(syncedAt) }) : t("sync.neverSynced")}
				</Text>
			</View>

			<SectionTitle title={t("today.pendingItems")} />
		</View>
	);

	return (
		<FlatList
			showsVerticalScrollIndicator={false}
			data={summary.pending}
			keyExtractor={(item) => item.id}
			renderItem={renderItem}
			ListHeaderComponent={header}
			ItemSeparatorComponent={Separator}
			contentContainerStyle={[styles.list, { paddingBottom: bottomSpace }]}
			refreshControl={<RefreshControl {...refresh} colors={[colors.brand[700]]} tintColor={colors.brand[700]} />}
			ListEmptyComponent={<EmptyState icon="check" title={t("today.nothingPending")} body={t("today.nothingPendingBody")} />}
		/>
	);
}

function Separator() {
	return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
	list: { padding: spacing.lg },
	header: { gap: spacing.md },
	card: { gap: spacing.md },
	stats: { flexDirection: "row", gap: spacing.lg },
	track: {
		flexDirection: "row",
		height: sizes.progress,
		borderRadius: radius.pill,
		backgroundColor: colors.border,
		overflow: "hidden",
		borderWidth: borderWidth.hairline,
		borderColor: colors.border,
	},
	fill: { backgroundColor: colors.brand[500], borderRadius: radius.pill },
	syncLine: { flexDirection: "row", alignItems: "center", gap: spacing.xs, justifyContent: "center" },
	separator: { height: spacing.sm },
});
