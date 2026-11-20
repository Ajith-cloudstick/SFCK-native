import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";

const DATABASE_NAME = "sfck-field.db";

const SCHEMA = `
PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS cache (
	key TEXT PRIMARY KEY,
	value TEXT NOT NULL,
	updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS outbox (
	client_uuid TEXT PRIMARY KEY,
	type TEXT NOT NULL,
	payload TEXT NOT NULL,
	created_at TEXT NOT NULL,
	status TEXT NOT NULL DEFAULT 'pending',
	error TEXT,
	attempts INTEGER NOT NULL DEFAULT 0
);
`;

let database: Promise<SQLiteDatabase> | null = null;

async function open(): Promise<SQLiteDatabase> {
	const db = await openDatabaseAsync(DATABASE_NAME);
	await db.execAsync(SCHEMA);
	return db;
}

export function getDatabase(): Promise<SQLiteDatabase> {
	if (!database) {
		database = open().catch((error: unknown) => {
			database = null;
			throw error;
		});
	}
	return database;
}
