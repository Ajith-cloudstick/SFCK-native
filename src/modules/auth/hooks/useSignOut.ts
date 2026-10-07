import { useRouter } from "expo-router";
import { useCallback } from "react";
import { Alert } from "react-native";

import { useT } from "@/common/i18n";
import { clearSyncData, syncNow } from "@/common/sync/syncEngine";
import { useSyncStore } from "@/common/sync/syncStore";
import { useCentreDayStore } from "@/modules/centre/store/centreDayStore";

import { useAuthStore } from "../store/authStore";

// Tries a last sync, warns if anything is still unsent, then wipes tokens, cache and outbox
export function useSignOut() {
	const t = useT();
	const router = useRouter();

	const finish = useCallback(async () => {
		await useAuthStore.getState().signOut();
		await clearSyncData().catch(() => undefined);
		useCentreDayStore.getState().reset();
		router.replace("/login");
	}, [router]);

	return useCallback(async () => {
		if (useSyncStore.getState().items.length > 0) await syncNow().catch(() => undefined);
		const unsent = useSyncStore.getState().items.length;
		if (unsent === 0) {
			Alert.alert(t("account.signOutTitle"), t("account.signOutBody"), [
				{ text: t("common.cancel"), style: "cancel" },
				{ text: t("account.signOut"), style: "destructive", onPress: () => void finish() },
			]);
			return;
		}
		Alert.alert(t("account.unsentTitle"), t("account.unsentBody", { count: unsent }), [
			{ text: t("common.cancel"), style: "cancel" },
			{ text: t("account.signOutAnyway"), style: "destructive", onPress: () => void finish() },
		]);
	}, [finish, t]);
}
