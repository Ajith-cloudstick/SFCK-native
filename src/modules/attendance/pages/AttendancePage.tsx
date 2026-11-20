import { useCallback, useMemo, useState } from "react";
import { FlatList, LayoutAnimation, Pressable, RefreshControl, StyleSheet, View } from "react-native";

import { Screen } from "@/common/components/layout/Screen";
import { useTabBarSpace } from "@/common/components/layout/TabBar";
import { Button } from "@/common/components/ui/Button";
import { EmptyState } from "@/common/components/ui/EmptyState";
import { FadeIn } from "@/common/components/ui/FadeIn";
import { Icon } from "@/common/components/ui/Icon";
import { SegmentedControl } from "@/common/components/ui/SegmentedControl";
import { Text } from "@/common/components/ui/Text";
import { TextField } from "@/common/components/ui/TextField";
import { useT } from "@/common/i18n";
import { borderWidth, colors, sizes, spacing } from "@/common/theme/tokens";
import { hasPermission, useAuthStore } from "@/modules/auth/store/authStore";
import { CentreHeader } from "@/modules/centre/components/CentreHeader";
import { DayGate } from "@/modules/centre/components/DayGate";
import { useSyncRefresh } from "@/modules/centre/hooks/useCentreSync";
import { useIsPastDay } from "@/modules/centre/store/centreDayStore";
import type { Worker } from "@/modules/centre/types/centreDay";
import type { DayIndex } from "@/modules/centre/utils/dayIndex";
import { timingFor } from "@/modules/centre/utils/duty";
import { CollectionEntrySheet } from "@/modules/collection/components/CollectionEntrySheet";
import { AskWorkersSheet } from "@/modules/workers/components/AskWorkersSheet";
import { SendWorkersSheet } from "@/modules/workers/components/SendWorkersSheet";
import { WorkerRequestCard } from "@/modules/workers/components/WorkerRequestCard";
import { useWorkerRequest } from "@/modules/workers/hooks/useWorkerRequest";

import { ManualEntrySheet } from "../components/ManualEntrySheet";
import { WorkerRow } from "../components/WorkerRow";
import { useMarkWorker } from "../hooks/useMarkWorker";
import type { AttendanceFilter } from "../types/attendance";

function matches(index: DayIndex, worker: Worker, filter: AttendanceFilter): boolean {
	const record = index.attendance.get(worker.id);
	if (filter === "to_mark") return !record;
	if (filter === "present") return record?.status === "present";
	return true;
}

export default function AttendancePage() {
	return (
		<Screen header={<CentreHeader />}>
			<DayGate>{(index) => <AttendanceList index={index} />}</DayGate>
		</Screen>
	);
}

function AttendanceList({ index }: { index: DayIndex }) {
	const t = useT();
	const markWorker = useMarkWorker();
	const bottomSpace = useTabBarSpace();
	const refresh = useSyncRefresh();
	const [query, setQuery] = useState("");
	const [filter, setFilter] = useState<AttendanceFilter>("all");
	const [sheetOpen, setSheetOpen] = useState(false);
	const [collectFor, setCollectFor] = useState<Worker | null>(null);
	const session = useAuthStore((s) => s.session);
	const pastDay = useIsPastDay();
	const { cancel } = useWorkerRequest();
	const [asking, setAsking] = useState(false);
	const [bringing, setBringing] = useState(false);
	const canAsk = hasPermission(session, "can_request_worker") && !pastDay;
	// senders bring workers from anywhere for any period; others who mark attendance bring one of their estate for today
	const canSendFull = hasPermission(session, "can_send_worker");
	const canSend = (canSendFull || hasPermission(session, "can_change_attendance")) && !pastDay;
	const requests = (index.day.worker_requests ?? []).filter((r) => r.status !== "cancelled");
	// workers sent here, and this centre's workers sent away, can be brought back
	const sentHere = index.day.workers.filter((w) => (w.moved_from != null || w.working_at != null) && !!w.move_id);
	// workers sent to other centres are listed last and never counted here
	const workers = index.markable;
	const tapperTiming = timingFor(index.day, "tapper");

	const counts = useMemo(
		() => ({
			all: workers.length,
			to_mark: workers.filter((w) => matches(index, w, "to_mark")).length,
			present: workers.filter((w) => matches(index, w, "present")).length,
		}),
		[index, workers],
	);

	const visible = useMemo(() => {
		const q = query.trim().toLowerCase();
		const found = (w: Worker) => !q || w.name.toLowerCase().includes(q) || (w.name_ml ?? "").includes(q) || w.check_roll_no.toLowerCase().includes(q) || (w.current_code ?? "").toLowerCase().includes(q);
		const listed = workers.filter((w) => matches(index, w, filter) && found(w));
		return filter === "all" ? [...listed, ...index.away.filter(found)] : listed;
	}, [index, workers, filter, query]);

	const changeFilter = (next: AttendanceFilter) => {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		setFilter(next);
	};

	const onPress = useCallback((worker: Worker) => void markWorker(worker), [markWorker]);
	const renderItem = useCallback(({ item }: { item: Worker }) => <WorkerRow worker={item} record={index.attendance.get(item.id)} onPress={onPress} />, [index, onPress]);

	return (
		<FadeIn style={styles.flex}>
			<View style={styles.toolbar}>
				<TextField
					icon="search"
					value={query}
					onChangeText={setQuery}
					placeholder={t("attendance.searchPlaceholder")}
					autoCorrect={false}
					returnKeyType="search"
					clearButtonMode="while-editing"
					trailing={
						<Pressable onPress={() => setSheetOpen(true)} style={styles.trailing} accessibilityRole="button" accessibilityLabel={t("attendance.enterId")}>
							<Icon name="hash" color={colors.brand[700]} />
						</Pressable>
					}
				/>
				<SegmentedControl
					value={filter}
					onChange={changeFilter}
					options={[
						{ value: "all", label: `${t("attendance.filterAll")} ${counts.all}` },
						{ value: "to_mark", label: `${t("attendance.filterToMark")} ${counts.to_mark}` },
						{ value: "present", label: `${t("attendance.filterPresent")} ${counts.present}` },
					]}
				/>
				{tapperTiming ? (
					<View style={styles.meta}>
						<Icon name="clock" size="sm" color={colors.textSubtle} />
						<Text variant="caption" tone="subtle" tabular>
							{t("attendance.onTimeUntil", { time: tapperTiming.normal_until })}
						</Text>
					</View>
				) : null}
			</View>

			<FlatList
				showsVerticalScrollIndicator={false}
				data={visible}
				keyExtractor={(item) => String(item.id)}
				renderItem={renderItem}
				ItemSeparatorComponent={Separator}
				keyboardShouldPersistTaps="handled"
				keyboardDismissMode="on-drag"
				initialNumToRender={16}
				windowSize={7}
				style={styles.list}
				ListHeaderComponent={
					canAsk || canSend || requests.length > 0 ? (
						<View style={styles.workers}>
							{canAsk || canSend ? (
								<View style={styles.workerActions}>
									{canAsk ? <Button label={t("workers.ask")} icon="users" variant="secondary" size="sm" onPress={() => setAsking(true)} style={styles.flex} /> : null}
									{canSend ? <Button label={t("workers.bring")} icon="user-plus" variant="secondary" size="sm" onPress={() => setBringing(true)} style={styles.flex} /> : null}
								</View>
							) : null}
							{requests.map((r) => (
								<WorkerRequestCard key={r.client_uuid ?? r.id} request={r} onCancel={canAsk ? (req) => void cancel(req) : undefined} />
							))}
						</View>
					) : undefined
				}
				contentContainerStyle={[styles.listContent, { paddingBottom: bottomSpace }]}
				refreshControl={<RefreshControl {...refresh} colors={[colors.brand[700]]} tintColor={colors.brand[700]} />}
				ListEmptyComponent={<EmptyState icon="users" title={t("attendance.emptyTitle")} body={t("attendance.emptyBody")} />}
			/>

			<ManualEntrySheet
				visible={sheetOpen}
				onClose={() => setSheetOpen(false)}
				onCollect={(worker) => {
					setSheetOpen(false);
					setCollectFor(worker);
				}}
			/>
			<AskWorkersSheet visible={asking} estateId={index.day.centre.estate_id} onClose={() => setAsking(false)} />
			<SendWorkersSheet
				visible={bringing}
				ccId={index.day.centre.id}
				ccName={index.day.centre.name}
				estateId={index.day.centre.estate_id}
				date={index.day.date}
				sentHere={canSendFull ? sentHere : []}
				todayOnly={!canSendFull}
				onClose={() => setBringing(false)}
			/>
			<CollectionEntrySheet
				key={collectFor?.id ?? "none"}
				worker={collectFor}
				assignment={collectFor ? index.blockAssignment.get(collectFor.id) : undefined}
				scrapDrcPercent={index.day.scrap_drc_percent ?? 0}
				onClose={() => setCollectFor(null)}
			/>
		</FadeIn>
	);
}

function Separator() {
	return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
	flex: { flex: 1 },
	toolbar: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md, gap: spacing.md },
	trailing: { width: sizes.touch, height: sizes.touch, alignItems: "center", justifyContent: "center", marginRight: -spacing.md },
	meta: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
	list: { flex: 1, backgroundColor: colors.surface, borderTopWidth: borderWidth.hairline, borderTopColor: colors.border },
	listContent: { flexGrow: 1 },
	workers: { padding: spacing.lg, gap: spacing.sm, backgroundColor: colors.canvas, borderBottomWidth: borderWidth.hairline, borderBottomColor: colors.border },
	workerActions: { flexDirection: "row", gap: spacing.sm },
	separator: { height: borderWidth.hairline, backgroundColor: colors.border, marginLeft: spacing.lg + sizes.rowMark + spacing.md },
});
