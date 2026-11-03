export type DutyType = "tapper" | "protection" | "casual" | "dependent" | "general";

export type AttendanceStatus = "present" | "pending" | "absent" | "leave";

export type Worker = {
	id: number;
	check_roll_no: string;
	current_code: string | null;
	name: string;
	name_ml: string | null;
	category: string;
	work_type: string;
	designation: string | null;
	mobile: string | null;
	posted_here: boolean;
	// posted here but sent to another centre today: listed, not markable here
	working_at?: string | null;
	working_until?: string | null;
	// sent here from another centre today ("" when they have no home centre)
	moved_from?: string | null;
	moved_until?: string | null;
	move_id?: number | null;
};

export type WorkerRequestStatus = "waiting" | "sent" | "part_sent" | "declined" | "cancelled";

export type WorkerRequest = {
	id: number;
	client_uuid: string | null;
	cc_id: number;
	date: string;
	tappers_needed: number;
	general_needed: number;
	note: string | null;
	status: WorkerRequestStatus;
	decision_note: string | null;
	cc_name: string | null;
	division_name: string | null;
	// where the workers come from; both empty means the centre's own estate
	source_estate_id?: number | null;
	source_head_office?: boolean;
	source_name?: string | null;
	estate_name?: string | null;
	// aimed at the user who loaded the inbox
	for_me?: boolean;
	requested_by_name: string | null;
	decided_by_name: string | null;
	sent_count: number;
	created_at: string;
};

export type AttendanceRecord = {
	id: number;
	client_uuid: string | null;
	date: string;
	employee_id: number;
	cc_id: number;
	duty_type: string;
	status: AttendanceStatus;
	is_late: boolean;
	is_double_duty: boolean;
	check_in: string;
	source: string;
};

export type DayBlock = {
	block_id: number;
	block_no: string;
	block_class: string | null;
	tapping_cycle: string | null;
	clone: string | null;
	tapper_id: number | null;
	tapper_name: string | null;
	tapper_present: boolean;
	last_tapped: string | null;
	due: boolean;
	assigned_to: number | null;
	assigned_name: string | null;
	assignment_id: number | null;
};

export type Assignment = {
	id: number;
	client_uuid: string | null;
	employee_id: number;
	kind: "block" | "muster";
	block_id: number | null;
	work_nature: string | null;
	location: string | null;
	employee_name: string;
	block_no: string | null;
};

export type Collection = {
	id: number;
	client_uuid: string | null;
	employee_id: number;
	block_id: number | null;
	latex_kg: number;
	sample_drc: number;
	scrap_kg: number;
	scrap_drc_percent: number;
	dry_latex: number;
	dry_scrap: number;
	total_dry: number;
	block_no: string | null;
	employee_name: string;
};

export type DutyTiming = {
	duty_type: string;
	label: string;
	start_time: string;
	normal_until: string;
	approval_until: string | null;
	end_time: string;
};

export type StockItem = {
	chemical_id: number;
	name: string;
	unit: string;
	kind: "chemical" | "material";
	received: number;
	used: number;
	used_today: number;
	balance: number;
};

export type StockUsage = {
	id: number;
	client_uuid: string | null;
	chemical_id: number;
	quantity: number;
	note: string | null;
	chemical_name: string | null;
	unit: string | null;
	created_by_name: string | null;
	created_at: string;
	reversed_by: number | null;
};

export type RequisitionStatus = "pending" | "approved" | "rejected" | "issued" | "received";

export type RequisitionLine = {
	id: number;
	item_id: number | null;
	item_name: string;
	unit: string;
	qty_requested: number;
	qty_approved: number | null;
	qty_received: number | null;
};

export type Requisition = {
	id: number;
	client_uuid: string | null;
	date: string;
	status: RequisitionStatus;
	note: string | null;
	decision_note: string | null;
	requested_by_name: string | null;
	lines: RequisitionLine[];
	created_at: string;
};

// Only sent to users who may see chemical stock
export type CentreStock = {
	items: StockItem[];
	usage: StockUsage[];
	requisitions: Requisition[];
};

export type CentreDay = {
	date: string;
	server_time: string;
	centre: { id: number; name: string; code: string | null; estate_id: number; division_id: number };
	division: { id: number; name: string } | null;
	estate: { id: number; name: string; code: string | null } | null;
	workers: Worker[];
	attendance: AttendanceRecord[];
	blocks: DayBlock[];
	assignments: Assignment[];
	collections: Collection[];
	duty_timings: DutyTiming[];
	scrap_drc_percent: number;
	stock?: CentreStock;
	worker_requests?: WorkerRequest[];
};

export type AttendancePayload = {
	employee_id: number;
	cc_id: number;
	device_time: string;
};

export type BlockAssignmentPayload = {
	cc_id: number;
	employee_id: number;
	date: string;
	block_id: number;
};

export type MusterAssignmentPayload = {
	cc_id: number;
	employee_id: number;
	date: string;
	work_nature: string;
	location: string | null;
};

export type CollectionPayload = {
	cc_id: number;
	employee_id: number;
	block_id: number | null;
	date: string;
	latex_kg: number;
	sample_drc: number;
	scrap_kg: number;
};

export type ChemicalUsagePayload = {
	cc_id: number;
	chemical_id: number;
	quantity: number;
	date: string;
	note: string | null;
};

export type RequisitionPayload = {
	cc_id: number;
	date: string;
	note: string | null;
	lines: { item_id: number; qty: number }[];
};

export type RequisitionReceivePayload = {
	cc_id: number;
	requisition_id: number;
	lines: { id: number; qty: number }[];
};

export type WorkerRequestPayload = {
	cc_id: number;
	date: string;
	tappers_needed: number;
	general_needed: number;
	note: string | null;
	source?: "own" | "estate" | "head_office";
	source_estate_id?: number;
};

export type WorkerRequestCancelPayload = {
	cc_id: number;
	request_id: number;
};

export type Arrival = {
	status: "present" | "pending";
	late: boolean;
	blocked: boolean;
	closesAt: string | null;
};

export type WorkerState = "not_marked" | AttendanceStatus;
