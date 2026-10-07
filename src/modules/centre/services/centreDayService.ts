import { http } from "@/common/services/httpClient";

import type { CentreDay } from "../types/centreDay";

export function getCentreDay(userId: number, ccId: number, date?: string) {
	return http.get<CentreDay>(`/users/${userId}/cc/${ccId}/day`, { date });
}

export function getWorkNatures(userId: number) {
	return http.get<string[]>(`/users/${userId}/assignment/work-natures`);
}
