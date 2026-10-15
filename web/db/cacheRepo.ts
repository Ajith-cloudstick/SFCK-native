// Web version of src/common/db/cacheRepo.ts: same exports, backed by localStorage instead of SQLite
const PREFIX = "sfck.cache.";

type CacheRow = {
	value: string;
	updated_at: string;
};

export type CachedValue<T> = {
	value: T;
	updatedAt: string;
};

export async function readCache<T>(key: string): Promise<CachedValue<T> | null> {
	const raw = window.localStorage.getItem(PREFIX + key);
	if (!raw) return null;
	try {
		const row = JSON.parse(raw) as CacheRow;
		return { value: JSON.parse(row.value) as T, updatedAt: row.updated_at };
	} catch {
		return null;
	}
}

export async function writeCache<T>(key: string, value: T): Promise<string> {
	const updatedAt = new Date().toISOString();
	const row: CacheRow = { value: JSON.stringify(value), updated_at: updatedAt };
	window.localStorage.setItem(PREFIX + key, JSON.stringify(row));
	return updatedAt;
}

export async function clearCache(): Promise<void> {
	const keys = Array.from({ length: window.localStorage.length }, (_, i) => window.localStorage.key(i));
	keys.filter((key): key is string => !!key?.startsWith(PREFIX)).forEach((key) => window.localStorage.removeItem(key));
}
