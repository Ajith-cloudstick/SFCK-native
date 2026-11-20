import type { OutboxItem } from "@/common/sync/types";

// Web version of src/common/db/outboxRepo.ts: same exports, backed by localStorage instead of SQLite.
// Items are kept in insertion order, which stands in for SQLite's rowid tie-break.
const OUTBOX_KEY = "sfck.outbox";

function load(): OutboxItem[] {
	const raw = window.localStorage.getItem(OUTBOX_KEY);
	if (!raw) return [];
	try {
		const items = JSON.parse(raw) as OutboxItem[];
		return Array.isArray(items) ? items : [];
	} catch {
		return [];
	}
}

function save(items: OutboxItem[]): void {
	window.localStorage.setItem(OUTBOX_KEY, JSON.stringify(items));
}

function ordered(items: OutboxItem[]): OutboxItem[] {
	return items
		.map((item, index) => ({ item, index }))
		.sort((a, b) => (a.item.createdAt === b.item.createdAt ? a.index - b.index : a.item.createdAt < b.item.createdAt ? -1 : 1))
		.map(({ item }) => item);
}

function update(clientUuids: string[], change: (item: OutboxItem) => OutboxItem): void {
	const targets = new Set(clientUuids);
	save(load().map((item) => (targets.has(item.clientUuid) ? change(item) : item)));
}

export async function insertOutbox(item: OutboxItem): Promise<void> {
	const items = load();
	if (items.some((existing) => existing.clientUuid === item.clientUuid)) throw new Error(`Outbox item ${item.clientUuid} already exists`);
	save([...items, item]);
}

export async function listOutbox(): Promise<OutboxItem[]> {
	return ordered(load());
}

export async function listPendingOutbox(limit: number): Promise<OutboxItem[]> {
	return ordered(load())
		.filter((item) => item.status === "pending")
		.slice(0, limit);
}

export async function deleteOutbox(clientUuids: string[]): Promise<void> {
	if (clientUuids.length === 0) return;
	const targets = new Set(clientUuids);
	save(load().filter((item) => !targets.has(item.clientUuid)));
}

export async function markOutboxFailed(clientUuid: string, error: string): Promise<void> {
	update([clientUuid], (item) => ({ ...item, status: "failed", error, attempts: item.attempts + 1 }));
}

export async function markOutboxAttempted(clientUuids: string[]): Promise<void> {
	if (clientUuids.length === 0) return;
	update(clientUuids, (item) => ({ ...item, attempts: item.attempts + 1 }));
}

export async function resetOutboxItem(clientUuid: string): Promise<void> {
	update([clientUuid], (item) => ({ ...item, status: "pending", error: null }));
}

export async function clearOutbox(): Promise<void> {
	window.localStorage.removeItem(OUTBOX_KEY);
}
