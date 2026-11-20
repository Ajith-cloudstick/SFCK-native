import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { BottomSheet } from "@/common/components/ui/BottomSheet";
import { Button } from "@/common/components/ui/Button";
import { Chip } from "@/common/components/ui/Chip";
import { NumberField } from "@/common/components/ui/NumberField";
import { Text } from "@/common/components/ui/Text";
import { TextField } from "@/common/components/ui/TextField";
import { useT } from "@/common/i18n";
import { spacing } from "@/common/theme/tokens";
import { parseNumber } from "@/common/utils/format";
import type { StockItem } from "@/modules/centre/types/centreDay";

import { useStockActions } from "../hooks/useStockActions";
import { formatQty } from "../utils/stockFormat";

type UsageSheetProps = {
	visible: boolean;
	items: StockItem[];
	onClose: () => void;
};

export function UsageSheet({ visible, items, onClose }: UsageSheetProps) {
	const t = useT();
	const { recordUsage } = useStockActions();
	const [chosenId, setChosenId] = useState<number | null>(null);
	const [quantity, setQuantity] = useState("");
	const [note, setNote] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [busy, setBusy] = useState(false);
	const chemicalId = chosenId ?? items[0]?.chemical_id ?? null;
	const item = items.find((i) => i.chemical_id === chemicalId) ?? null;
	const value = parseNumber(quantity);
	const error = !submitted ? null : !item ? t("stock.chooseItem") : value === null || value <= 0 ? t("stock.quantityRequired") : null;

	const close = () => {
		setQuantity("");
		setNote("");
		setSubmitted(false);
		onClose();
	};

	const save = async () => {
		setSubmitted(true);
		if (!item || value === null || value <= 0 || busy) return;
		setBusy(true);
		const ok = await recordUsage(item, value, note);
		setBusy(false);
		if (ok) close();
	};

	return (
		<BottomSheet
			visible={visible}
			onClose={close}
			title={t("stock.recordUsage")}
			footer={<Button label={t("common.save")} icon="check" onPress={() => void save()} loading={busy} size="lg" fullWidth />}
		>
			<Text variant="label" tone="muted">
				{t("stock.item")}
			</Text>
			<View style={styles.chips}>
				{items.map((i) => (
					<Chip key={i.chemical_id} label={i.name} selected={i.chemical_id === chemicalId} onPress={() => setChosenId(i.chemical_id)} />
				))}
			</View>
			{item ? (
				<Text variant="caption" tone="muted" tabular>
					{t("stock.inStock", { qty: formatQty(item.balance), unit: item.unit })}
				</Text>
			) : null}
			<View style={styles.row}>
				<NumberField
					label={t("stock.quantity")}
					unit={item?.unit}
					value={quantity}
					onChangeText={setQuantity}
					placeholder="0"
					decimals={item?.kind !== "material"}
					error={error}
					returnKeyType="done"
				/>
			</View>
			<TextField label={t("stock.note")} value={note} onChangeText={setNote} returnKeyType="done" />
		</BottomSheet>
	);
}

const styles = StyleSheet.create({
	chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
	row: { flexDirection: "row" },
});
