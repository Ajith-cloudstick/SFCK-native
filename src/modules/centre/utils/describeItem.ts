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
	if (item.type === "attendance") return { title: t("sync.typeAttendance", { name }), subtitle: time };
	if (item.type === "collection") {
		return { title: t("sync.typeCollection", { name }), subtitle: `${time} · ${t("collection.summaryLine", { latex: String(p.latex_kg ?? 0), drc: String(p.sample_drc ?? 0), scrap: String(p.scrap_kg ?? 0) })}` };
	}
	const block = day?.blocks.find((b) => b.block_id === p.block_id);
	const target = p.block_id ? t("blocks.blockNo", { no: block?.block_no ?? String(p.block_id) }) : String(p.work_nature ?? "");
	return { title: t("sync.typeAssignment", { name, target }), subtitle: time };
}
