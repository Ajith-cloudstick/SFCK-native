import { LATE_CUTOFF } from "@/common/config/appConfig";

export function isAfterLateCutoff(date: Date = new Date()): boolean {
	const cutoff = new Date(date);
	cutoff.setHours(LATE_CUTOFF.hour, LATE_CUTOFF.minute, 0, 0);
	return date.getTime() >= cutoff.getTime();
}
