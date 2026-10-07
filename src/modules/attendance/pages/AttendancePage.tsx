import { useCallback, useMemo, useState } from "react";
import { FlatList, LayoutAnimation, Pressable, RefreshControl, StyleSheet, View } from "react-native";

import { Screen } from "@/common/components/layout/Screen";
import { useTabBarSpace } from "@/common/components/layout/TabBar";
import { EmptyState } from "@/common/components/ui/EmptyState";
import { FadeIn } from "@/common/components/ui/FadeIn";
import { Icon } from "@/common/components/ui/Icon";
import { SegmentedControl } from "@/common/components/ui/SegmentedControl";
import { Text } from "@/common/components/ui/Text";
import { TextField } from "@/common/components/ui/TextField";
import { useT } from "@/common/i18n";
import { borderWidth, colors, sizes, spacing } from "@/common/theme/tokens";
import { CentreHeader } from "@/modules/centre/components/CentreHeader";
import { DayGate } from "@/modules/centre/components/DayGate";
import { useSyncRefresh } from "@/modules/centre/hooks/useCentreSync";
import type { Worker } from "@/modules/centre/types/centreDay";
import type { DayIndex } from "@/modules/centre/utils/dayIndex";
import { timingFor } from "@/modules/centre/utils/duty";

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
	const workers = index.day.workers;
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
		return workers.filter(
			(w) =>
				matches(index, w, filter) &&
				(!q || w.name.toLowerCase().includes(q) || (w.name_ml ?? "").includes(q) || w.check_roll_no.toLowerCase().includes(q) || (w.current_code ?? "").toLowerCase().includes(q)),
		);
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
				data={visible}
				keyExtractor={(item) => String(item.id)}
				renderItem={renderItem}
				ItemSeparatorComponent={Separator}
				keyboardShouldPersistTaps="handled"
				keyboardDismissMode="on-drag"
				initialNumToRender={16}
				windowSize={7}
				style={styles.list}
				contentContainerStyle={[styles.listContent, { paddingBottom: bottomSpace }]}
				refreshControl={<RefreshControl {...refresh} colors={[colors.brand[700]]} tintColor={colors.brand[700]} />}
				ListEmptyComponent={<EmptyState icon="users" title={t("attendance.emptyTitle")} body={t("attendance.emptyBody")} />}
			/>

			<ManualEntrySheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />
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
	separator: { height: borderWidth.hairline, backgroundColor: colors.border, marginLeft: spacing.lg + sizes.rowMark + spacing.md },
});
