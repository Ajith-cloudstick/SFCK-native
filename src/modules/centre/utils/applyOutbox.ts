import type { OutboxItem } from "@/common/sync/types";
import { istDate } from "@/common/utils/ist";
import { computeDry } from "@/modules/collection/utils/collectionMath";

import type { AttendancePayload, BlockAssignmentPayload, CentreDay, CollectionPayload, MusterAssignmentPayload } from "../types/centreDay";
import { classifyArrival, dutyTypeOf, timingFor } from "./duty";

function num(value: unknown): number | null {
	return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function str(value: unknown): string | null {
	return typeof value === "string" ? value : null;
}

function applyAttendance(day: CentreDay, item: OutboxItem, id: number): CentreDay {
	const p = item.payload as Partial<AttendancePayload>;
	const employeeId = num(p.employee_id);
	const deviceTime = str(p.device_time);
	if (employeeId === null || !deviceTime || istDate(new Date(deviceTime)) !== day.date) return day;
	if (day.attendance.some((a) => a.employee_id === employeeId && !a.is_double_duty)) return day;
	const worker = day.workers.find((w) => w.id === employeeId);
	if (!worker) return day;
	const duty = dutyTypeOf(worker);
	const arrival = classifyArrival(timingFor(day, duty), new Date(deviceTime));
	if (arrival.blocked) return day;
	const record = {
		id,
		client_uuid: item.clientUuid,
		date: day.date,
		employee_id: employeeId,
		cc_id: day.centre.id,
		duty_type: duty,
		status: arrival.status,
		is_late: arrival.late,
		is_double_duty: false,
		check_in: deviceTime,
		source: "mobile",
	};
	return { ...day, attendance: [...day.attendance, record] };
}

function applyAssignment(day: CentreDay, item: OutboxItem, id: number): CentreDay {
	const p = item.payload as Partial<BlockAssignmentPayload & MusterAssignmentPayload>;
	const employeeId = num(p.employee_id);
	if (employeeId === null || str(p.date) !== day.date) return day;
	const worker = day.workers.find((w) => w.id === employeeId);
	const blockId = num(p.block_id);
	if (blockId !== null) {
		const block = day.blocks.find((b) => b.block_id === blockId);
		if (!block || block.assigned_to !== null) return day;
		const assignment = { id, client_uuid: item.clientUuid, employee_id: employeeId, kind: "block" as const, block_id: blockId, work_nature: null, location: null, employee_name: worker?.name ?? "", block_no: block.block_no };
		return {
			...day,
			assignments: [...day.assignments, assignment],
			blocks: day.blocks.map((b) => (b.block_id === blockId ? { ...b, assigned_to: employeeId, assigned_name: worker?.name ?? null, assignment_id: id } : b)),
		};
	}
	const nature = str(p.work_nature);
	if (!nature || day.assignments.some((a) => a.employee_id === employeeId && a.kind === "muster" && a.work_nature === nature)) return day;
	const assignment = { id, client_uuid: item.clientUuid, employee_id: employeeId, kind: "muster" as const, block_id: null, work_nature: nature, location: str(p.location), employee_name: worker?.name ?? "", block_no: null };
	return { ...day, assignments: [...day.assignments, assignment] };
}

function applyCollection(day: CentreDay, item: OutboxItem, id: number): CentreDay {
	const p = item.payload as Partial<CollectionPayload>;
	const employeeId = num(p.employee_id);
	if (employeeId === null || str(p.date) !== day.date) return day;
	const blockId = num(p.block_id);
	if (day.collections.some((c) => c.employee_id === employeeId && c.block_id === blockId)) return day;
	const latex = num(p.latex_kg) ?? 0;
	const drc = num(p.sample_drc) ?? 0;
	const scrap = num(p.scrap_kg) ?? 0;
	const dry = computeDry(latex, drc, scrap, day.scrap_drc_percent);
	const collection = {
		id,
		client_uuid: item.clientUuid,
		employee_id: employeeId,
		block_id: blockId,
		latex_kg: latex,
		sample_drc: drc,
		scrap_kg: scrap,
		scrap_drc_percent: day.scrap_drc_percent,
		dry_latex: dry.dryLatex,
		dry_scrap: dry.dryScrap,
		total_dry: dry.totalDry,
		block_no: day.blocks.find((b) => b.block_id === blockId)?.block_no ?? null,
		employee_name: day.workers.find((w) => w.id === employeeId)?.name ?? "",
	};
	return { ...day, collections: [...day.collections, collection] };
}

// Applies one queued action to the day; local rows get id 0 until the server answers
export function applyItem(day: CentreDay, item: OutboxItem, id = 0): CentreDay {
	if (num(item.payload.cc_id) !== day.centre.id) return day;
	const seen = (rows: { client_uuid: string | null }[]) => rows.some((r) => r.client_uuid === item.clientUuid);
	if (item.type === "attendance") return seen(day.attendance) ? day : applyAttendance(day, item, id);
	if (item.type === "assignment") return seen(day.assignments) ? day : applyAssignment(day, item, id);
	return seen(day.collections) ? day : applyCollection(day, item, id);
}

export function applyOutbox(day: CentreDay, items: OutboxItem[]): CentreDay {
	return items.filter((i) => i.status === "pending").reduce((acc, item) => applyItem(acc, item), day);
}
