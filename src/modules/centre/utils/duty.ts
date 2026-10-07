import { istMinutes, minutesOf } from "@/common/utils/ist";

import type { Arrival, CentreDay, DutyTiming, DutyType, Worker } from "../types/centreDay";

export function dutyTypeOf(worker: Pick<Worker, "work_type" | "category">): DutyType {
	const workType = worker.work_type.toLowerCase();
	const category = worker.category.toLowerCase();
	if (workType === "tapper") return "tapper";
	if (workType === "security") return "protection";
	if (category === "casual") return "casual";
	if (category === "dependent") return "dependent";
	return "general";
}

export function timingFor(day: CentreDay, duty: DutyType): DutyTiming | null {
	return day.duty_timings.find((d) => d.duty_type === duty) ?? day.duty_timings.find((d) => d.duty_type === "general") ?? null;
}

// Mirrors ClassifyArrival on the server so offline results match
export function classifyArrival(timing: DutyTiming | null, at: Date): Arrival {
	const now = istMinutes(at);
	const normal = minutesOf(timing?.normal_until);
	if (!timing || normal < 0 || now <= normal) return { status: "present", late: false, blocked: false, closesAt: timing?.approval_until ?? null };
	if (timing.approval_until === null) return { status: "pending", late: true, blocked: false, closesAt: null };
	const limit = minutesOf(timing.approval_until);
	if (limit >= 0 && now > limit) return { status: "pending", late: true, blocked: true, closesAt: timing.approval_until };
	return { status: "pending", late: true, blocked: false, closesAt: timing.approval_until };
}
