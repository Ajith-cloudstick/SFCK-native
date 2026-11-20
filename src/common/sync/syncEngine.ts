import NetInfo from "@react-native-community/netinfo";
import { randomUUID } from "expo-crypto";
import { AppState } from "react-native";

import { PUSH_BATCH_SIZE } from "@/common/config/appConfig";
import { clearCache } from "@/common/db/cacheRepo";
import {
	clearOutbox,
	deleteOutbox,
	insertOutbox,
	listOutbox,
	listPendingOutbox,
	markOutboxAttempted,
	markOutboxFailed,
	resetOutboxItem,
} from "@/common/db/outboxRepo";
import { t } from "@/common/i18n";
import { ApiError, userMessage } from "@/common/services/httpClient";
import { duration } from "@/common/theme/tokens";

import { pushItems } from "./syncService";
import { useSyncStore } from "./syncStore";
import type { OutboxItem, OutboxType, PushedItem, PushResult, SyncHooks, SyncPayload } from "./types";

let hooks: SyncHooks | null = null;
let running: Promise<void> | null = null;
let rerun = false;
const inserting = new Map<string, OutboxItem>();

async function reloadItems(): Promise<OutboxItem[]> {
	const stored = await listOutbox();
	const known = new Set(stored.map((i) => i.clientUuid));
	const items = [...stored, ...[...inserting.values()].filter((i) => !known.has(i.clientUuid))];
	useSyncStore.getState().setItems(items);
	return items;
}

function errorMessage(error: unknown): string {
	return userMessage(error);
}

type FlushOutcome = "done" | "unreachable";

async function flush(userId: number): Promise<FlushOutcome> {
	for (;;) {
		const batch = await listPendingOutbox(PUSH_BATCH_SIZE);
		if (batch.length === 0) return "done";
		let results: PushResult[];
		try {
			results = (await pushItems(userId, batch)).data.results;
		} catch (error) {
			if (error instanceof ApiError && (error.isOffline || error.status >= 500 || error.status === 401)) {
				useSyncStore.getState().patch({ notice: error.message });
				return "unreachable";
			}
			await Promise.all(batch.map((item) => markOutboxFailed(item.clientUuid, errorMessage(error))));
			await reloadItems();
			return "done";
		}
		const byUuid = new Map(results.map((r) => [r.client_uuid, r]));
		const pushed: PushedItem[] = [];
		const unanswered: string[] = [];
		for (const item of batch) {
			const result = byUuid.get(item.clientUuid);
			if (!result) unanswered.push(item.clientUuid);
			else if (result.ok) pushed.push({ item, id: result.id ?? 0 });
			else await markOutboxFailed(item.clientUuid, result.error ?? t("errors.server"));
		}
		await deleteOutbox(pushed.map((p) => p.item.clientUuid));
		await markOutboxAttempted(unanswered);
		if (pushed.length > 0) await hooks?.onPushed(pushed);
		await reloadItems();
		if (unanswered.length === batch.length) return "done";
	}
}

async function run(): Promise<void> {
	const current = hooks;
	const userId = current?.getUserId();
	const store = useSyncStore.getState();
	if (!current || !userId || !store.online) return;
	store.patch({ syncing: true });
	try {
		const outcome = await flush(userId);
		if (outcome === "unreachable") return;
		await current.pull();
		useSyncStore.getState().patch({ lastSyncedAt: new Date().toISOString(), lastError: null, notice: null });
	} catch (error) {
		if (error instanceof ApiError && error.isOffline) useSyncStore.getState().patch({ notice: error.message });
		else useSyncStore.getState().patch({ lastError: errorMessage(error) });
	} finally {
		useSyncStore.getState().patch({ syncing: false });
	}
}

export function syncNow(): Promise<void> {
	if (running) {
		rerun = true;
		return running;
	}
	running = (async () => {
		do {
			rerun = false;
			await run();
		} while (rerun);
	})().finally(() => {
		running = null;
	});
	return running;
}

export async function enqueue(type: OutboxType, payload: SyncPayload): Promise<OutboxItem> {
	const item: OutboxItem = { clientUuid: randomUUID(), type, payload, createdAt: new Date().toISOString(), status: "pending", error: null, attempts: 0 };
	const store = useSyncStore.getState();
	inserting.set(item.clientUuid, item);
	store.setItems([...store.items, item]);
	try {
		await insertOutbox(item);
	} catch (error) {
		store.setItems(useSyncStore.getState().items.filter((i) => i.clientUuid !== item.clientUuid));
		throw error;
	} finally {
		inserting.delete(item.clientUuid);
	}
	void syncNow();
	return item;
}

export async function retryItem(clientUuid: string): Promise<void> {
	await resetOutboxItem(clientUuid);
	await reloadItems();
	void syncNow();
}

export async function discardItem(clientUuid: string): Promise<void> {
	await deleteOutbox([clientUuid]);
	await reloadItems();
}

export async function loadOutbox(): Promise<void> {
	await reloadItems();
}

export async function clearSyncData(): Promise<void> {
	await clearOutbox();
	await clearCache();
	useSyncStore.getState().reset();
}

// Wires triggers: start, reconnect, foreground and a fixed interval while active
export function startSync(next: SyncHooks): () => void {
	hooks = next;
	let interval: ReturnType<typeof setInterval> | null = null;
	const startInterval = () => {
		if (!interval) interval = setInterval(() => void syncNow(), duration.syncInterval);
	};
	const stopInterval = () => {
		if (interval) clearInterval(interval);
		interval = null;
	};

	const unsubscribeNet = NetInfo.addEventListener((state) => {
		const online = state.isConnected !== false;
		const wasOnline = useSyncStore.getState().online;
		useSyncStore.getState().patch({ online });
		if (online && !wasOnline) void syncNow();
	});
	const appState = AppState.addEventListener("change", (status) => {
		if (status === "active") {
			startInterval();
			void syncNow();
		} else {
			stopInterval();
		}
	});

	if (AppState.currentState === "active") startInterval();
	void reloadItems()
		.then(() => NetInfo.fetch())
		.then((state) => {
			useSyncStore.getState().patch({ online: state.isConnected !== false });
			return syncNow();
		})
		.catch(() => undefined);

	return () => {
		if (hooks === next) hooks = null;
		stopInterval();
		unsubscribeNet();
		appState.remove();
	};
}
