import { useMemo } from "react";
import { create } from "zustand";

import { useSessionStore } from "@/modules/session/store/sessionStore";

import { demoWorkItems } from "../demo/demo-work-items";
import type { WorkItem } from "../types/workItem";

type BlocksState = {
	items: WorkItem[];
	assign: (itemId: string, workerId: string) => void;
	unassign: (itemId: string, workerId: string) => void;
	releaseWorker: (workerId: string) => void;
};

function without(item: WorkItem, workerId: string): WorkItem {
	return item.workerIds.includes(workerId) ? { ...item, workerIds: item.workerIds.filter((id) => id !== workerId) } : item;
}

export const useBlocksStore = create<BlocksState>((set, get) => ({
	items: demoWorkItems,
	assign: (itemId, workerId) =>
		set({
			items: get().items.map((item) => (item.id === itemId ? { ...item, workerIds: [...without(item, workerId).workerIds, workerId] } : without(item, workerId))),
		}),
	unassign: (itemId, workerId) => set({ items: get().items.map((item) => (item.id === itemId ? without(item, workerId) : item)) }),
	releaseWorker: (workerId) => set({ items: get().items.map((item) => without(item, workerId)) }),
}));

export function useCentreWorkItems(): WorkItem[] {
	const items = useBlocksStore((s) => s.items);
	const centreId = useSessionStore((s) => s.centreId);
	return useMemo(() => items.filter((i) => i.centreId === centreId), [items, centreId]);
}

export function useAssignedWorkerIds(): Set<string> {
	const items = useBlocksStore((s) => s.items);
	return useMemo(() => new Set(items.flatMap((i) => i.workerIds)), [items]);
}

export function workItemTitle(item: WorkItem): string {
	return item.kind === "tapping" ? `${item.code} · ${item.name}` : `${item.code} · ${item.category}`;
}
