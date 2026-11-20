import { ActivityIndicator, StyleSheet, View } from "react-native";

import { Button } from "@/common/components/ui/Button";
import { EmptyState } from "@/common/components/ui/EmptyState";
import { useT } from "@/common/i18n";
import { syncNow } from "@/common/sync/syncEngine";
import { useSyncStore } from "@/common/sync/syncStore";
import { colors, spacing } from "@/common/theme/tokens";

import { useCentreDayStore, useDayIndex } from "../store/centreDayStore";
import type { DayIndex } from "../utils/dayIndex";

type DayGateProps = {
	children: (index: DayIndex) => React.ReactNode;
};

// Shows loading or an offline-empty state until a day (server or cached) is available
export function DayGate({ children }: DayGateProps) {
	const t = useT();
	const index = useDayIndex();
	const loading = useCentreDayStore((s) => s.loading);
	const error = useCentreDayStore((s) => s.error);
	const online = useSyncStore((s) => s.online);
	const syncing = useSyncStore((s) => s.syncing);

	if (index) return <>{children(index)}</>;
	if (loading && !error) {
		return (
			<View style={styles.centre}>
				<ActivityIndicator size="large" color={colors.brand[700]} />
			</View>
		);
	}
	return (
		<View style={styles.centre}>
			<EmptyState
				icon={online ? "alert-circle" : "wifi-off"}
				title={online ? t("day.loadFailed") : t("day.offlineTitle")}
				body={online ? (error ?? undefined) : t("day.offlineBody")}
				action={<Button label={t("common.retry")} icon="refresh-cw" onPress={() => void syncNow()} loading={syncing} style={styles.action} />}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	centre: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg },
	action: { marginTop: spacing.md },
});
