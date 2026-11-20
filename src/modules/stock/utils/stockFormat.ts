import type { BadgeTone } from "@/common/components/ui/Badge";
import type { TranslationKey } from "@/common/i18n";
import type { RequisitionStatus } from "@/modules/centre/types/centreDay";

// Up to 3 decimals, trailing zeros dropped: 45.450 → "45.45", 10 → "10"
export function formatQty(value: number): string {
	return String(Number(value.toFixed(3)));
}

export const requisitionStatusLabel: Record<RequisitionStatus, TranslationKey> = {
	pending: "stock.statusPending",
	approved: "stock.statusApproved",
	rejected: "stock.statusRejected",
	issued: "stock.statusIssued",
	received: "stock.statusReceived",
};

export const requisitionStatusTone: Record<RequisitionStatus, BadgeTone> = {
	pending: "warning",
	approved: "info",
	rejected: "danger",
	issued: "brand",
	received: "success",
};
