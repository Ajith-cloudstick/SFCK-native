import { useCallback, useMemo, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";

import { Screen } from "@/common/components/layout/Screen";
import { SectionTitle } from "@/common/components/layout/SectionTitle";
import { useTabBarSpace } from "@/common/components/layout/TabBar";
import { EmptyState } from "@/common/components/ui/EmptyState";
import { showToast } from "@/common/hooks/useToast";
import { useT } from "@/common/i18n";
import { colors, spacing } from "@/common/theme/tokens";
import { CentreHeader } from "@/modules/centre/components/CentreHeader";
import { DayGate } from "@/modules/centre/components/DayGate";
import { useSyncRefresh } from "@/modules/centre/hooks/useCentreSync";
import { isPastDay } from "@/modules/centre/store/centreDayStore";
import { hasPermission, useAuthStore } from "@/modules/auth/store/authStore";
import type { Collection, Worker } from "@/modules/centre/types/centreDay";
import type { DayIndex } from "@/modules/centre/utils/dayIndex";

import { CollectionEntrySheet } from "../components/CollectionEntrySheet";
import { CollectionSummaryCard } from "../components/CollectionSummaryCard";
import { CorrectionSheet } from "../components/CorrectionSheet";
import { TapperRow } from "../components/TapperRow";
import { sumCollections } from "../utils/collectionMath";
import { shareWeightSlip } from "../utils/weightSlip";

export default function CollectionPage() {
	return (
		<Screen header={<CentreHeader />}>
			<DayGate>{(index) => <CollectionList index={index} />}</DayGate>
		</Screen>
	);
}

function CollectionList({ index }: { index: DayIndex }) {
	const t = useT();
	const bottomSpace = useTabBarSpace();
	const refresh = useSyncRefresh();
	const [target, setTarget] = useState<Worker | null>(null);
	const [correcting, setCorrecting] = useState<{ worker: Worker; entry: Collection } | null>(null);
	// the same permission the server checks before taking a correction request
	const canCorrect = useAuthStore((s) => hasPermission(s.session, "can_change_collection"));
	const totals = useMemo(() => sumCollections(index.day.collections), [index]);
	const done = index.presentTappers.filter((w) => index.collections.has(w.id)).length;

	// Tappers still waiting for an entry come first
	const tappers = useMemo(
		() => [...index.presentTappers].sort((a, b) => Number(index.collections.has(a.id)) - Number(index.collections.has(b.id))),
		[index],
	);

	const entryFor = useCallback(
		(worker: Worker) => {
			const blockId = index.blockAssignment.get(worker.id)?.block_id ?? null;
			const rows = index.collections.get(worker.id) ?? [];
			return rows.find((c) => c.block_id === blockId) ?? rows[0];
		},
		[index],
	);

	// Past days are view only, so no entry sheet opens there
	const openEntry = useCallback(
		(worker: Worker) => {
			if (isPastDay()) showToast(t("day.viewOnly"), "warning");
			else setTarget(worker);
		},
		[t],
	);

	// made on the phone, so it works offline and for entries not synced yet
	const openSlip = useCallback(
		(worker: Worker, entry: Collection) => {
			shareWeightSlip(entry, worker, index.day).catch(() => showToast(t("collection.slipFailed"), "danger"));
		},
		[index, t],
	);

	// the server needs the saved record, so an entry still waiting to sync cannot be corrected yet
	const openCorrection = useCallback(
		(worker: Worker, entry: Collection) => {
			if (entry.id === 0) showToast(t("correction.syncFirst"), "warning");
			else setCorrecting({ worker, entry });
		},
		[t],
	);

	const renderItem = useCallback(
		({ item }: { item: Worker }) => (
			<TapperRow
				worker={item}
				assignment={index.blockAssignment.get(item.id)}
				entry={entryFor(item)}
				onOpen={openEntry}
				onSlip={openSlip}
				onCorrect={canCorrect ? openCorrection : undefined}
			/>
		),
		[index, entryFor, openEntry, openSlip, openCorrection, canCorrect],
	);

	return (
		<>
			<FlatList
				showsVerticalScrollIndicator={false}
				data={tappers}
				keyExtractor={(w) => String(w.id)}
				renderItem={renderItem}
				contentContainerStyle={[styles.list, { paddingBottom: bottomSpace }]}
				ItemSeparatorComponent={Separator}
				refreshControl={<RefreshControl {...refresh} colors={[colors.brand[700]]} tintColor={colors.brand[700]} />}
				ListHeaderComponent={
					<View>
						<CollectionSummaryCard totals={totals} footer={t("collection.progress", { done, total: index.presentTappers.length })} />
						<SectionTitle title={t("collection.tappersTitle")} />
					</View>
				}
				ListEmptyComponent={<EmptyState icon="users" title={t("collection.emptyTitle")} body={t("collection.emptyBody")} />}
			/>
			<CollectionEntrySheet
				key={`entry-${target?.id ?? "none"}`}
				worker={target}
				assignment={target ? index.blockAssignment.get(target.id) : undefined}
				scrapDrcPercent={index.day.scrap_drc_percent}
				onClose={() => setTarget(null)}
			/>
			<CorrectionSheet key={`correction-${correcting?.entry.id ?? "none"}`} worker={correcting?.worker ?? null} entry={correcting?.entry} onClose={() => setCorrecting(null)} />
		</>
	);
}

function Separator() {
	return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
	list: { padding: spacing.lg, flexGrow: 1 },
	separator: { height: spacing.md },
});
