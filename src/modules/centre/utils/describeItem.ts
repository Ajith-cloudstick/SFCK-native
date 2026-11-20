import type { TranslationKey, TranslationParams } from "@/common/i18n";
import type { OutboxItem } from "@/common/sync/types";
import { istClock } from "@/common/utils/ist";

import type { CentreDay } from "../types/centreDay";

type Translate = (key: TranslationKey, params?: TranslationParams) => string;

// Human line for an outbox entry in the sync centre
export function describeItem(item: OutboxItem, day: CentreDay | null, t: Translate): { title: string; subtitle: string } {
	const p = item.payload;
	const worker = day?.workers.find((w) => w.id === p.employee_id);
	const name = worker?.name ?? t("sync.worker", { id: String(p.employee_id ?? "") });
	const time = istClock(item.createdAt);
	if (item.type === "chemical_usage") {
		const stockItem = day?.stock?.items.find((i) => i.chemical_id === p.chemical_id);
		return { title: t("sync.typeUsage", { item: stockItem?.name ?? "", qty: String(p.quantity ?? ""), unit: stockItem?.unit ?? "" }), subtitle: time };
	}
	if (item.type === "requisition") return { title: t("sync.typeRequisition", { count: Array.isArray(p.lines) ? p.lines.length : 0 }), subtitle: time };
	if (item.type === "requisition_receive") return { title: t("sync.typeReceive"), subtitle: time };
	if (item.type === "worker_request") {
		return { title: t("sync.typeWorkerRequest", { tappers: Number(p.tappers_needed ?? 0), general: Number(p.general_needed ?? 0) }), subtitle: time };
	}
	if (item.type === "worker_request_cancel") return { title: t("sync.typeWorkerCancel"), subtitle: time };
	if (item.type === "attendance") return { title: t("sync.typeAttendance", { name }), subtitle: time };
	if (item.type === "collection") {
		return { title: t("sync.typeCollection", { name }), subtitle: `${time} · ${t("collection.summaryLine", { latex: String(p.latex_kg ?? 0), drc: String(p.sample_drc ?? 0), scrap: String(p.scrap_kg ?? 0) })}` };
	}
	const block = day?.blocks.find((b) => b.block_id === p.block_id);
	const target = p.block_id ? t("blocks.blockNo", { no: block?.block_no ?? String(p.block_id) }) : String(p.work_nature ?? "");
	return { title: t("sync.typeAssignment", { name, target }), subtitle: time };
}
