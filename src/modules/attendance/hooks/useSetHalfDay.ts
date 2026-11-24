import { useCallback } from "react";

import { showToast } from "@/common/hooks/useToast";
import { useT } from "@/common/i18n";
import { enqueue } from "@/common/sync/syncEngine";
import { currentDay, isPastDay } from "@/modules/centre/store/centreDayStore";
import type { HalfDayPayload, Worker } from "@/modules/centre/types/centreDay";
import { buildDayIndex } from "@/modules/centre/utils/dayIndex";

// Marks a present worker's day as a half day (with who did the other half, if known), or puts it back to a full day.
// It is queued like any attendance, so it works offline and goes to the server in order, after the attendance itself.
export function useSetHalfDay() {
	const t = useT();

	return useCallback(
		async (worker: Worker, halfDay: boolean, coveredBy: number | null): Promise<boolean> => {
			if (isPastDay()) {
				showToast(t("day.viewOnly"), "warning");
				return false;
			}
			const day = currentDay();
			if (!day) return false;
			const record = buildDayIndex(day).attendance.get(worker.id);
			if (!record || record.status !== "present") {
				showToast(t("attendance.halfDayNeedsPresent", { name: worker.name }), "warning");
				return false;
			}
			try {
				const payload: HalfDayPayload = { employee_id: worker.id, cc_id: day.centre.id, date: day.date, half_day: halfDay, covered_by: halfDay ? coveredBy : null };
				await enqueue("half_day", payload);
			} catch {
				showToast(t("errors.saveFailed"), "danger");
				return false;
			}
			showToast(t(halfDay ? "attendance.markedHalfDay" : "attendance.backToFullDay", { name: worker.name }), "success");
			return true;
		},
		[t],
	);
}
