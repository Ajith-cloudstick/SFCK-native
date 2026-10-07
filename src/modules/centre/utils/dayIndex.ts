import type { Assignment, AttendanceRecord, CentreDay, Collection, Worker, WorkerState } from "../types/centreDay";
import { dutyTypeOf } from "./duty";

export type DayIndex = {
	day: CentreDay;
	attendance: Map<number, AttendanceRecord>;
	blockAssignment: Map<number, Assignment>;
	muster: Map<number, Assignment>;
	collections: Map<number, Collection[]>;
	workerById: Map<number, Worker>;
	presentTappers: Worker[];
	presentOthers: Worker[];
};

export function buildDayIndex(day: CentreDay): DayIndex {
	const attendance = new Map<number, AttendanceRecord>();
	for (const record of day.attendance) {
		if (record.is_double_duty && attendance.has(record.employee_id)) continue;
		attendance.set(record.employee_id, record);
	}
	const blockAssignment = new Map<number, Assignment>();
	const muster = new Map<number, Assignment>();
	for (const a of day.assignments) (a.kind === "block" ? blockAssignment : muster).set(a.employee_id, a);
	const collections = new Map<number, Collection[]>();
	for (const c of day.collections) collections.set(c.employee_id, [...(collections.get(c.employee_id) ?? []), c]);
	const present = day.workers.filter((w) => attendance.get(w.id)?.status === "present");
	return {
		day,
		attendance,
		blockAssignment,
		muster,
		collections,
		workerById: new Map(day.workers.map((w) => [w.id, w])),
		presentTappers: present.filter((w) => dutyTypeOf(w) === "tapper"),
		presentOthers: present.filter((w) => dutyTypeOf(w) !== "tapper"),
	};
}

export function workerState(index: DayIndex, workerId: number): WorkerState {
	return index.attendance.get(workerId)?.status ?? "not_marked";
}

export function workerCode(worker: Worker): string {
	return worker.current_code ? `${worker.check_roll_no} · ${worker.current_code}` : worker.check_roll_no;
}
