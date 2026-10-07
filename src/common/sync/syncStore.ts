import { useMemo } from "react";
import { create } from "zustand";

import type { OutboxItem, SyncState } from "./types";

type SyncStoreState = {
	items: OutboxItem[];
	online: boolean;
	syncing: boolean;
	lastSyncedAt: string | null;
	lastError: string | null;
	notice: string | null;
	setItems: (items: OutboxItem[]) => void;
	patch: (partial: Partial<Omit<SyncStoreState, "setItems" | "patch" | "reset">>) => void;
	reset: () => void;
};

const initial = { items: [], online: true, syncing: false, lastSyncedAt: null, lastError: null, notice: null };

export const useSyncStore = create<SyncStoreState>((set) => ({
	...initial,
	setItems: (items) => set({ items }),
	patch: (partial) => set(partial),
	reset: () => set(initial),
}));

export function useSyncSummary() {
	const items = useSyncStore((s) => s.items);
	const online = useSyncStore((s) => s.online);
	const lastError = useSyncStore((s) => s.lastError);
	return useMemo(() => {
		const pending = items.filter((i) => i.status === "pending").length;
		const failed = items.filter((i) => i.status === "failed").length;
		const state: SyncState = !online ? "offline" : failed > 0 || lastError ? "error" : pending > 0 ? "pending" : "synced";
		return { pending, failed, state };
	}, [items, online, lastError]);
}
