export type ScopeLevel = "all" | "group" | "estate" | "division" | "cc";

export type ScopeEstate = {
	id: number;
	name: string;
	code: string | null;
};

export type ScopeDivision = {
	id: number;
	estate_id: number;
	name: string;
};

export type ScopeCentre = {
	id: number;
	estate_id: number;
	division_id: number;
	name: string;
	code: string | null;
};

export type SessionScope = {
	level: ScopeLevel;
	estates: ScopeEstate[];
	divisions: ScopeDivision[];
	ccs: ScopeCentre[];
};

export type SessionUser = {
	id: number;
	username: string;
	name: string;
	role: { name: string; access_level: string };
};

export type SessionResponse = {
	user: SessionUser;
	scope: SessionScope;
	permissions: Record<string, Record<string, boolean>>;
	token: string;
	expires_at: string;
	refresh_token?: string | null;
	estate_id: number | null;
};

// refreshToken is only kept for "Keep me signed in"
export type SessionTokens = {
	token: string;
	expiresAt: string;
	refreshToken: string | null;
};

export type SessionProfile = {
	user: SessionUser;
	scope: SessionScope;
	permissions: string[];
	estateId: number | null;
	remember: boolean;
};

export type Session = SessionProfile & SessionTokens;

export type LoginInput = {
	username: string;
	password: string;
	remember: boolean;
};

export type RefreshResult = "ok" | "rejected" | "unreachable";
