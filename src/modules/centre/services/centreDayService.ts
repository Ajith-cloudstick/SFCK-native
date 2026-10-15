import { http } from "@/common/services/httpClient";

import type { CentreDay } from "../types/centreDay";

export type CentreDayPull = { changed: boolean; version: string; server_time: string; day?: CentreDay };

// Returns the full day only when it changed since the version the phone already has
export function pullCentreDay(userId: number, ccId: number, version?: string) {
	return http.get<CentreDayPull>(`/users/${userId}/sync/pull`, { cc_id: ccId, version });
}

export function getWorkNatures(userId: number) {
	return http.get<string[]>(`/users/${userId}/assignment/work-natures`);
}
