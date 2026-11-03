import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { BottomSheet } from "@/common/components/ui/BottomSheet";
import { Button } from "@/common/components/ui/Button";
import { NumberField } from "@/common/components/ui/NumberField";
import { SegmentedControl } from "@/common/components/ui/SegmentedControl";
import { Text } from "@/common/components/ui/Text";
import { TextField } from "@/common/components/ui/TextField";
import { useT } from "@/common/i18n";
import { spacing } from "@/common/theme/tokens";
import { istDate } from "@/common/utils/ist";

import { useWorkerRequest } from "../hooks/useWorkerRequest";
import type { WorkerSource } from "../types/workers";
import { addDays } from "../utils/workerFormat";
import { SourceChips } from "./SourceChips";

type AskWorkersSheetProps = {
	visible: boolean;
	estateId: number | null;
	onClose: () => void;
};

type AskDay = "today" | "tomorrow";

// A centre short of people says how many it needs and from where; a sender there sends them
export function AskWorkersSheet({ visible, estateId, onClose }: AskWorkersSheetProps) {
	const t = useT();
	const { ask } = useWorkerRequest();
	const [tappers, setTappers] = useState("");
	const [general, setGeneral] = useState("");
	const [when, setWhen] = useState<AskDay>("today");
	const [note, setNote] = useState("");
	const [from, setFrom] = useState<WorkerSource>({ source: "own" });
	const [busy, setBusy] = useState(false);

	const close = () => {
		setTappers("");
		setGeneral("");
		setWhen("today");
		setNote("");
		setFrom({ source: "own" });
		onClose();
	};

	const send = async () => {
		if (busy) return;
		const today = istDate();
		setBusy(true);
		const ok = await ask(when === "today" ? today : addDays(today, 1), Number(tappers) || 0, Number(general) || 0, note, from);
		setBusy(false);
		if (ok) close();
	};

	return (
		<BottomSheet
			visible={visible}
			onClose={close}
			title={t("workers.ask")}
			footer={<Button label={t("workers.sendRequest")} icon="upload-cloud" onPress={() => void send()} loading={busy} size="lg" fullWidth />}
		>
			<View style={styles.row}>
				<NumberField label={t("workers.tappers")} value={tappers} onChangeText={setTappers} placeholder="0" decimals={false} />
				<NumberField label={t("workers.general")} value={general} onChangeText={setGeneral} placeholder="0" decimals={false} />
			</View>
			<Text variant="label" tone="muted">
				{t("workers.forDay")}
			</Text>
			<SegmentedControl
				value={when}
				onChange={setWhen}
				options={[
					{ value: "today", label: t("workers.today") },
					{ value: "tomorrow", label: t("workers.tomorrow") },
				]}
			/>
			<SourceChips value={from} onChange={setFrom} estateId={estateId} />
			<TextField label={t("workers.note")} value={note} onChangeText={setNote} placeholder={t("workers.notePlaceholder")} returnKeyType="done" />
		</BottomSheet>
	);
}

const styles = StyleSheet.create({
	row: { flexDirection: "row", gap: spacing.md },
});
