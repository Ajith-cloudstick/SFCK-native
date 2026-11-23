// One named line of the client's wage sheet (IFA, LIC, LWF, GPAIS...): an earning is paid but not in the PF base, a recovery comes off the net
export type PayHead = { id: number; code: string; label: string; label_ml: string | null; kind: "earning" | "recovery"; sort_order: number };

// What was typed under a pay head for one person's wage month
export type HeadAmount = { code: string; label: string; label_ml: string | null; kind: "earning" | "recovery"; amount: number };

// One person's wages for a wage month, worked out by the server from attendance, collection, leave and salary
export type WageLine = {
	employee_id: number;
	category: string;
	work_type: string;
	days: number;
	excess_days: number;
	double_duty_days: number;
	leave_days: number;
	daily_rate: number;
	wages: number;
	total_dry: number;
	incentive: number;
	leave_pay: number;
	holiday_pay: number;
	lcc: number;
	washing_allowance: number;
	interim_relief: number;
	pf: number;
	gross: number;
	recoveries: number;
	recovery_note: string | null;
	head_earnings: number;
	heads: HeadAmount[];
	voucher_amount: number;
	net: number;
	paid_amount: number | null;
	paid_on: string | null;
	payment_note: string | null;
	// net minus the amount paid: above 0 is still to pay, below 0 was paid extra
	balance: number;
	employee_name: string | null;
	employee_code: string | null;
	check_roll_no: string | null;
};

export type WageTotals = {
	people: number;
	net: number;
	pf: number;
	paid: number;
	pending: number;
	extra: number;
	unpaid: number;
};

export type WageSheet = {
	period: { label: string; start: string; end: string };
	lines: WageLine[];
	totals: WageTotals;
};

export type PayState = "unpaid" | "pending" | "paid" | "extra";

export type PaymentInput = {
	employee_id: number;
	period: string;
	paid_amount: number | null;
	paid_on?: string;
	note?: string | null;
};

// recoveries is the lump "other recoveries"; heads are amounts by pay head code (0 clears one)
export type EntryInput = {
	employee_id: number;
	period: string;
	recoveries: number;
	recovery_note: string | null;
	heads: Record<string, number>;
};
