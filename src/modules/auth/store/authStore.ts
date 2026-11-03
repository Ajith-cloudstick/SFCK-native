import { create } from "zustand";

import { showToast } from "@/common/hooks/useToast";
import { hydrateLanguage, t } from "@/common/i18n";
import { ApiError, configureHttpAuth } from "@/common/services/httpClient";

import { login, logout, refreshSession } from "../services/authService";
import { clearSessionStorage, clearTokens, getDeviceId, loadSession, saveCentre, saveSession } from "../services/sessionStorage";
import type { LoginInput, RefreshResult, Session, SessionResponse, SessionScope } from "../types/auth";

export const MOBILE_PERMISSION = "can_sync_mobile_device";

// renew a little before the token runs out so the first screen never fails
const EXPIRY_SKEW_MS = 60000;

type AuthState = {
	hydrated: boolean;
	session: Session | null;
	centreId: number | null;
	hydrate: () => Promise<void>;
	signIn: (input: LoginInput) => Promise<Session>;
	signOut: () => Promise<void>;
	expire: () => void;
	refresh: () => Promise<RefreshResult>;
	selectCentre: (centreId: number | null) => void;
};

function flattenPermissions(map: SessionResponse["permissions"]): string[] {
	return Object.values(map ?? {}).flatMap((module) => Object.entries(module ?? {}).filter(([, granted]) => granted).map(([key]) => key));
}

// Keeps only the fields the app reads so the profile stays small in SecureStore
function trimScope(scope: SessionScope): SessionScope {
	return {
		level: scope.level,
		estates: (scope.estates ?? []).map(({ id, name, code }) => ({ id, name, code })),
		divisions: (scope.divisions ?? []).map(({ id, estate_id, name }) => ({ id, estate_id, name })),
		ccs: (scope.ccs ?? []).map(({ id, estate_id, division_id, name, code }) => ({ id, estate_id, division_id, name, code })),
	};
}

function toSession(data: SessionResponse, remember: boolean): Session {
	const { id, username, name, role } = data.user;
	return {
		user: { id, username, name, role: { name: role?.name ?? "", access_level: role?.access_level ?? "" } },
		scope: trimScope(data.scope),
		permissions: flattenPermissions(data.permissions),
		estateId: data.estate_id ?? null,
		remember,
		token: data.token,
		expiresAt: data.expires_at,
		refreshToken: remember ? data.refresh_token ?? null : null,
	};
}

function expiresSoon(session: Session): boolean {
	const at = Date.parse(session.expiresAt);
	return !Number.isFinite(at) || at - EXPIRY_SKEW_MS < Date.now();
}

export const useAuthStore = create<AuthState>((set, get) => ({
	hydrated: false,
	session: null,
	centreId: null,
	// Without "Keep me signed in" a fresh app start asks to sign in again.
	// With it, an expired token is renewed before the first screen; when offline the stored session is kept.
	hydrate: async () => {
		if (get().hydrated) return;
		const [{ session, centreId }] = await Promise.all([loadSession(), hydrateLanguage()]);
		if (session && !session.remember) {
			await clearTokens();
			set({ session: null, centreId, hydrated: true });
			return;
		}
		set({ session, centreId });
		if (session && expiresSoon(session) && (await get().refresh()) === "rejected") {
			await clearTokens();
			set({ session: null });
		}
		set({ hydrated: true });
	},
	signIn: async (input) => {
		const { data } = await login(input, await getDeviceId());
		const session = toSession(data, input.remember);
		await saveSession(session);
		const keep = get().centreId;
		const centreId = keep && session.scope.ccs.some((c) => c.id === keep) ? keep : null;
		if (centreId === null) await saveCentre(null);
		set({ session, centreId });
		return session;
	},
	signOut: async () => {
		const session = get().session;
		if (session?.refreshToken) logout(session.refreshToken).catch(() => undefined);
		await clearSessionStorage();
		set({ session: null, centreId: null });
	},
	expire: () => {
		if (!get().session) return;
		clearTokens().catch(() => undefined);
		set({ session: null });
		showToast(t("errors.sessionExpired"), "danger");
	},
	// a network error or server fault keeps the session; only a refused token ends it
	refresh: async () => {
		const session = get().session;
		if (!session?.refreshToken) return "rejected";
		const sent = session.refreshToken;
		try {
			const { data } = await refreshSession(sent, await getDeviceId(), session.estateId);
			const now = get().session;
			if (!data.refresh_token || now?.refreshToken !== sent || data.user.id !== session.user.id) return "rejected";
			const next = toSession({ ...data, estate_id: data.estate_id ?? session.estateId }, true);
			await saveSession(next);
			set({ session: next });
			return "ok";
		} catch (error) {
			if (error instanceof ApiError && (error.isOffline || error.status >= 500)) return "unreachable";
			return "rejected";
		}
	},
	selectCentre: (centreId) => {
		set({ centreId });
		saveCentre(centreId).catch(() => undefined);
	},
}));

export function hasPermission(session: Session | null, key: string): boolean {
	return !!session?.permissions.includes(key);
}

configureHttpAuth({
	getToken: () => useAuthStore.getState().session?.token ?? null,
	refresh: () => useAuthStore.getState().refresh(),
	onExpired: () => useAuthStore.getState().expire(),
});
