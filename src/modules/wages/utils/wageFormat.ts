import { locales, type Language } from "@/common/i18n";
import { istDate } from "@/common/utils/ist";

import type { PayState, WageLine } from "../types/wages";

// a wage month is named by its last month: "2026-08" runs from 21 Jul to 20 Aug
export function currentWageMonth(): string {
	return istDate().slice(0, 7);
}

// year and month (1-12) of "YYYY-MM"
function partsOf(month: string): [number, number] {
	return [Number(month.slice(0, 4)), Number(month.slice(5, 7))];
}

export function shiftMonth(month: string, delta: number): string {
	const [year, mon] = partsOf(month);
	const date = new Date(Date.UTC(year, mon - 1 + delta, 1));
	return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function monthName(month: string, language: Language): string {
	const [year, mon] = partsOf(month);
	return new Date(Date.UTC(year, mon - 1, 15)).toLocaleDateString(locales[language], { month: "long", year: "numeric", timeZone: "UTC" });
}

export function shortDate(iso: string, language: Language): string {
	return new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString(locales[language], { day: "numeric", month: "short", timeZone: "UTC" });
}

export function money(value: number): string {
	return `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function payStateOf(line: WageLine): PayState {
	if (line.paid_amount === null) return "unpaid";
	if (line.balance > 0) return "pending";
	if (line.balance < 0) return "extra";
	return "paid";
}

// staff and officers are paid the monthly salary on their record
export function isSalaried(line: WageLine): boolean {
	return line.category === "staff" || line.category === "officer";
}
