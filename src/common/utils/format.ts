import { locales, type Language } from "@/common/i18n";

export function formatKg(value: number): string {
	return value.toFixed(2);
}

export function formatDate(date: Date, language: Language): string {
	return date.toLocaleDateString(locales[language], { weekday: "long", day: "numeric", month: "short" });
}

// Noon UTC keeps the calendar day stable in every phone time zone
export function formatDayDate(isoDate: string, language: Language): string {
	const date = new Date(`${isoDate.slice(0, 10)}T12:00:00Z`);
	return Number.isNaN(date.getTime()) ? isoDate : formatDate(date, language);
}

export function formatTime(hour: number, minute: number): string {
	return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function initialsOf(name: string): string {
	const parts = name.trim().split(/[\s.,]+/).filter(Boolean);
	const first = parts[0]?.charAt(0) ?? "";
	const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? "") : "";
	return `${first}${last}`.toUpperCase() || "?";
}

export function parseNumber(value: string): number | null {
	const trimmed = value.trim();
	if (trimmed === "") return null;
	const parsed = Number(trimmed.replace(",", "."));
	return Number.isFinite(parsed) ? parsed : null;
}
