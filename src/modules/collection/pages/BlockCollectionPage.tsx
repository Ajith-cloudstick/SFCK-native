import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";

import { AppHeader } from "@/common/components/layout/AppHeader";
import { Screen } from "@/common/components/layout/Screen";
import { SectionTitle } from "@/common/components/layout/SectionTitle";
import { EmptyState } from "@/common/components/ui/EmptyState";
import { useT } from "@/common/i18n";
import { spacing } from "@/common/theme/tokens";
import { useWorkerMap } from "@/modules/attendance/store/attendanceStore";
import type { Worker } from "@/modules/attendance/types/worker";
import { useBlocksStore } from "@/modules/blocks/store/blocksStore";

import { CollectionSheet } from "../components/CollectionSheet";
import { CollectionTotalsCard } from "../components/CollectionTotalsCard";
import { TapperCollectionRow } from "../components/TapperCollectionRow";
import { collectionKey, useCollectionMap } from "../store/collectionStore";
import type { CollectionEntry } from "../types/collection";
import { sumCollections } from "../utils/dryRubber";

export default function BlockCollectionPage() {
	const t = useT();
	const router = useRouter();
	const { blockId } = useLocalSearchParams<{ blockId: string }>();
	const items = useBlocksStore((s) => s.items);
	const workerMap = useWorkerMap();
	const collectionMap = useCollectionMap();
	const [target, setTarget] = useState<Worker | null>(null);

	const block = useMemo(() => {
		const found = items.find((i) => i.id === blockId);
		return found?.kind === "tapping" ? found : null;
	}, [items, blockId]);

	const tappers = useMemo(() => (block ? block.workerIds.map((id) => workerMap.get(id)).filter((w): w is Worker => !!w) : []), [block, workerMap]);

	const entries = useMemo(
		() => (block ? tappers.map((w) => collectionMap.get(collectionKey(block.id, w.id))).filter((e): e is CollectionEntry => !!e) : []),
		[block, tappers, collectionMap],
	);
	const totals = useMemo(() => sumCollections(entries), [entries]);

	const renderItem = useCallback(
		({ item }: { item: Worker }) => <TapperCollectionRow worker={item} entry={block ? collectionMap.get(collectionKey(block.id, item.id)) ?? null : null} onOpen={setTarget} />,
		[block, collectionMap],
	);

	const goBack = () => (router.canGoBack() ? router.back() : router.replace("/collection"));

	if (!block) {
		return (
			<Screen header={<AppHeader title={t("collection.notFound")} onBack={goBack} />}>
				<EmptyState icon="alert-circle" title={t("collection.notFound")} />
			</Screen>
		);
	}

	return (
		<Screen header={<AppHeader title={`${block.code} · ${block.name}`} subtitle={t("collection.progress", { done: entries.length, total: tappers.length })} onBack={goBack} />}>
			<FlatList
				data={tappers}
				keyExtractor={(w) => w.id}
				renderItem={renderItem}
				contentContainerStyle={styles.list}
				ItemSeparatorComponent={Separator}
				ListHeaderComponent={
					<View>
						<CollectionTotalsCard totals={totals} />
						<SectionTitle title={t("blocks.workersCount", { count: tappers.length })} />
					</View>
				}
				ListEmptyComponent={<EmptyState icon="users" title={t("collection.emptyTitle")} body={t("collection.emptyBody")} />}
			/>
			<CollectionSheet
				key={target?.id ?? "none"}
				blockId={block.id}
				worker={target}
				existing={target ? collectionMap.get(collectionKey(block.id, target.id)) ?? null : null}
				onClose={() => setTarget(null)}
			/>
		</Screen>
	);
}

function Separator() {
	return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
	list: { padding: spacing.lg, paddingBottom: spacing.xxxl },
	separator: { height: spacing.md },
});
