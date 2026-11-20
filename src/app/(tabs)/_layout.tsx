import { Redirect } from "expo-router";
import { Tabs } from "expo-router/js-tabs";

import { TabBar } from "@/common/components/layout/TabBar";
import { colors } from "@/common/theme/tokens";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { useCentreSync } from "@/modules/centre/hooks/useCentreSync";

export default function TabsLayout() {
	const userId = useAuthStore((s) => s.session?.user.id ?? null);
	const centreId = useAuthStore((s) => s.centreId);
	useCentreSync(userId, centreId);

	if (!userId) return <Redirect href="/login" />;
	if (!centreId) return <Redirect href="/" />;

	return (
		<Tabs screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.canvas } }} tabBar={(props) => <TabBar {...props} />}>
			<Tabs.Screen name="today" />
			<Tabs.Screen name="attendance" />
			<Tabs.Screen name="blocks" />
			<Tabs.Screen name="collection" />
		</Tabs>
	);
}
