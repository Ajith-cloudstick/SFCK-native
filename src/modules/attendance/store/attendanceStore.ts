import { useMemo } from "react";
import { create } from "zustand";

import { isAfterLateCutoff } from "@/common/utils/time";
import { useSessionStore } from "@/modules/session/store/sessionStore";

import { demoWorkers } from "../demo/demo-workers";
import type { MarkResult, Worker } from "../types/worker";

type AttendanceState = {
	workers: Worker[];
	toggle: (workerId: string) => MarkResult | null;
	transfer: (workerId: string, estateId: string, centreId: string) => void;
};

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
	workers: demoWorkers,
	toggle: (workerId) => {
		const current = get().workers.find((w) => w.id === workerId);
		if (!current) return null;
		const present = current.status !== "present";
		const late = present && isAfterLateCutoff();
		const worker: Worker = {
			...current,
			status: present ? "present" : "pending",
			isLate: late,
			markedAt: present ? new Date().toISOString() : null,
		};
		set({ workers: get().workers.map((w) => (w.id === workerId ? worker : w)) });
		return { worker, present, late };
	},
	transfer: (workerId, estateId, centreId) =>
		set({ workers: get().workers.map((w) => (w.id === workerId ? { ...w, estateId, centreId } : w)) }),
}));

export function useCentreWorkers(): Worker[] {
	const workers = useAttendanceStore((s) => s.workers);
	const centreId = useSessionStore((s) => s.centreId);
	return useMemo(() => workers.filter((w) => w.centreId === centreId), [workers, centreId]);
}

export function useWorkerMap(): Map<string, Worker> {
	const workers = useAttendanceStore((s) => s.workers);
	return useMemo(() => new Map(workers.map((w) => [w.id, w])), [workers]);
}
