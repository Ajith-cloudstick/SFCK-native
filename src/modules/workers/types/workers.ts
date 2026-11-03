export type MoveCandidate = {
	id: number;
	check_roll_no: string;
	current_code: string | null;
	name: string;
	work_type: string;
	category: string;
	home_cc_name: string | null;
	division_name: string | null;
	same_division: boolean;
	away_cc_name: string | null;
	attendance_cc_name: string | null;
	attendance_status: string | null;
	has_assignment: boolean;
};

export type WorkerMove = {
	id: number;
	employee_id: number;
	to_cc_id: number;
	from_date: string;
	to_date: string | null;
	employee_name: string | null;
	to_cc_name: string | null;
};

export type SendWorkersInput = {
	cc_id: number;
	employee_ids: number[];
	from_date: string;
	// empty means until brought back
	to_date: string;
	request_id?: number;
	note?: string | null;
};

export type SendPeriod = "today" | "three_days" | "week" | "until_back";

// Where workers come from: the centre's own estate, another estate, or Head Office
export type WorkerSource = {
	source: "own" | "estate" | "head_office";
	source_estate_id?: number;
};

export type MoveEstate = {
	id: number;
	name: string;
	code: string | null;
};
