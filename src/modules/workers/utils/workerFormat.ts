import type { BadgeTone } from "@/common/components/ui/Badge";
import type { TranslationKey } from "@/common/i18n";
import type { WorkerRequestStatus } from "@/modules/centre/types/centreDay";

import type { SendPeriod } from "../types/workers";

export const requestStatusLabel: Record<WorkerRequestStatus, TranslationKey> = {
	waiting: "workers.statusWaiting",
	sent: "workers.statusSent",
	part_sent: "workers.statusPartSent",
	declined: "workers.statusDeclined",
	cancelled: "workers.statusCancelled",
};

export const requestStatusTone: Record<WorkerRequestStatus, BadgeTone> = {
	waiting: "warning",
	sent: "success",
	part_sent: "info",
	declined: "danger",
	cancelled: "neutral",
};

export const periodOptions: { value: SendPeriod; label: TranslationKey }[] = [
	{ value: "today", label: "workers.todayOnly" },
	{ value: "three_days", label: "workers.threeDays" },
	{ value: "week", label: "workers.oneWeek" },
	{ value: "until_back", label: "workers.untilBackOption" },
];

// ISO date plus whole days; noon UTC keeps the calendar day stable in every time zone
export function addDays(isoDate: string, days: number): string {
	const date = new Date(`${isoDate.slice(0, 10)}T12:00:00Z`);
	date.setUTCDate(date.getUTCDate() + days);
	return date.toISOString().slice(0, 10);
}

// Last day of the period, or "" for until brought back
export function periodEnd(from: string, period: SendPeriod): string {
	if (period === "until_back") return "";
	return addDays(from, period === "three_days" ? 2 : period === "week" ? 6 : 0);
}
