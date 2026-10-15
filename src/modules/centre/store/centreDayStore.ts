import { userMessage } from "@/common/services/httpClient";
import { useMemo } from "react";
import { create } from "zustand";

import { readCache, writeCache } from "@/common/db/cacheRepo";
import { useSyncStore } from "@/common/sync/syncStore";
import type { PushedItem } from "@/common/sync/types";
import { istDate } from "@/common/utils/ist";

import { getWorkNatures, pullCentreDay } from "../services/centreDayService";
import type { CentreDay } from "../types/centreDay";
import { applyItem, applyOutbox } from "../utils/applyOutbox";
import { buildDayIndex, type DayIndex } from "../utils/dayIndex";

const WORK_NATURES_KEY = "work-natures";

function versionKey(ccId: number, date: string): string {
	return `version:${ccId}:${date}`;
}

function dayKey(ccId: number, date: string): string {
	return `day:${ccId}:${date}`;
}

type CentreDayState = {
	ccId: number | null;
	serverDay: CentreDay | null;
	source: "server" | "cache" | null;
	savedAt: string | null;
	loading: boolean;
	error: string | null;
	workNatures: string[];
	open: (ccId: number) => Promise<void>;
	pull: (userId: number) => Promise<void>;
	bake: (pushed: PushedItem[]) => Promise<void>;
	loadWorkNatures: (userId: number) => Promise<void>;
	reset: () => void;
};

const initial = { ccId: null, serverDay: null, source: null, savedAt: null, loading: false, error: null, workNatures: [] };

export const useCentreDayStore = create<CentreDayState>((set, get) => ({
	...initial,
	open: async (ccId) => {
		if (get().ccId !== ccId) set({ ...initial, ccId, loading: true });
		const cached = await readCache<CentreDay>(dayKey(ccId, istDate())).catch(() => null);
		if (get().ccId !== ccId || get().source === "server") return;
		set({ serverDay: cached?.value ?? null, savedAt: cached?.updatedAt ?? null, source: cached ? "cache" : null, loading: !cached });
	},
	pull: async (userId) => {
		const ccId = get().ccId;
		if (!ccId) return;
		if (!get().serverDay) set({ loading: true });
		try {
			const today = istDate();
			const held = get().serverDay?.date === today ? await readCache<string>(versionKey(ccId, today)).catch(() => null) : null;
			const { data } = await pullCentreDay(userId, ccId, held?.value);
			if (get().ccId !== ccId) return;
			if (!data.changed || !data.day) {
				set({ source: "server", savedAt: new Date().toISOString(), loading: false, error: null });
				return;
			}
			const day = data.day;
			const savedAt = await writeCache(dayKey(ccId, day.date), day).catch(() => new Date().toISOString());
			await writeCache(versionKey(ccId, day.date), data.version).catch(() => undefined);
			set({ serverDay: day, source: "server", savedAt, loading: false, error: null });
		} catch (error) {
			set({ loading: false, error: userMessage(error) });
			throw error;
		}
	},
	bake: async (pushed) => {
		const { serverDay, ccId } = get();
		if (!serverDay || !ccId) return;
		const next = pushed.reduce((day, p) => applyItem(day, p.item, p.id), serverDay);
		set({ serverDay: next });
		await writeCache(dayKey(ccId, next.date), next).catch(() => undefined);
	},
	loadWorkNatures: async (userId) => {
		const cached = await readCache<string[]>(WORK_NATURES_KEY).catch(() => null);
		if (cached && get().workNatures.length === 0) set({ workNatures: cached.value });
		try {
			const { data } = await getWorkNatures(userId);
			set({ workNatures: data });
			await writeCache(WORK_NATURES_KEY, data);
		} catch {
			// Cached list stays in use while offline
		}
	},
	reset: () => set(initial),
}));

// Server day with every pending outbox action applied on top
export function currentDay(): CentreDay | null {
	const serverDay = useCentreDayStore.getState().serverDay;
	return serverDay ? applyOutbox(serverDay, useSyncStore.getState().items) : null;
}

export function useCentreDay(): CentreDay | null {
	const serverDay = useCentreDayStore((s) => s.serverDay);
	const items = useSyncStore((s) => s.items);
	return useMemo(() => (serverDay ? applyOutbox(serverDay, items) : null), [serverDay, items]);
}

export function useDayIndex(): DayIndex | null {
	const day = useCentreDay();
	return useMemo(() => (day ? buildDayIndex(day) : null), [day]);
}
