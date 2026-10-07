import { http } from "@/common/services/httpClient";

import type { OutboxItem, PushResponse } from "./types";

export function pushItems(userId: number, items: OutboxItem[]) {
	return http.post<PushResponse>(`/users/${userId}/sync/push`, {
		items: items.map((item) => ({ type: item.type, client_uuid: item.clientUuid, payload: item.payload })),
	});
}
