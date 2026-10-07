import { StyleSheet } from "react-native";

import { BottomSheet } from "@/common/components/ui/BottomSheet";
import { Card } from "@/common/components/ui/Card";
import { ListRow } from "@/common/components/ui/ListRow";
import { useT } from "@/common/i18n";
import type { Worker } from "@/modules/attendance/types/worker";
import { useSessionStore } from "@/modules/session/store/sessionStore";
import type { CollectionCentre } from "@/modules/session/types/session";

type TransferSheetProps = {
	worker: Worker | null;
	onClose: () => void;
	onPick: (worker: Worker, centre: CollectionCentre) => void;
};

export function TransferSheet({ worker, onClose, onPick }: TransferSheetProps) {
	const t = useT();
	const centres = useSessionStore((s) => s.centres);
	const estates = useSessionStore((s) => s.estates);
	const options = centres.filter((c) => c.id !== worker?.centreId);

	return (
		<BottomSheet visible={!!worker} onClose={onClose} title={t("blocks.transferTitle", { name: worker?.name ?? "" })} subtitle={t("blocks.transferSubtitle")}>
			<Card padded={false} style={styles.group}>
				{options.map((centre, index) => (
					<ListRow
						key={centre.id}
						icon="map-pin"
						title={centre.name}
						subtitle={`${centre.code} · ${estates.find((e) => e.id === centre.estateId)?.name ?? ""}`}
						divider={index < options.length - 1}
						chevron
						onPress={() => worker && onPick(worker, centre)}
					/>
				))}
			</Card>
		</BottomSheet>
	);
}

const styles = StyleSheet.create({
	group: { overflow: "hidden" },
});
