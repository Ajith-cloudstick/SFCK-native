import { useMemo } from "react";
import { create } from "zustand";

import { useCentreWorkItems } from "@/modules/blocks/store/blocksStore";

import { demoCollections } from "../demo/demo-collections";
import type { CollectionEntry, CollectionInput } from "../types/collection";

type CollectionState = {
	entries: CollectionEntry[];
	upsert: (input: CollectionInput) => "created" | "updated";
};

export function collectionKey(blockId: string, workerId: string): string {
	return `${blockId}:${workerId}`;
}

export const useCollectionStore = create<CollectionState>((set, get) => ({
	entries: demoCollections,
	upsert: (input) => {
		const id = collectionKey(input.blockId, input.workerId);
		const entry: CollectionEntry = { ...input, id, updatedAt: new Date().toISOString() };
		const exists = get().entries.some((e) => e.id === id);
		set({ entries: exists ? get().entries.map((e) => (e.id === id ? entry : e)) : [entry, ...get().entries] });
		return exists ? "updated" : "created";
	},
}));

export function useCentreCollections(): CollectionEntry[] {
	const entries = useCollectionStore((s) => s.entries);
	const items = useCentreWorkItems();
	return useMemo(() => {
		const blockIds = new Set(items.map((i) => i.id));
		return entries.filter((e) => blockIds.has(e.blockId));
	}, [entries, items]);
}

export function useCollectionMap(): Map<string, CollectionEntry> {
	const entries = useCollectionStore((s) => s.entries);
	return useMemo(() => new Map(entries.map((e) => [e.id, e])), [entries]);
}
