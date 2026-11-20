import { useCallback } from "react";

import { showToast } from "@/common/hooks/useToast";
import { useT } from "@/common/i18n";
import { enqueue } from "@/common/sync/syncEngine";
import { currentDay, isPastDay } from "@/modules/centre/store/centreDayStore";
import type { BlockAssignmentPayload, DayBlock, MusterAssignmentPayload, Worker } from "@/modules/centre/types/centreDay";

export function useAssign() {
	const t = useT();

	const assignBlock = useCallback(
		async (block: DayBlock, worker: Worker): Promise<boolean> => {
			if (isPastDay()) {
				showToast(t("day.viewOnly"), "warning");
				return false;
			}
			const day = currentDay();
			if (!day) return false;
			const latest = day.blocks.find((b) => b.block_id === block.block_id);
			if (latest?.assigned_to) {
				showToast(t("blocks.alreadyAssigned", { no: block.block_no, name: latest.assigned_name ?? "" }), "warning");
				return false;
			}
			const payload: BlockAssignmentPayload = { cc_id: day.centre.id, employee_id: worker.id, date: day.date, block_id: block.block_id };
			try {
				await enqueue("assignment", payload);
			} catch {
				showToast(t("errors.saveFailed"), "danger");
				return false;
			}
			showToast(t("blocks.assigned", { name: worker.name, no: block.block_no }), "success");
			return true;
		},
		[t],
	);

	const assignMuster = useCallback(
		async (worker: Worker, workNature: string, location: string): Promise<boolean> => {
			if (isPastDay()) {
				showToast(t("day.viewOnly"), "warning");
				return false;
			}
			const day = currentDay();
			if (!day) return false;
			const payload: MusterAssignmentPayload = { cc_id: day.centre.id, employee_id: worker.id, date: day.date, work_nature: workNature, location: location.trim() || null };
			try {
				await enqueue("assignment", payload);
			} catch {
				showToast(t("errors.saveFailed"), "danger");
				return false;
			}
			showToast(t("blocks.musterAssigned", { name: worker.name, work: workNature }), "success");
			return true;
		},
		[t],
	);

	return { assignBlock, assignMuster };
}
