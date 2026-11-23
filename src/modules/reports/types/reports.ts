// The server's reports for one collection centre, read online; shapes follow the web portal's reports
export type ReportCentre = { id: number; name: string; estate_name: string; division_name: string };

export type Form46Row = {
	block_no: string | null;
	clone: string | null;
	roll_no: string | null;
	check_roll_no: string;
	worker: string;
	latex_kg: number;
	sample_drc: number;
	dry_latex: number;
	scrap_kg: number;
	total_dry: number;
};

export type Form46 = { centre: ReportCentre; date: string; rows: Form46Row[]; total: Form46Row };

export type MusterWorker = { employee_id: number; name: string; code: string | null; check_roll_no: string; check_in: string | null };

export type Muster = { centre: ReportCentre; date: string; groups: { work_nature: string; location: string; workers: MusterWorker[] }[]; workers: number };

export type CheckRollRow = { employee_id: number; name: string; code: string | null; check_roll_no: string; present: number; leave: number; double_duty: number };

export type CheckRoll = { centre: ReportCentre; period_start: string; period_end: string; rows: CheckRollRow[]; present_per_day: Record<string, number> };
