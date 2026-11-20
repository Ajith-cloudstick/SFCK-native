import { useCallback, useEffect, useState } from "react";

import { startSync, syncNow } from "@/common/sync/syncEngine";

import { useCentreDayStore } from "../store/centreDayStore";

// Loads the cached day, then keeps outbox and day in step with the server while the tabs are mounted
export function useCentreSync(userId: number | null, ccId: number | null) {
	useEffect(() => {
		if (!userId || !ccId) return;
		const store = useCentreDayStore.getState();
		void store.open(ccId);
		void store.loadWorkNatures(userId);
		return startSync({
			getUserId: () => userId,
			pull: () => useCentreDayStore.getState().pull(userId),
			onPushed: (pushed) => useCentreDayStore.getState().bake(pushed),
		});
	}, [userId, ccId]);
}

// Spinner only for pulls the user started, not for the background interval
export function useSyncRefresh() {
	const [refreshing, setRefreshing] = useState(false);
	const onRefresh = useCallback(() => {
		setRefreshing(true);
		syncNow().finally(() => setRefreshing(false));
	}, []);
	return { refreshing, onRefresh };
}
