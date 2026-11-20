import { Stack } from "expo-router";
import { useEffect } from "react";

import { AppProviders } from "@/common/components/layout/AppProviders";
import { colors } from "@/common/theme/tokens";
import { useAuthStore } from "@/modules/auth/store/authStore";

export default function RootLayout() {
	const hydrated = useAuthStore((s) => s.hydrated);

	useEffect(() => {
		useAuthStore.getState().hydrate().catch(() => useAuthStore.setState({ hydrated: true }));
	}, []);

	return (
		<AppProviders ready={hydrated}>
			<Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.canvas } }}>
				<Stack.Screen name="index" />
				<Stack.Screen name="login" options={{ animation: "fade" }} />
				<Stack.Screen name="choose-centre" />
				<Stack.Screen name="no-access" />
				<Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
				<Stack.Screen name="stock" />
				<Stack.Screen name="worker-requests" />
				<Stack.Screen name="wages" />
				<Stack.Screen name="scan" options={{ animation: "slide_from_bottom", contentStyle: { backgroundColor: colors.camera } }} />
			</Stack>
		</AppProviders>
	);
}
