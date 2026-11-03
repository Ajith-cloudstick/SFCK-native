import type { OutboxItem } from "@/common/sync/types";
import { istDate } from "@/common/utils/ist";
import { computeDry } from "@/modules/collection/utils/collectionMath";

import type {
	AttendancePayload,
	BlockAssignmentPayload,
	CentreDay,
	CentreStock,
	ChemicalUsagePayload,
	CollectionPayload,
	MusterAssignmentPayload,
	RequisitionPayload,
	RequisitionReceivePayload,
	WorkerRequestCancelPayload,
	WorkerRequestPayload,
} from "../types/centreDay";
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

function applyUsage(day: CentreDay, stock: CentreStock, item: OutboxItem, id: number): CentreDay {
	const p = item.payload as Partial<ChemicalUsagePayload>;
	const chemicalId = num(p.chemical_id);
	const quantity = num(p.quantity);
	const stockItem = stock.items.find((i) => i.chemical_id === chemicalId);
	if (!stockItem || quantity === null || quantity <= 0 || str(p.date) !== day.date) return day;
	const usage = {
		id,
		client_uuid: item.clientUuid,
		chemical_id: stockItem.chemical_id,
		quantity,
		note: str(p.note),
		chemical_name: stockItem.name,
		unit: stockItem.unit,
		created_by_name: null,
		created_at: item.createdAt,
		reversed_by: null,
	};
	const items = stock.items.map((i) => (i.chemical_id === stockItem.chemical_id ? { ...i, used: i.used + quantity, used_today: i.used_today + quantity, balance: i.balance - quantity } : i));
	return { ...day, stock: { ...stock, items, usage: [...stock.usage, usage] } };
}

function applyRequisition(day: CentreDay, stock: CentreStock, item: OutboxItem, id: number): CentreDay {
	const p = item.payload as Partial<RequisitionPayload>;
	const lines = (Array.isArray(p.lines) ? p.lines : []).flatMap((line, index) => {
		const stockItem = stock.items.find((i) => i.chemical_id === num(line.item_id));
		const qty = num(line.qty);
		if (!stockItem || qty === null || qty <= 0) return [];
		return [{ id: -(index + 1), item_id: stockItem.chemical_id, item_name: stockItem.name, unit: stockItem.unit, qty_requested: qty, qty_approved: null, qty_received: null }];
	});
	if (lines.length === 0) return day;
	const requisition = {
		id,
		client_uuid: item.clientUuid,
		date: str(p.date) ?? day.date,
		status: "pending" as const,
		note: str(p.note),
		decision_note: null,
		requested_by_name: null,
		lines,
		created_at: item.createdAt,
	};
	return { ...day, stock: { ...stock, requisitions: [requisition, ...stock.requisitions] } };
}

function applyReceive(day: CentreDay, stock: CentreStock, item: OutboxItem): CentreDay {
	const p = item.payload as Partial<RequisitionReceivePayload>;
	const requisitionId = num(p.requisition_id);
	const received = new Map((Array.isArray(p.lines) ? p.lines : []).map((l) => [num(l.id), num(l.qty)]));
	const requisitions = stock.requisitions.map((r) =>
		r.id === requisitionId && r.status === "issued"
			? { ...r, status: "received" as const, lines: r.lines.map((l) => ({ ...l, qty_received: received.get(l.id) ?? l.qty_approved })) }
			: r,
	);
	return { ...day, stock: { ...stock, requisitions } };
}

function applyWorkerRequest(day: CentreDay, item: OutboxItem, id: number): CentreDay {
	const p = item.payload as Partial<WorkerRequestPayload>;
	const tappers = num(p.tappers_needed) ?? 0;
	const general = num(p.general_needed) ?? 0;
	const date = str(p.date);
	if (!date || tappers + general <= 0) return day;
	const request = {
		id,
		client_uuid: item.clientUuid,
		cc_id: day.centre.id,
		date,
		tappers_needed: tappers,
		general_needed: general,
		note: str(p.note),
		status: "waiting" as const,
		decision_note: null,
		cc_name: day.centre.name,
		division_name: day.division?.name ?? null,
		requested_by_name: null,
		decided_by_name: null,
		sent_count: 0,
		created_at: item.createdAt,
	};
	return { ...day, worker_requests: [...(day.worker_requests ?? []), request] };
}

function applyWorkerRequestCancel(day: CentreDay, item: OutboxItem): CentreDay {
	const requestId = num((item.payload as Partial<WorkerRequestCancelPayload>).request_id);
	const requests = (day.worker_requests ?? []).map((r) => (r.id === requestId && (r.status === "waiting" || r.status === "part_sent") ? { ...r, status: "cancelled" as const } : r));
	return { ...day, worker_requests: requests };
}

// Applies one queued action to the day; local rows get id 0 until the server answers
export function applyItem(day: CentreDay, item: OutboxItem, id = 0): CentreDay {
	if (num(item.payload.cc_id) !== day.centre.id) return day;
	const seen = (rows: { client_uuid: string | null }[]) => rows.some((r) => r.client_uuid === item.clientUuid);
	const stock = day.stock;
	switch (item.type) {
		case "attendance":
			return seen(day.attendance) ? day : applyAttendance(day, item, id);
		case "assignment":
			return seen(day.assignments) ? day : applyAssignment(day, item, id);
		case "collection":
			return seen(day.collections) ? day : applyCollection(day, item, id);
		case "chemical_usage":
			return !stock || seen(stock.usage) ? day : applyUsage(day, stock, item, id);
		case "requisition":
			return !stock || seen(stock.requisitions) ? day : applyRequisition(day, stock, item, id);
		case "requisition_receive":
			return stock ? applyReceive(day, stock, item) : day;
		case "worker_request":
			return seen(day.worker_requests ?? []) ? day : applyWorkerRequest(day, item, id);
		case "worker_request_cancel":
			return applyWorkerRequestCancel(day, item);
	}
}

export function applyOutbox(day: CentreDay, items: OutboxItem[]): CentreDay {
	return items.filter((i) => i.status === "pending").reduce((acc, item) => applyItem(acc, item), day);
}
