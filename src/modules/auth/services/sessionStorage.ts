import { randomUUID } from "expo-crypto";
import * as SecureStore from "expo-secure-store";

import type { Session, SessionProfile, SessionTokens } from "../types/auth";

const TOKENS_KEY = "sfck.tokens";
const PROFILE_KEY = "sfck.profile";
const CENTRE_KEY = "sfck.centre";
const DEVICE_KEY = "sfck.device";

async function readJson<T>(key: string): Promise<T | null> {
	const raw = await SecureStore.getItemAsync(key).catch(() => null);
	if (!raw) return null;
	try {
		return JSON.parse(raw) as T;
	} catch {
		return null;
	}
}

export async function loadSession(): Promise<{ session: Session | null; centreId: number | null }> {
	const [tokens, profile, centre] = await Promise.all([
		readJson<SessionTokens>(TOKENS_KEY),
		readJson<SessionProfile>(PROFILE_KEY),
		SecureStore.getItemAsync(CENTRE_KEY).catch(() => null),
	]);
	const session = tokens && profile ? { ...profile, ...tokens } : null;
	const centreId = centre ? Number(centre) : null;
	return { session, centreId: centreId && Number.isFinite(centreId) ? centreId : null };
}

export async function saveSession(session: Session): Promise<void> {
	const { token, expiresAt, refreshToken, ...profile } = session;
	await Promise.all([
		SecureStore.setItemAsync(TOKENS_KEY, JSON.stringify({ token, expiresAt, refreshToken })),
		SecureStore.setItemAsync(PROFILE_KEY, JSON.stringify(profile)),
	]);
}

export async function saveCentre(centreId: number | null): Promise<void> {
	if (centreId === null) await SecureStore.deleteItemAsync(CENTRE_KEY);
	else await SecureStore.setItemAsync(CENTRE_KEY, String(centreId));
}

export async function clearSessionStorage(): Promise<void> {
	await Promise.all([TOKENS_KEY, PROFILE_KEY, CENTRE_KEY].map((key) => SecureStore.deleteItemAsync(key).catch(() => undefined)));
}

export async function clearTokens(): Promise<void> {
	await SecureStore.deleteItemAsync(TOKENS_KEY).catch(() => undefined);
}

export async function getDeviceId(): Promise<string> {
	const existing = await SecureStore.getItemAsync(DEVICE_KEY).catch(() => null);
	if (existing) return existing;
	const created = randomUUID();
	await SecureStore.setItemAsync(DEVICE_KEY, created).catch(() => undefined);
	return created;
}
