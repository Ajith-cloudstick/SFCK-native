import type { Worker } from "@/modules/centre/types/centreDay";

function normalise(value: string): string {
	return value.trim().toUpperCase().replace(/\s+/g, " ");
}

// ID cards carry the check roll number; a bare number like "123" also matches SFCK-000123
export function findWorkerByCode(workers: Worker[], code: string): Worker | null {
	const wanted = normalise(code);
	if (!wanted) return null;
	const exact = workers.find((w) => normalise(w.check_roll_no) === wanted) ?? workers.find((w) => !!w.current_code && normalise(w.current_code) === wanted);
	if (exact) return exact;
	if (!/^\d+$/.test(wanted)) return null;
	const number = Number(wanted);
	return workers.find((w) => Number(w.check_roll_no.replace(/\D/g, "")) === number) ?? null;
}
