import { useCallback, useMemo, useState } from "react";
import { FlatList, LayoutAnimation, Pressable, RefreshControl, StyleSheet, View } from "react-native";

import { Screen } from "@/common/components/layout/Screen";
import { useTabBarSpace } from "@/common/components/layout/TabBar";
import { EmptyState } from "@/common/components/ui/EmptyState";
import { FadeIn } from "@/common/components/ui/FadeIn";
import { SegmentedControl } from "@/common/components/ui/SegmentedControl";
import { Text } from "@/common/components/ui/Text";
import { useT } from "@/common/i18n";
import { borderWidth, colors, radius, sizes, spacing } from "@/common/theme/tokens";
import { CentreHeader } from "@/modules/centre/components/CentreHeader";
import { DayGate } from "@/modules/centre/components/DayGate";
import { useSyncRefresh } from "@/modules/centre/hooks/useCentreSync";
import type { DayBlock, Worker } from "@/modules/centre/types/centreDay";
import type { DayIndex } from "@/modules/centre/utils/dayIndex";

import { AssignTapperSheet } from "../components/AssignTapperSheet";
import { BlockCard } from "../components/BlockCard";
import { MusterRow } from "../components/MusterRow";
import { MusterSheet } from "../components/MusterSheet";
import { useAssign } from "../hooks/useAssign";

type Segment = "blocks" | "work";

export default function BlocksPage() {
	return (
		<Screen header={<CentreHeader />}>
			<DayGate>{(index) => <BlocksList index={index} />}</DayGate>
		</Screen>
	);
}

function BlocksList({ index }: { index: DayIndex }) {
	const t = useT();
	const bottomSpace = useTabBarSpace();
	const refresh = useSyncRefresh();
	const { assignBlock, assignMuster } = useAssign();
	const [segment, setSegment] = useState<Segment>("blocks");
	const [showAll, setShowAll] = useState(false);
	const [blockTarget, setBlockTarget] = useState<DayBlock | null>(null);
	const [musterTarget, setMusterTarget] = useState<Worker | null>(null);
	const blocks = index.day.blocks;
	const due = blocks.filter((b) => b.due);
	const dueAssigned = due.filter((b) => b.assigned_to).length;
	const progress = due.length ? dueAssigned / due.length : 1;

	const visibleBlocks = useMemo(() => {
		const list = showAll ? blocks : blocks.filter((b) => b.due || b.assigned_to);
		return [...list].sort((a, b) => Number(b.due) - Number(a.due) || a.block_no.localeCompare(b.block_no, undefined, { numeric: true }));
	}, [blocks, showAll]);

	const animate = () => LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

	const pickTapper = async (block: DayBlock, worker: Worker) => {
		if (await assignBlock(block, worker)) setBlockTarget(null);
	};

	const renderBlock = useCallback(({ item }: { item: DayBlock }) => <BlockCard block={item} onAssign={setBlockTarget} />, []);
	const renderWorker = useCallback(({ item }: { item: Worker }) => <MusterRow worker={item} assignment={index.muster.get(item.id)} onAssign={setMusterTarget} />, [index]);

	const listProps = {
		ItemSeparatorComponent: Separator,
		style: styles.list,
		contentContainerStyle: [styles.listContent, { paddingBottom: bottomSpace }],
		refreshControl: <RefreshControl {...refresh} colors={[colors.brand[700]]} tintColor={colors.brand[700]} />,
	};

	return (
		<FadeIn style={styles.flex}>
			<View style={styles.toolbar}>
				<SegmentedControl
					value={segment}
					onChange={(next) => {
						animate();
						setSegment(next);
					}}
					options={[
						{ value: "blocks", label: t("blocks.segmentBlocks") },
						{ value: "work", label: t("blocks.segmentWork") },
					]}
				/>
				{segment === "blocks" ? (
					<View style={styles.summary}>
						<View style={styles.summaryRow}>
							<Text variant="label" tone="muted" tabular>
								{t("blocks.summary", { due: due.length, assigned: dueAssigned })}
							</Text>
							{due.length > 0 && dueAssigned === due.length ? (
								<Text variant="label" tone="success">
									{t("blocks.allAssigned")}
								</Text>
							) : null}
						</View>
						<View style={styles.track}>
							<View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} />
						</View>
					</View>
				) : null}
			</View>

			{segment === "blocks" ? (
				<FlatList
					{...listProps}
					data={visibleBlocks}
					keyExtractor={(item) => String(item.block_id)}
					renderItem={renderBlock}
					ListEmptyComponent={<EmptyState icon="layers" title={t("blocks.noBlocks")} />}
					ListFooterComponent={
						blocks.length > due.length ? (
							<Pressable
								onPress={() => {
									animate();
									setShowAll((v) => !v);
								}}
								style={styles.more}
								accessibilityRole="button"
							>
								<Text variant="label" tone="brand">
									{showAll ? t("blocks.showDue") : t("blocks.showAll", { count: blocks.length })}
								</Text>
							</Pressable>
						) : null
					}
				/>
			) : (
				<FlatList
					{...listProps}
					data={index.presentOthers}
					keyExtractor={(item) => String(item.id)}
					renderItem={renderWorker}
					ListEmptyComponent={<EmptyState icon="briefcase" title={t("blocks.noMuster")} />}
				/>
			)}

			<AssignTapperSheet block={blockTarget} index={index} onClose={() => setBlockTarget(null)} onPick={(b, w) => void pickTapper(b, w)} />
			<MusterSheet worker={musterTarget} onClose={() => setMusterTarget(null)} onSave={assignMuster} />
		</FadeIn>
	);
}

function Separator() {
	return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
	flex: { flex: 1 },
	toolbar: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md, gap: spacing.md },
	summary: { gap: spacing.sm },
	summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
	track: { height: sizes.progress / 2, borderRadius: radius.pill, backgroundColor: colors.border, overflow: "hidden" },
	fill: { height: "100%", borderRadius: radius.pill, backgroundColor: colors.brand[600] },
	list: { flex: 1, backgroundColor: colors.surface, borderTopWidth: borderWidth.hairline, borderTopColor: colors.border },
	listContent: { flexGrow: 1 },
	separator: { height: borderWidth.hairline, backgroundColor: colors.border, marginLeft: spacing.lg },
	more: { minHeight: sizes.touch, alignItems: "center", justifyContent: "center", marginTop: spacing.sm },
});
