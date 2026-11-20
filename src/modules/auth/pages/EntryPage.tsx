import { Redirect } from "expo-router";
import { useEffect } from "react";

import { useAuthStore } from "../store/authStore";
import { landingFor } from "../utils/landing";

export default function EntryPage() {
	const session = useAuthStore((s) => s.session);
	const centreId = useAuthStore((s) => s.centreId);
	const selectCentre = useAuthStore((s) => s.selectCentre);
	const { href, autoCentre } = landingFor(session, centreId);

	useEffect(() => {
		if (autoCentre) selectCentre(autoCentre);
	}, [autoCentre, selectCentre]);

	if (autoCentre && centreId !== autoCentre) return null;
	return <Redirect href={href} />;
}
