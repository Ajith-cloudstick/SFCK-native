import { useMemo } from "react";

import { useT } from "@/common/i18n";
import type { DayIndex } from "@/modules/centre/utils/dayIndex";
import { sumCollections } from "@/modules/collection/utils/collectionMath";

import type { PendingItem } from "../types/today";

export function useTodaySummary(index: DayIndex) {
	const t = useT();

	return useMemo(() => {
		const { day, attendance } = index;
		const records = day.workers.map((w) => attendance.get(w.id));
		const present = records.filter((r) => r?.status === "present").length;
		const waiting = records.filter((r) => r?.status === "pending").length;
		const notMarked = records.filter((r) => !r).length;
		const due = day.blocks.filter((b) => b.due);
		const dueAssigned = due.filter((b) => b.assigned_to).length;
		const uncollected = index.presentTappers.filter((w) => !index.collections.has(w.id)).length;
		const idleOthers = index.presentOthers.filter((w) => !index.muster.has(w.id)).length;

		const pending: PendingItem[] = [];
		if (notMarked > 0) pending.push({ id: "attendance", icon: "check-square", tone: "neutral", message: t("today.pendingAttendance", { count: notMarked }), target: "/attendance" });
		if (waiting > 0) pending.push({ id: "waiting", icon: "clock", tone: "warning", message: t("today.pendingWaiting", { count: waiting }), target: "/attendance" });
		due
			.filter((b) => !b.assigned_to)
			.forEach((b) => pending.push({ id: `block-${b.block_id}`, icon: "layers", tone: "danger", message: t("today.pendingBlock", { no: b.block_no }), target: "/blocks" }));
		if (idleOthers > 0) pending.push({ id: "muster", icon: "briefcase", tone: "info", message: t("today.pendingMuster", { count: idleOthers }), target: "/blocks" });
		if (uncollected > 0) pending.push({ id: "collection", icon: "droplet", tone: "info", message: t("today.pendingCollection", { count: uncollected }), target: "/collection" });

		return { present, waiting, notMarked, total: day.workers.length, due: due.length, dueAssigned, totals: sumCollections(day.collections), pending };
	}, [index, t]);
}
