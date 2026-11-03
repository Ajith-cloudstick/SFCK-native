import { useCallback } from "react";

import { showToast } from "@/common/hooks/useToast";
import { useT } from "@/common/i18n";
import { enqueue } from "@/common/sync/syncEngine";
import { currentDay, isPastDay } from "@/modules/centre/store/centreDayStore";
import type { WorkerRequest, WorkerRequestCancelPayload, WorkerRequestPayload } from "@/modules/centre/types/centreDay";

import type { WorkerSource } from "../types/workers";

// Asking for workers and cancelling are queued like the rest of the day, so a centre can ask while offline
export function useWorkerRequest() {
	const t = useT();

	const ask = useCallback(
		async (date: string, tappers: number, general: number, note: string, from: WorkerSource): Promise<boolean> => {
			const day = currentDay();
			if (!day) return false;
			if (isPastDay()) {
				showToast(t("day.viewOnly"), "warning");
				return false;
			}
			if (tappers + general <= 0) {
				showToast(t("workers.askEmpty"), "warning");
				return false;
			}
			const payload: WorkerRequestPayload = { cc_id: day.centre.id, date, tappers_needed: tappers, general_needed: general, note: note.trim() || null, ...from };
			try {
				await enqueue("worker_request", payload);
			} catch {
				showToast(t("errors.saveFailed"), "danger");
				return false;
			}
			showToast(t("workers.asked"), "success");
			return true;
		},
		[t],
	);

	const cancel = useCallback(
		async (request: WorkerRequest): Promise<boolean> => {
			const day = currentDay();
			if (!day || request.id === 0) return false;
			const payload: WorkerRequestCancelPayload = { cc_id: day.centre.id, request_id: request.id };
			try {
				await enqueue("worker_request_cancel", payload);
			} catch {
				showToast(t("errors.saveFailed"), "danger");
				return false;
			}
			showToast(t("workers.cancelled"));
			return true;
		},
		[t],
	);

	return { ask, cancel };
}
