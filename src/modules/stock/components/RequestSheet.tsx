import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { BottomSheet } from "@/common/components/ui/BottomSheet";
import { Button } from "@/common/components/ui/Button";
import { NumberField } from "@/common/components/ui/NumberField";
import { Text } from "@/common/components/ui/Text";
import { TextField } from "@/common/components/ui/TextField";
import { useT } from "@/common/i18n";
import { parseNumber } from "@/common/utils/format";
import type { StockItem } from "@/modules/centre/types/centreDay";

import { useStockActions } from "../hooks/useStockActions";

type RequestSheetProps = {
	visible: boolean;
	items: StockItem[];
	onClose: () => void;
};

// One quantity box per item; items left empty are not asked for
export function RequestSheet({ visible, items, onClose }: RequestSheetProps) {
	const t = useT();
	const { requestMaterials } = useStockActions();
	const [quantities, setQuantities] = useState<Record<number, string>>({});
	const [note, setNote] = useState("");
	const [busy, setBusy] = useState(false);

	const close = () => {
		setQuantities({});
		setNote("");
		onClose();
	};

	const send = async () => {
		if (busy) return;
		const lines = items.flatMap((i) => {
			const qty = parseNumber(quantities[i.chemical_id] ?? "");
			return qty !== null && qty > 0 ? [{ item_id: i.chemical_id, qty }] : [];
		});
		setBusy(true);
		const ok = await requestMaterials(lines, note);
		setBusy(false);
		if (ok) close();
	};

	return (
		<BottomSheet
			visible={visible}
			onClose={close}
			title={t("stock.requestMaterials")}
			subtitle={t("stock.requestHint")}
			footer={<Button label={t("stock.requestSend")} icon="upload-cloud" onPress={() => void send()} loading={busy} size="lg" fullWidth />}
		>
			{items.map((i) => (
				<View key={i.chemical_id} style={styles.row}>
					<NumberField
						label={i.name}
						unit={i.unit}
						value={quantities[i.chemical_id] ?? ""}
						onChangeText={(v) => setQuantities((q) => ({ ...q, [i.chemical_id]: v }))}
						placeholder="0"
						decimals={i.kind !== "material"}
					/>
				</View>
			))}
			{items.length === 0 ? (
				<Text variant="body" tone="muted">
					{t("stock.noItems")}
				</Text>
			) : null}
			<TextField label={t("stock.note")} value={note} onChangeText={setNote} returnKeyType="done" />
		</BottomSheet>
	);
}

const styles = StyleSheet.create({
	row: { flexDirection: "row" },
});
