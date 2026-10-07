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

export type Arrival = {
	status: "present" | "pending";
	late: boolean;
	blocked: boolean;
	closesAt: string | null;
};

export type WorkerState = "not_marked" | AttendanceStatus;
