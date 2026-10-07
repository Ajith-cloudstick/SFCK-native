import { useState } from "react";
import { Pressable, StyleSheet } from "react-native";

import { AppHeader } from "@/common/components/layout/AppHeader";
import { SyncPill } from "@/common/components/layout/SyncPill";
import { Avatar } from "@/common/components/ui/Avatar";
import { useLanguageStore, useT } from "@/common/i18n";
import { opacity, sizes } from "@/common/theme/tokens";
import { formatDayDate, initialsOf } from "@/common/utils/format";
import { istDate } from "@/common/utils/ist";
import { AccountSheet, type AccountView } from "@/modules/auth/components/AccountSheet";
import { useAuthStore } from "@/modules/auth/store/authStore";

import { useCentreDayStore } from "../store/centreDayStore";

export function CentreHeader() {
	const t = useT();
	const language = useLanguageStore((s) => s.language);
	const session = useAuthStore((s) => s.session);
	const centreId = useAuthStore((s) => s.centreId);
	const day = useCentreDayStore((s) => s.serverDay);
	const [view, setView] = useState<AccountView | null>(null);
	const scopeCentre = session?.scope.ccs.find((c) => c.id === centreId);
	const title = day?.centre.name ?? scopeCentre?.name ?? t("appName");
	const place = day?.division?.name ?? day?.estate?.name;
	const date = formatDayDate(day?.date ?? istDate(), language);

	return (
		<>
			<AppHeader
				title={title}
				subtitle={place ? `${date} · ${place}` : date}
				right={
					<>
						<SyncPill onPress={() => setView("sync")} />
						<Pressable
							onPress={() => setView("account")}
							accessibilityRole="button"
							accessibilityLabel={t("account.title")}
							style={({ pressed }) => [styles.avatar, pressed ? styles.pressed : null]}
						>
							<Avatar initials={initialsOf(session?.user.name ?? "")} small />
						</Pressable>
					</>
				}
			/>
			<AccountSheet visible={view !== null} view={view ?? "account"} onChangeView={setView} onClose={() => setView(null)} />
		</>
	);
}

const styles = StyleSheet.create({
	avatar: { width: sizes.touch, height: sizes.touch, alignItems: "center", justifyContent: "center" },
	pressed: { opacity: opacity.pressed },
});
