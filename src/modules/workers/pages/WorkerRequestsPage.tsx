import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppHeader } from "@/common/components/layout/AppHeader";
import { Screen } from "@/common/components/layout/Screen";
import { Button } from "@/common/components/ui/Button";
import { EmptyState } from "@/common/components/ui/EmptyState";
import { showToast } from "@/common/hooks/useToast";
import { useT } from "@/common/i18n";
import { userMessage } from "@/common/services/httpClient";
import { syncNow } from "@/common/sync/syncEngine";
import { colors, spacing } from "@/common/theme/tokens";
import { useAuthStore } from "@/modules/auth/store/authStore";
import type { WorkerRequest } from "@/modules/centre/types/centreDay";

import { SendWorkersSheet } from "../components/SendWorkersSheet";
import { WorkerRequestCard } from "../components/WorkerRequestCard";
import { declineWorkerRequest, listWorkerRequests } from "../services/workerMoveService";

// Inbox for Field Officers, Field Supervisors, AMs and Estate Clerks: centres asking for workers from their estate
export default function WorkerRequestsPage() {
	const t = useT();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const userId = useAuthStore((s) => s.session?.user.id ?? null);
	const [requests, setRequests] = useState<WorkerRequest[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [sending, setSending] = useState<WorkerRequest | null>(null);

	const load = useCallback(async () => {
		if (!userId) return;
		try {
			const { data } = await listWorkerRequests(userId, "open");
			setRequests(data.filter((r) => r.for_me));
			setError(null);
		} catch (e) {
			setError(userMessage(e));
		} finally {
			setLoading(false);
		}
	}, [userId]);

	useEffect(() => {
		void load();
	}, [load]);

	const refresh = () => {
		setRefreshing(true);
		void load().finally(() => setRefreshing(false));
	};

	const decline = (request: WorkerRequest) => {
		if (!userId) return;
		Alert.alert(t("workers.declineTitle"), t("workers.declineBody", { centre: request.cc_name ?? "" }), [
			{ text: t("common.cancel"), style: "cancel" },
			{
				text: t("workers.decline"),
				style: "destructive",
				onPress: () =>
					void declineWorkerRequest(userId, request.id)
						.then(() => {
							showToast(t("workers.declined"));
							void syncNow();
							void load();
						})
						.catch((e: unknown) => showToast(userMessage(e), "danger")),
			},
		]);
	};

	const renderBody = () => {
		if (loading) return <ActivityIndicator color={colors.brand[700]} style={styles.loading} />;
		if (error) return <EmptyState icon="wifi-off" title={t("workers.offline")} body={error} />;
		if (requests.length === 0) return <EmptyState icon="inbox" title={t("workers.noRequests")} />;
		return requests.map((r) => (
			<View key={r.id} style={styles.item}>
				<WorkerRequestCard request={r} showCentre onSend={setSending} />
				{r.status === "waiting" ? (
					<View style={styles.declineRow}>
						<Button label={t("workers.decline")} icon="x" variant="ghost" size="sm" onPress={() => decline(r)} />
					</View>
				) : null}
			</View>
		));
	};

	return (
		<Screen header={<AppHeader title={t("workers.requestsTitle")} onBack={() => (router.canGoBack() ? router.back() : router.replace("/today"))} />}>
			<ScrollView
				contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
				showsVerticalScrollIndicator={false}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[colors.brand[700]]} tintColor={colors.brand[700]} />}
			>
				{renderBody()}
			</ScrollView>
			{sending ? (
				<SendWorkersSheet
					key={sending.id}
					visible
					ccId={sending.cc_id}
					ccName={sending.cc_name ?? ""}
					date={sending.date.slice(0, 10)}
					request={sending}
					onClose={() => setSending(null)}
					onSent={() => void load()}
				/>
			) : null}
		</Screen>
	);
}

const styles = StyleSheet.create({
	content: { padding: spacing.lg, gap: spacing.md },
	loading: { paddingVertical: spacing.xxl },
	item: { gap: spacing.xs },
	declineRow: { flexDirection: "row", justifyContent: "flex-end" },
});
