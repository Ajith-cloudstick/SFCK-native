import { create } from "zustand";

import { showToast } from "@/common/hooks/useToast";
import { hydrateLanguage, t } from "@/common/i18n";
import { ApiError, configureHttpAuth } from "@/common/services/httpClient";

import { login, logout, refreshSession } from "../services/authService";
import { clearSessionStorage, clearTokens, getDeviceId, loadSession, saveCentre, saveSession } from "../services/sessionStorage";
import type { LoginInput, Session, SessionResponse, SessionScope } from "../types/auth";

export const MOBILE_PERMISSION = "can_sync_mobile_device";

type AuthState = {
	hydrated: boolean;
	session: Session | null;
	centreId: number | null;
	hydrate: () => Promise<void>;
	signIn: (input: LoginInput) => Promise<Session>;
	signOut: () => Promise<void>;
	expire: () => void;
	refresh: () => Promise<boolean>;
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

function toSession(data: SessionResponse): Session {
	const { id, username, name, role } = data.user;
	return {
		user: { id, username, name, role: { name: role?.name ?? "", access_level: role?.access_level ?? "" } },
		scope: trimScope(data.scope),
		permissions: flattenPermissions(data.permissions),
		estateId: data.estate_id ?? null,
		token: data.token,
		expiresAt: data.expires_at,
		refreshToken: data.refresh_token,
	};
}

export const useAuthStore = create<AuthState>((set, get) => ({
	hydrated: false,
	session: null,
	centreId: null,
	hydrate: async () => {
		if (get().hydrated) return;
		const [{ session, centreId }] = await Promise.all([loadSession(), hydrateLanguage()]);
		set({ session, centreId, hydrated: true });
	},
	signIn: async (input) => {
		const { data } = await login(input, await getDeviceId());
		const session = toSession(data);
		await saveSession(session);
		const keep = get().centreId;
		const centreId = keep && session.scope.ccs.some((c) => c.id === keep) ? keep : null;
		if (centreId === null) await saveCentre(null);
		set({ session, centreId });
		return session;
	},
	signOut: async () => {
		const session = get().session;
		if (session) logout(session.user.id, session.refreshToken).catch(() => undefined);
		await clearSessionStorage();
		set({ session: null, centreId: null });
	},
	expire: () => {
		if (!get().session) return;
		clearTokens().catch(() => undefined);
		set({ session: null });
		showToast(t("errors.sessionExpired"), "danger");
	},
	refresh: async () => {
		const session = get().session;
		if (!session) return false;
		try {
			const { data } = await refreshSession(session.refreshToken, await getDeviceId());
			const next = toSession(data);
			await saveSession(next);
			set({ session: next });
			return true;
		} catch (error) {
			if (error instanceof ApiError && error.isOffline) throw error;
			return false;
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
