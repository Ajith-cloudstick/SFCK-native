import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { BottomSheet } from "@/common/components/ui/BottomSheet";
import { Button } from "@/common/components/ui/Button";
import { Chip } from "@/common/components/ui/Chip";
import { EmptyState } from "@/common/components/ui/EmptyState";
import { Text } from "@/common/components/ui/Text";
import { TextField } from "@/common/components/ui/TextField";
import { useT } from "@/common/i18n";
import { spacing } from "@/common/theme/tokens";
import { useCentreDayStore } from "@/modules/centre/store/centreDayStore";
import type { Worker } from "@/modules/centre/types/centreDay";

type MusterSheetProps = {
	worker: Worker | null;
	onClose: () => void;
	onSave: (worker: Worker, workNature: string, location: string) => Promise<boolean>;
};

export function MusterSheet({ worker, onClose, onSave }: MusterSheetProps) {
	const t = useT();
	const natures = useCentreDayStore((s) => s.workNatures);
	const [nature, setNature] = useState<string | null>(null);
	const [location, setLocation] = useState("");
	const [busy, setBusy] = useState(false);

	const close = () => {
		setNature(null);
		setLocation("");
		onClose();
	};

	const save = async () => {
		if (!worker || !nature || busy) return;
		setBusy(true);
		const ok = await onSave(worker, nature, location);
		setBusy(false);
		if (ok) close();
	};

	return (
		<BottomSheet
			visible={!!worker}
			onClose={close}
			title={t("blocks.musterTitle", { name: worker?.name ?? "" })}
			subtitle={t("blocks.musterSubtitle")}
			footer={<Button label={t("common.save")} onPress={() => void save()} disabled={!nature} loading={busy} size="lg" fullWidth />}
		>
			<Text variant="label" tone="muted">
				{t("blocks.workNature")}
			</Text>
			{natures.length === 0 ? (
				<EmptyState icon="wifi-off" title={t("blocks.noNatures")} body={t("blocks.noNaturesBody")} />
			) : (
				<View style={styles.chips}>
					{natures.map((n) => (
						<Chip key={n} label={n} selected={nature === n} onPress={() => setNature(n)} />
					))}
				</View>
			)}
			<TextField label={t("blocks.location")} icon="map-pin" value={location} onChangeText={setLocation} placeholder={t("blocks.locationPlaceholder")} returnKeyType="done" />
		</BottomSheet>
	);
}

const styles = StyleSheet.create({
	chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
});
