import { http } from "@/common/services/httpClient";

import type { LoginInput, SessionResponse } from "../types/auth";

export function login(input: LoginInput, deviceId: string) {
	return http.post<SessionResponse>(
		"/auth/login",
		{ username: input.username, password: input.password, portal: "estate", device_id: deviceId, remember: input.remember },
		{ auth: false },
	);
}

export function refreshSession(refreshToken: string, deviceId: string, estateId: number | null) {
	return http.post<SessionResponse>("/auth/refresh", { refresh_token: refreshToken, device_id: deviceId, estate_id: estateId ?? undefined }, { auth: false });
}

// works without an access token, so signing out still ends the session after the token has expired
export function logout(refreshToken: string) {
	return http.post<null>("/auth/logout", { refresh_token: refreshToken }, { auth: false });
}
