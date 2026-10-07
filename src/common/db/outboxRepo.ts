import type { OutboxItem, OutboxStatus, OutboxType, SyncPayload } from "@/common/sync/types";

import { getDatabase } from "./database";

type OutboxRow = {
	client_uuid: string;
	type: string;
	payload: string;
	created_at: string;
	status: string;
	error: string | null;
	attempts: number;
};

const COLUMNS = "client_uuid, type, payload, created_at, status, error, attempts";

function toItem(row: OutboxRow): OutboxItem | null {
	try {
		return {
			clientUuid: row.client_uuid,
			type: row.type as OutboxType,
			payload: JSON.parse(row.payload) as SyncPayload,
			createdAt: row.created_at,
			status: row.status as OutboxStatus,
			error: row.error,
			attempts: row.attempts,
		};
	} catch {
		return null;
	}
}

function toItems(rows: OutboxRow[]): OutboxItem[] {
	return rows.map(toItem).filter((item): item is OutboxItem => item !== null);
}

export async function insertOutbox(item: OutboxItem): Promise<void> {
	const db = await getDatabase();
	await db.runAsync(
		`INSERT INTO outbox (${COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?)`,
		item.clientUuid,
		item.type,
		JSON.stringify(item.payload),
		item.createdAt,
		item.status,
		item.error,
		item.attempts,
	);
}

export async function listOutbox(): Promise<OutboxItem[]> {
	const db = await getDatabase();
	return toItems(await db.getAllAsync<OutboxRow>(`SELECT ${COLUMNS} FROM outbox ORDER BY created_at, rowid`));
}

export async function listPendingOutbox(limit: number): Promise<OutboxItem[]> {
	const db = await getDatabase();
	return toItems(await db.getAllAsync<OutboxRow>(`SELECT ${COLUMNS} FROM outbox WHERE status = 'pending' ORDER BY created_at, rowid LIMIT ?`, limit));
}

export async function deleteOutbox(clientUuids: string[]): Promise<void> {
	if (clientUuids.length === 0) return;
	const db = await getDatabase();
	await db.runAsync(`DELETE FROM outbox WHERE client_uuid IN (${clientUuids.map(() => "?").join(", ")})`, clientUuids);
}

export async function markOutboxFailed(clientUuid: string, error: string): Promise<void> {
	const db = await getDatabase();
	await db.runAsync("UPDATE outbox SET status = 'failed', error = ?, attempts = attempts + 1 WHERE client_uuid = ?", error, clientUuid);
}

export async function markOutboxAttempted(clientUuids: string[]): Promise<void> {
	if (clientUuids.length === 0) return;
	const db = await getDatabase();
	await db.runAsync(`UPDATE outbox SET attempts = attempts + 1 WHERE client_uuid IN (${clientUuids.map(() => "?").join(", ")})`, clientUuids);
}

export async function resetOutboxItem(clientUuid: string): Promise<void> {
	const db = await getDatabase();
	await db.runAsync("UPDATE outbox SET status = 'pending', error = NULL WHERE client_uuid = ?", clientUuid);
}

export async function clearOutbox(): Promise<void> {
	const db = await getDatabase();
	await db.runAsync("DELETE FROM outbox");
}
