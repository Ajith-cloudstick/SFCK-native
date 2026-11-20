import { getDatabase } from "./database";

type CacheRow = {
	value: string;
	updated_at: string;
};

export type CachedValue<T> = {
	value: T;
	updatedAt: string;
};

export async function readCache<T>(key: string): Promise<CachedValue<T> | null> {
	const db = await getDatabase();
	const row = await db.getFirstAsync<CacheRow>("SELECT value, updated_at FROM cache WHERE key = ?", key);
	if (!row) return null;
	try {
		return { value: JSON.parse(row.value) as T, updatedAt: row.updated_at };
	} catch {
		return null;
	}
}

export async function writeCache<T>(key: string, value: T): Promise<string> {
	const db = await getDatabase();
	const updatedAt = new Date().toISOString();
	await db.runAsync(
		"INSERT INTO cache (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
		key,
		JSON.stringify(value),
		updatedAt,
	);
	return updatedAt;
}

export async function clearCache(): Promise<void> {
	const db = await getDatabase();
	await db.runAsync("DELETE FROM cache");
}
