import { useCallback } from "react";

import { showToast } from "@/common/hooks/useToast";
import { useT } from "@/common/i18n";
import { enqueue } from "@/common/sync/syncEngine";
import { istClock } from "@/common/utils/ist";
import { currentDay } from "@/modules/centre/store/centreDayStore";
import type { AttendancePayload, Worker } from "@/modules/centre/types/centreDay";
import { buildDayIndex } from "@/modules/centre/utils/dayIndex";
import { classifyArrival, dutyTypeOf, timingFor } from "@/modules/centre/utils/duty";

import type { MarkOutcome } from "../types/attendance";

const inFlight = new Set<number>();

// Same flow for tapping a row, scanning a card or typing an ID
export function useMarkWorker() {
	const t = useT();

	return useCallback(
		async (worker: Worker): Promise<MarkOutcome> => {
			const day = currentDay();
			if (!day || inFlight.has(worker.id)) return "unavailable";
			const existing = buildDayIndex(day).attendance.get(worker.id);
			if (existing) {
				showToast(t("attendance.alreadyMarked", { name: worker.name, time: istClock(existing.check_in) }));
				return "already";
			}
			const now = new Date();
			const arrival = classifyArrival(timingFor(day, dutyTypeOf(worker)), now);
			if (arrival.blocked) {
				showToast(t("attendance.closed", { name: worker.name, time: arrival.closesAt ?? "" }), "danger");
				return "blocked";
			}
			inFlight.add(worker.id);
			try {
				const payload: AttendancePayload = { employee_id: worker.id, cc_id: day.centre.id, device_time: now.toISOString() };
				await enqueue("attendance", payload);
			} catch {
				showToast(t("errors.saveFailed"), "danger");
				return "unavailable";
			} finally {
				inFlight.delete(worker.id);
			}
			if (arrival.status === "pending") {
				showToast(t("attendance.markedWaiting", { name: worker.name }), "warning");
				return "waiting";
			}
			showToast(t("attendance.markedPresent", { name: worker.name }), "success");
			return "marked";
		},
		[t],
	);
}
