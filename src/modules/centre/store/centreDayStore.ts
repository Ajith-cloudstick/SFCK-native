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
	// null follows today's IST date; a past date is shown view only
	selectedDate: string | null;
	serverDay: CentreDay | null;
	source: "server" | "cache" | null;
	savedAt: string | null;
	loading: boolean;
	error: string | null;
	workNatures: string[];
	open: (ccId: number) => Promise<void>;
	selectDate: (date: string | null, userId: number) => Promise<void>;
	pull: (userId: number) => Promise<void>;
	bake: (pushed: PushedItem[]) => Promise<void>;
	loadWorkNatures: (userId: number) => Promise<void>;
	reset: () => void;
};

const initial = { ccId: null, selectedDate: null, serverDay: null, source: null, savedAt: null, loading: false, error: null, workNatures: [] };

function viewDate(state: Pick<CentreDayState, "selectedDate">): string {
	return state.selectedDate ?? istDate();
}

export const useCentreDayStore = create<CentreDayState>((set, get) => ({
	...initial,
	open: async (ccId) => {
		if (get().ccId !== ccId) set({ ...initial, ccId, loading: true });
		const date = viewDate(get());
		const cached = await readCache<CentreDay>(dayKey(ccId, date)).catch(() => null);
		if (get().ccId !== ccId || viewDate(get()) !== date || get().source === "server") return;
		set({ serverDay: cached?.value ?? null, savedAt: cached?.updatedAt ?? null, source: cached ? "cache" : null, loading: !cached });
	},
	selectDate: async (date, userId) => {
		const next = date === null || date >= istDate() ? null : date;
		const ccId = get().ccId;
		if (!ccId || next === get().selectedDate) return;
		set({ selectedDate: next, serverDay: null, source: null, savedAt: null, error: null, loading: true });
		await get().open(ccId);
		await get()
			.pull(userId)
			.catch(() => undefined);
	},
	pull: async (userId) => {
		const ccId = get().ccId;
		if (!ccId) return;
		if (!get().serverDay) set({ loading: true });
		const date = viewDate(get());
		try {
			const held = get().serverDay?.date === date ? await readCache<string>(versionKey(ccId, date)).catch(() => null) : null;
			const { data } = await pullCentreDay(userId, ccId, date, held?.value);
			if (get().ccId !== ccId || viewDate(get()) !== date) return;
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

// Past days are view only: the server records marks, assignments and collections against today
export function isPastDay(): boolean {
	const selected = useCentreDayStore.getState().selectedDate;
	return selected !== null && selected < istDate();
}

export function useIsPastDay(): boolean {
	const selected = useCentreDayStore((s) => s.selectedDate);
	return selected !== null && selected < istDate();
}

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
