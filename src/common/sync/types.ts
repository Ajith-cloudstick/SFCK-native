export type OutboxType = "attendance" | "assignment" | "collection" | "chemical_usage" | "requisition" | "requisition_receive" | "worker_request" | "worker_request_cancel";

export type OutboxStatus = "pending" | "failed";

export type SyncValue = string | number | boolean | null | SyncValue[] | { [key: string]: SyncValue };

// Flat for day work; a material request carries its item lines as a list
export type SyncPayload = { [key: string]: SyncValue };

export type OutboxItem = {
	clientUuid: string;
	type: OutboxType;
	payload: SyncPayload;
	createdAt: string;
	status: OutboxStatus;
	error: string | null;
	attempts: number;
};

export type PushResult = {
	client_uuid: string;
	type: OutboxType;
	ok: boolean;
	id?: number;
	error?: string;
	final?: boolean;
};

export type PushResponse = {
	results: PushResult[];
	server_time: string;
};

export type PushedItem = {
	item: OutboxItem;
	id: number;
};

export type SyncHooks = {
	getUserId: () => number | null;
	pull: () => Promise<void>;
	onPushed: (pushed: PushedItem[]) => Promise<void> | void;
};

export type SyncState = "synced" | "pending" | "offline" | "error";
