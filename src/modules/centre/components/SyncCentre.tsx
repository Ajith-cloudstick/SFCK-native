import { StyleSheet, View } from "react-native";

import { SectionTitle } from "@/common/components/layout/SectionTitle";
import { Badge } from "@/common/components/ui/Badge";
import { Button } from "@/common/components/ui/Button";
import { Card } from "@/common/components/ui/Card";
import { EmptyState } from "@/common/components/ui/EmptyState";
import { Icon } from "@/common/components/ui/Icon";
import { Text } from "@/common/components/ui/Text";
import { useT } from "@/common/i18n";
import { discardItem, retryItem, syncNow } from "@/common/sync/syncEngine";
import { useSyncStore, useSyncSummary } from "@/common/sync/syncStore";
import type { OutboxItem } from "@/common/sync/types";
import { borderWidth, colors, spacing } from "@/common/theme/tokens";
import { istClock } from "@/common/utils/ist";

import { useCentreDay } from "../store/centreDayStore";
import { describeItem } from "../utils/describeItem";

export function SyncCentre() {
	const t = useT();
	const day = useCentreDay();
	const items = useSyncStore((s) => s.items);
	const syncing = useSyncStore((s) => s.syncing);
	const lastSyncedAt = useSyncStore((s) => s.lastSyncedAt);
	const lastError = useSyncStore((s) => s.lastError);
	const notice = useSyncStore((s) => s.notice);
	const { state, pending, failed } = useSyncSummary();
	const failedItems = items.filter((i) => i.status === "failed");
	const pendingItems = items.filter((i) => i.status === "pending");

	const status =
		state === "offline" ? t("sync.statusOffline") : state === "error" ? t("sync.statusError") : state === "pending" ? t("sync.pending", { count: pending }) : t("sync.statusSynced");

	const renderItem = (item: OutboxItem, index: number, list: OutboxItem[]) => {
		const { title, subtitle } = describeItem(item, day, t);
		const isFailed = item.status === "failed";
		return (
			<View key={item.clientUuid} style={[styles.item, index < list.length - 1 ? styles.divider : null]}>
				<View style={styles.itemTop}>
					<Icon name={isFailed ? "alert-triangle" : "upload-cloud"} size="sm" color={isFailed ? colors.danger.fg : colors.warning.fg} />
					<View style={styles.itemBody}>
						<Text variant="bodyStrong" numberOfLines={2}>
							{title}
						</Text>
						<Text variant="caption" tone="muted" tabular>
							{subtitle}
						</Text>
						{isFailed && item.error ? (
							<Text variant="label" tone="danger">
								{item.error}
							</Text>
						) : null}
					</View>
				</View>
				{isFailed ? (
					<View style={styles.actions}>
						<Button label={t("sync.retry")} icon="rotate-ccw" size="sm" variant="secondary" onPress={() => void retryItem(item.clientUuid)} style={styles.action} />
						<Button label={t("sync.discard")} icon="trash-2" size="sm" variant="ghost" onPress={() => void discardItem(item.clientUuid)} style={styles.action} />
					</View>
				) : null}
			</View>
		);
	};

	return (
		<View style={styles.wrap}>
			<Card style={styles.summary}>
				<View style={styles.summaryRow}>
					<Text variant="subheading" style={styles.flex}>
						{status}
					</Text>
					{failed > 0 ? <Badge label={t("sync.failedCount", { count: failed })} tone="danger" /> : null}
				</View>
				<Text variant="caption" tone="muted" tabular>
					{lastSyncedAt ? t("sync.lastSynced", { time: istClock(lastSyncedAt) }) : t("sync.neverSynced")}
				</Text>
				{lastError || notice ? (
					<Text variant="label" tone={lastError ? "danger" : "warning"}>
						{lastError ?? notice}
					</Text>
				) : null}
				<Button label={t("sync.syncNow")} icon="refresh-cw" onPress={() => void syncNow()} loading={syncing} disabled={state === "offline"} fullWidth />
			</Card>

			{items.length === 0 ? <EmptyState icon="check" title={t("sync.emptyTitle")} body={t("sync.emptyBody")} /> : null}

			{failedItems.length > 0 ? (
				<>
					<SectionTitle title={t("sync.failedTitle")} />
					<Card padded={false}>{failedItems.map(renderItem)}</Card>
				</>
			) : null}

			{pendingItems.length > 0 ? (
				<>
					<SectionTitle title={t("sync.pendingTitle")} />
					<Card padded={false}>{pendingItems.map(renderItem)}</Card>
				</>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	wrap: { gap: spacing.xs },
	flex: { flex: 1 },
	summary: { gap: spacing.sm },
	summaryRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
	item: { padding: spacing.md, gap: spacing.sm },
	divider: { borderBottomWidth: borderWidth.hairline, borderBottomColor: colors.border },
	itemTop: { flexDirection: "row", gap: spacing.md },
	itemBody: { flex: 1, gap: spacing.xxs },
	actions: { flexDirection: "row", gap: spacing.sm },
	action: { flex: 1 },
});
