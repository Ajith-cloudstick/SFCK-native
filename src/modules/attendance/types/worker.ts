export type AttendanceStatus = "pending" | "present";

export type AttendanceFilter = "all" | "present" | "late" | "pending";

export type Worker = {
	id: string;
	name: string;
	initials: string;
	estateId: string;
	centreId: string;
	status: AttendanceStatus;
	isLate: boolean;
	markedAt: string | null;
};

export type MarkResult = {
	worker: Worker;
	present: boolean;
	late: boolean;
};
