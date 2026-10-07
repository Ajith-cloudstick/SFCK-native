import { useMemo } from "react";
import { create } from "zustand";

import { demoCollectionCentres, demoEstates } from "../demo/demo-estates";
import type { CollectionCentre, Estate } from "../types/session";

type SessionState = {
	estates: Estate[];
	centres: CollectionCentre[];
	estateId: string | null;
	centreId: string | null;
	select: (estateId: string, centreId: string) => void;
	clear: () => void;
};

export const useSessionStore = create<SessionState>((set) => ({
	estates: demoEstates,
	centres: demoCollectionCentres,
	estateId: null,
	centreId: null,
	select: (estateId, centreId) => set({ estateId, centreId }),
	clear: () => set({ estateId: null, centreId: null }),
}));

export function useSession(): { estate: Estate | null; centre: CollectionCentre | null } {
	const estates = useSessionStore((s) => s.estates);
	const centres = useSessionStore((s) => s.centres);
	const estateId = useSessionStore((s) => s.estateId);
	const centreId = useSessionStore((s) => s.centreId);
	return useMemo(
		() => ({
			estate: estates.find((e) => e.id === estateId) ?? null,
			centre: centres.find((c) => c.id === centreId) ?? null,
		}),
		[estates, centres, estateId, centreId],
	);
}
