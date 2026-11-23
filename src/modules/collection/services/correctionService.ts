import { http } from "@/common/services/httpClient";

export type CorrectionInput = {
	entity: "collection";
	record_id: number;
	latex_kg: number;
	sample_drc: number;
	scrap_kg: number;
	reason: string;
};

// A saved entry is locked; a correction asks the Assistant Manager to change it. Online only, like the web
export function requestCorrection(userId: number, input: CorrectionInput) {
	return http.post<unknown>(`/users/${userId}/correction`, input);
}
