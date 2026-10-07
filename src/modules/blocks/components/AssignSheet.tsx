import { StyleSheet } from "react-native";

import { SectionTitle } from "@/common/components/layout/SectionTitle";
import { BottomSheet } from "@/common/components/ui/BottomSheet";
import { Card } from "@/common/components/ui/Card";
import { ListRow } from "@/common/components/ui/ListRow";
import { useT } from "@/common/i18n";
import type { Worker } from "@/modules/attendance/types/worker";

import { useCentreWorkItems, workItemTitle } from "../store/blocksStore";
import type { WorkItem } from "../types/workItem";

type AssignSheetProps = {
	worker: Worker | null;
	onClose: () => void;
	onPick: (worker: Worker, item: WorkItem) => void;
};

export function AssignSheet({ worker, onClose, onPick }: AssignSheetProps) {
	const t = useT();
	const items = useCentreWorkItems();
	const tapping = items.filter((i) => i.kind === "tapping");
	const general = items.filter((i) => i.kind === "general");

	const renderGroup = (group: WorkItem[]) => (
		<Card padded={false} style={styles.group}>
			{group.map((item, index) => (
				<ListRow
					key={item.id}
					icon={item.kind === "tapping" ? "layers" : "tool"}
					title={workItemTitle(item)}
					subtitle={
						item.kind === "tapping"
							? `${t("blocks.trees", { count: item.trees })} · ${t("blocks.workersCount", { count: item.workerIds.length })}`
							: t("blocks.workersCount", { count: item.workerIds.length })
					}
					divider={index < group.length - 1}
					chevron
					onPress={() => worker && onPick(worker, item)}
				/>
			))}
		</Card>
	);

	return (
		<BottomSheet visible={!!worker} onClose={onClose} title={t("blocks.assignTitle", { name: worker?.name ?? "" })} subtitle={t("blocks.assignSubtitle")}>
			<SectionTitle title={t("blocks.tapping")} />
			{renderGroup(tapping)}
			<SectionTitle title={t("blocks.general")} />
			{renderGroup(general)}
		</BottomSheet>
	);
}

const styles = StyleSheet.create({
	group: { overflow: "hidden" },
});
