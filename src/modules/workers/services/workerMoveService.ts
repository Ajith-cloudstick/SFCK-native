import { http } from "@/common/services/httpClient";
import type { WorkerRequest } from "@/modules/centre/types/centreDay";

import type { MoveCandidate, MoveEstate, SendWorkersInput, WorkerMove, WorkerSource } from "../types/workers";

// Sending workers needs the live list of who is free, so these calls are online only;
// asking for workers goes through the offline outbox instead
export function getCandidates(userId: number, ccId: number, date: string, q?: string, from?: WorkerSource, requestId?: number) {
	return http.get<MoveCandidate[]>(`/users/${userId}/worker-move/candidates`, { cc_id: ccId, date, q: q?.trim() || undefined, ...from, request_id: requestId });
}

export function listMoveEstates(userId: number) {
	return http.get<MoveEstate[]>(`/users/${userId}/worker-move/estates`);
}

export function sendWorkers(userId: number, input: SendWorkersInput) {
	return http.post<WorkerMove[]>(`/users/${userId}/worker-move`, input);
}

export function bringBack(userId: number, moveId: number) {
	return http.patch<WorkerMove>(`/users/${userId}/worker-move/${moveId}/end`);
}

export function listWorkerRequests(userId: number, status: "open" | "all" = "open") {
	return http.get<WorkerRequest[]>(`/users/${userId}/worker-request`, { status });
}

export function declineWorkerRequest(userId: number, requestId: number, note?: string) {
	return http.patch<WorkerRequest>(`/users/${userId}/worker-request/${requestId}/decline`, { note: note?.trim() || null });
}
