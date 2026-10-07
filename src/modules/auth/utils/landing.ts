import { hasPermission, MOBILE_PERMISSION } from "../store/authStore";
import type { Session } from "../types/auth";

export type Landing = "/login" | "/no-access" | "/today" | "/choose-centre";

// Decides where a signed-in user lands based on their scope and permissions
export function landingFor(session: Session | null, centreId: number | null): { href: Landing; autoCentre: number | null } {
	if (!session) return { href: "/login", autoCentre: null };
	if (!hasPermission(session, MOBILE_PERMISSION)) return { href: "/no-access", autoCentre: null };
	const ccs = session.scope.ccs;
	if (centreId && ccs.some((c) => c.id === centreId)) return { href: "/today", autoCentre: null };
	const only = ccs[0];
	if (session.scope.level === "cc" && only) return { href: "/today", autoCentre: only.id };
	return { href: "/choose-centre", autoCentre: null };
}
