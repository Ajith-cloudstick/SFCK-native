import { http } from "@/common/services/httpClient";

import type { CheckRoll, Form46, Muster } from "../types/reports";

// Reports are worked out on the server, so these calls are online only
export function getForm46(userId: number, ccId: number, date: string) {
	return http.get<Form46>(`/users/${userId}/report/form46`, { cc_id: ccId, date });
}

export function getMuster(userId: number, ccId: number, date: string) {
	return http.get<Muster>(`/users/${userId}/report/muster`, { cc_id: ccId, date });
}

export function getCheckRoll(userId: number, ccId: number, period: string) {
	return http.get<CheckRoll>(`/users/${userId}/report/check-roll`, { cc_id: ccId, period });
}
