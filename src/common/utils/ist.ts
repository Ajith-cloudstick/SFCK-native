import { IST_OFFSET_MINUTES } from "@/common/config/appConfig";

// The estate runs on IST whatever the phone's own time zone is
function shifted(date: Date): Date {
	return new Date(date.getTime() + IST_OFFSET_MINUTES * 60000);
}

export function istDate(date: Date = new Date()): string {
	return shifted(date).toISOString().slice(0, 10);
}

export function istMinutes(date: Date = new Date()): number {
	const local = shifted(date);
	return local.getUTCHours() * 60 + local.getUTCMinutes();
}

export function istClock(value: string | Date): string {
	const date = typeof value === "string" ? new Date(value) : value;
	if (Number.isNaN(date.getTime())) return "";
	const local = shifted(date);
	return `${String(local.getUTCHours()).padStart(2, "0")}:${String(local.getUTCMinutes()).padStart(2, "0")}`;
}

export function minutesOf(clock: string | null | undefined): number {
	const match = /^(\d{1,2}):(\d{2})/.exec(clock ?? "");
	if (!match) return -1;
	return Number(match[1]) * 60 + Number(match[2]);
}
