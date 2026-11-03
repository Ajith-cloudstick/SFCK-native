import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { BottomSheet } from "@/common/components/ui/BottomSheet";
import { Button } from "@/common/components/ui/Button";
import { NumberField } from "@/common/components/ui/NumberField";
import { useT } from "@/common/i18n";
import { parseNumber } from "@/common/utils/format";
import type { Requisition } from "@/modules/centre/types/centreDay";

import { useStockActions } from "../hooks/useStockActions";
import { formatQty } from "../utils/stockFormat";

type ReceiveSheetProps = {
	requisition: Requisition | null;
	onClose: () => void;
};

// Prefilled with what was issued; the centre changes a line only when less arrived
export function ReceiveSheet({ requisition, onClose }: ReceiveSheetProps) {
	const t = useT();
	const { confirmReceived } = useStockActions();
	const [quantities, setQuantities] = useState<Record<number, string>>(() =>
		Object.fromEntries((requisition?.lines ?? []).map((l) => [l.id, formatQty(l.qty_approved ?? l.qty_requested)])),
	);
	const [busy, setBusy] = useState(false);
	const lines = requisition?.lines ?? [];
	const errorFor = (issued: number, text: string | undefined) => {
		const value = parseNumber(text ?? "");
		if (value === null || value < 0) return t("stock.quantityRequired");
		return value > issued + 0.0001 ? t("stock.receiveTooMuch", { qty: formatQty(issued) }) : null;
	};
	const invalid = lines.some((l) => errorFor(l.qty_approved ?? l.qty_requested, quantities[l.id]) !== null);

	const save = async () => {
		if (!requisition || invalid || busy) return;
		setBusy(true);
		const ok = await confirmReceived(
			requisition,
			lines.map((l) => ({ id: l.id, qty: parseNumber(quantities[l.id] ?? "") ?? 0 })),
		);
		setBusy(false);
		if (ok) onClose();
	};

	return (
		<BottomSheet
			visible={!!requisition}
			onClose={onClose}
			title={t("stock.receiveTitle")}
			subtitle={t("stock.receiveHint")}
			footer={<Button label={t("stock.receiveTitle")} icon="check" onPress={() => void save()} disabled={invalid} loading={busy} size="lg" fullWidth />}
		>
			{lines.map((l) => {
				const issued = l.qty_approved ?? l.qty_requested;
				return (
					<View key={l.id} style={styles.row}>
						<NumberField
							label={`${l.item_name} · ${t("stock.receiveIssued", { qty: formatQty(issued), unit: l.unit })}`}
							unit={l.unit}
							value={quantities[l.id] ?? ""}
							onChangeText={(v) => setQuantities((q) => ({ ...q, [l.id]: v }))}
							error={errorFor(issued, quantities[l.id])}
						/>
					</View>
				);
			})}
		</BottomSheet>
	);
}

const styles = StyleSheet.create({
	row: { flexDirection: "row" },
});
