import { useCallback } from "react";

import { showToast } from "@/common/hooks/useToast";
import { useT } from "@/common/i18n";
import { enqueue } from "@/common/sync/syncEngine";
import { currentDay, isPastDay } from "@/modules/centre/store/centreDayStore";
import type { ChemicalUsagePayload, Requisition, RequisitionPayload, RequisitionReceivePayload, StockItem } from "@/modules/centre/types/centreDay";

import { formatQty } from "../utils/stockFormat";

// Usage, material requests and receipts are queued like the rest of the centre's day, so they work offline
export function useStockActions() {
	const t = useT();

	const canAct = useCallback(() => {
		if (!isPastDay()) return true;
		showToast(t("day.viewOnly"), "warning");
		return false;
	}, [t]);

	const recordUsage = useCallback(
		async (item: StockItem, quantity: number, note: string): Promise<boolean> => {
			const day = currentDay();
			if (!day || !canAct()) return false;
			const latest = day.stock?.items.find((i) => i.chemical_id === item.chemical_id) ?? item;
			if (quantity > latest.balance + 0.0001) {
				showToast(t("stock.notEnough", { qty: formatQty(Math.max(latest.balance, 0)), unit: item.unit, item: item.name }), "danger");
				return false;
			}
			const payload: ChemicalUsagePayload = { cc_id: day.centre.id, chemical_id: item.chemical_id, quantity, date: day.date, note: note.trim() || null };
			try {
				await enqueue("chemical_usage", payload);
			} catch {
				showToast(t("errors.saveFailed"), "danger");
				return false;
			}
			showToast(t("stock.usageSaved", { qty: formatQty(quantity), unit: item.unit, item: item.name }), "success");
			return true;
		},
		[canAct, t],
	);

	const requestMaterials = useCallback(
		async (lines: RequisitionPayload["lines"], note: string): Promise<boolean> => {
			const day = currentDay();
			if (!day || !canAct()) return false;
			if (lines.length === 0) {
				showToast(t("stock.requestEmpty"), "warning");
				return false;
			}
			const payload: RequisitionPayload = { cc_id: day.centre.id, date: day.date, note: note.trim() || null, lines };
			try {
				await enqueue("requisition", payload);
			} catch {
				showToast(t("errors.saveFailed"), "danger");
				return false;
			}
			showToast(t("stock.requestSent"), "success");
			return true;
		},
		[canAct, t],
	);

	const confirmReceived = useCallback(
		async (requisition: Requisition, lines: RequisitionReceivePayload["lines"]): Promise<boolean> => {
			const day = currentDay();
			if (!day || !canAct()) return false;
			const payload: RequisitionReceivePayload = { cc_id: day.centre.id, requisition_id: requisition.id, lines };
			try {
				await enqueue("requisition_receive", payload);
			} catch {
				showToast(t("errors.saveFailed"), "danger");
				return false;
			}
			showToast(t("stock.received"), "success");
			return true;
		},
		[canAct, t],
	);

	return { recordUsage, requestMaterials, confirmReceived };
}
