import Constants from "expo-constants";
import { t } from "@/common/i18n";
import { duration } from "@/common/theme/tokens";

function resolveOrigin(): string {
	const configured = (process.env.EXPO_PUBLIC_API_URL ?? "").trim().replace(/\/+$/, "");
	if (configured) return configured;
	const host = (Constants.expoConfig?.hostUri ?? "").split("/")[0];
	if (!__DEV__ || !host) return "";
	const secure = host.includes(".exp.direct") || host.includes("ngrok");
	return secure ? `https://${host.split(":")[0]}` : `http://${host}`;
}

const ORIGIN = resolveOrigin();
const BASE_URL = `${ORIGIN}/api/v1`;
const HAS_BASE_URL = ORIGIN !== "";

export type ApiErrorKind = "http" | "network" | "timeout" | "config";

export class ApiError extends Error {
	status: number;
	kind: ApiErrorKind;
	fields: Record<string, string>;

	constructor(message: string, status = 0, kind: ApiErrorKind = "http", fields: Record<string, string> = {}) {
		super(message);
		this.status = status;
		this.kind = kind;
		this.fields = fields;
	}

	get isOffline(): boolean {
		return this.kind === "network" || this.kind === "timeout" || this.kind === "config";
	}
}

export type ApiResult<T> = {
	data: T;
	message?: string;
};

type Envelope<T> = {
	success: boolean;
	data?: T;
	message?: string;
	error?: string;
	errors?: Record<string, string>;
};

type AuthHooks = {
	getToken: () => string | null;
	refresh: () => Promise<boolean>;
	onExpired: () => void;
};

type RequestOptions = {
	method?: "GET" | "POST" | "PATCH" | "DELETE";
	body?: unknown;
	query?: Record<string, string | number | undefined>;
	auth?: boolean;
};

let authHooks: AuthHooks | null = null;
let refreshing: Promise<boolean> | null = null;

export function configureHttpAuth(hooks: AuthHooks) {
	authHooks = hooks;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
	const params = Object.entries(query ?? {})
		.filter((entry): entry is [string, string | number] => entry[1] !== undefined)
		.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
		.join("&");
	return `${BASE_URL}${path}${params ? `?${params}` : ""}`;
}

async function send<T>(path: string, options: RequestOptions): Promise<{ status: number; body: Envelope<T> | null }> {
	if (!HAS_BASE_URL) {
		if (__DEV__) console.warn("No API address: start the app with npx expo start, or set EXPO_PUBLIC_API_URL for release builds");
		throw new ApiError(t("errors.unreachable"), 0, "config");
	}
	const headers: Record<string, string> = { Accept: "application/json", "ngrok-skip-browser-warning": "true" };
	if (options.body !== undefined) headers["Content-Type"] = "application/json";
	const token = options.auth === false ? null : authHooks?.getToken();
	if (token) headers.Authorization = `Bearer ${token}`;

	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), duration.requestTimeout);
	try {
		const response = await fetch(buildUrl(path, options.query), {
			method: options.method ?? "GET",
			headers,
			body: options.body === undefined ? undefined : JSON.stringify(options.body),
			signal: controller.signal,
		});
		const body = (await response.json().catch(() => null)) as Envelope<T> | null;
		return { status: response.status, body };
	} catch {
		if (controller.signal.aborted) throw new ApiError(t("errors.timeout"), 0, "timeout");
		throw new ApiError(t("errors.network"), 0, "network");
	} finally {
		clearTimeout(timer);
	}
}

function refreshOnce(): Promise<boolean> {
	if (!authHooks) return Promise.resolve(false);
	if (!refreshing) {
		refreshing = authHooks.refresh().finally(() => {
			refreshing = null;
		});
	}
	return refreshing;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
	let result = await send<T>(path, options);
	if (result.status === 401 && options.auth !== false && authHooks) {
		const renewed = await refreshOnce();
		if (!renewed) {
			authHooks.onExpired();
			throw new ApiError(t("errors.sessionExpired"), 401);
		}
		result = await send<T>(path, options);
		if (result.status === 401) {
			authHooks.onExpired();
			throw new ApiError(t("errors.sessionExpired"), 401);
		}
	}
	const { status, body } = result;
	if (status >= 200 && status < 300 && body?.success) return { data: body.data as T, message: body.message };
	const readable = status < 500 && typeof body?.error === "string" && body.error.length > 0;
	throw new ApiError(readable ? (body?.error as string) : t("errors.server"), status, "http", readable ? body?.errors ?? {} : {});
}

export function userMessage(error: unknown): string {
	if (error instanceof ApiError) return error.message;
	if (__DEV__) console.warn(error);
	return t("errors.generic");
}

export const http = {
	get: <T>(path: string, query?: RequestOptions["query"]) => request<T>(path, { query }),
	post: <T>(path: string, body: unknown, options: Omit<RequestOptions, "method" | "body"> = {}) => request<T>(path, { ...options, method: "POST", body }),
};
