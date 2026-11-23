import { http } from "@/common/services/httpClient";

import type { EntryInput, PayHead, PaymentInput, WageSheet } from "../types/wages";

// Wages are worked out on the server for the whole month, so these calls are online only
export function getCentreWages(userId: number, ccId: number, period: string) {
	return http.get<WageSheet>(`/users/${userId}/payroll/sheet`, { level: "cc", id: ccId, period });
}

export function payWages(userId: number, input: PaymentInput) {
	return http.patch<unknown>(`/users/${userId}/payroll/entries/pay`, input);
}

// the client's named earnings and recoveries, in the order of their wage sheets
export function getPayHeads(userId: number) {
	return http.get<PayHead[]>(`/users/${userId}/payroll/heads`);
}

export function saveWageEntry(userId: number, input: EntryInput) {
	return http.patch<unknown>(`/users/${userId}/payroll/entries`, input);
}
