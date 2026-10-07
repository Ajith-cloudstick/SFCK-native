import { useMemo } from "react";
import { StyleSheet } from "react-native";

import { Avatar } from "@/common/components/ui/Avatar";
import { Badge } from "@/common/components/ui/Badge";
import { BottomSheet } from "@/common/components/ui/BottomSheet";
import { Card } from "@/common/components/ui/Card";
import { EmptyState } from "@/common/components/ui/EmptyState";
import { ListRow } from "@/common/components/ui/ListRow";
import { useT } from "@/common/i18n";
import { initialsOf } from "@/common/utils/format";
import type { DayBlock, Worker } from "@/modules/centre/types/centreDay";
import { workerCode, type DayIndex } from "@/modules/centre/utils/dayIndex";

type AssignTapperSheetProps = {
	block: DayBlock | null;
	index: DayIndex;
	onClose: () => void;
	onPick: (block: DayBlock, worker: Worker) => void;
};

export function AssignTapperSheet({ block, index, onClose, onPick }: AssignTapperSheetProps) {
	const t = useT();

	// Present tappers without a block today, the block's fixed tapper first
	const options = useMemo(() => {
		const free = index.presentTappers.filter((w) => !index.blockAssignment.has(w.id));
		return [...free].sort((a, b) => Number(b.id === block?.tapper_id) - Number(a.id === block?.tapper_id));
	}, [index, block]);

	return (
		<BottomSheet visible={!!block} onClose={onClose} title={t("blocks.assignTitle", { no: block?.block_no ?? "" })} subtitle={t("blocks.assignSubtitle")}>
			{options.length === 0 ? (
				<EmptyState icon="users" title={t("blocks.noFreeTappers")} body={t("blocks.noFreeTappersBody")} />
			) : (
				<Card padded={false} style={styles.group}>
					{options.map((worker, i) => (
						<ListRow
							key={worker.id}
							leading={<Avatar initials={initialsOf(worker.name)} small active={worker.id === block?.tapper_id} />}
							title={worker.name}
							subtitle={workerCode(worker)}
							trailing={worker.id === block?.tapper_id ? <Badge label={t("blocks.fixedTapper")} tone="brand" /> : null}
							divider={i < options.length - 1}
							chevron
							onPress={() => block && onPick(block, worker)}
						/>
					))}
				</Card>
			)}
		</BottomSheet>
	);
}

const styles = StyleSheet.create({
	group: { overflow: "hidden" },
});
