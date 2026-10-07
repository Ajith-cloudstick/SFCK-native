import { http } from "@/common/services/httpClient";

import type { LoginInput, SessionResponse } from "../types/auth";

export function login(input: LoginInput, deviceId: string) {
	return http.post<SessionResponse>("/auth/login", { username: input.username, password: input.password, portal: "estate", device_id: deviceId }, { auth: false });
}

export function refreshSession(refreshToken: string, deviceId: string) {
	return http.post<SessionResponse>("/auth/refresh", { refresh_token: refreshToken, device_id: deviceId }, { auth: false });
}

export function logout(userId: number, refreshToken: string) {
	return http.post<null>(`/users/${userId}/auth/logout`, { refresh_token: refreshToken });
}
