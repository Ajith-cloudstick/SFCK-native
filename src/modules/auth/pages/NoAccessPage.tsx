import { Redirect } from "expo-router";
import { StyleSheet, View } from "react-native";

import { AppHeader } from "@/common/components/layout/AppHeader";
import { Screen } from "@/common/components/layout/Screen";
import { Button } from "@/common/components/ui/Button";
import { EmptyState } from "@/common/components/ui/EmptyState";
import { useT } from "@/common/i18n";
import { spacing } from "@/common/theme/tokens";

import { useSignOut } from "../hooks/useSignOut";
import { useAuthStore } from "../store/authStore";

export default function NoAccessPage() {
	const t = useT();
	const session = useAuthStore((s) => s.session);
	const signOut = useSignOut();

	if (!session) return <Redirect href="/login" />;

	return (
		<Screen header={<AppHeader title={t("appName")} subtitle={`${session.user.name} · ${session.user.role.name}`} />}>
			<View style={styles.body}>
				<EmptyState
					icon="lock"
					title={t("noAccess.title")}
					body={t("noAccess.body", { role: session.user.role.name })}
					action={<Button label={t("account.signOut")} icon="log-out" onPress={() => void signOut()} style={styles.action} />}
				/>
			</View>
		</Screen>
	);
}

const styles = StyleSheet.create({
	body: { flex: 1, justifyContent: "center", padding: spacing.lg },
	action: { marginTop: spacing.md },
});
